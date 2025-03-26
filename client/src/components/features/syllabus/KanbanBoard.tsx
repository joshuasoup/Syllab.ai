import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableEventCard } from "./SortableEventCard";

interface KanbanEvent {
  id: string;
  date: string;
  title: string;
  type: 'assessment' | 'deadline' | 'class';
  location?: string;
  category: 'upcoming' | 'thisWeek' | 'thisMonth' | 'past';
}

interface KanbanBoardProps {
  dates: Omit<KanbanEvent, 'id' | 'category'>[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ dates }) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Initialize events with IDs and categories
  const [events, setEvents] = useState<KanbanEvent[]>(() => {
    return dates.map((event, index) => {
      const eventDate = new Date(event.date);
      let category: KanbanEvent['category'] = 'upcoming';
      
      if (eventDate < today) {
        category = 'past';
      } else if (eventDate >= startOfWeek && eventDate <= endOfWeek) {
        category = 'thisWeek';
      } else if (eventDate >= startOfMonth && eventDate <= endOfMonth) {
        category = 'thisMonth';
      }
      
      return {
        ...event,
        id: `${event.date}-${index}`,
        category,
      };
    });
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCategory, setOverCategory] = useState<KanbanEvent['category'] | null>(null);
  const activeEvent = activeId ? events.find(event => event.id === activeId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const newCategory = over.id as KanbanEvent['category'];
    if (newCategory !== overCategory) {
      setOverCategory(newCategory);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeEvent = events.find(event => event.id === active.id);
    const overCategory = over.id as KanbanEvent['category'];

    if (activeEvent && activeEvent.category !== overCategory) {
      setEvents(events.map(event => {
        if (event.id === active.id) {
          return { ...event, category: overCategory };
        }
        return event;
      }));
    }

    setActiveId(null);
    setOverCategory(null);
  };

  const getEventsByCategory = (category: KanbanEvent['category']) => {
    return events.filter(event => event.category === category);
  };

  const KanbanColumn = ({ 
    title, 
    category,
    icon: Icon 
  }: { 
    title: string; 
    category: KanbanEvent['category'];
    icon: React.ElementType;
  }) => {
    const { setNodeRef } = useDroppable({ id: category });
    const columnEvents = getEventsByCategory(category);
    const isOver = overCategory === category;

    return (
      <Card className={`h-full transition-colors duration-200 ${isOver ? 'bg-blue-50/50' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div 
              ref={setNodeRef}
              className={`p-4 space-y-3 min-h-full transition-colors duration-200 ${
                isOver ? 'bg-blue-50/30' : ''
              }`}
            >
              <SortableContext
                items={columnEvents.map(event => event.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No events</p>
                ) : (
                  columnEvents.map((event) => (
                    <SortableEventCard key={event.id} event={event} />
                  ))
                )}
              </SortableContext>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        <KanbanColumn 
          title="Upcoming" 
          category="upcoming"
          icon={CalendarDays} 
        />
        <KanbanColumn 
          title="This Week" 
          category="thisWeek"
          icon={Clock} 
        />
        <KanbanColumn 
          title="This Month" 
          category="thisMonth"
          icon={CalendarDays} 
        />
        <KanbanColumn 
          title="Past" 
          category="past"
          icon={CheckCircle2} 
        />
      </div>
      <DragOverlay>
        {activeEvent && (
          <div className="p-3 bg-white rounded-lg border shadow-lg scale-105 rotate-1 cursor-grabbing">
            <div className="flex items-start gap-2">
              {activeEvent.type === 'assessment' ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : activeEvent.type === 'class' ? (
                <Clock className="h-4 w-4 text-blue-500" />
              ) : (
                <CalendarDays className="h-4 w-4 text-green-500" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{activeEvent.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activeEvent.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                {activeEvent.location && (
                  <p className="text-xs text-gray-500 mt-1">{activeEvent.location}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard; 