'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useThemeStore } from '../utils/themestore';

export default function FormStats({ groupedFeedbacks }) {
  const darkMode = useThemeStore((state) => state.darkMode);

  // Bar chart data: submissions per form
  const chartData = Object.entries(groupedFeedbacks).map(([formId, feedbacks]) => ({
    formId,
    submissions: feedbacks.length,
    timestamps: feedbacks.map(f => new Date(f.createdAt)),
  }));

  // Line chart data: submissions by date
  const allTimestamps = chartData.flatMap(({ timestamps }) => timestamps);
  const timeGrouped = {};
  allTimestamps.forEach(ts => {
    const dateKey = new Date(ts).toLocaleDateString();
    timeGrouped[dateKey] = (timeGrouped[dateKey] || 0) + 1;
  });
  const lineChartData = Object.entries(timeGrouped).map(([date, count]) => ({ date, count }));

  // Top forms by submissions
  const topForms = Object.entries(groupedFeedbacks)
    .map(([id, list]) => ({ id, name: list[0]?.responses?.formName || 'Untitled', count: list.length }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 5); // top 5

  const totalForms = Object.keys(groupedFeedbacks).length;
  const totalResponses = Object.values(groupedFeedbacks).flat().length;

  // -----------------------
  // Top Locations calculation
  // -----------------------
  // Build an array of human-readable location strings from each feedback:
  // prefer metadata.ipGeo (server-side: city, region, country),
  // else fall back to metadata.location (lat,lng) and show rounded coords.
  const allLocations = Object.values(groupedFeedbacks).flatMap((list) =>
    list.map((fb) => {
      const meta = fb.metadata || {};
      const ipGeo = meta.ipGeo;
      if (ipGeo && (ipGeo.city || ipGeo.region || ipGeo.country)) {
        // join available parts
        const parts = [ipGeo.city, ipGeo.region, ipGeo.country].filter(Boolean);
        return parts.join(', ');
      }
      const loc = meta.location;
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        return `${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)}`; // rounded coords
      }
      return 'Unknown';
    })
  );

  // Count occurrences
  const locCounts = allLocations.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  // Convert to sorted array
  const topLocations = Object.entries(locCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 8); // show top 8 locations

  // -----------------------
  // Styling helpers
  // -----------------------
  const baseCardClasses = darkMode
    ? 'bg-[#18191A] border border-gray-700 rounded-xl p-6 shadow text-gray-100'
    : 'bg-white border border-gray-200 rounded-xl p-6 shadow text-gray-900';

  const titleClasses = darkMode
    ? 'text-md font-semibold text-gray-300 mb-4'
    : 'text-md font-semibold text-gray-600 mb-4';

  return (
    <div className="space-y-8">
      {/* Bar chart card */}
      <div className={baseCardClasses}>
        <h3 className={titleClasses}>Submissions by Form</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
              <XAxis dataKey="formId" stroke={darkMode ? '#ddd' : '#333'} />
              <YAxis stroke={darkMode ? '#ddd' : '#333'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f1f1f' : '#fff',
                  borderColor: darkMode ? '#444' : '#ccc',
                  color: darkMode ? '#fff' : '#000'
                }}
              />
              <Bar dataKey="submissions" fill="#008080" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line chart card */}
      <div className={baseCardClasses}>
        <h3 className={titleClasses}>Submissions Over Time</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
              <XAxis dataKey="date" stroke={darkMode ? '#ddd' : '#333'} />
              <YAxis stroke={darkMode ? '#ddd' : '#333'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f1f1f' : '#fff',
                  borderColor: darkMode ? '#444' : '#ccc',
                  color: darkMode ? '#fff' : '#000'
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#008080" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Forms and Top Locations */}
      <div className={baseCardClasses}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className={`${darkMode ? ' p-3 rounded-lg' : 'bg-gray-50 p-3 rounded-lg'}`}>
              <p className="text-sm font-medium mb-3">Top Forms by Submissions</p>
              <ul className="space-y-3">
                {topForms.length === 0 ? (
                  <li className="text-sm text-gray-400">No forms yet</li>
                ) : (
                  topForms.map((f, i) => (
                    <li key={f.id} className="flex border-b-2 p-2 items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[260px]" title={f.name}>
                          {i + 1}. {f.name}
                        </p>
                        <p className="text-xs opacity-60">Form ID: {f.id}</p>
                      </div>
                      <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--blue)', color: 'var(--white)' }}>
                        {f.count}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Top Locations card */}
          <div>
            <div className={`${darkMode ? ' p-3 rounded-lg' : 'bg-gray-50 p-3 rounded-lg'}`}>
              <p className="text-sm font-medium mb-3">Top Locations</p>

              {topLocations.length === 0 ? (
                <p className="text-sm text-gray-400">No location data yet</p>
              ) : (
                <ul className="space-y-3">
                  {topLocations.map((loc, idx) => (
                    <li key={loc.label} className="flex items-center justify-between p-2 border rounded">
                      <div className="truncate">
                        <p className="text-sm font-semibold" title={loc.label}>{idx + 1}. {loc.label}</p>
                        <p className="text-xs opacity-60">Responses: {loc.count}</p>
                      </div>
                      <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: darkMode ? '#222' : '#e6f7f7' }}>
                        {loc.count}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Small summary tiles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`${darkMode ? ' p-3 rounded-lg' : 'bg-white p-3 rounded-lg border'}`}>
            <p className="text-xs text-gray-400">Total Forms</p>
            <p className="text-lg font-bold">{totalForms}</p>
          </div>
          <div className={`${darkMode ? ' p-3 rounded-lg' : 'bg-white p-3 rounded-lg border'}`}>
            <p className="text-xs text-gray-400">Total Responses</p>
            <p className="text-lg font-bold">{totalResponses}</p>
          </div>
          <div className={`${darkMode ? ' p-3 rounded-lg' : 'bg-white p-3 rounded-lg border'}`}>
            <p className="text-xs text-gray-400">Locations Tracked</p>
            <p className="text-lg font-bold">{Object.keys(locCounts).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
