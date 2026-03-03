import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  ListTodo,
  Search,
  Settings,
  Zap,
  Bell,
  ArrowDownRight,
  Command,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown, Notification } from '../components/NotificationDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isCommandOpen) {
      commandInputRef.current?.focus();
    }
  }, [isCommandOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'AI Execution Complete',
      message: 'The monthly financial report has been generated and is ready for review.',
      type: 'ai',
      time: '2m ago',
      read: false
    },
    {
      id: '2',
      title: 'New Family Member',
      message: 'Aarav has joined the family workspace.',
      type: 'success',
      time: '1h ago',
      read: false
    },
    {
      id: '3',
      title: 'Upcoming Bill Reminder',
      message: 'Electricity bill of ₹4,500 is due in 3 days.',
      type: 'warning',
      time: '5h ago',
      read: true
    },
    {
      id: '4',
      title: 'System Update',
      message: 'KARTA AI has been updated to v2.4.0 with improved neural processing.',
      type: 'info',
      time: '1d ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { icon: Zap, label: 'Admin Home', path: '/admin', id: 'admin_home' },
    { icon: ListTodo, label: 'ToDo', path: '/admin/todo', id: 'todo' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', id: 'dashboard' },
  ];

  return (
    <div className="flex h-screen bg-midnight text-slate-500 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-[#050505] backdrop-blur-none">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <Zap className="text-black w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">KARTA AI</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200",
                location.pathname === item.path
                  ? "bg-teal/10 text-teal font-medium"
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 transition-colors duration-200"
          >
            <ArrowDownRight className="w-5 h-5 rotate-45" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#050505]">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center justify-between text-slate-500 hover:border-teal/30 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 group-hover:text-teal transition-colors" />
                <span className="text-sm">Ask KARTA anything...</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors relative",
                  isNotificationsOpen && "text-teal border-teal/30"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teal rounded-full border border-midnight" />
                )}
              </button>
              
              <NotificationDropdown 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-blue-500 p-[1px]"
                aria-label="Open profile menu"
                title="Profile menu"
              >
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center text-xs font-bold text-white">
                  {user?.email?.slice(0, 2).toUpperCase() ?? 'RJ'}
                </div>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 glass rounded-xl border border-white/10 shadow-xl overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-midnight dark:bg-transparent">
          {children}
        </div>
      </main>

      {/* Command Palette Overlay (Simplified for now) */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          <div className="absolute inset-0 bg-black/60 dark:bg-midnight/80 backdrop-blur-sm" onClick={() => setIsCommandOpen(false)} />
          <div className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-main flex items-center gap-3">
              <Search className="w-5 h-5 text-teal" />
              <input
                ref={commandInputRef}
                type="text"
                placeholder="Search actions, data, or ask AI..."
                className="w-full bg-transparent border-none outline-none text-heading placeholder:text-slate-500"
              />
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Actions</div>
              <button className="w-full text-left px-3 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3">
                <Zap className="w-4 h-4 text-teal" />
                <span className="text-heading">Create new execution task</span>
              </button>
              <button className="w-full text-left px-3 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span className="text-heading">View latest financial report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
