import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";

interface CalendarEvent {
  date: string;
  title: string;
  type: string;
  location?: string;
}

interface CalendarProps {
  dates: CalendarEvent[];
}

export function Calendar({ dates }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Get calendar data
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Create calendar grid
  const days = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get events for current month
  const eventsThisMonth = dates.filter(date => {
    const eventDate = new Date(date.date);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Create calendar grid
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevMonth} 
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextMonth} 
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              id="calendar-search"
              name="calendar-search"
              type="text" 
              placeholder="Search events" 
              className="pl-8 pr-3 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Today
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 inline-block mr-1" /> Add event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 p-2 text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0] : '';
            const events = eventsThisMonth.filter(event => event.date.startsWith(dateStr));
            const isToday = day && new Date().toISOString().split('T')[0] === dateStr;
            
            return (
              <div 
                key={index} 
                className={`min-h-[100px] p-2 border-b border-r border-gray-200 ${
                  day ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm mb-1 ${isToday ? 'font-semibold text-blue-600' : ''}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {events.map((event, eventIndex) => (
                        <div 
                          key={eventIndex}
                          className={`text-xs p-1 rounded truncate ${
                            event.type === 'assessment' ? 'bg-blue-100 text-blue-700' :
                            event.type === 'class' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                          title={`${event.title}${event.location ? ` - ${event.location}` : ''}`}
                        >
                          {event.title}
                        </div>
                      ))}
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
