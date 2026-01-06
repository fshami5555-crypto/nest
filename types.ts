
export type MaritalStatus = 'single' | 'married' | 'all';
export type MotherhoodStatus = 'pregnant' | 'not_pregnant' | 'mother' | 'none' | 'all';

export type JordanProvince = 'عمان' | 'إربد' | 'الزرقاء' | 'البلقاء' | 'مأدبا' | 'الكرك' | 'الطفيلة' | 'معان' | 'العقبة' | 'المفرق' | 'جرش' | 'عجلون';

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

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: string;
  image: string;
  link: string;
  category: 'skin' | 'family' | 'fitness' | 'general';
  timestamp: number;
  likes?: number;
  comments?: Comment[];
}

export interface Order {
  id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  province: JordanProvince;
  items: Product[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: number;
}

export interface Article {
  id?: string;
  title: string;
  image: string;
  content: string;
  category: 'skin' | 'family' | 'fitness'; // skin: بشرتك، family: الطفل والأم/الأسرة، fitness: الرشاقة
  subCategory?: string;
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
  timestamp: number;
}
