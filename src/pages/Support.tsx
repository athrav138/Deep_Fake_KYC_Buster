import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HelpCircle, 
  MessageCircle, 
  FileText, 
  ShieldQuestion, 
  Search, 
  ArrowRight,
  ExternalLink,
  LifeBuoy,
  Book,
  Mail,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { q: "How accurate is the deepfake detection?", a: "Our AI model uses multi-modal analysis (biometric, temporal, and spatial) providing 99.8% accuracy against current consumer-grade deepfakes." },
    { q: "What documents are supported?", a: "Currently we support Indian Aadhaar cards, with support for PAN, Passport, and Voter ID coming in the next update." },
    { q: "Is my biometric data stored?", a: "No. We process data in real-time. For enterprise users, data is encrypted and stored in private vaults according to local regulations." },
    { q: "Why did my liveness test fail?", a: "Liveness can fail due to poor lighting, low camera quality, or background motion. Ensure you are in a well-lit, static environment." }
  ];

  const categories = [
    { label: 'Getting Started', icon: Zap, count: 12 },
    { label: 'Verification Process', icon: ShieldQuestion, count: 8 },
    { label: 'Security & Privacy', icon: FileText, count: 15 },
    { label: 'Account & Billing', icon: Book, count: 5 },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative p-12 rounded-[32px] bg-app-card border border-app-border overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 backdrop-blur-3xl -z-10" />
        <div className="bg-emerald-500/10 p-4 rounded-3xl mb-6">
          <LifeBuoy className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4">How can we <span className="text-emerald-500 font-serif italic">help</span> you?</h1>
        <p className="text-app-text/60 max-w-lg mb-8">Search our knowledge base or connect with a security expert for immediate assistance.</p>
        
        <div className="w-full max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
          <input 
            type="text"
            placeholder="Search for articles, guides, or troubleshooting..."
            className="w-full bg-app-bg border border-app-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={cat.label}
            className="p-6 rounded-3xl bg-app-card border border-app-border hover:border-emerald-500/30 transition-all group cursor-pointer"
          >
            <cat.icon className="w-8 h-8 text-emerald-500 mb-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            <h3 className="font-bold text-sm mb-1">{cat.label}</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-40">{cat.count} Articles</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldQuestion className="w-5 h-5 text-emerald-500" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={faq.q} className="group bg-app-card border border-app-border rounded-2xl overflow-hidden">
                <summary className="p-5 flex items-center justify-between cursor-pointer hover:bg-emerald-500/5 transition-all list-none">
                  <span className="font-bold text-sm">{faq.q}</span>
                  <ArrowRight className="w-4 h-4 opacity-40 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-5 pt-0 text-app-text/60 text-sm border-t border-app-border/50 animate-in slide-in-from-top-1">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-8 rounded-3xl bg-app-card border border-app-border space-y-6">
            <h2 className="text-xl font-bold">Direct Support</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-500 text-black font-bold group hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5" />
                  <span>Live Chat</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-app-border hover:bg-emerald-500/5 transition-all group">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 opacity-40" />
                  <span className="font-medium text-sm">Email Support</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-20" />
              </button>
            </div>
            <div className="pt-6 border-t border-app-border">
              <p className="text-[10px] uppercase tracking-widest font-black text-center opacity-40">Average Response Time: 5 mins</p>
            </div>
          </div>
          
          <div className="p-8 rounded-3xl border border-dashed border-app-border flex flex-col items-center text-center space-y-4">
            <Book className="w-12 h-12 opacity-10" />
            <h3 className="font-bold">API Documentation</h3>
            <p className="text-xs opacity-50">Deep dive into our SDKs and REST APIs to build your own custom identity workflows.</p>
            <button className="text-emerald-500 text-xs font-bold hover:underline">Explore Developer Hub →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
