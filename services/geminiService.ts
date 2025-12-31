
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDynamicGreeting = async (user: UserProfile) => {
  const hour = new Date().getHours();
  const timeContext = hour < 12 ? "الصباح" : "المساء";
  
  const prompt = `أنت مساعد ذكي لتطبيق "Nestgirl" المخصص للنساء. 
  المستخدمة حالياً في وقت ${timeContext}.
  معلومات المستخدمة:
  الاسم: ${user.name}
  الحالة الاجتماعية: ${user.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}
  الحالة: ${user.motherhoodStatus}
  الوزن: ${user.weight} كجم، الطول: ${user.height} سم.
  
  قم بكتابة تحية قصيرة وملهمة ومناسبة لوقتها وحالتها الحالية. اجعلها ودودة جداً وداعمة. 
  إذا كانت متزوجة أو أماً، وجه نصيحة سريعة تتعلق بحالتها. لا تزد عن 30 كلمة.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "مرحباً بكِ في Nestgirl!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "يومك سعيد وجميل!";
  }
};

export const getWeeklyMealPlan = async (user: UserProfile, goal: string) => {
  const prompt = `بناءً على المعلومات التالية:
  الوزن: ${user.weight}, الطول: ${user.height}, الهدف: ${goal}.
  قم بإنشاء جدول غذائي أسبوعي (من السبت إلى الجمعة).
  لكل يوم حدد وجبة فطور، غداء، عشاء وسناك مع تحديد وقت تقريبي.
  اجعل الرد بصيغة JSON.
  الهدف من الجدول هو: ${goal === 'lose' ? 'تخفيف الوزن' : goal === 'gain' ? 'زيادة الوزن' : 'المحافظة على الوزن'}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
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
                    time: { type: Type.STRING },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["time", "type", "description"]
                }
              }
            },
            required: ["day", "meals"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getPsychologicalChat = async (messages: Message[], user: UserProfile) => {
  const history = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const systemInstruction = `أنت مستشار نفسي ودود وداعم في تطبيق Nestgirl. 
  هدفنا هو مساعدة المستخدمة ${user.name} على تحسين حالتها النفسية. 
  إذا كانت تشعر بسوء، كن متعاطفاً جداً واقترح خطوات بسيطة للتحسن. 
  تحدث باللغة العربية بأسلوب أنثوي وراقي.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: messages[messages.length - 1].text,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    return "أنا هنا لسماعك دائماً. هل يمكننا تجربة التحدث عن شيء يجعلكِ سعيدة؟";
  }
};
