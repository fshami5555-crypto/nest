
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, addDoc, onSnapshot, orderBy,
  updateDoc, arrayUnion, deleteDoc,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { db } from "../firebase.ts";
import { UserProfile, Article, CommunityPost, Comment, Product, Order } from "../types.ts";

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("Firestore Persistence Error:", err.code);
  });
}

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
export const saveUserToDB = async (user: UserProfile) => {
  try {
    await setDoc(doc(db, "users", user.phone), cleanData(user));
  } catch (e) { console.error(e); }
};

export const getUserFromDB = async (phone: string) => {
  try {
    const docSnap = await getDoc(doc(db, "users", phone));
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  } catch (e) { return null; }
};

export const getAllUsersFromDB = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (e) { return []; }
};

// --- Orders ---
export const createOrderInDB = async (order: Order) => {
  try {
    return await addDoc(collection(db, "orders"), { ...cleanData(order), timestamp: Date.now() });
  } catch (e: any) {
    throw new Error("Missing permissions. Please update Firestore Rules.");
  }
};

export const listenToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (s) => callback(s.docs.map(d => ({ id: d.id, ...d.data() } as Order))), (e) => console.warn(e));
};

export const updateOrderStatusInDB = async (orderId: string, status: Order['status']) => {
  try {
    await updateDoc(doc(db, "orders", orderId), { status });
  } catch (e) { console.error(e); }
};

// --- Products ---
export const addProductToDB = async (product: Product) => {
  try {
    await addDoc(collection(db, "products"), { 
      ...cleanData(product), 
      timestamp: Date.now(),
      likes: 0,
      comments: []
    });
  } catch (e: any) {
    alert("خطأ في الصلاحيات عند إضافة المنتج.");
  }
};

export const deleteProductFromDB = async (id: string) => {
  try { await deleteDoc(doc(db, "products", id)); } catch (e) { console.error(e); }
};

export const listenToProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, "products"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (s) => callback(s.docs.map(d => ({ id: d.id, ...d.data() } as Product))), (e) => console.warn(e));
};

export const addCommentToProduct = async (productId: string, comment: Comment) => {
  try {
    await updateDoc(doc(db, "products", productId), {
      comments: arrayUnion(cleanData(comment))
    });
  } catch (e) { console.error(e); }
};

export const likeProductInDB = async (productId: string, currentLikes: number) => {
  try {
    await updateDoc(doc(db, "products", productId), {
      likes: (currentLikes || 0) + 1
    });
  } catch (e) { console.error(e); }
};

// --- Articles ---
export const addArticleToDB = async (article: Article) => {
  try {
    await addDoc(collection(db, "articles"), { 
      ...cleanData(article), 
      createdAt: Date.now(), 
      likes: 0, 
      comments: [] 
    });
  } catch (e) { alert("خطأ في الصلاحيات عند إضافة المقال."); }
};

export const deleteArticleFromDB = async (id: string) => {
  try { await deleteDoc(doc(db, "articles", id)); } catch (e) { console.error(e); }
};

export const listenToArticles = (callback: (articles: Article[]) => void) => {
  return onSnapshot(collection(db, "articles"), (s) => callback(s.docs.map(d => ({id: d.id, ...d.data()} as Article))), (e) => console.warn(e));
};

export const addCommentToArticle = async (articleId: string, comment: Comment) => {
  try { await updateDoc(doc(db, "articles", articleId), { comments: arrayUnion(cleanData(comment)) }); } catch(e) {}
};

export const likeArticleInDB = async (articleId: string, currentLikes: number) => {
  try { await updateDoc(doc(db, "articles", articleId), { likes: currentLikes + 1 }); } catch(e) {}
};

// --- Community ---
export const addPostToDB = async (post: Partial<CommunityPost>) => {
  try {
    await addDoc(collection(db, "posts"), { 
      ...cleanData(post), 
      timestamp: Date.now(), 
      likes: 0, 
      comments: [] 
    });
  } catch(e) { alert("خطأ في الصلاحيات عند إضافة المنشور."); }
};

export const deletePostFromDB = async (id: string) => {
  try { await deleteDoc(doc(db, "posts", id)); } catch (e) { console.error(e); }
};

export const listenToPosts = (callback: (posts: CommunityPost[]) => void) => {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (s) => callback(s.docs.map(d => ({id: d.id, ...d.data()} as CommunityPost))), (e) => console.warn(e));
};

export const addCommentToPost = async (postId: string, comment: Comment) => {
  try { await updateDoc(doc(db, "posts", postId), { comments: arrayUnion(cleanData(comment)) }); } catch (e) {}
};

export const likePostInDB = async (postId: string, currentLikes: number) => {
  try { await updateDoc(doc(db, "posts", postId), { likes: currentLikes + 1 }); } catch (e) {}
};
