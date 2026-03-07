export type TaskCategory = 'Finance' | 'Personal' | 'Work' | 'Contact' | 'General';

export type TaskRecord = {
  id: string;
  raw_input: string;
  title: string;
  category: TaskCategory;
  tags: string[] | string;
  task_time: string;
  task_date: Date | string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  due_date: Date;
  featured: 0 | 1;
  status: 'pending' | 'done';
  created_at: Date;
  updated_at: Date;
};

export type TaskDto = {
  id: string;
  rawInput: string;
  title: string;
  category: TaskCategory;
  tags: string[];
  time: string;
  date: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDate: string;
  featured: boolean;
  status: 'pending' | 'done';
  createdAt: string;
  updatedAt: string;
};

export type UserRole = 'root' | 'superadmin' | 'admin' | 'member';
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export type UserRecord = {
  id: string;
  email: string;
  role: UserRole;
  is_root: 0 | 1;
  organization_id: string | null;
  status: 'active' | 'invited' | 'disabled' | null;
  password_hash: string;
  is_active: 0 | 1;
  created_at: Date;
  updated_at: Date;
};

export type UserDto = {
  id: string;
  email: string;
  role: UserRole;
  isRoot: boolean;
  subscription: SubscriptionTier;
};
