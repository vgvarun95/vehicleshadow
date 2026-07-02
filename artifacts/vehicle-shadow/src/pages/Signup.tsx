import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.mobile || undefined);
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "name",   type: "text",  placeholder: "Rahul Sharma",       label: "Full Name",     icon: User  },
    { key: "email",  type: "email", placeholder: "you@example.com",    label: "Email Address", icon: Mail  },
    { key: "mobile", type: "tel",   placeholder: "+91 98765 43210",    label: "Mobile Number", icon: Phone },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans overflow-hidden">
      {/* LEFT PANEL */}
      <div className="relative md:w-[55%] bg-slate-900 text-white flex flex-col justify-between p-10 md:p-16 overflow-hidden min-h-[280px]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/25 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-700/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-10" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Vehicle Shadow" className="h-16 md:h-20 object-contain" />
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Join thousands of vehicle owners.</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-12">
              Create your account to manage vehicle details, access genuine spare parts, connect with mechanics, and track your vehicle with GPS.
            </p>
          </motion.div>
          <div className="space-y-4">
            {["Instant access to all vehicle services", "Real-time GPS tracking activated immediately", "24/7 breakdown mechanic support", "Compliance & challan monitoring from day one"].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-slate-300 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm">Already have an account?{" "}
            <button onClick={() => setLocation("/login")} className="text-primary hover:underline font-semibold">Sign in here</button>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-background flex items-center justify-center p-8 md:p-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-[400px]">
          <h2 className="text-3xl font-bold text-foreground mb-1">Create Account</h2>
          <p className="text-muted-foreground mb-6 text-sm">Fill in the details below to get started</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-signup">
            {fields.map(({ key, type, placeholder, label, icon: Icon }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder} required={key !== "mobile"} data-testid={`input-${key}`}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password" required data-testid="input-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-password"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showConfirm ? "text" : "password"} value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password" required data-testid="input-confirm-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} data-testid="button-toggle-confirm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 mt-2"
              data-testid="button-signup-submit">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account...</span> : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => setLocation("/login")} className="text-primary hover:underline font-semibold" data-testid="link-to-login">Login</button>
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a> and{" "}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
