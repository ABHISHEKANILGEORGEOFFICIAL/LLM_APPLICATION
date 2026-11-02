import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Layers, 
  Sliders, 
  Loader2 
} from 'lucide-react';
import { api } from '../services/api';
import { SettingsConfig } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsConfig>({
    chunk_size: 500,
    chunk_overlap: 80,
    top_k: 4,
    similarity_threshold: 0.35,
    embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
    generation_model: 'google/flan-t5-small',
    temperature: 0.2,
    use_flan_t5: true,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#A68155]" />
        <span className="font-mono text-xs text-[#858078]">Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#DDD7CC] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#A68155] font-semibold">
            System Tuning & Architecture
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#24231F] mt-1">
            Engine Settings
          </h1>
          <p className="text-sm text-[#858078] mt-1">
            Configure chunking hyper-parameters, vector similarity thresholds, and CPU inference execution options.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-1.5 text-xs font-mono text-[#72816B] bg-[#72816B]/10 px-3 py-1.5 rounded-lg border border-[#72816B]/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parameters Updated</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Information Block */}
        <div className="p-6 rounded-2xl border border-[#DDD7CC] bg-white/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#DDD7CC]">
            <Cpu className="w-4 h-4 text-[#A68155]" />
            <h3 className="font-serif text-base font-semibold text-[#24231F]">
              NLP Model Architecture
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-[#858078] uppercase text-[10px] block mb-1">
                Embedding Model
              </label>
              <input
                type="text"
                disabled
                value={settings.embedding_model}
                className="w-full p-2.5 rounded-lg border border-[#DDD7CC] bg-[#EAE5DC]/30 text-[#24231F] font-semibold cursor-not-allowed"
              />
              <span className="text-[10px] text-[#777B60] mt-1 block">
                384 dimensions • Local PyTorch & SentenceTransformers
              </span>
            </div>

            <div>
              <label className="text-[#858078] uppercase text-[10px] block mb-1">
                Language Model (Inference)
              </label>
              <input
                type="text"
                disabled
                value={settings.generation_model}
                className="w-full p-2.5 rounded-lg border border-[#DDD7CC] bg-[#EAE5DC]/30 text-[#24231F] font-semibold cursor-not-allowed"
              />
              <span className="text-[10px] text-[#777B60] mt-1 block">
                60M parameters • CPU execution without GPU dependency
              </span>
            </div>
          </div>
        </div>

        {/* Retrieval & Chunking Hyperparameters */}
        <div className="p-6 rounded-2xl border border-[#DDD7CC] bg-white/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#DDD7CC]">
            <Sliders className="w-4 h-4 text-[#A68155]" />
            <h3 className="font-serif text-base font-semibold text-[#24231F]">
              Retrieval & Chunking Hyper-parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            {/* Chunk Size */}
            <div>
              <div className="flex items-center justify-between text-[#858078] uppercase text-[10px] mb-2">
                <span>Chunk Size (Approx. Characters):</span>
                <span className="text-[#24231F] font-semibold">{settings.chunk_size}</span>
              </div>
              <input
                type="range"
                min={200}
                max={1500}
                step={50}
                value={settings.chunk_size}
                onChange={(e) => setSettings({ ...settings, chunk_size: Number(e.target.value) })}
                className="w-full accent-[#A68155]"
              />
              <span className="text-[10px] text-[#858078] mt-1 block">
                Higher values preserve paragraph context; lower values increase precision.
              </span>
            </div>

            {/* Chunk Overlap */}
            <div>
              <div className="flex items-center justify-between text-[#858078] uppercase text-[10px] mb-2">
                <span>Chunk Overlap (Characters):</span>
                <span className="text-[#24231F] font-semibold">{settings.chunk_overlap}</span>
              </div>
              <input
                type="range"
                min={20}
                max={300}
                step={10}
                value={settings.chunk_overlap}
                onChange={(e) => setSettings({ ...settings, chunk_overlap: Number(e.target.value) })}
                className="w-full accent-[#A68155]"
              />
              <span className="text-[10px] text-[#858078] mt-1 block">
                Prevents splitting semantic ideas across adjacent chunks.
              </span>
            </div>

            {/* Top-K Passages */}
            <div>
              <div className="flex items-center justify-between text-[#858078] uppercase text-[10px] mb-2">
                <span>Top-K Retrieved Passages:</span>
                <span className="text-[#24231F] font-semibold">{settings.top_k}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={settings.top_k}
                onChange={(e) => setSettings({ ...settings, top_k: Number(e.target.value) })}
                className="w-full accent-[#A68155]"
              />
              <span className="text-[10px] text-[#858078] mt-1 block">
                Number of highest-ranking passages passed to the language model.
              </span>
            </div>

            {/* Similarity Cutoff */}
            <div>
              <div className="flex items-center justify-between text-[#858078] uppercase text-[10px] mb-2">
                <span>Minimum Similarity Threshold:</span>
                <span className="text-[#24231F] font-semibold">{settings.similarity_threshold}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={0.8}
                step={0.05}
                value={settings.similarity_threshold}
                onChange={(e) => setSettings({ ...settings, similarity_threshold: Number(e.target.value) })}
                className="w-full accent-[#A68155]"
              />
              <span className="text-[10px] text-[#858078] mt-1 block">
                Cosine cutoff for pruning irrelevant candidates.
              </span>
            </div>
          </div>
        </div>

        {/* Database & Persistence Info */}
        <div className="p-6 rounded-2xl border border-[#DDD7CC] bg-white/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#DDD7CC]">
            <Database className="w-4 h-4 text-[#A68155]" />
            <h3 className="font-serif text-base font-semibold text-[#24231F]">
              Persistence & Vector Store
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono text-[#858078]">
            <div className="flex justify-between py-1 border-b border-[#DDD7CC]/50">
              <span>SQL Database:</span>
              <span className="text-[#24231F] font-medium">SQLite with SQLAlchemy ORM (synapse.db)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#DDD7CC]/50">
              <span>Vector Database:</span>
              <span className="text-[#24231F] font-medium">FAISS IndexFlatIP (Persisted to disk)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Hardware Acceleration:</span>
              <span className="text-[#72816B] font-medium">Active on Consumer CPU (No GPU Required)</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded bg-[#24231F] text-[#F7F5F0] text-xs font-medium hover:bg-[#A68155] disabled:opacity-50 transition-all flex items-center space-x-2 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
