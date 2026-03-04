export type TaskCategory = 'Finance' | 'Personal' | 'Work' | 'Contact' | 'General';

export type TaskRecord = {
  id: string;
  raw_input: string;
  title: string;
  category: TaskCategory;
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
  dueDate: string;
  featured: boolean;
  status: 'pending' | 'done';
  createdAt: string;
  updatedAt: string;
};

export type UserRole = 'admin' | 'member';

export type UserRecord = {
  id: string;
  email: string;
  role: UserRole;
  password_hash: string;
  is_active: 0 | 1;
  created_at: Date;
  updated_at: Date;
};

export type UserDto = {
  id: string;
  email: string;
  role: UserRole;
};
