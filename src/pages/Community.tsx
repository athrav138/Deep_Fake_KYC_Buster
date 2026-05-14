import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Share2, 
  Award,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

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

export default function Community() {
  const [stats, setStats] = useState({
    activeUsers: 1243,
    verificationsToday: 856,
    deepfakesCaught: 42,
    trustScore: 99.8
  });

  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const path = 'global_activity';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toMillis?.() || (doc.data() as any).timestamp || Date.now()
      }));
      
      if (list.length > 0) {
        setFeed(list);
      } else {
        // Mock data for initial visual if empty
        setFeed([
          { id: '1', type: 'verification', user: 'Alex M.', status: 'Approved', timestamp: Date.now() - 1000 * 60 * 5, location: 'San Francisco, CA' },
          { id: '2', type: 'security', user: 'System', status: 'Deepfake Prevented', timestamp: Date.now() - 1000 * 60 * 15, location: 'Cloud Node 7' },
          { id: '3', type: 'user', user: 'Sarah J.', status: 'Joined', timestamp: Date.now() - 1000 * 60 * 45, location: 'London, UK' },
        ]);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">COMMUNITY <span className="text-emerald-500">CONNECT</span></h1>
          <p className="text-app-text/60 text-sm">Join thousands of users securing their digital identity.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
            Share My Story
          </button>
          <button className="px-4 py-2 bg-app-card border border-app-border rounded-xl text-sm font-bold hover:bg-app-bg transition-all">
            Join Discord
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Shielders', value: stats.activeUsers, icon: Users, color: 'text-blue-500' },
          { label: 'Verified Today', value: stats.verificationsToday, icon: UserCheck, color: 'text-emerald-500' },
          { label: 'Deepfakes Blocked', value: stats.deepfakesCaught, icon: ShieldCheck, color: 'text-red-500' },
          { label: 'Global Trust Score', value: `${stats.trustScore}%`, icon: Award, color: 'text-yellow-500' }
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 rounded-3xl bg-app-card border border-app-border group hover:border-emerald-500/30 transition-all relative overflow-hidden"
          >
            <div className={cn("mb-4 p-2 w-fit rounded-xl bg-app-bg border border-app-border", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black tracking-tight">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">{stat.label}</p>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <Activity className="w-12 h-12" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Live Network Activity
            </h2>
            <div className="flex items-center gap-2 text-[10px] items-center opacity-40 uppercase font-black tracking-widest">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Real-time
            </div>
          </div>

          <div className="space-y-4">
            {feed.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item.id}
                className="p-4 rounded-2xl bg-app-card border border-app-border flex items-center gap-4 group hover:bg-emerald-500/5 transition-all"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-app-border",
                  item.type === 'security' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                )}>
                  {item.type === 'security' ? <ShieldCheck className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold truncate">{item.user}</p>
                    <span className="text-[10px] opacity-40">{formatDistanceToNow(item.timestamp)} ago</span>
                  </div>
                  <p className="text-xs opacity-60">
                    <span className={cn(
                      "font-bold mr-2",
                      item.status === 'Approved' ? 'text-emerald-500' : 
                      item.status.includes('Deepfake') ? 'text-red-500' : 'text-blue-500'
                    )}>
                      {item.status}
                    </span>
                    • {item.location}
                  </p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-app-bg rounded-lg transition-all">
                  <Share2 className="w-4 h-4 opacity-40" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Community Leaderboard */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Shielders
          </h2>
          <div className="p-6 rounded-3xl bg-app-card border border-app-border space-y-4">
            {[
              { name: 'Identity Labs', score: 12500, level: 'Pro' },
              { name: 'Satoshi Guardian', score: 9800, level: 'Elite' },
              { name: 'DeepWatch AI', score: 8750, level: 'Enterprise' },
              { name: 'Nexus Secure', score: 6200, level: 'Standard' },
            ].map((shielder, i) => (
              <div key={shielder.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center font-black text-xs text-emerald-500">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{shielder.name}</p>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">{shielder.score} XP • {shielder.level}</p>
                </div>
                <Zap className={cn("w-4 h-4", i === 0 ? "text-yellow-500" : "opacity-10")} />
              </div>
            ))}
            <button className="w-full mt-4 py-3 rounded-xl border border-app-border text-[10px] font-black uppercase tracking-widest hover:bg-app-bg transition-all">
              View Full Leaderboard
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-500 text-black relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">Quest of the Day</p>
              <h3 className="text-lg font-black leading-tight mb-4">Complete 3 Voice Verifications without a retry</h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase bg-black/10 px-2 py-1 rounded">500 XP Reward</span>
                <Globe className="w-5 h-5 animate-spin-slow opacity-40" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
