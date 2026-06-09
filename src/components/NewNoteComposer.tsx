import { TodoNote, NoteChecklistItem } from '../types';
import { COLORS_PALETTE } from '../data';
import { 
  Plus, 
  CheckSquare, 
  Square, 
  X, 
  Sparkles, 
  Trash2, 
  CheckCircle,
  FolderPlus
} from 'lucide-react';
import { useState, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NewNoteComposerProps {
  onAddNote: (note: Omit<TodoNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function NewNoteComposer({ onAddNote }: NewNoteComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklist, setChecklist] = useState<NoteChecklistItem[]>([]);
  const [colorName, setColorName] = useState('zinc');
  const [newCheckItemText, setNewCheckItemText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddChecklist = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newCheckItemText.trim()) return;

    const newItem: NoteChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newCheckItemText.trim(),
      isCompleted: false,
    };

    setChecklist(prev => [...prev, newItem]);
    setNewCheckItemText('');
  };

  const handleRemoveCheckListItem = (itemId: string) => {
    setChecklist(prev => prev.filter(item => item.id !== itemId));
  };

  const handleToggleCheckListItem = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item => item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item)
    );
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setChecklist([]);
    setColorName('zinc');
    setNewCheckItemText('');
    setIsExpanded(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim() && checklist.length === 0) {
      setIsExpanded(false);
      return;
    }

    onAddNote({
      title: title.trim(),
      content: content.trim(),
      checklist,
      isPinned: false,
      colorName,
    });

    handleReset();
  };

  const currentStyle = COLORS_PALETTE[colorName] || COLORS_PALETTE.zinc;

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-xl mx-auto mb-8 sm:mb-10 selection:bg-indigo-100 relative"
      id="new_note_composer_wrapper"
    >
      <div 
        className={`rounded-2xl border-2 ${currentStyle.bg} ${currentStyle.border} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 p-4 shrink-0 relative`}
      >
        {isExpanded && (
          <div 
            className={`absolute top-[-9px] left-1/2 -translate-x-1/2 w-28 h-5 ${currentStyle.tape} border border-dashed shadow-xs rotate-[-1deg] opacity-90 pointer-events-none rounded-xs flex items-center justify-center font-hand text-[10px] font-bold text-zinc-700 overflow-hidden select-none z-10`}
          >
            📌 active pencil
          </div>
        )}

        {!isExpanded ? (
          /* Unfocused Placeholder input */
          <div 
            id="composer_unfocused_trigger"
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-between cursor-pointer py-1.5 select-none"
          >
            <span className="text-xs text-zinc-550 font-semibold font-sans flex items-center gap-1.5">
              ✏️ <span className="underline decoration-dashed decoration-1 underline-offset-3">Create a new to-do task or colorful note...</span>
            </span>
            <div className="h-7 w-7 rounded-lg bg-white border border-zinc-250 flex items-center justify-center text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 transition-colors">
              <Plus className="h-4 w-4" />
            </div>
          </div>
        ) : (
          /* Expanded Full Creator Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Title field */}
            <input
              id="composer_focused_title"
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-0 ring-0 focus:outline-hidden focus:ring-0 text-xs font-bold text-zinc-950 placeholder:text-zinc-400 py-1"
              autoFocus
            />

            {/* Description textarea */}
            <textarea
              id="composer_focused_content"
              rows={2}
              placeholder="Take a note, checklist reminder, or workflow descriptions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-0 ring-0 focus:outline-hidden focus:ring-0 text-xs text-zinc-650 placeholder:text-zinc-400 py-1 resize-none font-medium leading-relaxed"
            />

            {/* Checklist lists inline */}
            {checklist.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1 border-t border-black/[0.03] pt-2 max-h-40 overflow-y-auto">
                {checklist.map(item => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between gap-2 p-1.5 bg-black/[0.015] rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 max-w-[85%]">
                      <button
                        type="button"
                        id={`composer_checklist_toggle_${item.id}`}
                        onClick={() => handleToggleCheckListItem(item.id)}
                        className="text-zinc-400 hover:text-indigo-650 cursor-pointer"
                      >
                        {item.isCompleted ? (
                          <CheckSquare className="h-4 w-4 text-indigo-650" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <span className={`font-semibold truncate ${item.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                        {item.text}
                      </span>
                    </div>
                    <button
                      type="button"
                      id={`composer_checklist_remove_${item.id}`}
                      onClick={() => handleRemoveCheckListItem(item.id)}
                      className="text-zinc-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Dynamic checklist entry bar */}
            <div className="flex gap-1.5 mt-1">
              <input
                id="composer_checklist_inline_input"
                type="text"
                placeholder="Add checklist bullet..."
                value={newCheckItemText}
                onChange={(e) => setNewCheckItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                className="flex-1 text-[11px] px-3 py-1.5 bg-black/[0.02] border border-transparent rounded-xl text-zinc-900 focus:outline-hidden focus:bg-white focus:border-zinc-200 placeholder:text-zinc-450"
              />
              <button
                type="button"
                id="composer_checklist_inline_submit"
                onClick={() => handleAddChecklist()}
                className="px-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Footer Control Bar inside Composer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.04] mt-2">
              {/* Color Buttons Swapper */}
              <div className="flex items-center gap-1.5">
                {Object.keys(COLORS_PALETTE).map((colorKey) => {
                  const styleOpt = COLORS_PALETTE[colorKey];
                  const isSel = colorName === colorKey;

                  return (
                    <button
                      key={colorKey}
                      id={`composer_color_btn_${colorKey}`}
                      type="button"
                      onClick={() => setColorName(colorKey)}
                      className={`h-4.5 w-4.5 rounded-full ${styleOpt.dot} border transition-all cursor-pointer hover:scale-120 ${
                        isSel 
                          ? 'ring-2 ring-indigo-505 border-white ring-offset-1 scale-110' 
                          : 'border-black/5'
                      }`}
                      title={styleOpt.label}
                    />
                  );
                })}
              </div>

              {/* Action commands */}
              <div className="flex items-center gap-1.5">
                <button
                  id="composer_cancel_btn"
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-1.5 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
                <button
                  id="composer_commit_btn"
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg text-xs font-bold cursor-pointer transition-transform active:scale-97"
                >
                  Create Notes
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
