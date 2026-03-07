import React from 'react';
import { Bell, X, Check, Info, AlertTriangle, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ai';
  time: string;
  read: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationDropdownProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 right-0 w-80 sm:w-96 dropdown-panel-ui rounded-2xl shadow-2xl z-[101]"
          >
            <div className="p-4 border-b border-main flex items-center justify-between bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal" />
                <h3 className="font-bold text-heading text-sm">Notifications</h3>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-teal text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <button 
                onClick={onMarkAllAsRead}
                className="text-[10px] font-bold text-teal uppercase tracking-widest hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-main">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => onMarkAsRead(notification.id)}
                      className={cn(
                        "p-4 flex gap-4 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5",
                        !notification.read && "bg-teal/[0.02]"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        notification.type === 'info' && "bg-blue-500/10 text-blue-400",
                        notification.type === 'success' && "bg-emerald-500/10 text-emerald-400",
                        notification.type === 'warning' && "bg-amber-500/10 text-amber-400",
                        notification.type === 'ai' && "bg-teal/10 text-teal"
                      )}>
                        {notification.type === 'info' && <Info className="w-5 h-5" />}
                        {notification.type === 'success' && <Check className="w-5 h-5" />}
                        {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                        {notification.type === 'ai' && <Zap className="w-5 h-5 fill-current" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "text-sm font-bold truncate",
                            notification.read ? "text-slate-400" : "text-heading"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                  <p className="text-sm text-slate-500">No new notifications</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-main text-center bg-black/2 dark:bg-white/2">
              <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-teal transition-colors">
                View All Activity
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
