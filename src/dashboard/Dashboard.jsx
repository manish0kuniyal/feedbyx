import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { MdDarkMode, MdLightMode, MdOutlineAutoGraph, MdOutlineHowToVote } from "react-icons/md";
import { FiLogOut, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { SiFormspree } from "react-icons/si";
import { TiThMenu } from "react-icons/ti";
import { FaMagic } from "react-icons/fa";
import SimpleFormBuilder from "../components/FormCreator/FormCanvas";
import FeedbackGrid from "./FeedbackGrid";
import Modal from "./Modal";
import AdminDashboard from "../admin/AdminDashboard";
import { useUserStore } from "../utils/userstore";
import { useThemeStore } from "../utils/themestore";
import ShareLinkModal from "./ShareLinkModal";
import FeedbackCards from "../admin/FeedbackCards";
import Loader from "../components/Loading";
import { fetchUser, logoutUser } from "../utils/api/auth";
import { fetchForms } from "../utils/api/form";
import { fetchFeedbacks } from "../utils/api/feedback";
import AIChat from "./AIChat";

export default function Dashboard() {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const router = useNavigate();
  const darkMode = useThemeStore((s) => s.darkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [forms, setForms] = useState([]);
  const [embedForm, setEmbedForm] = useState(null);
  const [shareForm, setShareForm] = useState(null);
  const [view, setView] = useState("admin");
  const [groupedFeedbacks, setGroupedFeedbacks] = useState({});
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser(baseUrl);
      if (!userData) {
        router("/");
        return;
      }
      setUser(userData);
      setLoadingAuth(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadForms = async () => {
      if (!user?.userId) return;
      setLoadingForms(true);
      const data = await fetchForms(baseUrl, user.userId);
      setForms(data);
      setLoadingForms(false);
    };
    if (view === "view" || view === "ai") loadForms();
  }, [view, user?.userId]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!user?.userId) return;
      setLoadingResponses(true);
      const data = await fetchFeedbacks(baseUrl, user.userId);
      setGroupedFeedbacks(data);
      setLoadingResponses(false);
    };
    if (view === "responses") loadFeedbacks();
  }, [view, user?.userId]);

  const handleLogout = async () => {
    await logoutUser(baseUrl);
    setUser(null);
    router("/");
  };

  const containerClasses = darkMode
    ? "flex h-screen bg-[var(--darkest)] text-gray-100 transition-colors duration-300 p-4 gap-4 relative"
    : "flex h-screen bg-gray-100 text-gray-900 transition-colors duration-300 p-4 gap-4 relative";

  const mainClasses = darkMode
    ? "flex-1 p-6 overflow-auto bg-[var(--darker)] text-gray-100 transition-colors duration-300 rounded-2xl shadow-lg"
    : "flex-1 p-6 overflow-auto bg-white text-gray-900 transition-colors duration-300 rounded-2xl shadow-lg";

  const topButtons = [
    { label: "Create", onClick: () => setView("create"), icon: <FaPlus /> },
    { label: "Forms", onClick: () => setView("view"), icon: <SiFormspree /> },
    { label: "Responses", onClick: () => setView("responses"), icon: <MdOutlineHowToVote />, fontBold: true },
    { label: "Analytics", onClick: () => setView("admin"), icon: <MdOutlineAutoGraph />, fontBold: true },
    {
      label: "Ask AI",
      onClick: () => setView("ai"),
      icon: <FaMagic />,
      gradient: true,
    },
  ];

  const bottomButtons = [
    {
      label: darkMode ? "Light Mode" : "Dark Mode",
      onClick: toggleDarkMode,
      icon: darkMode ? <MdLightMode /> : <MdDarkMode />,
    },
    { label: "Logout", onClick: handleLogout, icon: <FiLogOut />, fontBold: true },
  ];

  if (loadingAuth) {
    return (
      <div className={containerClasses}>
        <Loader fullScreen />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            className={`fixed md:static top-0 left-0 h-full md:h-auto z-50 w-60 p-4 flex flex-col rounded-r-2xl shadow-lg ${
              darkMode ? "bg-[var(--dark)]" : "bg-white"
            }`}
          >
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg font-bold">{user?.name ? ` ${user.name} ` : "Welcome!"}</div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div>
                {topButtons.map((btn, idx) => (
                  <motion.button
                    key={idx}
                    onClick={btn.onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-between gap-3 mb-3 px-4 py-3 w-11/12 mx-auto rounded font-bold text-base transition-all duration-300 ${
  btn.gradient
    ? "text-white rounded-2xl bg-gradient-to-r mt-2 from-[var(--blue)] via-[var(--lightblue)] to-[var(--white)] shadow-lg hover:shadow-[0_0_15px_rgba(94,171,171,0.8)]"
    : darkMode
    ? "hover:bg-gray-700 hover:text-[var(--lightblue)]"
    : "hover:bg-gray-200 hover:text-[var(--lightblue)]"
}`}

                  >
                    <span>{btn.label}</span> {btn.icon}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              {bottomButtons.map((btn, idx) => (
                <motion.button
                  key={idx}
                  onClick={btn.onClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 mb-3 px-3 py-2 rounded text-sm transition-colors ${
                    btn.fontBold ? "font-bold" : ""
                  } ${
                    darkMode
                      ? "hover:bg-gray-700 hover:text-[var(--lightblue)]"
                      : "hover:bg-gray-200 hover:text-[var(--lightblue)]"
                  }`}
                >
                  {btn.label} {btn.icon}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <motion.button
          onClick={() => setSidebarOpen(true)}
          whileHover={{ scale: 1.1 }}
          className="absolute top-4 left-4 md:hidden p-2 rounded text-white shadow-md"
          style={{ backgroundColor: "var(--lightblue)" }}
        >
          <TiThMenu className="text-xl " />
        </motion.button>
      )}

      <div className={mainClasses}>
        {view === "create" && <SimpleFormBuilder />}
        {view === "view" &&
          (loadingForms ? (
            <div className="flex justify-center py-8">
              <Loader size="w-20 h-20" />
            </div>
          ) : (
            <>
              <FeedbackGrid forms={forms} setEmbedForm={setEmbedForm} setShareForm={setShareForm} />
              <ShareLinkModal form={shareForm} onClose={() => setShareForm(null)} />
            </>
          ))}
        {view === "responses" &&
          (loadingResponses ? (
            <div className="flex justify-center py-8">
              <Loader size="w-20 h-20" />
            </div>
          ) : (
            <>
              <FeedbackCards groupedFeedbacks={groupedFeedbacks} setEmbedForm={setEmbedForm} setShareForm={setShareForm} />
              <ShareLinkModal form={shareForm} onClose={() => setShareForm(null)} />
            </>
          ))}
        {view === "admin" && <AdminDashboard />}
        {view === "ai" && <AIChat baseUrl={baseUrl} forms={forms} darkMode={darkMode} />}
        <Modal embedForm={embedForm} setEmbedForm={setEmbedForm} />
      </div>
    </div>
  );
}
