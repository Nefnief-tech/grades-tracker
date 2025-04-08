export interface KanbanBoard {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: string;
  color?: string; // Added color property for column styling
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  subjectId?: string;
  labels?: string[];
  completed?: boolean; // Added completed property for task tracking
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CardWithColumn = KanbanCard & { columnId: string };
