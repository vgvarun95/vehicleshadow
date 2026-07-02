import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Award, FileText, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApplyLicence() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Vehicle Shadow" className="h-10 object-contain cursor-pointer" onClick={() => setLocation("/dashboard")} />
          </div>

          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="text-slate-550 hover:text-slate-950 text-xs font-semibold gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-slate-100 border-b border-slate-200 text-slate-950">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"linear-gradient(rgba(0,0,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,1) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-primary/5 rounded-full blur-[80px]"/>
        <div className="absolute -bottom-16 right-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px]"/>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
              <Award className="w-3.5 h-3.5" /> Ministry of Road Transport Official Assistant
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold leading-tight">
              Driving Licence Apply Karna Ab Hua <span className="text-primary">Easy!</span>
            </h2>

            <p className="mt-6 text-slate-600 text-base leading-relaxed max-w-lg font-semibold">
              Learning Licence, Permanent DL, Test Booking aur Document Upload — sab ek jagah dynamic tracking ke sath.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">
              <Button size="lg" className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 h-12 shadow-lg shadow-primary/20">
                Start Application
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-200 px-6 h-12 font-bold bg-white">
                Learn More
              </Button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-slate-950">
            <h3 className="text-xl font-extrabold mb-6">Quick Licence Service Form</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98100 01111"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Select Service</label>
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-primary/60 select-reset cursor-pointer font-medium">
                  <option>Learner Licence</option>
                  <option>Permanent Driving Licence</option>
                  <option>DL Renewal</option>
                  <option>Mock Test Practice</option>
                </select>
              </div>

              <Button className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/10">
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary tracking-widest uppercase">DL Features</span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold mt-3 text-slate-950">Our DL Assistance Services</h2>
          <p className="text-slate-500 font-semibold mt-3 text-sm">
            Fast, simple, and fully guided online driving license processing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Learning Licence", icon: "📝", desc: "Get online learning license guidance with practice tests." },
            { title: "Permanent DL", icon: "🚗", desc: "Step-by-step assistance for booking tests and DL issuance." },
            { title: "Online Test Practice", icon: "💻", desc: "Interactive practice exams in local languages to pass RTO tests." },
            { title: "Document Assistance", icon: "📂", desc: "Instant upload assistance to verify your credentials correctly." },
          ].map((service) => (
            <div
              key={service.title}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-primary/35 hover:shadow-lg transition-all group shadow-sm"
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-extrabold text-slate-950 group-hover:text-primary transition-colors">{service.title}</h3>
              <p className="text-slate-500 mt-2 text-xs leading-relaxed font-semibold">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-slate-100 border-y border-slate-200 py-20 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-extrabold text-slate-950">Simple 4-Step Process</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Choose Service",
              "Upload Documents",
              "Pay Fees",
              "Get Licence Support",
            ].map((step, index) => (
              <div
                key={step}
                className="bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-sm"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-lg font-bold mb-4">
                  {index + 1}
                </div>

                <h3 className="text-base font-extrabold text-slate-950">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "100% Online Process", desc: "No need to visit agents. Apply, prepare, and manage from the comfort of your home." },
            { title: "Fast Support", desc: "Get real-time tracking updates via WhatsApp and SMS about your application status." },
            { title: "Easy Documentation", desc: "We parse your documents instantly to ensure no verification failures occur at RTO." },
          ].map((feat) => (
            <div key={feat.title} className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> {feat.title}
              </h3>
              <p className="text-slate-500 mt-3 text-sm leading-relaxed font-semibold">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <img src="/logo.png" alt="Vehicle Shadow Logo" className="h-8 object-contain mb-4" />
            <p className="mt-3 text-xs opacity-80 leading-relaxed font-semibold">
              Online Driving Licence and Learning Assistance Platform. Secure, verified, and integrated.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs opacity-80 font-semibold">
              <li>Learning Licence</li>
              <li>Permanent DL</li>
              <li>Renewal</li>
              <li>Mock Tests</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Contact Info</h4>
            <p className="text-xs opacity-80 mb-2 font-semibold">📞 +91 98765 43210</p>
            <p className="text-xs opacity-80 font-semibold">📧 support@vehicleshadow.in</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
