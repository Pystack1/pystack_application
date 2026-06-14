import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaUser, FaEye, FaEyeSlash, FaEnvelope, FaCheckCircle, FaIdCard } from "react-icons/fa";
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

  const { register } = useAuthStore();
  const { toasts, showToast } = useToast();
  const navigate = useNavigate();

  // Auto-clear messages after 3 seconds
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // FIX: Pass fullName as third argument
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
              {/* Logo */}
              <div className="mx-auto h-16 w-16 rounded-2xl overflow-hidden shadow-elegant bg-white">
                <img 
                  src={logo} 
                  alt="Pystack Academy" 
                  className="h-full w-full object-cover"
                />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-navy dark:text-white">
                Create Account
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Join Pystack Academy today
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* Full Name Input - FIRST FIELD */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">
                  Full Name
                </label>

                <div className="relative group">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-primary" />

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">
                  Email
                </label>

                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-primary" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">
                  Password
                </label>

                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-primary" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input with Show/Hide */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">
                  Confirm Password
                </label>

                <div className="relative group">
                  <FaCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-primary" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
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

                {/* Error Message - Auto disappears after 3 seconds */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div className="text-red-500 text-sm font-medium block bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-lg border border-red-100 dark:border-red-900/50 shadow-sm">
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errorMessage}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success Message - Auto disappears after 3 seconds */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div className="text-green-600 text-sm font-medium block bg-green-50 dark:bg-green-900/20 py-3 px-4 rounded-lg border border-green-100 dark:border-green-900/50 shadow-sm">
                        <span className="flex items-center justify-center gap-2">
                          <FaCheckCircle className="w-4 h-4 flex-shrink-0" />
                          {successMessage}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border dark:border-gray-700 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}