// web/routes/_user.syllabus-result.$id/Tabs/PoliciesTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { filterEmptyEntries, isEmpty } from "../SyllabusHelpers";
import { TimelineItem, extractDateFromText } from "@/components/syllabus/SubComponents";
import { toTitleCase, linkify } from "@/components/syllabus/SubComponents";

interface PoliciesTabProps {
  policies?: any;
  importantDeadlines?: any[];
}

const PoliciesTab: React.FC<PoliciesTabProps> = ({
  policies,
  importantDeadlines,
}) => {
  if (!policies && (!importantDeadlines || importantDeadlines.length === 0)) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-3 text-primary text-4xl mb-1">
          <span className="text-5xl">⚠️</span> Policies & Warnings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-8">
          {importantDeadlines && importantDeadlines.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-foreground">
                Important Dates
              </h3>
              <div className="pl-2">
                {importantDeadlines.map((deadline: any, index: number) => {
                  // same logic as your code
                  // ...
                  // Fallback:
                  const title =
                    deadline.title ||
                    deadline.name ||
                    deadline.event ||
                    "Important Deadline";
                  let date = deadline.date || deadline.deadline || "Date TBD";
                  let isApproximate = false;
                  if (date === "Date TBD" || date === "") {
                    for (const field of ["description", "title", "name", "event", "details"]) {
                      if (deadline[field] && typeof deadline[field] === "string") {
                        const extracted = extractDateFromText(deadline[field]);
                        if (extracted && typeof extracted === "object" && "date" in extracted) {
                          date = extracted.date;
                          isApproximate = extracted.isApproximate;
                          break;
                        }
                      }
                    }
                  }
                  const description = deadline.description || null;

                  return (
                    <TimelineItem
                      key={index}
                      date={date}
                      title={title}
                      description={description}
                      isApproximate={isApproximate}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {policies && !isEmpty(policies) && (
            <div>
              <h3 className="text-lg font-medium mb-4 text-foreground">
                Course Policies
              </h3>
              <div className="space-y-4">
                {typeof policies === "string" ? (
                  <div className="p-4 border rounded-md bg-muted/10">
                    <p className="leading-relaxed text-muted-foreground">
                      {linkify(policies)}
                    </p>
                  </div>
                ) : (
                  filterEmptyEntries(policies).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 border rounded-md bg-muted/10"
                    >
                      <h4 className="text-base font-medium mb-2">
                        {toTitleCase(key)}
                      </h4>
                      <p className="leading-relaxed text-muted-foreground">
                        {typeof value === "string"
                          ? linkify(value)
                          : String(value)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliciesTab;
