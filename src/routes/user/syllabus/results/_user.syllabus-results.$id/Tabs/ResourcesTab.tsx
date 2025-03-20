// web/routes/_user.syllabus-result.$id/Tabs/ResourcesTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { filterEmptyEntries, isEmpty } from "../SyllabusHelpers";
import { toTitleCase, linkify } from "@/components/syllabus/SubComponents";

interface ResourcesTabProps {
  textbooks?: any;
  otherDetails?: any;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({
  textbooks,
  otherDetails,
}) => {
  if (isEmpty(textbooks) && isEmpty(otherDetails)) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-3 text-primary text-4xl mb-1">
          <span className="text-5xl">📋</span> Resources & Textbooks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-8">
          {!isEmpty(textbooks) && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-foreground">
                Textbooks
              </h3>
              <div className="space-y-4">
                {typeof textbooks === "string" ? (
                  <div className="p-4 border rounded-md bg-card">
                    <p className="leading-relaxed text-muted-foreground">
                      {linkify(textbooks)}
                    </p>
                  </div>
                ) : Array.isArray(textbooks) ? (
                  textbooks.map((textbook: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md bg-card flex flex-col sm:flex-row gap-3 items-start"
                    >
                      <div className="bg-primary/5 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary/80" />
                      </div>
                      <div>
                        {typeof textbook === "string" ? (
                          <p className="font-medium">{textbook}</p>
                        ) : (
                          <>
                            <p className="font-medium">
                              {textbook.title || `Textbook ${index + 1}`}
                            </p>
                            {textbook.author && (
                              <p className="text-muted-foreground">
                                by {textbook.author}
                              </p>
                            )}
                            {textbook.isbn && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ISBN: {textbook.isbn}
                              </p>
                            )}
                            {textbook.required !== undefined && (
                              <Badge
                                className="mt-2"
                                variant={
                                  textbook.required === true ||
                                  textbook.required === "true" ||
                                  textbook.required === "yes"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {textbook.required === true ||
                                textbook.required === "true" ||
                                textbook.required === "yes"
                                  ? "Required"
                                  : "Optional"}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  filterEmptyEntries(textbooks).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 border rounded-md bg-card"
                    >
                      <h4 className="text-base font-medium mb-2">
                        {toTitleCase(key)}
                      </h4>
                      <p className="leading-relaxed text-muted-foreground">
                        {typeof value === "string" ? linkify(value) : String(value)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!isEmpty(otherDetails) && (
            <div>
              <h3 className="text-lg font-medium mb-4 text-foreground">
                Other Details
              </h3>
              <div className="space-y-4">
                {typeof otherDetails === "string" ? (
                  <div className="p-4 border rounded-md bg-muted/10">
                    <p className="leading-relaxed text-muted-foreground">
                      {linkify(otherDetails)}
                    </p>
                  </div>
                ) : (
                  filterEmptyEntries(otherDetails).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 border rounded-md bg-muted/10"
                    >
                      <h4 className="text-base font-medium mb-2">
                        {toTitleCase(key)}
                      </h4>
                      <p className="leading-relaxed text-muted-foreground">
                        {typeof value === "string" ? linkify(value) : String(value)}
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

export default ResourcesTab;
