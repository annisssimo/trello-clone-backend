export interface Board {
  id: number;
  title: string;
  lists?: List[];
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  listId: number;
  taskOrder: number;
}

export interface List {
  id: number;
  title: string;
  boardId: number;
  listOrder: number;
  tasks?: Task[];
}
