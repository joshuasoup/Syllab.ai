// web/routes/_user.syllabus-results.$id/Tabs/CourseInfoTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Youtube, Play } from "lucide-react";
import { filterEmptyEntries, isEmpty } from "../SyllabusHelpers";
import { linkify, toTitleCase } from "@/components/syllabus/SubComponents";
import { Button } from "@/components/ui/button";

// Helper function to check if a field is one of the important fields that need special styling
const isImportantField = (key: string): boolean => {
  const normalizedKey = key.toLowerCase().replace(/[_\s-]/g, "");
  return [
    "department",
    "coursecode",
    "coursename",
    "coursewebsite",
  ].includes(normalizedKey);
};

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
}

interface YouTubeChannel {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  url: string;
}

interface CourseInfoTabProps {
  courseInfo: any;
  youtubeVideos?: YouTubeVideo[];
  youtubeChannels?: YouTubeChannel[];
}

const CourseInfoTab: React.FC<CourseInfoTabProps> = ({ 
  courseInfo, 
  youtubeVideos = [], 
  youtubeChannels = [] 
}) => {
  if (!courseInfo || isEmpty(courseInfo)) return null;

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-3 text-primary text-4xl mb-1">
            <span className="text-5xl">📚</span> Course Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {typeof courseInfo === "string" ? (
              <div className="p-6">
                <p className="leading-relaxed text-muted-foreground">
                  {linkify(courseInfo)}
                </p>
              </div>
            ) : (
              filterEmptyEntries(courseInfo).map(([key, value]) => (
                <div
                  key={key}
                  className="px-6 py-4 flex items-start gap-4 group transition-all duration-200 opacity-75 hover:opacity-100 bg-background"
                >
                  <Info className="h-5 w-5 text-primary/60 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      {toTitleCase(key)}
                    </h3>
                    {isImportantField(key) ? (
                      <div className="text-black font-semibold">
                        {typeof value === "string" ? linkify(value) : String(value)}
                      </div>
                    ) : (
                      <div className="text-foreground">
                        {typeof value === "string" ? linkify(value) : String(value)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {youtubeVideos && youtubeVideos.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-sm mt-6">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-3 text-primary text-4xl mb-1">
              <Play className="h-8 w-8" /> Related YouTube Videos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youtubeVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden group hover:shadow-md transition-all duration-200">
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200" 
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </a>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {video.title}
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{video.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(video.url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Youtube className="mr-2 h-4 w-4" /> Watch Video
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {youtubeChannels && youtubeChannels.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-sm mt-6">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-3 text-primary text-4xl mb-1">
              <Youtube className="h-8 w-8" /> Related YouTube Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youtubeChannels.map((channel) => (
                <Card key={channel.id} className="overflow-hidden group hover:shadow-md transition-all duration-200">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <a 
                        href={channel.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block shrink-0"
                      >
                        <img 
                          src={channel.thumbnailUrl} 
                          alt={channel.name} 
                          className="w-12 h-12 rounded-full object-cover border transition-transform group-hover:scale-105 duration-200" 
                        />
                      </a>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        <a 
                          href={channel.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {channel.name}
                        </a>
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{channel.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(channel.url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Youtube className="mr-2 h-4 w-4" /> Visit Channel
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CourseInfoTab;
