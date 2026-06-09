export interface NoteChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface TodoNote {
  id: string;
  title: string;
  content: string;
  checklist: NoteChecklistItem[];
  isPinned: boolean;
  colorName: string; // 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'zinc'
  createdAt: string;
  updatedAt: string;
  userId?: string;
  createdAtRaw?: any;
}

export type ColorStyle = {
  bg: string;
  border: string;
  accent: string;
  dot: string;
  label: string;
  saveBtn: string;
  saveBtnLight: string;
  tape: string;
  badge: string;
};
