import React, { useState } from 'react';
import { Statement, Suspect } from '../types';

interface StatementsViewProps {
  statements: Statement[];
  suspects: Suspect[];
}

const StatementsView: React.FC<StatementsViewProps> = ({ statements, suspects }) => {
  const [filterBySuspect, setFilterBySuspect] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'speaker'>('time');

  const filteredStatements = filterBySuspect
    ? statements.filter(s => s.speakerId === filterBySuspect)
    : statements;

  const sortedStatements = [...filteredStatements].sort((a, b) => {
    if (sortBy === 'time') {
      return a.timestamp.localeCompare(b.timestamp);
    } else {
      return a.speakerName.localeCompare(b.speakerName);
    }
  });

  const statementsBySpeaker = suspects.map(suspect => ({
    suspect,
    statements: statements.filter(st => st.speakerId === suspect.id)
  }));

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-4xl font-serif text-white">Recorded Statements</h2>
        <span className="text-xs text-white/30 uppercase tracking-widest">{statements.length} Testimonies</span>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 items-center border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-white/40">Filter:</span>
          <button
            onClick={() => setFilterBySuspect(null)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${
              filterBySuspect === null
                ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37]'
                : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            All Speakers
          </button>
          {suspects.map(suspect => (
            <button
              key={suspect.id}
              onClick={() => setFilterBySuspect(suspect.id)}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${
                filterBySuspect === suspect.id
                  ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37]'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {suspect.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] uppercase tracking-widest text-white/40">Sort:</span>
          <button
            onClick={() => setSortBy('time')}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${
              sortBy === 'time'
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/40 hover:text-white/70'
            }`}
          >
            Time
          </button>
          <button
            onClick={() => setSortBy('speaker')}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${
              sortBy === 'speaker'
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/40 hover:text-white/70'
            }`}
          >
            Speaker
          </button>
        </div>
      </div>

      {/* Statements List */}
      <div className="space-y-6">
        {sortedStatements.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10">
            <p className="text-sm text-white/30 uppercase tracking-widest">No statements found</p>
          </div>
        ) : (
          sortedStatements.map((statement) => {
            const suspect = suspects.find(s => s.id === statement.speakerId);
            return (
              <div
                key={statement.id}
                className="group relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Speaker Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {suspect && (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                        <img
                          src={suspect.imageUrl}
                          alt={suspect.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-serif text-white mb-1">{statement.speakerName}</h3>
                      {suspect && (
                        <span className="text-[10px] uppercase tracking-widest text-[#d4af37]">{suspect.role}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-white/40 mb-1">{statement.timestamp}</div>
                    {statement.context && (
                      <div className="text-[10px] text-white/20 uppercase tracking-widest">{statement.context}</div>
                    )}
                  </div>
                </div>

                {/* Statement Content */}
                <div className="relative pl-6 border-l-2 border-[#d4af37]/30">
                  <span className="text-white/20 text-3xl absolute -left-2 top-0 font-serif">"</span>
                  <p className="text-white/70 text-base leading-relaxed italic relative z-10 pl-4">
                    {statement.content}
                  </p>
                  <span className="text-white/20 text-3xl absolute -bottom-4 right-4 font-serif">"</span>
                </div>

                {/* Comparison Hint */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <button className="text-[10px] uppercase tracking-widest text-white/30 hover:text-[#d4af37] transition-colors">
                    Compare with other statements →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Side-by-side Comparison View */}
      {statementsBySpeaker.some(group => group.statements.length > 0) && (
        <div className="mt-16 pt-12 border-t border-white/10">
          <h3 className="text-2xl font-serif text-white mb-8">Statements by Speaker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statementsBySpeaker.map(({ suspect, statements: speakerStatements }) => {
              if (speakerStatements.length === 0) return null;
              return (
                <div key={suspect.id} className="border border-white/5 p-6 bg-[#0a0a0a]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                      <img
                        src={suspect.imageUrl}
                        alt={suspect.name}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif text-white">{suspect.name}</h4>
                      <span className="text-[9px] text-white/40 uppercase">{speakerStatements.length} statements</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {speakerStatements.map(st => (
                      <div key={st.id} className="text-xs text-white/50 italic border-l border-white/10 pl-3">
                        "{st.content}"
                        <div className="text-[9px] text-white/20 mt-1 font-mono">{st.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementsView;

