'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useThemeStore } from '../utils/themestore';

export default function FormStats({ groupedFeedbacks }) {
  const darkMode = useThemeStore((state) => state.darkMode);

  const chartData = Object.entries(groupedFeedbacks).map(([formId, feedbacks]) => ({
    formId,
    submissions: feedbacks.length,
    timestamps: feedbacks.map(f => new Date(f.createdAt)),
  }));

  const allTimestamps = chartData.flatMap(({ timestamps }) => timestamps);
  const timeGrouped = {};

  allTimestamps.forEach(ts => {
    const dateKey = new Date(ts).toLocaleDateString(); 
    timeGrouped[dateKey] = (timeGrouped[dateKey] || 0) + 1;
  });

  const lineChartData = Object.entries(timeGrouped).map(([date, count]) => ({
    date,
    count
  }));

  const containerClasses = darkMode
    ? 'bg-[#18191A] border border-gray-700 rounded-xl p-6 shadow mb-10 text-gray-100'
    : 'bg-white border border-gray-200 rounded-xl p-6 shadow mb-10 text-gray-900';

  const titleClasses = darkMode
    ? 'text-md font-semibold text-gray-300 mb-2'
    : 'text-md font-semibold text-gray-600 mb-2';

  return (
    <div className={containerClasses}>
      <div className="w-full h-64 mb-10">
        <h3 className={titleClasses}>Submissions by Form</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
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

      <div className="w-full h-64">
        <h3 className={titleClasses}>Submissions Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
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
  );
}
