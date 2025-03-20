// server/src/services/syllabusProcessor/calendarUtils.ts
import { createEvents } from 'ics';
import { RRule } from 'rrule';

// Day mapping for recurring events
const dayMapping: { [key: string]: { jsDay: number; rrule: any } } = {
  monday: { jsDay: 1, rrule: RRule.MO },
  tuesday: { jsDay: 2, rrule: RRule.TU },
  wednesday: { jsDay: 3, rrule: RRule.WE },
  thursday: { jsDay: 4, rrule: RRule.TH },
  friday: { jsDay: 5, rrule: RRule.FR },
  saturday: { jsDay: 6, rrule: RRule.SA },
  sunday: { jsDay: 0, rrule: RRule.SU },
};

/**
 * Parses a local date string into an array format for ICS
 * @param dateStr Date string in YYYY-MM-DD HH:MM format
 * @returns Array format required by ICS library [year, month, day, hour, minute]
 */
export function parseLocalDate(dateStr: string): number[] | null {
  if (!dateStr || !dateStr.trim()) return null;
  try {
    const [datePart, timePart = "00:00"] = dateStr.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    if (!year || !month || !day) {
      console.error(`Invalid date format: ${dateStr}`);
      return null;
    }
    return [year, month, day, hour || 0, minute || 0];
  } catch (err) {
    console.error(`Error parsing date: ${dateStr}`, err);
    return null;
  }
}

/**
 * Expands a recurring event into multiple individual events
 * @param event Event object with recurrence information
 * @returns Array of expanded events in ICS format
 */
export function expandRecurringEvent(event: any): any[] {
  // If not a recurring event, just return as single event
  if (!event.recurrence) {
    return [
      {
        title: event.event_title || "Untitled Event",
        start: parseLocalDate(event.start_date),
        end: parseLocalDate(event.end_date) || parseLocalDate(event.start_date),
        location: event.location || "",
        description: event.description || "",
      },
    ];
  }

  const baseStartArr = parseLocalDate(event.start_date);
  const baseEndArr = parseLocalDate(event.end_date) || baseStartArr;
  if (!baseStartArr || !baseEndArr) {
    console.warn(`Invalid start/end date for event: ${event.event_title}`);
    return [];
  }

  // Convert to JS Date objects (these are effectively "floating" times, with no tz)
  const dtstartBase = new Date(
    baseStartArr[0], 
    baseStartArr[1] - 1, 
    baseStartArr[2], 
    baseStartArr[3], 
    baseStartArr[4]
  );
  
  const dtendBase = new Date(
    baseEndArr[0], 
    baseEndArr[1] - 1, 
    baseEndArr[2], 
    baseEndArr[3], 
    baseEndArr[4]
  );
  
  // Calculate event duration
  const baseDurationMs = dtendBase.getTime() - dtstartBase.getTime();
  const baseDurationMinutes = baseDurationMs / (1000 * 60);

  // Let events repeat for 3 months from the start date
  const untilDate = new Date(dtstartBase);
  untilDate.setMonth(untilDate.getMonth() + 3);

  // Process recurrence string (e.g., "Every Monday 14:35-15:55, Wednesday 14:35-15:55")
  const recurrenceParts = event.recurrence.replace(/^Every\s+/i, "").split(",");
  const expandedEvents: any[] = [];

  recurrenceParts.forEach((part: string) => {
    // Extract day of week from recurrence part
    const trimmed = part.trim();
    const [dayStr] = trimmed.split(" ");
    if (!dayStr) return;

    // Map day name to JS day number and RRule constant
    const mapping = dayMapping[dayStr.toLowerCase()];
    if (!mapping) return;
    const jsDay = mapping.jsDay;
    const weekday = mapping.rrule;

    // Adjust dtstartBase to the correct weekday for the first occurrence
    const firstOcc = new Date(dtstartBase);
    while (firstOcc.getDay() !== jsDay) {
      firstOcc.setDate(firstOcc.getDate() + 1);
    }
    // Keep the same hours/minutes from dtstartBase
    firstOcc.setHours(dtstartBase.getHours(), dtstartBase.getMinutes(), 0, 0);

    // Create RRule for weekly recurrence
    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: firstOcc,
      byweekday: weekday,
      until: untilDate,
    });

    // Generate all occurrences and create event objects
    rule.all().forEach((occ) => {
      const occEnd = new Date(occ.getTime() + baseDurationMinutes * 60 * 1000);

      expandedEvents.push({
        title: event.event_title || "Untitled Event",
        start: [
          occ.getFullYear(),
          occ.getMonth() + 1,
          occ.getDate(),
          occ.getHours(),
          occ.getMinutes(),
        ],
        end: [
          occEnd.getFullYear(),
          occEnd.getMonth() + 1,
          occEnd.getDate(),
          occEnd.getHours(),
          occEnd.getMinutes(),
        ],
        location: event.location || "",
        description: event.description || "",
      });
    });
  });

  return expandedEvents;
}

/**
 * Generates ICS calendar content from event objects
 * @param events Array of event objects
 * @returns ICS calendar content as string
 */
export async function generateIcsContent(events: any[]): Promise<string | null> {
  if (!events || !Array.isArray(events) || events.length === 0) return null;

  try {
    // Expand recurring events into individual events
    let allEvents: any[] = [];
    for (const event of events) {
      const expanded = expandRecurringEvent(event);
      allEvents = allEvents.concat(expanded);
    }

    const validEvents = allEvents.filter((e) => e.start);
    if (validEvents.length === 0) {
      console.warn("No valid events found for ICS generation");
      return null;
    }

    // Generate ICS content
    const { error, value } = createEvents(validEvents);
    if (error) throw new Error(`ICS generation error: ${error}`);

    // Insert a VTIMEZONE block for Eastern Time
    const vtimezoneBlock = [
      "BEGIN:VTIMEZONE",
      "TZID:America/New_York",
      "X-LIC-LOCATION:America/New_York",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:-0400",
      "TZOFFSETTO:-0500",
      "TZNAME:EST",
      "DTSTART:19701101T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
      "END:STANDARD",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:-0500",
      "TZOFFSETTO:-0400",
      "TZNAME:EDT",
      "DTSTART:19700308T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
      "END:DAYLIGHT",
      "END:VTIMEZONE",
    ].join("\n");

    // Insert VTIMEZONE after BEGIN:VCALENDAR
    if (!value) {
      throw new Error("ICS generation returned undefined value");
    }
    let icsContent = value.replace(
      "BEGIN:VCALENDAR",
      `BEGIN:VCALENDAR\n${vtimezoneBlock}`
    );

    // Label each DTSTART/DTEND with TZID=America/New_York
    icsContent = icsContent.replace(
      /(DTSTART|DTEND):(\d{8}T\d{6})/g,
      `$1;TZID=America/New_York:$2`
    );

    return icsContent;
  } catch (error: any) {
    console.error("Error generating ICS content:", error);
    return null;
  }
}



