# Appwrite Client

**File:** `lib/appwrite.ts`

Wraps the Appwrite SDK to provide typed CRUD operations for the Grade Tracker data model. All cloud operations pass through this module.

---

## Constants

```typescript
const ENABLE_CLOUD_FEATURES: boolean  // from NEXT_PUBLIC_ENABLE_CLOUD_FEATURES
const ENABLE_ENCRYPTION: boolean      // from NEXT_PUBLIC_ENABLE_ENCRYPTION
```

---

## Client Initialisation

```typescript
function getAppwriteClient(): { client: Client; databases: Databases }
```

Returns a singleton Appwrite `Client` and `Databases` instance configured from environment variables. Safe to call multiple times.

---

## Subject Operations

### `getSubjectsFromCloud`

```typescript
async function getSubjectsFromCloud(userId: string): Promise<Subject[]>
```

Fetches all subjects belonging to a user from the Appwrite database.

| Parameter | Type | Description |
|---|---|---|
| `userId` | `string` | The authenticated user's ID |

**Returns:** Array of `Subject` objects with their nested grades.

---

### `syncSubjectsToCloud`

```typescript
async function syncSubjectsToCloud(
  subjects: Subject[],
  userId: string
): Promise<void>
```

Upserts the full subjects array to Appwrite. Existing documents are updated; new ones are created.

| Parameter | Type | Description |
|---|---|---|
| `subjects` | `Subject[]` | Subjects to sync |
| `userId` | `string` | Owner user ID |

---

### `deleteSubjectFromCloud`

```typescript
async function deleteSubjectFromCloud(
  subjectId: string
): Promise<void>
```

Deletes a subject and all its associated grades from the cloud database.

---

## Grade Operations

### `deleteGradeFromCloud`

```typescript
async function deleteGradeFromCloud(
  gradeId: string,
  subjectId: string
): Promise<void>
```

Removes a single grade entry from the cloud database.

---

## Authentication

Authentication is handled by the Appwrite `Account` API. The `AuthContext` (`contexts/AuthContext.tsx`) exposes the following via React Context:

| Value | Type | Description |
|---|---|---|
| `user` | `Models.User \| null` | Currently authenticated user |
| `isLoading` | `boolean` | True while checking session |
| `login(email, password)` | `Function` | Creates a session |
| `logout()` | `Function` | Deletes the current session |
| `register(email, password, name)` | `Function` | Creates a new account |

**Usage:**

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, login, logout } = useAuth();

  if (!user) return <LoginPrompt />;
  return <Dashboard user={user} />;
}
```
