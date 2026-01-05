
import React, { useState, useRef, useEffect } from 'react';
import { InvestigationCase, Message } from '../types';
import { detectiveAI } from '../services/geminiService';

interface AIAssistantProps {
  activeCase: InvestigationCase;
  onAnalyzeTimeline?: () => void;
  onAnalyzeSuspect?: (suspectId: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ activeCase, onAnalyzeTimeline, onAnalyzeSuspect }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome',
      role: 'assistant', 
      content: "Well now, what have we here? A tangled web of intentions. I'm Elias Thorne, at your service. Let's dig through the dirt and find the gems of truth, shall we?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await detectiveAI.analyzeCase(activeCase, messageToSend);
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: "Pardon me, I seem to have lost my spectacles. Could you repeat that inquiry?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = async (type: 'timeline' | 'suspect' | 'theory', id?: string) => {
    if (type === 'timeline') {
      if (onAnalyzeTimeline) onAnalyzeTimeline();
      await handleSend("Analyze the timeline for any inconsistencies, gaps, or suspicious patterns.");
    } else if (type === 'suspect' && id) {
      if (onAnalyzeSuspect) onAnalyzeSuspect(id);
      const suspect = activeCase.suspects.find(s => s.id === id);
      if (suspect) {
        await handleSend(`Analyze suspect ${suspect.name}. Examine their alibi, motive, and any statements they've made.`);
      }
    } else if (type === 'theory' && id) {
      const theory = activeCase.theories.find(t => t.id === id);
      if (theory) {
        await handleSend(`Challenge this theory: "${theory.title} - ${theory.content}". Find any flaws or contradictions.`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-gradient-to-r from-transparent to-white/[0.02]">
        <div className="w-12 h-12 rounded-full border border-[#d4af37] overflow-hidden flex-shrink-0 relative">
          <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
             <span className="text-xl font-serif text-[#d4af37]">T</span>
          </div>
          <img src="https://picsum.photos/seed/detective/100/100" alt="Detective Thorne" className="w-full h-full object-cover opacity-60 grayscale mix-blend-multiply" />
        </div>
        <div>
          <h3 className="text-sm font-serif text-white font-medium">Elias Thorne</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-white/30">Analyzing Records</span>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-6 pt-4 pb-2 border-b border-white/5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickPrompt('timeline')}
            className="px-3 py-1.5 text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-[#d4af37]/30 transition-all"
          >
            Analyze Timeline
          </button>
          {activeCase.suspects.slice(0, 2).map(suspect => (
            <button
              key={suspect.id}
              onClick={() => handleQuickPrompt('suspect', suspect.id)}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-[#d4af37]/30 transition-all"
            >
              Analyze {suspect.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 mb-2">
              {m.role === 'assistant' ? 'Detective Thorne' : 'Investigator'}
            </span>
            <div className={`max-w-[85%] p-4 text-sm leading-relaxed ${
              m.role === 'assistant' 
              ? 'bg-[#121212] border border-white/5 text-white/70 italic font-serif' 
              : 'bg-[#d4af37]/10 border border-[#d4af37]/20 text-white/80'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start animate-pulse">
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 mb-2">Detective Thorne is thinking...</span>
            <div className="bg-white/5 border border-white/5 p-4 flex gap-1">
              <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
              <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full opacity-60" />
              <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full opacity-30" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask for an analysis..."
            className="w-full bg-white/5 border border-white/10 p-4 pr-12 text-sm text-white/80 focus:border-[#d4af37] outline-none h-24 resize-none transition-all placeholder:text-white/20"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute bottom-4 right-4 text-white/30 hover:text-[#d4af37] disabled:opacity-0 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[8px] uppercase tracking-widest text-white/20">
          <span>Shift+Enter for new line</span>
          <div className="flex gap-2">
            <button className="hover:text-white transition-colors">Voice Link</button>
            <span>|</span>
            <button className="hover:text-white transition-colors">History</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
