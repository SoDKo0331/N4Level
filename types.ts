
export interface Kanji {
  id: string;
  char: string;
  on: string[];
  kun: string[];
  meaning: string;
  strokes: number;
  set: number;
}

export interface Vocabulary {
  id: string;
  jp: string;
  reading: string;
  meaning: string;
  set: number;
}

export interface Grammar {
  id: string;
  pattern: string;
  meaning: string;
  example: string;
  exampleMn: string;
  set: number;
}

export type TabType = 'kanji' | 'vocabulary' | 'grammar' | 'progress';
export type FilterType = 'all' | 'learning' | 'mastered';
