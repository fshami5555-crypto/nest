
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message } from '../types';
import { Send, Sparkles, Moon, Sun } from 'lucide-react';
import { getPsychologicalChat } from '../services/geminiService';
import { saveUserToDB } from '../services/firebaseService';

interface PsychChatProps {
  user: UserProfile;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
}

const PsychChat: React.FC<PsychChatProps> = ({ user, isDarkMode, setIsDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>(
    user.chatHistory && user.chatHistory.length > 0 
    ? user.chatHistory 
    : [{ role: 'model', text: `مرحباً بكِ يا ${user.name}، كيف حالكِ اليوم؟ هل تشعرين بشعور جيد أم أن هناك ما يزعجكِ؟` }]
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Dynamic Theme Logic
    const negativeKeywords = ['حزين', 'سيئ', 'متعب', 'اكتئاب', 'زعلان', 'ضيق', 'هم', 'bad', 'sad'];
    const hasNegative = negativeKeywords.some(word => input.toLowerCase().includes(word));
    if (hasNegative) {
      setIsDarkMode(true);
    } else if (['سعيد', 'جيد', 'ممتاز', 'happy', 'good'].some(word => input.toLowerCase().includes(word))) {
      setIsDarkMode(false);
    }

    const responseText = await getPsychologicalChat(newMessages, user);
    const finalMessages: Message[] = [...newMessages, { role: 'model', text: responseText }];
    setMessages(finalMessages);
    setLoading(false);

    // Save to Firebase
    try {
      await saveUserToDB({ ...user, chatHistory: finalMessages });
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] pt-16 ${isDarkMode ? 'bg-gray-900' : 'bg-pink-50'}`}>
      <div className="p-4 border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="text-pink-500" />
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>مستشاركِ النفسي</h2>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-indigo-600 hover:bg-black/10'}`}>
          {isDarkMode ? <Sun /> : <Moon />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              m.role === 'user' 
              ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-pink-500 text-white')
              : (isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800')
            } ${m.role === 'user' ? 'rounded-bl-none' : 'rounded-br-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className={`animate-pulse p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-400'}`}>جاري التفكير...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-transparent">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="تحدثي إليّ..."
            className={`flex-1 p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-pink-100 text-gray-800'}`}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="p-4 bg-pink-500 text-white rounded-2xl shadow-lg hover:bg-pink-600 active:scale-95 disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PsychChat;
