import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Exports HTML content as a PDF file
 * @param elementId ID of the HTML element to export
 * @param filename Name of the PDF file (without extension)
 * @param options Additional options for PDF generation
 */
export async function exportToPDF(
  elementId: string,
  filename: string,
  options: {
    landscape?: boolean;
    quality?: number;
    scale?: number;
  } = {}
): Promise<void> {
  try {
    // Default options
    const { landscape = false, quality = 2, scale = 2 } = options;

    // Get the element to export
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Calculate dimensions
    const imgWidth = landscape ? 297 : 210; // A4 width in mm (landscape or portrait)
    const pageHeight = landscape ? 210 : 297; // A4 height
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Create PDF document
    const pdf = new jsPDF(landscape ? "landscape" : "portrait", "mm", "a4");

    // Add image (first page)
    pdf.addImage(
      canvas.toDataURL("image/jpeg", quality),
      "JPEG",
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", quality),
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);

    return;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

/**
 * Creates a printable element with analytics data that can be converted to PDF
 * @param data Analytics data to include in the PDF
 * @returns ID of the created element
 */
export function createAnalyticsPrintableElement(data: {
  subjects: any[];
  overallAverage: number;
  totalGradesCount: number;
  recentTrend: string;
  predictions?: any[];
  subjectStrengths?: any;
}): string {
  // Create a container that will be converted to PDF
  const elementId = "pdf-export-container";
  let container = document.getElementById(elementId);

  // If container already exists, remove it
  if (container) {
    document.body.removeChild(container);
  }

  // Create a new container
  container = document.createElement("div");
  container.id = elementId;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "white";
  container.style.color = "black";
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";

  const {
    subjects,
    overallAverage,
    totalGradesCount,
    recentTrend,
    predictions,
    subjectStrengths,
  } = data;

  // Create PDF content
  container.innerHTML = `
    <div style="max-width:800px; margin:0 auto;">
      <div style="padding:20px; border-bottom:1px solid #eee;">
        <h1 style="color:#3b82f6; margin-bottom:5px; font-size:24px;">
          Grades Analytics Report
        </h1>
        <p style="color:#666; margin-top:0;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
      
      <div style="margin-top:20px; padding:15px; border:1px solid #eee; border-radius:5px;">
        <h2 style="margin-top:0; color:#333; font-size:18px;">Overall Performance</h2>
        <div style="display:flex; flex-wrap:wrap; gap:20px; margin-top:15px;">
          <div style="flex:1; min-width:150px;">
            <p style="color:#666; margin-bottom:5px; font-size:14px;">Overall Average</p>
            <span style="font-weight:bold; font-size:22px; color:${getGradeColor(
              overallAverage
            )};">${overallAverage.toFixed(2)}</span>
          </div>
          <div style="flex:1; min-width:150px;">
            <p style="color:#666; margin-bottom:5px; font-size:14px;">Recent Trend</p>
            <span style="font-weight:bold; font-size:16px; color:${getTrendColor(
              recentTrend
            )};">
              ${formatTrend(recentTrend)}
            </span>
          </div>
          <div style="flex:1; min-width:150px;">
            <p style="color:#666; margin-bottom:5px; font-size:14px;">Total Subjects</p>
            <span style="font-weight:bold; font-size:22px;">${
              subjects.length
            }</span>
          </div>
          <div style="flex:1; min-width:150px;">
            <p style="color:#666; margin-bottom:5px; font-size:14px;">Total Grades</p>
            <span style="font-weight:bold; font-size:22px;">${totalGradesCount}</span>
          </div>
        </div>
      </div>
      
      <div style="margin-top:20px; padding:15px; border:1px solid #eee; border-radius:5px;">
        <h2 style="margin-top:0; color:#333; font-size:18px;">Subject Performance</h2>
        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
          <thead>
            <tr style="background-color:#f8f9fa;">
              <th style="padding:10px; text-align:left; border-bottom:1px solid #eee;">Subject</th>
              <th style="padding:10px; text-align:left; border-bottom:1px solid #eee;">Average Grade</th>
              <th style="padding:10px; text-align:left; border-bottom:1px solid #eee;">Grades Count</th>
            </tr>
          </thead>
          <tbody>
            ${subjects
              .filter((subject) => subject.grades && subject.grades.length > 0)
              .map(
                (subject) => `
                <tr>
                  <td style="padding:10px; border-bottom:1px solid #eee;">${
                    subject.name
                  }</td>
                  <td style="padding:10px; border-bottom:1px solid #eee;">
                    <span style="font-weight:bold; color:${getGradeColor(
                      subject.averageGrade
                    )};">
                      ${subject.averageGrade.toFixed(2)}
                    </span>
                  </td>
                  <td style="padding:10px; border-bottom:1px solid #eee;">${
                    subject.grades.length
                  }</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      
      ${
        subjectStrengths
          ? `
        <div style="margin-top:20px; padding:15px; border:1px solid #eee; border-radius:5px;">
          <h2 style="margin-top:0; color:#333; font-size:18px;">Performance Insights</h2>
          <div style="display:flex; flex-wrap:wrap; gap:20px; margin-top:15px;">
            ${
              subjectStrengths.bestSubject
                ? `
              <div style="flex:1; min-width:200px;">
                <p style="color:#666; margin-bottom:5px; font-size:14px;">Best Subject</p>
                <span style="display:inline-block; padding:5px 10px; background:rgba(34,197,94,0.1); color:#22c55e; border-radius:50px; font-size:14px;">
                  ${subjectStrengths.bestSubject}
                </span>
              </div>
            `
                : ""
            }
            ${
              subjectStrengths.worstSubject
                ? `
              <div style="flex:1; min-width:200px;">
                <p style="color:#666; margin-bottom:5px; font-size:14px;">Needs Improvement</p>
                <span style="display:inline-block; padding:5px 10px; background:rgba(234,179,8,0.1); color:#eab308; border-radius:50px; font-size:14px;">
                  ${subjectStrengths.worstSubject}
                </span>
              </div>
            `
                : ""
            }
            ${
              subjectStrengths.mostImproved
                ? `
              <div style="flex:1; min-width:200px;">
                <p style="color:#666; margin-bottom:5px; font-size:14px;">Most Improved</p>
                <span style="display:inline-block; padding:5px 10px; background:rgba(59,130,246,0.1); color:#3b82f6; border-radius:50px; font-size:14px;">
                  ${subjectStrengths.mostImproved}
                </span>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `
          : ""
      }
      
      ${
        predictions && predictions.length > 0
          ? `
        <div style="margin-top:20px; padding:15px; border:1px solid #eee; border-radius:5px;">
          <h2 style="margin-top:0; color:#333; font-size:18px;">Future Predictions</h2>
          <p style="margin-top:10px;">
            Based on your current performance trends, your predicted grade might be around 
            <span style="font-weight:bold; color:${getGradeColor(
              predictions[2].value
            )};">
              ${predictions[2].value.toFixed(2)}
            </span> 
            in the future.
          </p>
        </div>
      `
          : ""
      }
      
      <div style="margin-top:30px; text-align:center; color:#666; font-size:12px; padding-top:20px; border-top:1px solid #eee;">
        <p>Generated by Grades Tracker • ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(container);
  return elementId;
}

// Helper functions
function getGradeColor(grade: number): string {
  if (grade <= 2.0) return "#22c55e"; // Green for best grades
  if (grade <= 3.0) return "#3b82f6"; // Blue
  if (grade <= 4.0) return "#eab308"; // Yellow
  if (grade <= 5.0) return "#f97316"; // Orange
  return "#ef4444"; // Red for worst grades
}

function getTrendColor(trend: string): string {
  if (trend === "improving") return "#22c55e"; // Green
  if (trend === "declining") return "#ef4444"; // Red
  return "#3b82f6"; // Blue for stable
}

function formatTrend(trend: string): string {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Declining";
  return "Stable";
}
