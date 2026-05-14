import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  History, 
  Video, 
  Users, 
  MessageCircle, 
  HelpCircle,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SidebarProps {
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'History', icon: History },
    { to: '/video-lab', label: 'Video Lab', icon: Video },
    { to: '/community', label: 'Community', icon: Users, badge: 'New' },
  ];

  const secondaryItems = [
    { to: '/support', label: 'Support', icon: HelpCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="hidden lg:flex flex-col border-r border-app-border bg-app-bg h-screen sticky top-0 transition-all duration-500 overflow-hidden"
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="bg-emerald-500 p-2 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-black" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-black tracking-tighter"
            >
              KYC<span className="text-emerald-500">SHIELD</span>
            </motion.span>
          )}
        </Link>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-app-card rounded-lg transition-colors border border-transparent hover:border-app-border"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto scrollbar-hide">
        <div>
          {!isCollapsed && <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-app-text/30 mb-4 ml-2">Main Menu</p>}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-500 font-bold" 
                      : "text-app-text/60 hover:text-app-text hover:bg-app-card"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-emerald-500" : "opacity-60")} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                    />
                  )}
                  {item.badge && !isCollapsed && (
                    <span className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          {!isCollapsed && <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-app-text/30 mb-4 ml-2">Support</p>}
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-app-text/60 hover:text-app-text hover:bg-app-card"
              >
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110 opacity-60" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User Area */}
      <div className="p-4 border-t border-app-border">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl bg-app-card/50 border border-app-border/50",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-black shrink-0 text-sm">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.fullName}</p>
              <p className="text-[10px] opacity-40 truncate uppercase tracking-widest">{user.role}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
