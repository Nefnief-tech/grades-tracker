export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  userId?: string;
  folder?: string;
  isArchived: boolean;
  isFavorite: boolean;
}

export interface NoteFolder {
  id: string;
  name: string;
  createdAt: string;
  userId?: string;
  parentId?: string;
}

export interface NoteStats {
  totalNotes: number;
  totalFolders: number;
  favoriteNotes: number;
  archivedNotes: number;
  recentNotes: Note[];
}