
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Message } from "../types";

// Fix: Initialize Google GenAI client exclusively using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Removed dynamicApiKey and updateGeminiKey as API key must not be managed via UI

export const getDailyHoroscope = async (zodiacSign: string, userName: string) => {
  // Fix: Use ai.models.generateContent with gemini-3-flash-preview for basic text tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أنتِ خبيرة في علم الفلك والطاقة الإيجابية. قدمي قراءة يومية قصيرة وملهمة لبرج ${zodiacSign} للمستخدمة ${userName}. ركزي على الحظ، الحب، والعمل. لا تستخدمي لغة سلبية. الحد الأقصى 40 كلمة.`,
    config: {
      systemInstruction: "You are a professional astrologer and life coach."
    }
  });
  return response.text || "النجوم تخبركِ أن اليوم هو يوم تألقكِ الخاص!";
};

export const getDynamicGreeting = async (user: UserProfile) => {
  // Fix: Adopt ai.models.generateContent pattern
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أنت مساعد Nestgirl. المستخدمة ${user.name}، حالتها ${user.maritalStatus}. اكتب تحية صباحية/مسائية ملهمة قصيرة جداً (أقل من 15 كلمة). بالعامية الودودة.`,
  });
  return response.text || "يومكِ سعيد ومشرق يا جميلة!";
};

export const getStatusSpecificAdvice = async (user: UserProfile, statusType: string) => {
  let context = "";
  switch(statusType) {
    case 'pregnant': context = "في مرحلة الحمل وتقترب من الولادة"; break;
    case 'postpartum': context = "في فترة النفاس (بعد الولادة)"; break;
    case 'period_active': context = "في فترة الدورة الشهرية حالياً"; break;
    default: context = "في وضعها الطبيعي وتبحث عن الوقاية الصحية";
  }

  // Fix: Use standard systemInstruction config for context
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `بصفتكِ خبيرة صحة نسائية، قدمي 3 نصائح ذهبية مختصرة جداً للمستخدمة ${user.name} لأنها ${context}. ركزي على الجانب الجسدي والنفسي. استخدمي لغة أنثوية راقية وعامية خفيفة.`,
    config: {
      systemInstruction: "You are a senior women's health consultant."
    }
  });
  return response.text || "اهتمي بشرب الماء والراحة التامة اليوم.";
};

export const getWeeklyMealPlan = async (user: UserProfile, goal: string) => {
  // Fix: Implement responseSchema for robust JSON structure as mandated by guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `أنت خبير تغذية متخصص. صمم جدولاً غذائياً أسبوعياً شاملاً لمستخدمة تهدف لـ ${goal === 'lose' ? 'خسارة الوزن' : goal === 'gain' ? 'زيادة الوزن' : 'المحافظة على الوزن'} بوزن ${user.weight} كجم.`,
    config: {
      systemInstruction: "You are a senior nutrition expert. Return valid JSON only.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  calories: { type: Type.NUMBER },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER }
                    }
                  }
                },
                propertyOrdering: ["type", "title", "description", "ingredients", "instructions", "calories", "macros"]
              }
            }
          },
          propertyOrdering: ["day", "meals"]
        }
      }
    }
  });
  
  try {
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch { return null; }
};

export const getPsychologicalChat = async (messages: Message[], user: UserProfile) => {
  const userContext = `
    معلومات المستخدمة الكاملة:
    - الاسم: ${user.name}
    - العمر التقريبي: ${new Date().getFullYear() - new Date(user.birthDate).getFullYear()} سنة
    - الحالة الاجتماعية: ${user.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}
    - حالة الأمومة: ${user.motherhoodStatus}
    - الطول: ${user.height} سم، الوزن: ${user.weight} كجم
    - الأمراض المزمنة: ${user.chronicDiseases || 'لا يوجد'}
    - العمليات السابقة: ${user.previousSurgeries || 'لا يوجد'}
    - حالة الدورة الشهرية: ${user.isPeriodActive ? 'نشطة حالياً' : 'غير نشطة'}
    - مشاكل الدورة: ${user.periodIssues || 'لا يوجد'}
    ${user.motherhoodStatus === 'pregnant' ? `- حامل، الموعد المتوقع: ${user.expectedDueDate}, جنس الجنين: ${user.babyGender}` : ''}
    ${user.isPostpartum ? `- في فترة النفاس حالياً` : ''}
    - هدف التغذية الحالي: ${user.mealPlanGoal || 'لم يحدد بعد'}
  `;

  const systemInstruction = `
    أنتِ الآن "الصديقة المقربة" (The Bestie) والأخت الكبرى للمستخدمة. 
    لديكِ حق الوصول الكامل لملفها الشخصي لتفهميها بعمق.
    ${userContext}
    قواعد التعامل:
    1. تكلمي بلهجة عامية ودودة ودافئة (عامية بيضاء). كأنكِ جالسة معها فعلياً.
    2. استخدمي المعلومات السابقة بذكاء.
    3. أسلوبكِ يجب أن يكون "مهتم جداً بالتفاصيل".
    4. في نهاية كل رد، اسألي سؤالاً استقصائياً ودوداً.
    5. الذاكرة: تذكري دائماً ما قالته في الرسائل السابقة.
  `;

  // Fix: Map messages to standard Gemini content parts and use gemini-3-pro-preview
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: {
      systemInstruction
    }
  });

  return response.text || "أنا معكِ يا قلبي، فضفضي لي أكثر، شو حاسة الحين؟";
};
