import React, { useState, FormEvent } from 'react';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  auth, 
  db 
} from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  CalendarCheck, 
  CheckCircle2, 
  ShieldCheck, 
  Layout, 
  Zap, 
  Lock, 
  Mail, 
  User, 
  Flame,
  ArrowRight,
  Info,
  Pencil,
  Paintbrush,
  Send,
  Scissors
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onLoginSuccess: (user: any, isGuest: boolean) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup'>('landing');
  
  // Auth Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // UX Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [isDomainError, setIsDomainError] = useState(false);

  // Trigger Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIsDomainError(false);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      onLoginSuccess(result.user, false);
    } catch (err: any) {
      console.error(err);
      const isDomainErr = err.code === 'auth/unauthorized-domain' || 
                         (err.message && err.message.toLowerCase().includes('unauthorized-domain'));
      setIsDomainError(isDomainErr);
      if (isDomainErr) {
        setErrorMessage('Firebase Domain Authorization Required: This deployment domain has not been whitelisted in your Firebase projects settings yet.');
      } else {
        setErrorMessage(err.message || 'Third-party Google Authentication was aborted or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger Email / Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(result.user, false);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found') {
        setErrorMessage('Email/Password provider is not yet enabled in this Firebase. Please read the helper guide below.');
        setShowConfigGuide(true);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Incorrect username or password. Please try again.');
      } else {
        setErrorMessage(err.message || 'Could not log in. Standard Auth fails.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger Email / Password Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName.trim()) {
      setErrorMessage('Please complete all fields to establish your account.');
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, {
        displayName: displayName.trim()
      });
      onLoginSuccess(result.user, false);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found') {
        setErrorMessage('Email/Password provider is not yet enabled in this Firebase. Please read the helper guide below.');
        setShowConfigGuide(true);
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('The password should be at least 6 characters long.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already associated with an account. Try logging in.');
      } else {
        setErrorMessage(err.message || 'Could not register new account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex flex-col justify-between selection:bg-indigo-150 antialiased font-sans text-zinc-900 relative overflow-hidden" id="landing_frame_root">
      
      {/* Decorative watercolor blobs and colorful highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-rose-250/20 blur-3xl opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-96 h-96 rounded-full bg-amber-200/30 blur-3xl opacity-60 animate-pulse [animation-delay:2s] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-sky-200/25 blur-3xl opacity-50 animate-pulse [animation-delay:4s] pointer-events-none" />
      <div className="absolute top-[20%] left-[45%] w-72 h-72 rounded-full bg-emerald-100/25 blur-3xl opacity-40 animate-pulse [animation-delay:1.5s] pointer-events-none" />
      
      {/* Decorative Flying Paper Plane animation with flight track */}
      <div className="absolute top-24 left-1/3 w-32 h-16 pointer-events-none hidden md:block opacity-65 select-none" id="paper_plane_animation_container">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 120 60">
          <path 
            d="M 5,50 Q 45,10 110,15" 
            fill="none" 
            stroke="#f43f5e" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            className="animate-[dash_4s_linear_infinite]"
          />
          <g className="animate-[bounce_3s_ease-in-out_infinite]" transform="translate(100, 10)">
            <Send className="h-6 w-6 text-rose-500 rotate-[-12deg]" />
          </g>
        </svg>
      </div>

      <div className="absolute bottom-20 right-10 w-44 h-16 pointer-events-none hidden lg:block opacity-50 select-none">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 120 60">
          <path 
            d="M 10,10 Q 50,55 110,40" 
            fill="none" 
            stroke="#0ea5e9" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
          />
          <g transform="translate(105, 30)">
            <Send className="h-5 w-5 text-sky-500 rotate-[45deg]" />
          </g>
        </svg>
      </div>

      {/* Decorative Pencil and Drawing Brush background elements */}
      <div className="absolute top-8 right-64 text-zinc-200 pointer-events-none hidden xl:flex items-center gap-1 select-none">
        <Pencil className="h-5 w-5 rotate-45 text-yellow-350" />
        <span className="font-hand text-xs text-zinc-400 font-bold">Sketching out ideas...</span>
      </div>

      {/* Navigation Header with Notebook Clip-Ring theme */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b-2 border-dashed border-zinc-250 flex items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Realistic Binder spiral spring ring decor */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              <div className="w-1.5 h-6 bg-zinc-450 rounded-full border border-zinc-650" />
              <div className="w-1.5 h-6 bg-zinc-450 rounded-full border border-zinc-650" />
            </div>
            <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Paintbrush className="h-5 w-5 text-amber-105" />
            </div>
          </div>
          <div>
            <h1 className="font-sketch text-base text-zinc-950 tracking-tight leading-none flex items-center gap-1.5">
              Task Management System 
              <span className="font-hand text-sm text-rose-500 font-extrabold rotate-[-2deg] bg-amber-100 px-1 border border-dashed border-amber-300 rounded ml-1">Colorful Studio</span>
            </h1>
          </div>
        </div>

        {authMode === 'landing' ? (
          <div className="flex items-center gap-3">
            <button 
              id="header_login_btn"
              onClick={() => setAuthMode('login')}
              className="text-xs font-bold text-zinc-700 hover:text-rose-600 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Log In
            </button>
            <button 
              id="header_signup_btn"
              onClick={() => setAuthMode('signup')}
              className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 active:scale-95 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="h-3 w-3 text-rose-100" /> Get Sketching (Sign Up)
            </button>
          </div>
        ) : (
          <button 
            id="header_back_landing_btn"
            onClick={() => {
              setAuthMode('landing');
              setErrorMessage(null);
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            ← Back to Canvas
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 max-w-7xl mx-auto w-full z-10">
        {authMode === 'landing' ? (
          /* ================= LANDING VISUAL TEMPLATE ================= */
          <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-14 justify-center" id="landing_view_container">
            {/* Left Hero info */}
            <div className="flex-1 flex flex-col gap-6 text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-[10px] text-yellow-850 font-bold font-mono tracking-wide uppercase self-start animate-bounce">
                <Send className="h-3 w-3 text-rose-500" /> Now active: Paper Flight Sync
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-sketch font-extrabold text-[#1c1917] tracking-tight leading-none">
                Bring flavor to your <span className="text-[#f43f5e] underline decoration-wavy decoration-3 underline-offset-4">Desk Notes</span>.
              </h2>
              
              <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-semibold">
                Ditch clinical black-and-white to-do lists! Sketch ideas, pile colorful pastel sticky notes, stick pin markers, and fold task lists with custom masking tape. Backed solidly by secure multi-device Firebase cloud synchronization.
              </p>

              {/* Bullet Features list styled as highly colorful paper stationary options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-2">
                {[
                  { title: "📌 Yellow Sticky Pad", desc: "Sunny yellow notes with completion sounds to brighten up goals.", bg: "bg-[#fefce8] border-yellow-300 rotate-[-1deg]", icon: Pencil, color: "text-amber-600" },
                  { title: "✈️ Blue Blueprint Paper", desc: "Map project tasks with real-time Firestore secure flight sync.", bg: "bg-[#f0f9ff] border-blue-300 rotate-[1.5deg]", icon: Send, color: "text-sky-600" },
                  { title: "🌿 Fresh Mint Memo", desc: "Interactive checklist items that look like realistic diary cuts.", bg: "bg-[#f0fdf4] border-emerald-300 rotate-[-1.5deg]", icon: Scissors, color: "text-emerald-600" },
                  { title: "🎨 Crayons & Drawing", desc: "Choose color identities for each note based on priority.", bg: "bg-[#fff5f5] border-rose-300 rotate-[1deg]", icon: Paintbrush, color: "text-rose-500" },
                ].map((feat, index) => {
                  const Icon = feat.icon;
                  return (
                    <div key={index} className={`p-4 rounded-2xl border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.06)] flex gap-3.5 ${feat.bg} transition-all hover:scale-102 cursor-default`}>
                      <div className="h-8 w-8 rounded-lg bg-white/70 border border-black/10 flex items-center justify-center shrink-0">
                        <Icon className={`h-4 w-4 ${feat.color}`} />
                      </div>
                      <div>
                        <h4 className="font-sketch font-bold text-xs text-zinc-950 leading-tight mb-0.5">{feat.title}</h4>
                        <p className="text-[11px] text-zinc-750 font-medium leading-normal">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA triggers */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mt-4">
                <button
                  id="landing_get_started_btn"
                  onClick={() => setAuthMode('signup')}
                  className="px-6 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_0px_#1c1917] hover:shadow-[6px_6px_0px_0px_#1c1917] transition-all cursor-pointer w-full text-center hover:scale-[1.01] active:translate-y-1 active:shadow-none"
                >
                  Get Sketching (Sign Up Today) <ArrowRight className="h-4.5 w-4.5 text-rose-100" />
                </button>
                <button
                  id="landing_guest_sandbox_btn"
                  onClick={() => onLoginSuccess(null, true)}
                  className="px-6 py-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 border-2 border-zinc-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] transition-all cursor-pointer w-full text-center hover:scale-[1.01] active:translate-y-1"
                >
                  ✨ Just Try as Guest (Sandbox)
                </button>
              </div>
            </div>

            {/* Right Graphic Preview card - modeled as detailed stationery stack */}
            <div className="w-full max-w-sm bg-white border-2 border-zinc-350 shadow-[8px_8px_0px_0px_#e5e5e0] sketchy-border p-6 relative overflow-visible" id="landing_graphic_box">
              {/* Binder rings overlay */}
              <div className="absolute top-[-14px] left-10 flex gap-4">
                <div className="w-2.5 h-8 bg-zinc-350 rounded-lg border border-zinc-450 shadow-xs" />
                <div className="w-2.5 h-8 bg-zinc-350 rounded-lg border border-zinc-450 shadow-xs" />
                <div className="w-2.5 h-8 bg-zinc-350 rounded-lg border border-zinc-450 shadow-xs" />
              </div>

              <div className="relative flex flex-col gap-4.5 pt-3">
                
                {/* Yellow Note Sketch */}
                <div className="p-4 bg-[#fefce8] border border-yellow-350 rounded-xl shadow-sm rotate-[-1deg] relative">
                  {/* Pin tag */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-yellow-200/50 border-r border-l border-dashed border-yellow-300 rounded-lg flex items-center justify-center font-hand text-[9px] uppercase tracking-wider text-yellow-805">
                    📌 sunflower
                  </div>
                  <h5 className="font-sketch font-bold text-xs text-yellow-950 mb-1 flex items-center gap-1 mt-1">
                    <span>✏️</span> Content Writing Plan
                  </h5>
                  <p className="text-[12px] font-hand text-yellow-900 leading-normal mb-1">
                    Keep descriptions completely jargon-free and friendly. Sketch all bullet highlights on cards first.
                  </p>
                </div>

                {/* Mint Note Sketch */}
                <div className="p-4 bg-[#f0fdf4] border border-emerald-300 rounded-xl shadow-sm rotate-[1.5deg] relative">
                  <div className="absolute -top-3 left-1/3 w-12 h-4 bg-emerald-200/50 border-r border-l border-dashed border-emerald-300 rounded-lg flex items-center justify-center font-hand text-[9px] uppercase tracking-wider text-emerald-805">
                    📌 mint
                  </div>
                  <h5 className="font-sketch font-bold text-xs text-zinc-900 mb-2 mt-1">📝 My Morning Checklist</h5>
                  
                  <div className="flex flex-col gap-1.5 text-[11px] font-semibold">
                    <div className="flex items-center gap-2 text-emerald-950">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="line-through text-zinc-400">Coffee brew & healthy snacks</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-700">
                      <div className="h-3.5 w-3.5 rounded border-2 border-emerald-400 bg-white" />
                      <span>Launch colorful flight sync system</span>
                    </div>
                  </div>
                </div>

                {/* Sky Blue Note Sketch */}
                <div className="p-3 bg-[#f0f9ff] border border-sky-300 rounded-xl shadow-sm rotate-[-1.5deg]">
                  <h5 className="font-sketch font-bold text-xs text-sky-950 flex items-center justify-between">
                    <span>💡 Workspace Ideas</span>
                    <span className="text-[10px] text-sky-500 font-bold uppercase">sky</span>
                  </h5>
                  <p className="text-[11px] font-hand text-sky-850 leading-relaxed mt-1">
                    Write fresh components with dynamic pastel cards, drawing palettes, and sound rings!
                  </p>
                </div>

                {/* Footer mock stationery layout info */}
                <div className="text-center pt-2.5 border-t border-dashed border-zinc-200 select-none flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-[9px] text-zinc-400 font-bold tracking-widest font-mono">
                    🎨 HAND-SKETCHED BLUEPRINT CANVAS
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= AUTHENTICATION FORMS ================= */
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white border-2 border-zinc-350 shadow-[6px_6px_0px_0px_#e5e5e0] sketchy-border p-6 sm:p-8 flex flex-col gap-6 relative"
            id="auth_form_wrapper"
          >
            {/* Corner washi tape on login card */}
            <div className="absolute -top-3.5 -right-3.5 w-24 h-5.5 bg-yellow-250/70 border border-dashed border-yellow-350 shadow-xs rotate-[15deg] pointer-events-none rounded-xs flex items-center justify-center font-hand text-[9px] font-bold text-yellow-900 select-none">
              📌 AUTH STATION
            </div>

            {/* Form Headers */}
            <div className="flex flex-col gap-1 text-center">
              <h3 className="font-sketch font-extrabold text-xl tracking-tight text-zinc-950">
                {authMode === 'login' ? '✏️ Welcome Back to Desk!' : '🎨 Get Sketching (Sign Up)'}
              </h3>
              <p className="text-xs text-zinc-500 font-semibold font-sans">
                {authMode === 'login' 
                  ? 'Access your saved checkpoints from any browser coordinate.' 
                  : 'Start syncing notes on a production-ready Firebase backend.'
                }
              </p>
            </div>

            {/* Error alerts */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-xs font-semibold leading-relaxed flex gap-2.5 items-start">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Unauthorized Domain Resolution Guide */}
            {isDomainError && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex flex-col gap-3 font-semibold text-left">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                  How to Fix (Authorized Domains Guide):
                </span>
                <p className="text-[11px] leading-relaxed text-amber-850 font-normal">
                  You are logging in from an external deployment URL. Because you are not the owner of the system's default auto-provisioned project (<code className="bg-amber-100 rounded px-1">{firebaseConfig.projectId}</code>), you cannot add this URL to its authorized domains dashboard.
                </p>
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100 flex flex-col gap-1.5 font-mono text-[10px] text-amber-905">
                  <div className="font-sans font-bold text-[9px] uppercase text-zinc-550 mb-0.5">Domains needing authorization:</div>
                  <div className="truncate select-all bg-zinc-50 p-1.5 rounded border border-zinc-200">ais-dev-ibx75bjosh5qt3f5fjismh-954514971547.asia-southeast1.run.app</div>
                  <div className="truncate select-all bg-zinc-50 p-1.5 rounded border border-zinc-200">ais-pre-ibx75bjosh5qt3f5fjismh-954514971547.asia-southeast1.run.app</div>
                </div>
                <div className="flex flex-col gap-1.5 text-[11px] leading-relaxed text-amber-850 font-medium">
                  <div className="font-bold">✨ Two Solutions:</div>
                  <ol className="list-decimal pl-4.5 flex flex-col gap-2 font-semibold">
                    <li>
                      <span className="font-bold text-amber-950">Option 1: Bypassing credentials</span> - Click this link to go straight into the <button type="button" className="underline hover:text-emerald-750 cursor-pointer font-bold" onClick={() => onLoginSuccess(null, true)}>Interactive Guest Sandbox (Persistent Local DB)</button> which is fully functional immediately!
                    </li>
                    <li>
                      <span className="font-bold text-amber-950">Option 2: Personal Firebase Cloud Database</span> - Run the <code className="bg-amber-100 rounded px-1 font-mono text-[10px]">set_up_firebase</code> tool in AI Studio chat with your <span className="italic">own personal Firebase Project ID</span>. Since you are the owner, you can register these domain coordinates under <strong>Authentication &gt; Settings &gt; Authorized domains</strong> in your Google Firebase Console!
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* Social Authentication buttons */}
            <div className="flex flex-col gap-2">
              <button
                id="auth_google_submit"
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full py-2.5 border-2 border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 cursor-pointer hover:border-zinc-300 shadow-xs transition-colors disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                id="auth_guest_submit"
                type="button"
                onClick={() => onLoginSuccess(null, true)}
                className="w-full py-2.5 border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 cursor-pointer shadow-xs transition-colors"
                title="Bypass cloud authentication and use local storage Sandbox"
              >
                <span>✨ Try Offline Guest Sandbox (Persistent)</span>
              </button>
            </div>

            {/* Separator row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">or email access</span>
              <div className="flex-1 h-px bg-zinc-200" />
            </div>

            {/* Standard Credentials Form */}
            <form onSubmit={authMode === 'login' ? handleEmailSignIn : handleEmailSignUp} className="flex flex-col gap-4">
              {authMode === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="auth_displayName" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="auth_displayName"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-xs placeholder:text-zinc-400 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth_email" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Email Coordinates *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="auth_email"
                    type="email"
                    required
                    placeholder="e.g. name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-xs placeholder:text-zinc-400 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth_password" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="auth_password"
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-xs placeholder:text-zinc-400 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-semibold"
                  />
                </div>
              </div>

              <button
                id="auth_sumbit_creds"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1c1917] hover:bg-rose-600 text-white hover:shadow-md rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5 text-rose-400" />
                {loading ? 'Authenticating...' : (authMode === 'login' ? 'Open My Sketchpad' : 'Get Sketching (Sign Up)')}
              </button>
            </form>

            {/* Verification Walkthrough Guide Block */}
            {showConfigGuide && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-150 text-indigo-900 rounded-xl text-[11px] leading-relaxed flex flex-col gap-1.5 text-left font-medium">
                <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 shrink-0 text-indigo-600" /> Firebase Configuration Walkthrough:
                </span>
                <p>
                  To login using standard Email Coordinates, please verify:
                </p>
                <ul className="list-decimal pl-4.5 flex flex-col gap-1 font-semibold">
                  <li>Visit your <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} target="_blank" rel="noreferrer" className="underline text-indigo-700 hover:text-indigo-900">Firebase Console (Google auth dashboard)</a></li>
                  <li>Click "Add new provider" & Select <strong>Email/Password</strong></li>
                  <li>Toggle <strong>Enable</strong> and save changes.</li>
                </ul>
              </div>
            )}

            {/* Helper toggle */}
            <div className="flex flex-col gap-2.5 text-center mt-2 border-t border-zinc-100 pt-4.5 text-xs font-medium">
              <div>
                {authMode === 'login' ? 'New to drawing notes?' : 'Already have a notebook?'}
                <button
                  id="auth_toggle_mode"
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setErrorMessage(null);
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer ml-1 select-none"
                >
                  {authMode === 'login' ? 'Get Sketching (Sign Up)' : 'Log into your sketchpad'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Landing footer */}
      <footer className="py-6 border-t-2 border-dashed border-zinc-250 text-center text-[10px] text-zinc-500 font-bold bg-white/70 backdrop-blur-md">
        &copy; 2026 Task Management System Studio. Hand-sketched layouts powered by Secure Firebase Rules.
      </footer>
    </div>
  );
}
