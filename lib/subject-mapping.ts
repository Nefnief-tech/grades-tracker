/**
 * Provides mapping from subject short codes to full names
 * This helps translate abbreviated subject names in the timetable
 */

// Map of subject codes to full names
export const subjectCodeToName: Record<string, string> = {
  // Common subject codes
  'M': 'Mathematics',
  'D': 'German',
  'E': 'English',
  'F': 'French',
  'L': 'Latin',
  'Sp': 'Spanish',
  'Ph': 'Physics',
  'C': 'Chemistry',
  'B': 'Biology',
  'G': 'History',
  'Geo': 'Geography',
  'Inf': 'Computer Science',
  'Mu': 'Music',
  'Ku': 'Art',
  'Eth': 'Ethics',
  'WR': 'Religious Education',
  'PuG': 'Politics and Society',
  'Sm': 'Sports (Male)',
  'Sw': 'Sports (Female)',
  'K': 'Catholic Religious Education',
  'Ev': 'Protestant Religious Education',
  
  // Combined subjects or special codes
  'PhÜ': 'Physics Lab',
  'CÜ': 'Chemistry Lab',
};

/**
 * Expands a subject code to its full name
 * For combined subjects like "Ph/C", it will expand all parts
 */
export function getFullSubjectName(code: string): string {
  if (!code) return 'Unknown Subject';
  
  // Check if it's a simple direct mapping
  if (subjectCodeToName[code]) {
    return subjectCodeToName[code];
  }
  
  // Check if it's a room number (typically 3 digits)
  if (/^\d{3}$/.test(code)) {
    return `Room ${code}`;
  }
  
  // Handle combined subjects like "Ph(NTG)/Sp(SG)"
  if (code.includes('/')) {
    const parts = code.split('/');
    const expandedParts = parts.map(part => {
      // Extract the base code without any parenthetical qualifiers
      const baseCode = part.split('(')[0].trim();
      const qualifier = part.match(/\((.*?)\)/)?.[1] || '';
      
      const fullName = subjectCodeToName[baseCode] || baseCode;
      return qualifier ? `${fullName} (${qualifier})` : fullName;
    });
    
    return expandedParts.join(' / ');
  }
  
  // Handle subject with room code like "M312"
  const subjectRoomMatch = code.match(/^([A-Za-z]+)(\d+)$/);
  if (subjectRoomMatch) {
    const [_, subjectCode, roomNumber] = subjectRoomMatch;
    const fullSubject = subjectCodeToName[subjectCode] || subjectCode;
    return `${fullSubject} (Room ${roomNumber})`;
  }
  
  // Handle subject with qualifier like "Ph(NTG)"
  const qualifierMatch = code.match(/^([A-Za-z]+)\((.+)\)$/);
  if (qualifierMatch) {
    const [_, subjectCode, qualifier] = qualifierMatch;
    const fullSubject = subjectCodeToName[subjectCode] || subjectCode;
    return `${fullSubject} (${qualifier})`;
  }
  
  // Return the original if no mapping found
  return code;
}

export default {
  subjectCodeToName,
  getFullSubjectName
};