export interface Course {
  id: string;
  name: string;
  duration: string;
  fee: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  batchId: string;
  course: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  classTiming: string;
  days: string[];
  trainerId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademyInfo {
  logoUrl: string;
  email: string;
  name: string;
  description: string;
  mission: string;
  vision: string;
  whatsapp: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  address: string;
  city: string;
  state: string;
  phone: number;
  workingHours: string;
}

export interface RegistrationRequest {
  name: string;
  mobile: string;
  email: string;
  courseInterestedId: string;
  qualification?: string;
  location?: string;
  remarks?: string;
}
