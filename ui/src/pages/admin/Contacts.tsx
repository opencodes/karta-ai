import React, { useState } from 'react';
import { Search, Plus, Mail, MoreVertical, UserPlus, X, BrainCircuit, Sparkles, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CONTACTS } from '../../data/mockData';
import { cn } from '../../utils/cn';

export const Contacts = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Adding contact with prompt:', prompt);
    setIsProcessing(false);
    setIsAddModalOpen(false);
    setPrompt('');
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-teal uppercase tracking-[0.2em]">
              AI Input Engine
            </label>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Ready</span>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal/20 to-violet-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative">
              <textarea 
                required
                disabled={isProcessing}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Add John Doe as a Senior Developer, email john@example.com"
                rows={5}
                className="w-full bg-black/5 dark:bg-midnight/50 border border-main rounded-2xl py-4 px-5 text-heading placeholder:text-slate-600 focus:border-teal/50 outline-none transition-all resize-none text-lg leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-slate-700 group-focus-within:text-teal/50 transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-black/2 dark:bg-white/2 border border-main">
            <Sparkles className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe the <span className="text-heading font-bold">contact</span> in natural language. Our neural engine will extract the name, role, and contact details automatically.
            </p>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button 
            type="button" 
            disabled={isProcessing}
            onClick={() => setIsAddModalOpen(false)} 
            className="flex-1 py-4 rounded-2xl border border-main text-slate-400 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isProcessing}
            className="flex-[2] py-4 rounded-2xl bg-teal text-black font-bold hover:bg-teal/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-teal/20 disabled:opacity-50 relative overflow-hidden group"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Context...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-midnight group-hover:scale-110 transition-transform" />
                <span>Execute AI Command</span>
              </>
            )}
            
            {!isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading">Contacts</h1>
          <p className="text-slate-500">Manage your team and external collaborators.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto">
          <UserPlus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CONTACTS.map((contact) => (
          <Card key={contact.id} className="group">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal/20 to-blue-500/20 p-[1px]">
                  <div className="w-full h-full rounded-full bg-midnight flex items-center justify-center text-xl font-bold text-teal">
                    {contact.avatar}
                  </div>
                </div>
                <div className={cn(
                  "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-midnight",
                  contact.status === 'active' ? "bg-emerald-500" :
                  contact.status === 'away' ? "bg-amber-500" : "bg-slate-600"
                )} />
              </div>
              
              <h3 className="text-lg font-bold text-heading group-hover:text-teal transition-colors">{contact.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{contact.role}</p>
              
              <div className="w-full grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full py-2 text-xs">
                  <Mail className="w-3 h-3" />
                  Email
                </Button>
                <Button variant="ghost" className="w-full py-2 text-xs">
                  Profile
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        <motion.button 
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ borderColor: 'rgba(100, 255, 218, 0.3)' }}
          className="h-full min-h-[240px] border-2 border-dashed border-main rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-teal hover:bg-teal/5 transition-colors duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal/10 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">Add New Contact</span>
        </motion.button>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-main flex items-center justify-between">
                <h2 className="text-xl font-bold text-heading">Add New Contact</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-500 hover:text-heading transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {renderForm()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
