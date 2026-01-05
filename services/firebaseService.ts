
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, addDoc, onSnapshot, orderBy,
  updateDoc, arrayUnion, deleteDoc,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { db } from "../firebase.ts";
import { UserProfile, Article, CommunityPost, Comment } from "../types.ts";

// محاولة تفعيل ميزة العمل دون اتصال
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser doesn't support persistence features.");
    }
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

// Global Settings
export const saveAppSettings = async (settings: { geminiApiKey: string }) => {
  try {
    await setDoc(doc(db, "settings", "config"), cleanData(settings));
  } catch (e) {
    console.error("Error saving settings:", e);
    throw e;
  }
};

export const getAppSettings = async () => {
  try {
    const docRef = doc(db, "settings", "config");
    // محاولة جلب الوثيقة مع معالجة حالة الـ offline
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as { geminiApiKey: string } : null;
  } catch (e: any) {
    console.warn("Could not fetch settings (probably offline):", e.message);
    return null;
  }
};

// Users
export const saveUserToDB = async (user: UserProfile) => {
  try {
    const dataToSave = cleanData(user);
    await setDoc(doc(db, "users", user.phone), dataToSave);
  } catch (e) {
    console.error("Error saving user:", e);
    throw e;
  }
};

export const getUserFromDB = async (phone: string) => {
  try {
    const docRef = doc(db, "users", phone);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  } catch (e: any) {
    console.warn("Could not fetch user from DB (offline/error):", e.message);
    return null;
  }
};

export const getAllUsersFromDB = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (e) {
    console.error("Error getting all users:", e);
    return [];
  }
};

export const deleteUserFromDB = async (phone: string) => {
  try {
    const docRef = doc(db, "users", phone);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting user:", e);
    throw e;
  }
};

// Articles
export const addArticleToDB = async (article: Article) => {
  try {
    await addDoc(collection(db, "articles"), { 
      ...cleanData(article), 
      createdAt: Date.now(),
      likes: 0,
      comments: []
    });
  } catch (e) {
    console.error("Error adding article:", e);
  }
};

export const listenToArticles = (callback: (articles: Article[]) => void, onError?: (err: any) => void) => {
  return onSnapshot(collection(db, "articles"), 
    (snapshot) => {
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      callback(articles);
    },
    (error) => {
      console.warn("Articles listener issue:", error);
      if (onError) onError(error);
    }
  );
};

export const addCommentToArticle = async (articleId: string, comment: Comment) => {
  try {
    const docRef = doc(db, "articles", articleId);
    await updateDoc(docRef, {
      comments: arrayUnion(cleanData(comment))
    });
  } catch (e) {
    console.error("Error adding comment to article:", e);
  }
};

export const likeArticleInDB = async (articleId: string, currentLikes: number) => {
  try {
    const docRef = doc(db, "articles", articleId);
    await updateDoc(docRef, {
      likes: currentLikes + 1
    });
  } catch (e) {
    console.error("Error liking article:", e);
  }
};

// Community
export const addPostToDB = async (post: Partial<CommunityPost>) => {
  try {
    await addDoc(collection(db, "posts"), { 
      ...cleanData(post), 
      timestamp: Date.now(),
      likes: 0,
      comments: []
    });
  } catch (e) {
    console.error("Error adding post:", e);
  }
};

export const listenToPosts = (callback: (posts: CommunityPost[]) => void, onError?: (err: any) => void) => {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  return onSnapshot(q, 
    (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));
      callback(posts);
    },
    (error) => {
      console.warn("Posts listener issue:", error);
      if (onError) onError(error);
    }
  );
};

export const addCommentToPost = async (postId: string, comment: Comment) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion(cleanData(comment))
    });
  } catch (e) {
    console.error("Error adding comment:", e);
  }
};

export const likePostInDB = async (postId: string, currentLikes: number) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      likes: currentLikes + 1
    });
  } catch (e) {
    console.error("Error liking post:", e);
  }
};
