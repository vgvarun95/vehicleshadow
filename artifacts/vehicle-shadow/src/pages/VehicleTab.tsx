import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { api, type Licence as ApiLicence, type Vehicle as ApiVehicle } from "@/lib/api";
import {
  Car, FileText, ShieldCheck, AlertTriangle, ChevronRight,
  Plus, User, MapPin, ArrowLeft, CheckCircle2, Search,
  Building2, Phone, Star, Navigation, X,
  Calendar, IdCard, ChevronDown, ChevronUp, Receipt, Banknote,
  Shield, BadgeCheck, Upload, FileCheck, Droplets, Settings,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─────────────── Static Data ─────────────── */

const STATES = ["Delhi","Haryana","Uttar Pradesh","Rajasthan","Punjab","Maharashtra","Karnataka","Tamil Nadu"];

const CITIES: Record<string, string[]> = {
  "Delhi":         ["New Delhi","Dwarka","Rohini","Shahadra"],
  "Haryana":       ["Gurgaon","Faridabad","Panipat","Ambala"],
  "Uttar Pradesh": ["Noida","Lucknow","Agra","Kanpur"],
  "Rajasthan":     ["Jaipur","Jodhpur","Udaipur","Kota"],
  "Punjab":        ["Chandigarh","Ludhiana","Amritsar","Patiala"],
  "Maharashtra":   ["Mumbai","Pune","Nashik","Nagpur"],
  "Karnataka":     ["Bengaluru","Mysuru","Hubli","Mangaluru"],
  "Tamil Nadu":    ["Chennai","Coimbatore","Madurai","Salem"],
};

const DEALERS = [
  { name:"DL Seva Kendra",    licNo:"AUTH-DL-001", address:"Sector 15, Gurgaon",   phone:"+91 98765 43210", rating:4.8, distance:"1.2 km", valid:true  },
  { name:"RTO License Point", licNo:"AUTH-DL-002", address:"Kashmere Gate, Delhi", phone:"+91 98001 11222", rating:4.6, distance:"3.4 km", valid:true  },
  { name:"Smart DL Center",   licNo:"AUTH-DL-003", address:"DLF Phase 2, Gurgaon", phone:"+91 99887 76655", rating:4.5, distance:"2.1 km", valid:false },
];

const RC_DEALERS = [
  { name:"Maruti RTO Service", licNo:"AUTH-RC-001", address:"Sector 15, Gurgaon", phone:"+91 98765 43210", rating:4.8, distance:"1.2 km", valid:true },
  { name:"Govt. Reg Hub",      licNo:"AUTH-RC-002", address:"Sadar Bazar, Delhi",  phone:"+91 98001 11222", rating:4.6, distance:"3.4 km", valid:true },
  { name:"QuickRC Center",     licNo:"AUTH-RC-003", address:"DLF Phase 2",          phone:"+91 99887 76655", rating:4.5, distance:"2.1 km", valid:true },
];

const INSURANCE_PROVIDERS = [
  { name:"Acko",           color:"from-green-600 to-green-800",   tagline:"Instant policy, zero paperwork", price:"₹3,299/yr", badge:"Lowest Price", badgeColor:"bg-green-50 text-green-700 border-green-200"   },
  { name:"PhonePe",        color:"from-purple-600 to-purple-900", tagline:"Trusted by 5 Cr+ users",         price:"₹3,899/yr", badge:"Most Popular", badgeColor:"bg-purple-50 text-purple-700 border-purple-200" },
  { name:"CRED Insurance", color:"from-blue-600 to-blue-900",     tagline:"Exclusive member benefits",       price:"₹4,199/yr", badge:"Premium",      badgeColor:"bg-blue-50 text-blue-700 border-blue-200"     },
  { name:"HDFC Ergo",      color:"from-red-600 to-red-900",       tagline:"Comprehensive coverage",          price:"₹4,599/yr", badge:"Trusted",      badgeColor:"bg-red-50 text-red-700 border-red-200"       },
  { name:"Bajaj Allianz",  color:"from-yellow-600 to-orange-800", tagline:"Cashless at 6500+ garages",       price:"₹3,699/yr", badge:"Bestseller",   badgeColor:"bg-amber-50 text-amber-800 border-amber-200" },
];

const PUC_CENTERS = [
  { name:"Green Fuel PUC",    address:"Sector 14, Gurgaon", distance:"0.5 km", open:true  },
  { name:"Delhi PUC Station", address:"Karol Bagh, Delhi",  distance:"1.2 km", open:true  },
  { name:"RTO Auth PUC",      address:"MG Road, Gurgaon",   distance:"2.3 km", open:false },
  { name:"AutoCheck PUC",     address:"Cyber Hub, DLF",     distance:"3.1 km", open:true  },
];

import { LICENCES, VEHICLES } from "@/data/mockData";


/* ─────────────── Helpers ─────────────── */

function statusBadge(status: string) {
  if (status==="valid")    return { label:"Valid",         cls:"bg-green-50 text-green-700 border-green-200"    };
  if (status==="expiring") return { label:"Expiring Soon", cls:"bg-amber-50 text-amber-800 border-amber-200" };
  if (status==="expired")  return { label:"Expired",       cls:"bg-red-50 text-red-700 border-red-200"          };
  return                          { label:status,          cls:"bg-slate-50 text-slate-700 border-slate-200"    };
}

function allOk(v: typeof VEHICLES[0]) {
  return v.fitness.status==="valid" && v.insurance.status==="valid" && v.puc.status==="valid" && v.challans.length===0;
}

const pageVariants = {
  enter:  { opacity:0, x:48  },
  center: { opacity:1, x:0   },
  exit:   { opacity:0, x:-48 },
};

/* ─────────────── Location Flow — Dropdown version ─────────────── */
function LocationFlow({ title, dealers, onBack }: { title:string; dealers:typeof DEALERS; onBack:()=>void }) {
  const [state,    setState]    = useState("");
  const [city,     setCity]     = useState("");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<number|null>(null);

  const cities = state ? (CITIES[state] || []) : [];

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4 mt-4">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5"/> Back
      </button>
      <p className="text-sm font-semibold text-foreground">{title}</p>

      {/* ── State + City + Search in one row ── */}
      <div className="flex gap-2 flex-wrap items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-slate-500 font-semibold mb-1 block">State</label>
          <div className="relative">
            <select
              value={state}
              onChange={e => { setState(e.target.value); setCity(""); setSearched(false); setExpanded(null); }}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-950 focus:outline-none focus:border-primary/60 cursor-pointer pr-7"
            >
              <option value="">Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"/>
          </div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-slate-500 font-semibold mb-1 block">City</label>
          <div className="relative">
            <select
              value={city}
              disabled={!state}
              onChange={e => { setCity(e.target.value); setSearched(false); setExpanded(null); }}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-950 focus:outline-none focus:border-primary/60 cursor-pointer pr-7 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{state ? "Select City" : "Select state first"}</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"/>
          </div>
        </div>

        <Button
          onClick={() => { if (state && city) { setSearched(true); setExpanded(null); } }}
          disabled={!state || !city}
          className="rounded-xl bg-primary hover:bg-primary/90 text-xs h-9 px-5 flex-shrink-0 self-end"
        >
          Search
        </Button>
      </div>

      {/* ── Results ── */}
      <AnimatePresence>
        {searched && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary"/>{state} — {city} · {dealers.length} centers found
            </p>
            {dealers.map((d,i) => (
              <motion.div key={i} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                className={`rounded-xl border bg-white overflow-hidden transition-all ${expanded===i ? "border-primary/40" : "border-slate-200 hover:border-primary/30"}`}>
                {/* Thumbnail header row */}
                <button onClick={() => setExpanded(expanded===i ? null : i)} className="w-full text-left p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-slate-100 border border-primary/20 flex flex-col items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-primary"/>
                    <span className="text-[8px] text-primary/60 font-bold mt-0.5">{d.licNo.split("-").pop()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-extrabold text-xs text-slate-950">{d.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${d.valid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        {d.valid ? "Authorized" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono font-bold">{d.licNo}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-700 font-bold flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500"/>{d.rating}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{d.distance}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-slate-500">
                    {expanded===i ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {expanded===i && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden border-t border-slate-200">
                      <div className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label:"Address",  value:d.address,  icon:MapPin  },
                            { label:"Auth. No", value:d.licNo,    icon:IdCard  },
                            { label:"Rating",   value:`${d.rating} / 5.0`, icon:Star },
                            { label:"Distance", value:d.distance, icon:MapPin  },
                          ].map(({label,value,icon:Icon},j) => (
                            <div key={j} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                              <p className="text-[10px] text-slate-550 mb-0.5 flex items-center gap-1"><Icon className="w-3 h-3"/>{label}</p>
                              <p className="text-xs font-bold text-slate-950">{value}</p>
                            </div>
                          ))}
                        </div>
                        {d.valid && (
                          <a href={`tel:${d.phone}`} className="block">
                            <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-xs h-8">
                              <Phone className="w-3 h-3 mr-1.5"/> Call {d.phone}
                            </Button>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────── Fitness Renewal Flow ─────────────── */
function FitnessRenewalFlow({ onBack }: { onBack:()=>void }) {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const docs = [
    { key:"rc",       label:"RC (Registration Certificate)",     icon:FileText },
    { key:"insurance",label:"Insurance Policy",                    icon:ShieldCheck },
    { key:"pollution",label:"Pollution Under Control (PUC)",     icon:Shield },
    { key:"tax",      label:"Road Tax Proof",                    icon:Receipt },
  ];

  const allUploaded = docs.every(d => uploaded[d.key]);

  const handleUpload = (key: string) => {
    setUploaded(prev => ({ ...prev, [key]: true }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1500);
  };

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4 mt-4">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5"/> Back
      </button>
      <p className="text-sm font-extrabold text-slate-950">Apply for Fitness Renewal</p>
      <p className="text-xs text-slate-550">Upload required documents to proceed with fitness certificate renewal.</p>

      {done ? (
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <FileCheck className="w-7 h-7 text-green-700"/>
          </div>
          <p className="text-sm font-extrabold text-green-700">Application Submitted!</p>
          <p className="text-xs text-slate-600">Your fitness renewal application has been submitted. You will receive an update via SMS.</p>
          <Button onClick={onBack} className="rounded-xl bg-primary hover:bg-primary/90 text-xs">Go Back</Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {docs.map((d,i) => (
            <motion.div key={d.key} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
              className={`rounded-xl border p-4 flex items-center justify-between gap-3 transition-all ${uploaded[d.key] ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${uploaded[d.key] ? "bg-green-100" : "bg-slate-100"}`}>
                  <d.icon className={`w-5 h-5 ${uploaded[d.key] ? "text-green-700" : "text-slate-700"}`}/>
                </div>
                <div>
                  <p className="font-extrabold text-xs text-slate-950">{d.label}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{uploaded[d.key] ? "Uploaded ✓" : "Tap to upload"}</p>
                </div>
              </div>
              <Button size="sm" onClick={()=>handleUpload(d.key)}
                className={`rounded-xl text-xs flex-shrink-0 ${uploaded[d.key] ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/30"}`}>
                {uploaded[d.key] ? <><FileCheck className="w-3 h-3 mr-1"/>Done</> : <><Upload className="w-3 h-3 mr-1"/>Upload</>}
              </Button>
            </motion.div>
          ))}

          <div className="pt-2">
            <Button onClick={handleSubmit} disabled={!allUploaded || submitting}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-xs h-10">
              {submitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : "Submit Application"}
            </Button>
            {!allUploaded && (
              <p className="text-[10px] text-slate-500 text-center mt-1.5">Upload all 4 documents to submit</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────── Insurance Flow ─────────────── */
function InsuranceFlow({ onBack }: { onBack:()=>void }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-3 mt-4">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900"><ArrowLeft className="w-3.5 h-3.5"/>Back</button>
      <p className="text-sm font-extrabold text-slate-950">Renew / Buy Insurance</p>
      {INSURANCE_PROVIDERS.map((p,i) => (
        <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
          className="relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-all cursor-pointer group shadow-sm">
          <div className={`absolute inset-0 bg-gradient-to-r ${p.color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`}/>
          <div className="relative z-10 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{p.name.slice(0,2).toUpperCase()}</div>
              <div>
                <div className="flex items-center gap-2"><span className="font-extrabold text-xs text-slate-950">{p.name}</span><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${p.badgeColor}`}>{p.badge}</span></div>
                <p className="text-[10px] text-slate-500 font-semibold">{p.tagline}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-extrabold text-xs text-slate-950">{p.price}</p>
              <Button size="sm" className="mt-1 rounded-xl text-[10px] h-6 px-2 bg-primary hover:bg-primary/90">Buy</Button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─────────────── PUC Flow ─────────────── */
function PucFlow({ onBack }: { onBack:()=>void }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-3 mt-4">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900"><ArrowLeft className="w-3.5 h-3.5"/>Back</button>
      <p className="text-sm font-extrabold text-slate-950">Nearby PUC Centers</p>
      <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 h-36 flex items-center justify-center shadow-inner">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:"linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
        <div className="relative z-10 text-center">
          <div className="w-10 h-10 bg-primary/15 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-1 animate-pulse"><Navigation className="w-5 h-5 text-primary"/></div>
          <p className="text-slate-950 text-xs font-extrabold">4 centers within 5 km</p>
        </div>
        {[{x:"20%",y:"30%"},{x:"55%",y:"50%"},{x:"72%",y:"25%"},{x:"38%",y:"65%"}].map((pos,i)=>(
          <div key={i} className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow animate-bounce" style={{left:pos.x,top:pos.y,animationDelay:`${i*0.2}s`}}/>
        ))}
      </div>
      <div className="space-y-2">
        {PUC_CENTERS.map((c,i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-primary/40 transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.open?"bg-green-100":"bg-slate-100"}`}><Shield className={`w-4 h-4 ${c.open?"text-green-700":"text-slate-600"}`}/></div>
              <div>
                <p className="font-extrabold text-xs text-slate-950">{c.name}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{c.address} · {c.distance}</p>
                <span className={`text-[10px] font-extrabold ${c.open?"text-green-700":"text-slate-650"}`}>{c.open?"Open":"Closed"}</span>
              </div>
            </div>
            {c.open && <Button size="sm" className="rounded-xl text-[10px] h-7 px-2 bg-primary hover:bg-primary/90">Navigate</Button>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────── Challan Flow ─────────────── */
function ChallanFlow({ challans, onBack }: { challans:typeof VEHICLES[0]["challans"]; onBack:()=>void }) {
  const [paid,setPaid] = useState<string[]>([]);
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-3 mt-4">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900"><ArrowLeft className="w-3.5 h-3.5"/>Back</button>
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-slate-950">Traffic Challans</p>
        <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 font-bold px-2 py-0.5 rounded-full">via mParivahan</span>
      </div>
      {challans.length===0 ? (
        <div className="text-center py-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2"/>
          <p className="text-sm font-extrabold text-slate-950">No Pending Challans!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {challans.map(ch => (
            <div key={ch.id} className={`rounded-xl border p-3 transition-all ${paid.includes(ch.id)?"border-green-200 bg-green-50/50 opacity-80":"border-red-200 bg-red-50/50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${paid.includes(ch.id)?"bg-green-100":"bg-red-100"}`}>
                    <Receipt className={`w-4 h-4 ${paid.includes(ch.id)?"text-green-700":"text-red-700"}`}/>
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-950">{ch.type} <span className="text-slate-550 font-normal">#{ch.id}</span></p>
                    <p className="text-[10px] text-slate-500 font-semibold">{ch.location} · {ch.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-sm text-slate-950">{ch.amount}</p>
                  {paid.includes(ch.id)
                    ? <span className="text-[10px] text-green-700 flex items-center gap-0.5 justify-end font-bold"><CheckCircle2 className="w-3 h-3"/>Paid</span>
                    : <Button size="sm" onClick={()=>setPaid(p=>[...p,ch.id])} className="mt-1 rounded-xl text-[10px] h-6 px-2 bg-primary hover:bg-primary/90">Pay Now</Button>
                  }
                </div>
              </div>
            </div>
          ))}
          {challans.some(c=>!paid.includes(c.id)) && (
            <Button onClick={()=>setPaid(challans.map(c=>c.id))} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-sm">Pay All Challans</Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────── Vehicle Detail Page ─────────────── */
type DocFlow = "fitness"|"insurance"|"puc"|"challan"|null;

function VehicleDetail({ vehicle, onBack }: { vehicle:typeof VEHICLES[0]; onBack:()=>void }) {
  const [flow,setFlow] = useState<DocFlow>(null);

  const rcDetails = [
    { label: "Owner Name", value: vehicle.owner, icon: User },
    { label: "RTO Location", value: vehicle.rto, icon: MapPin },
    { label: "Maker Model", value: vehicle.name, icon: Car },
    { label: "Fuel Type", value: vehicle.fuelType, icon: Droplets },
    { label: "Vehicle Age", value: vehicle.age, icon: Calendar },
    { label: "Registration Date", value: `15 Jun ${vehicle.year}`, icon: Calendar },
    { label: "Engine Number", value: `ENG554${vehicle.year}`, icon: Settings },
    { label: "Chassis Number", value: `CHA884${vehicle.year}`, icon: ShieldCheck },
  ];

  const docs = [
    { key:"fitness"   as DocFlow, label:"Vehicle Fitness",  icon:FileText,   status:vehicle.fitness.status,   expiry:vehicle.fitness.expiry,   detail:vehicle.fitness.registrationNo,  action:"Apply Renewal"  },
    { key:"insurance" as DocFlow, label:"Insurance Policy", icon:ShieldCheck,status:vehicle.insurance.status,  expiry:vehicle.insurance.expiry,  detail:vehicle.insurance.policyNo, action:"Renew Insurance" },
    { key:"puc"       as DocFlow, label:"PUC Certificate",  icon:Shield,     status:vehicle.puc.status,       expiry:vehicle.puc.expiry,       detail:vehicle.puc.certNo,         action:"Find PUC Center" },
    { key:"challan"   as DocFlow, label:"Traffic Challans", icon:Receipt,
      status:vehicle.challans.length===0?"valid":"pending",
      expiry:vehicle.challans.length===0?"No pending":`${vehicle.challans.length} pending`,
      detail:"mParivah Record", action:"View & Pay" },
  ];

  if (flow==="fitness")   return <FitnessRenewalFlow onBack={()=>setFlow(null)}/>;
  if (flow==="insurance") return <InsuranceFlow onBack={()=>setFlow(null)}/>;
  if (flow==="puc")       return <PucFlow onBack={()=>setFlow(null)}/>;
  if (flow==="challan")   return <ChallanFlow challans={vehicle.challans} onBack={()=>setFlow(null)}/>;

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4"/> All Vehicles
      </button>

      {/* Indian HSRP License Plate Header */}
      <div className="flex justify-center my-3">
        <div className="relative bg-white border-[3px] border-slate-900 rounded-xl px-5 py-2.5 min-w-[280px] max-w-[340px] text-center shadow-xl flex items-center select-none overflow-hidden ring-4 ring-slate-100">
          {/* Blue IND stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-[#0066cc] flex flex-col items-center justify-center text-white py-1">
            <span className="text-[6px] font-black leading-none opacity-90 tracking-tighter">IND</span>
            <div className="w-2 h-2 my-0.5 bg-amber-400 rounded-full border border-blue-900 flex items-center justify-center">
              <div className="w-1 bg-blue-900 rounded-full" />
            </div>
            <span className="text-[4px] font-black opacity-75">HSRP</span>
          </div>
          {/* Plate Number */}
          <div className="flex-1 pl-4 flex flex-col justify-center">
            <span className="text-xl font-black text-slate-950 font-mono tracking-[0.16em] leading-none uppercase">{vehicle.number}</span>
          </div>
          {/* Small laser seal stamp */}
          <div className="absolute right-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-200/80 border border-slate-400 flex items-center justify-center text-[5px] font-bold text-slate-500 font-mono">
            🛞
          </div>
        </div>
      </div>

      {/* CarInfo style Registration Card */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 p-6 shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <Car className="w-6 h-6 text-primary"/>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">Vehicle Model</p>
              <h3 className="text-lg font-black text-slate-950 leading-tight mt-1">{vehicle.name}</h3>
            </div>
          </div>
          {allOk(vehicle)
            ? <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full w-fit"><div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"/>All Documents OK</span>
            : <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full w-fit"><AlertTriangle className="w-3.5 h-3.5 text-amber-600"/>Attention Required</span>
          }
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {rcDetails.map(({label,value,icon:Icon},i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-primary"/>
                <p className="text-[10px] text-slate-500 font-semibold">{label}</p>
              </div>
              <p className="text-xs font-extrabold text-slate-950 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Document List: Fitness | Insurance | PUC | Challan */}
      <div className="space-y-3">
        {docs.map(({key,label,icon:Icon,status,expiry,detail,action},i) => {
          const badge = statusBadge(status);
          
          const statusCls = 
            status === "valid" ? "border-green-250 bg-green-50/45 hover:border-green-300 hover:shadow-sm" :
            status === "expiring" ? "border-amber-250 bg-amber-50/45 hover:border-amber-300 hover:shadow-sm" :
            "border-red-250 bg-red-50/45 hover:border-red-300 hover:shadow-sm";

          return (
            <motion.div key={i} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              className={`rounded-xl border p-4 flex items-center justify-between gap-3 transition-all ${statusCls}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20"><Icon className="w-5 h-5 text-primary"/></div>
                <div>
                  <p className="font-extrabold text-xs text-slate-950">{label}</p>
                  <p className="text-[10px] text-slate-500 font-mono font-bold">{detail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{expiry}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={()=>setFlow(key)}
                className="rounded-xl text-[11px] font-bold bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/30 transition-all flex-shrink-0 cursor-pointer">
                {action}<ChevronRight className="w-3 h-3 ml-1"/>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─────────────── Licence Card (accordion) ─────────────── */
type LicenceCardProp = { id:number; dlNumber:string; name:string; dob:string; issueDate:string; expiry:string; status:"valid"|"expired"|"expiring"; vehicleClass:string; address:string };
function LicenceCard({ lic, onClick }: { lic:LicenceCardProp; onClick:()=>void }) {
  const badge = statusBadge(lic.status);

  if (lic.status === "expired") {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-3xl bg-slate-100 border border-slate-200 hover:bg-slate-200/60 hover:border-red-400 transition-all duration-300 overflow-hidden flex items-center p-4 gap-3.5 min-h-[174px] shadow-sm group"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex flex-col items-center justify-center flex-shrink-0 shadow-3xs">
          <IdCard className="w-5 h-5 text-purple-700" />
          <span className="text-[8px] text-purple-900 font-black mt-0.5 leading-none">DL</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm text-slate-950 truncate">{lic.name}</p>
          <p className="text-xs text-slate-700 font-mono font-bold mt-0.5 truncate">{lic.dlNumber}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              Expired
            </span>
            <span className="text-xs text-slate-650 font-bold">Exp: {lic.expiry}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform ml-auto flex-shrink-0" />
      </button>
    );
  }

  // Valid or Expiring Premium Holographic Card with 2x2 Details Grid
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-3xl border border-slate-200 bg-white hover:border-primary/45 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col xl:flex-row p-3 gap-3 items-stretch min-h-[174px] shadow-sm group"
    >
      {/* Left Column: Mini Holographic Smart Card */}
      <div className="relative w-full xl:w-[58%] h-[150px] rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 p-3 flex flex-col justify-between text-slate-900 shadow-3xs flex-shrink-0">
        {/* Holographic lines/crests background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: "url('/images/licence_bg.png')" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />

        {/* Chip overlay */}
        <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-amber-400 to-yellow-650 rounded opacity-85 border border-amber-300/30 flex items-center justify-center pointer-events-none">
          <div className="w-5.5 h-5.5 border border-amber-950/20 rounded flex flex-wrap p-0.5 opacity-70">
            <div className="w-1/2 h-1/2 border-r border-b border-amber-950/20" />
            <div className="w-1/2 h-1/2 border-b border-amber-950/20" />
            <div className="w-1/2 h-1/2 border-r border-amber-950/20" />
            <div className="w-1/2 h-1/2" />
          </div>
        </div>

        {/* Card Header */}
        <div className="flex items-center gap-1.5 border-b border-sky-100 pb-1.5 relative z-10">
          <div className="w-5 h-5 rounded-full bg-sky-100/80 border border-sky-200 flex items-center justify-center text-[10px]">
            🦁
          </div>
          <div>
            <p className="text-[6px] font-black uppercase tracking-widest text-sky-700 leading-none">Driving Licence</p>
            <p className="text-[8px] font-extrabold uppercase leading-none mt-0.5 text-slate-900">Republic of India</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex gap-2.5 items-center my-1 relative z-10">
          <div className="w-11 h-14 bg-white border border-sky-200 rounded flex flex-col items-center justify-center overflow-hidden relative flex-shrink-0">
            <User className="w-7 h-7 text-sky-600 opacity-80" />
            <div className="absolute bottom-0 inset-x-0 bg-sky-100 py-0.5 text-center text-[5px] font-black text-sky-700 uppercase tracking-wider leading-none">
              PHOTO
            </div>
            <div className="absolute inset-x-0 h-0.5 bg-sky-400 opacity-30 animate-bounce top-1/3" />
          </div>

          <div className="flex-1 text-left font-mono space-y-0.5 text-[8px] leading-none min-w-0">
            <div>
              <span className="text-slate-500 font-bold text-[6px]">LIC No:</span>
              <p className="font-extrabold text-sky-850 text-[9px] tracking-wide truncate">{lic.dlNumber}</p>
            </div>
            <div className="mt-0.5">
              <span className="text-slate-500 font-bold text-[6px]">Name:</span>
              <p className="font-extrabold uppercase text-slate-950 truncate max-w-[125px]">{lic.name}</p>
            </div>
            <div className="flex gap-1.5 mt-0.5">
              <div>
                <span className="text-slate-500 font-bold text-[6px]">DOB:</span>
                <p className="font-extrabold text-slate-900 text-[7px]">{lic.dob.split(" ").slice(0, 2).join(" ")}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold text-[6px]">Class:</span>
                <p className="font-extrabold text-slate-900 text-[7px] truncate max-w-[50px]">{lic.vehicleClass}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between border-t border-sky-100 pt-1 text-[6.5px] text-slate-500 font-bold relative z-10">
          <span className="uppercase">State: {lic.dlNumber.slice(0, 2)}</span>
          <span className="font-extrabold text-sky-750">Exp: {lic.expiry}</span>
        </div>
      </div>

      {/* Right Column: 2x2 Quick Info Tiles */}
      <div className="grid grid-cols-2 gap-1.5 flex-1 relative z-10">
        {/* Birth Tile */}
        <div className="bg-purple-50/40 border border-purple-100/60 rounded-xl p-1.5 flex flex-col justify-between min-h-[70px]">
          <div className="flex items-center justify-between">
            <span className="text-purple-750 text-[8px] font-black uppercase tracking-wider">Birth</span>
            <User className="w-2.5 h-2.5 text-purple-600" />
          </div>
          <span className="text-slate-900 text-[10px] font-bold leading-tight mt-1">{lic.dob}</span>
        </div>

        {/* Issue Date Tile */}
        <div className="bg-purple-50/40 border border-purple-100/60 rounded-xl p-1.5 flex flex-col justify-between min-h-[70px]">
          <div className="flex items-center justify-between">
            <span className="text-purple-750 text-[8px] font-black uppercase tracking-wider">Issue</span>
            <Calendar className="w-2.5 h-2.5 text-purple-600" />
          </div>
          <span className="text-slate-900 text-[10px] font-bold leading-tight mt-1">{lic.issueDate}</span>
        </div>

        {/* Valid Until / Status Tile */}
        <div className="bg-purple-50/40 border border-purple-100/60 rounded-xl p-1.5 flex flex-col justify-between min-h-[70px]">
          <div className="flex items-center justify-between">
            <span className="text-purple-750 text-[8px] font-black uppercase tracking-wider">Valid Till</span>
            <Calendar className="w-2.5 h-2.5 text-purple-600" />
          </div>
          {lic.status === "expiring" ? (
            <span className="text-amber-805 text-[9px] font-black uppercase leading-tight mt-1 animate-pulse">
              Expiring Soon
            </span>
          ) : (
            <span className="text-slate-900 text-[10px] font-bold leading-tight mt-1">{lic.expiry}</span>
          )}
        </div>

        {/* Vehicle Class Tile */}
        <div className="bg-purple-50/40 border border-purple-100/60 rounded-xl p-1.5 flex flex-col justify-between min-h-[70px]">
          <div className="flex items-center justify-between">
            <span className="text-purple-750 text-[8px] font-black uppercase tracking-wider">Class</span>
            <Car className="w-2.5 h-2.5 text-purple-600" />
          </div>
          <span
            className="text-slate-900 text-[9px] font-bold leading-tight mt-1 truncate"
            title={lic.vehicleClass}
          >
            {lic.vehicleClass}
          </span>
        </div>
      </div>
    </button>
  );
}

function LicenceDetailsModal({ lic, onClose, onModal }: { lic:LicenceCardProp; onClose:()=>void; onModal:(m:"licence"|"apply")=>void }) {
  const badge = statusBadge(lic.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px] text-slate-950"
      >
        {/* Left Column: Visual/Holographic Side (visible on md+) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/30 p-6 flex-col items-center justify-center relative overflow-hidden border-r border-slate-200">
          {/* Background decorative images or glows */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.08]"
            style={{ backgroundImage: "url('/images/licence_bg.png')" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Floating Licence Smart Card Visual */}
          <div className="relative z-10 w-full flex justify-center transform hover:scale-105 hover:rotate-1 transition-transform duration-500">
            <div className="relative w-full max-w-[340px] h-[200px] rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 p-4 shadow-xl flex flex-col justify-between overflow-hidden text-slate-950 select-none">
              {/* Hologram / Chip overlays */}
              <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute top-4 right-4 w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg opacity-85 border border-amber-300/30 flex items-center justify-center shadow">
                {/* SIM / Smartcard Chip Pattern */}
                <div className="w-7 h-7 border border-amber-950/20 rounded flex flex-wrap p-0.5 opacity-70">
                  <div className="w-1/2 h-1/2 border-r border-b border-amber-950/20" />
                  <div className="w-1/2 h-1/2 border-b border-amber-950/20" />
                  <div className="w-1/2 h-1/2 border-r border-amber-950/20" />
                  <div className="w-1/2 h-1/2" />
                </div>
              </div>
              
              {/* Header */}
              <div className="flex items-start gap-2 border-b border-sky-100 pb-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-[16px]">🦁</div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-widest text-sky-700">Driving Licence</p>
                  <p className="text-[10px] font-bold uppercase leading-none text-slate-900">Republic of India</p>
                </div>
              </div>

              {/* Body */}
              <div className="flex gap-3 my-2 items-center">
                <div className="w-16 h-20 bg-white border border-sky-200 rounded-lg flex flex-col items-center justify-center overflow-hidden relative">
                  <User className="w-10 h-10 text-sky-600 opacity-80" />
                  <div className="absolute bottom-0 inset-x-0 bg-sky-100 py-0.5 text-center text-[6px] font-black text-sky-700 tracking-wider uppercase">Photo</div>
                  <div className="absolute inset-x-0 h-0.5 bg-sky-400 opacity-30 animate-bounce top-1/4" />
                </div>
                
                <div className="flex-1 text-left space-y-1 font-mono text-[10px] text-slate-900">
                  <div>
                    <span className="text-slate-500 text-[8px]">LIC No:</span>
                    <p className="font-bold text-sky-850 text-xs tracking-wider leading-none">{lic.dlNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[8px]">Name:</span>
                    <p className="font-bold uppercase text-slate-950 truncate max-w-[150px] leading-none">{lic.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="text-slate-500 text-[8px]">DOB:</span>
                      <p className="font-bold text-slate-900 leading-none">{lic.dob.split(" ").slice(0, 2).join(" ")}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[8px]">Class:</span>
                      <p className="font-bold text-slate-900 leading-none">{lic.vehicleClass}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-sky-100 pt-1 text-[8px] text-slate-500">
                <span className="uppercase">State code: {lic.dlNumber.slice(0,2)}</span>
                <span className="font-bold text-sky-750">Valid Till: {lic.expiry}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details Side (visible on all viewports, full-width on mobile) */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white max-h-[90vh] md:max-h-none overflow-y-auto">
          <div className="space-y-6">
            {/* Close button on top */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-primary">Licence Details</h3>
                <p className="text-xs text-slate-555 font-bold">mParivahan Verified Record</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile-only Smart Card visual (displayed on top of details on mobile) */}
            <div className="flex md:hidden justify-center my-3">
              <div className="relative w-full max-w-[340px] h-[200px] rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 p-4 shadow-xl flex flex-col justify-between overflow-hidden text-slate-950 select-none">
                {/* Hologram / Chip overlays */}
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-4 right-4 w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg opacity-85 border border-amber-300/30 flex items-center justify-center shadow">
                  <div className="w-7 h-7 border border-amber-950/20 rounded flex flex-wrap p-0.5 opacity-70">
                    <div className="w-1/2 h-1/2 border-r border-b border-amber-950/20" />
                    <div className="w-1/2 h-1/2 border-b border-amber-950/20" />
                    <div className="w-1/2 h-1/2 border-r border-amber-950/20" />
                    <div className="w-1/2 h-1/2" />
                  </div>
                </div>
                
                {/* Header */}
                <div className="flex items-start gap-2 border-b border-sky-100 pb-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-[16px]">🦁</div>
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-widest text-sky-700">Driving Licence</p>
                    <p className="text-[10px] font-bold uppercase leading-none text-slate-900">Republic of India</p>
                  </div>
                </div>

                {/* Body */}
                <div className="flex gap-3 my-2 items-center">
                  <div className="w-16 h-20 bg-white border border-sky-200 rounded-lg flex flex-col items-center justify-center overflow-hidden relative">
                    <User className="w-10 h-10 text-sky-600 opacity-80" />
                    <div className="absolute bottom-0 inset-x-0 bg-sky-100 py-0.5 text-center text-[6px] font-black text-sky-700 tracking-wider uppercase">Photo</div>
                    <div className="absolute inset-x-0 h-0.5 bg-sky-400 opacity-30 animate-bounce top-1/4" />
                  </div>
                  
                  <div className="flex-1 text-left space-y-1 font-mono text-[10px] text-slate-900">
                    <div>
                      <span className="text-slate-500 text-[8px]">LIC No:</span>
                      <p className="font-bold text-sky-850 text-xs tracking-wider leading-none">{lic.dlNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[8px]">Name:</span>
                      <p className="font-bold uppercase text-slate-950 truncate max-w-[150px] leading-none">{lic.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <span className="text-slate-500 text-[8px]">DOB:</span>
                        <p className="font-bold text-slate-900 leading-none">{lic.dob.split(" ").slice(0, 2).join(" ")}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px]">Class:</span>
                        <p className="font-bold text-slate-900 leading-none">{lic.vehicleClass}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-sky-100 pt-1 text-[8px] text-slate-500">
                  <span className="uppercase">State code: {lic.dlNumber.slice(0,2)}</span>
                  <span className="font-bold text-sky-750">Valid Till: {lic.expiry}</span>
                </div>
              </div>
            </div>

            {/* Data Grid list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                {label:"DL Number",    value:lic.dlNumber,     icon:IdCard  },
                {label:"Full Name",    value:lic.name,         icon:User    },
                {label:"Date of Birth",value:lic.dob,          icon:Calendar},
                {label:"Issue Date",   value:lic.issueDate,    icon:Calendar},
                {label:"Valid Until",  value:lic.expiry,       icon:Calendar},
                {label:"Vehicle Class",value:lic.vehicleClass, icon:Car     },
                {label:"Address",      value:lic.address,      icon:MapPin  },
              ].map(({label,value,icon:Icon},i) => (
                <div key={i} className={`bg-slate-50 border border-slate-100 rounded-xl p-3 ${i===6?"sm:col-span-2":""}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-primary"/>
                    <p className="text-[10px] text-slate-500 font-semibold">{label}</p>
                  </div>
                  <p className="text-xs font-extrabold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex justify-center">
            {lic.status==="expired" ? (
              <Button onClick={() => { onClose(); onModal("apply"); }} className="w-full sm:w-2/3 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-xs h-10 shadow-lg shadow-primary/25 transition-all duration-300 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 mr-1.5"/> Renew Licence
              </Button>
            ) : (
              <Button disabled className="w-full sm:w-2/3 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed text-xs h-10 flex items-center justify-center" title="Licence is valid. Renew only when expired.">
                <BadgeCheck className="w-4 h-4 mr-1.5"/> Renew Licence (Active)
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── Custom DatePicker ─────────────── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS = Array.from({length:126},(_,i)=>2025-i);
const DAYS = Array.from({length:31},(_,i)=>i+1);

function DatePicker({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  const [day,month,year] = value.split("/").map(Number);
  const activeDay = isFinite(day)&&day>=1&&day<=31?day:DAYS[0];
  const activeMonth = isFinite(month)&&month>=1&&month<=12?month:1;
  const activeYear = isFinite(year)?year:YEARS[55];
  const handleDrop = (d:number,m:number,y:number) => onChange(`${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`);
  const selectCls = "px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer hover:border-slate-300";
  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Day */}
      <div className="relative">
        <select value={activeDay} onChange={e=>handleDrop(Number(e.target.value),activeMonth,activeYear)} className={selectCls + " w-full pr-8"}>
          {DAYS.map(d=> <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"/>
      </div>
      {/* Month */}
      <div className="relative">
        <select value={activeMonth} onChange={e=>handleDrop(activeDay,Number(e.target.value),activeYear)} className={selectCls + " w-full pr-8"}>
          {MONTHS.map((_,i)=> <option key={i+1} value={i+1}>{String(i+1).padStart(2,"0")}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"/>
      </div>
      {/* Year */}
      <div className="relative">
        <select value={activeYear} onChange={e=>handleDrop(activeDay,activeMonth,Number(e.target.value))} className={selectCls + " w-full pr-8"}>
          {YEARS.map(y=> <option key={y} value={y}>{y}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"/>
      </div>
    </div>
  );
}

/* ─────────────── Add Modal ─────────────── */
function AddModal({ title, fields, onClose, onSubmit, loading }: {
  title:string;
  fields:{label:string;placeholder:string;type?:string}[];
  onClose:()=>void;
  onSubmit?:(values:Record<string,string>)=>void;
  loading?:boolean;
}) {
  const [values, setValues] = useState<Record<string,string>>({});
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-950">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-950">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors"><X className="w-4 h-4"/></button>
        </div>
        <div className="space-y-3">
          {fields.map(({label,placeholder,type="text"},i) => (
            <div key={i}>
              <label className="text-xs text-slate-550 font-bold mb-1 block">{label}</label>
              {type === "date" ? (
                <DatePicker value={values[label]??""} onChange={v=>setValues(vv=>({...vv,[label]:v}))}/>
              ) : (
                <input type="text" placeholder={placeholder} value={values[label]??""}
                  onChange={e=>{
                    let val = e.target.value;
                    if (label === "DL Number" || label === "Vehicle Number") val = val.toUpperCase();
                    setValues(v=>({...v,[label]:val}));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/45 transition-colors uppercase"/>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center pt-1">
          <Button onClick={()=>onSubmit ? onSubmit(values) : onClose()} disabled={loading} className="w-1/2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-bold transition-all text-white">
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : "Submit"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── Add Vehicle Modal ─────────────── */
function AddVehicleModal({ onClose, onSubmit, loading }: { onClose:()=>void; onSubmit?:(values:Record<string,string>)=>void; loading?:boolean }) {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [maskEngine, setMaskEngine] = useState(true);
  const [maskChassis, setMaskChassis] = useState(true);

  const formatVehicleNumber = (val:string) => {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (v.length <= 2) return v;
    if (v.length <= 4) return v.slice(0,2) + " " + v.slice(2);
    if (v.length <= 6) return v.slice(0,2) + " " + v.slice(2,4) + " " + v.slice(4);
    return v.slice(0,2) + " " + v.slice(2,4) + " " + v.slice(4,6) + " " + v.slice(6,10);
  };

  const maskValue = (val:string) => {
    if (val.length <= 5) return val;
    return "*****" + val.slice(-5);
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    onSubmit({
      "Vehicle Number": vehicleNumber,
      "Engine Number": engineNumber,
      "Chassis Number": chassisNumber,
    });
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-950">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-950">Add New Vehicle</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors"><X className="w-4 h-4"/></button>
        </div>

        <div className="space-y-3">
          {/* Vehicle Number */}
          <div>
            <label className="text-xs text-slate-550 font-bold mb-1 block">Vehicle Number</label>
            <input type="text" placeholder="DL 01 AB 1234" value={formatVehicleNumber(vehicleNumber)}
              onChange={e=>{
                const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                setVehicleNumber(raw.slice(0,10));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/45 uppercase tracking-wider"/>
          </div>

          {/* Engine Number - Masked, 5 digits only */}
          <div>
            <label className="text-xs text-slate-550 font-bold mb-1 block">Engine Number (last 5 digits)</label>
            <input type="text" placeholder="Enter 5 digits" value={maskEngine ? maskValue(engineNumber) : engineNumber}
              onFocus={()=>setMaskEngine(false)}
              onBlur={()=>setMaskEngine(true)}
              onChange={e=>{
                const val = e.target.value.replace(/\D/g, "");
                setEngineNumber(val.slice(0,5));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/45 tracking-wider"/>
          </div>

          {/* Chassis Number - Masked, 5 digits only */}
          <div>
            <label className="text-xs text-slate-550 font-bold mb-1 block">Chassis Number (last 5 digits)</label>
            <input type="text" placeholder="Enter 5 digits" value={maskChassis ? maskValue(chassisNumber) : chassisNumber}
              onFocus={()=>setMaskChassis(false)}
              onBlur={()=>setMaskChassis(true)}
              onChange={e=>{
                const val = e.target.value.replace(/\D/g, "");
                setChassisNumber(val.slice(0,5));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/45 tracking-wider"/>
          </div>
        </div>

        <div className="flex justify-center pt-1">
          <Button onClick={handleSubmit} disabled={loading || !vehicleNumber} className="w-1/2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-bold transition-all text-white">
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : "Submit"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── Apply Licence — Sarathi Parivahan Guide ─────────────── */
function ApplyLicenceWizard({ onClose, onSubmit, loading }: { onClose:()=>void; onSubmit?:(values:Record<string,string>)=>void; loading?:boolean }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [activeTab, setActiveTab] = useState<"process"|"docs"|"apply">("process");

  const handleSubmit = () => {
    if (!onSubmit) return;
    onSubmit({ "Licence Type": "Learner", "Name": name, "Mobile": mobile, "City": city });
  };

  const STEPS = [
    { num: 1, title: "State Select", desc: "Sarathi Parivahan portal par apna state select karo" },
    { num: 2, title: "Apply for LL", desc: "'Apply for Learner Licence' pe click karo" },
    { num: 3, title: "Aadhaar OTP", desc: "Aadhaar OTP se verify karo" },
    { num: 4, title: "Form Fill", desc: "Sarathi form fill karo" },
    { num: 5, title: "Upload Docs", desc: "Documents upload karo" },
    { num: 6, title: "Pay Fees", desc: "Fees pay karo (Rs.200-500)" },
    { num: 7, title: "Book Test", desc: "Online test slot book karo" },
    { num: 8, title: "Download LL", desc: "Pass hone ke baad download karo" },
  ];

  const DOCS = [
    { name: "Aadhaar Card", required: true },
    { name: "Age Proof (10th Marksheet / Birth Certificate)", required: true },
    { name: "Address Proof", required: true },
    { name: "Passport Photo", required: true },
    { name: "Signature Scan", required: true },
    { name: "Mobile linked with Aadhaar", required: true },
  ];

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl text-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Apply for Learner Licence</h3>
            <p className="text-xs text-slate-500 font-semibold">Sarathi Parivahan Portal</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors"><X className="w-4 h-4"/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(["process","docs","apply"] as const).map((t) => (
            <button key={t} onClick={()=>setActiveTab(t)}
              className={`flex-1 py-3 text-xs font-extrabold capitalize transition-colors ${activeTab===t ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-950"}`}>
              {t === "process" ? "Steps" : t === "docs" ? "Documents" : "Apply"}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Process Tab */}
          {activeTab === "process" && (
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={step.num} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">{step.num}</div>
                    {i < STEPS.length - 1 && <div className="w-0.5 h-6 bg-slate-200 mt-1"/>}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-extrabold text-slate-950">{step.title}</p>
                    <p className="text-xs text-slate-500 font-semibold">{step.desc}</p>
                  </div>
                </div>
              ))}
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                <p className="text-xs text-primary font-bold">Tip: Online test ke liye camera ON rakho, tab switch mat karo.</p>
              </div>
            </div>
          )}

          {/* Docs Tab */}
          {activeTab === "docs" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-bold">Ye documents ready rakho:</p>
              {DOCS.map((doc) => (
                <div key={doc.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">✓</div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-950 font-bold">{doc.name}</p>
                    {doc.required && <p className="text-[10px] text-red-650 font-bold">Required</p>}
                  </div>
                </div>
              ))}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                <p className="text-xs font-extrabold text-slate-950">Fees (approx)</p>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Learner Licence</span>
                  <span className="text-slate-950 font-extrabold">Rs.200 - Rs.500</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>DL Test + Smart Card</span>
                  <span className="text-slate-950 font-extrabold">Rs.400 - Rs.500</span>
                </div>
              </div>
            </div>
          )}

          {/* Apply Tab */}
          {activeTab === "apply" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 text-center font-semibold">Aapka details - hum aapko guide karenge</p>
              <div>
                <label className="text-xs text-slate-550 font-bold mb-1 block">Full Name</label>
                <input type="text" placeholder="Aapka naam" value={name}
                  onChange={e=>setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/45"/>
              </div>
              <div>
                <label className="text-xs text-slate-550 font-bold mb-1 block">Mobile Number</label>
                <input type="tel" placeholder="98XXXXXXXX" value={mobile}
                  onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/45"/>
              </div>
              <div>
                <label className="text-xs text-slate-550 font-bold mb-1 block">City</label>
                <input type="text" placeholder="Jaipur, Delhi, Mumbai..." value={city}
                  onChange={e=>setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/45"/>
              </div>
              <Button onClick={handleSubmit} disabled={loading || !name || !mobile || !city} className="w-full rounded-xl bg-primary hover:bg-primary/90 h-11 shadow-lg shadow-primary/25 font-bold transition-all text-white">
                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : "Submit - We will Contact You"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── HOME — Two Big Boxes ─────────────── */
function HomePage({ licences, vehicles, onNav }: { licences: LicRow[]; vehicles: VehRow[]; onNav:(v:"licences"|"vehicles")=>void }) {
  const activeLicCount = licences.filter(l => l.status === "valid" || l.status === "expiring").length;
  const expiredLicCount = licences.filter(l => l.status === "expired").length;

  const totalVehicles = vehicles.length;
  const actionRequiredVehicles = vehicles.filter(v => !allOk(v)).length;

  return (
    <motion.div key="home" variants={pageVariants} initial="enter" animate="center" exit="exit"
      transition={{type:"spring",stiffness:280,damping:28}} className="grid md:grid-cols-2 gap-6">

      {/* Licence Box */}
      <motion.button onClick={()=>onNav("licences")} whileHover={{scale:1.02,y:-4}} whileTap={{scale:0.98}}
        transition={{type:"spring",stiffness:340,damping:22}}
        className="relative group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left p-8 min-h-[240px] flex flex-col justify-between cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-all duration-500"/>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]"/>
        
        {/* Holographic Licence Background Image */}
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-500"
          style={{ backgroundImage: "url('/images/licence_bg.png')" }} />

        <motion.div animate={{y:[0,-6,0]}} transition={{repeat:Infinity,duration:3,ease:"easeInOut"}}
          className="absolute top-6 right-6 w-20 h-20 rounded-2xl bg-primary/5 border border-slate-200 flex items-center justify-center pointer-events-none z-10">
          <IdCard className="w-10 h-10 text-primary opacity-45"/>
        </motion.div>
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-3xs">
            <IdCard className="w-7 h-7 text-primary"/>
          </div>
          <h2 className="text-2xl font-bold text-slate-950 mb-2">Driving Licence</h2>
          <p className="text-slate-650 text-xs leading-relaxed font-semibold">View, link, and renew your driving credentials. Access step-by-step guidance on RTO Sarathi Parivahan updates.</p>
        </div>
        <div className="relative z-10 flex items-center gap-2 mt-6 flex-wrap font-bold">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 shadow-3xs">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"/>{activeLicCount} Active
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 shadow-3xs">
            <AlertTriangle className="w-3 h-3 text-red-600"/>{expiredLicCount} Expired
          </span>
          <div className="ml-auto flex items-center gap-1 text-xs text-primary font-bold">Manage DL <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"/></div>
        </div>
      </motion.button>
 
      {/* Vehicle Box */}
      <motion.button onClick={()=>onNav("vehicles")} whileHover={{scale:1.02,y:-4}} whileTap={{scale:0.98}}
        transition={{type:"spring",stiffness:340,damping:22}}
        className="relative group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left p-8 min-h-[240px] flex flex-col justify-between cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] group-hover:bg-amber-500/10 transition-all duration-500"/>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px]"/>

        {/* Holographic Vehicles Background Image */}
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-500"
          style={{ backgroundImage: "url('/images/vehicles_bg.png')" }} />

        <motion.div animate={{y:[0,-6,0]}} transition={{repeat:Infinity,duration:3.4,ease:"easeInOut",delay:0.5}}
          className="absolute top-6 right-6 w-20 h-20 rounded-2xl bg-amber-500/5 border border-slate-200 flex items-center justify-center pointer-events-none z-10">
          <Car className="w-10 h-10 text-primary opacity-45"/>
        </motion.div>
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-3xs">
            <Car className="w-7 h-7 text-primary"/>
          </div>
          <h2 className="text-2xl font-bold text-slate-950 mb-2">My Registered Vehicles</h2>
          <p className="text-slate-650 text-xs leading-relaxed font-semibold">Monitor registration documents, Pollution checks (PUC), comprehensive insurance, and recent road challans.</p>
        </div>
        <div className="relative z-10 flex items-center gap-2 mt-6 flex-wrap font-bold">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 shadow-3xs">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"/>{totalVehicles} Vehicle{totalVehicles !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 shadow-3xs">
            <AlertTriangle className="w-3 h-3 text-amber-600"/>{actionRequiredVehicles} Action Required
          </span>
          <div className="ml-auto flex items-center gap-1 text-xs text-primary font-bold">Manage Fleet <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"/></div>
        </div>
      </motion.button>
    </motion.div>
  );
}

type VehRow = typeof VEHICLES[0];
type LicRow = { id:number; dlNumber:string; name:string; dob:string; issueDate:string; expiry:string; status:"valid"|"expired"|"expiring"; vehicleClass:string; address:string };

/* ─────────────── LICENCE LIST PAGE ─────────────── */
function LicencesPageWithData({
  licences,
  onBack,
  onModal,
  selectedLicence: propSelectedLicence,
  onSelectLicence: propOnSelectLicence,
}: {
  licences: LicRow[];
  onBack: () => void;
  onModal: (m: "licence" | "apply") => void;
  selectedLicence?: any | null;
  onSelectLicence?: (lic: any | null) => void;
}) {
  const [localSelectedLic, setLocalSelectedLic] = useState<LicRow | null>(null);
  const selectedLic = propSelectedLicence !== undefined ? propSelectedLicence : localSelectedLic;
  const setSelectedLic = propOnSelectLicence !== undefined ? propOnSelectLicence : setLocalSelectedLic;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "action">("default");

  const filteredAndSortedLicences = useMemo(() => {
    let result = [...licences];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cleanQ = q.replace(/[^a-z0-9]/g, "");
      result = result.filter(lic => {
        const cleanDL = lic.dlNumber.toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          lic.name.toLowerCase().includes(q) ||
          cleanDL.includes(cleanQ) ||
          lic.dlNumber.toLowerCase().includes(q) ||
          lic.vehicleClass.toLowerCase().includes(q) ||
          lic.address.toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === "action") {
      result.sort((a, b) => {
        const score = (status: string) => {
          if (status === "expired") return 2;
          if (status === "expiring") return 1;
          return 0;
        };
        return score(b.status) - score(a.status);
      });
    }

    return result;
  }, [licences, searchQuery, sortBy]);

  return (
    <motion.div key="licences" variants={pageVariants} initial="enter" animate="center" exit="exit"
      transition={{type:"spring",stiffness:280,damping:28}} className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4"/> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={()=>onModal("apply")} variant="outline" className="rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10 h-8 px-3">Apply New</Button>
          <Button size="sm" onClick={()=>onModal("licence")} className="rounded-xl text-xs bg-primary hover:bg-primary/90 h-8 px-3"><Plus className="w-3 h-3 mr-1"/>Add</Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Your Licences</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-semibold">{filteredAndSortedLicences.length} licence{filteredAndSortedLicences.length!==1?"s":""} showing</p>
        </div>
        
        {/* Search and Sort controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px] sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or DL number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-xs focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
          <div className="relative min-w-[155px]">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-slate-950 text-xs focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer hover:border-slate-300 font-medium"
            >
              <option value="default">Default Order</option>
              <option value="action">Sort: Action Needed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredAndSortedLicences.map(lic => (
          <LicenceCard key={lic.id} lic={lic} onClick={() => setSelectedLic(lic)}/>
        ))}
        {filteredAndSortedLicences.length===0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 col-span-2">
            <p className="text-slate-550 text-sm font-semibold">No matching licences found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedLic && (
          <LicenceDetailsModal lic={selectedLic} onClose={() => setSelectedLic(null)} onModal={onModal}/>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────── VEHICLES LIST PAGE ─────────────── */
function VehiclesPageWithData({ vehicles, onBack, onSelect, onModal }: { vehicles:VehRow[]; onBack:()=>void; onSelect:(v:VehRow)=>void; onModal:()=>void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "action">("default");

  const filteredAndSortedVehicles = useMemo(() => {
    let result = [...vehicles];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cleanQ = q.replace(/[^a-z0-9]/g, "");
      result = result.filter(v => {
        const cleanNumber = v.number.toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          v.name.toLowerCase().includes(q) ||
          cleanNumber.includes(cleanQ) ||
          v.number.toLowerCase().includes(q) ||
          v.owner.toLowerCase().includes(q) ||
          v.color.toLowerCase().includes(q) ||
          v.fuelType.toLowerCase().includes(q) ||
          v.rto.toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === "action") {
      result.sort((a, b) => {
        const needsAction = (v: VehRow) => {
          let score = 0;
          if (v.fitness.status === "expired") score += 3;
          else if (v.fitness.status === "expiring") score += 1;

          if (v.insurance.status === "expired") score += 3;
          else if (v.insurance.status === "expiring") score += 1;

          if (v.puc.status === "expired") score += 3;
          else if (v.puc.status === "expiring") score += 1;

          if (v.challans.length > 0) score += 2;
          return score;
        };
        return needsAction(b) - needsAction(a);
      });
    }

    return result;
  }, [vehicles, searchQuery, sortBy]);

  return (
    <motion.div key="vehicles" variants={pageVariants} initial="enter" animate="center" exit="exit"
      transition={{type:"spring",stiffness:280,damping:28}} className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4"/> Dashboard
        </button>
        <Button size="sm" onClick={onModal} className="rounded-xl text-xs bg-primary hover:bg-primary/90 h-8 px-3 text-white"><Plus className="w-3 h-3 mr-1"/>Add Vehicle</Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Your Vehicles</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-semibold">{filteredAndSortedVehicles.length} vehicle{filteredAndSortedVehicles.length!==1?"s":""} showing</p>
        </div>
        
        {/* Search and Sort controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px] sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by model, plate, or owner..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder:text-slate-400 text-xs focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
          <div className="relative min-w-[155px]">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-slate-950 text-xs focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer hover:border-slate-300 font-medium"
            >
              <option value="default">Default Order</option>
              <option value="action">Sort: Action Needed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredAndSortedVehicles.map((v,i) => {
          const ok = allOk(v);
          const issues: string[] = [];
          if (v.fitness.status!=="valid")   issues.push("Fitness");
          if (v.insurance.status!=="valid") issues.push("Insurance");
          if (v.puc.status!=="valid")       issues.push("PUC");
          if (v.challans.length>0)          issues.push(`${v.challans.length} Challan${v.challans.length>1?"s":""}`);
          return (
            <motion.button key={v.id} onClick={()=>onSelect(v)}
              initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              whileHover={{scale:1.015,x:4}} whileTap={{scale:0.98}}
              className="w-full text-left rounded-2xl border border-slate-200 bg-white hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all p-3 sm:p-4 group shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Car className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-primary"/>
                  </div>
                  <ChevronRight className="sm:hidden w-4 h-4 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0"/>
                </div>
                <div className="flex-1 min-w-0">
                  {/* Vehicle Number + Model Name */}
                  <p className="font-extrabold text-slate-950 text-sm sm:text-base truncate">{v.number}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-mono font-bold truncate">{v.name}</p>
                  {ok
                    ? <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-green-700 mt-1.5 font-bold"><CheckCircle2 className="w-3 h-3"/>All OK</span>
                    : <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-800 mt-1.5 font-bold truncate" title={issues.join(" · ")}><AlertTriangle className="w-3 h-3 flex-shrink-0"/>{issues.join(" · ")}</span>
                  }
                </div>
                <ChevronRight className="hidden sm:block w-5 h-5 text-slate-500 group-hover:text-primary transition-colors flex-shrink-0"/>
              </div>
            </motion.button>
          );
        })}
        {filteredAndSortedVehicles.length===0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 col-span-2">
            <p className="text-slate-550 text-sm font-semibold">No matching vehicles found.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────── Root VehicleTab ─────────────── */
type View = "home"|"licences"|"vehicles"|"vehicle-detail";

interface VehicleTabProps {
  apiLicences?: ApiLicence[] | null;
  setApiLicences?: React.Dispatch<React.SetStateAction<ApiLicence[] | null>>;
  apiVehicles?: ApiVehicle[] | null;
  setApiVehicles?: React.Dispatch<React.SetStateAction<ApiVehicle[] | null>>;
  view?: View;
  onViewChange?: (view: View) => void;
  selectedVehicle?: typeof VEHICLES[0] | null;
  onSelectVehicle?: (v: typeof VEHICLES[0] | null) => void;
  selectedLicence?: any | null;
  onSelectLicence?: (lic: any | null) => void;
}

export default function VehicleTab({
  apiLicences: propApiLicences,
  setApiLicences: propSetApiLicences,
  apiVehicles: propApiVehicles,
  setApiVehicles: propSetApiVehicles,
  view: propView,
  onViewChange: propOnViewChange,
  selectedVehicle: propSelectedVehicle,
  onSelectVehicle: propOnSelectVehicle,
  selectedLicence: propSelectedLicence,
  onSelectLicence: propOnSelectLicence,
}: VehicleTabProps = {}) {
  const [localView, setLocalView] = useState<View>("home");
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState<typeof VEHICLES[0]|null>(null);
  const [localSelectedLicence, setLocalSelectedLicence] = useState<any|null>(null);
  const [modal,        setModal]   = useState<"vehicle"|"licence"|"apply"|null>(null);
  const [localApiLicences, setLocalApiLicences] = useState<ApiLicence[] | null>(null);
  const [localApiVehicles, setLocalApiVehicles] = useState<ApiVehicle[] | null>(null);
  const [addLoading,   setAddLoading]   = useState(false);

  const view = propView !== undefined ? propView : localView;
  const setView = propOnViewChange !== undefined ? propOnViewChange : setLocalView;
  const selectedVehicle = propSelectedVehicle !== undefined ? propSelectedVehicle : localSelectedVehicle;
  const setVehicle = propOnSelectVehicle !== undefined ? propOnSelectVehicle : setLocalSelectedVehicle;
  const selectedLicence = propSelectedLicence !== undefined ? propSelectedLicence : localSelectedLicence;
  const setSelectedLicence = propOnSelectLicence !== undefined ? propOnSelectLicence : setLocalSelectedLicence;

  const apiLicences = propApiLicences !== undefined ? propApiLicences : localApiLicences;
  const setApiLicences = propSetApiLicences !== undefined ? propSetApiLicences : setLocalApiLicences;
  const apiVehicles = propApiVehicles !== undefined ? propApiVehicles : localApiVehicles;
  const setApiVehicles = propSetApiVehicles !== undefined ? propSetApiVehicles : setLocalApiVehicles;

  useEffect(() => {
    if (propApiLicences === undefined) {
      api.licences.list().then(l => setApiLicences(l)).catch(() => setApiLicences(null));
    }
    if (propApiVehicles === undefined) {
      api.vehicles.list().then(v => setApiVehicles(v)).catch(() => setApiVehicles(null));
    }
  }, [propApiLicences, propApiVehicles]);

  async function handleAddVehicle(fields: Record<string, string>) {
    setAddLoading(true);
    try {
      const v = await api.vehicles.add({
        registrationNumber: fields["Vehicle Number"] ?? "",
        make: fields["Vehicle Brand"] ?? "",
        model: fields["Model Name"] ?? "",
        year: new Date().getFullYear(),
        fuelType: "Petrol",
      });
      setApiVehicles(prev => prev ? [...prev, v] : [v]);
    } catch { /* silent */ } finally {
      setAddLoading(false);
      setModal(null);
    }
  }

  async function handleAddLicence(fields: Record<string, string>) {
    setAddLoading(true);
    try {
      const l = await api.licences.add({
        licenceNumber: fields["DL Number"] ?? "",
        type: "LMV",
        dob: fields["Date of Birth"] ?? "",
        issueDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 10*365*24*3600*1000).toISOString().split("T")[0],
        state: "Delhi",
        status: "valid",
      });
      setApiLicences(prev => prev ? [...prev, l] : [l]);
    } catch { /* silent */ } finally {
      setAddLoading(false);
      setModal(null);
    }
  }

  function goVehicleDetail(v: typeof VEHICLES[0]) {
    setVehicle(v);
    setView("vehicle-detail");
  }

  type LicenceRow = { id:number; dlNumber:string; name:string; dob:string; issueDate:string; expiry:string; status:"valid"|"expired"|"expiring"; vehicleClass:string; address:string };
  const displayLicences: LicenceRow[] = apiLicences
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
        challans:  [],
      }))
    : VEHICLES;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {view==="home" && (
          <HomePage key="home" licences={displayLicences} vehicles={displayVehicles} onNav={v=>setView(v)}/>
        )}
        {view==="licences" && (
          <LicencesPageWithData key="licences" licences={displayLicences} onBack={()=>setView("home")} onModal={m=>setModal(m)} selectedLicence={selectedLicence} onSelectLicence={setSelectedLicence}/>
        )}
        {view==="vehicles" && (
          <VehiclesPageWithData key="vehicles" vehicles={displayVehicles} onBack={()=>setView("home")} onSelect={goVehicleDetail} onModal={()=>setModal("vehicle")}/>
        )}
        {view==="vehicle-detail" && selectedVehicle && (
          <motion.div key="vehicle-detail" variants={pageVariants} initial="enter" animate="center" exit="exit"
            transition={{type:"spring",stiffness:280,damping:28}}>
            <VehicleDetail vehicle={selectedVehicle} onBack={()=>setView("vehicles")}/>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal==="vehicle" && (
          <AddVehicleModal onClose={()=>setModal(null)} onSubmit={handleAddVehicle} loading={addLoading}/>
        )}
        {modal==="licence" && (
          <AddModal title="Link Existing Licence" onClose={()=>setModal(null)} onSubmit={handleAddLicence} loading={addLoading} fields={[
            {label:"DL Number",    placeholder:"DL-0420110149646"},
            {label:"Date of Birth",placeholder:"DD/MM/YYYY",type:"date"},
          ]}/>
        )}
        {modal==="apply" && (
          <ApplyLicenceWizard onClose={()=>setModal(null)} onSubmit={handleAddLicence} loading={addLoading}/>
        )}
      </AnimatePresence>
    </div>
  );
}
