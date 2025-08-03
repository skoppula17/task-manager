export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate?: Date;
  tags: string[];
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: TaskAttachment[];
  pomodoroSessions: number;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface TaskPage {
  id: string;
  title: string;
  icon?: string;
  parentId?: string;
  tasks: Task[];
  subpages: TaskPage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  duration: number; // in minutes
  startedAt: Date;
  completedAt?: Date;
  type: 'work' | 'shortBreak' | 'longBreak';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline' | 'info';
  taskId?: string;
  read: boolean;
  createdAt: Date;
}