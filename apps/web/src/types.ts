export type TaskCategory = 'Finance' | 'Personal' | 'Work' | 'Contact' | 'General';

export type TaskItem = {
  id: string;
  rawInput: string;
  title: string;
  category: TaskCategory;
  dueDate: string;
  status: 'pending' | 'done';
  featured: boolean;
};
