import { TodoNote, NoteChecklistItem } from '../types';
import { COLORS_PALETTE } from '../data';
import { 
  X, 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Tag, 
  Edit3, 
  CheckCircle2,
  Calendar,
  Layers,
  Check,
  Pencil
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: TodoNote | null;
  onSaveNote: (note: TodoNote) => void;
}

export default function EditNoteModal({
  isOpen,
  onClose,
  note,
  onSaveNote,
}: EditNoteModalProps) {
  // Local form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklist, setChecklist] = useState<NoteChecklistItem[]>([]);
  const [colorName, setColorName] = useState('zinc');
  const [isPinned, setIsPinned] = useState(false);
  const [newCheckText, setNewCheckText] = useState('');
  
  // Checklist item editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState<string>('');

  // Update states whenever note opens
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setChecklist(note.checklist);
      setColorName(note.colorName);
      setIsPinned(note.isPinned);
    }
  }, [note, isOpen]);

  const handleToggleCheckItem = (itemId: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item)
    );
  };

  const handleSaveCheckListItem = (itemId: string) => {
    if (!editingItemText.trim()) return;
    setChecklist(prev => 
      prev.map(item => item.id === itemId ? { ...item, text: editingItemText.trim() } : item)
    );
    setEditingItemId(null);
  };

  const handleAddChecklist = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newCheckText.trim()) return;

    const newItem: NoteChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newCheckText.trim(),
      isCompleted: false,
    };

    setChecklist(prev => [...prev, newItem]);
    setNewCheckText('');
  };

  const handleRemoveCheckListItem = (itemId: string) => {
    setChecklist(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!note) return;

    const updatedNote: TodoNote = {
      ...note,
      title: title.trim(),
      content: content.trim(),
      checklist,
      colorName,
      isPinned,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveNote(updatedNote);
    onClose();
  };

  const currentStyle = COLORS_PALETTE[colorName] || COLORS_PALETTE.zinc;

  return (
    <AnimatePresence>
      {isOpen && note && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 z-50 backdrop-blur-xs"
            id="edit_modal_backdrop"
          />

          {/* Modal Center Wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`w-full max-w-lg rounded-2xl border ${currentStyle.bg} ${currentStyle.border} shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors duration-300`}
              id="edit_modal_body"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-200/55 bg-black/[0.015]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/80 border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-xs">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-mono">
                    Edit Note Details & Checklist
                  </h3>
                </div>
                <button
                  id="edit_modal_close_header"
                  onClick={onClose}
                  className="p-1 px-1.5 hover:bg-black/5 rounded-md text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-zinc-800">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit_form_title" className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Note Title *</label>
                  <input
                    id="edit_form_title"
                    type="text"
                    required
                    placeholder="Enter visual title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/70 border border-zinc-200 rounded-xl text-xs font-bold placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-900"
                  />
                </div>

                {/* Content description */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit_form_content" className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Description Notes</label>
                  <textarea
                    id="edit_form_content"
                    rows={4}
                    placeholder="Capture your thoughts, ideas, or reminders..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/75 border border-zinc-200 rounded-xl text-xs placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-900 resize-y leading-relaxed font-medium"
                  />
                </div>

                {/* Checklist Checklist items */}
                <div className="flex flex-col gap-3 border-t border-zinc-150/60 pt-4">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                    Checklist items ({checklist.filter(c => c.isCompleted).length}/{checklist.length})
                  </span>

                  {/* Checklist adder row */}
                  <div className="flex gap-2">
                    <input
                      id="edit_modal_check_adder"
                      type="text"
                      placeholder="Add another check milestone..."
                      value={newCheckText}
                      onChange={(e) => setNewCheckText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklist();
                        }
                      }}
                      className="flex-1 px-3.5 py-1.5 bg-white/70 border border-zinc-200 rounded-xl text-xs placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-505 text-zinc-900"
                    />
                    <button
                      type="button"
                      id="edit_modal_check_submit"
                      onClick={() => handleAddChecklist()}
                      className="px-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Checklist Listing */}
                  <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                    {checklist.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-2 bg-white/40 hover:bg-white border border-zinc-150 rounded-xl group transition-all min-h-[40px]"
                      >
                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-1.5 flex-1 w-full" id={`edit_modal_item_edit_mode_${item.id}`}>
                            <input
                              type="text"
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveCheckListItem(item.id);
                                } else if (e.key === 'Escape') {
                                  setEditingItemId(null);
                                }
                              }}
                            />
                            <button
                              type="button"
                              id={`edit_modal_item_save_btn_${item.id}`}
                              onClick={() => handleSaveCheckListItem(item.id)}
                              className={`p-1 ${currentStyle.saveBtnLight} rounded-lg border cursor-pointer flex items-center justify-center shrink-0 transition-colors`}
                              title="Save edited task"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              id={`edit_modal_item_cancel_btn_${item.id}`}
                              onClick={() => setEditingItemId(null)}
                              className="p-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 rounded-lg border border-zinc-200 cursor-pointer flex items-center justify-center shrink-0 transition-colors"
                              title="Cancel editing"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <button
                                type="button"
                                id={`edit_modal_item_check_${item.id}`}
                                onClick={() => handleToggleCheckItem(item.id)}
                                className="text-zinc-400 hover:text-indigo-650 cursor-pointer shrink-0"
                              >
                                {item.isCompleted ? (
                                  <CheckSquare className="h-4.5 w-4.5 text-indigo-600" />
                                ) : (
                                  <Square className="h-4.5 w-4.5" />
                                )}
                              </button>
                              <span
                                onClick={() => handleToggleCheckItem(item.id)}
                                className={`text-xs font-semibold select-none cursor-pointer truncate ${
                                  item.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-800'
                                }`}
                              >
                                {item.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                id={`edit_modal_item_edit_trigger_${item.id}`}
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditingItemText(item.text);
                                }}
                                className="p-1 hover:bg-zinc-100/80 text-zinc-400 hover:text-indigo-600 rounded cursor-pointer transition-colors"
                                title="Edit item text"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                id={`edit_modal_item_remove_${item.id}`}
                                onClick={() => handleRemoveCheckListItem(item.id)}
                                className="p-1 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                                title="Remove item"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme Selector inside form */}
                <div className="flex flex-col gap-2 border-t border-zinc-150/60 pt-4">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Note Theme Color</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(COLORS_PALETTE).map((colorKey) => {
                      const styleOpt = COLORS_PALETTE[colorKey];
                      const isSel = colorName === colorKey;

                      return (
                        <button
                          key={colorKey}
                          type="button"
                          id={`edit_modal_color_option_${colorKey}`}
                          onClick={() => setColorName(colorKey)}
                          className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                            isSel
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                              : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                          }`}
                        >
                          <span className={`h-3 w-3 rounded-full ${styleOpt.dot} border border-black/5 shrink-0`} />
                          {styleOpt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggle Sticky Pin toggle inside form */}
                <div className="flex items-center justify-between border-t border-zinc-150/60 pt-4 mt-1">
                  <span className="text-xs font-bold text-zinc-905 flex items-center gap-1">
                    <Layers className="h-4 w-4" /> Stick Pin to Top of Board
                  </span>
                  <button
                    type="button"
                    id="edit_modal_pin_trigger"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`px-3 py-1.5 text-xs rounded-xl border font-bold font-mono transition-colors cursor-pointer ${
                      isPinned 
                        ? 'bg-zinc-900 border-zinc-900 text-white' 
                        : 'bg-white hover:bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}
                  >
                    {isPinned ? '📌 PINNED' : 'PIN TO BOARD'}
                  </button>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-2.5 border-t border-zinc-150/60 pt-5 mt-2">
                  <button
                    type="button"
                    id="edit_modal_cancel_btn"
                    onClick={onClose}
                    className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    id="edit_modal_submit_btn"
                    className={`px-5 py-2 ${currentStyle.saveBtn} font-bold rounded-xl text-xs shadow-xs cursor-pointer active:scale-98 transition-all duration-200`}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
