'use client';
import { useEffect, useState } from 'react';
import {
  FiRefreshCw,
  FiEye,
  FiClock,
  FiBarChart2
} from 'react-icons/fi';
import { FaRegClipboard, FaRegCommentDots } from 'react-icons/fa';
import { useUserStore } from '../utils/userstore';
import { useThemeStore } from '../utils/themestore';
import FormStats from './FormStats';
import ExportCSVButton from './ExportCSVButton';
import Loader from '../components/Loading';
import { fetchFeedbacksByUser, searchFeedbacks } from '../utils/api/feedback';
import { fetchForms } from '../utils/api/form';

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
  const [forms, setForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!user?.userId) return;
    const controller = new AbortController();

    const loadDashboardData = async () => {
      setLoading(true);
      const [formsData, feedbackData] = await Promise.all([
        fetchForms(baseUrl, user.userId),
        fetchFeedbacksByUser(baseUrl, user.userId, controller.signal),
      ]);

      const normalized = Object.fromEntries(
        Object.entries(feedbackData).map(([formId, list]) => [
          formId,
          Array.isArray(list) ? list.map(normalizeFeedback) : [],
        ])
      );

      setGroupedFeedbacks(normalized);
      setForms(formsData);
      setLoading(false);
    };

    loadDashboardData();
    return () => controller.abort();
  }, [user?.userId]);

  const handleRefresh = async () => {
    if (!user?.userId) return;
    setLoading(true);
    const [formsData, feedbackData] = await Promise.all([
      fetchForms(baseUrl, user.userId),
      fetchFeedbacksByUser(baseUrl, user.userId),
    ]);

    const normalized = Object.fromEntries(
      Object.entries(feedbackData).map(([formId, list]) => [
        formId,
        Array.isArray(list) ? list.map(normalizeFeedback) : [],
      ])
    );

    setGroupedFeedbacks(normalized);
    setForms(formsData);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchFeedbacks(baseUrl, searchQuery);
    const normalized = results.map(normalizeFeedback);
    setSearchResults(normalized);
    setShowModal(true);
  };

  const totalForms = forms.length;
  const totalViews = forms.reduce((sum, f) => sum + (f.viewCount || 0), 0);
  const totalSubmissions = forms.reduce((sum, f) => sum + (f.feedbackCount || 0), 0);
  const totalTimeSpent = forms.reduce((sum, f) => sum + (f.totalTimeSpent || 0), 0);
  const avgTimePerSubmission = totalSubmissions
    ? (totalTimeSpent / totalSubmissions).toFixed(1)
    : 0;
  const avgTimePerView = totalViews
    ? (totalTimeSpent / totalViews).toFixed(1)
    : 0;

  return (
    <div className={`max-w-6xl mx-auto p-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-2 font-bold px-4 py-2 rounded hover:opacity-90 transition
            ${darkMode ? 'bg-[var(--lightblue)] text-gray-900' : 'bg-[var(--blue)] text-black'}`}
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center mb-8">
        <div className="flex flex-col items-center">
          <FaRegClipboard size={22} />
          <p className="text-sm opacity-70 mt-1">Forms</p>
          <p className="text-lg font-semibold">{totalForms}</p>
        </div>
        <div className="flex flex-col items-center">
          <FiEye size={22} />
          <p className="text-sm opacity-70 mt-1">Views</p>
          <p className="text-lg font-semibold">{totalViews}</p>
        </div>
        <div className="flex flex-col items-center">
          <FaRegCommentDots size={22} />
          <p className="text-sm opacity-70 mt-1">Submissions</p>
          <p className="text-lg font-semibold">{totalSubmissions}</p>
        </div>
        <div className="flex flex-col items-center">
          <FiClock size={22} />
          <p className="text-sm opacity-70 mt-1">Time Spent (s)</p>
          <p className="text-lg font-semibold">{totalTimeSpent}s</p>
        </div>
        <div className="flex flex-col items-center">
          <FiBarChart2 size={22} />
          <p className="text-sm opacity-70 mt-1">Avg / Submission (s)</p>
          <p className="text-lg font-semibold">{avgTimePerSubmission} s</p>
        </div>
        <div className="flex flex-col items-center">
          <FiBarChart2 size={22} />
          <p className="text-sm opacity-70 mt-1">Avg / View (s)</p>
          <p className="text-lg font-semibold">{avgTimePerView}s</p>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <ExportCSVButton data={groupedFeedbacks} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div
            className={`rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative ${
              darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
            }`}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              close
            </button>
            <h2 className="text-xl font-bold mb-4">
              Search Results for "{searchQuery}"
            </h2>

            {searchResults.length === 0 ? (
              <p className="text-gray-500">No feedback found.</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((fb, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-md ${
                      darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          {fb.responses?.name || fb.responses?.formName || 'Unknown'}
                        </p>
                        <p className="text-sm opacity-75">
                          {fb.responses?.email || ''}
                        </p>
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
          <FormStats groupedFeedbacks={groupedFeedbacks} forms={forms} />
        ) : (
          <div
            className={`py-12 text-center ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            No feedback available yet.
          </div>
        )}
      </div>
    </div>
  );
}
