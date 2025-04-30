// Appwrite database ID
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

// Collection IDs
export const COLLECTIONS = {
  USERS: "users",
  GRADES: "grades",
  SUBJECTS: "subjects",
  SETTINGS: "settings",
  TWO_FACTOR_CODES: "two_factor_codes",
  // Add more collections here as needed
};