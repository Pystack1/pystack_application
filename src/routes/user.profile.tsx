import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCamera, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, 
  FaMapMarkerAlt, FaIdCard, FaSave, FaEdit, FaCheckCircle,
  FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

// Interfaces
interface Profile {
  id: number;
  user_id: number;
  full_name: string | null;
  email: string;
  mobile_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  aadhar_number: string | null;
  pan_number: string | null;
  profile_photo_url: string | null;
}

interface UploadResponse {
  url: string;
}

export const Route = createFileRoute("/user/profile")({
  component: UserProfile,
});

// ===== REUSABLE FIELD COMPONENT (OUTSIDE main function) =====
interface FieldProps {
  label: string;
  name: string;
  value: string | null;
  type?: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  maxLength?: number;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function Field({ label, name, value, type = "text", placeholder, icon: Icon, maxLength, isEditing, onChange }: FieldProps) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        )}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={!isEditing}
          maxLength={maxLength}
          className={`w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all outline-none text-sm ${
            !isEditing ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400' : ''
          }`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

// ===== REUSABLE SECTION COMPONENT (OUTSIDE main function) =====
interface SectionProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  isEditing: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

function Section({ id, title, icon: Icon, isExpanded, isEditing, onToggle, children }: SectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full px-4 py-3 sm:px-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
            <Icon className="text-indigo-600 dark:text-indigo-400 text-sm" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
              Edit
            </span>
          )}
          {isExpanded ? (
            <FaChevronUp className="text-gray-400 text-xs" />
          ) : (
            <FaChevronDown className="text-gray-400 text-xs" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 sm:px-5 border-t border-gray-100 dark:border-gray-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== MAIN COMPONENT =====
function UserProfile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("personal");
  
  const [profile, setProfile] = useState<Profile>({
    id: 0,
    user_id: user?.id || 0,
    full_name: "",
    email: user?.email || "",
    mobile_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    aadhar_number: "",
    pan_number: "",
    profile_photo_url: "",
  });

  const [popupMessage, setPopupMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get<Profile>("/user/profile");
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Use useCallback so the function reference is stable
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        setSaving(true);
        const res = await api.upload<UploadResponse>("/user/profile/upload-photo", formData);
        setProfile(prev => ({ ...prev, profile_photo_url: res.url }));
        showPopup("success", "Photo updated successfully!");
      } catch (err: any) {
        console.error("Upload error:", err);
        showPopup("error", err.message || "Failed to upload photo");
      } finally {
        setSaving(false);
      }
    }
  };

  const showPopup = (type: 'success' | 'error', text: string) => {
    setPopupMessage({ type, text });
    setTimeout(() => setPopupMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/user/profile", profile);
      showPopup("success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || "Failed to update profile";
      showPopup("error", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // FIX: Use useCallback for toggle function too
  const toggleSection = useCallback((section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

  const completionPercentage = () => {
    const fields = [
      profile.full_name, profile.mobile_number, profile.date_of_birth,
      profile.gender, profile.address, profile.city, profile.state,
      profile.country, profile.aadhar_number, profile.pan_number
    ];
    const filled = fields.filter(f => f && f.trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {popupMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={`fixed bottom-4 left-1/2 px-5 py-2.5 rounded-lg shadow-lg z-50 flex items-center gap-2 text-sm font-medium ${
              popupMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <FaCheckCircle />
            {popupMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 mb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-gray-100 dark:border-gray-700 shadow-md">
                <img
                  src={profile.profile_photo_url || "https://via.placeholder.com/150?text=No+Photo"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110">
                <FaCamera className="text-xs" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={saving} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {profile.full_name || "Complete Your Profile"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{profile.email}</p>
              
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Active
                </span>
                <span className="text-xs text-gray-500">
                  {completionPercentage()}% Complete
                </span>
              </div>
            </div>

            {/* Edit Button - Desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                }`}
              >
                <FaEdit />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Edit Button */}
        <div className="sm:hidden mb-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              isEditing 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
            }`}
          >
            <FaEdit />
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Personal Info Section */}
          <Section id="personal" title="Personal Information" icon={FaUser} isExpanded={expandedSection === "personal"} isEditing={isEditing} onToggle={toggleSection}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <Field label="Full Name" name="full_name" value={profile.full_name} placeholder="Enter your full name" icon={FaUser} isEditing={isEditing} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <Field label="Email Address" name="email" value={profile.email} type="email" icon={FaEnvelope} isEditing={isEditing} onChange={handleChange} />
              </div>
              <Field label="Mobile Number" name="mobile_number" value={profile.mobile_number} placeholder="+91 98765 43210" icon={FaPhone} isEditing={isEditing} onChange={handleChange} />
              <Field label="Date of Birth" name="date_of_birth" value={profile.date_of_birth} type="date" icon={FaCalendarAlt} isEditing={isEditing} onChange={handleChange} />
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <label key={g} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                      profile.gender === g
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={profile.gender === g}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-4 h-4 text-indigo-600"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Address Section */}
          <Section id="address" title="Address Details" icon={FaMapMarkerAlt} isExpanded={expandedSection === "address"} isEditing={isEditing} onToggle={toggleSection}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Street Address</label>
                <textarea
                  name="address"
                  rows={2}
                  value={profile.address || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all outline-none text-sm resize-none ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                  placeholder="Enter your address"
                />
              </div>
              <Field label="City" name="city" value={profile.city} placeholder="City name" isEditing={isEditing} onChange={handleChange} />
              <Field label="State" name="state" value={profile.state} placeholder="State name" isEditing={isEditing} onChange={handleChange} />
              <Field label="Country" name="country" value={profile.country} placeholder="Country name" isEditing={isEditing} onChange={handleChange} />
            </div>
          </Section>

          {/* Identity Section */}
          <Section id="identity" title="Identity Verification" icon={FaIdCard} isExpanded={expandedSection === "identity"} isEditing={isEditing} onToggle={toggleSection}>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <FaIdCard />
                Your identity info is securely encrypted and used only for verification.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Field label="Aadhar Number" name="aadhar_number" value={profile.aadhar_number} placeholder="12 digit number" maxLength={12} isEditing={isEditing} onChange={handleChange} />
              <Field label="PAN Number" name="pan_number" value={profile.pan_number} placeholder="ABCDE1234F" maxLength={10} isEditing={isEditing} onChange={handleChange} />
            </div>
          </Section>

          {/* Save Button */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 flex justify-end"
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}