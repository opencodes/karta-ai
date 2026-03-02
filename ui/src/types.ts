export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  lastContact: string;
}

export interface Event {
  id: string;
  title: string;
  time: string;
  location: string;
}
