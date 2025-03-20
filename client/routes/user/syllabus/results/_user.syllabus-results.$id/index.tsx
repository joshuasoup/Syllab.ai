// web/routes/_user.syllabus-result.$id/index.tsx

import React, { useState } from "react";
import { useFindOne, useAction } from "@gadgetinc/react";
import { useParams, Link, useNavigate } from "react-router";
import { api } from "../../api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteSyllabusButton from "@/components/syllabus/DeleteSyllabusButton";
import { toast } from "sonner";
import ChatbotDialog from "@/components/ChatbotDialog";

// 1. Import helpers and types
import {
  SyllabusData,
  formatDate,
  isEmpty,
  filterEmptyEntries,
} from "./SyllabusHelpers";

// 2. Import your parted-out sub-components
import SyllabusHeader from "./SyllabusHeader";
import CourseInfoTab from "./Tabs/CourseInfoTab";
import InstructorsTab from "./Tabs/InstructorsTab";
import ScheduleTab from "./Tabs/ScheduleTab";
import AssessmentsTab from "./Tabs/AssessmentsTab";
import PoliciesTab from "./Tabs/PoliciesTab";
import ResourcesTab from "./Tabs/ResourcesTab";

export default function SyllabusResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Local state
  const [activeTab, setActiveTab] = useState<string>("course-info");

  // Validate ID
  const isValidId = id && /^\d+$/.test(id);

  // Gadget query
  const [{ data: syllabus, fetching, error }] = useFindOne<SyllabusData>(
    api.syllabus,
    isValidId ? id : "0",
    {
      select: {
        id: true,
        title: true,
        file: { url: true, fileName: true, mimeType: true },
        processed: true,
        highlights: true,
        icsContent: true,
        createdAt: true,
        updatedAt: true,
      },
    }
  );

  // Early returns (loading / error / invalid states)
  if (!id || !isValidId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-4xl bg-destructive/10 w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Syllabus ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {!id
                ? "No syllabus ID was provided in the URL."
                : "The provided syllabus ID is invalid. IDs should contain only digits."}
            </p>
          </CardContent>
          <div className="p-4">
            <Button asChild variant="outline">
              <Link to="/syllabus-upload">Back to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-4xl w-full">
          <CardHeader>
            <CardTitle>Loading Syllabus</CardTitle>
            <p>Retrieving your syllabus information...</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-pulse text-primary">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-4xl bg-destructive/10 w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Syllabus</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error: {error.message}</p>
          </CardContent>
          <div className="p-4">
            <Button asChild variant="outline">
              <Link to="/syllabus-upload">Back to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-4xl w-full">
          <CardHeader>
            <CardTitle>Syllabus Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The syllabus you're looking for could not be found.</p>
          </CardContent>
          <div className="p-4">
            <Button asChild variant="outline">
              <Link to="/syllabus-upload">Back to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Deconstruct
  const { title, file, createdAt, updatedAt, highlights, processed, icsContent } = syllabus;
  const fileUrl = file?.url;
  const data = highlights || {};

  // Handler for ICS download
  const handleICSDownload = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title || "course"}_calendar.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-3">
        <SyllabusHeader
          title={title}
          fileUrl={fileUrl}
          updatedAt={updatedAt}
          icsContent={icsContent || undefined}
          onDownloadCalendar={handleICSDownload}
        />
      </div>

      {/* Main Tabs */}
      <div className="container mx-auto pb-12">
        <Tabs
          defaultValue="course-info"
          onValueChange={(value) => setActiveTab(value)}
          className="w-full mb-12"
        >
          <div className="relative">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
              {data.course_info && (
                <TabsTrigger value="course-info">📚 Course Info</TabsTrigger>
              )}
              {data.instructors && Array.isArray(data.instructors) && data.instructors.length > 0 && (
                <TabsTrigger value="instructors">👨‍🏫 Instructors</TabsTrigger>
              )}
              {data.class_schedule && (
                <TabsTrigger value="schedule">📆 Schedule</TabsTrigger>
              )}
              {data.assessments && Array.isArray(data.assessments) && data.assessments.length > 0 && (
                <TabsTrigger value="assessments">📝 Assessments</TabsTrigger>
              )}
              {(data.policies || (data.important_deadlines && data.important_deadlines.length > 0)) && (
                <TabsTrigger value="policies">⚠️ Policies</TabsTrigger>
              )}
              {(data.textbooks || data.other_details) && (
                <TabsTrigger value="resources">📋 Resources</TabsTrigger>
              )}
            </TabsList>
          </div>

          {data.course_info && (
            <TabsContent value="course-info" className="space-y-8 mt-2">
              <CourseInfoTab courseInfo={data.course_info} />
            </TabsContent>
          )}

          {data.instructors && Array.isArray(data.instructors) && data.instructors.length > 0 && (
            <TabsContent value="instructors" className="mt-2">
              <InstructorsTab instructors={data.instructors} />
            </TabsContent>
          )}

          {data.class_schedule && (
            <TabsContent value="schedule" className="mt-2">
              <ScheduleTab classSchedule={data.class_schedule} />
            </TabsContent>
          )}

          {data.assessments && Array.isArray(data.assessments) && data.assessments.length > 0 && (
            <TabsContent value="assessments" className="mt-2">
              <AssessmentsTab assessments={data.assessments} />
            </TabsContent>
          )}

          {(data.policies || data.important_deadlines) && (
            <TabsContent value="policies" className="mt-2">
              <PoliciesTab
                policies={data.policies}
                importantDeadlines={data.important_deadlines}
              />
            </TabsContent>
          )}

          {(data.textbooks || data.other_details) && (
            <TabsContent value="resources" className="mt-2">
              <ResourcesTab
                textbooks={data.textbooks}
                otherDetails={data.other_details}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Chatbot and DeleteButton */}
      <div className="container mx-auto px-4 pb-8 flex justify-center gap-4">
        <ChatbotDialog />
        <DeleteSyllabusButton syllabusId={id} />
      </div>
    </div>
  );
}
