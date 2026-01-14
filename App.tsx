
import React, { useState, useMemo, useEffect } from 'react';
import { n4Data } from './data/n4Data';
import { TabType, Kanji, Vocabulary, Grammar, FilterType } from './types';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import Modal from './components/Modal';
import { getGrammarExplanation, getMnemonicStory } from './services/geminiService';

const NavButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; icon: string }> = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${
      active 
        ? 'bg-slate-700 text-white shadow-lg' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
    }`}
  >
    <span className="text-lg">{icon}</span>
    {children}
  </button>
);

const FilterButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
      active ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
    }`}
  >
    {children}
  </button>
);

const KanjiCard: React.FC<{ kanji: Kanji; isMastered: boolean; onClick: () => void; onToggle: (e: React.MouseEvent) => void }> = ({ kanji, isMastered, onClick, onToggle }) => (
  <div 
    onClick={onClick}
    className={`relative bg-slate-800/50 border ${isMastered ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-slate-700'} rounded-2xl p-6 text-center transition-all cursor-pointer hover:scale-[1.02] group`}
  >
    <button 
      onClick={onToggle}
      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isMastered ? 'bg-green-500 text-white' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-600'}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
    </button>
    <div className={`font-jp text-5xl font-black mb-3 transition-transform ${isMastered ? 'text-green-400' : 'text-yellow-400 group-hover:scale-110'}`}>
      {kanji.char}
    </div>
    <div className="text-slate-400 text-sm font-medium line-clamp-1">{kanji.meaning}</div>
  </div>
);

const VocabCard: React.FC<{ vocab: Vocabulary; isMastered: boolean; onToggle: () => void }> = ({ vocab, isMastered, onToggle }) => (
  <div className={`bg-slate-800/50 border ${isMastered ? 'border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.05)]' : 'border-slate-700'} rounded-2xl p-5 hover:border-pink-500/50 transition-all flex justify-between items-start group`}>
    <div>
      <div className={`font-jp text-2xl font-bold transition-colors ${isMastered ? 'text-green-400' : 'text-pink-400 group-hover:text-pink-300'}`}>{vocab.jp}</div>
      <div className="font-jp text-slate-400 text-sm mb-2">{vocab.reading}</div>
      <div className="text-slate-100">{vocab.meaning}</div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isMastered ? 'bg-green-500 text-white' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-600'}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
    </button>
  </div>
);

const GrammarCard: React.FC<{ grammar: Grammar; isMastered: boolean; onToggle: () => void }> = ({ grammar, isMastered, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async () => {
    if (explanation) return;
    setLoading(true);
    const text = await getGrammarExplanation(grammar.pattern);
    setExplanation(text || "Тайлбар олдсонгүй.");
    setLoading(false);
  };

  return (
    <div className={`bg-slate-800/50 border ${isMastered ? 'border-green-500/30' : 'border-slate-700'} rounded-3xl p-6 flex flex-col h-full relative group`}>
      <button 
        onClick={onToggle}
        className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isMastered ? 'bg-green-500 text-white' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-600'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
      </button>

      <div className={`font-jp text-2xl font-black mb-2 transition-colors ${isMastered ? 'text-green-400' : 'text-cyan-400 group-hover:text-cyan-300'}`}>{grammar.pattern}</div>
      <div className="text-lg font-semibold text-slate-300 mb-6">{grammar.meaning}</div>
      
      <div className="bg-slate-900/50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-6">
        <div className="font-jp text-slate-100 mb-1">{grammar.example}</div>
        <div className="text-slate-500 text-sm italic">{grammar.exampleMn}</div>
      </div>

      <button 
        onClick={() => { setIsExpanded(!isExpanded); if (!isExpanded) fetchExplanation(); }}
        className="text-xs font-bold uppercase tracking-widest text-cyan-500 hover:text-cyan-400 flex items-center gap-1 mt-auto transition-colors"
      >
        {isExpanded ? 'Тайлбар нуух' : 'Дэлгэрэнгүй тайлбар (AI)'}
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 animate-fade-in">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
               <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
               <span className="text-xs font-bold">AI тайлбарлаж байна...</span>
            </div>
          ) : (
            <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/30 p-4 rounded-xl">
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const KanjiDetail: React.FC<{ kanji: Kanji; aiLoading: boolean; aiContent: string | null; onAskAi: () => void }> = ({ kanji, aiLoading, aiContent, onAskAi }) => (
  <div>
    <div className="flex items-start gap-6 mb-8">
      <div className="font-jp text-8xl font-black text-yellow-400 bg-slate-800 p-4 rounded-3xl">{kanji.char}</div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-white mb-2">{kanji.meaning}</h2>
        <div className="flex gap-2">
          <span className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{kanji.strokes} Strokes</span>
          <span className="bg-pink-500/10 border border-pink-500/50 text-pink-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Set {kanji.set}</span>
        </div>
        <div className="mt-6 space-y-3">
          <div>
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-1">On-reading</span>
            <div className="flex flex-wrap gap-2">{kanji.on.map(r => <span key={r} className="font-jp text-lg bg-slate-800 px-3 py-1 rounded-lg">{r}</span>)}</div>
          </div>
          <div>
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-1">Kun-reading</span>
            <div className="flex flex-wrap gap-2">{kanji.kun.map(r => <span key={r} className="font-jp text-lg bg-slate-800 px-3 py-1 rounded-lg">{r}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-slate-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-cyan-400">AI Туслах</h3>
        <button onClick={onAskAi} disabled={aiLoading} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20">
          {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "💡 Ханз цээжлэх арга"}
        </button>
      </div>
      {aiContent && <div className="bg-slate-800/50 p-6 rounded-2xl text-slate-300 italic leading-relaxed">{aiContent}</div>}
      {!aiContent && !aiLoading && <p className="text-slate-500 text-sm text-center py-4 italic">Ханз цээжлэх сонирхолтой түүх асуугаарай.</p>}
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('kanji');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);

  // Mastery state
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('n4_mastered_ids');
    if (saved) {
      try {
        setMasteredIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Mastery load error:", e);
      }
    }
  }, []);

  // Save to LocalStorage
  const toggleMastery = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newMastered = new Set(masteredIds);
    if (newMastered.has(id)) {
      newMastered.delete(id);
    } else {
      newMastered.add(id);
    }
    setMasteredIds(newMastered);
    localStorage.setItem('n4_mastered_ids', JSON.stringify(Array.from(newMastered)));
  };

  const filteredKanji = useMemo(() => {
    return n4Data.kanji.filter(k => {
      const matchesSearch = k.char.includes(search) || k.meaning.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'mastered') return masteredIds.has(k.id);
      if (filter === 'learning') return !masteredIds.has(k.id);
      return true;
    });
  }, [search, filter, masteredIds]);

  const filteredVocab = useMemo(() => {
    return n4Data.vocabulary.filter(v => {
      const matchesSearch = v.jp.includes(search) || v.reading.includes(search) || v.meaning.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'mastered') return masteredIds.has(v.id);
      if (filter === 'learning') return !masteredIds.has(v.id);
      return true;
    });
  }, [search, filter, masteredIds]);

  const filteredGrammar = useMemo(() => {
    return n4Data.grammar.filter(g => {
      const matchesSearch = g.pattern.includes(search) || g.meaning.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'mastered') return masteredIds.has(g.id);
      if (filter === 'learning') return !masteredIds.has(g.id);
      return true;
    });
  }, [search, filter, masteredIds]);

  const stats = {
    kanji: n4Data.kanji.length,
    vocab: n4Data.vocabulary.length,
    grammar: n4Data.grammar.length,
    masteredCount: masteredIds.size
  };

  const kanjiSets = useMemo(() => {
    const sets: { [key: number]: Kanji[] } = {};
    filteredKanji.forEach(k => {
      if (!sets[k.set]) sets[k.set] = [];
      sets[k.set].push(k);
    });
    return Object.entries(sets).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredKanji]);

  const vocabSets = useMemo(() => {
    const sets: { [key: number]: Vocabulary[] } = {};
    filteredVocab.forEach(v => {
      if (!sets[v.set]) sets[v.set] = [];
      sets[v.set].push(v);
    });
    return Object.entries(sets).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredVocab]);

  const grammarSets = useMemo(() => {
    const sets: { [key: number]: Grammar[] } = {};
    filteredGrammar.forEach(g => {
      if (!sets[g.set]) sets[g.set] = [];
      sets[g.set].push(g);
    });
    return Object.entries(sets).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredGrammar]);

  const handleKanjiClick = async (kanji: Kanji) => {
    setSelectedKanji(kanji);
    setAiContent(null);
  };

  const askAiForMnemonic = async () => {
    if (!selectedKanji) return;
    setAiLoading(true);
    const story = await getMnemonicStory(selectedKanji.char);
    setAiContent(story || "Түүх олдсонгүй.");
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#0f0f23]">
      <Header stats={stats} />

      <nav className="max-w-6xl mx-auto px-4 mt-8 flex flex-col gap-4">
        <div className="flex bg-slate-800/40 p-1.5 rounded-2xl gap-2 overflow-x-auto hide-scrollbar">
          <NavButton active={activeTab === 'kanji'} onClick={() => setActiveTab('kanji')} icon="📝">Канжи</NavButton>
          <NavButton active={activeTab === 'vocabulary'} onClick={() => setActiveTab('vocabulary')} icon="📚">Үгс</NavButton>
          <NavButton active={activeTab === 'grammar'} onClick={() => setActiveTab('grammar')} icon="📖">Дүрэм</NavButton>
          <NavButton active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon="📊">Статистик</NavButton>
        </div>

        {activeTab !== 'progress' && (
          <div className="flex gap-2">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Бүгд</FilterButton>
            <FilterButton active={filter === 'learning'} onClick={() => setFilter('learning')}>Сураагүй</FilterButton>
            <FilterButton active={filter === 'mastered'} onClick={() => setFilter('mastered')}>Цээжилсэн</FilterButton>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-6 animate-fade-in">
        {activeTab !== 'progress' && (
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder="Хайх..."
          />
        )}

        {activeTab === 'kanji' && (
          <div className="space-y-12">
            {kanjiSets.map(([setNum, kanjis]) => (
              <section key={setNum} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-400">Set {setNum}</h3>
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">
                    {kanjis.filter(k => masteredIds.has(k.id)).length} / {kanjis.length} Mastered
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {kanjis.map(k => (
                    <KanjiCard 
                      key={k.id} 
                      kanji={k} 
                      isMastered={masteredIds.has(k.id)} 
                      onClick={() => handleKanjiClick(k)}
                      onToggle={(e) => toggleMastery(k.id, e)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeTab === 'vocabulary' && (
          <div className="space-y-12">
            {vocabSets.map(([setNum, vocabs]) => (
              <section key={setNum} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-400">Set {setNum}</h3>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vocabs.map((v) => (
                    <VocabCard 
                      key={v.id} 
                      vocab={v} 
                      isMastered={masteredIds.has(v.id)} 
                      onToggle={() => toggleMastery(v.id)} 
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeTab === 'grammar' && (
          <div className="space-y-12">
            {grammarSets.map(([setNum, grammars]) => (
              <section key={setNum} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-400">Set {setNum}</h3>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grammars.map((g) => (
                    <GrammarCard 
                      key={g.id} 
                      grammar={g} 
                      isMastered={masteredIds.has(g.id)} 
                      onToggle={() => toggleMastery(g.id)} 
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeTab === 'progress' && <ProgressView masteredCount={masteredIds.size} totalCount={stats.kanji + stats.vocab + stats.grammar} />}

        {((activeTab === 'kanji' && filteredKanji.length === 0) || 
          (activeTab === 'vocabulary' && filteredVocab.length === 0) || 
          (activeTab === 'grammar' && filteredGrammar.length === 0)) && (
          <div className="text-center py-20 text-slate-500 italic">
            Энэ шүүлтүүрт тохирох зүйл олдсонгүй.
          </div>
        )}
      </main>

      <Modal isOpen={!!selectedKanji} onClose={() => setSelectedKanji(null)}>
        {selectedKanji && (
          <KanjiDetail 
            kanji={selectedKanji} 
            aiLoading={aiLoading} 
            aiContent={aiContent} 
            onAskAi={askAiForMnemonic} 
          />
        )}
      </Modal>
    </div>
  );
};

const ProgressView: React.FC<{ masteredCount: number; totalCount: number }> = ({ masteredCount, totalCount }) => {
  const percentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  
  return (
    <div className="bg-slate-800/40 rounded-3xl p-10 text-center border border-slate-700 max-w-2xl mx-auto shadow-xl">
      <div className="relative inline-block mb-8">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-700" />
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (502 * (percentage / 100))} className="text-green-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-5xl font-black text-white">{percentage}%</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Mastery</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Сургалтын явц</h3>
      <p className="text-slate-400 max-w-md mx-auto leading-relaxed">Нийт сурах ёстой {totalCount} зүйлээс та {masteredCount} зүйлийг бүрэн цээжилсэн байна.</p>
      
      <div className="mt-12 grid grid-cols-3 gap-4">
        <ProgressStat label="Канжи" count={n4Data.kanji.length} color="text-yellow-400" />
        <ProgressStat label="Үгс" count={n4Data.vocabulary.length} color="text-pink-400" />
        <ProgressStat label="Дүрэм" count={n4Data.grammar.length} color="text-cyan-400" />
      </div>
    </div>
  );
};

const ProgressStat = ({ label, count, color }: { label: string, count: number, color: string }) => (
  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
    <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">{label}</div>
    <div className={`text-2xl font-black ${color}`}>{count}</div>
  </div>
);

export default App;
