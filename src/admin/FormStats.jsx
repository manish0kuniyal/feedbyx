'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useThemeStore } from '../utils/themestore';
import { FiGlobe, FiLink } from 'react-icons/fi';
import { FaChrome, FaFirefox, FaEdge, FaSafari, FaWindows, FaApple, FaAndroid, FaLinux, FaQuestion } from 'react-icons/fa';
import { GrResources } from "react-icons/gr";
// use this icon fro source isntea dof svvg
// simple mapping country name -> ISO code (extend this as needed)
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

function getCountryCode(countryName) {
  if (!countryName) return null;
  return countryNameToCode[countryName] || null;
}

/** Helper: clean a URL for display (remove protocol, trailing slash) */
function cleanUrlForDisplay(rawUrl) {
  if (!rawUrl || rawUrl === 'Unknown') return 'Unknown';
  try {
    const u = new URL(rawUrl);
    const host = u.host.replace(/^www\./i, '');
    const path = u.pathname.replace(/\/$/, '');
    return host + (path ? path : '');
  } catch (err) {
    return rawUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
  }
}

/** Simple UA parser heuristics (not exhaustive) */
function parseUserAgent(ua = '') {
  const s = ua || '';
  const lower = s.toLowerCase();

  const browsers = [
    { name: 'Edge', re: /edg(e|a|ios)?\/(\d+)/i },
    { name: 'Chrome', re: /chrome\/(\d+)/i },
    { name: 'Firefox', re: /firefox\/(\d+)/i },
    { name: 'Safari', re: /version\/(\d+).+?safari/i },
    { name: 'Opera', re: /opr\/|opera/i },
    { name: 'IE', re: /msie|trident/i },
  ];

  let browser = 'Other';
  for (const b of browsers) {
    if (b.re.test(s)) {
      browser = b.name;
      break;
    }
  }

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

/** Map browser name -> icon component */
function BrowserIcon({ name, className }) {
  const n = (name || '').toLowerCase();
  if (n.includes('edge')) return <FaEdge className={className} />;
  if (n.includes('chrome')) return <FaChrome className={className} />;
  if (n.includes('firefox')) return <FaFirefox className={className} />;
  if (n.includes('safari')) return <FaSafari className={className} />;
  if (n.includes('opera') || n.includes('opr')) return <FaFirefox className={className} />; // no opera icon in fa free - reuse
  if (n.includes('ie') || n.includes('trident')) return <FaQuestion className={className} />;
  return <FaQuestion className={className} />;
}

/** Map OS name -> icon component */
function OSIcon({ name, className }) {
  const n = (name || '').toLowerCase();
  if (n.includes('windows')) return <FaWindows className={className} />;
  if (n.includes('mac') || n.includes('ios')) return <FaApple className={className} />;
  if (n.includes('android')) return <FaAndroid className={className} />;
  if (n.includes('linux')) return <FaLinux className={className} />;
  return <FaQuestion className={className} />;
}

export default function FormStats({ groupedFeedbacks }) {
  const darkMode = useThemeStore((state) => state.darkMode);

  const grouped = groupedFeedbacks || {};
  const allFeedbackItems = useMemo(() => Object.values(grouped).flat(), [grouped]);

  // Charts data
  const chartData = useMemo(() => Object.entries(grouped).map(([formId, feedbacks]) => ({
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

  // Build Top Locations with country info
  const topLocations = useMemo(() => {
    const m = {};
    allFeedbackItems.forEach((fb) => {
      const meta = fb?.metadata || {};
      const label = meta.locationGeo?.label || meta.locationLabel || meta.ipGeo?.label || "Unknown";
      const country = meta.locationGeo?.country || meta.ipGeo?.country || null;
      if (!m[label]) m[label] = { label, country, count: 0 };
      m[label].count++;
    });
    return Object.values(m).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [allFeedbackItems]);

  // Top Page URLs (cleaned display)
  const pageUrlCounts = useMemo(() => {
    const m = {};
    allFeedbackItems.forEach(fb => {
      const url = fb?.metadata?.pageUrl || 'Unknown';
      const display = cleanUrlForDisplay(url);
      const key = url;
      if (!m[key]) m[key] = { url: key, display, count: 0 };
      m[key].count++;
    });
    return Object.values(m)
      .sort((a,b) => b.count - a.count)
      .slice(0, 6);
  }, [allFeedbackItems]);

  // User-Agent breakdown: browsers and OS
  const { topBrowsers, topOS } = useMemo(() => {
    const bmap = {};
    const osmap = {};
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

  const smallCard = darkMode
    ? ' p-3 rounded-lg text-gray-200'
    : 'bg-white p-3 rounded-lg ';

  return (
    <div className="space-y-8">
      {/* Bar chart */}
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

      {/* Line chart */}
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

      {/* Three independent cards: Location | URLs | Source */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location card */}
        <div className={baseCardClasses + ' p-4'}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiGlobe className="w-5 h-5  text-[var(--blue)] " />
              <h4 className="text-sm

              font-semibold">Location</h4>
            </div>
          </div>
          <div className={`${smallCard} h-64 overflow-auto`}>
            {topLocations.length === 0 ? (
              <p className="text-sm text-gray-400">No location data</p>
            ) : (
              <ul className="space-y-3">
                {topLocations.map((loc, idx) => {
                  const code = getCountryCode(loc.country);
                  return (
                    <li key={loc.label} className="flex items-center justify-between p-2 rounded">
                      <div className="flex items-center gap-3 truncate">
                        <div className="flex items-center gap-2 truncate">
                          {/* <span className="text-sm font-semibold truncate" title={loc.label}>
                            {idx + 1}.
                          </span> */}
                          {code && (
                            <img
                              src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`}
                              alt={loc.country}
                              className="inline-block w-5 h-4 object-cover rounded-sm"
                            />
                          )}
                          <span className="text-sm truncate">{loc.label}</span>
                        </div>
                        <span className="text-xs opacity-60">Responses: {loc.count}</span>
                      </div>
                      <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: darkMode ? '#222' : '#e6f7f7' }}>
                        {loc.count}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* URLs card */}
        <div className={baseCardClasses + ' p-4'}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiLink className="w-5 h-5  text-[var(--blue)] " />
              <h4 className="text-sm font-semibold">URLs</h4>
            </div>
          </div>
          <div className={`${smallCard} h-64 overflow-auto`}>
            {pageUrlCounts.length === 0 ? (
              <p className="text-sm text-gray-400">No page URL data</p>
            ) : (
              <ul className="space-y-2">
                {pageUrlCounts.map((p, i) => (
                  <li key={p.url} className="flex items-center justify-between p-2 rounded">
                    <div className="truncate max-w-[220px]">
                      <a
                        href={p.url === 'Unknown' ? '#' : p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold underline truncate"
                        title={p.url}
                      >
                        {i + 1}. {p.display}
                      </a>
                    </div>
                    <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: darkMode ? '#222' : '#e6f7f7' }}>
                      {p.count}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Source card (browser + OS) */}
        <div className={baseCardClasses + ' p-4'}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* /make sure this is an icon with color - text-[var(--blue)]  */}
              <GrResources className="w-5 h-5  text-[var(--blue)] " />
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
                  {topBrowsers.map((b, i) => (
                    <li key={b.browser} className="flex items-center justify-between p-2 rounded">
                      <div className="flex items-center gap-3 truncate">
                        <div className="flex items-center gap-2">
                          <BrowserIcon name={b.browser} className="w-4 h-4" />
                          <span className="text-sm truncate"> {b.browser}</span>
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
                  {topOS.map((o, i) => (
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
        </div>
      </div>
    </div>
  );
}
