import React, { useState } from 'react';
import { InvestigationCase, AccusationResult } from '../types';
import { aiService } from '../services/aiService';
import AccusationSlides from './AccusationSlides';

interface AccusationViewProps {
  activeCase: InvestigationCase;
  onPresentCase?: (suspectId: string, reasoning: string) => void;
}

const AccusationView: React.FC<AccusationViewProps> = ({ activeCase, onPresentCase }) => {
  const [status, setStatus] = useState<'entry' | 'analyzing' | 'reveal' | 'submitted'>('entry');
  const [result, setResult] = useState<AccusationResult | null>(null);

  const handleGetKiller = async () => {
    setStatus('analyzing');
    try {
      const accusationResult = await aiService.generateAccusation(activeCase);
      setResult(accusationResult);
      setStatus('reveal');
    } catch (error) {
      console.error("Failed to generate accusation:", error);
      // Fallback or error state could go here
      setStatus('entry');
    }
  };

  const handleComplete = () => {
    if (result && onPresentCase) {
      // Pass the final result back to the parent to close the case
      onPresentCase(result.killer_reveal.suspect_id, `AI Analysis: ${result.killer_reveal.reveal_line}`);
      setStatus('submitted');
    }
  };

  if (status === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-1000">
        <h2 className="text-6xl font-serif text-[#d4af37] mb-6">Case Closed</h2>
        <p className="text-xl text-white/60 max-w-lg text-center leading-relaxed font-serif italic mb-12">
          "The truth is like a donut, my friend. It has a hole in the center, and only when we fill that hole with logic can we see the whole shape."
        </p>
        <button
          onClick={() => window.location.reload()} // Simple way to reset or go back for this demo
          className="text-white/40 hover:text-white uppercase tracking-widest text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (status === 'analyzing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin mb-8" />
        <h2 className="text-2xl font-serif text-white mb-2 animate-pulse">Benoit Blanc is reviewing the evidence...</h2>
        <p className="text-white/40 text-sm uppercase tracking-widest">Consulting the archives</p>
      </div>
    );
  }

  if (status === 'reveal' && result) {
    return <AccusationSlides result={result} onComplete={handleComplete} />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-6xl md:text-7xl font-serif text-white mb-4">The Accusation</h1>

        <div className="space-y-4">
          <p className="text-xl text-white/60 font-serif italic max-w-lg mx-auto leading-relaxed">
            "We have arrived at the terminus of our little journey. The facts are plain, the motives laid bare."
          </p>
          <div className="h-px w-32 bg-[#d4af37]/30 mx-auto my-8" />
          <p className="text-red-400/80 text-sm uppercase tracking-widest font-semibold">
            Warning: This will finalize the investigation
          </p>
        </div>

        <button
          onClick={handleGetKiller}
          className="group relative px-12 py-6 bg-transparent overflow-hidden rounded-sm transition-all hover:scale-105"
        >
          <div className="absolute inset-0 border border-[#d4af37]/30 group-hover:border-[#d4af37] transition-colors" />
          <div className="absolute inset-0 bg-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative text-lg uppercase tracking-[0.3em] font-bold text-[#d4af37] group-hover:text-white transition-colors">
            Get the Killer
          </span>
        </button>

        <p className="text-white/20 text-xs mt-12 font-serif">
          Benoit Blanc will analyze the entire case file
        </p>
      </div>
    </div>
  );
};

export default AccusationView;
