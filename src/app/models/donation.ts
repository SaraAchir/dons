export interface Donation {
    id?: number;
    amount: number;
    donorName: string;
    email: string;
    date: Date;
    category: string;
    description?: string;
    status: 'pending' | 'completed' | 'cancelled';
  }