import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, User, Zap, Palette, Sun, Moon, Lock, Eye, EyeOff } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const Settings = () => {
  const { theme, toggleTheme, primaryColor, setPrimaryColor, permissions, updatePermission, isAdmin } = useTheme();

  const colors = [
    { name: 'Teal', value: '#64FFDA' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
  ];

  const modules = [
    { id: 'family', label: 'Family Management', description: 'Household and member controls' },
    { id: 'finance', label: 'Finance & Wallet', description: 'Accounts, cards, and transactions' },
    { id: 'calendar', label: 'Shared Calendar', description: 'Family events and schedules' },
    { id: 'contacts', label: 'Contacts Directory', description: 'Shared family contacts' },
  ];

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account, appearance, and permissions.</p>
        </div>
      </div>

      <Card title="Appearance">
        <div className="space-y-8 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-teal" /> : <Sun className="w-5 h-5 text-teal" />}
              </div>
              <div>
                <p className="font-bold text-heading">Interface Theme</p>
                <p className="text-sm text-slate-500">Switch between light and dark mode</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl glass text-sm font-bold text-heading hover:bg-white/10 transition-colors"
            >
              Set to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <Palette className="w-5 h-5 text-teal" />
              </div>
              <div>
                <p className="font-bold text-heading">Primary Accent Color</p>
                <p className="text-sm text-slate-500">Customize the main color of the interface</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pl-14">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setPrimaryColor(color.value)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all duration-200",
                    primaryColor === color.value ? "border-heading scale-110 shadow-lg" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card title="Module Control (Admin Only)">
          <div className="space-y-6 mt-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-teal/5 border border-teal/20 mb-6">
              <Shield className="w-5 h-5 text-teal shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">
                As an administrator, you can control which modules are visible to non-admin family members. Changes are applied instantly across the household.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((mod) => (
                <div key={mod.id} className="p-4 rounded-2xl border border-main bg-black/2 dark:bg-white/2 flex items-center justify-between group hover:border-teal/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      permissions[mod.id] !== false ? "bg-teal/10 text-teal" : "bg-black/5 dark:bg-white/5 text-slate-500"
                    )}>
                      {permissions[mod.id] !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-heading">{mod.label}</p>
                      <p className="text-xs text-slate-500">{mod.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updatePermission(mod.id, permissions[mod.id] === false)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-200",
                      permissions[mod.id] !== false ? "bg-teal" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
                      permissions[mod.id] !== false ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card title="Profile Settings">
        <div className="flex items-center gap-6 mt-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal to-blue-500 p-[1px]">
            <div className="w-full h-full rounded-full bg-midnight flex items-center justify-center text-2xl font-bold text-heading">
              RJ
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-heading">Rajat Jha</h3>
            <p className="text-slate-500">rkjha.it.in@gmail.com</p>
          </div>
          <Button variant="outline">Edit Profile</Button>
        </div>
      </Card>
    </div>
  );
};
