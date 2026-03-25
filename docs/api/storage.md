# Storage Utilities

**File:** `utils/storageUtils.ts`

Provides all LocalStorage CRUD operations and optional cloud synchronisation helpers. All functions are async to allow transparent switching between local and cloud storage.

---

## Constants

```typescript
const STORAGE_KEY = "gradeCalculator";    // LocalStorage key
const CACHE_TTL   = 30_000;              // Memory-cache TTL (30 s)
const CLOUD_FETCH_THROTTLE = 300_000;    // Min time between cloud fetches (5 min)
```

---

## `notifySubjectsUpdated`

```typescript
function notifySubjectsUpdated(eventId?: string): void
```

Dispatches a `subjectsUpdated` DOM event so all mounted components can react to storage changes without prop-drilling.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `eventId` | `string` | — | Optional ID included in the event detail for deduplication |

**Example:**

```typescript
import { notifySubjectsUpdated } from "@/utils/storageUtils";

// After saving, notify all listeners
notifySubjectsUpdated("save-12345");
```

---

## `getSubjectsFromStorage`

```typescript
async function getSubjectsFromStorage(): Promise<Subject[]>
```

Returns all subjects for the current user, transparently reading from the memory cache, LocalStorage, or Appwrite cloud (in that priority order).

**Returns:** Array of `Subject` objects, or `[]` if none are found.

**Example:**

```typescript
import { getSubjectsFromStorage } from "@/utils/storageUtils";

const subjects = await getSubjectsFromStorage();
console.log(subjects.length); // e.g., 5
```

---

## `saveSubjectsToStorage`

```typescript
async function saveSubjectsToStorage(subjects: Subject[]): Promise<void>
```

Persists an array of subjects to LocalStorage and, if the user is authenticated and cloud features are enabled, syncs to Appwrite.

| Parameter | Type | Description |
|---|---|---|
| `subjects` | `Subject[]` | Full array of subjects to persist |

!!! warning
    This function overwrites the entire subjects list. Pass the complete array, not a partial update.

**Example:**

```typescript
import { saveSubjectsToStorage } from "@/utils/storageUtils";

await saveSubjectsToStorage(updatedSubjects);
```

---

## `clearCacheForRefresh`

```typescript
function clearCacheForRefresh(): void
```

Clears the in-memory cache, forcing the next `getSubjectsFromStorage` call to read from LocalStorage or cloud.

---

## Cache Behaviour

Grade Tracker uses a two-level cache:

1. **Memory cache** (`Map<string, { data, timestamp }>`): Fastest; expires after `CACHE_TTL` (30 s).
2. **LocalStorage**: Persistent across page reloads; encrypted when cloud features are enabled.

Cloud fetches are throttled to at most once every 5 minutes per session to avoid API rate limits.
