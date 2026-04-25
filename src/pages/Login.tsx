import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuth } from "../lib/AuthContext";
import { Rocket, User, Lock, Eye, EyeOff, LogIn, PieChart, Brain, Mail } from "lucide-react";
import { motion } from "motion/react";

function getFriendlyError(code: string): string {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Try again later or reset your password.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact your administrator.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Sign in failed. Please check your credentials and try again.";
  }
}

export const Login: React.FC = () => {
  const { user, authError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const trimmedUsername = username.trim();
      const lookupResponse = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername }),
      });
      const lookupPayload = await lookupResponse.json();

      if (!lookupResponse.ok) {
        const serverErr = lookupPayload.error || "";
        // Translate server-side credential errors to user-friendly messages
        if (serverErr.includes("invalid_grant") || serverErr.includes("Invalid JWT") || serverErr.includes("service account")) {
          setError("System configuration error. Please contact your administrator.");
        } else {
          setError(serverErr || "Username not found. Please check and try again.");
        }
        return;
      }

      const email = lookupPayload.email;
      await signInWithEmailAndPassword(auth, email, password);

      const profileResponse = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`);
      if (!profileResponse.ok) {
        const profilePayload = await profileResponse.json().catch(() => ({}));
        await signOut(auth);
        setError(profilePayload.error || "Your account is not authorized for this migration system.");
        return;
      }

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#08081a] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_80%_at_75%_105%,rgba(90,30,190,0.90)_0%,rgba(60,15,130,0.55)_35%,transparent_65%),radial-gradient(ellipse_50%_35%_at_98%_98%,rgba(110,40,210,0.55)_0%,transparent_50%)] z-0" />

      <div className="hidden lg:flex flex-1 flex-col p-16 relative z-10 justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-12"
        >
          <Rocket className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.7)]" />
          <h1 className="text-2xl font-bold tracking-tight">JetLearn</h1>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-extrabold leading-none tracking-tighter mb-6"
        >
          Migration<span className="block text-indigo-400">System</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-white/60 max-w-md mb-12 leading-relaxed"
        >
          Streamlining learner migrations, onboarding, and analytics - all in one place.
        </motion.p>

        <div className="space-y-4 max-w-sm">
          {[
            { icon: Mail, title: "Automated Onboarding", desc: "Professional emails in a few clicks" },
            { icon: LogIn, title: "Seamless Migrations", desc: "Full tracking & audit trail" },
            { icon: PieChart, title: "Real-time Analytics", desc: "Live performance metrics" },
            { icon: Brain, title: "AI Powered Tools", desc: "Smart insights & automation", special: true },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                feature.special
                  ? "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  feature.special
                    ? "bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border-indigo-500/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <feature.icon className={`w-5 h-5 ${feature.special ? "text-indigo-300" : "text-indigo-400"}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  {feature.title}
                  {feature.special && (
                    <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      New
                    </span>
                  )}
                </h3>
                <p className="text-xs text-white/50">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[450px] bg-black/40 backdrop-blur-3xl border-l border-white/10 p-8 lg:p-16 flex flex-col relative z-10 justify-center">
        <div className="max-w-sm w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            System online · Sign in to continue
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
            Welcome back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/50 mb-8"
          >
            Enter your credentials to access the system
          </motion.p>

          <form onSubmit={handleLogin} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1.5"
            >
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3 text-indigo-400" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-1.5"
            >
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3 h-3 text-indigo-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {(error || authError) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg"
              >
                {error || authError}
              </motion.p>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center text-[11px] text-white/25"
          >
            Having trouble? Contact your administrator.
          </motion.p>
        </div>
      </div>
    </div>
  );
};
