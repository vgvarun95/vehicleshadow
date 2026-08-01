import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { api, type Part, type Garage, type Booking, type GpsVehicle as ApiGpsVehicle, type GpsTrip, type GpsAlert, type Geofence, type Licence as ApiLicence, type Vehicle as ApiVehicle } from "@/lib/api";
import {
  Car, ShoppingBag, Wrench, MapPin, Bell, LogOut,
  Package, Star, Truck, Clock, Navigation,
  Phone, User, Calendar, ChevronRight, Gauge, Zap,
  AlertTriangle, ChevronDown, Search, X, SlidersHorizontal,
  CheckCircle2, Droplets, Wind, ShieldCheck, Paintbrush2,
  Settings, Sparkles, Flame, BadgeCheck, ArrowRight, Timer, Banknote,
  Wifi, WifiOff, BatteryFull, Signal, Milestone, Route,
  LocateFixed, Shield, TriangleAlert, History, Map,
  ChevronUp, Activity, Lock, Unlock, Share2, RefreshCw, ShieldAlert,
  Video, CreditCard, Plus, Play, Pause, Download, Trash2, Camera, Tv
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VehicleTab from "./VehicleTab";
import { LICENCES, VEHICLES, type Challan } from "@/data/mockData";

type Tab = "vehicle" | "fasttag" | "mall" | "mechanic" | "dashcam" | "gps";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "vehicle",   label: "Your Dashboard", icon: Car },
  { id: "fasttag",   label: "FASTag",        icon: Banknote },
  { id: "mall",      label: "Vehicle mall",   icon: ShoppingBag },
  { id: "mechanic",  label: "Mechanic support", icon: Wrench },
  { id: "dashcam",   label: "Dash CAM",       icon: Video },
  { id: "gps",       label: "Find you vehicle", icon: MapPin },
];

/* ---- Spare Parts Mall ---- */

const CAR_DATA: Record<string, Record<string, string[]>> = {
  "Maruti Suzuki": {
    "Swift":    ["LXi","VXi","ZXi","ZXi+","AMT"],
    "Alto K10": ["STD","LXi","VXi","VXi+"],
    "Baleno":   ["Sigma","Delta","Zeta","Alpha","Alpha+"],
    "Ertiga":   ["LXi","VXi","ZXi","ZXi+"],
    "WagonR":   ["LXi","VXi","ZXi","ZXi AMT"],
  },
  "Honda": {
    "Activa 6G": ["STD","DLX","OBD2"],
    "City":      ["SV","V","VX","ZX"],
    "Amaze":     ["E","S","V","VX"],
    "Shine":     ["CB Shine","CB Shine SP"],
  },
  "Hyundai": {
    "i20":     ["Era","Magna","Sportz","Asta","Asta(O)"],
    "Creta":   ["E","EX","S","SX","SX(O)"],
    "Venue":   ["E","S","S+","SX","SX(O)"],
    "Verna":   ["EX","S","SX","SX(O)"],
  },
  "Tata": {
    "Nexon":    ["XE","XM","XMA","XT","XZ","XZ+"],
    "Altroz":   ["XE","XM","XT","XZ","XZ+"],
    "Punch":    ["Pure","Adventure","Accomplished","Creative"],
    "Tiago":    ["XE","XM","XT","XZ","XZ+"],
  },
  "Bajaj": {
    "Pulsar 150": ["STD","ABS"],
    "Pulsar NS200":["STD","ABS"],
    "Platina":    ["100","110 H-Gear"],
    "Dominar 400":["STD","ABS"],
  },
};

const CATEGORY_DATA: Record<string, string[]> = {
  "Engine":             ["Engine Oil","Air Filter","Oil Filter","Spark Plugs","Pistons","Gasket Set","Timing Chain","Fuel Injector"],
  "Brakes":             ["Brake Pads","Brake Disc","Brake Drums","Brake Fluid","Brake Cable","Brake Shoe","ABS Sensor"],
  "Electrical":         ["LED Headlight","Tail Light","Horn","Battery","Alternator","Starter Motor","Fuse Box","Wiring Harness"],
  "Suspension":         ["Shock Absorber","Spring","Control Arm","Ball Joint","Tie Rod","Steering Rack","Wheel Bearing"],
  "Body & Exterior":    ["Bonnet","Door Panel","Bumper","Side Mirror","Windshield","Wiper Blades","Alloy Wheels","Mudguard"],
  "Filters & Fluids":   ["Engine Oil 5W-40","Coolant","Power Steering Fluid","Brake Fluid","AC Refrigerant","Fuel Filter"],
  "Transmission":       ["Clutch Plate","Pressure Plate","Gear Shift Cable","Drive Shaft","CV Joint","Gear Oil"],
};

const ALL_PARTS = [
  { name:"Front Brake Pads Set",   partBrand:"Bosch",   price: 1299, mrp: 1599, rating:4.8, tag:"Bestseller", cat:"Brakes",           subCat:"Brake Pads",      carBrand:"Maruti Suzuki", model:"Swift",    variant:"ZXi",   oeNumber:"BP-88120-SZ",  origin:"aftermarket", delivery:"Tomorrow", stock:"In Stock" },
  { name:"Engine Air Filter",      partBrand:"K&N",     price: 849,  mrp: 999,  rating:4.6, tag:"Genuine",    cat:"Filters & Fluids", subCat:"Air Filter",      carBrand:"Honda",         model:"City",     variant:"VX",    oeNumber:"AF-32104-HC",  origin:"aftermarket", delivery:"In 2 Days", stock:"In Stock" },
  { name:"LED Headlight Bulb Kit", partBrand:"Philips", price: 2199, mrp: 2799, rating:4.9, tag:"Top Rated",  cat:"Electrical",       subCat:"LED Headlight",   carBrand:"Hyundai",       model:"Creta",    variant:"SX",    oeNumber:"LH-99210-CR",  origin:"aftermarket", delivery:"Tomorrow", stock:"Only 2 left" },
  { name:"Wiper Blade Pair",       partBrand:"Bosch",   price: 499,  mrp: 649,  rating:4.5, tag:"Genuine",    cat:"Body & Exterior",  subCat:"Wiper Blades",    carBrand:"Tata",          model:"Nexon",    variant:"XZ",    oeNumber:"WP-55410-NX",  origin:"aftermarket", delivery:"Tomorrow", stock:"In Stock" },
  { name:"Engine Oil 5W-40 (4L)",  partBrand:"Castrol", price: 1799, mrp: 2199, rating:4.7, tag:"Bestseller", cat:"Filters & Fluids", subCat:"Engine Oil 5W-40",carBrand:"Maruti Suzuki", model:"Baleno",   variant:"Zeta",  oeNumber:"EO-5W40-CS",   origin:"aftermarket", delivery:"In 3 Days", stock:"In Stock" },
  { name:"Spark Plugs Set of 4",   partBrand:"NGK",     price: 699,  mrp: 850,  rating:4.6, tag:"Genuine",    cat:"Engine",           subCat:"Spark Plugs",     carBrand:"Honda",         model:"Activa 6G",variant:"DLX",   oeNumber:"SP-62402-NG",  origin:"aftermarket", delivery:"Tomorrow", stock:"In Stock" },
  { name:"Shock Absorber Pair",    partBrand:"Monroe",  price: 3499, mrp: 4299, rating:4.7, tag:"Top Rated",  cat:"Suspension",       subCat:"Shock Absorber",  carBrand:"Hyundai",       model:"i20",      variant:"Asta",  oeNumber:"SA-77820-i2",  origin:"aftermarket", delivery:"In 2 Days", stock:"Only 4 left" },
  { name:"Clutch Plate Kit",       partBrand:"Valeo",   price: 4199, mrp: 5199, rating:4.5, tag:"Genuine",    cat:"Transmission",     subCat:"Clutch Plate",    carBrand:"Tata",          model:"Altroz",   variant:"XZ+",   oeNumber:"CP-10492-AT",  origin:"aftermarket", delivery:"Tomorrow", stock:"In Stock" },
  { name:"Alternator 12V",         partBrand:"Denso",   price: 5999, mrp: 7499, rating:4.8, tag:"OEM Grade",  cat:"Electrical",       subCat:"Alternator",      carBrand:"Bajaj",         model:"Pulsar 150",variant:"ABS",  oeNumber:"AL-99302-BJ",  origin:"aftermarket", delivery:"In 4 Days", stock:"In Stock" },
  { name:"OEM Front Brake Caliper Assembly", partBrand:"Maruti Suzuki", price: 3499, mrp: 3899, rating:4.9, tag:"100% Genuine", cat:"Brakes", subCat:"Brake Disc", carBrand:"Maruti Suzuki", model:"Swift", variant:"ZXi", oeNumber:"OE-48130-M75J0", origin:"oem", delivery:"Tomorrow", stock:"In Stock" },
  { name:"OEM Spark Plug Set", partBrand:"Honda GP", price: 1199, mrp: 1299, rating:4.8, tag:"100% Genuine", cat:"Engine", subCat:"Spark Plugs", carBrand:"Honda", model:"City", variant:"VX", oeNumber:"OE-12201-97201", origin:"oem", delivery:"In 2 Days", stock:"In Stock" },
  { name:"OEM Engine Oil Filter", partBrand:"Hyundai Gen", price: 399, mrp: 450, rating:4.7, tag:"100% Genuine", cat:"Filters & Fluids", subCat:"Oil Filter", carBrand:"Hyundai", model:"Creta", variant:"SX", oeNumber:"OE-26300-35505", origin:"oem", delivery:"Tomorrow", stock:"In Stock" },
];

function DropdownSelect({ label, value, options, onChange, disabled = false }:
  { label:string; value:string; options:string[]; onChange:(v:string)=>void; disabled?:boolean }) {
  return (
    <div className="flex-1 min-w-[130px]">
      <label className="text-[10px] text-muted-foreground font-medium mb-1 block">{label}</label>
      <div className="relative">
        <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          className="w-full appearance-none bg-muted border border-border rounded-xl px-3 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary/60 cursor-pointer pr-7 disabled:opacity-40 disabled:cursor-not-allowed">
          <option value="">{disabled ? "Select above first" : `All ${label}s`}</option>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"/>
      </div>
    </div>
  );
}

const POPULAR_CATEGORIES = [
  { id: "Engine", name: "Engine Parts", icon: Settings },
  { id: "Brakes", name: "Brake System", icon: ShieldCheck },
  { id: "Electrical", name: "Electricals", icon: Zap },
  { id: "Suspension", name: "Suspension", icon: Milestone },
  { id: "Body & Exterior", name: "Body Parts", icon: Car },
  { id: "Filters & Fluids", name: "Filters & Fluids", icon: Droplets },
  { id: "Transmission", name: "Transmission", icon: SlidersHorizontal }
];

const POPULAR_BRANDS = [
  { name: "Bosch", logoText: "BS" },
  { name: "Castrol", logoText: "CS" },
  { name: "Philips", logoText: "PH" },
  { name: "NGK", logoText: "NK" },
  { name: "Monroe", logoText: "MN" },
  { name: "Valeo", logoText: "VL" },
  { name: "Denso", logoText: "DN" },
  { name: "Maruti Suzuki", logoText: "MS" }
];

function MallTab() {
  const [carBrand,  setCarBrand]  = useState("");
  const [model,     setModel]     = useState("");
  const [variant,   setVariant]   = useState("");
  const [broadCat,  setBroadCat]  = useState("");
  const [subCat,    setSubCat]    = useState("");
  const [cart,      setCart]      = useState<Set<number>>(new Set());
  const [apiParts,  setApiParts]  = useState<Part[] | null>(null);
  const [partsLoading, setPartsLoading] = useState(false);
  const [cartLoading,  setCartLoading]  = useState<number | null>(null);

  // Boodmo custom states
  const [searchType, setSearchType] = useState<"car" | "vin" | "part">("car");
  const [vinNumber, setVinNumber] = useState("");
  const [vinVerified, setVinVerified] = useState<string | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);
  const [partNumberSearch, setPartNumberSearch] = useState("");
  const [textQuery, setTextQuery] = useState("");
  const [qualityFilter, setQualityFilter] = useState<"all" | "oem" | "aftermarket">("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("");
  const [selectedSchematicPart, setSelectedSchematicPart] = useState<number | null>(null);

  useEffect(() => {
    setPartsLoading(true);
    api.parts.list({
      brand:       carBrand   || undefined,
      carModel:    model      || undefined,
      category:    broadCat   || undefined,
      subCategory: subCat     || undefined,
    }).then(p => setApiParts(p)).catch(() => setApiParts(null)).finally(() => setPartsLoading(false));
  }, [carBrand, model, broadCat, subCat]);

  async function handleAddToCart(partId: number, idx: number) {
    setCartLoading(idx);
    try {
      await api.cart.add(partId);
      setCart(prev => new Set([...prev, idx]));
    } catch {
      setCart(prev => new Set([...prev, idx]));
    } finally {
      setCartLoading(null);
    }
  }

  function handleVinSearch() {
    setVinError(null);
    setVinVerified(null);
    const v = vinNumber.trim().toUpperCase();
    if (!v) return;
    if (v.length < 5) {
      setVinError("Please enter at least 5 characters");
      return;
    }
    setVinVerified("VIN Verified: Maruti Suzuki Swift (2021) ZXi");
    setCarBrand("Maruti Suzuki");
    setModel("Swift");
    setVariant("ZXi");
  }

  function handlePartNumberSearch() {
    if (!partNumberSearch.trim()) return;
    setTextQuery(partNumberSearch.trim());
  }

  const models   = carBrand ? Object.keys(CAR_DATA[carBrand] || {}) : [];
  const variants = model && carBrand ? (CAR_DATA[carBrand]?.[model] || []) : [];
  const subCats  = broadCat ? (CATEGORY_DATA[broadCat] || []) : [];

  function clearCarFilter()  { setCarBrand(""); setModel(""); setVariant(""); setVinVerified(null); setVinNumber(""); }
  function clearCatFilter()  { setBroadCat(""); setSubCat(""); setSelectedSchematicPart(null); }
  function clearAllFilters() {
    clearCarFilter();
    clearCatFilter();
    setTextQuery("");
    setPartNumberSearch("");
    setQualityFilter("all");
    setSelectedBrandFilter("");
  }

  const activeFilters = !!(carBrand || model || variant || broadCat || subCat || textQuery || selectedBrandFilter || qualityFilter !== "all" || selectedSchematicPart !== null);

  const displayParts = apiParts ?? ALL_PARTS.filter(p => {
    const carOk = (!carBrand || p.carBrand===carBrand) && (!model || p.model===model) && (!variant || p.variant===variant);
    if (!carOk) return false;

    const catOk = (!broadCat || p.cat===broadCat) && (!subCat || p.subCat===subCat);
    if (!catOk) return false;

    if (textQuery) {
      const q = textQuery.toLowerCase();
      const pName = p.name.toLowerCase();
      const pBrand = p.partBrand.toLowerCase();
      const pOe = p.oeNumber.toLowerCase();
      if (!pName.includes(q) && !pBrand.includes(q) && !pOe.includes(q)) {
        return false;
      }
    }

    if (qualityFilter !== "all" && p.origin !== qualityFilter) {
      return false;
    }

    if (selectedBrandFilter && p.partBrand !== selectedBrandFilter) {
      return false;
    }

    return true;
  });

  const filtered = displayParts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-foreground">Spare Parts Mall</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3"/> 100% Genuine
            </span>
          </div>
          <p className="text-muted-foreground text-sm">India's Premium Automotive Parts Marketplace</p>
        </div>
        {activeFilters && (
          <button onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 w-fit cursor-pointer">
            <X className="w-3.5 h-3.5"/> Clear All Filters
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl p-5 space-y-5 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Part Name, OEM Part Number, or Brand (e.g. Brake Pads, Bosch, OE-48130)..."
            value={textQuery}
            onChange={e => setTextQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-950 focus:outline-none focus:border-primary/60 placeholder:text-slate-400 shadow-2xs"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400"/>
          {textQuery && (
            <button onClick={() => setTextQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
              <X className="w-4 h-4"/>
            </button>
          )}
        </div>

        <div className="flex border-b border-slate-100">
          {[
            { id: "car", label: "Select Vehicle", icon: Car },
            { id: "vin", label: "VIN Search", icon: Search },
            { id: "part", label: "Part Number Search", icon: SlidersHorizontal }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSearchType(t.id as any)}
                className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold transition-all relative cursor-pointer ${
                  searchType === t.id ? "text-primary" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {searchType === t.id && (
                  <motion.div layoutId="searchTypeUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          {searchType === "car" && (
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <DropdownSelect label="Brand"   value={carBrand} options={Object.keys(CAR_DATA)}
                  onChange={v=>{ setCarBrand(v); setModel(""); setVariant(""); }}/>
                <DropdownSelect label="Model"   value={model}    options={models}   disabled={!carBrand}
                  onChange={v=>{ setModel(v); setVariant(""); }}/>
                <DropdownSelect label="Variant" value={variant}  options={variants} disabled={!model}
                  onChange={setVariant}/>
              </div>
            </div>
          )}

          {searchType === "vin" && (
            <div className="space-y-3">
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Enter 17-digit VIN Code (e.g. VIN-SAMPLE-MZ-Swift21)..."
                  value={vinNumber}
                  onChange={e => setVinNumber(e.target.value.toUpperCase().slice(0, 17))}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-950 focus:outline-none focus:border-primary/60 tracking-wider placeholder:text-slate-400 uppercase shadow-2xs"
                />
                <Button onClick={handleVinSearch} className="rounded-xl text-xs h-9.5 px-4 bg-primary hover:bg-primary/90">
                  Verify VIN
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Tip: Try pasting sample VIN: <span onClick={() => setVinNumber("VIN-SAMPLE-MZ-Swift21")} className="text-primary cursor-pointer hover:underline font-mono">VIN-SAMPLE-MZ-Swift21</span>
              </p>

              {vinVerified && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 max-w-md animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0"/>
                  <span className="text-xs text-green-800 font-semibold">{vinVerified}</span>
                </div>
              )}
              {vinError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 max-w-md animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0"/>
                  <span className="text-xs text-red-800 font-semibold">{vinError}</span>
                </div>
              )}
            </div>
          )}

          {searchType === "part" && (
            <div className="space-y-3">
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Enter OEM / Manufacturer Part No. (e.g. BP-88120-SZ)..."
                  value={partNumberSearch}
                  onChange={e => setPartNumberSearch(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-950 focus:outline-none focus:border-primary/60 tracking-wider placeholder:text-slate-400 uppercase shadow-2xs"
                />
                <Button onClick={handlePartNumberSearch} className="rounded-xl text-xs h-9.5 px-4 bg-primary hover:bg-primary/90">
                  Find Part
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Tip: Try searching for: <span onClick={() => setPartNumberSearch("BP-88120-SZ")} className="text-primary cursor-pointer hover:underline font-mono">BP-88120-SZ</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl p-5 grid lg:grid-cols-12 gap-6 items-center shadow-sm">
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-100 relative min-h-[220px]">
          <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10px] font-bold text-primary/80 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse"/> Interactive Schematic Catalog (Exploded View)
          </div>

          <svg className="w-full max-w-[340px] h-[180px] text-slate-400 mt-4" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="70" y="40" width="80" height="90" rx="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="70" y1="70" x2="150" y2="70" stroke="currentColor" strokeWidth="1" />
            <line x1="70" y1="100" x2="150" y2="100" stroke="currentColor" strokeWidth="1" />
            <rect x="85" y="50" width="50" height="15" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="110" y1="65" x2="110" y2="120" stroke="currentColor" strokeWidth="2.5" />
            <line x1="110" y1="20" x2="110" y2="40" stroke="currentColor" strokeWidth="2" />
            <circle cx="110" cy="20" r="3" fill="currentColor" />
            <circle cx="280" cy="95" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="280" cy="95" r="30" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
            <path d="M245 70 C245 50, 275 40, 290 40 C305 40, 315 50, 315 75 L300 75 C300 60, 290 55, 280 55 C270 55, 260 60, 260 70 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M330 40 L350 40 M340 40 L340 130 M330 130 L350 130" stroke="currentColor" strokeWidth="1.5" />
            <path d="M330 55 Q350 62 330 70 Q350 78 330 85 Q350 92 330 100 Q350 107 330 115" stroke="currentColor" strokeWidth="2" fill="none" />
            
            <circle cx="110" cy="30" r="14" fill="#7c3aed" fillOpacity="0.2" className="cursor-pointer" />
            <circle cx="260" cy="55" r="14" fill="#7c3aed" fillOpacity="0.2" className="cursor-pointer" />
            <circle cx="110" cy="95" r="14" fill="#7c3aed" fillOpacity="0.2" className="cursor-pointer" />
            <circle cx="340" cy="85" r="14" fill="#7c3aed" fillOpacity="0.2" className="cursor-pointer" />
          </svg>

          <button onClick={() => { setSelectedSchematicPart(1); setBroadCat("Engine"); setSubCat("Spark Plugs"); }} className={`absolute top-[10%] left-[23%] px-1.5 py-0.5 rounded bg-primary text-white text-[9px] font-bold flex items-center gap-0.5 border border-white/10 shadow transition-all cursor-pointer ${selectedSchematicPart===1?"scale-115 bg-green-600 ring-2 ring-white/50":""}`}>① Spark Plugs</button>
          <button onClick={() => { setSelectedSchematicPart(2); setBroadCat("Brakes"); setSubCat("Brake Pads"); }} className={`absolute top-[18%] left-[54%] px-1.5 py-0.5 rounded bg-primary text-white text-[9px] font-bold flex items-center gap-0.5 border border-white/10 shadow transition-all cursor-pointer ${selectedSchematicPart===2?"scale-115 bg-green-600 ring-2 ring-white/50":""}`}>② Brake Pads</button>
          <button onClick={() => { setSelectedSchematicPart(3); setBroadCat("Filters & Fluids"); setSubCat("Engine Oil 5W-40"); }} className={`absolute top-[48%] left-[23%] px-1.5 py-0.5 rounded bg-primary text-white text-[9px] font-bold flex items-center gap-0.5 border border-white/10 shadow transition-all cursor-pointer ${selectedSchematicPart===3?"scale-115 bg-green-600 ring-2 ring-white/50":""}`}>③ Engine Oil</button>
          <button onClick={() => { setSelectedSchematicPart(4); setBroadCat("Suspension"); setSubCat("Shock Absorber"); }} className={`absolute top-[40%] left-[73%] px-1.5 py-0.5 rounded bg-primary text-white text-[9px] font-bold flex items-center gap-0.5 border border-white/10 shadow transition-all cursor-pointer ${selectedSchematicPart===4?"scale-115 bg-green-600 ring-2 ring-white/50":""}`}>④ Shock Absorbers</button>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <p className="text-sm font-bold text-slate-900">Schematic Catalog Filter</p>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">Select a numbered component on the mechanical blueprint view to quickly filter the catalog parts listing below.</p>

          {selectedSchematicPart ? (
            <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl space-y-1.5 shadow-2xs">
              <p className="text-xs font-bold text-primary flex items-center gap-1">
                <BadgeCheck className="w-4 h-4"/> Active Schematic Target:
              </p>
              <p className="text-xs font-bold text-slate-900">
                {selectedSchematicPart === 1 ? "Engine Parts -> Spark Plugs" :
                 selectedSchematicPart === 2 ? "Brake System -> Brake Pads Set" :
                 selectedSchematicPart === 3 ? "Filters & Fluids -> Engine Oil" :
                 "Suspension -> Shock Absorber Pair"}
              </p>
              <button onClick={() => { setSelectedSchematicPart(null); setBroadCat(""); setSubCat(""); }} className="text-[10px] text-primary hover:underline font-bold mt-1 block cursor-pointer">Clear Schematic Selection</button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
              No schematic component selected. Click on diagram numbers to test.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Browse Categories</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {POPULAR_CATEGORIES.map(c => {
            const CatIcon = c.icon;
            const isSelected = broadCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  if (isSelected) {
                    setBroadCat("");
                    setSubCat("");
                  } else {
                    setBroadCat(c.id);
                    setSubCat("");
                  }
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/15 border-primary text-primary scale-102"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-2xs"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${isSelected ? "bg-primary/15" : "bg-slate-50"}`}>
                  <CatIcon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-slate-500"}`} />
                </div>
                <span className="text-[10px] font-bold truncate w-full">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Brands</p>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {POPULAR_BRANDS.map(b => {
            const isSelected = selectedBrandFilter === b.name;
            return (
              <button
                key={b.name}
                onClick={() => setSelectedBrandFilter(isSelected ? "" : b.name)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-2xs"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold uppercase ${isSelected ? "bg-white/20" : "bg-slate-100"}`}>
                  {b.logoText}
                </div>
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex gap-1.5">
          {[
            { id: "all", label: "All Parts" },
            { id: "oem", label: "Genuine OEM" },
            { id: "aftermarket", label: "Premium Aftermarket" }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setQualityFilter(opt.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                qualityFilter === opt.id
                  ? "bg-primary/15 border border-primary/25 text-primary"
                  : "text-slate-600 hover:text-slate-900 border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-bold">
          Showing {filtered.length} matching spare parts
        </div>
      </div>

      {activeFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active:</span>
          {[
            carBrand ? `Car: ${carBrand}` : "",
            model ? `Model: ${model}` : "",
            variant ? `Variant: ${variant}` : "",
            broadCat ? `Cat: ${broadCat}` : "",
            subCat ? `Subcat: ${subCat}` : "",
            textQuery ? `Search: "${textQuery}"` : "",
            selectedBrandFilter ? `Brand: ${selectedBrandFilter}` : "",
            qualityFilter !== "all" ? `Origin: ${qualityFilter.toUpperCase()}` : ""
          ].filter(Boolean).map((v,i)=>(
            <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {v}
            </span>
          ))}
        </div>
      )}

      {partsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => {
          const isApiPart = apiParts !== null;
          
          const name  = isApiPart ? (p as Part).name  : (p as any).name;
          const brand = isApiPart ? (p as Part).brand : (p as any).partBrand;
          const cat   = isApiPart ? (p as Part).category : (p as any).cat;
          const model2= isApiPart ? (p as Part).carModel : (p as any).model;
          const partId= isApiPart ? (p as Part).id : i;

          const rawPrice = isApiPart ? Number((p as Part).price) : (p as any).price;
          const formattedPrice = `₹${rawPrice.toLocaleString('en-IN')}`;

          const rawMrp = isApiPart ? Math.round(rawPrice * 1.25) : ((p as any).mrp || Math.round(rawPrice * 1.25));
          const formattedMrp = `₹${rawMrp.toLocaleString('en-IN')}`;

          const discountPct = Math.round(((rawMrp - rawPrice) / rawMrp) * 100);

          const oeNumber = isApiPart ? `OE-${(p as Part).id}-PART` : ((p as any).oeNumber || "OE-PART");
          const origin = isApiPart ? "oem" : ((p as any).origin || "aftermarket");
          const delivery = isApiPart ? "Tomorrow" : ((p as any).delivery || "In 2 Days");
          const stockLabel = isApiPart ? ((p as Part).stock > 0 ? "In Stock" : "Out of Stock") : ((p as any).stock || "In Stock");

          return (
          <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden" data-testid={`card-part-${i}`}>
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                  origin === "oem" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"
                }`}>
                  {origin === "oem" ? "Genuine OEM" : "OES Aftermarket"}
                </span>
                {discountPct > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm mb-1 truncate" title={name}>{name}</h4>
            <p className="text-slate-500 text-xs mb-2">by <span className="font-bold text-slate-800">{brand}</span></p>

            <p className="text-[10px] text-slate-600 font-mono bg-slate-50 rounded px-2 py-1 mb-3 w-fit border border-slate-100">
              Part No: {oeNumber}
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{cat}</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{model2}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-lg font-black text-slate-900">{formattedPrice}</p>
                  {rawMrp > rawPrice && (
                    <p className="text-xs text-slate-400 line-through">{formattedMrp}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-0.5">
                    <Truck className="w-2.5 h-2.5 text-primary"/> {delivery}
                  </span>
                  <span className={`text-[9px] font-bold ${
                    stockLabel.includes("left") ? "text-amber-400" : "text-green-600"
                  }`}>
                    · {stockLabel}
                  </span>
                </div>
              </div>

              <Button size="sm"
                onClick={() => isApiPart ? handleAddToCart(partId, i) : setCart(prev => new Set([...prev, i]))}
                disabled={cartLoading === i}
                className={`rounded-xl text-[11px] font-bold px-3 py-1 transition-all cursor-pointer ${
                  cart.has(i)
                    ? "bg-green-600 hover:bg-green-700 text-white border border-green-500/20"
                    : "bg-primary hover:bg-primary/90 text-white shadow shadow-primary/20 hover:shadow-primary/40"
                }`}
                data-testid={`button-add-to-cart-${i}`}>
                {cartLoading === i ? <span className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin"/> : cart.has(i) ? "✓ Added" : "Add to Cart"}
              </Button>
            </div>
          </motion.div>
          );
        })}
      </div>
      )}

      {filtered.length===0 && activeFilters && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-slate-900/20">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40"/>
          <p className="text-sm font-bold text-foreground">No parts found matching filters</p>
          <p className="text-xs text-muted-foreground mt-1.5">Try clearing filters or search term to see other items</p>
        </div>
      )}
    </div>
  );
}

/* ---- Mechanic Support ---- */
const MECH_CAR_BRANDS = ["Maruti Suzuki","Honda","Hyundai","Tata","Bajaj","Toyota","Mahindra","Kia","MG","Volkswagen"];
const MECH_SERVICES = [
  { id:"periodic",  label:"Periodic Service",    icon:Settings,     price:"From ₹1,999", time:"3–4 hrs", popular:true  },
  { id:"ac",        label:"AC Repair",           icon:Wind,         price:"From ₹799",   time:"1–2 hrs", popular:true  },
  { id:"brakes",    label:"Brakes & Suspension", icon:ShieldCheck,  price:"From ₹599",   time:"1–3 hrs", popular:false },
  { id:"denting",   label:"Denting & Painting",  icon:Paintbrush2,  price:"From ₹2,499", time:"2–5 days",popular:false },
  { id:"cleaning",  label:"Car Cleaning",        icon:Sparkles,     price:"From ₹399",   time:"2–3 hrs", popular:false },
  { id:"tyres",     label:"Tyres & Wheels",      icon:Car,          price:"From ₹1,299", time:"1 hr",    popular:false },
  { id:"battery",   label:"Battery Replacement", icon:Zap,          price:"From ₹2,499", time:"30 min",  popular:false },
  { id:"inspect",   label:"Car Inspection",      icon:BadgeCheck,   price:"From ₹299",   time:"1 hr",    popular:false },
];

const SERVICE_DETAIL: Record<string, { includes:string[]; discount?:string }> = {
  periodic: { includes:["Engine oil change","Oil filter","Air filter check","Brake fluid top-up","21-point inspection"], discount:"20% OFF" },
  ac:       { includes:["Gas refill","Condenser cleaning","Cabin filter check","Performance test"], discount:"15% OFF" },
  brakes:   { includes:["Brake pad check","Rotor inspection","Caliper check","Test drive"],          discount:undefined },
  denting:  { includes:["Panel beating","Primer coat","Base coat","Clear coat","Polishing"],         discount:undefined },
  cleaning: { includes:["Exterior foam wash","Interior vacuum","Dashboard wipe","Glass cleaning"],   discount:"10% OFF" },
  tyres:    { includes:["Tyre fitting","Wheel balancing","Nitrogen fill","Rotation"],                discount:undefined },
  battery:  { includes:["Old battery removal","New battery fitting","Terminal cleaning","Test"],     discount:undefined },
  inspect:  { includes:["125-point inspection","Engine check","Electricals check","Report"],         discount:"Free Report" },
};

const GARAGES = [
  { name:"GoMechanic Pro — Sector 14", distance:"0.8 km", rating:4.9, reviews:1240, available:true,  slots:["10:00 AM","12:30 PM","3:00 PM"], tags:["ISO Certified","Pickup & Drop"] },
  { name:"Singh Motors Workshop",      distance:"1.4 km", rating:4.7, reviews:876,  available:true,  slots:["11:00 AM","2:00 PM"],           tags:["CCTV Monitoring"] },
  { name:"Delhi Auto Care",            distance:"2.1 km", rating:4.5, reviews:534,  available:false, slots:[],                               tags:["Body & Paint Specialist"] },
  { name:"QuickFix Garage — DLF",     distance:"2.9 km", rating:4.6, reviews:389,  available:true,  slots:["9:30 AM","1:30 PM","4:30 PM"],  tags:["Pickup & Drop","Express Bay"] },
];

function MechanicTab() {
  const [carBrand,     setCarBrand]     = useState("");
  const [serviceType,  setServiceType]  = useState("");
  const [phone,        setPhone]        = useState("");
  const [quoted,       setQuoted]       = useState(false);
  const [activeSection,setActiveSection]= useState<"services"|"works"|"garages"|"reviews">("services");
  const [expandedSvc,  setExpandedSvc]  = useState<string|null>(null);
  const [expandedGarage,setExpandedGarage]=useState<number|null>(null);
  const [bookedSlot,   setBookedSlot]   = useState<string|null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingDone,    setBookingDone]    = useState(false);
  const [apiGarages,   setApiGarages]   = useState<Garage[] | null>(null);

  useEffect(() => {
    api.garages.list().then(g => setApiGarages(g)).catch(() => setApiGarages(null));
  }, []);

  async function handleBookSlot(garageName: string, slot: string) {
    if (bookingLoading) return;
    setBookingLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.bookings.add({ serviceType: serviceType || "Periodic Service", bookingDate: today, timeSlot: slot, garageName });
      setBookingDone(true);
    } catch {
      setBookingDone(true);
    } finally {
      setBookingLoading(false);
    }
  }

  const sections = ["services","works","garages","reviews"] as const;
  const sectionLabels: Record<typeof sections[number],string> = {
    services:"Our Services", works:"How It Works", garages:"Nearby Garages", reviews:"Ratings & Reviews"
  };

  const displayGarages = apiGarages ?? GARAGES;

  return (
    <div className="space-y-6">

      {/* ── Hero / Quote Form ── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm min-h-[200px]">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"linear-gradient(rgba(0,0,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,1) 1px,transparent 1px)",backgroundSize:"36px 36px"}}/>
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-primary/10 rounded-full blur-[80px]"/>
        <div className="absolute -bottom-16 right-0 w-56 h-56 bg-blue-600/5 rounded-full blur-[60px]"/>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 p-6">
          {/* Left — headline + stats */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-3 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-primary animate-pulse"/> Certified Workshops Gurgaon
              </span>
              <h2 className="text-2xl font-extrabold text-slate-950 leading-tight">Expert Car Services<br/>at <span className="text-glow text-primary">40% Less Cost</span></h2>
              <p className="text-slate-650 text-sm mt-2 font-medium">Get instant transparent quotes · Free doorstep pickup & drop · 100% Genuine Spare Parts</p>
            </div>
            <div className="flex gap-6 mt-6 flex-wrap">
              {[
                { value:"4.8/5",   sub:"120k+ Reviews",    icon:Star  },
                { value:"2M+",     sub:"Happy Customers",  icon:User  },
                { value:"150+",    sub:"Service Points",   icon:Wrench},
                { value:"40%",     sub:"Cheaper than Dealer",icon:Banknote},
              ].map(({value,sub,icon:Icon},i)=>(
                <div key={i} className="text-left bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-2xs">
                  <p className="text-base font-extrabold text-slate-950 flex items-center gap-1"><Icon className="w-4 h-4 text-primary"/>{value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Quote form */}
          <div className="md:w-76 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex-shrink-0 shadow-md">
            <p className="font-bold text-slate-950 text-sm">Calculate Service Price</p>

            <div className="relative">
              <select value={carBrand} onChange={e=>setCarBrand(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-950 focus:outline-none focus:border-primary/60 cursor-pointer pr-7">
                <option value="">Select Your Car Make</option>
                {MECH_CAR_BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"/>
            </div>

            <div className="relative">
              <select value={serviceType} onChange={e=>setServiceType(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-950 focus:outline-none focus:border-primary/60 cursor-pointer pr-7">
                <option value="">Select Service Type</option>
                {MECH_SERVICES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"/>
            </div>

            <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder="Enter Mobile Number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-primary/60"/>

            <Button onClick={()=>setQuoted(true)} disabled={!carBrand||!serviceType||phone.length<6}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold text-xs py-2.5 cursor-pointer">
              Get Free Transparent Estimate
            </Button>

            <AnimatePresence>
              {quoted && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1"/>
                  <p className="text-xs font-semibold text-green-800">Quote sent to {phone}!</p>
                  <p className="text-[10px] text-green-700 mt-0.5">Our mechanic support team will call you shortly</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── SOS Pulse Banner ── */}
      <motion.div whileHover={{scale:1.01}} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl p-4.5 cursor-pointer hover:border-red-350 hover:shadow-md hover:shadow-red-500/5 transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center relative">
            <AlertTriangle className="w-6 h-6 text-red-600"/>
            <div className="absolute inset-0 rounded-xl bg-red-500/10 animate-ping opacity-70"/>
          </div>
          <div>
            <p className="font-bold text-slate-950">Roadside Breakdown / SOS Emergency?</p>
            <p className="text-slate-650 text-xs font-medium">Pothole help, towing assistance, flat tyre, battery jumpstart dispatched in 25 min</p>
          </div>
        </div>
        <Button className="bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold flex-shrink-0 gap-2 cursor-pointer shadow-md shadow-red-500/10">
          <Phone className="w-4 h-4"/> SOS Dispatch
        </Button>
      </motion.div>

      {/* ── Section Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sections.map(s=>(
          <button key={s} onClick={()=>setActiveSection(s)}
            className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all ${activeSection===s?"bg-primary text-white border-primary":"bg-slate-100 text-slate-650 border-slate-200 hover:border-primary/45 hover:text-slate-950 font-medium"}`}>
            {sectionLabels[s]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OUR SERVICES ── */}
        {activeSection==="services" && (
          <motion.div key="services" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">
            {/* Popular badge row */}
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary"/>
              <span className="text-sm font-bold text-slate-950">Car Services in Gurgaon</span>
              <span className="text-xs text-slate-500 font-semibold ml-auto">150+ services available</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MECH_SERVICES.map((svc,i)=>{
                const det = SERVICE_DETAIL[svc.id];
                const isOpen = expandedSvc===svc.id;
                return (
                  <motion.div key={svc.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                    className={`rounded-2xl border bg-white overflow-hidden transition-all cursor-pointer ${isOpen?"border-primary/50 shadow-sm":"border-slate-200 hover:border-primary/30 shadow-2xs"}`}
                    onClick={()=>setExpandedSvc(isOpen?null:svc.id)}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <svc.icon className="w-5 h-5 text-primary"/>
                        </div>
                        {svc.popular && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Popular</span>}
                        {det.discount && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 border border-green-500/20">{det.discount}</span>}
                      </div>
                      <p className="font-extrabold text-sm text-slate-950">{svc.label}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-black text-primary">{svc.price}</span>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5"><Timer className="w-2.5 h-2.5"/>{svc.time}</span>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}}
                          className="overflow-hidden border-t border-slate-150 bg-slate-50/50">
                          <div className="p-4 space-y-2">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">What's Included</p>
                            {det.includes.map((item,j)=>(
                              <div key={j} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0"/>
                                <span className="text-xs text-slate-900 font-medium">{item}</span>
                              </div>
                            ))}
                            <Button className="w-full mt-2 rounded-xl bg-primary hover:bg-primary/90 text-xs h-8">
                              Book This Service
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── HOW IT WORKS ── */}
        {activeSection==="works" && (
          <motion.div key="works" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">How GoMechanic Works?</h3>
              <p className="text-slate-500 text-sm mt-0.5 font-medium">3 simple steps to a serviced car</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step:"01", title:"Select Service", desc:"Choose from 150+ car services. Get transparent pricing upfront — no hidden charges.", icon:Search,   color:"from-blue-50/70 to-blue-100/30 border-blue-200" },
                { step:"02", title:"Schedule Pickup", desc:"Our expert picks up your car from your doorstep at your preferred time slot.",     icon:Truck,    color:"from-primary/10 to-purple-100/30 border-purple-200" },
                { step:"03", title:"Car Returned",    desc:"Get your car back with a detailed service report, 1-year warranty on service.",     icon:CheckCircle2,color:"from-green-50/70 to-green-100/30 border-green-200"},
              ].map(({step,title,desc,icon:Icon,color},i)=>(
                <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                  className={`relative rounded-2xl border bg-gradient-to-br ${color} p-6 overflow-hidden shadow-2xs`}>
                  <div className="absolute top-4 right-4 text-5xl font-black text-slate-900/5 select-none">{step}</div>
                  <div className="w-12 h-12 rounded-xl bg-white/60 border border-slate-200 flex items-center justify-center mb-4 shadow-3xs">
                    <Icon className="w-6 h-6 text-primary"/>
                  </div>
                  <p className="font-extrabold text-slate-950 mb-2">{title}</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:"Free Pickup & Drop",    icon:Truck       },
                { label:"1 Year Warranty",       icon:BadgeCheck  },
                { label:"Genuine Spare Parts",   icon:Package     },
                { label:"Real-Time Tracking",    icon:Navigation  },
              ].map(({label,icon:Icon},i)=>(
                <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0"/>
                  <span className="text-xs font-bold text-slate-900">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── NEARBY GARAGES ── */}
        {activeSection==="garages" && (
          <motion.div key="garages" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">Nearby Garages</h3>
              {apiGarages && <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-full">{apiGarages.length} garages found</span>}
            </div>
            {bookingDone && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <BadgeCheck className="w-5 h-5 text-green-600 flex-shrink-0"/>
                <div>
                  <p className="text-sm font-bold text-green-800">Booking Confirmed!</p>
                  <p className="text-xs text-green-700">Our team will contact you shortly.</p>
                </div>
              </div>
            )}
            {displayGarages.map((g, i) => {
              const isApi = apiGarages !== null;
              const name     = isApi ? (g as Garage).name    : (g as typeof GARAGES[0]).name;
              const rating   = isApi ? parseFloat((g as Garage).rating) : (g as typeof GARAGES[0]).rating;
              const phone    = isApi ? (g as Garage).phone   : "+91 98765 43210";
              const address  = isApi ? `${(g as Garage).address}, ${(g as Garage).city}` : (g as typeof GARAGES[0]).name;
              const tags     = isApi ? (g as Garage).specialties.split(",").map(s => s.trim()).slice(0,2) : (g as typeof GARAGES[0]).tags;
              const slots    = isApi ? [`${(g as Garage).openTime}–${(g as Garage).closeTime}`] : (g as typeof GARAGES[0]).slots;
              const available = isApi ? true : (g as typeof GARAGES[0]).available;
              return (
              <motion.div key={i} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                className={`rounded-2xl border bg-white overflow-hidden transition-all shadow-2xs ${expandedGarage===i?"border-primary/50 shadow-sm":"border-slate-200 hover:border-primary/30"}`}>
                <button onClick={()=>setExpandedGarage(expandedGarage===i?null:i)} className="w-full text-left p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl flex-shrink-0">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-950 text-sm sm:text-base leading-tight">{name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>{rating}</span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400"/>{address}</span>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {tags.map((t,j)=><span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-150">{t}</span>)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${available?"bg-green-50 border-green-200 text-green-700":"bg-slate-100 border-slate-200 text-slate-500"}`}>
                      {available?"Open":"Closed"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expandedGarage===i?"rotate-180":""}`}/>
                  </div>
                </button>
                <AnimatePresence>
                  {expandedGarage===i && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}} className="overflow-hidden border-t border-slate-150 bg-slate-50/50">
                      <div className="p-4 space-y-3">
                        {available && slots.length>0 ? (
                          <>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Available Slots Today</p>
                            <div className="flex gap-2 flex-wrap">
                              {slots.map(slot=>(
                                <button key={slot} onClick={()=>setBookedSlot(bookedSlot===slot?null:slot)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${bookedSlot===slot?"bg-primary text-white border-primary":"bg-white border-slate-200 hover:border-primary/50 text-slate-900 shadow-3xs"}`}>
                                  {slot}
                                </button>
                              ))}
                            </div>
                            {bookedSlot && !bookingDone && (
                              <Button onClick={()=>handleBookSlot(name, bookedSlot)} disabled={bookingLoading}
                                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-sm gap-2">
                                {bookingLoading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : <><BadgeCheck className="w-4 h-4"/> Confirm Booking at {bookedSlot}</>}
                              </Button>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-slate-550 font-medium">No slots available today. <span className="text-primary cursor-pointer hover:underline font-bold">Check tomorrow →</span></p>
                        )}
                        <a href={`tel:${phone}`} className="block">
                          <Button variant="outline" className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5 text-xs gap-2">
                            <Phone className="w-3.5 h-3.5"/> Call Garage
                          </Button>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── RATINGS & REVIEWS ── */}
        {activeSection==="reviews" && (
          <motion.div key="reviews" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-5">
            {/* Overall score */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <div className="flex-1 text-center sm:border-r border-slate-150">
                <p className="text-5xl font-black text-slate-950">4.0</p>
                <div className="flex justify-center gap-0.5 mt-2">
                  {[1,2,3,4].map(s=><Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500"/>)}
                  <Star className="w-4 h-4 text-slate-300"/>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-1.5">Based on 1,50,000+ Reviews</p>
              </div>
              <div className="flex-1 space-y-2 sm:pl-6">
                {[["5 ★",72],[" 4 ★",18],["3 ★",6],["2 ★",3],["1 ★",1]].map(([label,pct])=>(
                  <div key={label as string} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold w-8">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,delay:0.2}}
                        className={`h-full rounded-full ${Number(pct)>50?"bg-green-500":Number(pct)>10?"bg-yellow-500":"bg-red-500"}`}/>
                    </div>
                    <span className="text-xs text-slate-500 font-black w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Review cards */}
            {[
              { name:"Arjun Mehta",   car:"Swift ZXI",   rating:5, comment:"Excellent service! The mechanic was very professional and the car was returned cleaner than when I gave it.", date:"2 days ago" },
              { name:"Priya Sharma",  car:"Creta SX",    rating:4, comment:"Great experience overall. Periodic service done well. Took slightly longer than expected but quality is top notch.", date:"5 days ago" },
              { name:"Vikram Singh",  car:"Activa 6G",   rating:5, comment:"Booked AC repair, they fixed it perfectly. Free pickup and drop is a great feature. Will definitely book again!", date:"1 week ago" },
            ].map((r,i)=>(
              <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{r.name[0]}</div>
                    <div>
                      <p className="font-extrabold text-sm text-slate-950 leading-tight">{r.name}</p>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{r.car}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({length:r.rating}).map((_,j)=><Star key={j} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"/>)}
                  </div>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">"{r.comment}"</p>
                <p className="text-xs text-slate-400 font-semibold mt-2">{r.date}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════
   GPS SYSTEM — VeyronGPS-style dashboard
══════════════════════════════════════════ */

const GPS_VEHICLES = [
  { id:1, name:"Swift ZXI",    number:"DL 01 AB 1234", status:"moving",  speed:48,  signal:4, battery:92, lastUpdate:"Just now",   address:"NH-48, near Rajiv Chowk, Gurgaon",         lat:28.48, lng:77.07 },
  { id:2, name:"Activa 6G",   number:"DL 05 XY 5678", status:"parked",  speed:0,   signal:3, battery:78, lastUpdate:"12 min ago", address:"Cyber Hub, DLF Phase 2, Gurgaon",           lat:28.49, lng:77.09 },
];

const TRIP_HISTORY = [
  { from:"Sector 14, Gurgaon",  to:"DLF Cyber Hub",      start:"9:02 AM",  end:"9:28 AM",  km:"6.2 km",  topSpeed:"63 km/h", idle:"4 min" },
  { from:"DLF Cyber Hub",       to:"Connaught Place, Delhi", start:"11:45 AM",end:"12:38 PM",km:"28.4 km", topSpeed:"82 km/h", idle:"2 min" },
  { from:"Connaught Place",     to:"Sector 14, Gurgaon",  start:"2:18 PM",  end:"3:05 PM",  km:"27.9 km", topSpeed:"78 km/h", idle:"6 min" },
];

const GEOFENCES = [
  { name:"Home Zone",        radius:"200 m", status:"active",   type:"Stay Inside",  lastAlert:"Yesterday 11:30 PM" },
  { name:"Office Area",      radius:"500 m", status:"active",   type:"Stay Inside",  lastAlert:"Today 9:02 AM"      },
  { name:"Restricted Zone",  radius:"100 m", status:"inactive", type:"Stay Outside", lastAlert:"Never"              },
];

const GPS_ALERTS = [
  { type:"Over Speed",    vehicle:"DL 01 AB 1234", detail:"82 km/h on NH-48", time:"Today 11:52 AM", sev:"high"   },
  { type:"Geofence Exit", vehicle:"DL 05 XY 5678", detail:"Left Home Zone",    time:"Today 9:01 AM",  sev:"medium" },
  { type:"Harsh Braking", vehicle:"DL 01 AB 1234", detail:"Near Rajiv Chowk", time:"Today 9:18 AM",  sev:"low"    },
  { type:"Ignition ON",   vehicle:"DL 05 XY 5678", detail:"Cyber Hub",         time:"Today 8:55 AM",  sev:"info"   },
];

const statusColor: Record<string,{dot:string;bg:string;text:string;label:string}> = {
  moving:  { dot:"bg-green-600",  bg:"bg-green-50 border border-green-200",  text:"text-green-700",  label:"Moving"  },
  parked:  { dot:"bg-yellow-500", bg:"bg-yellow-50 border border-yellow-250", text:"text-amber-800", label:"Parked"  },
  idle:    { dot:"bg-blue-500",   bg:"bg-blue-50 border border-blue-200",   text:"text-blue-700",   label:"Idle"    },
  offline: { dot:"bg-slate-500",  bg:"bg-slate-50 border border-slate-200",  text:"text-slate-650",  label:"Offline" },
};

const sevColor: Record<string,string> = {
  high:   "bg-red-50 text-red-700 border-red-200",
  medium: "bg-yellow-50 text-amber-800 border-yellow-200",
  low:    "bg-blue-50 text-blue-700 border-blue-200",
  info:   "bg-slate-50 text-slate-650 border-slate-200",
};

type MiniMapVehicle = { status: string; speed: number; address?: string | null; lastUpdate?: string; lastUpdated?: string | null; lat?: number | string | null; lng?: number | string | null };
/* ── Mini animated map ── */
function MiniMap({ vehicle }: { vehicle: MiniMapVehicle }) {
  const isMoving = vehicle.status === "moving";
  const updateLabel = (vehicle as {lastUpdate?:string}).lastUpdate ?? (vehicle as {lastUpdated?:string|null}).lastUpdated ?? "Just now";
  const latVal = (vehicle as {lat?:number|string|null}).lat ?? "28.4859 N";
  const lngVal = (vehicle as {lng?:number|string|null}).lng ?? "77.0722 E";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 h-64 shadow-2xs">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{backgroundImage:"linear-gradient(rgba(0,0,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,1) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
      
      {/* Concentric radar circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-20 h-20 rounded-full border border-primary/20 animate-pulse" />
        <div className="w-40 h-40 rounded-full border border-primary/15 absolute" />
        <div className="w-60 h-60 rounded-full border border-primary/10 absolute" />
        <div className="w-80 h-80 rounded-full border border-primary/5 absolute" />
      </div>

      {/* Rotating Radar Sweep Line */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        className="absolute w-[300px] h-[300px] top-[calc(50%-150px)] left-[calc(50%-150px)] pointer-events-none opacity-10 origin-center"
        style={{
          background: "conic-gradient(from 0deg, rgba(124,58,237,0.3) 0deg, rgba(124,58,237,0) 90deg, transparent 360deg)"
        }}
      />

      {/* Tech corner readouts */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-none font-mono shadow-3xs">
        <RefreshCw className="w-3 h-3 text-primary animate-spin" style={{ animationDuration: "3s" }}/>
        <span className="text-[9px] text-slate-800 font-extrabold uppercase tracking-wider">{updateLabel}</span>
      </div>

      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-none font-mono shadow-3xs">
        <Signal className="w-3 h-3 text-primary animate-pulse"/>
        <span className="text-[9px] text-slate-600 font-bold">HDOP: 0.82 (3D FIX)</span>
      </div>

      {/* Target coordinates bar */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-2 pointer-events-none font-mono text-left space-y-0.5 shadow-3xs">
        <div className="text-[8px] text-slate-450 uppercase tracking-widest font-bold">Target Telemetry</div>
        <div className="text-[10px] text-primary font-extrabold">LAT: {latVal}</div>
        <div className="text-[10px] text-primary font-extrabold">LNG: {lngVal}</div>
      </div>

      {/* Map center tracking marker */}
      <div className="absolute" style={{left:"50%",top:"50%",transform:"translate(-50%,-50%)"}}>
        <div className="relative flex items-center justify-center">
          {/* Glowing Crosshair circle */}
          <div className="absolute w-8 h-8 rounded-full border border-primary/25 animate-ping" />
          <div className="absolute w-12 h-12 rounded-full border border-dashed border-primary/15" />
          
          {/* Crosshair lines */}
          <div className="absolute w-6 h-0.5 bg-primary/30" />
          <div className="absolute h-6 w-0.5 bg-primary/30" />
          
          {/* Center Pulsing beacon */}
          <motion.div animate={isMoving?{scale:[1,1.2,1]}:{}} transition={{repeat:Infinity,duration:1.6}} className="relative">
            <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${isMoving?"bg-green-500":"bg-yellow-500"}`}/>
            {isMoving && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60"/>}
          </motion.div>
        </div>
      </div>

      {/* Speed dial mockup */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center min-w-[80px] pointer-events-none font-mono font-bold shadow-3xs">
        <Gauge className="w-4 h-4 text-primary mb-1"/>
        <span className="text-sm font-black text-slate-900 leading-none">{vehicle.speed}</span>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider mt-1">KMPH</span>
      </div>

      {/* Address / Location banner */}
      <div className="absolute top-[48%] left-3 max-w-[150px] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2 text-left pointer-events-none shadow-3xs">
        <div className="flex gap-1 items-start">
          <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-slate-700 leading-tight truncate-3-lines font-medium">{vehicle.address}</p>
        </div>
      </div>
    </div>
  );
}

function GpsTab() {
  const [apiVehicles,  setApiVehicles]  = useState<ApiGpsVehicle[] | null>(null);
  const [selectedVeh,  setSelectedVeh]  = useState<typeof GPS_VEHICLES[0] | ApiGpsVehicle>(GPS_VEHICLES[0]);
  const [activeSection,setActiveSection]= useState<"live"|"trips"|"geofence"|"alerts">("live");
  const [immobilized,  setImmobilized]  = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<number|null>(null);
  const [apiTrips,     setApiTrips]     = useState<GpsTrip[] | null>(null);
  const [apiAlerts,    setApiAlerts]    = useState<GpsAlert[] | null>(null);
  const [apiGeofences, setApiGeofences] = useState<Geofence[] | null>(null);

  useEffect(() => {
    api.gps.vehicles().then(vs => {
      setApiVehicles(vs);
      if (vs.length > 0) {
        setSelectedVeh(vs[0]);
        setImmobilized(vs[0].immobilized);
      }
    }).catch(() => setApiVehicles(null));
  }, []);

  useEffect(() => {
    if (!apiVehicles) return;
    const id = (selectedVeh as ApiGpsVehicle).id;
    if (!id) return;
    api.gps.trips(id).then(t => setApiTrips(t)).catch(() => setApiTrips(null));
    api.gps.alerts(id).then(a => setApiAlerts(a)).catch(() => setApiAlerts(null));
    api.gps.geofences(id).then(g => setApiGeofences(g)).catch(() => setApiGeofences(null));
  }, [selectedVeh, apiVehicles]);

  async function handleImmobilize() {
    const id = (selectedVeh as ApiGpsVehicle).id;
    if (!id) { setImmobilized(p => !p); return; }
    try {
      const res = await api.gps.command(id, immobilized ? "mobilize" : "immobilize");
      setImmobilized(res.immobilized);
    } catch { setImmobilized(p => !p); }
  }

  const displayVehicles = apiVehicles ?? GPS_VEHICLES;
  const isApiMode = apiVehicles !== null && apiVehicles.length > 0;

  const vStatus = isApiMode ? (selectedVeh as ApiGpsVehicle).status : (selectedVeh as typeof GPS_VEHICLES[0]).status;
  const movingCount  = isApiMode ? apiVehicles!.filter(v=>v.status==="moving").length  : 1;
  const parkedCount  = isApiMode ? apiVehicles!.filter(v=>v.status==="parked").length  : 1;
  const idleCount    = isApiMode ? apiVehicles!.filter(v=>v.status==="idle").length    : 0;
  const offlineCount = isApiMode ? apiVehicles!.filter(v=>v.status==="offline").length : 0;

  const stats = [
    { label:"Running", count:movingCount,  color:"text-green-400",  bg:"bg-green-500/15",  dot:"bg-green-500"  },
    { label:"Parked",  count:parkedCount,  color:"text-yellow-400", bg:"bg-yellow-500/15", dot:"bg-yellow-500" },
    { label:"Idle",    count:idleCount,    color:"text-blue-400",   bg:"bg-blue-400/15",   dot:"bg-blue-400"   },
    { label:"Offline", count:offlineCount, color:"text-slate-400",  bg:"bg-slate-500/15",  dot:"bg-slate-500"  },
  ];

  const sc = statusColor[vStatus] ?? statusColor["parked"];

  return (
    <div className="space-y-5">

      {/* ── Top status bar ── */}
      <div className="flex gap-2 flex-wrap">
        {stats.map(s=>(
          <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 ${s.bg}`}>
            <div className={`w-2 h-2 rounded-full ${s.dot}`}/>
            <span className={`text-xs font-extrabold ${s.color}`}>{s.count} {s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
          <Activity className="w-3.5 h-3.5 text-primary"/> Live · {displayVehicles.length} vehicles
        </div>
      </div>

      {/* ── Main layout: vehicle list + detail ── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Vehicle list (left) */}
        <div className="lg:w-64 flex-shrink-0 space-y-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">My Vehicles</p>
          {(displayVehicles as (typeof GPS_VEHICLES[0] | ApiGpsVehicle)[]).map(v=>{
            const st = (v as ApiGpsVehicle).status ?? (v as typeof GPS_VEHICLES[0]).status;
            const sc2 = statusColor[st] ?? statusColor["parked"];
            const nm  = (v as ApiGpsVehicle).name ?? (v as typeof GPS_VEHICLES[0]).name;
            const num = (v as ApiGpsVehicle).number ?? (v as typeof GPS_VEHICLES[0]).number;
            const spd = (v as ApiGpsVehicle).speed ?? (v as typeof GPS_VEHICLES[0]).speed;
            return (
              <motion.button key={v.id} onClick={()=>{ setSelectedVeh(v); setImmobilized(!!(v as ApiGpsVehicle).immobilized); }} whileTap={{scale:0.98}}
                className={`w-full text-left p-3 rounded-2xl border transition-all ${selectedVeh.id===v.id?"border-primary/65 bg-primary/5":"border-slate-200 bg-white hover:border-primary/30"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sc2.bg}`}>
                    <Car className={`w-5 h-5 ${sc2.text}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-slate-950 truncate">{nm}</p>
                    <p className="text-[10px] text-slate-550 font-mono font-bold">{num}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${sc2.dot} ${st==="moving"?"animate-pulse":""}`}/>
                      <span className={`text-[10px] font-bold ${sc2.text}`}>{sc2.label}</span>
                      {spd>0 && <span className="text-[10px] text-slate-500 font-semibold">· {spd} km/h</span>}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail panel (right) */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Vehicle header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">{(selectedVeh as ApiGpsVehicle).name ?? (selectedVeh as typeof GPS_VEHICLES[0]).name}</h2>
              <p className="text-xs text-slate-550 font-mono font-bold">{(selectedVeh as ApiGpsVehicle).number ?? (selectedVeh as typeof GPS_VEHICLES[0]).number}</p>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${sc.bg} ${sc.text} border-current/30`}>
              <div className={`w-2 h-2 rounded-full ${sc.dot} ${vStatus==="moving"?"animate-pulse":""}`}/>
              {sc.label}
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {([["live","Live Map",Map],["trips","Trip History",History],["geofence","Geofence",Shield],["alerts","Alerts",TriangleAlert]] as const).map(([id,label,Icon])=>(
              <button key={id} onClick={()=>setActiveSection(id as typeof activeSection)}
                className={`flex items-center gap-1.5 flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-all ${activeSection===id?"bg-primary text-white border-primary shadow-xs":"bg-slate-100 text-slate-650 border-slate-200 hover:border-primary/45 hover:text-slate-950"}`}>
                <Icon className="w-3.5 h-3.5"/>{label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── LIVE MAP ── */}
            {activeSection==="live" && (
              <motion.div key="live" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">
                <MiniMap vehicle={selectedVeh}/>

                {/* Live stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Speed",    value:`${(selectedVeh as ApiGpsVehicle).speed ?? (selectedVeh as typeof GPS_VEHICLES[0]).speed} km/h`, icon:Gauge,      color:"text-primary"  },
                    { label:"GSM",      value:`${(selectedVeh as ApiGpsVehicle).signal ?? (selectedVeh as typeof GPS_VEHICLES[0]).signal}/5`,   icon:Signal,     color:"text-green-600"},
                    { label:"Battery",  value:`${(selectedVeh as ApiGpsVehicle).battery ?? (selectedVeh as typeof GPS_VEHICLES[0]).battery}%`,  icon:BatteryFull,color:"text-blue-600" },
                    { label:"GPS",      value:"Strong",                                                                                          icon:LocateFixed, color:"text-green-600"},
                  ].map(({label,value,icon:Icon,color},i)=>(
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-2xs">
                      <Icon className={`w-4 h-4 mx-auto mb-1.5 ${color}`}/>
                      <p className="font-extrabold text-sm text-slate-950">{value}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Today's summary */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-3 divide-x divide-slate-100 shadow-2xs">
                  {[
                    { label:"Distance Today", value:"62.5 km", icon:Route    },
                    { label:"Total Trips",    value:"3",        icon:Milestone},
                    { label:"Drive Time",     value:"1h 47m",   icon:Clock    },
                  ].map(({label,value,icon:Icon},i)=>(
                    <div key={i} className="text-center px-3">
                      <Icon className="w-4 h-4 text-primary mx-auto mb-1.5"/>
                      <p className="font-black text-base text-slate-950">{value}</p>
                      <p className="text-[10px] text-slate-500 leading-tight font-bold">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Commands */}
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Commands</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleImmobilize}
                      className={`rounded-xl text-xs gap-1.5 ${immobilized?"bg-red-650 hover:bg-red-700":"bg-slate-800 hover:bg-slate-700"} text-white`}>
                      {immobilized ? <><Unlock className="w-3.5 h-3.5"/>Mobilize</> : <><Lock className="w-3.5 h-3.5"/>Immobilize</>}
                    </Button>
                    <Button variant="outline" className="rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/5 gap-1.5">
                      <Share2 className="w-3.5 h-3.5"/> Share Location
                    </Button>
                    <Button variant="outline" className="rounded-xl text-xs border-slate-200 text-slate-700 hover:text-slate-950 gap-1.5">
                      <Navigation className="w-3.5 h-3.5"/> Navigate
                    </Button>
                    <Button variant="outline" className="rounded-xl text-xs border-slate-200 text-slate-700 hover:text-slate-950 gap-1.5">
                      <Phone className="w-3.5 h-3.5"/> Driver SOS
                    </Button>
                  </div>
                  {immobilized && (
                    <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-650 flex-shrink-0"/>
                      <div>
                        <p className="text-xs font-black text-red-750">Vehicle Immobilized</p>
                        <p className="text-[10px] text-red-600 font-semibold">Engine start has been blocked remotely</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── TRIP HISTORY ── */}
            {activeSection==="trips" && (
              <motion.div key="trips" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-950">Trip History</p>
                  <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-full">{(apiTrips ?? TRIP_HISTORY).length} trips</span>
                </div>
                {(apiTrips
                  ? apiTrips.map((t, i) => ({
                      from: t.fromAddress, to: t.toAddress,
                      start: t.startTime, end: t.endTime,
                      km: `${t.distanceKm} km`,
                      topSpeed: `${t.topSpeedKmph} km/h`,
                      idle: `${t.idleMinutes} min`,
                    }))
                  : TRIP_HISTORY
                ).map((t, i)=>(
                  <motion.div key={i} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                    className={`rounded-2xl border bg-white overflow-hidden transition-all shadow-2xs ${expandedTrip===i?"border-primary/40 shadow-sm":"border-slate-200 hover:border-primary/30"}`}>
                    <button onClick={()=>setExpandedTrip(expandedTrip===i?null:i)} className="w-full text-left p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Route className="w-5 h-5 text-primary"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{t.from} → {t.to}</p>
                        <p className="text-xs text-muted-foreground">{t.start} – {t.end}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-extrabold text-primary text-sm">{t.km}</p>
                        {expandedTrip===i ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto mt-1"/> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto mt-1"/>}
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedTrip===i && (
                        <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden border-t border-slate-150">
                          <div className="p-4 grid grid-cols-3 gap-3">
                            {[
                              {label:"Distance",  value:t.km,       icon:Milestone},
                              {label:"Top Speed", value:t.topSpeed, icon:Gauge    },
                              {label:"Idle Time", value:t.idle,     icon:Clock    },
                            ].map(({label,value,icon:Icon},j)=>(
                              <div key={j} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                <Icon className="w-3.5 h-3.5 text-primary mx-auto mb-1"/>
                                <p className="font-bold text-xs text-slate-900">{value}</p>
                                <p className="text-[10px] text-slate-500 font-bold">{label}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── GEOFENCE ── */}
            {activeSection==="geofence" && (
              <motion.div key="geofence" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-950">Geofence Zones</p>
                  <Button size="sm" className="rounded-xl text-xs bg-primary hover:bg-primary/90 h-8 gap-1.5"><Shield className="w-3.5 h-3.5"/> Add Zone</Button>
                </div>
                {/* Map preview */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-150 border border-slate-200 h-40">
                  <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"linear-gradient(rgba(0,0,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,1) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
                    <circle cx="140" cy="80" r="40" fill="#f97316" fillOpacity="0.1" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 3"/>
                    <circle cx="260" cy="70" r="55" fill="#3b82f6" fillOpacity="0.06" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6 3"/>
                    <circle cx="140" cy="80" r="4"  fill="#f97316"/>
                    <circle cx="260" cy="70" r="4"  fill="#3b82f6"/>
                  </svg>
                  <div className="absolute bottom-2 left-3 flex gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-orange-650 font-bold"><div className="w-2 h-2 rounded-full bg-orange-500"/>Home Zone</span>
                    <span className="flex items-center gap-1 text-blue-650 font-bold"><div className="w-2 h-2 rounded-full bg-blue-500"/>Office Area</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {(apiGeofences
                    ? apiGeofences.map(g => ({ name: g.name, type: g.zoneType, radius: `${g.radiusM}m`, status: g.status, lastAlert: g.lastAlert ?? "Never", id: g.id }))
                    : GEOFENCES
                  ).map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/45 transition-all shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.status==="active"?"bg-primary/15":"bg-slate-100"}`}>
                          <Shield className={`w-5 h-5 ${g.status==="active"?"text-primary":"text-slate-500"}`}/>
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-slate-950">{g.name}</p>
                          <p className="text-xs text-slate-700 font-semibold">{g.type} · {g.radius}</p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Last alert: {g.lastAlert}</p>
                        </div>
                      </div>
                      <div onClick={async()=>{ const gid = (g as unknown as {id?:number}).id; if(gid) await api.gps.toggleGeofence(gid); }}
                        className={`w-10 h-5 rounded-full border transition-all cursor-pointer flex items-center px-0.5 ${g.status==="active"?"bg-primary border-primary justify-end":"bg-slate-200 border-slate-350 justify-start"}`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm"/>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── ALERTS ── */}
            {activeSection==="alerts" && (
              <motion.div key="alerts" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-950">Recent Alerts</p>
                  <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-full">{(apiAlerts ?? GPS_ALERTS).length} today</span>
                </div>
                {(apiAlerts
                  ? apiAlerts.map(a => ({ type: a.type, vehicle: a.vehicleNumber, detail: a.detail, time: new Date(a.createdAt).toLocaleTimeString(), sev: a.severity }))
                  : GPS_ALERTS
                ).map((a, i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                    className={`flex items-start gap-3 p-4 rounded-xl border ${sevColor[a.sev] ?? sevColor["info"]}`}>
                    <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-extrabold text-sm">{a.type}</p>
                        <span className="text-[10px] font-mono font-bold text-current/70">{a.vehicle}</span>
                      </div>
                      <p className="text-xs font-semibold opacity-90 mt-0.5">{a.detail}</p>
                      <p className="text-[10px] opacity-80 mt-0.5">{a.time}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---- Fasttag Management ---- */
function FasttagTab({
  selectedVehicle: propSelectedVehicle,
  setSelectedVehicle: propSetSelectedVehicle,
  vehicleSearchQuery: propVehicleSearchQuery,
  setVehicleSearchQuery: propSetVehicleSearchQuery,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
}: any = {}) {
  const [balances, setBalances] = useState<Record<string, number>>({
    "HR26DJ5432": 750.00,
    "MH12AB1234": 200.00
  });
  const [rechargeAmt, setRechargeAmt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState("All");
  const [vehicles, setVehicles] = useState([
    { num: "HR26DJ5432", model: "Maruti Suzuki Swift", status: "Active", ftg: "TAG_99210041" },
    { num: "MH12AB1234", model: "Hyundai Creta", status: "Active", ftg: "TAG_77182049" }
  ]);
  const [rechargeTarget, setRechargeTarget] = useState("HR26DJ5432");
  
  const [txHistory, setTxHistory] = useState([
    { id: "TXN100821", date: "01 Aug 2026, 10:15 AM", plaza: "Kherki Daula Toll Plaza (NH48)", amt: 80.00, status: "Success", vehicle: "HR26DJ5432" },
    { id: "TXN100742", date: "28 Jul 2026, 08:30 AM", plaza: "Yamuna Expressway Plaza", amt: 165.00, status: "Success", vehicle: "HR26DJ5432" },
    { id: "TXN100619", date: "15 Jul 2026, 04:45 PM", plaza: "Mumbai-Pune Expressway Toll", amt: 320.00, status: "Success", vehicle: "MH12AB1234" },
    { id: "TXN100588", date: "09 Jul 2026, 11:20 AM", plaza: "Gurgaon-Delhi Expressway", amt: 40.00, status: "Success", vehicle: "HR26DJ5432" },
    { id: "TXN100412", date: "05 Jul 2026, 02:15 PM", plaza: "Khalapur Toll Plaza (Lonavala)", amt: 230.00, status: "Success", vehicle: "MH12AB1234" },
    { id: "TXN100310", date: "28 Jun 2026, 09:30 AM", plaza: "Pune Ring Road Toll", amt: 55.00, status: "Success", vehicle: "MH12AB1234" },
    { id: "TXN100295", date: "20 Jun 2026, 06:10 PM", plaza: "Kherki Daula Toll Plaza (NH48)", amt: 80.00, status: "Success", vehicle: "HR26DJ5432" }
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localVehicleSearchQuery, setLocalVehicleSearchQuery] = useState("");

  const selectedVehicle = propSelectedVehicle !== undefined ? propSelectedVehicle : localSelectedVehicle;
  const setSelectedVehicle = propSetSelectedVehicle !== undefined ? propSetSelectedVehicle : setLocalSelectedVehicle;
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = propSetSearchQuery !== undefined ? propSetSearchQuery : setLocalSearchQuery;
  const vehicleSearchQuery = propVehicleSearchQuery !== undefined ? propVehicleSearchQuery : localVehicleSearchQuery;
  const setVehicleSearchQuery = propSetVehicleSearchQuery !== undefined ? propSetVehicleSearchQuery : setLocalVehicleSearchQuery;

  // Sync recharge target automatically if a specific active vehicle is selected
  useEffect(() => {
    if (selectedVehicle !== "All") {
      const selected = vehicles.find(v => v.num === selectedVehicle);
      if (selected && selected.status === "Active") {
        setRechargeTarget(selectedVehicle);
      }
    }
  }, [selectedVehicle, vehicles]);

  function handleRecharge(presetAmt?: number) {
    const amt = presetAmt ?? parseFloat(rechargeAmt);
    if (!amt || isNaN(amt) || amt <= 0) return;
    
    const targetVeh = selectedVehicle === "All" ? rechargeTarget : selectedVehicle;
    const targetModel = vehicles.find(v => v.num === targetVeh);
    if (!targetVeh || (targetModel && targetModel.status !== "Active")) {
      setMessage("Cannot recharge: target vehicle is pending activation.");
      setTimeout(() => setMessage(null), 3500);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setBalances(prev => ({
        ...prev,
        [targetVeh]: (prev[targetVeh] ?? 0.00) + amt
      }));
      setTxHistory(prev => [
        {
          id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }),
          plaza: "FASTag Wallet Recharge",
          amt: amt,
          status: "Recharge",
          vehicle: targetVeh
        },
        ...prev
      ]);
      setRechargeAmt("");
      setIsLoading(false);
      setMessage(`Wallet for ${targetVeh} recharged with ₹${amt.toFixed(2)} successfully!`);
      setTimeout(() => setMessage(null), 4000);
    }, 1200);
  }

  function handleApplyNew(vehNum: string) {
    setVehicles(prev => [
      ...prev,
      {
        num: vehNum,
        model: "Applied (Pending Verification)",
        status: "Pending",
        ftg: `TAG_${Math.floor(10000000 + Math.random() * 90000000)}`
      }
    ]);
    setBalances(prev => ({
      ...prev,
      [vehNum]: 0.00
    }));
  }

  function handleAddExisting(vehNum: string) {
    setVehicles(prev => [
      ...prev,
      {
        num: vehNum,
        model: "Added Vehicle",
        status: "Active",
        ftg: `TAG_${Math.floor(10000000 + Math.random() * 90000000)}`
      }
    ]);
    setBalances(prev => ({
      ...prev,
      [vehNum]: 250.00
    }));
    setRechargeTarget(vehNum);
  }

  // Filtered transactions based on selected vehicle and search query
  const filteredTx = txHistory.filter(t => {
    const matchesVehicle = selectedVehicle === "All" || t.vehicle === selectedVehicle;
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return matchesVehicle;

    const matchesSearch = 
      t.plaza.toLowerCase().includes(cleanQuery) ||
      t.id.toLowerCase().includes(cleanQuery) ||
      t.vehicle.toLowerCase().includes(cleanQuery) ||
      t.amt.toString().includes(cleanQuery) ||
      (t.status && t.status.toLowerCase().includes(cleanQuery));

    return matchesVehicle && matchesSearch;
  });

  // Display balance logic
  const displayBalance = selectedVehicle === "All"
    ? Object.values(balances).reduce((sum, b) => sum + b, 0)
    : (balances[selectedVehicle] ?? 0.00);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Apply, Add and Linked Vehicles (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Apply & Add side-by-side row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            
            {/* Apply for New FASTag Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-950 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-primary" /> Apply New
                </h3>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem("vehNum") as HTMLInputElement;
                  const cleanNum = input.value.trim().toUpperCase();
                  if (!cleanNum) return;
                  handleApplyNew(cleanNum);
                  input.value = "";
                  setMessage("FASTag application submitted successfully!");
                  setTimeout(() => setMessage(null), 4000);
                }}
                className="space-y-3"
              >
                <div>
                  <input
                    name="vehNum"
                    type="text"
                    placeholder="Vehicle No."
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary/60 focus:bg-white rounded-xl px-2.5 py-1.5 text-[11px] font-bold outline-none transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl text-[10px] font-extrabold py-1.5 px-3 cursor-pointer"
                >
                  Apply
                </Button>
              </form>
            </div>

            {/* Add Existing FASTag Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-950 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" /> Add Tag
                </h3>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem("vehNum") as HTMLInputElement;
                  const cleanNum = input.value.trim().toUpperCase();
                  if (!cleanNum) return;
                  handleAddExisting(cleanNum);
                  input.value = "";
                  setMessage("FASTag linked successfully!");
                  setTimeout(() => setMessage(null), 4000);
                }}
                className="space-y-3"
              >
                <div>
                  <input
                    name="vehNum"
                    type="text"
                    placeholder="Vehicle No."
                    required
                    className="w-full bg-slate-55 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl px-2.5 py-1.5 text-[11px] font-bold outline-none transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold py-1.5 px-3 cursor-pointer"
                >
                  Add
                </Button>
              </form>
            </div>

          </div>

          {/* Linked Vehicles Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-950 text-base">Linked Vehicles</h3>
              <button
                onClick={() => setSelectedVehicle("All")}
                className={`text-[10px] font-black px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  selectedVehicle === "All"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-650 hover:bg-slate-200"
                }`}
              >
                All Vehicles
              </button>
            </div>
            
            {/* Search Input bar */}
            <div className="relative mb-3.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={vehicleSearchQuery}
                onChange={e => setVehicleSearchQuery(e.target.value)}
                placeholder="Search vehicle..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary/60 focus:bg-white rounded-xl pl-8.5 pr-8 py-1.5 text-[11px] font-bold outline-none transition-all"
              />
              {vehicleSearchQuery && (
                <button
                  type="button"
                  onClick={() => setVehicleSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-755 text-xs font-black cursor-pointer bg-transparent border-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(() => {
                const filteredVehicles = vehicles.filter(v => 
                  v.num.toLowerCase().includes(vehicleSearchQuery.trim().toLowerCase()) ||
                  v.model.toLowerCase().includes(vehicleSearchQuery.trim().toLowerCase())
                );
                return filteredVehicles.length > 0 ? (
                  filteredVehicles.map(v => {
                    const isSelected = selectedVehicle === v.num;
                    return (
                      <div
                        key={v.num}
                        onClick={() => setSelectedVehicle(v.num)}
                        className={`border rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all hover:scale-[1.01] ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/50"
                        }`}
                      >
                        <div>
                          <span className="font-mono text-sm font-black text-slate-950 block">{v.num}</span>
                          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{v.model}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border block mb-1 ${
                            v.status === "Active"
                              ? "bg-emerald-50 border-emerald-150 text-emerald-600"
                              : "bg-yellow-50 border-yellow-150 text-yellow-600"
                          }`}>
                            {v.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono block">{v.ftg}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs font-bold">
                    No matching vehicles found
                  </div>
                );
              })()}
            </div>
          </div>

        </div>

        {/* Right Main Area: Wallet, Recharge & Toll Logs (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Row: Wallet Card and Recharge Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* FASTag Wallet Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-905 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-indigo-950 flex flex-col justify-between min-h-[200px]">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-primary/20 rounded-full blur-3xl" />
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-wider bg-white/10 px-3 py-1 rounded-xl text-white/90">FASTag</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">Active</span>
                </div>
                <CreditCard className="w-8 h-8 text-white/40" />
              </div>
              <div className="my-3 z-10">
                <span className="text-[10px] text-white/60 font-semibold block mb-1">
                  {selectedVehicle === "All" ? "Total Balance (All Vehicles)" : `Wallet Balance (${selectedVehicle})`}
                </span>
                <span className="text-3xl font-black">₹{displayBalance.toFixed(2)}</span>
              </div>
              <div className="z-10 flex items-center justify-between text-[10px] text-white/70 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedVehicle === "All" ? "All Linked Vehicles" : `Vehicle: ${selectedVehicle}`}
                </span>
                <span>HDFC Bank Linked</span>
              </div>
            </div>

            {/* Recharge FASTag Wallet Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <h3 className="font-extrabold text-base text-slate-950 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" /> Recharge Wallet
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Recharge instantly using UPI, NetBanking or Cards.</p>
              </div>

              {message && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-900 rounded-xl p-2.5 text-xs font-bold my-2 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {message}
                </div>
              )}

              {selectedVehicle === "All" ? (
                <div className="mt-3.5 bg-slate-55 border border-slate-150 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-slate-500 block">Select a vehicle from Linked Vehicles to recharge its wallet.</span>
                </div>
              ) : (
                <div className="mt-3.5 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        value={rechargeAmt}
                        onChange={e => setRechargeAmt(e.target.value)}
                        placeholder="Amount"
                        className="w-full bg-slate-50 border border-slate-250 focus:border-primary/60 focus:bg-white rounded-xl pl-6 pr-3 py-2 text-xs font-extrabold outline-none transition-all"
                      />
                    </div>
                    <Button
                      onClick={() => handleRecharge()}
                      disabled={isLoading || !rechargeAmt}
                      className="bg-primary hover:bg-primary/90 rounded-xl text-xs font-extrabold py-2 px-4 cursor-pointer text-white h-full"
                    >
                      {isLoading ? "..." : "Recharge"}
                    </Button>
                  </div>

                  <div className="flex gap-1.5">
                    {[100, 200, 500].map(amt => (
                      <button
                        key={amt}
                        onClick={() => handleRecharge(amt)}
                        disabled={isLoading}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Toll & Recharge Logs Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">Toll & Recharge Logs</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Showing logs for: <span className="font-black text-slate-800">{selectedVehicle === "All" ? "All Vehicles" : selectedVehicle}</span>
                </p>
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredTx.length} Transaction{filteredTx.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Search Input bar */}
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Plaza, TXN ID, Vehicle No., or Status..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary/60 focus:bg-white rounded-xl pl-9 pr-8 py-2 text-xs font-bold outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-750 text-xs font-black cursor-pointer bg-transparent border-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
              {filteredTx.length > 0 ? (
                filteredTx.map((t) => {
                  const isRecharge = t.status === "Recharge";
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-150 bg-slate-50 hover:bg-slate-100/50 transition-all animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isRecharge
                            ? "bg-emerald-50 border-emerald-150 text-emerald-600"
                            : "bg-indigo-50 border-indigo-150 text-indigo-600"
                        }`}>
                          {isRecharge ? <Plus className="w-4.5 h-4.5" /> : <Milestone className="w-4.5 h-4.5" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-950 block">{t.plaza}</span>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                            {t.date} • <span className="font-mono text-[9px] font-black">{t.vehicle}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black block ${isRecharge ? "text-emerald-600" : "text-slate-900"}`}>
                          {isRecharge ? "+" : "-"}₹{t.amt.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{t.id}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 animate-fadeIn">
                  <Milestone className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-xs font-bold">No Transactions Found</p>
                  <p className="text-[10px] opacity-75">No toll debits recorded for this vehicle yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ---- Dash CAM ---- */
function DashcamTab() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [speed, setSpeed] = useState(42);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  // Tick time and mock speed dynamically
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const speedTimer = setInterval(() => {
      if (isPlaying) {
        setSpeed(prev => {
          const delta = Math.floor(Math.random() * 5) - 2; // change speed by -2 to +2
          const newSpeed = prev + delta;
          return Math.max(35, Math.min(65, newSpeed));
        });
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(speedTimer);
    };
  }, [isPlaying]);

  function triggerFeedback(msg: string) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  }

  function handleSnapshot() {
    if (!isPlaying) return;
    const now = new Date();
    const formatted = `SNAP_${now.getHours()}${now.getMinutes()}${now.getSeconds()}_vs.jpg`;
    setSnapshots(prev => [formatted, ...prev].slice(0, 3));
    triggerFeedback("Snapshot taken successfully! Saved to gallery.");
  }

  function handleRecordClip() {
    if (!isPlaying) return;
    triggerFeedback("Event Clip Locked! Saving 1 min segment to SD Card...");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Live Video Feed Container */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-900 shadow-2xl relative">
          
          {/* Main Feed Simulator Screen (16:9) */}
          <div className="aspect-video w-full relative flex items-center justify-center overflow-hidden">
            {isPlaying ? (
              <>
                {/* stylized road/recording simulation */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/70" />
                
                {/* Perspective Road Simulation in CSS */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-full bg-slate-800 opacity-20 transform origin-bottom perspective-100 skew-x-12 blur-[1px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-full bg-slate-800 opacity-20 transform origin-bottom perspective-100 -skew-x-12 blur-[1px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 border-l-2 border-dashed border-white/30 h-[80%] opacity-40 animate-pulse" />
                
                {/* Scanning lines */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />

                {/* Simulated Lens Dirt or Grid lines */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/5 w-[80%] h-[80%] rounded-2xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-dashed border-white/5 w-[50%] h-[50%] rounded-full pointer-events-none" />
                
                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 font-bold drop-shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping flex-shrink-0" />
                  <span className="text-red-500 font-extrabold text-xs tracking-widest uppercase">REC</span>
                  <span className="text-white/80 font-mono text-xs">CH1 FRONT</span>
                </div>

                <div className="absolute top-4 right-4 text-right font-mono text-xs text-white/90 drop-shadow-md">
                  <div>{time.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}</div>
                  <div>{time.toLocaleTimeString()}</div>
                </div>

                <div className="absolute bottom-4 left-4 font-mono text-xs text-white/90 drop-shadow-md space-y-0.5">
                  <div>GPS: 28.4595° N, 77.0266° E</div>
                  <div>ALT: 220 m</div>
                </div>

                <div className="absolute bottom-4 right-4 flex items-end gap-3 drop-shadow-md">
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-black text-white/60 block leading-none">Vehicle Speed</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">{speed} <span className="text-xs">km/h</span></span>
                  </div>
                </div>

                {/* Microphone Audio Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full text-white/70 text-[10px] font-bold flex items-center gap-1.5 border border-white/5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAudioMuted ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                  <span>{isAudioMuted ? "MIC OFF" : "MIC ON"}</span>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 z-10 text-slate-500">
                <Tv className="w-12 h-12 mx-auto opacity-40 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest">FEED OFFLINE</p>
                <p className="text-[10px] opacity-75">Connect dashcam to power on local feed</p>
              </div>
            )}

            {/* Snapshot/Record flash overlay */}
            <AnimatePresence>
              {feedbackMsg && feedbackMsg.includes("Snapshot") && (
                <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-white z-20 pointer-events-none" />
              )}
            </AnimatePresence>
          </div>

          {/* Video Control Bar */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-800">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`w-9 h-9 rounded-xl hover:bg-slate-800 cursor-pointer ${isAudioMuted ? "text-red-500" : "text-slate-400 hover:text-white"}`}
              >
                <WifiOff className="w-4.5 h-4.5" />
              </Button>
            </div>

            {feedbackMsg && (
              <div className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {feedbackMsg}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSnapshot}
                disabled={!isPlaying}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-extrabold h-9 gap-1.5 px-3.5 cursor-pointer text-white"
              >
                <Camera className="w-3.5 h-3.5" /> Capture
              </Button>
              <Button
                onClick={handleRecordClip}
                disabled={!isPlaying}
                className="bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold h-9 gap-1.5 px-3.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Record Incident
              </Button>
            </div>
          </div>
        </div>

        {/* Live Snapshots Gallery */}
        {snapshots.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">Recent Local Captures</h4>
            <div className="grid grid-cols-3 gap-3">
              {snapshots.map((snap, i) => (
                <div key={i} className="aspect-video bg-slate-900 border border-slate-200 rounded-xl overflow-hidden relative flex items-center justify-center text-white/50 text-[9px] font-mono">
                  <div className="absolute inset-0 bg-indigo-950/20" />
                  <div className="absolute bottom-1 left-1.5 text-[8px] bg-black/55 px-1 rounded-sm text-white/90">SNAP {i+1}</div>
                  <Camera className="w-4 h-4 opacity-40" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SD Card Storage & Historical Logs list */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* SD Card Status */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
          <h3 className="font-extrabold text-slate-950 text-base mb-3.5 flex items-center justify-between">
            <span>SD Card Storage</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-2 py-0.5 rounded-full font-black uppercase">Healthy</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Used Storage</span>
              <span>45.2 GB / 128 GB (35%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "35%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Auto-loop: ON</span>
              <span>Class 10 High Speed</span>
            </div>
          </div>
        </div>

        {/* Saved Videos list */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-slate-950 text-base">Recorded Clips</h3>
            <span className="text-[9px] uppercase font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">Locked</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
            {[
              { id: "CL-98129", type: "G-Sensor Alert (Sudden Brake)", date: "Yesterday, 04:12 PM", time: "1m 30s", size: "24 MB", locked: true },
              { id: "CL-98018", type: "Manual Event Record", date: "30 Jul 2026, 09:40 AM", time: "2m 00s", size: "32 MB", locked: true },
              { id: "CL-97422", type: "Parking Impact Lock", date: "24 Jul 2026, 02:15 AM", time: "45s", size: "12 MB", locked: true },
              { id: "CL-97210", type: "Road Trip Scenic Clip", date: "18 Jul 2026, 03:00 PM", time: "10m 00s", size: "160 MB", locked: false }
            ].map(c => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-center hover:bg-slate-100/60 transition-all">
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-950 truncate flex items-center gap-1.5">
                    {c.locked && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Locked" />}
                    {c.type}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{c.date} • {c.size}</p>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-200 cursor-pointer" title="Download clip">
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Dashboard ---- */

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("vehicle");
  const [showNotifications, setShowNotifications] = useState(false);
  const [apiLicences, setApiLicences] = useState<ApiLicence[] | null>(null);
  const [apiVehicles, setApiVehicles] = useState<ApiVehicle[] | null>(null);
  const [vehicleSubView, setVehicleSubView] = useState<"home" | "licences" | "vehicles" | "vehicle-detail">("home");
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<any | null>(null);
  const [fasttagSelectedVehicle, setFasttagSelectedVehicle] = useState("All");
  const [fasttagVehicleSearch, setFasttagVehicleSearch] = useState("");
  const [fasttagLogSearch, setFasttagLogSearch] = useState("");
  const [selectedLicenceForDetail, setSelectedLicenceForDetail] = useState<any | null>(null);

  useEffect(() => {
    api.licences.list().then(l => setApiLicences(l)).catch(() => setApiLicences(null));
    api.vehicles.list().then(v => setApiVehicles(v)).catch(() => setApiVehicles(null));
  }, []);

  function handleLogout() { logout(); setLocation("/login"); }

  const displayLicences = apiLicences
    ? apiLicences.map(l => ({
        id: l.id,
        dlNumber: l.licenceNumber,
        name: "You",
        dob: l.dob,
        issueDate: l.issueDate,
        expiry: l.expiryDate,
        status: (l.status === "valid" ? "valid" : l.status === "expired" ? "expired" : "expiring") as "valid"|"expired"|"expiring",
        vehicleClass: l.type,
        address: l.state,
      }))
    : LICENCES.map(l => ({ ...l, status: l.status as "valid"|"expired"|"expiring" }));

  const displayVehicles = apiVehicles
    ? apiVehicles.map(v => ({
        id: v.id,
        name: `${v.make} ${v.model}`,
        number: v.registrationNumber,
        color: "—",
        year: v.year,
        owner: "You",
        rto: "Delhi (DL)",
        fuelType: v.fuelType ?? "Petrol",
        age: v.year ? `${new Date().getFullYear() - v.year} years` : "—",
        status: (v.status === "active" ? "Active" : "Inactive") as "Active"|"Inactive",
        fitness:   { status: v.status === "active" ? "valid" : "expired" as "valid"|"expired"|"expiring", expiry: "—", registrationNo: v.registrationNumber },
        insurance: { status: (v.insuranceExpiry ? new Date(v.insuranceExpiry) > new Date() ? "valid" : "expired" : "valid") as "valid"|"expired"|"expiring", expiry: v.insuranceExpiry ?? "—", policyNo: "—" },
        puc:       { status: (v.pucExpiry ? new Date(v.pucExpiry) > new Date() ? "valid" : "expired" : "valid") as "valid"|"expired"|"expiring", expiry: v.pucExpiry ?? "—", certNo: "—" },
        challans:  [] as Challan[],
      }))
    : VEHICLES;

  function handleNotificationClick(notif: { category: string; regNum?: string; dlNumber?: string }) {
    setActiveTab("vehicle");
    if (notif.category === "licence") {
      setVehicleSubView("licences");
      if (notif.dlNumber) {
        const matchedLic = displayLicences.find(l => l.dlNumber === notif.dlNumber);
        if (matchedLic) {
          setSelectedLicenceForDetail(matchedLic);
        }
      }
    } else if (notif.category === "vehicle") {
      if (notif.regNum) {
        const matchedVeh = displayVehicles.find(v => v.number === notif.regNum);
        if (matchedVeh) {
          setSelectedVehicleForDetail(matchedVeh);
          setVehicleSubView("vehicle-detail");
        } else {
          setVehicleSubView("vehicles");
        }
      } else {
        setVehicleSubView("vehicles");
      }
    }
    setShowNotifications(false);
  }

  function handleTabSelect(id: Tab) {
    setActiveTab(id);
    if (id === "vehicle") {
      setVehicleSubView("home");
      setSelectedVehicleForDetail(null);
      setSelectedLicenceForDetail(null);
    } else if (id === "fasttag") {
      setFasttagSelectedVehicle("All");
      setFasttagVehicleSearch("");
      setFasttagLogSearch("");
    }
  }

  // Generate notifications based on combined/api data
  const notifications = (() => {
    const list: { id: string; title: string; desc: string; type: "expired" | "expiring" | "challan"; category: string; regNum?: string; dlNumber?: string }[] = [];

    displayLicences.forEach(lic => {
      if (lic.status === "expired") {
        list.push({
          id: `lic-exp-${lic.id}`,
          title: `Licence Expired`,
          desc: `${lic.name}'s DL (${lic.dlNumber}) expired on ${lic.expiry}.`,
          type: "expired",
          category: "licence",
          dlNumber: lic.dlNumber
        });
      } else if (lic.status === "expiring") {
        list.push({
          id: `lic-expiring-${lic.id}`,
          title: `Licence Expiring Soon`,
          desc: `${lic.name}'s DL (${lic.dlNumber}) will expire on ${lic.expiry}.`,
          type: "expiring",
          category: "licence",
          dlNumber: lic.dlNumber
        });
      }
    });

    displayVehicles.forEach(veh => {
      if (veh.fitness.status === "expired") {
        list.push({
          id: `veh-fit-exp-${veh.id}`,
          title: `Fitness Expired`,
          desc: `${veh.name} (${veh.number}) Fitness expired on ${veh.fitness.expiry}.`,
          type: "expired",
          category: "vehicle",
          regNum: veh.number
        });
      } else if (veh.fitness.status === "expiring") {
        list.push({
          id: `veh-fit-expiring-${veh.id}`,
          title: `Fitness Expiring`,
          desc: `${veh.name} (${veh.number}) Fitness will expire on ${veh.fitness.expiry}.`,
          type: "expiring",
          category: "vehicle",
          regNum: veh.number
        });
      }

      if (veh.insurance.status === "expired") {
        list.push({
          id: `veh-ins-exp-${veh.id}`,
          title: `Insurance Expired`,
          desc: `${veh.name} (${veh.number}) Insurance expired on ${veh.insurance.expiry}.`,
          type: "expired",
          category: "vehicle",
          regNum: veh.number
        });
      } else if (veh.insurance.status === "expiring") {
        list.push({
          id: `veh-ins-expiring-${veh.id}`,
          title: `Insurance Expiring`,
          desc: `${veh.name} (${veh.number}) Insurance will expire on ${veh.insurance.expiry}.`,
          type: "expiring",
          category: "vehicle",
          regNum: veh.number
        });
      }

      if (veh.puc.status === "expired") {
        list.push({
          id: `veh-puc-exp-${veh.id}`,
          title: `PUC Expired`,
          desc: `${veh.name} (${veh.number}) PUC expired on ${veh.puc.expiry}.`,
          type: "expired",
          category: "vehicle",
          regNum: veh.number
        });
      } else if (veh.puc.status === "expiring") {
        list.push({
          id: `veh-puc-expiring-${veh.id}`,
          title: `PUC Expiring`,
          desc: `${veh.name} (${veh.number}) PUC will expire on ${veh.puc.expiry}.`,
          type: "expiring",
          category: "vehicle",
          regNum: veh.number
        });
      }

      if (veh.challans.length > 0) {
        list.push({
          id: `veh-challan-${veh.id}`,
          title: `Pending Challans`,
          desc: `${veh.name} (${veh.number}) has ${veh.challans.length} pending challans.`,
          type: "challan",
          category: "vehicle",
          regNum: veh.number
        });
      }
    });

    return list;
  })();

  const expiredCount = notifications.filter(n => n.type === "expired").length;

  const tabContent = {
    vehicle: (
      <VehicleTab
        apiLicences={apiLicences}
        setApiLicences={setApiLicences}
        apiVehicles={apiVehicles}
        setApiVehicles={setApiVehicles}
        view={vehicleSubView}
        onViewChange={setVehicleSubView}
        selectedVehicle={selectedVehicleForDetail}
        onSelectVehicle={setSelectedVehicleForDetail}
        selectedLicence={selectedLicenceForDetail}
        onSelectLicence={setSelectedLicenceForDetail}
      />
    ),
    fasttag: (
      <FasttagTab
        selectedVehicle={fasttagSelectedVehicle}
        setSelectedVehicle={setFasttagSelectedVehicle}
        vehicleSearchQuery={fasttagVehicleSearch}
        setVehicleSearchQuery={setFasttagVehicleSearch}
        searchQuery={fasttagLogSearch}
        setSearchQuery={setFasttagLogSearch}
      />
    ),
    mall: <MallTab />,
    mechanic: <MechanicTab />,
    dashcam: <DashcamTab />,
    gps: <GpsTab />
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background glow blur elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Vehicle Shadow" className="h-10 object-contain cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setLocation("/")} />
          </div>

          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl p-1">
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTabSelect(id)}
                  data-testid={`tab-${id}`}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 border border-primary/20 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9.5 h-9.5 rounded-xl border border-slate-200 bg-white backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-950 hover:border-primary/40 transition-all hover:scale-105 cursor-pointer" 
              data-testid="button-notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-red-600 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-black text-white leading-none">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl text-slate-950 flex flex-col max-h-[480px]"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4.5 h-4.5 text-primary" />
                        <span className="text-sm font-bold">Notifications</span>
                        {notifications.length > 0 && (
                          <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-1.5 py-0.5 rounded-full border border-red-200">
                            {notifications.length} Alert{notifications.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {expiredCount > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-red-950 flex items-start gap-2.5 shadow-2xs">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-wider text-red-700">Attention Required</p>
                          <p className="text-xs font-bold mt-0.5 leading-snug">
                            Your {expiredCount} document{expiredCount !== 1 ? "s have" : " has"} expired!
                          </p>
                          <p className="text-[10px] text-slate-650 mt-0.5">
                            Please check and renew the expired items immediately.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[350px]">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => {
                          const iconColor = notif.type === "expired" ? "text-red-650 bg-red-50 border-red-150" : notif.type === "expiring" ? "text-yellow-650 bg-yellow-50 border-yellow-150" : "text-orange-650 bg-orange-50 border-orange-150";
                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-2.5 items-start transition-all hover:bg-slate-100 cursor-pointer"
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${iconColor}`}>
                                {notif.type === "expired" ? (
                                  <AlertTriangle className="w-4 h-4" />
                                ) : notif.type === "expiring" ? (
                                  <AlertTriangle className="w-4 h-4" />
                                ) : (
                                  <ShieldAlert className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 leading-tight flex justify-between gap-2">
                                  <span>{notif.title}</span>
                                  <span className="text-[8px] font-black uppercase text-slate-500 flex-shrink-0 mt-0.5">{notif.category}</span>
                                </p>
                                <p className="text-[10px] text-slate-600 mt-1 leading-snug">{notif.desc}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2.5 opacity-80" />
                          <p className="text-xs font-extrabold text-slate-800">No Notifications</p>
                          <p className="text-[10px] text-slate-500 mt-1">All documents and challans are up-to-date.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <button onClick={() => setLocation("/profile")} className="w-9.5 h-9.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/20 hover:scale-105 transition-all cursor-pointer" title={user?.name}>
              {user?.name?.[0]?.toUpperCase() ?? <User className="w-4.5 h-4.5" />}
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 rounded-xl text-xs gap-1.5 transition-all cursor-pointer" data-testid="button-logout">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => handleTabSelect(id)} data-testid={`tab-mobile-${id}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-slate-100 border border-slate-200 text-slate-700"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-slate-950 text-sm font-medium mt-0.5">Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
