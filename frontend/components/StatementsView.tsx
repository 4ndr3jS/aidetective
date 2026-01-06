import React, { useState } from 'react';
import { Statement, Suspect } from '../types';

interface StatementsViewProps {
  statements: Statement[];
  suspects: Suspect[];
  onAddStatement?: (statement: Partial<Statement>) => void;
  onUpdateStatement?: (statement: Statement) => void;
  onDeleteStatement?: (id: string) => void;
}

const StatementsView: React.FC<StatementsViewProps> = ({ statements, suspects, onAddStatement, onUpdateStatement, onDeleteStatement }) => {
  const [filterBySuspect, setFilterBySuspect] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'speaker'>('time');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatement, setNewStatement] = useState<Partial<Statement>>({ content: '', speakerId: '', speakerName: '', timestamp: '', context: '' });
  const [editForm, setEditForm] = useState<Partial<Statement>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddStatement && newStatement.content && newStatement.speakerId) {
      const suspect = suspects.find(s => s.id === newStatement.speakerId);
      onAddStatement({ ...newStatement, speakerName: suspect?.name || 'Unknown' });
      setNewStatement({ content: '', speakerId: '', speakerName: '', timestamp: '', context: '' });
      setIsAdding(false);
    }
  };

  const handleUpdate = (e: React.FormEvent, original: Statement) => {
    e.preventDefault();
    if (onUpdateStatement) {
      const suspect = suspects.find(s => s.id === editForm.speakerId);
      onUpdateStatement({
        ...original,
        ...editForm,
        speakerName: suspect?.name || original.speakerName
      } as Statement);
      setEditingId(null);
    }
  };

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
        <div>
          <h2 className="text-4xl font-serif text-white">Recorded Statements</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{statements.length} Testimonies</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all"
        >
          {isAdding ? 'Cancel' : '+ Add Statement'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-12 p-6 border border-white/10 bg-white/5 space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-white/40 mb-1">Speaker</label>
            <select
              className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
              value={newStatement.speakerId}
              onChange={e => setNewStatement({ ...newStatement, speakerId: e.target.value })}
            >
              <option value="">Select a suspect...</option>
              {suspects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-white/40 mb-1">Statement</label>
            <textarea
              className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none h-32"
              value={newStatement.content}
              onChange={e => setNewStatement({ ...newStatement, content: e.target.value })}
              placeholder="What did they say?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Timestamp/Context</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newStatement.timestamp}
                onChange={e => setNewStatement({ ...newStatement, timestamp: e.target.value })}
                placeholder="e.g. During initial interrogation"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-[#d4af37] text-black text-xs uppercase font-bold tracking-widest">
              Log Testimony
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 items-center border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-white/40">Filter:</span>
          <button
            onClick={() => setFilterBySuspect(null)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${filterBySuspect === null
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
              className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${filterBySuspect === suspect.id
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
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${sortBy === 'time'
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-white/40 hover:text-white/70'
              }`}
          >
            Time
          </button>
          <button
            onClick={() => setSortBy('speaker')}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${sortBy === 'speaker'
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
            const isEditingItem = editingId === statement.id;

            return (
              <div
                key={statement.id}
                className="group relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={() => { setEditingId(statement.id); setEditForm(statement); }}
                    className="p-1 hover:text-[#d4af37] text-white/40"
                  >
                    <span className="text-xs uppercase">Edit</span>
                  </button>
                  {onDeleteStatement && (
                    <button
                      onClick={() => onDeleteStatement(statement.id)}
                      className="p-1 hover:text-red-500 text-white/40"
                    >
                      <span className="text-xs uppercase">Delete</span>
                    </button>
                  )}
                </div>

                {isEditingItem ? (
                  <form onSubmit={(e) => handleUpdate(e, statement)} className="space-y-3 relative z-10">
                    <select
                      className="w-full bg-white/5 border border-white/10 p-2 text-white"
                      value={editForm.speakerId}
                      onChange={(e) => setEditForm({ ...editForm, speakerId: e.target.value })}
                    >
                      {suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <textarea className="w-full bg-white/5 border border-white/10 p-2 text-white text-xs h-32" value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} />
                    <input className="w-full bg-white/5 border border-white/10 p-2 text-white" value={editForm.timestamp} onChange={e => setEditForm({ ...editForm, timestamp: e.target.value })} />

                    <div className="flex justify-between items-center">
                      <button type="button" onClick={() => setEditingId(null)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                      <button type="submit" className="text-xs text-[#d4af37] border border-[#d4af37] px-3 py-1">Save</button>
                    </div>
                  </form>
                ) : (
                  <>
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
                  </>
                )}
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

