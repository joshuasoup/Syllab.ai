import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Clock, AlertCircle } from "lucide-react";

interface KanbanEvent {
  id: string;
  date: string;
  title: string;
  type: 'assessment' | 'deadline' | 'class';
  location?: string;
  category: 'upcoming' | 'thisWeek' | 'thisMonth' | 'past';
}

interface SortableEventCardProps {
  event: KanbanEvent;
}

export const SortableEventCard: React.FC<SortableEventCardProps> = ({ event }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        {event.type === 'assessment' ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : event.type === 'class' ? (
          <Clock className="h-4 w-4 text-blue-500" />
        ) : (
          <CalendarDays className="h-4 w-4 text-green-500" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{event.title}</p>
          <p className="text-xs text-gray-500">
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          {event.location && (
            <p className="text-xs text-gray-500 mt-1">{event.location}</p>
          )}
        </div>
      </div>
    </div>
  );
}; 