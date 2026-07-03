import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaUser, FaEye, FaEyeSlash, FaEnvelope, FaCheckCircle, FaIdCard, FaCheck } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/ToastContainer";
import logo from "@/assets/pystack_logo.png";

export const Route = createFileRoute("/_public/register")({
  head: () => ({
    meta: [
      { title: "Register — Pystack Academy" },
      { name: "description", content: "Create an account with Pystack Academy." },
    ],
  }),
  component: Register,
});

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const { register } = useAuthStore();
  const { toasts, showToast } = useToast();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validate = () => {
    if (!fullName.trim() || fullName.length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters)");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    if (!emailVerified) {
      setErrorMessage("Please verify your email with OTP before registering");
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }
    return true;
  };

  // Send OTP for email verification
  const handleSendOtp = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address first");
      return;
    }

    setSendingOtp(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/send-verification-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setShowOtpBox(true);
        showToast("OTP sent to your email!", "success");
      } else {
        setErrorMessage(data.detail || "Failed to send OTP");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setEmailVerified(true);
        setShowOtpBox(false);
        showToast("Email verified successfully!", "success");
      } else {
        setErrorMessage(data.detail || "Invalid OTP");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const r = await register(email, password, fullName);
      if (r.ok) {
        setSuccessMessage("Registration successful! Redirecting to login...");
        showToast("Registration successful! Please wait for admin approval.", "success");
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      } else {
        setErrorMessage(r.error || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer toasts={toasts} />

      <main className="flex-1 bg-gradient-hero flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="bg-card rounded-2xl p-8 shadow-elegant border border-border">
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 rounded-2xl overflow-hidden shadow-elegant bg-white">
                <img src={logo} alt="Pystack Academy" className="h-full w-full object-cover" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-navy dark:text-white">Create Account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Join Pystack Academy today</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">Full Name</label>
                <div className="relative group">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              {/* Email with Verify Button */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">Email</label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailVerified(false);
                      setOtpSent(false);
                      setShowOtpBox(false);
                      setOtp("");
                    }}
                    disabled={loading || emailVerified}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className={`w-full pl-11 pr-24 py-3 rounded-lg bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      emailVerified 
                        ? "border-green-500 pr-12" 
                        : "border-border focus:border-primary"
                    }`}
                  />

                  {/* Verify Button or Success Check */}
                  {emailVerified ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="bg-green-500 text-white rounded-full p-1.5">
                        <FaCheck className="text-xs" />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !email || loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Verify"}
                    </button>
                  )}
                </div>

                {emailVerified && (
                  <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                    <FaCheck className="text-xs" /> Email verified successfully
                  </p>
                )}
              </div>

              {/* OTP Verification Box */}
              <AnimatePresence>
                {showOtpBox && !emailVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
                      <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                        Enter the 6-digit OTP sent to <strong>{email}</strong>
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-center tracking-[0.5em] font-mono text-lg font-bold text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otp.length !== 6}
                          className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                          {verifyingOtp ? "..." : "Verify"}
                        </button>
                      </div>
                      <p className="text-amber-600 dark:text-amber-400 text-xs">
                        Didn't receive? <button type="button" onClick={handleSendOtp} className="underline font-medium hover:text-amber-800">Resend OTP</button>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">Password</label>
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">Confirm Password</label>
                <div className="relative group">
                  <FaCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !emailVerified}
                  className="w-full py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <AnimatePresence>
                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-lg border border-red-100">
                        {errorMessage}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {successMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="text-green-600 text-sm font-medium bg-green-50 dark:bg-green-900/20 py-3 px-4 rounded-lg border border-green-100">
                        {successMessage}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign in here</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}