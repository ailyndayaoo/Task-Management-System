import { TodoNote, ColorStyle, NoteChecklistItem } from '../types';
import { COLORS_PALETTE } from '../data';
import { 
  Pin, 
  Trash2, 
  Plus, 
  CheckSquare, 
  Square, 
  Pencil, 
  Sparkles, 
  Calendar,
  X,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, FormEvent } from 'react';

interface NoteCardProps {
  note: TodoNote;
  onUpdateNote: (note: TodoNote) => void;
  onDeleteNote: (id: string) => void;
  onSelectToEdit: (note: TodoNote) => void;
  key?: string;
}

export default function NoteCard({
  note,
  onUpdateNote,
  onDeleteNote,
  onSelectToEdit,
}: NoteCardProps) {
  const [newCheckItemText, setNewCheckItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState<string>('');
  const style = COLORS_PALETTE[note.colorName] || COLORS_PALETTE.zinc;

  // Save edited checklist item
  const handleSaveCheckItem = (itemId: string) => {
    if (!editingItemText.trim()) return;
    const updatedChecklist = note.checklist.map(item =>
      item.id === itemId ? { ...item, text: editingItemText.trim() } : item
    );
    onUpdateNote({
      ...note,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setEditingItemId(null);
  };

  // Toggle checklist status
  const handleToggleChecklist = (itemId: string) => {
    const updatedChecklist = note.checklist.map(item =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    onUpdateNote({
      ...note,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  // Add individual checklist item inline in card
  const handleAddChecklist = (e: FormEvent) => {
    e.preventDefault();

    if (!newCheckItemText.trim()) return;

    const newItem: NoteChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newCheckItemText.trim(),
      isCompleted: false,
    };

    onUpdateNote({
      ...note,
      checklist: [...note.checklist, newItem],
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setNewCheckItemText('');
  };

  // Remove checklist item
  const handleRemoveCheckItem = (itemId: string) => {
    onUpdateNote({
      ...note,
      checklist: note.checklist.filter(item => item.id !== itemId),
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  // Toggle note pin
  const handleTogglePin = () => {
    onUpdateNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  // Switch note color
  const handleColorChange = (colorName: string) => {
    onUpdateNote({
      ...note,
      colorName,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const tiltClasses = [
    'rotate-[0.5deg] hover:rotate-0 hover:scale-[1.02]',
    'rotate-[-0.8deg] hover:rotate-0 hover:scale-[1.02]',
    'rotate-[1deg] hover:rotate-0 hover:scale-[1.02]',
    'rotate-[-1.2deg] hover:rotate-0 hover:scale-[1.02]'
  ];
  const charCode = note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tiltClass = tiltClasses[charCode % tiltClasses.length];

  return (
    <motion.div
      layout
      id={`note_card_container_${note.id}`}
      className={`group relative rounded-2xl border ${style.bg} ${style.border} pt-7 pb-5 px-5 flex flex-col gap-4 transition-all duration-300 ${tiltClass}`}
    >
      {/* Decorative Stationery Masking Tape */}
      <div 
        className={`absolute top-[-10px] left-1/2 -translate-x-1/2 w-28 h-5.5 ${style.tape} border border-dashed shadow-xs rotate-[-1.5deg] opacity-85 pointer-events-none rounded-xs flex items-center justify-center font-hand text-[11px] font-bold text-zinc-700/80 overflow-hidden select-none`}
        title="Holding note on desk"
      >
        📌 {style.label}
      </div>

      {/* Header Panel */}
      <div className="flex items-start justify-between gap-2 mt-1">
        <h3 
          id={`note_title_click_${note.id}`}
          onClick={() => onSelectToEdit(note)}
          className="font-bold text-sm text-zinc-950 tracking-tight leading-tight hover:text-indigo-650 transition-colors cursor-pointer flex items-center gap-1"
        >
          <span className="text-zinc-400 font-mono text-[10px]">✏️</span>
          {note.title || <span className="text-zinc-350 italic font-medium">Untitled Note</span>}
        </h3>

        {/* Pin Controller */}
        <button
          id={`note_pin_btn_${note.id}`}
          onClick={handleTogglePin}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            note.isPinned
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 border-zinc-150'
          }`}
          title={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Content Info with elegant paper card backing */}
      {note.content && (
        <div 
          id={`note_content_click_${note.id}`}
          onClick={() => onSelectToEdit(note)}
          className="rounded-lg p-3 bg-white/60 border border-black/[0.04] text-xs text-zinc-800 font-semibold leading-relaxed cursor-pointer line-clamp-6 select-none shadow-xs"
        >
          {note.content}
        </div>
      )}

      {/* Checklist View Panel */}
      <div className="flex flex-col gap-2">
        {note.checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 text-xs group/item py-1.5 px-2 bg-black/[0.02] border border-black/[0.03] rounded-lg transition-colors min-h-[36px]"
          >
            {editingItemId === item.id ? (
              <div className="flex items-center gap-1.5 flex-1 w-full" id={`note_item_edit_mode_${note.id}_${item.id}`}>
                <input
                  type="text"
                  value={editingItemText}
                  onChange={(e) => setEditingItemText(e.target.value)}
                  className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveCheckItem(item.id);
                    } else if (e.key === 'Escape') {
                      setEditingItemId(null);
                    }
                  }}
                />
                <button
                  type="button"
                  id={`note_item_save_btn_${note.id}_${item.id}`}
                  onClick={() => handleSaveCheckItem(item.id)}
                  className={`p-1 ${style.saveBtnLight} rounded-lg border cursor-pointer flex items-center justify-center shrink-0 transition-colors`}
                  title="Save edited task"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  id={`note_item_cancel_btn_${note.id}_${item.id}`}
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
                    id={`note_item_checkbox_${note.id}_${item.id}`}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="text-zinc-400 hover:text-indigo-655 cursor-pointer shrink-0"
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="h-4.5 w-4.5 text-indigo-650" />
                    ) : (
                      <Square className="h-4.5 w-4.5" />
                    )}
                  </button>
                  <span
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`font-semibold cursor-pointer select-none truncate ${
                      item.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-800'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    id={`note_item_edit_trigger_${note.id}_${item.id}`}
                    onClick={() => {
                      setEditingItemId(item.id);
                      setEditingItemText(item.text);
                    }}
                    className="text-zinc-400 hover:text-indigo-600 p-1 rounded hover:bg-black/5 cursor-pointer transition-colors"
                    title="Edit task text"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    id={`note_item_remove_${note.id}_${item.id}`}
                    onClick={() => handleRemoveCheckItem(item.id)}
                    className="text-zinc-400 hover:text-rose-650 p-1 rounded hover:bg-black/5 cursor-pointer transition-colors"
                    title="Remove item"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Short Inline Checklist Creator */}
        <form onSubmit={handleAddChecklist} className="flex gap-1.5 mt-1">
          <input
            id={`note_inline_checklist_input_${note.id}`}
            type="text"
            placeholder="Add quick checklist item..."
            value={newCheckItemText}
            onChange={(e) => setNewCheckItemText(e.target.value)}
            className="flex-1 text-[11px] px-2.5 py-1.5 bg-black/[0.015] border border-zinc-200 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            id={`note_inline_checklist_add_${note.id}`}
            className="px-2 py-1 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-[11px] font-bold cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Date badge */}
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium font-mono">
        <Calendar className="h-3.5 w-3.5" />
        <span>Modified {note.updatedAt || note.createdAt}</span>
      </div>

      {/* Footer Controls Row - appears gracefully on hover on desktop */}
      <div 
        id={`note_card_action_dock_${note.id}`}
        className="flex items-center justify-between pt-3 border-t border-zinc-150/50 mt-1"
      >
        {/* Pastel Color Swapper */}
        <div className="flex items-center gap-1.5">
          {Object.keys(COLORS_PALETTE).map((colorKey) => {
            const styleOpt = COLORS_PALETTE[colorKey];
            const isSelected = note.colorName === colorKey;

            return (
              <button
                key={colorKey}
                id={`note_${note.id}_color_option_${colorKey}`}
                type="button"
                onClick={() => handleColorChange(colorKey)}
                className={`h-4.5 w-4.5 rounded-full ${styleOpt.dot} border transition-transform cursor-pointer hover:scale-115 ${
                  isSelected 
                    ? 'ring-2 ring-indigo-505 border-white ring-offset-1' 
                    : 'border-black/5'
                }`}
                title={styleOpt.label}
              />
            );
          })}
        </div>

        {/* Edit and Trash panel */}
        <div className="flex items-center gap-1">
          <button
            id={`note_edit_trigger_${note.id}`}
            onClick={() => onSelectToEdit(note)}
            className="p-1.5 bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/80 rounded-lg cursor-pointer transition-colors"
            title="Edit details"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            id={`note_delete_trigger_${note.id}`}
            onClick={() => {
              if (confirm('Are you holding onto this note, or would you like to delete it?')) {
                onDeleteNote(note.id);
              }
            }}
            className="p-1.5 bg-rose-50/50 border border-rose-100 text-rose-500 hover:text-rose-750 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
            title="Delete notes"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
