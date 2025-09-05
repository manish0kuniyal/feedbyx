'use client';

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdDarkMode, MdLightMode, MdOutlineAutoGraph } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { SiFormspree } from "react-icons/si";
import SimpleFormBuilder from "../components/FormCreator/FormCanvas"
import FeedbackGrid from './FeedbackGrid';
import Modal from './Modal';
import AdminDashboard from '../admin/AdminDashboard';
import { useUserStore } from '../utils/userstore';
import { useThemeStore } from '../utils/themestore';
import ShareLinkModal from './ShareLinkModal';

export default function Dashboard() {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [forms, setForms] = useState([]);
  const [formName, setFormName] = useState('');
  const [embedForm, setEmbedForm] = useState(null);
  const [view, setView] = useState('create'); // 'create' | 'view' | 'admin'
  const [shareForm, setShareForm] = useState(null);
  const [currentForm, setCurrentForm] = useState(null); 

  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

  // Mock user for now
  useEffect(() => {
    setUser({
      name: 'Demo User',
      email: 'demo@example.com',
      uid: 'demo123',
      image: null,
    });
  }, [setUser]);

  const handleCreateForm = () => {
    if (!formName.trim()) return;
    setCurrentForm({ name: formName });
    setFormName('');
  };

  const fetchForms = async (uid) => {
    try {
      const res = await fetch(`/api/forms?uid=${uid}`);
      const data = await res.json();
      setForms(data.forms || []);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    }
  };

  useEffect(() => {
    if (user?.uid && view === 'view') fetchForms(user.uid);
  }, [user?.uid, view]);

  const containerClasses = darkMode
    ? 'flex h-screen bg-gray-900 text-gray-100 transition-colors duration-300'
    : 'flex h-screen bg-gray-100 text-gray-900 transition-colors duration-300';

  const mainClasses = darkMode
    ? 'flex-1 p-6 overflow-auto bg-[#101210] text-gray-100 transition-colors duration-300'
    : 'flex-1 p-6 overflow-auto bg-gray-100 text-gray-900 transition-colors duration-300';

  const topButtons = [
    { label: 'Create', onClick: () => setView('create'), icon: <FaPlus /> },
    { label: 'Forms', onClick: () => setView('view'), icon: <SiFormspree /> },
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
      onClick: () => console.log('Logout clicked'), // placeholder
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
            className={`w-60 p-4 flex flex-col justify-between ${darkMode ? 'bg-[#18191A]' : 'bg-white'}`}
          >
            <div>
              <div className="text-lg ml-4 font-bold mb-10">
                {user?.name ? ` ${user.name} ` : 'Welcome!'}
              </div>

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

      {/* Main Content */}
      <div className={mainClasses}>
        {!sidebarOpen && (
          <motion.button
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.05 }}
            className="mb-4 px-2 py-1 bg-green-500 text-white rounded"
          >
            Open Sidebar
          </motion.button>
        )}

        {view === 'create' && (
          <SimpleFormBuilder formName={currentForm?.name} />
        )}

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

        {view === 'admin' && <AdminDashboard />}
        <Modal embedForm={embedForm} setEmbedForm={setEmbedForm} />
      </div>
    </div>
  );
}
