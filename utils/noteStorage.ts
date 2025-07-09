import type { Note, NoteFolder, NoteStats } from "../types/note";
import { v4 as uuidv4 } from 'uuid';

// Constants
const NOTES_STORAGE_KEY = "notes_storage";
const FOLDERS_STORAGE_KEY = "folders_storage";
const CACHE_TTL = 30000; // 30 seconds cache lifetime

// Memory cache to prevent redundant storage operations
const memoryCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Logs storage operations for debugging
 */
function logStorage(operation: string, data?: any): void {
  console.log(`📝 Notes Storage ${operation}`, data ? data : "");
}

/**
 * Cache utilities
 */
function setInCache<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function getFromCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

/**
 * Validates and cleans note data
 */
function validateNotes(notes: any[]): Note[] {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes.filter((note) => {
    return (
      note &&
      typeof note === "object" &&
      note.id &&
      note.title &&
      note.content !== undefined &&
      note.createdAt &&
      note.updatedAt
    );
  }).map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    tags: Array.isArray(note.tags) ? note.tags : [],
    userId: note.userId,
    folder: note.folder,
    isArchived: Boolean(note.isArchived),
    isFavorite: Boolean(note.isFavorite),
  }));
}

/**
 * Validates and cleans folder data
 */
function validateFolders(folders: any[]): NoteFolder[] {
  if (!Array.isArray(folders)) {
    return [];
  }

  return folders.filter((folder) => {
    return (
      folder &&
      typeof folder === "object" &&
      folder.id &&
      folder.name &&
      folder.createdAt
    );
  }).map((folder) => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt,
    userId: folder.userId,
    parentId: folder.parentId,
  }));
}

/**
 * Retrieves notes from localStorage
 */
export async function getNotesFromStorage(): Promise<Note[]> {
  const cacheKey = "notes-list";

  // Try memory cache first
  const cachedNotes = getFromCache<Note[]>(cacheKey);
  if (cachedNotes) {
    logStorage("using cached notes", { count: cachedNotes.length });
    return cachedNotes;
  }

  // Try localStorage
  try {
    const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
    if (notesJson) {
      const notes = JSON.parse(notesJson);
      const validatedNotes = validateNotes(notes);
      
      // Store in cache
      setInCache(cacheKey, validatedNotes);
      
      logStorage("using local notes", { count: validatedNotes.length });
      return validatedNotes;
    }
  } catch (e) {
    console.error("Error reading notes from localStorage:", e);
  }

  // Return empty array if no notes found
  logStorage("no notes found, returning empty array");
  return [];
}

/**
 * Saves notes to localStorage
 */
export async function saveNotesToStorage(notes: Note[]): Promise<boolean> {
  try {
    logStorage("saving", { noteCount: notes.length });
    const notesJson = JSON.stringify(notes);
    localStorage.setItem(NOTES_STORAGE_KEY, notesJson);

    // Update memory cache
    const cacheKey = "notes-list";
    setInCache(cacheKey, notes);

    logStorage("saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving notes:", error);
    return false;
  }
}

/**
 * Retrieves folders from localStorage
 */
export async function getFoldersFromStorage(): Promise<NoteFolder[]> {
  const cacheKey = "folders-list";

  // Try memory cache first
  const cachedFolders = getFromCache<NoteFolder[]>(cacheKey);
  if (cachedFolders) {
    logStorage("using cached folders", { count: cachedFolders.length });
    return cachedFolders;
  }

  // Try localStorage
  try {
    const foldersJson = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (foldersJson) {
      const folders = JSON.parse(foldersJson);
      const validatedFolders = validateFolders(folders);
      
      // Store in cache
      setInCache(cacheKey, validatedFolders);
      
      logStorage("using local folders", { count: validatedFolders.length });
      return validatedFolders;
    }
  } catch (e) {
    console.error("Error reading folders from localStorage:", e);
  }

  // Return empty array if no folders found
  return [];
}

/**
 * Saves folders to localStorage
 */
export async function saveFoldersToStorage(folders: NoteFolder[]): Promise<boolean> {
  try {
    logStorage("saving folders", { folderCount: folders.length });
    const foldersJson = JSON.stringify(folders);
    localStorage.setItem(FOLDERS_STORAGE_KEY, foldersJson);

    // Update memory cache
    const cacheKey = "folders-list";
    setInCache(cacheKey, folders);

    return true;
  } catch (error) {
    console.error("Error saving folders:", error);
    return false;
  }
}

/**
 * Creates a new note
 */
export async function createNote(title: string, content: string = "", folder?: string): Promise<Note> {
  const newNote: Note = {
    id: uuidv4(),
    title: title.trim(),
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    folder,
    isArchived: false,
    isFavorite: false,
  };

  const existingNotes = await getNotesFromStorage();
  const updatedNotes = [...existingNotes, newNote];
  
  await saveNotesToStorage(updatedNotes);
  logStorage("note created", { id: newNote.id, title: newNote.title });
  
  return newNote;
}

/**
 * Updates an existing note
 */
export async function updateNote(noteId: string, updates: Partial<Note>): Promise<boolean> {
  const notes = await getNotesFromStorage();
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) {
    console.error("Note not found for update:", noteId);
    return false;
  }

  // Update the note with new data and timestamp
  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const success = await saveNotesToStorage(notes);
  if (success) {
    logStorage("note updated", { id: noteId });
  }
  
  return success;
}

/**
 * Deletes a note
 */
export async function deleteNote(noteId: string): Promise<boolean> {
  const notes = await getNotesFromStorage();
  const filteredNotes = notes.filter(note => note.id !== noteId);
  
  if (filteredNotes.length === notes.length) {
    console.error("Note not found for deletion:", noteId);
    return false;
  }

  const success = await saveNotesToStorage(filteredNotes);
  if (success) {
    logStorage("note deleted", { id: noteId });
  }
  
  return success;
}

/**
 * Creates a new folder
 */
export async function createFolder(name: string, parentId?: string): Promise<NoteFolder> {
  const newFolder: NoteFolder = {
    id: uuidv4(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    parentId,
  };

  const existingFolders = await getFoldersFromStorage();
  const updatedFolders = [...existingFolders, newFolder];
  
  await saveFoldersToStorage(updatedFolders);
  logStorage("folder created", { id: newFolder.id, name: newFolder.name });
  
  return newFolder;
}

/**
 * Gets notes statistics
 */
export async function getNotesStats(): Promise<NoteStats> {
  const notes = await getNotesFromStorage();
  const folders = await getFoldersFromStorage();
  
  const recentNotes = notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return {
    totalNotes: notes.length,
    totalFolders: folders.length,
    favoriteNotes: notes.filter(note => note.isFavorite).length,
    archivedNotes: notes.filter(note => note.isArchived).length,
    recentNotes,
  };
}