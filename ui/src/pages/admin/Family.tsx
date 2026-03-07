import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Mail, 
  Shield, 
  Plus, 
  MoreVertical, 
  X, 
  User, 
  Phone, 
  Briefcase, 
  Heart, 
  FileText,
  Sparkles,
  Zap,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

const INITIAL_FAMILY_DATA = {
  "id": "679478a8-65b9-4f76-8a35-dd9b3b080073",
  "name": "My Family",
  "address": "123 Main Street, City",
  "created_by": "91e6b2a4-e563-4be7-a544-70f11fc4cc81",
  "created_at": "2026-02-24 16:48:34",
  "updated_at": "2026-02-24 16:48:34",
  "members": [
    {
      "id": "db243379-7262-4143-ac16-8179c8d2dbce",
      "family_id": "679478a8-65b9-4f76-8a35-dd9b3b080073",
      "user_id": "91e6b2a4-e563-4be7-a544-70f11fc4cc81",
      "role": "admin",
      "relation": "Head of Household",
      "status": "active",
      "invitation_email": null,
      "invitation_sent_at": null,
      "joined_at": "2026-02-24 16:48:34",
      "user_email": "admin@gmail.com",
      "full_name": "John Doe",
      "user_phone": "+1 (555) 000-1234"
    }
  ]
};

export const Family = () => {
  const [members, setMembers] = useState(INITIAL_FAMILY_DATA.members);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    user_email: '',
    user_phone: '',
    relation: '',
    role: 'member'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newMember = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      family_id: INITIAL_FAMILY_DATA.id,
      user_id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      joined_at: new Date().toISOString(),
      invitation_email: formData.user_email,
      invitation_sent_at: new Date().toISOString()
    };
    setMembers(prev => [...prev, newMember]);
    setIsProcessing(false);
    setIsInviteModalOpen(false);
    setFormData({
      full_name: '',
      user_email: '',
      user_phone: '',
      relation: '',
      role: 'member'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading tracking-tight">Family Management</h1>
          <p className="text-slate-400 mt-1">Manage your family members and household details.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-teal text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-teal/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Family Info Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center">
              <Home className="text-teal w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-heading">{INITIAL_FAMILY_DATA.name}</h2>
              <p className="text-sm text-slate-500">Family ID: {INITIAL_FAMILY_DATA.id.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</p>
                <p className="text-slate-400">{INITIAL_FAMILY_DATA.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Created At</p>
                <p className="text-slate-400">{new Date(INITIAL_FAMILY_DATA.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-main">
            <button className="w-full py-3 rounded-xl border border-main text-slate-400 font-medium btn-ghost-ui transition-colors">
              Edit Family Details
            </button>
          </div>
        </Card>

        {/* Members List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-heading">Family Members ({members.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="relative group">
                <div className="absolute top-4 right-4">
                  <button className="btn-icon-ui">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal/20 to-blue-500/20 p-[1px]">
                    <div className="w-full h-full rounded-full bg-midnight flex items-center justify-center text-lg font-bold text-teal">
                      {member.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-heading">{member.full_name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                        member.role === 'admin' ? "bg-teal/10 text-teal" : "bg-black/5 dark:bg-white/5 text-slate-500"
                      )}>
                        {member.role}
                      </span>
                      {member.relation && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-500">
                          {member.relation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    {member.user_email}
                  </div>
                  {member.user_phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Shield className="w-4 h-4" />
                      {member.user_phone}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {member.status === 'active' ? `Joined ${new Date(member.joined_at).toLocaleDateString()}` : 'Invitation Pending'}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-main flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      member.status === 'active' ? "bg-teal" : "bg-amber-500"
                    )} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{member.status}</span>
                  </span>
                  <button className="text-xs font-bold btn-link-ui uppercase tracking-widest">
                    View Profile
                  </button>
                </div>
              </Card>
            ))}

            {/* Add Member Placeholder */}
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="h-full min-h-[240px] border-2 border-dashed border-main rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-teal hover:bg-teal/5 transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal/10 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold uppercase tracking-widest text-xs">Invite Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-main flex items-center justify-between">
                <h2 className="text-xl font-bold text-heading">Invite Family Member</h2>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="btn-icon-ui"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                        name="ai_prompt"
                        disabled={isProcessing}
                        value={formData.full_name} // Reusing full_name state for the prompt for simplicity in this demo
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="e.g. Invite my wife Jane Doe (jane@example.com) as an admin"
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
                      Describe the <span className="text-heading font-bold">family member</span> you'd like to invite. Our neural engine will extract the name, email, and role from your description.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl btn-outline-ui transition-colors disabled:opacity-50"
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
                    
                    {/* Animated shimmer effect */}
                    {!isProcessing && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for conditional classes since we don't have it in scope here
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
