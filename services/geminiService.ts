
import { UserProfile, Message } from "../types";

// المفتاح الافتراضي (الذي زودتنا به) أو المفتاح المجلوب من قاعدة البيانات
let dynamicApiKey = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const updateGeminiKey = (newKey: string) => {
  if (newKey) dynamicApiKey = newKey;
};

/**
 * دالة مساعدة لإجراء الطلبات لـ OpenRouter
 */
const callOpenRouter = async (messages: any[], systemPrompt?: string, responseFormat?: string) => {
  if (!dynamicApiKey) return null;

  const payload: any = {
    model: "google/gemini-2.0-flash-001", // استخدام أحدث موديل جيميناي عبر OpenRouter
    messages: [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages
    ],
    headers: {
      "HTTP-Referer": "https://nestgirl.app", // اختياري لترتيب التطبيق في OpenRouter
      "X-Title": "Nestgirl Women App",
    }
  };

  if (responseFormat === "json") {
    payload.response_format = { type: "json_object" };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${dynamicApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return null;
  }
};

export const getDynamicGreeting = async (user: UserProfile) => {
  const hour = new Date().getHours();
  const timeContext = hour < 12 ? "الصباح" : "المساء";
  
  const prompt = `أنت مساعد ذكي لتطبيق "Nestgirl" المخصص للنساء. 
  المستخدمة حالياً في وقت ${timeContext}.
  معلومات المستخدمة: الاسم: ${user.name}، الحالة: ${user.maritalStatus}، الأمومة: ${user.motherhoodStatus}.
  اكتب تحية قصيرة وملهمة وودودة جداً. لا تزد عن 25 كلمة.`;

  const result = await callOpenRouter([{ role: "user", content: prompt }]);
  return result || "يومك سعيد وجميل!";
};

export const getWeeklyMealPlan = async (user: UserProfile, goal: string) => {
  const prompt = `بناءً على: الوزن: ${user.weight}, الطول: ${user.height}, الهدف: ${goal}.
  قم بإنشاء جدول غذائي أسبوعي (من السبت إلى الجمعة).
  أريد النتيجة ككائن JSON يحتوي على مصفوفة أيام وكل يوم يحتوي على مصفوفة وجبات (time, type, description).
  اللغة: العربية.`;

  const result = await callOpenRouter([{ role: "user", content: prompt }], "You are a professional nutritionist expert for women. Return valid JSON only.", "json");
  try {
    return result ? JSON.parse(result) : null;
  } catch {
    return null;
  }
};

export const getPsychologicalChat = async (messages: Message[], user: UserProfile) => {
  const systemInstruction = `أنت مستشار نفسي ودود وداعم في تطبيق Nestgirl. 
  هدفنا هو مساعدة المستخدمة ${user.name} على تحسين حالتها النفسية. 
  تحدث باللغة العربية بأسلوب أنثوي وراقي ومتعاطف جداً.`;

  const formattedMessages = messages.map(m => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.text
  }));

  const result = await callOpenRouter(formattedMessages, systemInstruction);
  return result || "أنا هنا لسماعك دائماً. كيف يمكنني مساعدتك؟";
};
