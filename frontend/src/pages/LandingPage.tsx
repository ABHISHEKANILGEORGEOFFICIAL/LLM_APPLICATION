import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  Compass, 
  ChevronRight,
  Database
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#24231F] flex flex-col selection:bg-[#EAE5DC]">
      {/* Top Header */}
      <header className="border-b border-[#DDD7CC] bg-[#F7F5F0]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#A68155] flex items-center justify-center text-[#F7F5F0] shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-wider text-[#24231F]">
              SYNAPSE
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858078] border-l border-[#DDD7CC] pl-3 ml-1 hidden sm:inline-block">
              Intelligent Document Retrieval
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#858078]">
            <a href="#overview" className="hover:text-[#24231F] transition-colors">Overview</a>
            <a href="#features" className="hover:text-[#24231F] transition-colors">Features</a>
            <a href="#technology" className="hover:text-[#24231F] transition-colors">Technology</a>
            <a href="#workflow" className="hover:text-[#24231F] transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={onLaunch}
              className="px-5 py-2.5 rounded text-sm font-medium bg-[#24231F] text-[#F7F5F0] hover:bg-[#A68155] transition-all duration-200 shadow-sm flex items-center space-x-2"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Subtle decorative background nodes */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-[#EAE5DC] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#DDD7CC]/50 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EAE5DC] border border-[#DDD7CC] text-xs font-mono uppercase tracking-wider text-[#A68155] mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Research-Grade Document Intelligence Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-semibold tracking-tight text-[#24231F] leading-[1.12] mb-8"
          >
            Knowledge is everywhere.<br />
            <span className="italic font-normal text-[#A68155]">Understanding is everything.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-[#858078] max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Transform your documents into intelligent knowledge. Retrieve meaningful information, 
            discover contextual relationships, and get evidence-backed answers powered by lightweight language models.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onLaunch}
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#24231F] text-[#F7F5F0] font-medium text-base hover:bg-[#A68155] transition-all duration-200 shadow-md flex items-center justify-center space-x-3 group"
            >
              <span>Explore Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#technology"
              className="w-full sm:w-auto px-8 py-3.5 rounded border border-[#DDD7CC] bg-white/70 text-[#24231F] font-medium text-base hover:border-[#A68155] hover:bg-white transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Discover Technology</span>
            </a>
          </motion.div>

          {/* Luxury Interactive Semantic Node Visualizer */}
          <div className="mt-20 relative max-w-4xl mx-auto rounded-2xl border border-[#DDD7CC] bg-white/70 p-6 shadow-editorial-lg backdrop-blur-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDD7CC] text-xs font-mono text-[#858078]">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#72816B]"></span>
                <span className="font-semibold text-[#24231F]">SYNAPSE DENSE VECTOR SPACE</span>
              </span>
              <span>DIM: 384 • INNER PRODUCT (COSINE)</span>
            </div>

            <div className="py-12 px-4 relative flex flex-col md:flex-row items-center justify-around gap-6">
              {/* Node 1: Floating Document */}
              <div className="p-4 rounded-xl border border-[#DDD7CC] bg-[#F7F5F0] text-left w-64 shadow-sm hover:border-[#A68155] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#858078] uppercase">Input Document</span>
                  <BookOpen className="w-4 h-4 text-[#A68155]" />
                </div>
                <div className="text-xs font-serif font-semibold text-[#24231F] truncate">Research_Paper.pdf</div>
                <p className="text-[11px] text-[#858078] mt-1 line-clamp-2">
                  "Renewable energy systems and smart inverter stability challenges..."
                </p>
                <div className="mt-3 text-[10px] font-mono text-[#777B60]">Extracted: 2 Pages • Chunks: 4</div>
              </div>

              {/* Central Core */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-[#24231F] text-[#F7F5F0] flex flex-col items-center justify-center p-3 shadow-editorial border border-[#A68155]/40 animate-pulse">
                  <Cpu className="w-6 h-6 text-[#BA966D] mb-1" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-center text-[#DDD7CC]">
                    NLP Core
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#858078] mt-2">MiniLM-L6-v2</span>
              </div>

              {/* Node 2: Evidence-Backed Answer */}
              <div className="p-4 rounded-xl border border-[#DDD7CC] bg-[#F7F5F0] text-left w-64 shadow-sm hover:border-[#72816B] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#72816B] uppercase font-semibold">Grounded Answer</span>
                  <ShieldCheck className="w-4 h-4 text-[#72816B]" />
                </div>
                <div className="text-xs font-serif font-semibold text-[#24231F]">Context-Verified</div>
                <p className="text-[11px] text-[#858078] mt-1 line-clamp-2">
                  "Intermittent generation is the primary challenge due to diurnal meteorological cycles..."
                </p>
                <div className="mt-3 text-[10px] font-mono text-[#A68155]">Citation: Page 1 • Conf: 0.89</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#EAE5DC]/50 border-t border-[#DDD7CC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
              Platform Architecture
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#24231F] mt-3">
              Designed for Research Precision
            </h2>
            <p className="text-sm text-[#858078] mt-4">
              A carefully orchestrated pipeline engineered for zero hallucination, fast CPU vector retrieval, and verifiable citations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Semantic Understanding',
                desc: 'Understands contextual meaning beyond keyword matching using sentence transformers and dense 384-dimensional embeddings.',
                icon: Layers,
                tag: 'all-MiniLM-L6-v2',
              },
              {
                title: 'Intelligent Retrieval',
                desc: 'FAISS-powered vector search indexes document passages into an Inner Product cosine topology for sub-millisecond retrieval.',
                icon: Search,
                tag: 'FAISS IndexFlatIP',
              },
              {
                title: 'Evidence-Based Answers',
                desc: 'Generates answers grounded exclusively in retrieved context, complete with page citations and supporting snippet proofs.',
                icon: ShieldCheck,
                tag: 'Zero Hallucination',
              },
              {
                title: 'Lightweight Local AI',
                desc: 'Runs completely on standard consumer CPUs without requiring expensive cloud tokens, GPUs, or third-party paid API keys.',
                icon: Cpu,
                tag: 'FLAN-T5-small',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white/80 p-6 rounded-xl border border-[#DDD7CC] hover:border-[#A68155] transition-all duration-300 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#EAE5DC] flex items-center justify-center text-[#A68155] mb-5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-[#24231F] mb-2">{f.title}</h3>
                    <p className="text-xs text-[#858078] leading-relaxed mb-6">{f.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-[#DDD7CC]/70">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#777B60] bg-[#F7F5F0] px-2.5 py-1 rounded border border-[#DDD7CC]">
                      {f.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="workflow" className="py-24 bg-[#F7F5F0]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
              The Workflow
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#24231F] mt-3">
              From Document to Evidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Upload Documents',
                desc: 'Upload PDFs, Word DOCX, PPTX presentations, or plain text files with automatic duplicate validation.',
              },
              {
                step: '02',
                title: 'Extract & Chunk',
                desc: 'PyMuPDF and python-docx extract raw text preserving exact page and slide numbers across overlapping chunks.',
              },
              {
                step: '03',
                title: 'Generate Embeddings',
                desc: 'Sentence Transformers map text chunks into 384-dimensional dense vectors stored inside a persistent FAISS index.',
              },
              {
                step: '04',
                title: 'Retrieve & Answer',
                desc: 'Lightweight language models synthesize evidence-backed answers with strict page-level source citations.',
              },
            ].map((s, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl border border-[#DDD7CC] relative group hover:border-[#A68155] transition-colors">
                <div className="font-mono text-2xl font-bold text-[#A68155]/60 mb-3 group-hover:text-[#A68155] transition-colors">
                  {s.step}
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#24231F] mb-2">{s.title}</h4>
                <p className="text-xs text-[#858078] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-[#25241F] text-[#F7F5F0]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-[#BA966D]">
            Engineering Stack
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-12">
            Built on Research-Grade Foundations
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Sentence Transformers', sub: 'Dense Embeddings' },
              { name: 'all-MiniLM-L6-v2', sub: '384-dim Model' },
              { name: 'FAISS Engine', sub: 'Vector Similarity' },
              { name: 'google/flan-t5-small', sub: 'Local LLM' },
              { name: 'FastAPI Backend', sub: 'High-speed Async' },
              { name: 'PyMuPDF Engine', sub: 'Document Parsing' },
            ].map((t, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#2E2D27] border border-[#3E3C35] text-left">
                <div className="font-mono text-xs font-semibold text-[#DDD7CC]">{t.name}</div>
                <div className="text-[10px] font-mono text-[#858078] mt-1">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DDD7CC] bg-[#F7F5F0] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-[#A68155] flex items-center justify-center text-[#F7F5F0]">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif text-lg font-semibold text-[#24231F]">SYNAPSE</span>
            <span className="text-xs text-[#858078]">
              — Intelligent Document Retrieval & Question Answering Platform
            </span>
          </div>

          <div className="text-xs text-[#858078] font-mono">
            Empowered by Lightweight NLP • Fully Local & Private • 2026 Academic Edition
          </div>
        </div>
      </footer>
    </div>
  );
};
