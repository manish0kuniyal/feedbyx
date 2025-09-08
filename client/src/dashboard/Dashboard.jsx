import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FaPlus } from 'react-icons/fa6';
import { MdDarkMode, MdLightMode, MdOutlineAutoGraph } from 'react-icons/md';
import { FiLogOut,  FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { SiFormspree } from "react-icons/si";
import SimpleFormBuilder from "../components/FormCreator/FormCanvas";
import FeedbackGrid from './FeedbackGrid';
import Modal from './Modal';
import AdminDashboard from '../admin/AdminDashboard';
import { useUserStore } from '../utils/userstore';
import { useThemeStore } from '../utils/themestore';
import ShareLinkModal from './ShareLinkModal';
import { TbLayoutNavbarExpandFilled } from "react-icons/tb";
import { MdOutlineHowToVote } from "react-icons/md";
import FeedbackCards from '../admin/FeedbackCards';

export default function Dashboard() {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const router = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [forms, setForms] = useState([]);
  const [formName, setFormName] = useState('');
  const [embedForm, setEmbedForm] = useState(null);
  const [view, setView] = useState('admin'); // ✅ default to analytics
  const [shareForm, setShareForm] = useState(null);
  const [currentForm, setCurrentForm] = useState(null);
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
const [groupedFeedbacks, setGroupedFeedbacks] = useState({});
  // Handle resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      router("/"); 
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router("/");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        router("/");
      }
    };

    fetchUser();
  }, [setUser, router]);

  const handleCreateForm = () => {
    if (!formName.trim()) return;
    setCurrentForm({ name: formName });
    setFormName('');
  };

  const fetchForms = async (uid) => {
    try {
      const res = await fetch(`http://localhost:5000/api/forms?uid=${uid}`);
      const data = await res.json();
      setForms(data.forms || []);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    }
  };

  useEffect(() => {
    if (user?.userId && view === 'view') fetchForms(user.userId);
  }, [user?.userId, view]);

  // ✅ Logout
  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    router("/");
  };

  const containerClasses = darkMode
    ? 'flex h-screen bg-[var(--darkest)] text-gray-100 transition-colors duration-300 p-4 gap-4 relative'
    : 'flex h-screen bg-gray-100 text-gray-900 transition-colors duration-300 p-4 gap-4 relative';

  const mainClasses = darkMode
    ? 'flex-1 p-6 overflow-auto bg-[var(--darker)] text-gray-100 transition-colors duration-300 rounded-2xl shadow-lg'
    : 'flex-1 p-6 overflow-auto bg-white text-gray-900 transition-colors duration-300 rounded-2xl shadow-lg';

const topButtons = [
  { label: 'Create', onClick: () => setView('create'), icon: <FaPlus /> },
  { label: 'Forms', onClick: () => setView('view'), icon: <SiFormspree /> },
  { label: 'Responses', onClick: () => setView('responses'), icon: <MdOutlineHowToVote />, fontBold: true },
  { label: 'Analytics', onClick: () => setView('admin'), icon: <MdOutlineAutoGraph />, fontBold: true },
];

  const bottomButtons = [
    {
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      onClick: toggleDarkMode,
      icon: darkMode ? <MdLightMode /> : <MdDarkMode />,
    },
    {
      label: 'Logout',
      onClick: handleLogout,
      icon: <FiLogOut />,
      fontBold: true,
    },
  ];

  return (
    <div className={containerClasses}>
      {/* Sidebar */}
      <AnimatePresence>
  {sidebarOpen && (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 250, damping: 30 }}
      className={`fixed md:static top-0 left-0 h-full md:h-auto z-50 w-60 p-4 flex flex-col rounded-r-2xl shadow-lg
        ${darkMode ? 'bg-[var(--dark)]' : 'bg-white'}`}
    >
      {/* Top section (header + buttons) */}
      <div className="flex-1 flex flex-col">
        {/* Sidebar header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-bold">
            {user?.name ? ` ${user.name} ` : 'Welcome!'}
          </div>
          {/* Close button only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Top buttons */}
        <div>
          {topButtons.map((btn, idx) => (
            <motion.button
              key={idx}
              onClick={btn.onClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 mb-3 px-4 py-3 rounded font-bold text-base transition-colors
                w-11/12 mx-auto
                ${darkMode
                  ? 'hover:bg-gray-700 hover:text-[var(--lightblue)]'
                  : 'hover:bg-gray-200 hover:text-[var(--lightblue)]'}`}
            >
              {btn.label} {btn.icon}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-col gap-3 mt-6">
        {bottomButtons.map((btn, idx) => (
          <motion.button
            key={idx}
            onClick={btn.onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 mb-3 px-3 py-2 rounded text-sm transition-colors 
              ${btn.fontBold ? 'font-bold' : ''}
              ${darkMode
                ? 'hover:bg-gray-700 hover:text-[var(--lightblue)]'
                : 'hover:bg-gray-200 hover:text-[var(--lightblue)]'}`}
          >
            {btn.label} {btn.icon}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Hamburger when sidebar is closed */}
      {!sidebarOpen && (
        <motion.button
  onClick={() => setSidebarOpen(true)}
  whileHover={{ scale: 1.1 }}
  className="absolute top-4  left-4 md:hidden p-2 rounded text-white shadow-md"
  style={{ backgroundColor: 'var(--lightblue)' }}
>
  <TbLayoutNavbarExpandFilled className="text-xl " />
</motion.button>

      )}

      {/* Main Content */}
      <div className={mainClasses}>
        {view === 'create' && <SimpleFormBuilder formName={currentForm?.name} />}

        {view === 'view' && (
          <>
            <FeedbackGrid
              forms={forms}
              setEmbedForm={setEmbedForm}
              setShareForm={setShareForm}
            />
            <ShareLinkModal
              form={shareForm}
              onClose={() => setShareForm(null)}
            />
          </>
        )}
        
       
  {view === 'responses' && (
    <>
      <FeedbackCards
        forms={forms}                // or fetch responses if needed
        setEmbedForm={setEmbedForm}
        setShareForm={setShareForm}
      />
      <ShareLinkModal
        form={shareForm}
        onClose={() => setShareForm(null)}
      />
    </>
  )}
 


        {view === 'admin' && <AdminDashboard />}
        <Modal embedForm={embedForm} setEmbedForm={setEmbedForm} />
      </div>
    </div>
  );
}
