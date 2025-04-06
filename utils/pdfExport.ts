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
 * @param showDetailedGrades Whether to show detailed grades with dates
 * @returns ID of the created element
 */
export function createAnalyticsPrintableElement(
  data: {
    subjects: any[];
    overallAverage: number;
    totalGradesCount: number;
    recentTrend: string;
    predictions?: any[];
    subjectStrengths?: any;
  },
  showDetailedGrades: boolean = false
): string {
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
  container.style.width = "794px"; // Optimized for A4 width (210mm ≈ 794px at 96dpi)
  container.style.background = "white";
  container.style.color = "hsl(222.2, 84%, 4.9%)"; // shadcn foreground color
  container.style.padding = "0";
  container.style.fontFamily = "Inter, -apple-system, system-ui, sans-serif";

  const {
    subjects,
    overallAverage,
    totalGradesCount,
    recentTrend,
    predictions,
    subjectStrengths,
  } = data;

  // Modern design color palette based on the app theme with purple primary color
  const theme = {
    // Base colors
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(222.2, 84%, 4.9%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(222.2, 84%, 4.9%)",

    // Purple theme colors
    primary: "hsl(262, 83%, 58%)", // Deep purple
    primaryLight: "hsl(262, 83%, 96%)", // Light purple
    primaryGradient:
      "linear-gradient(135deg, hsl(262, 83%, 58%), hsl(250, 87%, 50%))", // Purple gradient
    primaryForeground: "hsl(210, 40%, 98%)",

    // UI colors
    secondary: "hsl(210, 40%, 96.1%)",
    secondaryForeground: "hsl(222.2, 47.4%, 11.2%)",
    muted: "hsl(210, 40%, 96.1%)",
    mutedForeground: "hsl(215.4, 16.3%, 46.9%)",
    accent: "hsl(262, 83%, 96%)", // Light purple accent
    accentForeground: "hsl(262, 83%, 40%)", // Dark purple accent foreground

    // Border and shadows
    border: "hsl(214.3, 31.8%, 91.4%)",
    shadow: "0 4px 12px rgba(93, 63, 211, 0.08)", // Purple-tinted shadow
    shadowSm: "0 2px 6px rgba(93, 63, 211, 0.05)",
    shadowLg: "0 10px 24px rgba(93, 63, 211, 0.1)",

    // Feedback colors
    success: "hsl(142.1, 76.2%, 36.3%)",
    successLight: "hsl(142.1, 76.2%, 96.3%)",
    warning: "hsl(47.9, 95.8%, 53.1%)",
    warningLight: "hsl(47.9, 95.8%, 96.1%)",
    error: "hsl(0, 84.2%, 60.2%)",
    errorLight: "hsl(0, 84.2%, 96.2%)",

    // Border radius
    radius: "0.5rem",
    radiusLg: "0.75rem",
    radiusXl: "0.85rem",

    // Print optimization
    printMargin: "0.75rem",
    pageBreakMargin: "2.5rem",
  };

  // Generate modern PDF content
  container.innerHTML = `
    <div style="font-family: 'Inter', -apple-system, system-ui, sans-serif; color: ${
      theme.foreground
    }; line-height: 1.5; letter-spacing: -0.01em; max-width: 794px; margin: 0 auto;">
      <!-- Modern header with gradient background -->
      <div style="background: ${
        theme.primaryGradient
      }; padding: 24px 20px; color: ${
    theme.primaryForeground
  }; position: relative; overflow: hidden; border-radius: ${theme.radiusLg} ${
    theme.radiusLg
  } 0 0;">
        <!-- Abstract pattern overlay -->
        <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+'); opacity: 0.2;"></div>
        
        <div style="position: relative; max-width: 754px; margin: 0 auto; z-index: 2;">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 10px;">
            <!-- Logo/icon with modern glow effect -->
            <div style="display: flex; justify-content: center; align-items: center; width: 44px; height: 44px; background: rgba(255, 255, 255, 0.2); border-radius: 10px; box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            
            <!-- Title with modern typography -->
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.03em;">Grades Analytics Report</h1>
              <p style="margin: 2px 0 0 0; font-size: 13px; opacity: 0.9; font-weight: 400;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main content with modern card design -->
      <div style="padding: 20px 16px; background-color: ${theme.background};">
        <div style="max-width: 762px; margin: 0 auto;">
          <!-- Section title with modern accent bar -->
          <div style="display: flex; align-items: center; margin-bottom: 18px; gap: 10px;">
            <div style="width: 4px; height: 20px; background: ${
              theme.primaryGradient
            }; border-radius: 2px;"></div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: ${
              theme.foreground
            };">
              Performance Overview
            </h2>
          </div>
          
          <!-- Modern stat cards with subtle shadows and refined design -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
            <!-- Overall average card with accent decoration -->
            <div style="background-color: ${theme.card}; border-radius: ${
    theme.radiusXl
  }; border: 1px solid ${
    theme.border
  }; padding: 16px; position: relative; overflow: hidden; box-shadow: ${
    theme.shadowSm
  };">
              <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${
                theme.primaryGradient
              };"></div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <p style="color: ${
                    theme.mutedForeground
                  }; margin: 0 0 6px 0; font-size: 13px; font-weight: 500;">Overall Average</p>
                  <div style="font-size: 26px; font-weight: 700; color: ${getGradeColor(
                    overallAverage
                  )};">${overallAverage.toFixed(2)}</div>
                  <p style="margin: 4px 0 0; font-size: 12px; color: ${
                    theme.mutedForeground
                  };">
                    ${getRatingText(overallAverage)}
                  </p>
                </div>
                <!-- Modern circular icon -->
                <div style="display: flex; justify-content: center; align-items: center; width: 40px; height: 40px; background: ${getGradeBgColor(
                  overallAverage
                )}; border-radius: 50%; padding: 10px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${getGradeColor(
                    overallAverage
                  )}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Recent trend card with accent decoration -->
            <div style="background-color: ${theme.card}; border-radius: ${
    theme.radiusXl
  }; border: 1px solid ${
    theme.border
  }; padding: 16px; position: relative; overflow: hidden; box-shadow: ${
    theme.shadowSm
  };">
              <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${getTrendColor(
                recentTrend
              )};"></div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <p style="color: ${
                    theme.mutedForeground
                  }; margin: 0 0 6px 0; font-size: 13px; font-weight: 500;">Recent Trend</p>
                  <div style="font-size: 20px; font-weight: 600; color: ${getTrendColor(
                    recentTrend
                  )}; display: flex; align-items: center; gap: 6px;">
                    ${getTrendIcon(recentTrend)}
                    ${formatTrend(recentTrend)}
                  </div>
                  <p style="margin: 4px 0 0; font-size: 12px; color: ${
                    theme.mutedForeground
                  };">
                    Based on your recent ${totalGradesCount} grades
                  </p>
                </div>
                <!-- Modern circular icon -->
                <div style="display: flex; justify-content: center; align-items: center; width: 40px; height: 40px; background-color: ${getTrendBgColor(
                  recentTrend
                )}; border-radius: 50%; padding: 10px;">
                  ${getTrendIconLarge(recentTrend)}
                </div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
            <!-- Subjects card -->
            <div style="background-color: ${theme.card}; border-radius: ${
    theme.radius
  }; border: 1px solid ${theme.border}; padding: 16px; box-shadow: ${
    theme.shadowSm
  };">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; background-color: ${
                  theme.primaryLight
                }; border-radius: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${
                    theme.primary
                  }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                  </svg>
                </div>
                <div>
                  <p style="color: ${
                    theme.mutedForeground
                  }; margin: 0 0 2px 0; font-size: 12px; font-weight: 500;">Total Subjects</p>
                  <div style="font-size: 20px; font-weight: 700; color: ${
                    theme.foreground
                  };">${subjects.length}</div>
                </div>
              </div>
            </div>
            
            <!-- Grades card -->
            <div style="background-color: ${theme.card}; border-radius: ${
    theme.radius
  }; border: 1px solid ${theme.border}; padding: 16px; box-shadow: ${
    theme.shadowSm
  };">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; background-color: ${
                  theme.primaryLight
                }; border-radius: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${
                    theme.primary
                  }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  </svg>
                </div>
                <div>
                  <p style="color: ${
                    theme.mutedForeground
                  }; margin: 0 0 2px 0; font-size: 12px; font-weight: 500;">Total Grades</p>
                  <div style="font-size: 20px; font-weight: 700; color: ${
                    theme.foreground
                  };">${totalGradesCount}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modern section divider with page break consideration -->
          <div style="width: 100%; height: 1px; background: linear-gradient(to right, ${
            theme.border
          }, ${theme.border} 50%, transparent); margin: 24px 0;"></div>
          
          <!-- Subject Performance section with elegant table -->
          <div style="margin-bottom: 28px;">
            <!-- Section title with modern accent bar -->
            <div style="display: flex; align-items: center; margin-bottom: 16px; gap: 10px; page-break-before: auto;">
              <div style="width: 4px; height: 20px; background: ${
                theme.primaryGradient
              }; border-radius: 2px;"></div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: ${
                theme.foreground
              };">
                Subject Analysis
              </h2>
            </div>
            
            <!-- Modern elegant table -->
            <div style="background-color: ${theme.card}; border-radius: ${
    theme.radiusLg
  }; overflow: hidden; box-shadow: ${theme.shadowSm};">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead style="background-color: ${theme.secondary};">
                  <tr>
                    <th style="padding: 12px 14px; font-weight: 600; color: ${
                      theme.mutedForeground
                    }; border-bottom: 1px solid ${theme.border};">Subject</th>
                    <th style="padding: 12px 14px; font-weight: 600; color: ${
                      theme.mutedForeground
                    }; border-bottom: 1px solid ${theme.border};">Average</th>
                    <th style="padding: 12px 14px; font-weight: 600; color: ${
                      theme.mutedForeground
                    }; border-bottom: 1px solid ${
    theme.border
  }; text-align: center;">Grades</th>
                    <th style="padding: 12px 14px; font-weight: 600; color: ${
                      theme.mutedForeground
                    }; border-bottom: 1px solid ${
    theme.border
  }; text-align: center;">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  ${subjects
                    .filter(
                      (subject) => subject.grades && subject.grades.length > 0
                    )
                    .map(
                      (subject, index) => `
                      <tr style="border-bottom: 1px solid ${theme.border}; ${
                        index % 2 !== 0
                          ? `background-color: ${theme.secondary};`
                          : ""
                      }">
                        <td style="padding: 10px 14px; font-weight: 500;">${
                          subject.name
                        }</td>
                        <td style="padding: 10px 14px;">
                          <div style="display: inline-flex; align-items: center; justify-content: center; font-weight: 600; color: ${getGradeColor(
                            subject.averageGrade
                          )}; padding: 2px 8px; background-color: ${getGradeBgColor(
                        subject.averageGrade
                      )}; border-radius: 999px; font-size: 13px;">
                            ${subject.averageGrade.toFixed(2)}
                          </div>
                        </td>
                        <td style="padding: 10px 14px; text-align: center; font-weight: 500;">${
                          subject.grades.length
                        }</td>
                        <td style="padding: 10px 14px; text-align: center;">
                          <div style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; background-color: ${getGradeColor(
                            subject.averageGrade
                          )};" title="${getRatingText(
                        subject.averageGrade
                      )}"></div>
                        </td>
                      </tr>
                    `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Performance Insights section with modern cards - with page break consideration -->
          ${
            subjectStrengths
              ? `
          <div style="margin-bottom: 28px; page-break-before: auto;">
            <!-- Section title with modern accent bar -->
            <div style="display: flex; align-items: center; margin-bottom: 16px; gap: 10px;">
              <div style="width: 4px; height: 20px; background: ${
                theme.primaryGradient
              }; border-radius: 2px;"></div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: ${
                theme.foreground
              };">
                Performance Insights
              </h2>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
              ${
                subjectStrengths.bestSubject
                  ? `
                <div style="background-color: ${theme.successLight}; border-radius: ${theme.radiusLg}; padding: 16px; position: relative; overflow: hidden; box-shadow: ${theme.shadowSm};">
                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${theme.success};"></div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="display: flex; justify-content: center; align-items: center; width: 28px; height: 28px; background-color: rgba(34, 197, 94, 0.2); border-radius: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(142.1, 76.2%, 36.3%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                        </svg>
                      </div>
                      <p style="color: ${theme.success}; margin: 0; font-size: 13px; font-weight: 600;">Best Subject</p>
                    </div>
                    <div style="font-size: 14px; font-weight: 600; margin-left: 34px;">${subjectStrengths.bestSubject}</div>
                  </div>
                </div>
              `
                  : ""
              }
              ${
                subjectStrengths.worstSubject
                  ? `
                <div style="background-color: ${theme.warningLight}; border-radius: ${theme.radiusLg}; padding: 16px; position: relative; overflow: hidden; box-shadow: ${theme.shadowSm};">
                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${theme.warning};"></div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="display: flex; justify-content: center; align-items: center; width: 28px; height: 28px; background-color: hsla(47.9, 95.8%, 53.1%, 0.2); border-radius: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(47.9, 95.8%, 53.1%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <p style="color: hsl(37.7, 92.1%, 50.2%); margin: 0; font-size: 13px; font-weight: 600;">Needs Improvement</p>
                    </div>
                    <div style="font-size: 14px; font-weight: 600; margin-left: 34px;">${subjectStrengths.worstSubject}</div>
                  </div>
                </div>
              `
                  : ""
              }
              ${
                subjectStrengths.mostImproved
                  ? `
                <div style="background-color: ${theme.primaryLight}; border-radius: ${theme.radiusLg}; padding: 16px; position: relative; overflow: hidden; box-shadow: ${theme.shadowSm};">
                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${theme.primary};"></div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="display: flex; justify-content: center; align-items: center; width: 28px; height: 28px; background-color: hsla(0, 0%, 9%, 0.2); border-radius: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${theme.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                      </div>
                      <p style="color: ${theme.primary}; margin: 0; font-size: 13px; font-weight: 600;">Most Improved</p>
                    </div>
                    <div style="font-size: 14px; font-weight: 600; margin-left: 34px;">${subjectStrengths.mostImproved}</div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
          `
              : ""
          }
          
          <!-- Prediction section with modern design - page break before to avoid splitting -->
          ${
            predictions && predictions.length > 0
              ? `
          <div style="margin-bottom: 28px; page-break-before: auto;">
            <!-- Section title with modern accent bar -->
            <div style="display: flex; align-items: center; margin-bottom: 16px; gap: 10px;">
              <div style="width: 4px; height: 20px; background: ${
                theme.primaryGradient
              }; border-radius: 2px;"></div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: ${
                theme.foreground
              };">
                Future Forecast
              </h2>
            </div>
            
            <div style="background-color: ${theme.card}; border-radius: ${
                  theme.radiusLg
                }; border: 1px solid ${
                  theme.border
                }; padding: 16px; box-shadow: ${theme.shadowSm};">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: center; align-items: center; min-width: 40px; height: 40px; background-color: ${
                  theme.primaryLight
                }; border-radius: 10px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${
                    theme.primary
                  }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <div>
                  <p style="margin: 0 0 0 0; font-size: 16px; font-weight: 600; color: ${
                    theme.foreground
                  };">
                    Predicted Performance Trajectory
                  </p>
                  <p style="margin: 0; color: ${
                    theme.mutedForeground
                  }; font-size: 12px;">
                    Based on your recent performance patterns
                  </p>
                </div>
              </div>
              
              <div style="background: linear-gradient(to right, ${
                theme.secondaryForeground
              }22, ${theme.primaryLight}, ${theme.secondaryForeground}22); 
                          border-radius: 8px; padding: 14px 16px; margin: 12px 0; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center;">                  
                  <div style="display: flex; justify-content: space-between; width: 100%; padding-top: 30px;">
                    <div style="text-align: center;">
                      <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Current</div>
                      <div style="font-size: 18px; font-weight: 700; color: ${getGradeColor(
                        predictions[0].value
                      )};">
                        ${predictions[0].value.toFixed(1)}
                      </div>
                    </div>
                    
                    <div style="text-align: center;">
                      <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Short-term</div>
                      <div style="font-size: 18px; font-weight: 700; color: ${getGradeColor(
                        predictions[1].value
                      )};">
                        ${predictions[1].value.toFixed(1)}
                      </div>
                    </div>
                    
                    <div style="text-align: center;">
                      <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Long-term</div>
                      <div style="font-size: 18px; font-weight: 700; color: ${getGradeColor(
                        predictions[2].value
                      )};">
                        ${predictions[2].value.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="background-color: ${
                theme.secondary
              }; border-radius: 10px; padding: 12px; margin-top: 12px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div style="display: flex; justify-content: center; align-items: center; width: 28px; height="28px; border-radius: 50%; background-color: ${
                    theme.primaryLight
                  };">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${
                      theme.primary
                    }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </div>
                  <div style="font-size: 13px; color: ${
                    theme.mutedForeground
                  };">
                    <span style="font-weight: 600; color: ${
                      theme.foreground
                    }">Recommendation:</span>
                    ${getTrendAdvice(
                      predictions[0].value,
                      predictions[2].value
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          `
              : ""
          }

          ${
            showDetailedGrades
              ? `
          <!-- Detailed Grades Section with dates - With forced page break -->
          <div style="margin-bottom: 28px; page-break-before: always;">
            <!-- Section title with modern accent bar -->
            <div style="display: flex; align-items: center; margin-bottom: 16px; gap: 10px;">
              <div style="width: 4px; height: 20px; background: ${
                theme.primaryGradient
              }; border-radius: 2px;"></div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: ${
                theme.foreground
              };">
                All Grades
              </h2>
            </div>
            
            ${subjects
              .filter((subject) => subject.grades && subject.grades.length > 0)
              .map(
                (subject, subjectIndex) => `
                <div style="margin-bottom: ${
                  subjectIndex < subjects.length - 1 ? "20px" : "0"
                }; ${
                  subjectIndex > 0 && subjectIndex % 2 === 0
                    ? "page-break-before: always;"
                    : ""
                }">
                  <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 600; padding-bottom: 6px; border-bottom: 1px solid ${
                    theme.border
                  };">
                    ${subject.name} 
                    <span style="display: inline-block; margin-left: 6px; font-size: 13px; padding: 1px 6px; background-color: ${getGradeBgColor(
                      subject.averageGrade
                    )}; color: ${getGradeColor(
                  subject.averageGrade
                )}; border-radius: 999px;">
                      Avg: ${subject.averageGrade.toFixed(2)}
                    </span>
                  </h3>
                  
                  <div style="background-color: ${theme.card}; border-radius: ${
                  theme.radius
                }; border: 1px solid ${
                  theme.border
                }; overflow: hidden; box-shadow: ${theme.shadowSm};">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                      <thead style="background-color: ${theme.secondary};">
                        <tr>
                          <th style="padding: 8px 12px; text-align: left; color: ${
                            theme.mutedForeground
                          }; font-weight: 500; border-bottom: 1px solid ${
                  theme.border
                };">Date</th>
                          <th style="padding: 8px 12px; text-align: left; color: ${
                            theme.mutedForeground
                          }; font-weight: 500; border-bottom: 1px solid ${
                  theme.border
                };">Type</th>
                          <th style="padding: 8px 12px; text-align: center; color: ${
                            theme.mutedForeground
                          }; font-weight: 500; border-bottom: 1px solid ${
                  theme.border
                };">Grade</th>
                          <th style="padding: 8px 12px; text-align: center; color: ${
                            theme.mutedForeground
                          }; font-weight: 500; border-bottom: 1px solid ${
                  theme.border
                };">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${subject.grades
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          ) // Sort by date, newest first
                          .map(
                            (grade, index) => `
                            <tr style="${
                              index % 2 !== 0
                                ? `background-color: ${theme.secondary};`
                                : ""
                            }">
                              <td style="padding: 6px 12px; border-bottom: ${
                                index === subject.grades.length - 1
                                  ? "0"
                                  : `1px solid ${theme.border}`
                              };">
                                ${formatDate(grade.date)}
                              </td>
                              <td style="padding: 6px 12px; border-bottom: ${
                                index === subject.grades.length - 1
                                  ? "0"
                                  : `1px solid ${theme.border}`
                              };">
                                ${grade.type}
                              </td>
                              <td style="padding: 6px 12px; text-align: center; font-weight: 600; color: ${getGradeColor(
                                grade.value
                              )}; border-bottom: ${
                              index === subject.grades.length - 1
                                ? "0"
                                : `1px solid ${theme.border}`
                            };">
                                ${grade.value.toFixed(1)}
                              </td>
                              <td style="padding: 6px 12px; text-align: center; border-bottom: ${
                                index === subject.grades.length - 1
                                  ? "0"
                                  : `1px solid ${theme.border}`
                              };">
                                ${grade.weight || 1.0}x
                              </td>
                            </tr>
                          `
                          )
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
      </div>
      
      <!-- Modern footer with subtle gradient -->
      <div style="padding: 16px 20px; background: linear-gradient(to right, ${
        theme.secondary
      }, ${theme.accent}); text-align: center; border-radius: 0 0 ${
    theme.radiusLg
  } ${theme.radiusLg}; border-top: 1px solid ${theme.border};">
        <div style="max-width: 754px; margin: 0 auto; display: flex; justify-content: center; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${
            theme.primary
          }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <p style="margin: 0; font-size: 12px; color: ${
            theme.mutedForeground
          };">
            Generated by <span style="font-weight: 600; color: ${
              theme.primary
            }">Grades Tracker</span> • ${new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(container);
  return elementId;
}

// Helper function to format dates for detailed grades
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

// Helper functions with modern updates - now using the app's color scheme
function getGradeColor(grade: number): string {
  if (grade <= 1.5) return "hsl(142.1, 76.2%, 36.3%)"; // Green for best grades
  if (grade <= 2.5) return "hsl(262, 83%, 58%)"; // Purple for good grades
  if (grade <= 3.5) return "hsl(47.9, 95.8%, 53.1%)"; // Yellow
  if (grade <= 4.5) return "hsl(24.6, 95%, 53.1%)"; // Orange
  return "hsl(0, 84.2%, 60.2%)"; // Red for worst grades
}

function getGradeBgColor(grade: number): string {
  if (grade <= 1.5) return "hsla(142.1, 76.2%, 36.3%, 0.1)"; // Light green
  if (grade <= 2.5) return "hsla(262, 83%, 58%, 0.1)"; // Light purple
  if (grade <= 3.5) return "hsla(47.9, 95.8%, 53.1%, 0.1)"; // Light yellow
  if (grade <= 4.5) return "hsla(24.6, 95%, 53.1%, 0.1)"; // Light orange
  return "hsla(0, 84.2%, 60.2%, 0.1)"; // Light red
}

function getTrendColor(trend: string): string {
  if (trend === "improving") return "hsl(142.1, 76.2%, 36.3%)"; // Green
  if (trend === "declining") return "hsl(0, 84.2%, 60.2%)"; // Red
  return "hsl(262, 83%, 58%)"; // Purple for stable
}

function getTrendBgColor(trend: string): string {
  if (trend === "improving") return "hsla(142.1, 76.2%, 36.3%, 0.1)"; // Light green
  if (trend === "declining") return "hsla(0, 84.2%, 60.2%, 0.1)"; // Light red
  return "hsla(262, 83%, 58%, 0.1)"; // Light purple
}

function formatTrend(trend: string): string {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Declining";
  return "Stable";
}

function getTrendIcon(trend: string): string {
  if (trend === "improving") {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>`;
  }
  if (trend === "declining") {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
      <polyline points="17 18 23 18 23 12"></polyline>
    </svg>`;
  }
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="12" x2="2" y2="12"></line>
    <polyline points="5.45 5.11 2 12 5.45 18.89"></polyline>
    <polyline points="18.55 5.11 22 12 18.55 18.89"></polyline>
  </svg>`;
}

function getTrendIconLarge(trend: string): string {
  if (trend === "improving") {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>`;
  }
  if (trend === "declining") {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
      <polyline points="17 18 23 18 23 12"></polyline>
    </svg>`;
  }
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="12" x2="2" y2="12"></line>
    <polyline points="5.45 5.11 2 12 5.45 18.89"></polyline>
    <polyline points="18.55 5.11 22 12 18.55 18.89"></polyline>
  </svg>`;
}

function getTrendAdvice(currentGrade: number, predictedGrade: number): string {
  // Lower grade values are better in German grading system
  if (predictedGrade < currentGrade) {
    return "Your performance is on an upward trajectory. Continue with your current study habits for consistent improvement.";
  } else if (predictedGrade > currentGrade) {
    return "Consider reviewing your study strategies and increasing practice time to improve your future grades.";
  } else {
    return "Your performance is stable. Focus on maintaining consistency while looking for areas to improve.";
  }
}

// New function to provide grade rating text
function getRatingText(grade: number): string {
  if (grade <= 1.5) return "Excellent (Very Good)";
  if (grade <= 2.5) return "Good";
  if (grade <= 3.5) return "Satisfactory";
  if (grade <= 4.5) return "Sufficient";
  return "Needs Improvement";
}
