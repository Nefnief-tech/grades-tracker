/**
 * Format a time value for display with minutes in 12-hour format
 */
export const formatTimeDisplay = (time: string | number): string => {
  // Handle string format with minutes (e.g., "09:30")
  if (typeof time === "string" && time.includes(":")) {
    const [hours, minutes] = time.split(":").map(Number);
    const h = hours % 12 || 12;
    const ampm = hours < 12 ? "AM" : "PM";
    return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  // Handle numeric format (e.g., 9)
  const hour = typeof time === "string" ? parseInt(time) : time;
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
};

/**
 * Get contrasting text color for a background color
 */
export const getContrastColor = (hexColor?: string): string => {
  // Default to white if no color
  if (!hexColor) return "#ffffff";

  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
};
