import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Info, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCircle2,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ai';
  time: string;
  date: string;
  read: boolean;
  category: 'system' | 'finance' | 'family' | 'ai';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'AI Execution Complete',
    message: 'The monthly financial report has been generated and is ready for review. All transactions have been categorized and reconciled.',
    type: 'ai',
    time: '2m ago',
    date: '2026-03-02',
    read: false,
    category: 'ai'
  },
  {
    id: '2',
    title: 'New Family Member',
    message: 'Aarav has joined the family workspace. You can now assign tasks and share financial views with them.',
    type: 'success',
    time: '1h ago',
    date: '2026-03-02',
    read: false,
    category: 'family'
  },
  {
    id: '3',
    title: 'Upcoming Bill Reminder',
    message: 'Electricity bill of ₹4,500 is due in 3 days. Automatic payment is scheduled for March 5th.',
    type: 'warning',
    time: '5h ago',
    date: '2026-03-02',
    read: true,
    category: 'finance'
  },
  {
    id: '4',
    title: 'System Update',
    message: 'KARTA AI has been updated to v2.4.0 with improved neural processing and faster execution times.',
    type: 'info',
    time: '1d ago',
    date: '2026-03-01',
    read: true,
    category: 'system'
  },
  {
    id: '5',
    title: 'Budget Alert',
    message: 'You have reached 80% of your monthly dining budget. Consider reviewing your upcoming expenses.',
    type: 'warning',
    time: '2d ago',
    date: '2026-02-28',
    read: true,
    category: 'finance'
  }
];

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !n.read) || 
      (filter === 'ai' && n.type === 'ai');
    
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading tracking-tight">Notifications</h1>
          <p className="text-slate-400 mt-1">Stay updated with AI executions and system alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={markAllAsRead} className="text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-main flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl w-full sm:w-auto">
            {(['all', 'unread', 'ai'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest",
                  filter === f 
                    ? "bg-teal text-black shadow-lg shadow-teal/20" 
                    : "text-slate-500 hover:text-heading hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-black/5 dark:bg-white/5 border border-main rounded-xl py-2 pl-10 pr-4 text-sm text-heading focus:border-teal/50 outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-main">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "p-6 flex gap-6 transition-colors group relative",
                    !notification.read ? "bg-teal/[0.02]" : "hover:bg-black/2 dark:hover:bg-white/2"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    notification.type === 'info' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                    notification.type === 'success' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    notification.type === 'warning' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                    notification.type === 'ai' && "bg-teal/10 text-teal border border-teal/20"
                  )}>
                    {notification.type === 'info' && <Info className="w-6 h-6" />}
                    {notification.type === 'success' && <Check className="w-6 h-6" />}
                    {notification.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                    {notification.type === 'ai' && <Zap className="w-6 h-6 fill-current" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className={cn(
                          "text-lg font-bold transition-colors",
                          !notification.read ? "text-heading" : "text-slate-400 group-hover:text-heading"
                        )}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-500">
                          {notification.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {notification.time}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-slate-500 hover:text-teal transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed max-w-3xl">
                      {notification.message}
                    </p>
                    <div className="pt-2 flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>{notification.date}</span>
                      {notification.type === 'ai' && (
                        <button className="text-teal hover:underline">View Execution Log</button>
                      )}
                      {notification.category === 'finance' && (
                        <button className="text-teal hover:underline">View Wallet</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center">
                <Bell className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
                <h3 className="text-xl font-bold text-heading mb-2">No notifications found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query.</p>
                <Button 
                  variant="ghost" 
                  onClick={() => {setFilter('all'); setSearchQuery('');}}
                  className="mt-6 text-xs"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};
