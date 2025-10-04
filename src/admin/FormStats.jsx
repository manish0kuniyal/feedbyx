'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import { useThemeStore } from '../utils/themestore';
import { FiGlobe } from 'react-icons/fi';
import { FaChrome, FaFirefox, FaEdge, FaSafari, FaWindows, FaApple, FaAndroid, FaLinux, FaQuestion } from 'react-icons/fa';
import { GrResources } from "react-icons/gr";
import FeedbackMap from './FeedbackMap'; // adjust path if needed

// small country code map (unchanged)
const countryNameToCode = {
  India: "IN",
  "United States": "US",
  "United Kingdom": "GB",
  Canada: "CA",
  Germany: "DE",
  France: "FR",
  Australia: "AU",
  Italy: "IT",
  Spain: "ES",
  China: "CN",
  Japan: "JP",
  Brazil: "BR",
};
function getCountryCode(countryName) { if (!countryName) return null; return countryNameToCode[countryName] || null; }

function parseUserAgent(ua = '') {
  const s = ua || '';
  const browsers = [
    { name: 'Edge', re: /edg(e|a|ios)?\/(\d+)/i },
    { name: 'Chrome', re: /chrome\/(\d+)/i },
    { name: 'Firefox', re: /firefox\/(\d+)/i },
    { name: 'Safari', re: /version\/(\d+).+?safari/i },
    { name: 'Opera', re: /opr\/|opera/i },
    { name: 'IE', re: /msie|trident/i },
  ];
  let browser = 'Other';
  for (const b of browsers) { if (b.re.test(s)) { browser = b.name; break; } }
  let os = 'Other';
  if (/windows nt/i.test(s)) os = 'Windows';
  else if (/mac os x/i.test(s) || /\(macintosh/i.test(s)) os = 'macOS';
  else if (/android/i.test(s)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(s)) os = 'iOS';
  else if (/linux/i.test(s)) os = 'Linux';
  let device = 'Desktop';
  if (/mobile/i.test(s) || /iphone|android.*mobile/i.test(s)) device = 'Mobile';
  else if (/tablet|ipad/i.test(s)) device = 'Tablet';
  return { browser, os, device };
}

function BrowserIcon({ name, className }) {
  const n = (name || '').toLowerCase();
  if (n.includes('edge')) return <FaEdge className={className} />;
  if (n.includes('chrome')) return <FaChrome className={className} />;
  if (n.includes('firefox')) return <FaFirefox className={className} />;
  if (n.includes('safari')) return <FaSafari className={className} />;
  if (n.includes('opera') || n.includes('opr')) return <FaFirefox className={className} />;
  if (n.includes('ie') || n.includes('trident')) return <FaQuestion className={className} />;
  return <FaQuestion className={className} />;
}
function OSIcon({ name, className }) {
  const n = (name || '').toLowerCase();
  if (n.includes('windows')) return <FaWindows className={className} />;
  if (n.includes('mac') || n.includes('ios')) return <FaApple className={className} />;
  if (n.includes('android')) return <FaAndroid className={className} />;
  if (n.includes('linux')) return <FaLinux className={className} />;
  return <FaQuestion className={className} />;
}

/** Motion variants */
const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function FormStats({ groupedFeedbacks }) {
  const darkMode = useThemeStore((state) => state.darkMode);

  const grouped = groupedFeedbacks || {};
  const allFeedbackItems = useMemo(() => Object.values(grouped).flat(), [grouped]);

  // Charts data
  const chartData = useMemo(() => Object.entries(grouped).map(([formId, feedbacks]) => ({
    formId,
    // attempt to find a human friendly name for label
    formName:
      feedbacks?.[0]?.responses?.formName ||
      feedbacks?.[0]?.formName ||
      formId,
    submissions: (feedbacks || []).length,
    timestamps: (feedbacks || []).map(f => new Date(f.createdAt)),
  })), [grouped]);

  const allTimestamps = chartData.flatMap(({ timestamps }) => timestamps);
  const timeGrouped = {};
  allTimestamps.forEach(ts => {
    const dateKey = new Date(ts).toLocaleDateString();
    timeGrouped[dateKey] = (timeGrouped[dateKey] || 0) + 1;
  });
  const lineChartData = Object.entries(timeGrouped).map(([date, count]) => ({ date, count }));

  // Top Locations for small list
  const topLocations = useMemo(() => {
    const m = {};
    allFeedbackItems.forEach((fb) => {
      const meta = fb?.metadata || {};
      const label = meta.locationGeo?.label || meta.locationLabel || meta.ipGeo?.label || "Unknown";
      const country = meta.locationGeo?.country || meta.ipGeo?.country || null;
      const countryCode = getCountryCode(country);
      if (!m[label]) m[label] = { label, country, countryCode, count: 0 };
      m[label].count++;
    });
    return Object.values(m).sort((a, b) => b.count - a.count).slice(0, 12);
  }, [allFeedbackItems]);

  // User-Agent breakdown
  const { topBrowsers, topOS } = useMemo(() => {
    const bmap = {}, osmap = {};
    allFeedbackItems.forEach(fb => {
      const ua = fb?.metadata?.userAgent || '';
      const { browser, os } = parseUserAgent(ua);
      bmap[browser] = (bmap[browser] || 0) + 1;
      osmap[os] = (osmap[os] || 0) + 1;
    });
    const topBrowsersArr = Object.entries(bmap).map(([k,v]) => ({ browser: k, count: v })).sort((a,b)=>b.count-a.count).slice(0,6);
    const topOSArr = Object.entries(osmap).map(([k,v]) => ({ os: k, count: v })).sort((a,b)=>b.count-a.count).slice(0,6);
    return { topBrowsers: topBrowsersArr, topOS: topOSArr };
  }, [allFeedbackItems]);

  const baseCardClasses = darkMode
    ? 'bg-[#18191A] border border-gray-700 rounded-xl p-6 shadow text-gray-100'
    : 'bg-white border border-gray-200 rounded-xl p-6 shadow text-gray-900';

  const titleClasses = darkMode
    ? 'text-md font-semibold text-gray-300 mb-4'
    : 'text-md font-semibold text-gray-600 mb-4';

  const smallCard = darkMode ? ' p-3 rounded-lg text-gray-200' : 'bg-white p-3 rounded-lg ';

  return (
    <div className="space-y-8">
      {/* Charts row: two equal columns on md+, stacked on small screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <motion.div
          className={baseCardClasses}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35 }}
          layout
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.995 }}
        >
          <h3 className={titleClasses}>Submissions by Form</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#eee'} />
                <XAxis dataKey="formName" stroke={darkMode ? '#ddd' : '#333'} />
                <YAxis stroke={darkMode ? '#ddd' : '#333'} />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Submissions']}
                  labelFormatter={(label) => `Form: ${label}`}
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
        </motion.div>

        {/* Line chart */}
        <motion.div
          className={baseCardClasses}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35, delay: 0.08 }}
          layout
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.995 }}
        >
          <h3 className={titleClasses}>Submissions Over Time</h3>
          <div className="w-full h-72">
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
        </motion.div>
      </div>

      {/* Map + Locations: map left, locations right on md+, stacked on small screens */}
      <motion.div
        className={`${baseCardClasses} w-full`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.35, delay: 0.16 }}
        layout
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiGlobe className="w-5 h-5 text-[var(--blue)]" />
            <h4 className="text-sm font-semibold">Location</h4>
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left: map (2/3 width on md) */}
            <div className="md:col-span-2 h-[420px] overflow-hidden rounded-lg">
              <div className={`${smallCard} h-full w-full p-0 overflow-hidden`}>
                <FeedbackMap feedbacks={allFeedbackItems} height="100%" />
              </div>
            </div>

            {/* Right: locations list (1/3 width on md) */}
            <div className="md:col-span-1">
              <div className={`${smallCard} h-[420px] overflow-auto p-4 flex flex-col gap-3`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{topLocations.length} locations</div>
                  <div className="text-xs text-gray-400">Top</div>
                </div>

                {topLocations.length === 0 ? (
                  <div className="text-sm text-gray-400 mt-4">No location data</div>
                ) : (
                  <ul className="divide-y divide-gray-100/50">
                    {topLocations.map((loc) => (
                      <li key={loc.label} className="py-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* optional flag emoji if countryCode present */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-sm font-semibold">
                            {loc.countryCode ? (
                              // convert country code to emoji flag
                              String.fromCodePoint(...loc.countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)))
                            ) : (
                              <FiGlobe className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{loc.label}</div>
                            <div className="text-xs opacity-70 truncate">
                              {loc.country ? `${loc.country}` : '—'}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="text-sm font-semibold">{loc.count}</div>
                          <div className="text-xs opacity-70">submissions</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Source card — full width below map */}
      <motion.div
        className={`${baseCardClasses} w-full p-4`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.35, delay: 0.24 }}
        layout
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GrResources className="w-5 h-5 text-[var(--blue)]" />
            <h4 className="text-sm font-semibold">Source</h4>
          </div>
        </div>

        <div className={`${smallCard} h-64 overflow-auto`}>
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">Top Browsers</p>
            {topBrowsers.length === 0 ? (
              <p className="text-sm text-gray-400">No UA data</p>
            ) : (
              <ul className="space-y-2">
                {topBrowsers.map((b) => (
                  <li key={b.browser} className="flex items-center justify-between p-2 rounded">
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex items-center gap-2">
                        <BrowserIcon name={b.browser} className="w-4 h-4" />
                        <span className="text-sm truncate">{b.browser}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold px-2 py-1 rounded-full" style={{ backgroundColor: darkMode ? '#222' : '#e6f7f7' }}>
                      {b.count}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Top OS</p>
            {topOS.length === 0 ? (
              <p className="text-sm text-gray-400">No OS data</p>
            ) : (
              <ul className="space-y-2">
                {topOS.map((o) => (
                  <li key={o.os} className="flex items-center justify-between p-2 rounded">
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex items-center gap-2">
                        <OSIcon name={o.os} className="w-4 h-4" />
                        <span className="text-sm truncate"> {o.os}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold px-2 py-1 rounded-full" style={{ backgroundColor: darkMode ? '#222' : '#e6f7f7' }}>
                      {o.count}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
