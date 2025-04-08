/**
 * Utility functions for exporting data in various formats
 */

/**
 * Export data as CSV file
 * @param data Array of objects to export
 * @param headers Object mapping column names to display names
 * @param filename Name of the file to download
 */
export function exportToCSV(
  data: Record<string, any>[],
  headers: Record<string, string>,
  filename: string
): void {
  // Extract header keys and display names
  const headerKeys = Object.keys(headers);
  const headerRow = headerKeys.map((key) => `"${headers[key]}"`).join(",");

  // Generate CSV content
  const csvRows = [
    headerRow,
    ...data.map((row) =>
      headerKeys
        .map((key) => {
          const value = row[key];
          // Handle different data types
          if (value === null || value === undefined) return "";
          if (typeof value === "string")
            return `"${value.replace(/"/g, '""')}"`;
          return value;
        })
        .join(",")
    ),
  ];

  // Combine all rows
  const csvContent = csvRows.join("\n");

  // Create a download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Set filename with date if it doesn't have extension
  if (!filename.includes(".")) {
    const date = new Date().toISOString().split("T")[0];
    filename = `${filename}-${date}.csv`;
  }

  // Trigger download
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prepares data for print/PDF export
 * Opens a new window with formatted HTML content that can be printed/saved as PDF
 *
 * @param title Title of the document
 * @param content HTML content as a string
 * @param styles Additional CSS styles
 */
export function exportToPrint(
  title: string,
  content: string,
  styles?: string
): void {
  // Open a new window
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error(
      "Could not open print window. Check if popups are blocked."
    );
  }

  // Base styles
  const baseStyles = `
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      max-width: 800px; 
      margin: 0 auto; 
    }
    h1 { color: #3b82f6; margin-bottom: 5px; }
    h2 { color: #4b5563; margin-top: 20px; margin-bottom: 10px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background-color: #f3f4f6; }
    .good { color: #22c55e; }
    .warning { color: #eab308; }
    .bad { color: #ef4444; }
    @media print {
      body { padding: 0; }
      button { display: none; }
    }
  `;

  // Write the content
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${baseStyles}
          ${styles || ""}
        </style>
      </head>
      <body>
        <button onclick="window.print();" style="padding:10px; background:#3b82f6; color:white; border:none; border-radius:5px; margin-bottom:20px; cursor:pointer;">
          Print / Save as PDF
        </button>
        ${content}
        <div style="margin-top:30px; font-size:0.8rem; color:#6b7280; text-align:center;">
          Generated on ${new Date().toLocaleString()} by Grades Tracker
        </div>
      </body>
    </html>
  `);

  // Close the document for writing
  printWindow.document.close();
}
