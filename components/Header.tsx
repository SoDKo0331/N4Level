
import React from 'react';

interface HeaderProps {
  stats: {
    kanji: number;
    vocab: number;
    grammar: number;
  };
}

const Header: React.FC<HeaderProps> = ({ stats }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            JLPT N4 Master
          </h1>
          <p className="text-slate-400 mt-1 font-medium italic">Бүрэн мэдлэгийн сан</p>
        </div>
        <div className="flex gap-6 overflow-x-auto hide-scrollbar">
          <StatBox label="Канжи" value={stats.kanji} color="text-yellow-400" />
          <StatBox label="Үгс" value={stats.vocab} color="text-pink-400" />
          <StatBox label="Дүрэм" value={stats.grammar} color="text-cyan-400" />
        </div>
      </div>
    </header>
  );
};

const StatBox = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col items-center min-w-[80px]">
    <span className={`text-2xl font-black ${color}`}>{value}</span>
    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{label}</span>
  </div>
);

export default Header;
