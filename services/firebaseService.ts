import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, addDoc, onSnapshot, orderBy,
  updateDoc, arrayUnion, deleteDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// نستخدم المرجع العالمي الذي قمنا بإنشائه
const getDB = () => (window as any).FirebaseDB;

const cleanData = (data: any) => {
  if (!data) return data;
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    } else if (cleaned[key] && typeof cleaned[key] === 'object' && !Array.isArray(cleaned[key])) {
      cleaned[key] = cleanData(cleaned[key]);
    }
  });
  return cleaned;
};

// --- Users ---
export const saveUserToDB = async (user: any) => {
  const db = getDB();
  if (!db) return;
  await setDoc(doc(db, "users", user.phone), cleanData(user));
};

export const getUserFromDB = async (phone: string) => {
  const db = getDB();
  if (!db) return null;
  const docSnap = await getDoc(doc(db, "users", phone));
  return docSnap.exists() ? docSnap.data() : null;
};

export const getAllUsersFromDB = async () => {
  const db = getDB();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(doc => doc.data());
};

// --- Orders ---
export const createOrderInDB = async (order: any) => {
  const db = getDB();
  if (!db) return;
  return await addDoc(collection(db, "orders"), { ...cleanData(order), timestamp: Date.now() });
};

export const listenToOrders = (callback: any) => {
  const db = getDB();
  if (!db) return () => {};
  const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (s) => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));
};

export const updateOrderStatusInDB = async (orderId: string, status: string) => {
  const db = getDB();
  if (!db) return;
  await updateDoc(doc(db, "orders", orderId), { status });
};

// --- Products ---
export const addProductToDB = async (product: any) => {
  const db = getDB();
  if (!db) return;
  await addDoc(collection(db, "products"), { ...cleanData(product), timestamp: Date.now(), likes: 0, comments: [] });
};

export const deleteProductFromDB = async (id: string) => {
  const db = getDB();
  if (!db) return;
  await deleteDoc(doc(db, "products", id));
};

export const listenToProducts = (callback: any) => {
  const db = getDB();
  if (!db) return () => {};
  const q = query(collection(db, "products"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (s) => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))));
};

export const addCommentToProduct = async (productId: string, comment: any) => {
  const db = getDB();
  if (!db) return;
  await updateDoc(doc(db, "products", productId), { comments: arrayUnion(cleanData(comment)) });
};

export const likeProductInDB = async (productId: string, currentLikes: number) => {
  const db = getDB();
  if (!db) return;
  await updateDoc(doc(db, "products", productId), { likes: (currentLikes || 0) + 1 });
};

// --- Articles ---
export const listenToArticles = (callback: any) => {
  const db = getDB();
  if (!db) return () => {};
  return onSnapshot(collection(db, "articles"), (s) => callback(s.docs.map(d => ({id: d.id, ...d.data()}))));
};

export const addArticleToDB = async (article: any) => {
  const db = getDB();
  if (!db) return;
  await addDoc(collection(db, "articles"), { ...cleanData(article), createdAt: Date.now(), likes: 0, comments: [] });
};

export const deleteArticleFromDB = async (id: string) => {
  const db = getDB();
  if (!db) return;
  await deleteDoc(doc(db, "articles", id));
};

export const addCommentToArticle = async (articleId: string, comment: any) => {
  const db = getDB();
  if (!db) return;
  await updateDoc(doc(db, "articles", articleId), { comments: arrayUnion(cleanData(comment)) });
};

export const likeArticleInDB = async (articleId: string, currentLikes: number) => {
  const db = getDB();
  if (!db) return;
  await updateDoc(doc(db, "articles", articleId), { likes: (currentLikes || 0) + 1 });
};

// --- Community ---
export const listenToPosts = (callback: any) => {
  const db = getDB();
  if (!db) return () => {};
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (s) => callback(s.docs.map(d => ({id: d.id, ...d.data()}))));
};

export const addPostToDB = async (post: any) => {
  const db = getDB();
  if (!db) return;
  await addDoc(collection(db, "posts"), { ...cleanData(post), timestamp: Date.now(), likes: 0, comments: [] });
};

export const deletePostFromDB = async (id: string) => {
  const db = getDB();
  if (!db) return;
  await deleteDoc(doc(db, "posts", id));
};

export const addCommentToPost = async (postId: string, comment: any) => {
  const db = getDB();
  if (!db) return;
  await updateDoc(doc(db, "posts", postId), { comments: arrayUnion(cleanData(comment)) });
};

export const likePostInDB = async (postId: string, currentLikes: number) => {
  const db = getDB();
  if (!db) return;
  await updateDoc(doc(db, "posts", postId), { likes: (currentLikes || 0) + 1 });
};