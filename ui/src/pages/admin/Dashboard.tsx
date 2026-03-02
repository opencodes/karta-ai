import React from 'react';
import { Zap, TrendingUp, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';
import { CHART_DATA, TASKS, RECENT_TRANSACTIONS } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';

export const AdminDashboard = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-8">
      {/* Pulse Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-teal p-6 rounded-3xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
          <Zap className="w-12 h-12 text-teal fill-current" />
        </div>
        <h2 className="text-sm font-bold text-teal uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
          KARTA Pulse
        </h2>
        <p className="text-xl md:text-2xl font-display font-medium text-heading leading-relaxed">
          "Welcome back. You have <span className="text-teal">₹12,400</span> in upcoming bills and 3 high-priority meetings today. I've cleared your afternoon for deep work."
        </p>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card title="Financial Performance" className="lg:col-span-2">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64FFDA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#64FFDA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0A192F' : '#FFFFFF', 
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                    borderRadius: '12px',
                    color: theme === 'dark' ? '#FFFFFF' : '#0F172A'
                  }}
                  itemStyle={{ color: '#64FFDA' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#64FFDA"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Task List */}
        <Card title="Priority Actions">
          <div className="space-y-4 mt-4">
            {TASKS.map(task => (
              <div key={task.id} className="flex items-center gap-3 group cursor-pointer">
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  task.completed ? "bg-teal border-teal" : "border-main group-hover:border-teal/50"
                )}>
                  {task.completed && <Zap className="w-3 h-3 text-black fill-current" />}
                </div>
                <span className={cn(
                  "text-sm transition-colors",
                  task.completed ? "text-slate-500 line-through" : "text-slate-400 group-hover:text-heading"
                )}>
                  {task.title}
                </span>
                {task.priority === 'high' && !task.completed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </div>
            ))}
            <motion.button 
              whileHover={{ borderColor: 'rgba(100, 255, 218, 0.5)' }}
              className="w-full py-2 mt-4 border border-dashed border-main rounded-xl text-xs font-bold text-slate-500 hover:text-teal transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Add Action
            </motion.button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card title="Recent Activity" className="lg:col-span-1">
          <div className="space-y-6 mt-4">
            {RECENT_TRANSACTIONS.map(tx => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                    {tx.amount > 0 ? <ArrowUpRight className="text-emerald-400 w-5 h-5" /> : <ArrowDownRight className="text-red-400 w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-heading">{tx.merchant}</p>
                    <p className="text-xs text-slate-500">{tx.category}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-sm font-bold",
                  tx.amount > 0 ? "text-emerald-400" : "text-heading"
                )}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Assets</p>
              <p className="text-2xl font-display font-bold text-heading">₹42,80,500</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center">
              <TrendingUp className="text-teal w-6 h-6" />
            </div>
          </Card>
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Executions</p>
              <p className="text-2xl font-display font-bold text-heading">12</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center">
              <Zap className="text-teal w-6 h-6" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
