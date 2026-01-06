import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, addDoc, onSnapshot, orderBy,
  updateDoc, arrayUnion, deleteDoc
} from "firebase/firestore";
import { db } from "../firebase.ts";

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

// تحقق دفاعي من قاعدة البيانات
const checkDb = () => {
  if (!db) {
    console.warn("Firestore is not ready yet.");
    return false;
  }
  return true;
};

// --- Users ---
export const saveUserToDB = async (user: any) => {
  if (!checkDb()) return;
  try {
    await setDoc(doc(db, "users", user.phone), cleanData(user));
  } catch (error) {
    console.error("Firebase saveUserToDB error:", error);
  }
};

export const getUserFromDB = async (phone: string) => {
  if (!checkDb()) return null;
  try {
    const docSnap = await getDoc(doc(db, "users", phone));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Firebase getUserFromDB error:", error);
    return null;
  }
};

export const getAllUsersFromDB = async () => {
  if (!checkDb()) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Firebase getAllUsersFromDB error:", error);
    return [];
  }
};

// --- Orders ---
export const createOrderInDB = async (order: any) => {
  if (!checkDb()) return;
  try {
    return await addDoc(collection(db, "orders"), { ...cleanData(order), timestamp: Date.now() });
  } catch (error) {
    console.error("Firebase createOrderInDB error:", error);
  }
};

export const listenToOrders = (callback: any) => {
  if (!checkDb()) return () => {};
  try {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (s) => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))), (error) => {
      console.error("Firebase listenToOrders error:", error);
    });
  } catch (e) {
    return () => {};
  }
};

export const updateOrderStatusInDB = async (orderId: string, status: string) => {
  if (!checkDb()) return;
  try {
    await updateDoc(doc(db, "orders", orderId), { status });
  } catch (error) {
    console.error("Firebase updateOrderStatusInDB error:", error);
  }
};

// --- Products ---
export const addProductToDB = async (product: any) => {
  if (!checkDb()) return;
  try {
    await addDoc(collection(db, "products"), { ...cleanData(product), timestamp: Date.now(), likes: 0, comments: [] });
  } catch (error) {
    console.error("Firebase addProductToDB error:", error);
  }
};

export const deleteProductFromDB = async (id: string) => {
  if (!checkDb()) return;
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    console.error("Firebase deleteProductFromDB error:", error);
  }
};

export const listenToProducts = (callback: any) => {
  if (!checkDb()) return () => {};
  try {
    const q = query(collection(db, "products"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (s) => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))), (error) => {
      console.error("Firebase listenToProducts error:", error);
    });
  } catch (e) {
    return () => {};
  }
};

export const addCommentToProduct = async (productId: string, comment: any) => {
  if (!checkDb()) return;
  try {
    await updateDoc(doc(db, "products", productId), { comments: arrayUnion(cleanData(comment)) });
  } catch (error) {
    console.error("Firebase addCommentToProduct error:", error);
  }
};

export const likeProductInDB = async (productId: string, currentLikes: number) => {
  if (!checkDb()) return;
  try {
    await updateDoc(doc(db, "products", productId), { likes: (currentLikes || 0) + 1 });
  } catch (error) {
    console.error("Firebase likeProductInDB error:", error);
  }
};

// --- Articles ---
export const listenToArticles = (callback: any) => {
  if (!checkDb()) return () => {};
  try {
    return onSnapshot(collection(db, "articles"), (s) => callback(s.docs.map(d => ({id: d.id, ...d.data()}))), (error) => {
      console.error("Firebase listenToArticles error:", error);
    });
  } catch (error) {
    return () => {};
  }
};

export const addArticleToDB = async (article: any) => {
  if (!checkDb()) return;
  try {
    await addDoc(collection(db, "articles"), { ...cleanData(article), createdAt: Date.now(), likes: 0, comments: [] });
  } catch (error) {
    console.error("Firebase addArticleToDB error:", error);
  }
};

export const deleteArticleFromDB = async (id: string) => {
  if (!checkDb()) return;
  try {
    await deleteDoc(doc(db, "articles", id));
  } catch (error) {
    console.error("Firebase deleteArticleFromDB error:", error);
  }
};

export const addCommentToArticle = async (articleId: string, comment: any) => {
  if (!checkDb()) return;
  try {
    await updateDoc(doc(db, "articles", articleId), { comments: arrayUnion(cleanData(comment)) });
  } catch (error) {
    console.error("Firebase addCommentToArticle error:", error);
  }
};

export const likeArticleInDB = async (articleId: string, currentLikes: number) => {
  if (!checkDb()) return;
  try {
    await updateDoc(doc(db, "articles", articleId), { likes: (currentLikes || 0) + 1 });
  } catch (error) {
    console.error("Firebase likeArticleInDB error:", error);
  }
};

// --- Community ---
export const listenToPosts = (callback: any) => {
  if (!checkDb()) return () => {};
  try {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (s) => callback(s.docs.map(d => ({id: d.id, ...d.data()}))), (error) => {
      console.error("Firebase listenToPosts error:", error);
    });
  } catch (e) {
    return () => {};
  }
};

export const addPostToDB = async (post: any) => {
  if (!checkDb()) return;
  try {
    await addDoc(collection(db, "posts"), { ...cleanData(post), timestamp: Date.now(), likes: 0, comments: [] });
  } catch (error) {
    console.error("Firebase addPostToDB error:", error);
  }
};

export const deletePostFromDB = async (id: string) => {
  if (!checkDb()) return;
  try {
    await deleteDoc(doc(db, "posts", id));
  } catch (error) {
    console.error("Firebase deletePostFromDB error:", error);
  }
};

export const addCommentToPost = async (postId: string, comment: any) => {
  if (!checkDb()) return;
  try {
    await updateDoc(doc(db, "posts", postId), { comments: arrayUnion(cleanData(comment)) });
  } catch (error) {
    console.error("Firebase addCommentToPost error:", error);
  }
};

export const likePostInDB = async (postId: string, currentLikes: number) => {
  if (!checkDb()) return;
  try {
    await updateDoc(doc(db, "posts", postId), { likes: (currentLikes || 0) + 1 });
  } catch (error) {
    console.error("Firebase likePostInDB error:", error);
  }
};