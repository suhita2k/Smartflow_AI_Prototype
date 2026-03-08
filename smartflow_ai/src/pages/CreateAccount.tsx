import { useState } from 'react';
import { useAuth, RegisterData } from '../context/AuthContext';
import { Role } from '../types';

interface CreateAccountProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const STEPS = ['Account Info', 'Role & Access', 'Personal Details', 'Review'];

const ROLE_CONFIG: Record<Role, {
  label: string; color: string; bg: string; border: string; desc: string;
  icon: string; perms: string[];
}> = {
  admin: {
    label: 'Administrator', color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/40',
    icon: '👑', desc: 'Full system access. Can manage users, signals, emergency corridors, and all platform settings.',
    perms: ['View Dashboard', 'Manage Signals', 'Trigger Emergency', 'Manage Users', 'View Analytics', 'Resolve Alerts', 'System Settings'],
  },
  operator: {
    label: 'Operator', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/40',
    icon: '🔧', desc: 'Operational access. Can monitor traffic, manage signals, trigger emergency corridors and resolve alerts.',
    perms: ['View Dashboard', 'Manage Signals', 'Trigger Emergency', 'View Analytics', 'Resolve Alerts'],
  },
  viewer: {
    label: 'Viewer', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40',
    icon: '👁️', desc: 'Read-only access. Can view the dashboard and analytics reports without making any changes.',
    perms: ['View Dashboard', 'View Analytics'],
  },
};

const DEPARTMENTS = [
  'Traffic Operations', 'Field Operations', 'Analytics & Reporting',
  'Emergency Services', 'IT & Infrastructure', 'City Planning',
  'Public Safety', 'Administration', 'Research & Development',
];

function PasswordStrength({ password }: { password: string }) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const levels = [
    { label: 'Too Weak', color: 'bg-red-500', text: 'text-red-400' },
    { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-400' },
    { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-400' },
    { label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' },
  ];
  const level = levels[Math.min(score, 4)];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? level.color : 'bg-slate-700'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${level.text}`}>{level.label}</span>
        <div className="flex gap-3 text-xs text-slate-500">
          {Object.entries({
            '8+ chars': checks.length, Uppercase: checks.upper,
            Lowercase: checks.lower, Number: checks.number, Symbol: checks.special,
          }).map(([k, v]) => (
            <span key={k} className={v ? 'text-emerald-400' : 'text-slate-600'}>
              {v ? '✓' : '○'} {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreateAccount({ onBack }: CreateAccountProps) {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<RegisterData & { confirmPassword: string }>({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'viewer', department: '', phone: '', bio: '',
  });

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim() || form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address.';
      if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (step === 1) {
      if (!form.role) newErrors.role = 'Please select a role.';
    }
    if (step === 2) {
      if (!form.department) newErrors.department = 'Please select a department.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => { setStep(s => s - 1); setErrors({}); };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      const { confirmPassword, ...data } = form;
      const res = register(data);
      setResult(res);
      setLoading(false);
      if (res.success) setStep(4);
    }, 1200);
  };

  // Success screen
  if (step === 4 && result?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(99,179,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-slate-400 text-sm mb-2">
              Welcome to SmartFlow AI, <span className="text-cyan-400 font-semibold">{form.name}</span>!
            </p>
            <p className="text-slate-500 text-xs mb-6">
              Your account is <span className="text-yellow-400 font-medium">pending admin approval</span>. You'll receive access once an administrator activates your account.
            </p>
            <div className="bg-slate-800/60 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white">{form.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Role</span>
                <span className={`font-semibold ${ROLE_CONFIG[form.role].color}`}>{ROLE_CONFIG[form.role].icon} {ROLE_CONFIG[form.role].label}</span>
              </div>
              <div className="flex justify-between"><span className="text-slate-400">Department</span><span className="text-white">{form.department}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-yellow-400 font-medium">⏳ Pending Approval</span></div>
            </div>
            <button
              onClick={onBack}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleConf = ROLE_CONFIG[form.role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(99,179,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-blue-500/40 mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">SmartFlow <span className="text-cyan-400">AI</span></h1>
          <p className="text-slate-400 text-xs mt-1">Create your account</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                  ${i < step ? 'bg-cyan-500 border-cyan-500 text-white' :
                    i === step ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' :
                    'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {i < step ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium whitespace-nowrap transition-colors ${i === step ? 'text-cyan-400' : i < step ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mb-4 rounded transition-all duration-500 ${i < step ? 'bg-cyan-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* Step 0: Account Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Account Information</h2>
                <p className="text-slate-400 text-sm mt-1">Set up your login credentials</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition ${errors.name ? 'border-red-500/60 focus:ring-red-500' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400'}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <input
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@smartflow.ai"
                  className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition ${errors.email ? 'border-red-500/60 focus:ring-red-500' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition pr-12 ${errors.password ? 'border-red-500/60 focus:ring-red-500' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPassword
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
                <PasswordStrength password={form.password} />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-2.5 bg-white/10 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition pr-12 ${errors.confirmPassword ? 'border-red-500/60 focus:ring-red-500' : form.confirmPassword && form.password === form.confirmPassword ? 'border-emerald-500/60 focus:ring-emerald-500' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showConfirm
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* Step 1: Role & Access */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Role & Access Level</h2>
                <p className="text-slate-400 text-sm mt-1">Choose the access level for your account</p>
              </div>
              <div className="space-y-3">
                {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, conf]) => (
                  <button
                    key={role}
                    onClick={() => set('role', role)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${form.role === role ? `${conf.bg} ${conf.border}` : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${conf.bg} border ${conf.border}`}>
                        {conf.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${form.role === role ? conf.color : 'text-white'}`}>{conf.label}</span>
                          {form.role === role && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conf.bg} ${conf.color} border ${conf.border}`}>Selected</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{conf.desc}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conf.perms.map(p => (
                            <span key={p} className={`text-xs px-2 py-0.5 rounded-md font-medium ${conf.bg} ${conf.color}`}>{p}</span>
                          ))}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all ${form.role === role ? `border-current ${conf.color}` : 'border-slate-600'}`}>
                        {form.role === role && <div className={`w-2.5 h-2.5 rounded-full bg-current`} />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-xs text-red-400">{errors.role}</p>}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex gap-3">
                <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
                <p className="text-amber-300 text-xs">Role requests are subject to admin review. Your account will be activated once approved.</p>
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Personal Details</h2>
                <p className="text-slate-400 text-sm mt-1">Tell us a bit more about yourself</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Department <span className="text-red-400">*</span></label>
                <select
                  value={form.department} onChange={e => set('department', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white focus:outline-none focus:ring-1 transition ${errors.department ? 'border-red-500/60 focus:ring-red-500' : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400'}`}
                >
                  <option value="">Select a department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="mt-1 text-xs text-red-400">{errors.department}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number <span className="text-slate-500 text-xs">(optional)</span></label>
                <input
                  type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio / Notes <span className="text-slate-500 text-xs">(optional)</span></label>
                <textarea
                  value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="Brief description of your role or responsibilities..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition resize-none"
                />
                <p className="mt-1 text-xs text-slate-500">{form.bio.length}/200 characters</p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Review & Confirm</h2>
                <p className="text-slate-400 text-sm mt-1">Please verify your information before submitting</p>
              </div>

              {/* Account Summary Card */}
              <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700/50">
                <div className={`px-4 py-3 ${roleConf.bg} border-b border-white/10 flex items-center gap-3`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                    {form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{form.name}</p>
                    <p className="text-slate-400 text-xs">{form.email}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-sm font-bold ${roleConf.color}`}>{roleConf.icon} {roleConf.label}</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Full Name', value: form.name },
                    { label: 'Email', value: form.email },
                    { label: 'Department', value: form.department },
                    { label: 'Phone', value: form.phone || '—' },
                    { label: 'Role', value: `${roleConf.icon} ${roleConf.label}` },
                    { label: 'Bio', value: form.bio || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-slate-400 flex-shrink-0 w-28">{label}</span>
                      <span className="text-white text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                <p className="text-slate-300 text-sm font-medium mb-2">Permissions with <span className={`font-bold ${roleConf.color}`}>{roleConf.label}</span> role:</p>
                <div className="flex flex-wrap gap-2">
                  {roleConf.perms.map(p => (
                    <span key={p} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${roleConf.bg} ${roleConf.color} border ${roleConf.border}`}>✓ {p}</span>
                  ))}
                </div>
              </div>

              {result && !result.success && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {result.message}
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-slate-400">
                <svg className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                By creating an account, you agree to SmartFlow AI's Terms of Service and Privacy Policy. Your account requires administrator approval before you can sign in.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-7">
            {step > 0 ? (
              <button
                onClick={prev}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
            ) : (
              <button
                onClick={onBack}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-all duration-200"
              >
                Sign In
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={next}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Create Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">© 2025 SmartFlow AI · Intelligent Urban Mobility</p>
      </div>
    </div>
  );
}
