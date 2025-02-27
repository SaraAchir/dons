export interface Donor {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    totalDonated: number;
    lastDonationDate: Date;
    donationType: 'one-time' | 'regular';
  }