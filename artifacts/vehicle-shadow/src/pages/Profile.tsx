import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, Calendar, BadgeCheck, AlertTriangle, IdCard } from "lucide-react";
import { LICENCES } from "@/data/mockData";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const validCount = LICENCES.filter(l => l.status === "valid").length;
  const expiredCount = LICENCES.filter(l => l.status === "expired").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Vehicle Shadow" className="h-10 object-contain cursor-pointer" onClick={() => setLocation("/")} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="text-slate-550 hover:text-slate-950 text-xs font-semibold gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border border-primary/20">
            {user?.name?.[0]?.toUpperCase() ?? <User className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950">{user?.name ?? "User"}</h1>
            <p className="text-slate-500 font-semibold text-sm">{user?.email ?? "No email"}</p>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-550 font-bold">Email</p>
              <p className="text-sm font-bold text-slate-950">{user?.email ?? "N/A"}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-550 font-bold">Phone</p>
              <p className="text-sm font-bold text-slate-950">{user?.phone ?? "N/A"}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-550 font-bold">Member Since</p>
              <p className="text-sm font-bold text-slate-950">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </motion.div>

        {/* Licence Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-extrabold text-slate-950 mb-4 flex items-center gap-2">
            <IdCard className="w-5 h-5 text-primary" /> Licence Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-3xs">
              <div className="text-2xl font-black text-green-700">{validCount}</div>
              <div className="text-xs text-green-700 font-bold mt-1">Valid</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center shadow-3xs">
              <div className="text-2xl font-black text-red-700">{expiredCount}</div>
              <div className="text-xs text-red-750 font-bold mt-1">Expired</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-3xs">
              <div className="text-2xl font-black text-blue-700">{LICENCES.length}</div>
              <div className="text-xs text-blue-750 font-bold mt-1">Total</div>
            </div>
          </div>
          <div className="space-y-2">
            {LICENCES.map(lic => (
              <div key={lic.id} className={`flex items-center justify-between p-3 rounded-xl border ${lic.status === "expired" ? "bg-red-50 border-red-200 text-red-955" : "bg-green-50 border-green-200 text-green-955"}`}>
                <div className="flex items-center gap-3">
                  {lic.status === "expired" ? (
                    <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0" />
                  ) : (
                    <BadgeCheck className="w-5 h-5 text-green-700 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">{lic.dlNumber}</p>
                    <p className="text-xs text-slate-600 font-bold">{lic.vehicleClass} • Exp: {lic.expiry}</p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${lic.status === "expired" ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}`}>
                  {lic.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => { logout(); setLocation("/login"); }}
            variant="outline"
            className="rounded-xl border-red-250 text-red-600 hover:bg-red-50 hover:text-red-700 px-6 font-bold bg-white"
          >
            Logout
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
