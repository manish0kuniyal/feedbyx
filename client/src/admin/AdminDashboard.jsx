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
    if (user?.userId) {
      fetchFeedbacks(user.userId);
    }
  }, [user?.userId]);

  const fetchFeedbacks = async (uid) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback?uid=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setGroupedFeedbacks(data.feedbacksByForm || {});
      } else {
        console.error('fetchFeedbacks failed', response.status);
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
    <div className={`max-w-6xl mx-auto p-6 transition-colors ${darkMode ? ' text-gray-100' : ' text-gray-900'}`}>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[var(--blue)]">Feedback Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => fetchFeedbacks(user?.userId)}
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
        <p className="font-semibold">{fb.responses?.Name || fb.responses?.name || 'Unknown'}</p>
        <p className="text-sm opacity-75">{fb.responses?.email || fb.responses?.Email || ''}</p>
      </div>
      <p className="text-yellow-500">
        {'★'.repeat(fb.responses?.['service review'] || fb.rating || 0)}{'☆'.repeat(5 - (fb.responses?.['service review'] || fb.rating || 0))}
      </p>
    </div>

    <p className="mt-2">{fb.responses?.['Your message'] || fb.responses?.message || fb.feedback || ''}</p>

    {/* Metadata section */}
    <div className="mt-3 text-xs text-gray-400 border-t pt-2">
      <div><strong>IP:</strong> {fb.clientIp || 'N/A'}</div>

      <div>
        <strong>Location:</strong>{' '}
        {fb.metadata?.locationGeo?.label || fb.metadata?.locationLabel ? (
          <>
            {fb.metadata?.locationGeo?.label || fb.metadata?.locationLabel}
            {fb.metadata?.location && typeof fb.metadata.location.lat === 'number' && (
              <>
                {' • '}
                <span className="text-xs opacity-70">{`${fb.metadata.location.lat.toFixed(6)}, ${fb.metadata.location.lng.toFixed(6)}`}</span>
                {' • '}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fb.metadata.location.lat + ',' + fb.metadata.location.lng)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  view
                </a>
              </>
            )}
          </>
        ) : fb.metadata?.location && typeof fb.metadata.location.lat === 'number' ? (
          <>
            {`${fb.metadata.location.lat.toFixed(6)}, ${fb.metadata.location.lng.toFixed(6)}`}
            {fb.metadata.location.accuracy ? ` (±${Math.round(fb.metadata.location.accuracy)}m)` : ''}
            {' • '}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fb.metadata.location.lat + ',' + fb.metadata.location.lng)}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              view
            </a>
          </>
        ) : (
          'N/A'
        )}
      </div>

      <div><strong>Page URL:</strong> <span className="truncate block max-w-md">{fb.metadata?.pageUrl || 'N/A'}</span></div>
      <div><strong>User Agent:</strong> <span className="truncate block max-w-md">{fb.metadata?.userAgent || 'N/A'}</span></div>
      <div><strong>Referrer:</strong> {fb.metadata?.referrer || 'N/A'}</div>

      {fb.metadata?.utm && Object.keys(fb.metadata.utm).length > 0 && (
        <div><strong>UTM:</strong> {JSON.stringify(fb.metadata.utm)}</div>
      )}
    </div>

    <p className="text-xs opacity-60 text-right mt-2">
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
    </div>
  );
}
