# Export Utilities

**File:** `utils/exportUtils.ts`

Functions for exporting grade data as CSV files or PDF reports.

---

## `exportToCSV`

```typescript
function exportToCSV(
  data: Record<string, any>[],
  headers: Record<string, string>,
  filename: string
): void
```

Creates and immediately triggers a browser download of a CSV file.

| Parameter | Type | Description |
|---|---|---|
| `data` | `Record<string, any>[]` | Array of row objects to serialise |
| `headers` | `Record<string, string>` | Maps object keys → CSV column display names |
| `filename` | `string` | Filename for the downloaded file (without extension) |

**Example:**

```typescript
import { exportToCSV } from "@/utils/exportUtils";

exportToCSV(
  [
    { subject: "Mathematics", grade: 1.5, date: "2024-01-15" },
    { subject: "Physics",     grade: 2.0, date: "2024-01-20" },
  ],
  { subject: "Subject", grade: "Grade", date: "Date" },
  "my-grades"
);
// Downloads "my-grades.csv"
```

**Notes:**
- String values are automatically double-quoted and internal quotes are escaped.
- `null` and `undefined` values become empty cells.
- Numbers and booleans are written without quotes.

---

## `exportToPDF`

```typescript
function exportToPDF(
  subjects: Subject[],
  filename?: string
): void
```

Generates a PDF summary of all subjects and their grades using `jsPDF` and triggers a browser download.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subjects` | `Subject[]` | — | Array of subjects to include |
| `filename` | `string` | `"grades-report"` | Optional filename (without `.pdf` extension) |

**Example:**

```typescript
import { exportToPDF } from "@/utils/exportUtils";

exportToPDF(subjects, "semester-1-report");
// Downloads "semester-1-report.pdf"
```

---

## `exportToImage`

```typescript
async function exportToImage(
  elementId: string,
  filename?: string
): Promise<void>
```

Captures a DOM element as a PNG image using `html2canvas` and triggers a download.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `elementId` | `string` | — | `id` attribute of the element to capture |
| `filename` | `string` | `"chart-export"` | Download filename (without `.png` extension) |
