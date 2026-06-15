import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

export const Route = createFileRoute("/_public/forgot-password")({
  component: ForgotPassword,
});

type Step = "email" | "otp" | "reset";

function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message);
        setStep("otp");
      } else {
        setErrorMessage(data.detail || "Failed to send OTP");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message);
        setStep("reset");
      } else {
        setErrorMessage(data.detail || "Invalid OTP");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          navigate({ to: "/login", replace: true });
        }, 2000);
      } else {
        setErrorMessage(data.detail || "Failed to reset password");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (step === "email") return "Forgot Password?";
    if (step === "otp") return "Enter OTP";
    return "Reset Password";
  };

  const getSubtitle = () => {
    if (step === "email") return "Enter your email to receive a verification code.";
    if (step === "otp") return "Check your email for the 6-digit code.";
    return "Create a new password for your account.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl p-8 shadow-elegant border border-border">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Login
          </Link>

          <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
            {getTitle()}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">{getSubtitle()}</p>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg mb-4 text-sm"
              >
                {errorMessage}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 dark:bg-green-900/20 text-green-600 p-3 rounded-lg mb-4 text-sm"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {step === "email" && (
            <form onSubmit={requestOTP} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:scale-[1.02] transition-all disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-center tracking-[0.5em] font-mono text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:scale-[1.02] transition-all disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetPassword} className="space-y-4">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:scale-[1.02] transition-all disabled:opacity-70"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}