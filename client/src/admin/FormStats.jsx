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

      {/* Top Forms card */}
      <div className={baseCardClasses}>
        {/* <h3 className={titleClasses}>Top Forms</h3> */}
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

          {/* Small summary tiles */}
          <div className="flex flex-col gap-3">
            <div className={`${darkMode ? ' p-3 rounded-lg' : 'bg-white p-3 rounded-lg border'}`}>
              <p className="text-xs text-gray-400">Total Forms</p>
              <p className="text-lg font-bold">{totalForms}</p>
            </div>
            <div className={`${darkMode ? ' p-3 rounded-lg' : 'bg-white p-3 rounded-lg border'}`}>
              <p className="text-xs text-gray-400">Total Responses</p>
              <p className="text-lg font-bold">{totalResponses}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
