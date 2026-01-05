
export type MaritalStatus = 'single' | 'married' | 'all';
export type MotherhoodStatus = 'pregnant' | 'not_pregnant' | 'mother' | 'none' | 'all';

export interface AICache {
  greeting?: { text: string; expiresAt: number };
  statusAdvice?: { text: string; expiresAt: number; statusType: string };
  horoscope?: { text: string; expiresAt: number };
}

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
  nextPeriodDate?: string; 
  lastPeriodEndDate?: string;
  periodIssues?: string;
  isPeriodActive: boolean;
  periodStartTimestamp?: number;
  chatHistory?: Message[];
  savedMealPlan?: any[];
  mealPlanGoal?: string;
  expectedDueDate?: string;
  babyGender?: 'boy' | 'girl' | 'not_yet';
  stillGetsPeriod?: boolean;
  isPostpartum?: boolean;
  postpartumStartTimestamp?: number;
  aiCache?: AICache;
}

export interface Article {
  id?: string;
  title: string;
  image: string;
  content: string;
  category: 'skin' | 'family' | 'fitness';
  targetMarital: MaritalStatus;
  ageRange: [number, number];
  targetMotherhood: MotherhoodStatus;
  createdAt?: number;
  likes?: number;
  comments?: Comment[];
}

export interface CommunityPost {
  id?: string;
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
  timestamp: number; // الوقت بالملي ثانية
}
