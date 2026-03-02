import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CALENDAR_EVENTS } from '../../data/mockData';
import { cn } from '../../utils/cn';

export const Calendar = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-display font-bold text-heading">{monthName} {year}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 glass rounded-lg hover:text-teal transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 glass rounded-lg hover:text-teal transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-main">
            {days.map(day => (
              <div key={day} className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 3; // Offset for demo
              const isCurrentMonth = dayNum > 0 && dayNum <= 31;
              const isToday = dayNum === currentDate.getDate();

              return (
                <div 
                  key={i} 
                  className={cn(
                    "min-h-[120px] p-3 border-r border-b border-main last:border-r-0 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer",
                    !isCurrentMonth && "opacity-20"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      isToday ? "bg-teal text-black" : "text-slate-400"
                    )}>
                      {isCurrentMonth ? dayNum : ''}
                    </span>
                  </div>
                  {isToday && (
                    <div className="space-y-1">
                      <div className="text-[10px] p-1.5 rounded bg-teal/10 text-teal border border-teal/20 truncate">
                        Strategy Sync
                      </div>
                      <div className="text-[10px] p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 truncate">
                        Design Review
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Today's Schedule</h3>
          <div className="space-y-4">
            {CALENDAR_EVENTS.map((event) => (
              <Card key={event.id} className="p-4 border-l-4 border-l-teal">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-heading text-sm">{event.title}</h4>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                    event.priority === 'high' ? "bg-red-500/10 text-red-400" : "bg-teal/10 text-teal"
                  )}>
                    {event.priority}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {event.time} ({event.duration})
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {event.type === 'meeting' ? (
                      <><Video className="w-3 h-3" /> Zoom Meeting</>
                    ) : (
                      <><MapPin className="w-3 h-3" /> Design Studio</>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Card className="bg-teal/5 border-teal/20">
            <h4 className="text-sm font-bold text-teal mb-2">KARTA Insight</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              I've detected a conflict between your Strategy Sync and the Design Review. Would you like me to reschedule?
            </p>
            <Button variant="outline" className="w-full mt-4 py-2 text-xs">
              Resolve Conflict
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
