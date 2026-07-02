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


// Types for GoMechanic section
type BrandType = "Maruti" | "Hyundai" | "Tata" | "Mahindra" | "Honda" | "Toyota";

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


  // GoMechanic Section States
  const [selectedBrand, setSelectedBrand] = useState<BrandType>("Hyundai");
  const [serviceSearch, setServiceSearch] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [workshopResults, setWorkshopResults] = useState<Array<{ name: string; distance: string; rating: string }>>([]);
  const [searchingWorkshops, setSearchingWorkshops] = useState(false);



  // Smooth scroll handler
  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
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

  // GoMechanic brand estimates multipliers
  const brandMultipliers: Record<BrandType, number> = {
    Maruti: 1.0,
    Hyundai: 1.12,
    Tata: 1.2,
    Mahindra: 1.35,
    Honda: 1.25,
    Toyota: 1.45
  };

  const servicesData = [
    {
      icon: Gauge,
      title: "Periodic Car Services",
      desc: "Full engine oil replacement, filter cleaning, cabin checks, and coolant top-up.",
      basePrice: 1999,
      tag: "Essential Service",
      category: "periodic"
    },
    {
      icon: Snowflake,
      title: "Smart AC Repair",
      desc: "AC gas charging, cooling test, condenser cleaning, and cabin filter replacement.",
      basePrice: 1499,
      tag: "45% OFF Today",
      category: "ac"
    },
    {
      icon: Zap,
      title: "Batteries & Tyres",
      desc: "Genuine Exide/Amaron replacements, wheel balancing, and tire rotations.",
      basePrice: 3299,
      tag: "Free Installation",
      category: "batteries"
    },
    {
      icon: Droplet,
      title: "Premium Car Spa",
      desc: "Deep dry cleaning, interior detailing, Teflon coating, and scratch wax treatment.",
      basePrice: 999,
      tag: "Popular SPA",
      category: "cleaning"
    },
    {
      icon: Wrench,
      title: "Dent & Paint Services",
      desc: "Dent removal, premium panel painting, exact shade match warranty.",
      basePrice: 2899,
      tag: "OEM Approved",
      category: "paint"
    },
    {
      icon: AlertCircle,
      title: "Brakes & Suspension",
      desc: "Disc turning, brake pad replacement, and shock absorber suspension tune-ups.",
      basePrice: 1799,
      tag: "Safety Check Included",
      category: "brakes"
    }
  ];

  // Workshop Search Simulation
  const handleWorkshopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    setSearchingWorkshops(true);
    setWorkshopResults([]);

    setTimeout(() => {
      setSearchingWorkshops(false);
      setWorkshopResults([
        {
          name: `GoMechanic Prime Workshop - Sec 14, Gurugram`,
          distance: "0.8 km away",
          rating: "4.8 ★"
        },
        {
          name: `GoMechanic Elite Motors - DLF Phase 3, Gurugram`,
          distance: "2.4 km away",
          rating: "4.7 ★"
        },
        {
          name: `GoMechanic Premium Care - Udyog Vihar, Gurugram`,
          distance: "3.1 km away",
          rating: "4.9 ★"
        }
      ]);
      toast({
        title: "Workshops Found",
        description: `Discovered 3 certified workshops matching location: ${pinCode}`,
        duration: 3000
      });
    }, 1200);
  };



  // Filtered services
  const filteredServices = servicesData.filter(
    (service) =>
      service.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      service.desc.toLowerCase().includes(serviceSearch.toLowerCase())
  );

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
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#templates" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#contact" onClick={handleGetStartedClick} className="hover:text-white transition-colors">Contact</a>
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
              <a href="#contact" onClick={handleGetStartedClick}>Get Started</a>
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
                <a href="#contact" onClick={handleGetStartedClick}>Get Started</a>
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

      {/* GoMechanic-style Workshop Services Section */}
      <section id="services" className="py-24 md:py-32 bg-[#030107] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-red-500 tracking-widest uppercase mb-4 block">Certified Smart Workshops</span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mb-6 text-white tracking-tight">
              Workshop & Mechanic Services
            </h2>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              Premium, hassle-free car servicing. Select your brand, view real-time estimates, find certified GoMechanic-level workshops, and secure your booking.
            </p>
          </div>

          {/* Interactive Car Brand Selector */}
          <div className="mb-12">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-6">Select Your Vehicle Brand</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {(["Maruti", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota"] as BrandType[]).map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    toast({
                      title: `Selected Brand: ${brand}`,
                      description: `Estimate prices updated dynamically for your ${brand}.`,
                      duration: 2500
                    });
                  }}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all rounded-none cursor-pointer ${
                    selectedBrand === brand
                      ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/15"
                      : "bg-transparent text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Service Search Bar */}
          <div className="max-w-xl mx-auto mb-16 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="Search car services, e.g., AC oil, Wheel Alignment, Teflon..."
              className="w-full bg-slate-950 border border-white/10 px-12 py-4 text-sm text-white focus:outline-none focus:border-red-600 transition-all rounded-none placeholder-slate-500"
            />
            {serviceSearch && (
              <button
                onClick={() => setServiceSearch("")}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* GoMechanic Services Estimate Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, idx) => {
                // Calculate dynamic price based on multiplier
                const calculatedPrice = Math.round(service.basePrice * brandMultipliers[selectedBrand]);
                return (
                  <motion.div
                    key={service.category}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-slate-950 border border-white/5 p-8 flex flex-col justify-between hover:border-red-600/30 transition-all duration-300 rounded-none relative overflow-hidden"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-red-600/10 text-red-500 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      {service.tag}
                    </div>

                    <div>
                      <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 mb-6 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                        <service.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-serif font-light text-slate-100 mb-3">{service.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-6">{service.desc}</p>
                    </div>

                    <div className="border-t border-white/5 pt-6 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Estimated Price ({selectedBrand})</span>
                        <span className="text-xl font-serif text-white font-semibold">₹{calculatedPrice.toLocaleString("en-IN")}</span>
                      </div>
                      <Button
                        asChild
                        className="rounded-none bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest text-[10px] uppercase px-4 h-9 shadow-none border-none transition-all cursor-pointer"
                      >
                        <a href="#contact" onClick={handleGetStartedClick}>Book Service</a>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredServices.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 border border-dashed border-white/10 text-sm">
                No matching vehicle services found. Try searching for something else.
              </div>
            )}
          </div>

          {/* GoMechanic Promises / Assurances */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 border-y border-white/5 py-12 bg-white/[0.01]">
            {[
              { icon: Truck, title: "Free Pick-up & Drop", desc: "Contactless doorstep pick-up & delivery service within hours." },
              { icon: Shield, title: "100% Genuine Spares", desc: "Every part comes direct from authorized OEM/OES catalogs." },
              { icon: Clock, title: "1000km/1 Month Warranty", desc: "Uncompromised service backup & support warranty on repairs." },
              { icon: Sparkles, title: "Service Buddy Assigned", desc: "Real-time updates, photos, and direct chat on your dashboard." }
            ].map((prop, idx) => (
              <div key={idx} className="flex gap-4 p-2">
                <div className="flex-shrink-0 w-10 h-10 bg-white/5 flex items-center justify-center text-red-500">
                  <prop.icon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">{prop.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Workshop Finder Widget */}
          <div className="bg-slate-950 border border-white/5 p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-xl font-serif font-light text-white mb-2">Find a GoMechanic Certified Hub</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your city name or pin code to view certified, smart-diagnostic partner workshops active in your locality.
                </p>
              </div>

              <form onSubmit={handleWorkshopSearch} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter City or Pin Code (e.g. 122001)"
                    className="flex-grow bg-slate-900 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-red-600 transition-all rounded-none placeholder-slate-500"
                  />
                  <Button
                    type="submit"
                    className="rounded-none bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest text-[10px] uppercase px-5 h-11 shadow-none border-none transition-all cursor-pointer flex-shrink-0"
                    disabled={searchingWorkshops}
                  >
                    {searchingWorkshops ? "Searching..." : "Find Workshop"}
                  </Button>
                </div>

                {/* Search Results Display */}
                <AnimatePresence>
                  {workshopResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-2 border-t border-white/5 pt-4 mt-4"
                    >
                      {workshopResults.map((workshop, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs bg-white/5 p-3 border border-white/5 hover:border-red-600/20 transition-all"
                        >
                          <div>
                            <span className="font-semibold text-slate-200 block">{workshop.name}</span>
                            <span className="text-[10px] text-slate-400">{workshop.distance}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-500 font-bold uppercase tracking-wider text-[9px] bg-red-500/10 px-2 py-0.5">{workshop.rating}</span>
                            <button
                              className="text-white hover:text-red-500 text-[10px] uppercase font-bold tracking-widest"
                              onClick={() => {
                                toast({
                                  title: "Workshop Selected",
                                  description: `Assigned workshop for your next service booking.`,
                                  duration: 3000
                                });
                              }}
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
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
