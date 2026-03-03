import React from 'react';
import { Zap, Command, ChevronRight, Shield, X, Search, LayoutDashboard, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  const onLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-midnight selection:bg-teal selection:text-midnight overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <Zap className="text-midnight w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">KARTA AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#idea" className="hover:text-teal transition-colors">Idea</a>
          <a href="#how-it-works" className="hover:text-teal transition-colors">Process</a>
          <a href="#engine" className="hover:text-teal transition-colors">Engine</a>
          <a href="#security" className="hover:text-teal transition-colors">Trust</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onLogin}>Login</Button>
          <Button className="hidden sm:flex" onClick={onLogin}>Activate Karta AI</Button>
        </div>
      </nav>

      {/* 🏠 HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-teal/20">
              Intelligence in Action
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] mb-8 tracking-tighter">
              Assign the work.<br />
              <span className="text-gradient">Let intelligence execute.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Karta AI transforms intention into structured execution. <br className="hidden md:block" />
              You focus on direction. We handle delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button className="w-full sm:w-auto px-10 py-5 text-lg rounded-xl" onClick={onLogin}>
                Start Execution
              </Button>
              <Button variant="outline" className="w-full sm:w-auto px-10 py-5 text-lg rounded-xl">
                See How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🌌 SECTION 1 — THE IDEA */}
      <section id="idea" className="py-32 px-6 md:px-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
                Inspired by Timeless Clarity.<br />
                <span className="text-slate-500">Built for the AI Era.</span>
              </h2>
              <div className="mb-8">
                <p className="text-3xl font-serif italic text-teal mb-2">योगः कर्मसु कौशलम्</p>
                <p className="text-slate-500 italic">Excellence in action.</p>
              </div>
              <p className="text-xl text-slate-400 leading-relaxed mb-6">
                In every era, success belongs to those who execute with precision.
              </p>
              <p className="text-xl text-slate-400 leading-relaxed">
                Karta AI is designed around a simple principle: clarity in thought, intelligence in processing, perfection in action.
              </p>
              <div className="mt-10 p-6 border-l-2 border-teal bg-teal/5">
                <p className="text-white font-medium">This is not automation. This is aligned execution.</p>
              </div>
            </motion.div>
            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden glass">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000"
                alt="AI Era"
                className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ⚙️ SECTION 2 — HOW IT WORKS */}
      <section id="how-it-works" className="py-32 px-6 md:px-12 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">From Intention to Completion</h2>
            <p className="text-xl text-slate-500">A structured path to excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Assign", desc: "Define your objective. Set constraints. Share context.", icon: Command },
              { step: "2", title: "Align", desc: "Karta AI processes the task through structured reasoning models.", icon: Zap },
              { step: "3", title: "Execute", desc: "Work is completed intelligently, consistently, and at scale.", icon: ChevronRight }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                whileHover={{ borderColor: 'rgba(100, 255, 218, 0.3)' }}
                className="glass p-10 rounded-[2rem] relative group transition-colors duration-300"
              >
                <div className="text-8xl font-display font-bold text-white/5 absolute top-4 right-8 group-hover:text-teal/10 transition-colors">
                  0{item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center mb-8">
                  <item.icon className="text-teal w-7 h-7" />
                </div>
                <h3 className="text-3xl font-display font-bold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex flex-wrap justify-center gap-8 text-slate-500 font-medium uppercase tracking-widest text-sm">
              <span className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> No confusion</span>
              <span className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> No delay</span>
              <span className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> No friction</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🧠 SECTION 3 — THE KARTA ENGINE */}
      <section id="engine" className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-teal/20 blur-3xl rounded-full opacity-30" />
              <div className="relative glass rounded-[3rem] p-8 aspect-square flex items-center justify-center overflow-hidden">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary/60"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-3 w-3 rounded-full bg-primary/40"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary/50"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 rounded-full bg-primary/50"></div>
                  </div>
                  <div className="absolute inset-8 rounded-full border border-secondary/25">
                    <div className="absolute inset-0 rounded-full bg-secondary/5"></div>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <line x1="20" y1="30" x2="80" y2="70" className="neural-line"></line>
                      <line x1="80" y1="30" x2="20" y2="70" className="neural-line"></line>
                      <line x1="50" y1="10" x2="50" y2="90" className="neural-line"></line>
                      <circle cx="50" cy="50" r="2" fill="hsl(213 90% 56% / 0.5)"></circle>
                      <circle cx="20" cy="30" r="1.5" fill="hsl(213 90% 56% / 0.3)"></circle>
                      <circle cx="80" cy="70" r="1.5" fill="hsl(213 90% 56% / 0.3)"></circle>
                      <circle cx="80" cy="30" r="1.5" fill="hsl(213 90% 56% / 0.3)"></circle>
                      <circle cx="20" cy="70" r="1.5" fill="hsl(213 90% 56% / 0.3)"></circle>
                    </svg></div>
                  <div className="absolute inset-[35%] rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center glow-gold">
                    <span className="font-display text-sm font-semibold text-primary tracking-wider">EXECUTE</span>
                  </div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-muted-foreground">Structure</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-secondary">Intelligence</span>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">
                Structured Intelligence.<br />
                <span className="text-teal">Predictable Results.</span>
              </h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                At its core, Karta AI operates through three principles:
              </p>
              <div className="space-y-8">
                {[
                  { title: "Structure", desc: "Every task follows a defined execution path." },
                  { title: "Intelligence", desc: "Context-aware reasoning powers decision-making." },
                  { title: "Execution", desc: "Outputs are delivered with measurable precision." }
                ].map((principle, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-teal to-transparent" />
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{principle.title}</h4>
                      <p className="text-slate-400">{principle.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-12 text-2xl font-serif italic text-white">
                "You don’t manage chaos. You orchestrate outcomes."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 4 — WHAT KARTA AI DOES */}
      <section className="py-32 px-6 md:px-12 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Built for High-Performance Workflows</h2>
            <p className="text-xl text-slate-500">Execution designed for modern teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Smart Task Execution", desc: "Automates complex processes without losing context.", icon: Zap },
              { title: "Context-Aware Intelligence", desc: "Understands dependencies, priorities, and business logic.", icon: Search },
              { title: "Workflow Orchestration", desc: "Coordinates tasks across systems seamlessly.", icon: LayoutDashboard },
              { title: "Continuous Optimization", desc: "Learns, improves, and refines execution over time.", icon: TrendingUp }
            ].map((feature, idx) => (
              <div key={idx} className="glass p-8 rounded-3xl flex gap-6 hover:bg-white/[0.03] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="text-teal w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔷 SECTION 5 — WHY KARTA AI */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">The Difference Is Alignment</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="glass p-12 rounded-[3rem] border-red-500/10">
              <h3 className="text-2xl font-display font-bold mb-10 text-red-400 flex items-center gap-3">
                <X className="w-6 h-6" /> Without Structured Execution
              </h3>
              <ul className="space-y-6">
                {["Manual coordination", "Fragmented workflows", "Reactive decision-making", "Unpredictable delivery"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-slate-500 text-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass p-12 rounded-[3rem] border-teal/30 bg-teal/[0.02]">
              <h3 className="text-2xl font-display font-bold mb-10 text-teal flex items-center gap-3">
                <Zap className="w-6 h-6 fill-current" /> With Karta AI
              </h3>
              <ul className="space-y-6">
                {["Automated clarity", "Aligned systems", "Proactive intelligence", "Reliable outcomes"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-white text-lg font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-16 text-center text-2xl text-slate-400 italic">
            Execution is no longer effort-driven. <span className="text-white font-medium">It becomes intelligence-driven.</span>
          </p>
        </div>
      </section>

      {/* 🌟 SECTION 6 — THE PHILOSOPHY */}
      <section className="py-32 px-6 md:px-12 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-10">Act Without Friction</h2>
            <p className="text-2xl text-slate-400 leading-relaxed mb-12 font-light">
              Great leaders do not chase tasks. They define direction.
            </p>
            <div className="glass p-12 rounded-[3rem] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal to-transparent" />
              <p className="text-xl text-white leading-relaxed mb-8">
                Karta AI removes operational noise so you can focus on strategy.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-lg">
                <div className="text-slate-500">You define the mission.</div>
                <div className="w-8 h-[1px] bg-teal hidden md:block" />
                <div className="text-teal font-bold uppercase tracking-widest">Karta executes the movement.</div>
              </div>
            </div>
            <p className="mt-12 text-2xl font-serif italic text-teal">
              Intelligence aligned with purpose creates momentum.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 📊 SECTION 7 — WHO IT’S FOR */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Built for Builders</h2>
              <p className="text-xl text-slate-400 leading-relaxed mb-10">
                If execution is your bottleneck, Karta AI is your multiplier.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "Founders scaling operations",
                  "Teams managing complex workflows",
                  "Enterprises automating execution layers",
                  "Innovators who value clarity"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 glass rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-teal mt-2" />
                    <span className="text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass aspect-video rounded-[3rem] overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                alt="Builders"
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-display font-bold text-white mb-2">10x</p>
                  <p className="text-teal uppercase tracking-widest font-bold text-sm">Execution Multiplier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔐 SECTION 8 — TRUST & SECURITY */}
      <section id="security" className="py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <Shield className="w-20 h-20 text-teal mx-auto mb-10" />
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Designed for Responsible Intelligence</h2>
          <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-3xl mx-auto">
            Intelligence must be powerful. It must also be accountable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Enterprise-grade security", desc: "Bank-level encryption for all data at rest and in transit." },
              { title: "Secure data pipelines", desc: "Isolated environments for sensitive processing tasks." },
              { title: "Transparent models", desc: "Clear visibility into how decisions are made and executed." }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <h4 className="text-xl font-bold text-white mb-4">{item.title}</h4>
                <p className="text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔥 FINAL CTA SECTION */}
      <section className="py-40 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal/5 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-teal to-transparent" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-8xl font-display font-bold mb-10 tracking-tighter">
              Stop Managing.<br />
              <span className="text-gradient">Start Executing.</span>
            </h2>
            <p className="text-2xl text-slate-400 mb-12 leading-relaxed">
              The future belongs to those who act decisively.
            </p>
            <div className="flex flex-col items-center gap-8">
              <Button className="px-12 py-6 text-xl rounded-2xl shadow-[0_0_40px_rgba(100,255,218,0.2)]" onClick={onLogin}>
                Activate Karta AI
              </Button>
              <div className="flex flex-wrap justify-center gap-8 text-slate-500 font-medium uppercase tracking-widest text-xs">
                <span>Activate intelligence</span>
                <span>Align execution</span>
                <span>Deliver without friction</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 md:px-12 border-t border-white/5 bg-midnight">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="text-teal w-8 h-8 fill-current" />
                <span className="text-2xl font-display font-bold text-white">KARTA AI</span>
              </div>
              <p className="text-slate-500 max-w-xs text-lg">
                Intelligence. Alignment. Execution.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-slate-500">
                <li><a href="#" className="hover:text-teal transition-colors">About</a></li>
                <li><a href="#" className="hover:text-teal transition-colors">Technology</a></li>
                <li><a href="#" className="hover:text-teal transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-teal transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Connect</h4>
              <ul className="space-y-4 text-slate-500">
                <li><a href="#" className="hover:text-teal transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-teal transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-teal transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-sm">
            <p>© 2026 KARTA AI. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
