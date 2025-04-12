import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MapPin, BookOpen, Flag, Tag, Trash2, ClipboardList, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarInput } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

interface CalendarEvent {
  date: string;
  title: string;
  type: string;
  location?: string;
  id?: string;
}

interface CalendarProps {
  dates: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'date'> & { date: Date }) => void;
  onDeleteEvent?: (eventId: string) => Promise<void>;
}

export function Calendar({ dates, onAddEvent, onDeleteEvent }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "assessment" as const,
    location: "",
    date: new Date()
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { isDarkMode } = useTheme();

  // Calendar navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim() === '') return;
    
    if (onAddEvent) {
      onAddEvent(newEvent);
    }
    
    // Reset form
    setNewEvent({
      title: '',
      type: 'assessment',
      location: '',
      date: new Date()
    });
    
    setIsAddEventDialogOpen(false);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (!event.id || !onDeleteEvent) return;
    
    setIsDeleting(true);
    try {
      await onDeleteEvent(event.id);
      toast.success('Event deleted successfully');
      // Close the popover after successful deletion
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get calendar data
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Create calendar grid
  const days = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get events for the current month being displayed
  const eventsThisMonth = dates.filter(date => {
    const eventDate = new Date(date.date + 'T12:00:00');
    const displayMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return eventDate >= displayMonth && eventDate <= nextMonth;
  });

  // Create calendar grid
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className={cn(
              isDarkMode 
                ? "bg-[#202020] border-gray-700 hover:bg-[#2a2a2a] hover:border-gray-600" 
                : "bg-white hover:bg-gray-100"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4",
              isDarkMode ? "text-gray-200" : "text-gray-600"
            )} />
          </Button>
          <h2 className={cn(
            "text-xl font-semibold",
            isDarkMode ? "text-gray-200" : "text-gray-900"
          )}>
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className={cn(
              isDarkMode 
                ? "bg-[#202020] border-gray-700 hover:bg-[#2a2a2a] hover:border-gray-600" 
                : "bg-white hover:bg-gray-100"
            )}
          >
            <ChevronRight className={cn(
              "h-4 w-4",
              isDarkMode ? "text-gray-200" : "text-gray-600"
            )} />
          </Button>
        </div>
        <Button onClick={() => setIsAddEventDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date.toISOString().split('T')[0]}
                onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value + 'T12:00:00') })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
              >
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-location">Location (Optional)</Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Popover */}
      <Popover open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{selectedEvent?.title}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedEvent?.date && format(new Date(selectedEvent.date + 'T00:00:00'), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="type">Type</Label>
                <div className="col-span-2 flex items-center gap-2">
                  {selectedEvent?.type === 'assessment' && <ClipboardList className="h-4 w-4" />}
                  {selectedEvent?.type === 'deadline' && <CalendarCheck className="h-4 w-4" />}
                  {selectedEvent?.type === 'class' && <BookOpen className="h-4 w-4" />}
                  <span className="capitalize">{selectedEvent?.type}</span>
                </div>
              </div>
              {selectedEvent?.location && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="location">Location</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteEvent(selectedEvent)}
                disabled={isDeleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Calendar Grid */}
      <div className={cn(
        "border rounded-lg overflow-hidden",
        isDarkMode ? "border-gray-700" : "border-gray-200"
      )}>
        {/* Day names */}
        <div className={cn(
          "grid grid-cols-7 border-b",
          isDarkMode ? "border-gray-700 bg-[#202020]" : "border-gray-200 bg-white"
        )}>
          {dayNames.map(day => (
            <div key={day} className={cn(
              "text-xs font-medium p-2 text-center",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0] : '';
            const events = dates.filter(event => {
              const eventDate = new Date(event.date + 'T12:00:00');
              const dayDate = new Date(dateStr + 'T12:00:00');
              return eventDate.getFullYear() === dayDate.getFullYear() &&
                     eventDate.getMonth() === dayDate.getMonth() &&
                     eventDate.getDate() === dayDate.getDate();
            });
            const isToday = day && new Date().toISOString().split('T')[0] === dateStr;
            
            return (
              <div 
                key={index} 
                className={cn(
                  "min-h-[100px] p-2 border-b border-r",
                  isDarkMode ? "border-gray-700" : "border-gray-200",
                  day ? isDarkMode ? "bg-[#202020]" : "bg-white" : isDarkMode ? "bg-[#191919]" : "bg-gray-50",
                  isToday && (isDarkMode ? "bg-blue-900/20" : "bg-blue-50")
                )}
              >
                {day && (
                  <>
                    <div className={cn(
                      "text-sm mb-1",
                      isToday ? "font-semibold text-blue-500" : isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {events.map((event, eventIndex) => {
                        const eventDate = new Date(event.date + 'T12:00:00');
                        return (
                          <Popover key={eventIndex}>
                            <PopoverTrigger asChild>
                              <div 
                                className={cn(
                                  "text-xs p-1 rounded truncate cursor-pointer hover:opacity-90 transition-opacity",
                                  event.type === 'assessment' 
                                    ? isDarkMode ? "bg-blue-900/50 text-blue-200" : "bg-blue-100 text-blue-700"
                                    : event.type === 'class' 
                                    ? isDarkMode ? "bg-purple-900/50 text-purple-200" : "bg-purple-100 text-purple-700"
                                    : isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
                                )}
                              >
                                {event.title}
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium leading-none">{event.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {format(eventDate, 'MMMM d, yyyy')}
                                  </p>
                                </div>
                                <div className="grid gap-2">
                                  <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="type">Type</Label>
                                    <div className="col-span-2 flex items-center gap-2">
                                      {event.type === 'assessment' && <ClipboardList className="h-4 w-4" />}
                                      {event.type === 'deadline' && <CalendarCheck className="h-4 w-4" />}
                                      {event.type === 'class' && <BookOpen className="h-4 w-4" />}
                                      <span className="capitalize">{event.type}</span>
                                    </div>
                                  </div>
                                  {event.location && (
                                    <div className="grid grid-cols-3 items-center gap-4">
                                      <Label htmlFor="location">Location</Label>
                                      <div className="col-span-2 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-end mt-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteEvent(event)}
                                    disabled={isDeleting}
                                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
