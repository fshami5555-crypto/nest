
export type MaritalStatus = 'single' | 'married';
export type MotherhoodStatus = 'pregnant' | 'not_pregnant' | 'mother' | 'none';

export interface UserProfile {
  name: string;
  birthDate: string;
  maritalStatus: MaritalStatus;
  motherhoodStatus: MotherhoodStatus;
  height: string;
  weight: string;
  chronicDiseases: string;
  previousSurgeries: string;
  phone: string;
  nextPeriodDay?: number;
  periodIssues?: string;
  isPeriodActive: boolean;
  periodStartTimestamp?: number;
}

export interface Article {
  id: string;
  title: string;
  image: string;
  content: string;
  category: 'skin' | 'family' | 'fitness';
  targetMarital: 'all' | MaritalStatus;
  ageRange: [number, number];
  targetMotherhood: 'all' | MotherhoodStatus;
}

export interface CommunityPost {
  id: string;
  publisherName: string;
  publisherImage: string;
  text: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
}

export interface Comment {
  id: string;
  userName: string;
  text: string;
  isAdminReply: boolean;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
