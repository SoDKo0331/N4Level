
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
      active ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
    }`}
  >
    {children}
  </button>
);

const KanjiCard: React.FC<{ kanji: Kanji; isMastered: boolean; onClick: () => void; onToggle: (e: React.MouseEvent) => void }> = ({ kanji, isMastered, onClick, onToggle }) => (
  <div 
    onClick={onClick}
    className={`relative bg-slate-800/50 border ${isMastered ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-slate-700'} rounded-2xl p-6 text-center transition-all cursor-pointer hover:scale-[1.05] group`}
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
      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isMastered ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-600'}`}
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
        className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isMastered ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-600'}`}
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
            <div className="flex items-center gap-2 text-slate-500 py-4">
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
      <div className="font-jp text-8xl font-black text-yellow-400 bg-slate-800 p-4 rounded-3xl shadow-xl">{kanji.char}</div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-white mb-2">{kanji.meaning}</h2>
        <div className="flex flex-wrap gap-2">
          <span className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{kanji.strokes} Strokes</span>
          <span className="bg-pink-500/10 border border-pink-500/50 text-pink-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Set {kanji.set}</span>
        </div>
        <div className="mt-6 space-y-3">
          <div>
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-1">On-reading (音読み)</span>
            <div className="flex flex-wrap gap-2">{kanji.on.map(r => <span key={r} className="font-jp text-lg bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">{r}</span>)}</div>
          </div>
          <div>
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest block mb-1">Kun-reading (訓読み)</span>
            <div className="flex flex-wrap gap-2">{kanji.kun.map(r => <span key={r} className="font-jp text-lg bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">{r}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-slate-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-cyan-400">AI Туслах</h3>
        <button onClick={onAskAi} disabled={aiLoading} className="bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
          {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "💡 Ханз цээжлэх арга"}
        </button>
      </div>
      {aiContent && <div className="bg-slate-800/50 p-6 rounded-2xl text-slate-300 italic leading-relaxed border border-slate-700/50">{aiContent}</div>}
      {!aiContent && !aiLoading && <p className="text-slate-500 text-sm text-center py-6 italic border border-dashed border-slate-700 rounded-2xl">Ханз цээжлэх сонирхолтой түүхийг AI-аас асуугаарай.</p>}
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('n4_mastered_ids');
    if (saved) {
      try {
        setMasteredIds(new Set(JSON.parse(saved)));
      } catch (e) { console.error(e); }
    }
    
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMastery = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newMastered = new Set(masteredIds);
    if (newMastered.has(id)) newMastered.delete(id);
    else newMastered.add(id);
    setMasteredIds(newMastered);
    localStorage.setItem('n4_mastered_ids', JSON.stringify(Array.from(newMastered)));
  };

  const filteredData = useMemo(() => {
    const s = search.toLowerCase();
    const filterFn = (item: {id: string, searchTerms: string[]}) => {
      const matchesSearch = item.searchTerms.some(term => term.includes(s));
      if (!matchesSearch) return false;
      if (filter === 'mastered') return masteredIds.has(item.id);
      if (filter === 'learning') return !masteredIds.has(item.id);
      return true;
    };

    return {
      kanji: n4Data.kanji.map(k => ({...k, searchTerms: [k.char, k.meaning.toLowerCase()]})).filter(filterFn),
      vocab: n4Data.vocabulary.map(v => ({...v, searchTerms: [v.jp, v.reading, v.meaning.toLowerCase()]})).filter(filterFn),
      grammar: n4Data.grammar.map(g => ({...g, searchTerms: [g.pattern, g.meaning.toLowerCase()]})).filter(filterFn)
    };
  }, [search, filter, masteredIds]);

  const kanjiSets = useMemo(() => {
    const sets: { [key: number]: Kanji[] } = {};
    filteredData.kanji.forEach(k => {
      if (!sets[k.set]) sets[k.set] = [];
      sets[k.set].push(k as Kanji);
    });
    return Object.entries(sets).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredData.kanji]);

  const vocabSets = useMemo(() => {
    const sets: { [key: number]: Vocabulary[] } = {};
    filteredData.vocab.forEach(v => {
      if (!sets[v.set]) sets[v.set] = [];
      sets[v.set].push(v as Vocabulary);
    });
    return Object.entries(sets).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredData.vocab]);

  const grammarSets = useMemo(() => {
    const sets: { [key: number]: Grammar[] } = {};
    filteredData.grammar.forEach(g => {
      if (!sets[g.set]) sets[g.set] = [];
      sets[g.set].push(g as Grammar);
    });
    return Object.entries(sets).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredData.grammar]);

  const stats = {
    kanji: n4Data.kanji.length,
    vocab: n4Data.vocabulary.length,
    grammar: n4Data.grammar.length,
    masteredCount: masteredIds.size
  };

  const handleKanjiClick = async (kanji: Kanji) => {
    setSelectedKanji(kanji);
    setAiContent(null);
  };

  const askAiForMnemonic = async () => {
    if (!selectedKanji) return;
    setAiLoading(true);
    const story = await getMnemonicStory(selectedKanji.char);
    setAiContent(story);
    setAiLoading(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen pb-20 bg-[#0f0f23]">
      <Header stats={stats} />

      <nav className="max-w-6xl mx-auto px-4 mt-8 flex flex-col gap-5">
        <div className="flex bg-slate-800/40 p-1.5 rounded-2xl gap-2 overflow-x-auto hide-scrollbar border border-slate-700/50">
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

      <main className="max-w-6xl mx-auto px-4 mt-6">
        {activeTab !== 'progress' && (
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder="Хайх (Жишээ: ханз, утга, дуудлага...)"
          />
        )}

        {activeTab === 'kanji' && (
          <div className="space-y-16">
            {kanjiSets.map(([setNum, kanjis]) => (
              <section key={setNum} className="animate-fade-in">
                <SetHeader title={`Set ${setNum}`} count={kanjis.length} mastered={kanjis.filter(k => masteredIds.has(k.id)).length} />
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
          <div className="space-y-16">
            {vocabSets.map(([setNum, vocabs]) => (
              <section key={setNum} className="animate-fade-in">
                <SetHeader title={`Vocab Set ${setNum}`} count={vocabs.length} mastered={vocabs.filter(v => masteredIds.has(v.id)).length} />
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
          <div className="space-y-16">
            {grammarSets.map(([setNum, grammars]) => (
              <section key={setNum} className="animate-fade-in">
                <SetHeader title={`Grammar Set ${setNum}`} count={grammars.length} mastered={grammars.filter(g => masteredIds.has(g.id)).length} />
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

        {activeTab === 'progress' && <ProgressView masteredIds={masteredIds} stats={stats} />}

        {/* 
          // Fix for: Error in file App.tsx on line 354: This comparison appears to be unintentional because the types '"kanji" | "vocabulary" | "grammar"' and '"progress"' have no overlap.
          // Removed redundant 'activeTab !== "progress"' check because it's already implicitly true if the previous conditions match.
        */}
        {((activeTab === 'kanji' && kanjiSets.length === 0) || 
          (activeTab === 'vocabulary' && vocabSets.length === 0) || 
          (activeTab === 'grammar' && grammarSets.length === 0)) && (
          <div className="text-center py-20 text-slate-500 italic">
            Энэ шүүлтүүрт тохирох зүйл олдсонгүй. Хайлтаа өөрчлөөд үзнэ үү.
          </div>
        )}
      </main>

      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/30 hover:bg-cyan-500 transition-all active:scale-90 z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m4.5 15.75 7.5-7.5 7.5 7.5"/></svg>
        </button>
      )}

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

const SetHeader = ({ title, count, mastered }: { title: string, count: number, mastered: number }) => {
  const percentage = Math.round((mastered / count) * 100) || 0;
  return (
    <div className="flex flex-col mb-6 gap-2">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-slate-300">{title}</h3>
        <div className="h-px bg-slate-800 flex-1"></div>
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
          {mastered} / {count} Mastered
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ProgressView: React.FC<{ masteredIds: Set<string>, stats: any }> = ({ masteredIds, stats }) => {
  const totalItems = stats.kanji + stats.vocab + stats.grammar;
  const percentage = totalItems > 0 ? Math.round((masteredIds.size / totalItems) * 100) : 0;
  
  const kanjiMastered = n4Data.kanji.filter(k => masteredIds.has(k.id)).length;
  const vocabMastered = n4Data.vocabulary.filter(v => masteredIds.has(v.id)).length;
  const grammarMastered = n4Data.grammar.filter(g => masteredIds.has(g.id)).length;

  return (
    <div className="bg-slate-800/40 rounded-3xl p-10 text-center border border-slate-700 max-w-2xl mx-auto shadow-2xl animate-fade-in">
      <div className="relative inline-block mb-10">
        <svg className="w-56 h-56 transform -rotate-90">
          <circle cx="112" cy="112" r="95" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-slate-800" />
          <circle cx="112" cy="112" r="95" stroke="currentColor" strokeWidth="18" fill="transparent" strokeDasharray={597} strokeDashoffset={597 - (597 * (percentage / 100))} className="text-green-500 transition-all duration-1500 ease-out" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-6xl font-black text-white">{percentage}%</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Нийт ахиц</span>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">Mastery Progress</h3>
      <p className="text-slate-400 mb-10 leading-relaxed">Та нийт {totalItems} сургалтын материалаас {masteredIds.size} зүйлийг бүрэн цээжлээд байна.</p>
      
      <div className="grid grid-cols-3 gap-4">
        <ProgressStat label="Канжи" mastered={kanjiMastered} total={stats.kanji} color="text-yellow-400" />
        <ProgressStat label="Үгс" mastered={vocabMastered} total={stats.vocab} color="text-pink-400" />
        <ProgressStat label="Дүрэм" mastered={grammarMastered} total={stats.grammar} color="text-cyan-400" />
      </div>

      <button 
        onClick={() => { if(confirm('Бүх цээжилсэн мэдээллийг устгах уу?')) { localStorage.removeItem('n4_mastered_ids'); window.location.reload(); } }}
        className="mt-12 text-xs font-bold text-slate-600 hover:text-red-500 transition-colors uppercase tracking-widest"
      >
        Reset All Progress
      </button>
    </div>
  );
};

const ProgressStat = ({ label, mastered, total, color }: { label: string, mastered: number, total: number, color: string }) => (
  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
    <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2">{label}</div>
    <div className={`text-2xl font-black ${color}`}>{mastered}</div>
    <div className="text-[10px] text-slate-600 font-bold">of {total}</div>
  </div>
);

export default App;
