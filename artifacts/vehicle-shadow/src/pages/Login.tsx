import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, MapPin, Wrench, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT PANEL */}
      <div className="relative flex-1 bg-slate-900 text-white flex flex-col justify-between p-10 md:p-16 overflow-hidden min-h-[320px] md:min-h-screen">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-10" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="Vehicle Shadow" className="h-16 md:h-20 object-contain" />
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Your complete vehicle management solution.</h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-12">
            Manage vehicle details, avoid challans, track GPS, find spare parts and mechanics — all in one platform.
          </p>
          <div className="space-y-5">
            {[
              { icon: ShieldCheck, text: "Compliance alerts & challan monitoring" },
              { icon: MapPin,      text: "Real-time GPS tracking for all vehicles" },
              { icon: Wrench,      text: "On-demand mechanics & genuine spare parts" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12 border-t border-slate-800 pt-8">
          <p className="text-slate-500 text-sm">Trusted by <span className="text-primary font-semibold">10,000+</span> vehicle owners across India</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-background flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-[380px]">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8 text-sm">Sign in to your Vehicle Shadow account</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-login">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required data-testid="input-email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                  required data-testid="input-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-password"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all"
              data-testid="button-login-submit">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in...</span> : "Login"}
            </Button>
          </form>

          <div className="flex justify-between mt-5 text-sm">
            <button onClick={() => setLocation("/forgot-password")} className="text-primary hover:underline font-medium" data-testid="link-forgot-password">Forgot Password?</button>
            <button onClick={() => setLocation("/signup")} className="text-primary hover:underline font-medium" data-testid="link-create-account">Create New Account</button>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-xl border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Demo Account</p>
            <p className="text-xs text-foreground">Email: <span className="font-mono text-primary">rahul@vehicleshadow.in</span></p>
            <p className="text-xs text-foreground">Password: <span className="font-mono text-primary">rahul123</span></p>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            By logging in, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
