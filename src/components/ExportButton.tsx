"use client";

import { useState } from "react";
import { downloadCSV, printAsPDF } from "@/lib/export";

type ExportButtonProps = {
  filename: string;
  csvData: Record<string, any>[];
  pdfTitle?: string;
  pdfHeaders?: string[];
  pdfRows?: (string | number)[][];
};

const ExportButton = ({
  filename,
  csvData,
  pdfTitle,
  pdfHeaders,
  pdfRows,
}: ExportButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleCSV = () => {
    downloadCSV(filename, csvData);
    setOpen(false);
  };

  const handlePDF = () => {
    if (pdfTitle && pdfHeaders && pdfRows) {
      printAsPDF(pdfTitle, pdfHeaders, pdfRows);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        id={`export-btn-${filename}`}
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-300 transition-colors"
        title="Export"
      >
        {/* Simple download icon via SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-9 z-50 bg-white shadow-lg rounded-md border border-gray-100 min-w-[150px] py-1 text-sm">
            <button
              onClick={handleCSV}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Export as CSV
            </button>
            {pdfHeaders && (
              <button
                onClick={handlePDF}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print as PDF
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
