'use client';
import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { FaRegClipboard, FaRegCommentDots } from 'react-icons/fa';
import { useUserStore } from '../utils/userstore';
import { useThemeStore } from '../utils/themestore';
import AdminStatsCard from './AdminStatsCard';
import FormStats from './FormStats';
import ExportCSVButton from './ExportCSVButton';
import Loader from '../components/Loading';

import { fetchFeedbacksByUser,searchFeedbacks } from '../utils/api/feedback';

function normalizeFeedback(fb) {
  const native = fb && typeof fb === 'object' ? fb : {};
  const responses =
    native.responses && typeof native.responses === 'object'
      ? { ...native.responses }
      : { ...native };
  responses.formName =
    responses.formName ||
    responses.form_name ||
    responses.formTitle ||
    responses.title ||
    native.formName ||
    native.form_name;
  responses.createdAt =
    responses.createdAt ||
    native.createdAt ||
    responses.created_at ||
    native.created_at;
  responses.rating ??=
    native.rating ?? responses['service review'] ?? responses['service_review'];
  responses.name =
    responses.name || responses.Name || responses.fullName || responses.full_name;
  responses.email =
    responses.email ||
    responses.Email ||
    responses.emailAddress ||
    responses.email_address;
  return { ...native, responses };
}

export default function AdminDashboard() {
  const user = useUserStore((s) => s.user);
  const darkMode = useThemeStore((s) => s.darkMode);

  const [groupedFeedbacks, setGroupedFeedbacks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!user?.userId) return;
    const controller = new AbortController();

    const loadFeedbacks = async () => {
      setLoading(true);
      const data = await fetchFeedbacksByUser(baseUrl, user.userId, controller.signal);
      const normalized = Object.fromEntries(
        Object.entries(data).map(([formId, list]) => [
          formId,
          Array.isArray(list) ? list.map(normalizeFeedback) : [],
        ])
      );
      setGroupedFeedbacks(normalized);
      setLoading(false);
    };

    loadFeedbacks();
    return () => controller.abort();
  }, [user?.userId]);

  const handleRefresh = async () => {
    if (!user?.userId) return;
    setLoading(true);
    const data = await fetchFeedbacksByUser(baseUrl, user.userId);
    const normalized = Object.fromEntries(
      Object.entries(data).map(([formId, list]) => [
        formId,
        Array.isArray(list) ? list.map(normalizeFeedback) : [],
      ])
    );
    setGroupedFeedbacks(normalized);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchFeedbacks(baseUrl, searchQuery);
    const normalized = results.map(normalizeFeedback);
    setSearchResults(normalized);
    setShowModal(true);
  };

  const totalForms = Object.keys(groupedFeedbacks).length;
  const totalFeedbacks = Object.values(groupedFeedbacks).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <div className={`max-w-6xl mx-auto p-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 font-bold px-4 py-2 rounded hover:opacity-90 transition
              ${darkMode ? 'bg-[var(--lightblue)] text-gray-900' : 'bg-[var(--blue)] text-black'}`}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <AdminStatsCard title="Total Forms" value={totalForms} icon={<FaRegClipboard />} />
        <AdminStatsCard title="Total Feedbacks" value={totalFeedbacks} icon={<FaRegCommentDots />} />

        <div
          className={`flex items-center justify-center p-4 rounded-lg shadow min-w-[200px] ${
            darkMode ? 'border border-white text-gray-200' : 'bg-white text-gray-900'
          }`}
        >
          Export <ExportCSVButton data={groupedFeedbacks} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div
            className={`rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative ${
              darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
            }`}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              close
            </button>
            <h2 className="text-xl font-bold mb-4">Search Results for "{searchQuery}"</h2>

            {searchResults.length === 0 ? (
              <p className="text-gray-500">No feedback found.</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((fb, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      darkMode
                        ? 'bg-gray-800 text-gray-200'
                        : 'bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          {fb.responses?.name || fb.responses?.formName || 'Unknown'}
                        </p>
                        <p className="text-sm opacity-75">{fb.responses?.email || ''}</p>
                      </div>
                      <p className="text-yellow-500">
                        {(() => {
                          const r = parseInt(fb.responses?.rating ?? 0) || 0;
                          return '★'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r));
                        })()}
                      </p>
                    </div>

                    <p className="mt-2">
                      {fb.responses?.message ||
                        fb.responses?.['Your message'] ||
                        fb.feedback ||
                        ''}
                    </p>

                    <p className="text-xs opacity-60 text-right mt-2">
                      {fb.responses?.createdAt
                        ? new Date(fb.responses.createdAt).toLocaleString()
                        : fb.createdAt
                        ? new Date(fb.createdAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="w-20 h-20" />
          </div>
        ) : totalForms > 0 ? (
          <FormStats groupedFeedbacks={groupedFeedbacks} />
        ) : (
          <div className={`py-12 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No feedback available yet.
          </div>
        )}
      </div>
    </div>
  );
}
