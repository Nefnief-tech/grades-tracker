# API Reference — Overview

This section documents the public modules, utilities, hooks, and API routes available in Grade Tracker.

---

## Module Index

| Module | Location | Description |
|---|---|---|
| [Core Types](types.md) | `types/grades.ts` | TypeScript interfaces for Grade, Subject, etc. |
| [Storage Utils](storage.md) | `utils/storageUtils.ts` | LocalStorage CRUD + cloud sync helpers |
| [Encryption](encryption.md) | `utils/encryption.ts` | AES-256-CBC encrypt / decrypt |
| [Export Utils](export.md) | `utils/exportUtils.ts` | CSV and PDF export functions |
| [Appwrite Client](appwrite.md) | `lib/appwrite.ts` | Appwrite CRUD wrappers |
| [Hooks](hooks.md) | `hooks/` | Custom React hooks |
| [API Routes](routes.md) | `app/api/` | Next.js server-side API endpoints |

---

## Quick Reference

### Core Types

```typescript
// A single grade entry
interface Grade {
  id: string;
  value: number;       // 1–6 (Swiss/German scale)
  type: GradeType;     // "Test" | "Oral Exam" | "Homework" | "Project"
  date: string;        // ISO 8601
  weight: number;      // 1.0 or 2.0
}

// An academic subject
interface Subject {
  id: string;
  name: string;
  grades: Grade[];
  averageGrade: number;
}
```

### Most-used Utilities

```typescript
// Save subjects to storage (local + optional cloud)
await saveSubjectsToStorage(subjects: Subject[]): Promise<void>

// Load subjects from storage
await getSubjectsFromStorage(): Promise<Subject[]>

// Encrypt any value
encrypt(data: any): string

// Decrypt a previously encrypted string
decrypt(encryptedData: string): any

// Export subjects as CSV
exportToCSV(data, headers, filename): void
```
