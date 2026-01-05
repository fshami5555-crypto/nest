
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message } from '../types';
import { Send, Sparkles, Moon, Sun, Clock } from 'lucide-react';
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
    ? user.chatHistory.map(m => ({ ...m, timestamp: m.timestamp || Date.now() })) 
    : [{ 
        role: 'model', 
        text: `يا هلا بيكِ يا ${user.name}.. نورتي مكانكِ الصغير ✨ كيفك اليوم؟ حاسة حالك رايقة ولا فيه شي شاغل بالك؟ احكي لي، أنا هون بسمعك بكل قلبي.`,
        timestamp: Date.now() 
      }]
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // التمرير للأسفل فورياً عند الفتح وعند كل رسالة جديدة
  useEffect(() => {
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const formatMessageTime = (ts: number | undefined) => {
    const date = new Date(ts || Date.now());
    if (isNaN(date.getTime())) return '--:--';
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatMessageDate = (ts: number | undefined) => {
    const d = new Date(ts || Date.now());
    if (isNaN(d.getTime())) return 'التاريخ غير معروف';
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'اليوم';
    return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      text: input, 
      timestamp: Date.now() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const negativeKeywords = ['حزين', 'سيئ', 'متعب', 'اكتئاب', 'زعلان', 'ضيق', 'هم', 'موجوع', 'خايفة'];
    if (negativeKeywords.some(word => input.toLowerCase().includes(word))) {
      setIsDarkMode(true);
    }

    const responseText = await getPsychologicalChat(newMessages, user);
    const modelMessage: Message = { 
      role: 'model', 
      text: responseText, 
      timestamp: Date.now() 
    };
    
    const finalMessages = [...newMessages, modelMessage];
    setMessages(finalMessages);
    setLoading(false);

    try {
      await saveUserToDB({ ...user, chatHistory: finalMessages });
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] pt-20 transition-colors duration-700 ${isDarkMode ? 'bg-gray-900' : 'bg-pink-50'}`}>
      <div className={`p-4 border-b flex justify-between items-center shadow-sm z-10 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-pink-50'}`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>مستشاركِ النفسي</h2>
            <p className="text-[9px] text-pink-500 font-bold uppercase tracking-wider">متصل الآن 🟢</p>
          </div>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${isDarkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-indigo-600 hover:bg-black/10'}`}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((m, i) => {
          const showDate = i === 0 || formatMessageDate(m.timestamp) !== formatMessageDate(messages[i-1].timestamp);
          
          return (
            <React.Fragment key={i}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-pink-100 text-pink-600'}`}>
                    {formatMessageDate(m.timestamp)}
                  </span>
                </div>
              )}
              <div className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl shadow-md transition-all duration-300 relative group ${
                  m.role === 'user' 
                  ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-pink-500 text-white')
                  : (isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 border border-pink-50')
                } ${m.role === 'user' ? 'rounded-bl-none' : 'rounded-br-none'}`}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 px-2 text-[9px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Clock size={8} />
                  {formatMessageTime(m.timestamp)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {loading && (
          <div className="flex justify-end">
            <div className={`flex items-center gap-2 p-3 rounded-2xl ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-400 border border-pink-50'}`}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-75"></div>
              </div>
              <span className="text-[10px] italic">تكتب لكِ بصدق...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-transparent pb-10">
        <div className={`flex gap-2 max-w-4xl mx-auto items-center p-2 rounded-[2rem] border shadow-2xl ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="احكي لي كل شي ببالك.."
            className={`flex-1 p-3 rounded-[1.5rem] outline-none transition-all text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-pink-50 border-pink-100 text-gray-800'}`}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="p-3 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 active:scale-90 disabled:opacity-50 transition-all shadow-pink-500/20"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
};

export default PsychChat;
