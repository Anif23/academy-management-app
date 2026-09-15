export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  role?: string;
  content: string;
  photo?: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}
