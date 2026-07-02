import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

type Step = 1 | 2 | 3 | 4;

const stepVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -40 },
};

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [step, setStep]               = useState<Step>(1);
  const [email, setEmail]             = useState("");
  const [otpMethod, setOtpMethod]     = useState<"mobile" | "email" | null>(null);
  const [otp, setOtp]                 = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [serverOtp, setServerOtp]     = useState(""); // stores OTP returned from dev API

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  }

  async function handleStep1() {
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      setServerOtp(res.otp); // dev mode: API returns OTP directly
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    const otpStr = otp.join("");
    setLoading(true);
    try {
      await api.auth.verifyOtp(email, otpStr);
      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.auth.resetPassword(email, otp.join(""), newPassword);
      setLocation("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  const stepTitles: Record<Step, string> = { 1: "Verify Account", 2: "Choose OTP Method", 3: "Enter OTP", 4: "Reset Password" };
  const stepDesc: Record<Step, string>   = {
    1: "Enter your registered email address",
    2: "How would you like to receive your OTP?",
    3: `OTP sent to your ${otpMethod === "mobile" ? "mobile number" : "email address"}`,
    4: "Create a new secure password for your account",
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-700/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-10">
        <div className="mb-8">
          <button onClick={() => step === 1 ? setLocation("/login") : setStep((step - 1) as Step)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" /> {step === 1 ? "Back to Login" : "Go Back"}
          </button>
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Vehicle Shadow" className="h-12 object-contain" />
          </div>
          <div className="flex gap-2 mb-8">
            {([1, 2, 3, 4] as Step[]).map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-primary" : "bg-slate-800"}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 className="text-3xl font-bold text-white mb-2">{stepTitles[step]}</h2>
              <p className="text-slate-400 text-sm">{stepDesc[step]}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Email */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" data-testid="input-identifier"
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all text-sm" />
                </div>
                <Button onClick={handleStep1} disabled={!email.trim() || loading}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-base" data-testid="button-continue-step1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                </Button>
              </motion.div>
            )}

            {/* STEP 2 — OTP Method */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                {serverOtp && (
                  <div className="bg-primary/10 border border-primary/30 text-primary text-xs px-4 py-3 rounded-xl mb-2">
                    Dev Mode — Your OTP: <span className="font-mono font-bold text-base tracking-widest">{serverOtp}</span>
                  </div>
                )}
                {[
                  { method: "mobile" as const, icon: Phone, label: "OTP via Mobile", desc: "Get a 6-digit code on your registered number" },
                  { method: "email"  as const, icon: Mail,  label: "OTP via Email",  desc: "Get a 6-digit code in your inbox" },
                ].map(({ method, icon: Icon, label, desc }) => (
                  <button key={method}
                    onClick={() => { setOtpMethod(method); setStep(3); }}
                    data-testid={`button-otp-${method}`}
                    className="w-full flex items-center gap-4 p-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-primary/60 hover:bg-slate-800 transition-all group text-left">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{label}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* STEP 3 — Enter OTP */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  {serverOtp && (
                    <div className="bg-primary/10 border border-primary/30 text-primary text-xs px-4 py-3 rounded-xl mb-6 text-center">
                      Dev OTP: <span className="font-mono font-bold text-lg tracking-widest">{serverOtp}</span>
                    </div>
                  )}
                  <div className="flex justify-center gap-3 mb-8">
                    {otp.map((digit, i) => (
                      <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)} data-testid={`input-otp-${i}`}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all" />
                    ))}
                  </div>
                  <p className="text-center text-slate-400 text-sm mb-6">
                    Didn't receive it?{" "}
                    <button onClick={handleStep1} className="text-primary hover:underline font-medium" data-testid="button-resend-otp">Resend OTP</button>
                  </p>
                </div>
                <Button onClick={handleVerifyOtp} disabled={otp.some((d) => !d) || loading}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-base" data-testid="button-verify-otp">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP"}
                </Button>
              </motion.div>
            )}

            {/* STEP 4 — New Password */}
            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password" data-testid="input-new-password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password" data-testid="input-confirm-password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all text-sm" />
                  </div>
                </div>
                <Button onClick={handleResetPassword} disabled={!newPassword || newPassword !== confirmPassword || loading}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-base" data-testid="button-update-password">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Update Password</>}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step !== 4 && (
          <p className="text-center text-slate-500 text-sm mt-6">
            Remembered your password?{" "}
            <button onClick={() => setLocation("/login")} className="text-primary hover:underline font-medium" data-testid="link-back-login">Login</button>
          </p>
        )}
      </div>
    </div>
  );
}
