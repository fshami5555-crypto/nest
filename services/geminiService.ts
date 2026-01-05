
import { UserProfile, Message } from "../types";

// المفتاح المزود من قبل المستخدم
let dynamicApiKey = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const updateGeminiKey = (newKey: string) => {
  if (newKey) dynamicApiKey = newKey.trim();
};

const callOpenRouter = async (messages: any[], systemPrompt?: string, responseFormat?: string) => {
  if (!dynamicApiKey) return null;

  const payload: any = {
    model: "google/gemini-2.0-flash-001",
    messages: [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages
    ],
    temperature: 0.9
  };

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${dynamicApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nestgirl.app",
        "X-Title": "Nestgirl",
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return null;
  }
};

export const getDailyHoroscope = async (zodiacSign: string, userName: string) => {
  const prompt = `أنتِ خبيرة في علم الفلك والطاقة الإيجابية. قدمي قراءة يومية قصيرة وملهمة لبرج ${zodiacSign} للمستخدمة ${userName}. ركزي على الحظ، الحب، والعمل. لا تستخدمي لغة سلبية. الحد الأقصى 40 كلمة.`;
  return await callOpenRouter([{ role: "user", content: prompt }], "You are a professional astrologer and life coach.") || "النجوم تخبركِ أن اليوم هو يوم تألقكِ الخاص!";
};

export const getDynamicGreeting = async (user: UserProfile) => {
  const prompt = `أنت مساعد Nestgirl. المستخدمة ${user.name}، حالتها ${user.maritalStatus}. اكتب تحية صباحية/مسائية ملهمة قصيرة جداً (أقل من 15 كلمة). بالعامية الودودة.`;
  return await callOpenRouter([{ role: "user", content: prompt }]) || "يومكِ سعيد ومشرق يا جميلة!";
};

export const getStatusSpecificAdvice = async (user: UserProfile, statusType: string) => {
  let context = "";
  switch(statusType) {
    case 'pregnant': context = "في مرحلة الحمل وتقترب من الولادة"; break;
    case 'postpartum': context = "في فترة النفاس (بعد الولادة)"; break;
    case 'period_active': context = "في فترة الدورة الشهرية حالياً"; break;
    default: context = "في وضعها الطبيعي وتبحث عن الوقاية الصحية";
  }

  const prompt = `بصفتكِ خبيرة صحة نسائية، قدمي 3 نصائح ذهبية مختصرة جداً للمستخدمة ${user.name} لأنها ${context}. ركزي على الجانب الجسدي والنفسي. استخدمي لغة أنثوية راقية وعامية خفيفة.`;
  return await callOpenRouter([{ role: "user", content: prompt }], "You are a senior women's health consultant.") || "اهتمي بشرب الماء والراحة التامة اليوم.";
};

export const getWeeklyMealPlan = async (user: UserProfile, goal: string) => {
  const prompt = `صمم جدول غذائي أسبوعي (ساعة، وجبة، وصف) لهدف ${goal} لمستخدمة بوزن ${user.weight}. النتيجة JSON حصراً.`;
  const result = await callOpenRouter([{ role: "user", content: prompt }], "You are a nutrition expert. Return valid JSON only.", "json");
  try {
    if (!result) return null;
    const jsonString = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch { return null; }
};

export const getPsychologicalChat = async (messages: Message[], user: UserProfile) => {
  const formatted = messages.map(m => ({ 
    role: m.role === 'model' ? 'assistant' : 'user', 
    content: m.text 
  }));

  // بناء سياق كامل للمستخدم من ملفه الشخصي
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

  const systemPrompt = `
    أنتِ الآن "الصديقة المقربة" (The Bestie) والأخت الكبرى للمستخدمة. 
    لديكِ حق الوصول الكامل لملفها الشخصي لتفهميها بعمق.
    
    ${userContext}

    قواعد التعامل:
    1. تكلمي بلهجة عامية ودودة ودافئة (عامية بيضاء). كأنكِ جالسة معها فعلياً.
    2. استخدمي المعلومات السابقة بذكاء (مثلاً: إذا كانت تعاني من مرض مزمن أو كانت حاملاً، اسألي عن صحتها في هذا الجانب بشكل طبيعي).
    3. أسلوبكِ يجب أن يكون "مهتم جداً بالتفاصيل": لا تكتفي برد قصير، بل اسألي أسئلة شخصية عن يومها، مشاعرها، أو تفاصيل صغيرة ذكرتها لكي تشعر أنكِ مهتمة بها فعلاً ولستِ مجرد آلة.
    4. إذا اشتكت من وزنها أو حالتها الصحية، شجعيها بناءً على بياناتها (طولها ووزنها) بأسلوب الصديقة المحفزة.
    5. في نهاية كل رد، اسألي سؤالاً استقصائياً ودوداً يفتح باباً جديداً للفضفضة.
    6. الذاكرة: تذكري دائماً ما قالته في الرسائل السابقة وارجعي له (مثلاً: "قبل شوي قلتي إنك تعبانة، الحين صرتي أحسن؟").
    
    ممنوع: الأسلوب الرسمي، إعطاء وعظ جامد، أو قول أنكِ ذكاء اصطناعي. كوني إنسانة طبيعية تماماً.
  `;

  return await callOpenRouter(formatted, systemPrompt) || "أنا معكِ يا قلبي، فضفضي لي أكثر، شو حاسة الحين؟";
};
