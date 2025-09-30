'use client';
import React from 'react';
import { HiDocumentDownload } from "react-icons/hi";

export default function ExportCSVButton({ data, fileName = 'feedback-data.csv' }) {
  const handleExport = () => {
    const headers = ['Form ID', 'Name', 'Email', 'Rating', 'Feedback', 'Timestamp'];
    const rows = [];

    Object.entries(data || {}).forEach(([formId, feedbacks]) => {
      feedbacks.forEach(fb => {
        rows.push([
          formId,
          fb.name,
          fb.email,
          fb.rating,
          `"${fb.feedback?.replace(/"/g, '""') || ''}"`,
          new Date(fb.timestamp).toLocaleString()
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className=" items-center text-[#9ACD32] font-bold px-4 py-2 rounded hover:text-[#a3f007] text-xl transition"
    ><HiDocumentDownload />

    </button>
  );
}
