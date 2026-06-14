import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, FaQuestionCircle, FaHeadset, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaWhatsapp, FaChevronRight, FaTimes,
  FaBook, FaVideo, FaFileAlt, FaBriefcase, FaLinkedin, 
  FaUserTie, FaHandshake, FaLaptopCode, FaGraduationCap, 
  FaPhoneAlt, FaCheckCircle  // <-- ADDED THIS IMPORT
} from "react-icons/fa";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

// Types
type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high";

interface Ticket {
  id: number;
  subject: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: number;
  message: string;
  is_staff: boolean;
  created_at: string;
  staff_name?: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

// FAQ Data - Pystack Academy specific
const faqData: FAQItem[] = [
  {
    id: 1,
    category: "courses",
    question: "How do I enroll in a course?",
    answer: "Browse our courses page, select your desired course, and click 'Enroll Now'. Complete the payment process to gain immediate access. For assistance, contact our admin team at +91 8618415182 or +91 8660298124."
  },
  {
    id: 2,
    category: "courses",
    question: "What courses does Pystack Academy offer?",
    answer: "We offer Python Fullstack, Data Engineering, and Data Science courses. All courses include live online training sessions, hands-on projects, course materials through documentation, and placement assistance."
  },
  {
    id: 3,
    category: "courses",
    question: "Are classes recorded or live?",
    answer: "All our training sessions are conducted LIVE online with expert instructors. You get real-time interaction, doubt clarification, and hands-on coding practice during sessions. Course materials are provided through comprehensive documentation."
  },
  {
    id: 4,
    category: "courses",
    question: "How do I access course materials?",
    answer: "Course materials are provided through detailed documentation and docs. After enrollment, you'll get access to all learning resources, code examples, assignments, and project guidelines through our student portal."
  },
  {
    id: 5,
    category: "placement",
    question: "How does placement assistance work?",
    answer: "Our placement team helps you with: Naukri profile optimization, LinkedIn profile updates, FoundIt resume posting, resume building, mock interviews, technical interviews, and direct referrals to our 500+ hiring partners including TCS, Infosys, Wipro, and top startups."
  },
  {
    id: 6,
    category: "placement",
    question: "When can I start placement assistance?",
    answer: "You become eligible for placement assistance after completing 60% of your course. Our team will help you prepare your resume, optimize your job profiles, and connect you with hiring partners."
  },
  {
    id: 7,
    category: "placement",
    question: "What companies hire from Pystack Academy?",
    answer: "We partner with top tech companies including TCS, Infosys, Wipro, and many innovative startups. Our hiring network spans across product companies, MNCs, and fast-growing startups looking for skilled Python developers."
  },
  {
    id: 8,
    category: "account",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page. Enter your registered email, and we'll send you a password reset link valid for 24 hours. For further assistance, contact support."
  },
  {
    id: 9,
    category: "account",
    question: "How do I update my profile information?",
    answer: "Go to 'My Profile' from the sidebar. Click 'Edit Profile' to update your personal details, address, and identification information. Keep your profile updated for better placement opportunities."
  },
  {
    id: 10,
    category: "technical",
    question: "What should I do if I face technical issues during class?",
    answer: "Ensure stable internet connection (minimum 2 Mbps). Use Google Chrome or Firefox browser. If issues persist during live sessions, contact our technical support immediately at +91 8618415182."
  }
];

// Categories
const categories = [
  { id: "all", label: "All Topics", icon: FaQuestionCircle },
  { id: "courses", label: "Courses", icon: FaBook },
  { id: "placement", label: "Placement", icon: FaBriefcase },
  { id: "account", label: "Account", icon: FaUserTie },
  { id: "technical", label: "Technical", icon: FaHeadset },
];

export const Route = createFileRoute("/user/helpdesk")({
  component: HelpDesk,
});

function HelpDesk() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
  const [popupMessage, setPopupMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filter FAQs
  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const showPopup = (type: 'success' | 'error', text: string) => {
    setPopupMessage({ type, text });
    setTimeout(() => setPopupMessage(null), 3000);
  };

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
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Find answers or get in touch with our team</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers (e.g., 'enrollment', 'placement', 'live classes')..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none text-sm shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === "faq"
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FaQuestionCircle />
            FAQs
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === "contact"
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FaHeadset />
            Contact Us
          </button>
        </div>

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <cat.icon className="text-xs" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <FaSearch className="mx-auto text-3xl text-gray-300 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords or browse by category</p>
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full px-4 py-4 sm:px-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                          <FaQuestionCircle className="text-indigo-600 dark:text-indigo-400 text-sm" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
                      </div>
                      <FaChevronRight 
                        className={`text-gray-400 flex-shrink-0 transition-transform ${
                          expandedFAQ === faq.id ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedFAQ === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 sm:px-5 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300 pt-3 leading-relaxed">
                              {faq.answer}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-gray-400">Was this helpful?</span>
                              <button className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 transition-colors">
                                Yes
                              </button>
                              <button className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 transition-colors">
                                No
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Contact Us Tab */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Phone */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaPhone className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone Support</h3>
                <p className="text-xs text-gray-500 mb-3">Mon-Sat, 9AM-7PM IST</p>
                <div className="space-y-1">
                  <a href="tel:+918618415182" className="block text-sm text-green-600 dark:text-green-400 font-medium hover:underline">
                    +91 86184 15182
                  </a>
                  <a href="tel:+918660298124" className="block text-sm text-green-600 dark:text-green-400 font-medium hover:underline">
                    +91 86602 98124
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaEnvelope className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email Support</h3>
                <p className="text-xs text-gray-500 mb-3">Response within 24 hours</p>
                <a href="mailto:pystackacademy.in@gmail.com" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline break-all">
                  pystackacademy.in@gmail.com
                </a>
              </div>

              {/* WhatsApp */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp</h3>
                <p className="text-xs text-gray-500 mb-3">Instant messaging support</p>
                <a href="https://wa.me/918618415182" target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-400 font-medium hover:underline">
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Visit Us</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Ashwath Nagar, 30, 1st cross, 1st main, Ashwath nagar, 
                    Upstairs of punari chai, Marathahalli, Bengaluru-560037
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <FaBook className="text-indigo-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Course Catalog</p>
                    <p className="text-xs text-gray-500">Browse all courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <FaVideo className="text-purple-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Live Classes</p>
                    <p className="text-xs text-gray-500">Online training</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <FaFileAlt className="text-blue-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Course Docs</p>
                    <p className="text-xs text-gray-500">Study materials</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <FaBriefcase className="text-orange-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Placement</p>
                    <p className="text-xs text-gray-500">Career support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Placement Services Detail */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FaHandshake />
                Placement Assistance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <FaLinkedin className="text-blue-300" />
                  <span className="text-sm">LinkedIn Profile Updates</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <FaUserTie className="text-green-300" />
                  <span className="text-sm">Naukri Profile Optimization</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <FaFileAlt className="text-yellow-300" />
                  <span className="text-sm">Resume Building</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <FaLaptopCode className="text-pink-300" />
                  <span className="text-sm">Mock Interviews</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <FaHandshake className="text-cyan-300" />
                  <span className="text-sm">Technical Interviews</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <FaHandshake className="text-orange-300" />
                  <span className="text-sm">Direct Referrals</span>
                </div>
              </div>
            </div>

            {/* Course Enrollment CTA */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                    <FaGraduationCap className="text-indigo-600 dark:text-indigo-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Want to Enroll?</h3>
                    <p className="text-sm text-gray-500">Contact our admin team for course enrollment</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href="tel:+918618415182" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                    <FaPhoneAlt />
                    Call Now
                  </a>
                  <a href="https://wa.me/918618415182" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md">
                    <FaWhatsapp />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}