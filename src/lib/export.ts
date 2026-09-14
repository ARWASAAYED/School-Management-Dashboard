/**
 * Utility functions for exporting data as CSV or triggering print-as-PDF.
 */

/**
 * Convert an array of objects to a CSV string and trigger download.
 */
export function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          // Escape commas/quotes
          if (val === null || val === undefined) return "";
          const str = val instanceof Date ? val.toLocaleDateString("en-US") : String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open browser print dialog for PDF export.
 */
export function printAsPDF(title: string, headers: string[], rows: (string | number)[][]) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td style="padding:6px 12px;border:1px solid #e5e7eb;">${cell ?? ""}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 24px; }
          h1 { font-size: 18px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
          td { font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }
}
