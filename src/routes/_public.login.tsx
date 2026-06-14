import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import logo from "@/assets/pystack_logo.png"; // <-- Your logo import

export const Route = createFileRoute("/_public/login")({
  head: () => ({
    meta: [
      { title: "Login — Pystack Academy" },
      { name: "description", content: "Pystack Academy login portal." },
    ],
  }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = user.roles.some((role) => role === "SuperAdmin" || role === "Admin");
      const destination = isAdmin ? "/admin/dashboard" : "/user/dashboard";
      
      navigate({
        to: destination,
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    setErrorMessage(null);

    try {
      const r = await login(email, password);

      if (r.ok) {
        // Success - redirect happens via useEffect
      } else {
        setErrorMessage(r.error || "Login failed. Please check your credentials.");
        setPassword("");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gradient-hero flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl p-8 shadow-elegant border border-border">
            <div className="text-center mb-8">
              {/* Logo instead of "P" */}
              <div className="mx-auto h-16 w-16 rounded-2xl overflow-hidden shadow-elegant bg-white">
                <img 
                  src={logo} 
                  alt="Pystack Academy" 
                  className="h-full w-full object-cover"
                />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-navy dark:text-white">
                Welcome Back
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to access your account
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-sm font-medium text-navy dark:text-gray-200 block mb-1.5">
                  Email
                </label>

                <div className="relative group">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-primary" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  />

                  {/* Show/Hide Password Button */}
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
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
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
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border dark:border-gray-700 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}