// بما أننا حملنا Firebase في index.html، نقوم بالوصول إليها من الكائن العالمي (window)
// هذا يضمن أن النسخة المستخدمة هي نسخة واحدة ومستقرة تماماً

const getDb = () => {
  const db = (window as any).FirebaseDB;
  if (!db) {
    // في حال لم يتم التحميل بعد، نعيد محاولة بسيطة (نادر الحدوث بسبب ترتيب script)
    return null;
  }
  return db;
};

export const db = (window as any).FirebaseDB;
export const app = (window as any).FirebaseApp;

// إضافة تصديرات وهمية لـ Firestore لتجنب أخطاء TypeScript في الاستيراد
export default { db, app };