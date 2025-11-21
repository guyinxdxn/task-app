export enum Priority {
  low = 'low',
  medium = 'medium',
  high = 'high',
  urgent = 'urgent',
}

export enum Status {
  todo = 'todo',
  in_progress = 'in_progress',
  done = 'done',
  blocked = 'blocked',
  canceled = 'canceled',
}

export enum RepeatType {
  none = 'none',
  daily = 'daily',
  weekly = 'weekly',
  every_n_days = 'every_n_days',
}

export interface Task {
  id: string;
  title: string;
  content: string;
  goal?: string;
  completed: boolean;
  priority: Priority;
  estimate?: number;
  dueDate?: string;
  status: Status;
  repeatType: RepeatType;
  repeatInterval?: number;
  createdAt: string;
  updatedAt: string;
  totalTimeSpent: number; // 累计计时字段，单位：秒
}
