// web/routes/_user.syllabus-result.$id/Tabs/ScheduleTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { filterEmptyEntries, isEmpty } from "../SyllabusHelpers";
import { linkify, toTitleCase } from "@/components/syllabus/SubComponents";

interface ScheduleTabProps {
  classSchedule: any;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ classSchedule }) => {
  if (!classSchedule || isEmpty(classSchedule)) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-3 text-primary text-4xl mb-1">
          <span className="text-5xl">📆</span> <span>Class Schedule</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-6">
          {typeof classSchedule === "string" ? (
            <div className="leading-relaxed text-muted-foreground">
              {linkify(classSchedule)}
            </div>
          ) : (
            filterEmptyEntries(classSchedule).map(([key, value], index) => (
              <div
                key={key}
                className={`flex flex-col sm:flex-row gap-3 p-4 rounded-lg ${
                  index % 2 === 0 ? "bg-muted/30" : "bg-background"
                }`}
              >
                <div className="font-bold text-black min-w-32">
                  {toTitleCase(key)}:
                </div>
                <div>
                  {typeof value === "string" ? linkify(value) : String(value)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleTab;
