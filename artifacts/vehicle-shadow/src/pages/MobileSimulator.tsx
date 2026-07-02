import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Home, MapPin, Wrench, Shield, Camera, Phone, ArrowLeft, ChevronRight,
  Wifi, Battery, Signal, User, CheckCircle, Calendar, AlertCircle, Plus,
  Search, Gauge, Compass, Snowflake, Droplet, Sparkles, Bell, RefreshCw, Eye,
  X, Car, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

type MobileTab = "home" | "gps" | "workshops" | "documents";
type MobileVehicle = "i20" | "swift" | "tata";

export default function MobileSimulator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Mobile App state
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [selectedVehicle, setSelectedVehicle] = useState<MobileVehicle>("i20");
  const [sosActive, setSosActive] = useState(false);
  const [sosTimer, setSosTimer] = useState(5);
  const [mechanicAssigned, setMechanicAssigned] = useState(false);

  // Document Lockbox state
  const [showCamera, setShowCamera] = useState(false);
  const [scanningDoc, setScanningDoc] = useState(false);
  const [scannedDocs, setScannedDocs] = useState<Array<{ name: string; date: string; status: string }>>([
    { name: "Insurance Certificate", date: "Expiry: Oct 2026", status: "Verified" },
    { name: "PUC Pollution Certificate", date: "Expiry: 14 Days", status: "Action Required" }
  ]);

  // GoMechanic Estimates
  const [searchVal, setSearchVal] = useState("");
  const brandMultipliers = { i20: 1.15, swift: 1.0, tata: 1.45 };
  const vehicleNames = { i20: "Hyundai i20", swift: "Swift Dzire", tata: "TATA Prima Truck" };

  const services = [
    { icon: Wrench, title: "Periodic Servicing", base: 1999, tag: "Essential" },
    { icon: Snowflake, title: "AC Repair & Oil", base: 1499, tag: "40% OFF" },
    { icon: Droplet, title: "Premium Car Spa", base: 999, tag: "Popular" }
  ];

  // SOS Countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosActive && sosTimer > 0) {
      timer = setTimeout(() => setSosTimer(sosTimer - 1), 1000);
    } else if (sosActive && sosTimer === 0) {
      setMechanicAssigned(true);
      toast({
        title: "SOS Alert Dispatched",
        description: "Emergency support partner GoMechanic Sector 14 has assigned mechanic Ramesh Kumar.",
        variant: "destructive"
      });
    }
    return () => clearTimeout(timer);
  }, [sosActive, sosTimer]);

  // Simulated Document Capture
  const handleCaptureDocument = () => {
    setScanningDoc(true);
    setTimeout(() => {
      setScanningDoc(false);
      setShowCamera(false);
      setScannedDocs((prev) => [
        { name: "Registration Certificate (RC)", date: "Uploaded: Today", status: "Verified" },
        ...prev
      ]);
      toast({
        title: "Document Verified",
        description: "RC Uploaded successfully to secure Ministry database.",
        duration: 3500
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#06030b] text-white flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Header Panel */}
      <header className="border-b border-white/5 bg-[#06030b]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Back to Web Home</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Vehicle Shadow Logo" className="h-8 object-contain" />
          </div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 border border-primary/20">
            Companion Mobile App
          </div>
        </div>
      </header>

      {/* Main split dashboard content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-12 items-center w-full">
        {/* Left Explanation Column */}
        <div className="lg:col-span-7 space-y-8 lg:pr-8">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4 block">Interactive Live Preview</span>
            <h1 className="text-4xl sm:text-6xl font-serif font-light text-white tracking-tight leading-tight">
              Test drive our <br />
              <span className="italic font-light text-primary">mobile experience</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mt-6">
              Welcome to the Vehicle Shadow mobile simulator. Interact with the phone mockup on the right to navigate the companion app in real-time. Feel the responsive tabs, scan simulations, GPS coordinates, and breakdown dispatch logs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            {[
              {
                title: "1-Tap SOS Dispatch",
                desc: "Hit the emergency SOS button on the home screen to test our instant workshop breakdown dispatcher countdown."
              },
              {
                title: "Document Camera Scanner",
                desc: "Go to Lockbox, click 'Add Document' to trigger a mock scanner capture simulation that syncs your RC database."
              },
              {
                title: "GoMechanic Estimates",
                desc: "Select different vehicle parameters to witness service costs change dynamically according to model multipliers."
              },
              {
                title: "Live GPS Telemetry Map",
                desc: "Explore real-time location coordinate updates, speed dial graphs, and engine thermal readings."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-950 border border-white/5 p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-none flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ready to deploy this layout?</h4>
              <p className="text-xs text-slate-400 mt-1">Get custom builds for Android & iOS built for your requirements.</p>
            </div>
            <Button
              asChild
              className="rounded-none bg-white hover:bg-neutral-200 text-black font-bold tracking-widest text-[10px] uppercase px-5 h-10 shadow-none border-none transition-all cursor-pointer"
            >
              <a href="/#contact">Connect Team</a>
            </Button>
          </div>
        </div>

        {/* Right Phone Mockup Column */}
        <div className="lg:col-span-5 flex justify-center w-full relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] pointer-events-none w-[360px] mx-auto h-[720px]" />

          {/* Smartphone Container */}
          <div className="w-[360px] h-[720px] bg-slate-950 border-[10px] border-slate-900 rounded-[44px] shadow-2xl relative flex flex-col overflow-hidden select-none border-b-[12px] border-t-[12px]">
            {/* Speaker & Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-b-3xl z-40 flex items-center justify-center gap-3">
              <div className="w-16 h-1 bg-slate-800 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
            </div>

            {/* Mobile Status Bar */}
            <div className="h-11 bg-slate-950 px-6 flex items-center justify-between text-[11px] text-slate-300 font-semibold relative z-30 pt-2">
              <span>15:58</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 text-emerald-400 rotate-90 origin-center ml-0.5" />
              </div>
            </div>

            {/* Screen Content Window */}
            <div className="flex-grow flex flex-col bg-[#05020a] relative overflow-hidden text-white pt-1">
              <AnimatePresence mode="wait">
                {/* Simulated Camera Overlay */}
                {showCamera && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950 z-50 flex flex-col justify-between p-6"
                  >
                    <div className="flex items-center justify-between">
                      <button onClick={() => setShowCamera(false)} className="text-white hover:text-slate-300">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Document Scan</span>
                      <div className="w-5 h-5" />
                    </div>

                    {/* Camera view screen */}
                    <div className="flex-grow my-6 border-2 border-dashed border-white/20 relative flex items-center justify-center overflow-hidden bg-slate-900">
                      {/* Grid scanning effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 animate-pulse" />
                      <div className="absolute w-60 h-40 border border-white/40 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Center RC Certificate Here</span>
                      </div>
                      {scanningDoc && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 gap-3">
                          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Encrypting & Uploading...</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center pb-6">
                      <button
                        onClick={handleCaptureDocument}
                        disabled={scanningDoc}
                        className="w-16 h-16 rounded-full border-4 border-white bg-white/10 active:bg-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-white" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Emergency SOS Overlay */}
                {sosActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-950/95 z-50 flex flex-col justify-between p-8 text-center"
                  >
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSosActive(false);
                          setSosTimer(5);
                          setMechanicAssigned(false);
                        }}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-6 flex-grow flex flex-col justify-center">
                      <div className="w-20 h-20 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center mx-auto animate-pulse">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                      </div>

                      {!mechanicAssigned ? (
                        <>
                          <h3 className="text-2xl font-serif text-white tracking-tight">SOS Alert Pending</h3>
                          <p className="text-xs text-red-300 leading-relaxed max-w-xs mx-auto">
                            Broadcasting coordinates to GoMechanic support network in Sector 14. Dispatching in:
                          </p>
                          <div className="text-6xl font-light font-serif text-white my-4">{sosTimer}s</div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold uppercase tracking-wider text-green-400">Alert Dispatched</h3>
                          <div className="bg-white/5 border border-white/10 p-4 text-left space-y-2.5">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Assigned Workshop Buddy</span>
                            <div className="text-xs font-bold text-white">Ramesh Kumar - GoMechanic Hub</div>
                            <div className="text-[10px] text-slate-400">Distance: 0.8 km • ETA: 8 minutes</div>
                          </div>
                          <p className="text-[10px] text-red-300">A call will be placed from support to confirm your coordinates.</p>
                        </div>
                      )}
                    </div>

                    <div className="pb-8">
                      <Button
                        onClick={() => {
                          setSosActive(false);
                          setSosTimer(5);
                          setMechanicAssigned(false);
                        }}
                        className="rounded-none bg-white hover:bg-neutral-200 text-black font-bold tracking-widest text-[10px] uppercase w-full h-11 border-none shadow-none cursor-pointer"
                      >
                        Cancel Alert
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Screens Router */}
              <div className="flex-grow px-5 overflow-y-auto pb-4">
                {/* 1. HOME SCREEN */}
                {activeTab === "home" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    {/* User Header */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          RS
                        </div>
                        <div>
                          <span className="text-xs font-bold block">Rahul Sharma</span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest">Premium Account</span>
                        </div>
                      </div>
                      <Bell className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Active Vehicle Switcher Card */}
                    <div className="bg-slate-950 border border-white/5 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Active Vehicle</span>
                        <div className="flex gap-1.5">
                          {(["i20", "swift", "tata"] as MobileVehicle[]).map((v) => (
                            <button
                              key={v}
                              onClick={() => setSelectedVehicle(v)}
                              className={`w-6 h-6 text-[9px] font-bold border rounded-none transition-all flex items-center justify-center cursor-pointer ${
                                selectedVehicle === v ? "bg-white text-black border-white" : "bg-transparent text-slate-400 border-white/10"
                              }`}
                            >
                              {v.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-primary" />
                          <div>
                            <span className="text-sm font-serif font-semibold block text-white">{vehicleNames[selectedVehicle]}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {selectedVehicle === "i20" ? "DL-3C-1234" : selectedVehicle === "swift" ? "HR-26-8899" : "UP-16-0099"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">Secure</span>
                      </div>
                    </div>

                    {/* Emergency SOS Launch Button */}
                    <button
                      onClick={() => setSosActive(true)}
                      className="w-full bg-red-600 hover:bg-red-700 py-3 text-center text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-600/15 cursor-pointer"
                    >
                      Emergency Break Down (SOS)
                    </button>

                    {/* Mini Stats Ribbon */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/5 p-3 flex flex-col justify-between min-h-[72px]">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Health Index</span>
                        <span className="text-lg font-serif font-semibold text-white mt-1">98/100</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 flex flex-col justify-between min-h-[72px]">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Compliance</span>
                        <span className="text-lg font-serif font-semibold text-amber-400 mt-1">1 Alert</span>
                      </div>
                    </div>

                    {/* Cost Trend area chart */}
                    <div className="bg-slate-950 border border-white/5 p-4 space-y-3">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Running Costs (Last 6 Months)</span>
                      <div className="h-16 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { val: 120 }, { val: 180 }, { val: 90 }, { val: 240 }, { val: 130 }, { val: 160 }
                          ]}>
                            <Area type="monotone" dataKey="val" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={1.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. GPS TELEMETRY SCREEN */}
                {activeTab === "gps" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mt-3 border-b border-white/5 pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Live Coordinates</h4>
                      <Compass className="w-4 h-4 text-primary animate-pulse" />
                    </div>

                    {/* Animated Mock Map */}
                    <div className="w-full h-32 bg-slate-900 border border-white/10 flex flex-col justify-between p-3 relative overflow-hidden">
                      {/* grid pattern */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
                      {/* Pulse point */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 animate-ping absolute -inset-1.5" />
                        <div className="w-3 h-3 rounded-full bg-primary relative" />
                      </div>

                      <div className="relative z-10 flex justify-between items-start w-full">
                        <span className="text-[8px] bg-slate-950/80 px-2 py-0.5 font-bold uppercase tracking-wider text-white">Live Tracking</span>
                        <span className="text-[8px] bg-slate-950/80 px-2 py-0.5 font-bold uppercase tracking-wider text-emerald-400">Moving</span>
                      </div>
                      <div className="relative z-10 text-[9px] font-mono text-slate-400">
                        28.4595° N, 77.0266° E • Gurugram Sec 14
                      </div>
                    </div>

                    {/* Speedometer and metrics */}
                    <div className="bg-slate-950 border border-white/5 p-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Velocity</span>
                        <span className="text-2xl font-serif text-white">42 km/h</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Engine temp</span>
                        <span className="text-2xl font-serif text-white">88°C</span>
                      </div>
                      <div className="border-t border-white/5 pt-3">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Fuel Level</span>
                        <span className="text-sm font-semibold text-white">72% Remaining</span>
                      </div>
                      <div className="border-t border-white/5 pt-3">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Daily Run</span>
                        <span className="text-sm font-semibold text-white">18.4 km</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. WORKSHOPS SCREEN */}
                {activeTab === "workshops" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mt-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Car Service estimates</h4>
                      <span className="text-[9px] uppercase font-bold text-red-500 bg-red-600/10 px-2 py-0.5">GoMechanic Est.</span>
                    </div>

                    {/* Estimator target banner */}
                    <div className="bg-red-600/5 border border-red-500/10 p-3 text-xs">
                      <span className="text-[9px] text-slate-400 block mb-0.5">ESTIMATE FOR VEHICLE</span>
                      <span className="font-bold text-white uppercase">{vehicleNames[selectedVehicle]}</span>
                    </div>

                    {/* Workshop Estimates list */}
                    <div className="space-y-2.5">
                      {services.map((srv, idx) => {
                        const estPrice = Math.round(srv.base * brandMultipliers[selectedVehicle]);
                        return (
                          <div
                            key={idx}
                            className="bg-slate-950 border border-white/5 p-3.5 flex items-center justify-between hover:border-red-500/35 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-slate-300">
                                <srv.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold block text-white">{srv.title}</span>
                                <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider">{srv.tag}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-white block">₹{estPrice}</span>
                              <button
                                className="text-[9px] uppercase font-bold text-slate-400 hover:text-white"
                                onClick={() => {
                                  toast({
                                    title: "Service Booked",
                                    description: `Booked ${srv.title} for ${vehicleNames[selectedVehicle]} on Mobile simulator.`,
                                    duration: 3000
                                  });
                                }}
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 4. DOCUMENTS SCREEN */}
                {activeTab === "documents" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mt-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Document Locker</h4>
                      <button
                        onClick={() => setShowCamera(true)}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer hover:bg-primary/90 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scanned Docs list */}
                    <div className="space-y-2.5">
                      {scannedDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-white/5 p-3.5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <div>
                              <span className="text-xs font-bold block text-slate-100">{doc.name}</span>
                              <span className="text-[9px] text-slate-400">{doc.date}</span>
                            </div>
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                            doc.status === "Verified"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Trigger simulated camera */}
                    <div
                      onClick={() => setShowCamera(true)}
                      className="border border-dashed border-white/10 p-6 text-center cursor-pointer hover:border-primary/40 transition-colors flex flex-col items-center gap-2"
                    >
                      <Camera className="w-6 h-6 text-slate-400" />
                      <span className="text-xs text-slate-300 font-semibold">Scan & Add Registration (RC)</span>
                      <span className="text-[9px] text-slate-500">Scan via phone camera simulator</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Tab Navigation Bar */}
              <div className="h-16 border-t border-white/5 flex items-center justify-around bg-slate-950/80 backdrop-blur-md relative z-20 pb-2">
                {[
                  { tab: "home", icon: Home, label: "Home" },
                  { tab: "gps", icon: MapPin, label: "Live GPS" },
                  { tab: "workshops", icon: Wrench, label: "Workshops" },
                  { tab: "documents", icon: Shield, label: "Lockbox" }
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as MobileTab);
                      // Reset overlays if tab switches
                      setSosActive(false);
                      setShowCamera(false);
                    }}
                    className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-all ${
                      activeTab === item.tab ? "text-primary scale-105" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Home indicator bar */}
              <div className="h-1 bg-slate-950 flex items-center justify-center pb-2">
                <div className="w-28 h-1 bg-slate-800 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
