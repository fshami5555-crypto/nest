
import React, { useState } from 'react';
import { UserProfile, CommunityPost } from '../types';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';

interface CommunityProps {
  user: UserProfile;
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
}

const Community: React.FC<CommunityProps> = ({ user, posts, setPosts }) => {
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Math.random().toString(),
      userName: user.name,
      text: commentText,
      isAdminReply: false
    };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    setCommentText('');
    setActiveCommentPost(null);
  };

  return (
    <div className="p-4 pt-20">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">مجتمعنا الأنثوي</h2>

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-pink-50">
              <img src={post.publisherImage} alt={post.publisherName} className="w-10 h-10 rounded-full border border-pink-100" />
              <div>
                <h4 className="font-bold text-sm">{post.publisherName}</h4>
                <p className="text-[10px] text-gray-400">{new Date(post.timestamp).toLocaleString('ar-EG')}</p>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-700 leading-relaxed mb-4">{post.text}</p>
              
              <div className="flex items-center gap-6 text-gray-500">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 hover:text-pink-500">
                  <Heart size={20} className={post.likes > 12 ? 'fill-pink-500 text-pink-500' : ''} />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)} className="flex items-center gap-1 hover:text-blue-500">
                  <MessageCircle size={20} />
                  <span className="text-sm">{post.comments.length}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-green-500 mr-auto">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {(activeCommentPost === post.id || post.comments.length > 0) && (
              <div className="bg-gray-50 p-4 space-y-3">
                {post.comments.map(c => (
                  <div key={c.id} className={`flex gap-2 ${c.isAdminReply ? 'mr-6' : ''}`}>
                    <div className={`p-3 rounded-2xl text-sm ${c.isAdminReply ? 'bg-pink-100 border border-pink-200' : 'bg-white border border-gray-100'}`}>
                      <p className="font-bold text-xs mb-1 text-pink-600">{c.userName}</p>
                      <p className="text-gray-700">{c.text}</p>
                    </div>
                  </div>
                ))}
                
                {activeCommentPost === post.id && (
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="اكتبي تعليقاً..."
                      className="flex-1 p-2 rounded-xl text-sm border border-pink-100 outline-none"
                    />
                    <button onClick={() => handleComment(post.id)} className="bg-pink-500 text-white p-2 rounded-xl"><Send size={18} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
