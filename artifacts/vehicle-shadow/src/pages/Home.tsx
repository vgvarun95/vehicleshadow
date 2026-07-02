import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ShieldCheck, MapPin, Wrench, FileText, ChevronRight,
  Search, Check, X, ArrowUpRight, Play, Circle, CircleCheck,
  FileSearch, BarChart3, Truck, Car, MessageCircle, Mail, Phone, HelpCircle, ChevronDown,
  Gauge, Activity, Settings, Calendar, AlertCircle, Clock, Snowflake, Droplet, Sparkles, Shield, Zap,
  Lock, Unlock
} from "lucide-react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";




interface FAQItemProps {
  q: string;
  a: string;
}

function FAQItem({ q, a }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-6">
      <button
        className="w-full flex items-center justify-between text-left group"
        onClick={() => setOpen(!open)}
      >
        <span className="text-lg font-serif font-light text-slate-100 pr-4 group-hover:text-primary transition-colors">{q}</span>
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
          {open ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="pt-4 text-slate-400 leading-relaxed text-sm max-w-3xl">{a}</p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();






  // Smooth scroll handler
  // Smooth scroll handler
  const handleScrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };



  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent Successfully",
      description: "Our vehicle management experts will reach out to you shortly.",
      duration: 5000
    });
    // Reset form fields
    const form = e.target as HTMLFormElement;
    form.reset();
  };



  return (
    <div className="min-h-screen flex flex-col bg-[#05020a] text-white selection:bg-primary selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Navigation Header - Squarespace Minimalist Style */}
      <nav className="fixed top-0 w-full z-50 bg-[#05020a]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between w-full">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo.png" alt="Vehicle Hub" className="h-8 object-contain" />
          </div>

          {/* Center Links with Dropdowns like Squarespace */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-300">
            <a href="#templates" onClick={handleScrollTo("templates")} className="hover:text-white transition-colors">Services</a>
            <a href="#how-it-works" onClick={handleScrollTo("how-it-works")} className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" onClick={handleScrollTo("faq")} className="hover:text-white transition-colors">FAQ</a>
            <a href="#contact" onClick={handleScrollTo("contact")} className="hover:text-white transition-colors">Contact</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs font-bold tracking-widest text-slate-300 hover:text-white uppercase transition-colors">
              Log In
            </Link>
            <Button
              asChild
              className="rounded-none bg-white hover:bg-neutral-200 text-black font-bold tracking-widest px-6 h-10 text-xs uppercase shadow-none border-none transition-all cursor-pointer"
            >
              <a href="#contact" onClick={handleScrollTo("contact")}>Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        {/* Glow Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold mb-6 tracking-wider uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              Comprehensive Vehicle Hub
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-light leading-[1.08] mb-8 text-white text-balance tracking-tight">
              Your ultimate vehicle <br className="hidden sm:inline" />
              companion <span className="italic font-light">hub</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-12 leading-relaxed max-w-xl mx-auto">
              Track compliance documents, shop genuine spare parts with interactive exploded blueprints, book certified workshops, and monitor live GPS telemetry with remote engine lock.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-white hover:bg-neutral-200 text-black font-bold tracking-widest text-xs uppercase px-8 h-12 shadow-none border-none transition-all cursor-pointer w-48 sm:w-auto"
              >
                <a href="#contact" onClick={handleScrollTo("contact")}>Get Started</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-none border-slate-800 text-slate-300 hover:bg-slate-900 tracking-widest text-xs uppercase px-8 h-12 transition-all w-48 sm:w-auto cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Play className="mr-2 w-3.5 h-3.5 fill-current" /> Explore Features
              </Button>
            </div>
          </div>

          {/* Hero Mockup View */}
          <div className="mt-20 max-w-6xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
            <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-2 overflow-hidden shadow-2xl">
              <img
                src="/images/hero-bg.png"
                alt="Squarespace Premium Interface Mockup"
                className="w-full h-auto object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section - Squarespace Grid Style */}
      <section id="templates" className="py-24 md:py-32 bg-[#030107] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">Core Modules</span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mb-6 text-white tracking-tight">Explore the system features.</h2>
            <p className="text-sm md:text-base text-slate-400">
              Four modules designed to handle all aspects of vehicle maintenance, parts procurement, documentation compliance, and real-time security. Click any module to preview its live dashboard configuration below.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: "personal",
                theme: "violet",
                title: "Compliance Dashboard",
                desc: "Track critical deadlines for RC, PUC, insurance, and fitness certificate. Manage traffic challans and view your digital DL.",
                image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400&auto=format&fit=crop"
              },
              {
                id: "fleet",
                theme: "carbon",
                title: "Spare Parts Mall",
                desc: "Browse 100% genuine parts (Engine, Brakes, Electrical). Search by VIN, OE part number, or click visual exploded schematic diagrams.",
                image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=400&auto=format&fit=crop"
              },
              {
                id: "eco",
                theme: "emerald",
                title: "GoMechanic Workshops",
                desc: "Get upfront service estimates based on vehicle brand, find certified nearby workshops, and book slots with doorstep pickup/drop.",
                image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400&auto=format&fit=crop"
              },
              {
                id: "emergency",
                theme: "carbon",
                title: "VeyronGPS Tracking",
                desc: "Monitor live location coordinates, speed, and trip logs. Remotely immobilize and lock your engine for anti-theft protection.",
                image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop"
              }
            ].map((tmpl, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col bg-slate-950 border border-white/5 rounded-none overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                {/* Image Container with Zoom */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={tmpl.image}
                    alt={tmpl.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#05020a]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 gap-3">
                    <Button
                      size="sm"
                      className="rounded-none bg-white hover:bg-neutral-200 text-black font-semibold text-[11px] uppercase tracking-wider px-4 h-9 shadow-none border-none transition-all cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-light text-slate-100 mb-2">{tmpl.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{tmpl.desc}</p>
                  </div>
                  <button
                    className="mt-6 flex items-center text-[10px] uppercase tracking-widest font-bold text-slate-300 group-hover:text-primary transition-colors text-left"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Get Started <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* How It Works Section - Dark premium style */}
      <section id="how-it-works" className="py-24 md:py-32 bg-[#05020a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">Our Services</span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mb-6 text-white tracking-tight">
              Everything Your Vehicle Needs
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A unified ecosystem handling security, compliance, maintenance, and emergency response.
            </p>
          </div>

          {/* Grid of 6 Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Documentation Management",
                desc: "Centralized vehicle details & documentation. Never lose a paper again.",
                iconColor: "text-orange-500"
              },
              {
                icon: ShieldCheck,
                title: "Compliance Updates",
                desc: "Real-time challan alerts & compliance updates so you stay ahead of penalties.",
                iconColor: "text-blue-500"
              },
              {
                icon: Wrench,
                title: "Genuine Spare Parts",
                desc: "Direct access to verified, genuine spare parts from manufacturers.",
                iconColor: "text-slate-400"
              },
              {
                icon: Search,
                title: "On-Demand Mechanics",
                desc: "24/7 mechanic support for unexpected breakdowns anywhere in India.",
                iconColor: "text-cyan-500"
              },
              {
                icon: MapPin,
                title: "Real-Time Tracking",
                desc: "Advanced GPS tracking with real-time location data and route history.",
                iconColor: "text-emerald-500"
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                desc: "Track expenses, compliance status, and vehicle health in one place.",
                iconColor: "text-violet-500"
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className="group bg-slate-950 border border-white/5 p-8 rounded-none hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-slate-350 mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <card.icon className={`w-5 h-5 ${card.iconColor} group-hover:text-white transition-colors`} />
                  </div>
                  <h3 className="text-lg font-serif font-light text-slate-100 mb-3">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 bg-[#05020a] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">Frequently Asked Questions</span>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white tracking-tight">General Questions</h2>
          </div>

          <div className="bg-slate-950 border border-white/5 px-8 py-4 rounded-none">
            <FAQItem
              q="What is Vehicle Hub?"
              a="Vehicle Hub is a high-end vehicle telemetry, compliance management, and maintenance dashboard. It gives you absolute security and control over personal cars or commercial fleets."
            />
            <FAQItem
              q="How does the Live Customizer work?"
              a="You can tweak presets (Compliance, Parts Mall, Workshops, GPS Tracking) and themes directly inside the Sandbox, and apply the layout straight to your dashboard once you create an account."
            />
            <FAQItem
              q="Is my data encrypted?"
              a="Yes, absolutely. We use bank-grade AES-256 encryption for all documentation storage. Telemetry data is pushed through secure web-sockets to ensure maximum security."
            />
            <FAQItem
              q="Can I add multiple vehicles?"
              a="Yes, you can register and oversee unlimited vehicles. The system automatically provisions customized templates depending on whether the vehicle is for commercial or domestic use."
            />
          </div>
        </div>
      </section>

      {/* Contact Form Section ("Get in Touch") */}
      <section id="contact" className="py-24 md:py-32 bg-[#030107] border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">Start Today</span>
              <h2 className="text-4xl md:text-6xl font-serif font-light mb-6 leading-tight">Let&apos;s build your <br className="hidden sm:inline" />dashboard</h2>
              <p className="text-sm text-slate-400 mb-12 leading-relaxed max-w-md">
                Configure your vehicle fleet or personal dashboard templates with our technical experts. Submit details to get in touch.
              </p>

              <div className="space-y-6 text-slate-300">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="block text-white font-bold text-xs uppercase tracking-wider mb-0.5">Office Address</span>
                    <span className="text-xs text-slate-400">Sector 14, Gurugram, Haryana, India</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="block text-white font-bold text-xs uppercase tracking-wider mb-0.5">Email Support</span>
                    <span className="text-xs text-slate-400">support@vehiclehub.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-white/5 p-8 rounded-none">
              <h3 className="text-lg font-serif font-light mb-6 text-white">Send a Message</h3>
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-900/40 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-xs"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full bg-slate-900/40 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-xs"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">What are you configuring?</label>
                  <select
                    className="w-full bg-slate-900/40 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-xs"
                  >
                    <option value="personal">Individual Vehicle Dashboard</option>
                    <option value="fleet">Enterprise Fleet Management</option>
                    <option value="eco">Eco Metrics Monitor</option>
                    <option value="towing">Emergency Breakdown Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Message Description</label>
                  <textarea
                    required
                    className="w-full bg-slate-900/40 border border-white/10 rounded-none px-4 py-3 text-white focus:outline-none focus:border-primary transition-all h-28 text-xs resize-none"
                    placeholder="How can our setup team help you?"
                  ></textarea>
                </div>
                <Button className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-bold rounded-none text-xs tracking-widest uppercase transition-all cursor-pointer">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-16 border-t border-white/5 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Vehicle Hub Logo" className="h-6 object-contain" />
          </div>
          <div className="text-[10px] font-medium tracking-wider uppercase">
            &copy; {new Date().getFullYear()} Vehicle Hub. Crafted in style.
          </div>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Developer API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
