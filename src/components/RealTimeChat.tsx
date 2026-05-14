import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Users, Shield, Loader2, MessageSquareText, Search } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: number;
}

interface RealTimeChatProps {
  user: any;
}

type ChatTab = 'community' | 'support';

export const RealTimeChat: React.FC<RealTimeChatProps> = ({ user }) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('community');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !db) return;

    setLoading(true);
    
    // Resolved Firestore paths matching the firestore.rules
    const finalPath = activeTab === 'community' 
      ? 'chat_channels/community/messages' 
      : 'chat_channels/support/sessions/general/messages';

    const q = query(collection(db, finalPath), orderBy('timestamp', 'asc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toMillis?.() || (doc.data() as any).timestamp || Date.now()
      })) as ChatMessage[];
      
      setMessages(msgList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, finalPath);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, activeTab, user.id, user.role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !db) return;

    const messageText = input.trim();
    setInput('');

    const finalPath = activeTab === 'community' 
      ? 'chat_channels/community/messages' 
      : 'chat_channels/support/sessions/general/messages';

    try {
      await addDoc(collection(db, finalPath), {
        senderId: user.id || 'anonymous',
        senderName: user.fullName || user.full_name || 'Guest',
        senderRole: user.role || 'user',
        text: messageText,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, finalPath);
      showToast("Failed to send message", "error");
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
            className="absolute bottom-20 left-0 w-80 sm:w-96 bg-app-card border border-app-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-app-border bg-emerald-500/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-black uppercase tracking-widest text-xs">Real-Time Hub</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-app-text/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex bg-app-bg/50 p-1 rounded-xl border border-app-border">
                <button 
                  onClick={() => setActiveTab('community')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'community' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "opacity-40 hover:opacity-100"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  Community
                </button>
                <button 
                  onClick={() => setActiveTab('support')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'support' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "opacity-40 hover:opacity-100"
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Support
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-app-bg/30"
            >
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Connecting to Real-time Hub...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-20 text-center px-8">
                  <MessageSquareText className="w-12 h-12" />
                  <p className="text-xs font-medium">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isOwn = m.senderId === user.id;
                  const showHeader = i === 0 || messages[i-1].senderId !== m.senderId;

                  return (
                    <div 
                      key={m.id}
                      className={cn(
                        "flex flex-col gap-1",
                        isOwn ? "items-end" : "items-start"
                      )}
                    >
                      {showHeader && (
                        <div className="flex items-center gap-2 px-1">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            isOwn ? "text-emerald-500" : "text-app-text/40"
                          )}>
                            {m.senderName}
                          </span>
                          {m.senderRole === 'admin' && (
                            <span className="text-[7px] bg-red-500/20 text-red-500 px-1 rounded border border-red-500/20 font-black uppercase">Staff</span>
                          )}
                        </div>
                      )}
                      
                      <div className={cn(
                        "group relative max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed",
                        isOwn 
                          ? "bg-emerald-500 text-black font-medium rounded-tr-none" 
                          : "bg-app-card border border-app-border rounded-tl-none text-app-text"
                      )}>
                        {m.text}
                        <span className={cn(
                          "absolute -bottom-4 opacity-0 group-hover:opacity-40 transition-opacity text-[8px] whitespace-nowrap",
                          isOwn ? "right-0" : "left-0"
                        )}>
                          {m.timestamp ? format(m.timestamp, 'HH:mm') : 'Sending...'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-app-card border-t border-app-border">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={activeTab === 'community' ? "Chat with the community..." : "Message support team..."}
                  className="flex-1 bg-app-bg border border-app-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:opacity-30"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/10"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group",
          isOpen ? "bg-red-500 text-white" : "bg-app-card border border-app-border text-emerald-500 hover:border-emerald-500/50"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-app-card group-hover:animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
