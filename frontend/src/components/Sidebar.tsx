import React from 'react';
import { 
  FileText, 
  Search, 
  MessageSquare, 
  BarChart3, 
  Settings as SettingsIcon, 
  Layers, 
  UploadCloud, 
  FlaskConical, 
  Compass, 
  Sparkles,
  Cpu,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  systemStatus: {
    healthy: boolean;
    vectors: number;
    embeddingModel: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, systemStatus }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Compass },
    { id: 'upload', label: 'Document Upload', icon: UploadCloud },
    { id: 'library', label: 'My Documents', icon: FileText },
    { id: 'search', label: 'Semantic Search', icon: Search },
    { id: 'qa', label: 'Ask AI', icon: MessageSquare },
    { id: 'research', label: 'Research & Eval', icon: FlaskConical },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#25241F] text-[#EAE5DC] flex flex-col justify-between border-r border-[#383630] select-none h-screen sticky top-0 z-30">
      <div>
        {/* Logo and Brand */}
        <div 
          onClick={() => setCurrentPage('landing')} 
          className="p-6 cursor-pointer border-b border-[#383630]/60 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#A68155] flex items-center justify-center text-[#F7F5F0] shadow-sm">
              <Layers className="w-5 h-5 text-[#F7F5F0]" />
            </div>
            <div>
              <div className="font-serif text-xl tracking-wider text-[#F7F5F0] font-semibold group-hover:text-[#BA966D] transition-colors">
                SYNAPSE
              </div>
              <div className="text-[10px] tracking-widest text-[#858078] uppercase font-mono">
                Document Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#858078] px-3 mb-2 font-semibold">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#A68155] text-[#F7F5F0] font-medium shadow-sm'
                    : 'text-[#DDD7CC]/80 hover:text-[#F7F5F0] hover:bg-[#32302A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F7F5F0]' : 'text-[#858078] group-hover:text-[#DDD7CC]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status and Engine info footer */}
      <div className="p-4 border-t border-[#383630]/70 bg-[#1F1E1A] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#858078] font-mono text-[11px] uppercase">Engine Status</span>
          <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#72816B]">
            <span className="w-2 h-2 rounded-full bg-[#72816B] animate-pulse"></span>
            <span>{systemStatus.healthy ? 'OPERATIONAL' : 'OFFLINE'}</span>
          </span>
        </div>

        <div className="bg-[#2A2924] p-2.5 rounded border border-[#3E3C35] text-[11px] font-mono text-[#858078] space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-[#A68155]" />
              <span>Vectors:</span>
            </span>
            <span className="text-[#DDD7CC] font-semibold">{systemStatus.vectors} indexed</span>
          </div>
          <div className="text-[10px] truncate text-[#858078]/90">
            MiniLM-L6-v2 + Flan-T5
          </div>
        </div>

        <div className="text-[10px] text-[#858078] text-center font-mono">
          Synapse v1.0 • Academic Edition
        </div>
      </div>
    </aside>
  );
};
