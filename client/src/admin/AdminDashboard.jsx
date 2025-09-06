'use client';
import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { FaRegClipboard, FaRegCommentDots } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { useUserStore } from '../utils/userstore';
import { useThemeStore } from '../utils/themestore';
import FormCard from './FormCard';
import AdminStatsCard from './AdminStatsCard';
import FormStats from './FormStats';
import ExportCSVButton from './ExportCSVButton';

export default function AdminDashboard() {
  const user = useUserStore((state) => state.user);
  const darkMode = useThemeStore((state) => state.darkMode);

  const [groupedFeedbacks, setGroupedFeedbacks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(user,"oppppppppp")
    if (user?.userId) {
      fetchFeedbacks(user.userId);
    }
  }, [user?.userId]);

  const fetchFeedbacks = async (uid) => {
  try {
    const response = await fetch(`http://localhost:5000/api/feedback?uid=${uid}`);
    if (response.ok) {
      const data = await response.json();
      console.log("[FEEDBACKS]", data);
      setGroupedFeedbacks(data.feedbacksByForm || {});
    }
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
  } finally {
    setLoading(false);
  }
};


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/feedback?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      const allFeedbacks = Object.values(data.feedbacksByForm || {}).flat();

      setSearchResults(allFeedbacks);
      setShowModal(true);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const totalForms = Object.keys(groupedFeedbacks).length;
  const totalFeedbacks = Object.values(groupedFeedbacks).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <div className={`max-w-6xl mx-auto p-6 transition-colors ${darkMode ? ' text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[var(--blue)]">Feedback Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={fetchFeedbacks}
            className={`flex items-center gap-2 font-bold px-4 py-2 rounded hover:opacity-90 transition
              ${darkMode ? 'bg-[var(--lightblue)] text-gray-900' : 'bg-[var(--blue)] text-black'}
            `}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats + Actions Row */}
      <div className="flex flex-wrap gap-4 mb-8">
        <AdminStatsCard title="Total Forms" value={totalForms} icon={<FaRegClipboard />} />
        <AdminStatsCard title="Total Feedbacks" value={totalFeedbacks} icon={<FaRegCommentDots />} />

        {/* Export Button */}
        <div className={`flex items-center justify-center p-4 rounded-lg shadow min-w-[200px] ${darkMode ? 'border border-white text-gray-200' : 'bg-white text-gray-900'}`}>
          Export
          <ExportCSVButton data={groupedFeedbacks} />
        </div>

        {/* Search */}
        <div className={`flex items-center rounded-lg p-2 min-w-[250px] flex-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full outline-none text-sm pr-2 border-b-2 p-2 mr-4 ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
          <button
            onClick={handleSearch}
            className={`w-12 h-9 flex items-center justify-center rounded hover:opacity-90 transition
              ${darkMode ? 'bg-[var(--lightblue)]' : 'bg-[var(--blue)]'}
            `}
            title="Search"
          >
            <FiSearch className={`${darkMode ? 'text-gray-900' : 'text-gray-700'}`} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
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
                    className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{fb.name}</p>
                        <p className="text-sm opacity-75">{fb.email}</p>
                      </div>
                      <p className="text-yellow-500">
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                      </p>
                    </div>
                    <p className="mt-2">{fb.feedback}</p>
                    <p className="text-xs opacity-60 text-right">
                      {new Date(fb.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      {!loading && totalForms > 0 && (
        <FormStats groupedFeedbacks={groupedFeedbacks} />
      )}

      {/* Feedback Cards */}
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : totalForms === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No feedback submissions yet</p>
          <p className="text-gray-400 mt-2">They will appear here once users submit feedback.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {Object.entries(groupedFeedbacks).map(([formId, feedbacks]) => {
  // Extract the formName from the first feedback in this group
  const formName = feedbacks[0]?.responses?.formName || "Untitled Form";

  return (
    <FormCard
      key={formId}
      formId={formId}
      formName={formName}
      feedbacks={feedbacks}
    />
  );
})}

        </div>
      )}
    </div>
  );
}
