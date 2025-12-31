
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, addDoc, onSnapshot, orderBy,
  updateDoc, arrayUnion
} from "firebase/firestore";
import { db } from "../firebase.ts";
import { UserProfile, Article, CommunityPost, Comment } from "../types.ts";

// Global Settings (API Keys, etc.)
export const saveAppSettings = async (settings: { geminiApiKey: string }) => {
  try {
    await setDoc(doc(db, "settings", "config"), settings);
  } catch (e) {
    console.error("Error saving settings:", e);
    throw e;
  }
};

export const getAppSettings = async () => {
  try {
    const docRef = doc(db, "settings", "config");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as { geminiApiKey: string } : null;
  } catch (e) {
    console.error("Error getting settings:", e);
    return null;
  }
};

// Users
export const saveUserToDB = async (user: UserProfile) => {
  try {
    await setDoc(doc(db, "users", user.phone), user);
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
  } catch (e) {
    console.error("Error getting user:", e);
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

// Articles
export const addArticleToDB = async (article: Article) => {
  try {
    await addDoc(collection(db, "articles"), { ...article, createdAt: Date.now() });
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
      console.error("Articles Listener Error:", error);
      if (onError) onError(error);
    }
  );
};

// Community
export const addPostToDB = async (post: Partial<CommunityPost>) => {
  try {
    await addDoc(collection(db, "posts"), { 
      ...post, 
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
      console.error("Posts Listener Error:", error);
      if (onError) onError(error);
    }
  );
};

export const addCommentToPost = async (postId: string, comment: Comment) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion(comment)
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
