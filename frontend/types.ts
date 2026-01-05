export type CaseStatus = 'Open' | 'Solved';

export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  alibi: string;
  motive: string;
  notes: string;
  imageUrl: string;
}

export interface Clue {
  id: string;
  title: string;
  description: string;
  source: string;
  confidence: 'Confirmed' | 'Questionable' | 'Disputed';
}

export interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  involvedSuspects: string[];
  isGap?: boolean;
}

export interface Statement {
  id: string;
  speakerId: string;
  speakerName: string;
  content: string;
  timestamp: string;
  context?: string;
}

export interface Theory {
  id: string;
  title: string;
  content: string;
  linkedClues: string[];
  linkedSuspects: string[];
  createdAt?: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  suspects: Suspect[];
  clues: Clue[];
  timeline: TimelineEvent[];
  statements: Statement[];
  theories: Theory[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

