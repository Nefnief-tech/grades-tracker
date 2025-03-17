import { encrypt, decrypt } from "@/utils/encryption";

// Assuming you have types defined somewhere
import type { Grade, Subject } from "@/types";

/**
 * Base API request function with encryption/decryption
 */
async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  data?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    // Encrypt data before sending to server
    options.body = JSON.stringify({
      encryptedData: encrypt(data),
    });
  }

  const response = await fetch(`/api/${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const result = await response.json();

  // If response contains encrypted data, decrypt it
  if (result.encryptedData) {
    return decrypt(result.encryptedData);
  }

  return result;
}

/**
 * API functions for grades
 */
export const gradesApi = {
  getAll: () => apiRequest<Grade[]>("grades"),
  getById: (id: string) => apiRequest<Grade>(`grades/${id}`),
  create: (grade: Omit<Grade, "id">) =>
    apiRequest<Grade>("grades", "POST", grade),
  update: (id: string, grade: Grade) =>
    apiRequest<Grade>(`grades/${id}`, "PUT", grade),
  delete: (id: string) => apiRequest<void>(`grades/${id}`, "DELETE"),
};

/**
 * API functions for subjects
 */
export const subjectsApi = {
  getAll: () => apiRequest<Subject[]>("subjects"),
  getById: (id: string) => apiRequest<Subject>(`subjects/${id}`),
  create: (subject: Omit<Subject, "id">) =>
    apiRequest<Subject>("subjects", "POST", subject),
  update: (id: string, subject: Subject) =>
    apiRequest<Subject>(`subjects/${id}`, "PUT", subject),
  delete: (id: string) => apiRequest<void>(`subjects/${id}`, "DELETE"),
};
