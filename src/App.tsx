import { useState, useEffect } from 'react';
import { TodoNote, NoteChecklistItem } from './types';
import { INITIAL_NOTES } from './data';
import NoteCard from './components/NoteCard';
import NewNoteComposer from './components/NewNoteComposer';
import EditNoteModal from './components/EditNoteModal';
import LandingPage from './components/LandingPage';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Pin, 
  ListCollapse, 
  VolumeX, 
  Volume2, 
  Trash2, 
  Sparkles,
  Info,
  CalendarCheck,
  CheckCircle,
  FolderMinus,
  Bookmark,
  LogOut,
  CloudLightning,
  RefreshCw,
  User,
  Paintbrush,
  Send,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firebase imports
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';

export default function App() {
  // Authentication & Session state
  const [user, setUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  // Core application states
  const [notes, setNotes] = useState<TodoNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteToEdit, setSelectedNoteToEdit] = useState<TodoNote | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'checklist' | 'pure-notes'>('all');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1. Listen to Firebase Authentication Auth State Transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
        // Load notes is handled inside the subsequent effect monitoring user
      } else {
        setUser(null);
        // If they did not explicitly select Sandbox/guest mode, reset guest
        if (!isGuest) {
          setNotes([]);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  // 2. Fetch/Seed notes from Firestore (if Logged In) or LocalStorage (if Guest)
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Authenticated User Flow: Sync notes from Firebase Firestore cloud
      const syncCloudNotes = async () => {
        try {
          setCloudSyncing(true);
          const q = query(
            collection(db, 'notes'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const loadedLoaded: TodoNote[] = [];
          
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            loadedLoaded.push({
              id: docSnapshot.id,
              title: data.title || '',
              content: data.content || '',
              checklist: data.checklist || [],
              isPinned: data.isPinned || false,
              colorName: data.colorName || 'zinc',
              userId: data.userId,
              createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : String(data.createdAt)) : new Date().toISOString().split('T')[0],
              updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString().split('T')[0] : String(data.updatedAt)) : new Date().toISOString().split('T')[0],
              createdAtRaw: data.createdAt // save raw reference for updates
            } as any);
          });

          // Elegant Seeding: If they are logging in for the very first time and have 0 notes, seed INITIAL_NOTES
          if (loadedLoaded.length === 0) {
            const tempNotes: TodoNote[] = [];
            for (const item of INITIAL_NOTES) {
              const freshId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
              const freshNoteRef = doc(db, 'notes', freshId);
              
              const payload = {
                id: freshId,
                title: item.title,
                content: item.content,
                checklist: item.checklist,
                isPinned: item.isPinned,
                colorName: item.colorName,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };

              await setDoc(freshNoteRef, payload);
              tempNotes.push({
                ...item,
                id: freshId,
                userId: user.uid,
                createdAtRaw: payload.createdAt as any
              });
            }
            setNotes(tempNotes);
            triggerToast('☁️ Seeded tutorial notes in your personal Firebase cloud!');
          } else {
            setNotes(loadedLoaded);
          }
        } catch (err) {
          console.error("Firestore sync fail: ", err);
          handleFirestoreError(err, OperationType.GET, 'notes');
          triggerToast('⚠️ Cloud connection sync issue.');
        } finally {
          setCloudSyncing(false);
        }
      };

      syncCloudNotes();
    } else if (isGuest) {
      // Local Guest Flow
      const stored = localStorage.getItem('todo_notes_workspace_guest');
      if (stored) {
        try {
          setNotes(JSON.parse(stored));
        } catch (err) {
          setNotes(INITIAL_NOTES);
        }
      } else {
        setNotes(INITIAL_NOTES);
      }
    }
  }, [user, isGuest, authLoading]);

  // General state helper to preserve local changes when in Guest Mode
  const saveLocalGuestNotes = (updated: TodoNote[]) => {
    setNotes(updated);
    localStorage.setItem('todo_notes_workspace_guest', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sound ping trigger for checking items or committing notes
  const playPopSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (_) {}
  };

  // Add a brand-new Note (supporting both Guest offline and Firebase on-line sync)
  const handleAddNote = async (newNoteData: Omit<TodoNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const freshId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const freshNote: TodoNote = {
      ...newNoteData,
      id: freshId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (user) {
      // Live Firebase Cloud create
      try {
        setCloudSyncing(true);
        const docRef = doc(db, 'notes', freshId);
        
        await setDoc(docRef, {
          id: freshId,
          title: freshNote.title,
          content: freshNote.content,
          checklist: freshNote.checklist,
          isPinned: freshNote.isPinned,
          colorName: freshNote.colorName,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setNotes(prev => [
          {
            ...freshNote,
            createdAtRaw: serverTimestamp()
          },
          ...prev
        ]);
        triggerToast(`Cloud-saved note: "${freshNote.title || 'Untitled note'}"`);
        playPopSound();
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `notes/${freshId}`);
        triggerToast('⚠️ Cloud save failed. Please double check rules.');
      } finally {
        setCloudSyncing(false);
      }
    } else {
      // Local Sandboxed fallback
      const nextList = [freshNote, ...notes];
      saveLocalGuestNotes(nextList);
      triggerToast(`Added "${freshNote.title || 'Untitled Note'}" to Local memory.`);
      playPopSound();
    }
  };

  // Update existing note (handling offline modifications and live Firebase transactions)
  const handleUpdateNote = async (updatedNote: TodoNote) => {
    // If checklists shifted to 100% completion status, celebrate!
    const original = notes.find(n => n.id === updatedNote.id);
    if (original) {
      const wasAllDone = original.checklist.length > 0 && original.checklist.every(c => c.isCompleted);
      const isAllDone = updatedNote.checklist.length > 0 && updatedNote.checklist.every(c => c.isCompleted);
      if (isAllDone && !wasAllDone) {
        triggerToast('🎉 Checklist goal accomplished!');
        playPopSound();
      }
    }

    if (user) {
      try {
        const docRef = doc(db, 'notes', updatedNote.id);
        
        await setDoc(docRef, {
          id: updatedNote.id,
          title: updatedNote.title,
          content: updatedNote.content,
          checklist: updatedNote.checklist,
          isPinned: updatedNote.isPinned,
          colorName: updatedNote.colorName,
          userId: user.uid,
          createdAt: (updatedNote as any).createdAtRaw || serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Set state locally
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notes/${updatedNote.id}`);
        triggerToast('⚠️ Cloud update failed.');
      }
    } else {
      const nextList = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
      saveLocalGuestNotes(nextList);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (user) {
      try {
        setCloudSyncing(true);
        const docRef = doc(db, 'notes', noteId);
        await deleteDoc(docRef);
        
        setNotes(prev => prev.filter(n => n.id !== noteId));
        triggerToast('Note securely cleared from Firebase cloud.');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `notes/${noteId}`);
        triggerToast('⚠️ Delete failed.');
      } finally {
        setCloudSyncing(false);
      }
    } else {
      const nextList = notes.filter(n => n.id !== noteId);
      saveLocalGuestNotes(nextList);
      triggerToast('Note cleared from memory sandbox.');
    }
  };

  // Clear current session
  const handleLogOut = async () => {
    try {
      if (user) {
        await signOut(auth);
      }
      setIsGuest(false);
      setNotes([]);
      triggerToast('Logged out of active workspace session.');
    } catch (err) {
      console.error(err);
    }
  };

  // Filter notes by search logic & filter panels
  const filteredNotes = notes.filter(n => {
    // 1. Filter panel state check
    if (activeFilter === 'pinned' && !n.isPinned) return false;
    if (activeFilter === 'checklist' && n.checklist.length === 0) return false;
    if (activeFilter === 'pure-notes' && n.checklist.length > 0) return false;

    // 2. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchChecklist = n.checklist.some(c => c.text.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchChecklist) return false;
    }

    return true;
  });

  // Separate Pinned and Other notes for convenient dashboard arrangement
  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  // Simple statistics
  const completedCheckItems = notes.flatMap(n => n.checklist).filter(i => i.isCompleted).length;
  const totalCheckItems = notes.flatMap(n => n.checklist).length;

  // Render Modern Workspace Splash Loader resembling a beautiful paper sketch desk
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] flex flex-col items-center justify-center text-zinc-800 select-none relative overflow-hidden" id="auth_portal_loader">
        {/* Colorful drawings / background accents */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Floating background hand-drawn pencil */}
        <div className="absolute top-[15%] right-[10%] animate-pulse hidden md:block opacity-45">
          <Pencil className="h-8 w-8 text-yellow-500 rotate-45" />
          <span className="font-hand text-xs text-zinc-550 font-bold block mt-1">Tracing rules...</span>
        </div>

        <div className="flex flex-col items-center gap-7 text-center z-10 relative">
          
          {/* Animated paper plane spinning around a notebook binder ring design */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Dashed colorful spiral orbits */}
            <div className="absolute inset-0 border-3 border-dashed border-rose-400 rounded-full animate-spin [animation-duration:9s]" />
            <div className="absolute inset-3 border-3 border-dashed border-sky-400 rounded-full animate-spin [animation-duration:6s] [animation-direction:reverse]" />
            <div className="absolute inset-6 border-2 border-dashed border-yellow-400 rounded-full animate-spin [animation-duration:4s]" />
            
            {/* Central notebook sheets stack with colorful crayons */}
            <div className="relative bg-white border-2 border-zinc-400 shadow-[4px_4px_0px_0px_#d4d4d8] pt-3 pb-2 px-3 rounded-xl animate-bounce flex flex-col items-center justify-center">
              <Paintbrush className="h-7 w-7 text-rose-500" />
              <div className="flex gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>
            </div>
            
            {/* Flying paper plane orbiting high */}
            <div className="absolute -top-1 w-6 h-6 animate-[bounce_2s_ease-in-out_infinite]">
              <Send className="h-5 w-5 text-sky-500 rotate-[-15deg]" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2 px-6">
            <span className="text-sm font-bold tracking-tight text-neutral-800 flex items-center justify-center gap-2">
              <span className="inline-block animate-bounce [animation-delay:0.1s]">📝</span>
              <span className="inline-block animate-bounce [animation-delay:0.2s]">✏️</span>
              <span className="inline-block animate-bounce [animation-delay:0.3s]">🎨</span>
              Folding paper planes & notes...
            </span>
            <div className="h-1 w-32 bg-zinc-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-rose-500 rounded-full animate-[shimmer_1.5s_infinite] w-1/2" style={{
                animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            </div>
            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-widest font-mono">
              Inks flowing • Canvas loading
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render landing authentication view if user is unauthenticated & has not selected Guest Sandbox Mode
  if (!user && !isGuest) {
    return (
      <LandingPage 
        onLoginSuccess={(loggedUser, loggedGuest) => {
          if (loggedUser) {
            setUser(loggedUser);
            setIsGuest(false);
            triggerToast(`Logged in successfully as ${loggedUser.displayName || loggedUser.email}`);
          } else if (loggedGuest) {
            setIsGuest(true);
            setUser(null);
            triggerToast('Entered Interactive Guest sandbox workspace.');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#1c1917] flex flex-col antialiased selection:bg-indigo-150" id="to_do_notes_container">
      
      {/* Binder Spiral springs on top of entire screen header */}
      <div className="bg-[#e2e1da] h-2 flex justify-around px-12 gap-2 border-b border-zinc-300 relative z-35" id="binder_spine_strip">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="w-2.5 h-6 -mt-1 bg-zinc-400 rounded-lg border border-zinc-600 shadow-sm" />
        ))}
      </div>

      {/* 1. Header Toolbar */}
      <header className="sticky top-0 z-30 bg-white/90 border-b-2 border-dashed border-zinc-250 backdrop-blur-md px-4 sm:px-6 py-4 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo and Brand context */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shrink-0">
                <Paintbrush className="h-5 w-5 text-amber-100" />
              </div>
            </div>
            <div>
              <h1 className="font-sketch font-bold text-[16px] sm:text-[18px] text-zinc-950 tracking-tight leading-none flex items-center gap-1.5">
                Task Management System 
                <span className="font-hand text-[10px] text-rose-500 font-extrabold rotate-[-2deg] bg-amber-100 px-1.5 py-0.5 border border-dashed border-amber-300 rounded ml-1">
                  ✏️ {user ? 'Cloud Sketch' : 'Guest Sketchpad'}
                </span>
              </h1>
              <span className="text-[10px] text-zinc-500 font-bold font-sans">
                {user 
                  ? `🎨 Cloud Sync Enabled • Welcome, ${user.displayName || user.email}` 
                  : '✈️ Local Sandbox Storage • Session persists on this desk'
                }
              </span>
            </div>
          </div>

          {/* Real-time search and settings panel */}
          <div className="flex items-center gap-2.5">
            {/* Cloud/Sync Indication light */}
            {user && (
              <div 
                className={`py-1 px-2.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                  cloudSyncing 
                    ? 'bg-amber-50/55 border-amber-200 text-amber-700 animate-pulse' 
                    : 'bg-emerald-50/55 border-emerald-150 text-emerald-700'
                }`}
                title={cloudSyncing ? 'Writing changes safely to Firestore...' : 'All changes cloud synced'}
              >
                <CloudLightning className={`h-3 w-3 ${cloudSyncing ? 'animate-bounce' : ''}`} />
                <span>{cloudSyncing ? 'SAVING' : 'SYNCED'}</span>
              </div>
            )}

            {/* Search Input bar */}
            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="header_notes_search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes and criteria..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs placeholder:text-zinc-400 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-700 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Micro Audio sound cue toggle */}
            <button
              id="header_sound_toggle_btn"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playPopSound();
              }}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200/80 shadow-xs' 
                  : 'bg-white border-zinc-200 text-zinc-450 hover:bg-zinc-50'
              }`}
              title={soundEnabled ? 'Mute checklist completion chime' : 'Enable completion sound effect'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Log Out button */}
            <button
              id="header_logout_btn"
              onClick={handleLogOut}
              className="p-2 border border-zinc-200 hover:bg-rose-50 hover:text-rose-600 rounded-xl hover:border-rose-150 flex items-center justify-center cursor-pointer transition-colors"
              title="Log out of current workspace coordinates"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Window */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Google Keep like Creator Bar */}
        <NewNoteComposer onAddNote={handleAddNote} />

        {/* 3. Filter Segment controls and Mini statistics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5 mb-8">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Colors', icon: Bookmark, activeBg: 'bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-500/10' },
              { id: 'pinned', label: 'Pinned (Sticky Stars)', icon: Pin, activeBg: 'bg-yellow-400 text-yellow-950 border-yellow-500 shadow-md shadow-yellow-500/20' },
              { id: 'checklist', label: 'To-Do Checklists', icon: CheckCircle, activeBg: 'bg-emerald-550 text-white border-emerald-650 shadow-md shadow-emerald-500/20' },
              { id: 'pure-notes', label: 'Creative Sketch Memos', icon: ListCollapse, activeBg: 'bg-sky-550 text-white border-sky-655 shadow-md shadow-sky-500/20' },
            ].map(filter => {
              const Icon = filter.icon;
              const isAct = activeFilter === filter.id;
 
              return (
                <button
                  key={filter.id}
                  id={`dashboard_filter_${filter.id}`}
                  onClick={() => {
                    setActiveFilter(filter.id as any);
                    playPopSound();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer ${
                    isAct 
                      ? filter.activeBg 
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-655'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Quick Metrics bubble */}
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-zinc-100 border border-zinc-200/40 rounded-xl leading-none text-zinc-650 shrink-0 select-none">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
            <span>Checklist Resolution Rates:</span>
            <span className="font-mono font-bold text-zinc-950 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md text-[10px]">
              {completedCheckItems}/{totalCheckItems} items done
            </span>
          </div>
        </div>

        {/* 4. Display Grids */}
        {filteredNotes.length === 0 ? (
          /* Empty State Display */
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-zinc-250/50 shadow-sm max-w-xl mx-auto w-full">
            <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-200/80 mb-4 animate-bounce">
              <FolderMinus className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 tracking-tight mb-1">No to-do notes match the criteria</h4>
            <p className="text-xs text-zinc-450 max-w-xs leading-normal">
              Compose a new note in the container above or adjust active filters to display items.
            </p>
            {(activeFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-3.5 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          /* Active Note Lists */
          <div className="flex flex-col gap-10">
            {/* Pinned notes division */}
            {pinnedNotes.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Pin className="h-3.5 w-3.5 shrink-0 text-amber-550 fill-amber-550" />
                  <span className="text-[10px] font-bold font-mono tracking-widest uppercase">Pinned Notes</span>
                  <div className="flex-1 h-px bg-zinc-200/80" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {pinnedNotes.map(n => (
                    <NoteCard
                      key={n.id}
                      note={n}
                      onUpdateNote={handleUpdateNote}
                      onDeleteNote={handleDeleteNote}
                      onSelectToEdit={setSelectedNoteToEdit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes Division */}
            {otherNotes.length > 0 && (
              <div className="flex flex-col gap-4">
                {pinnedNotes.length > 0 && (
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <span className="text-[10px] font-bold font-mono tracking-widest uppercase">Other notes</span>
                    <div className="flex-1 h-px bg-zinc-200/80" />
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {otherNotes.map(n => (
                    <NoteCard
                      key={n.id}
                      note={n}
                      onUpdateNote={handleUpdateNote}
                      onDeleteNote={handleDeleteNote}
                      onSelectToEdit={setSelectedNoteToEdit}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. Elegant Popup Editor Modal */}
      <EditNoteModal
        isOpen={selectedNoteToEdit !== null}
        onClose={() => setSelectedNoteToEdit(null)}
        note={selectedNoteToEdit}
        onSaveNote={(saved) => {
          handleUpdateNote(saved);
          setSelectedNoteToEdit(null);
          triggerToast(`Changes saved: "${saved.title || 'Untitled note'}"`);
        }}
      />

      {/* 6. Success / Action Confirmation Banner Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            id="workspace_toast_alert"
            className="fixed bottom-6 right-6 z-55 bg-zinc-900 border border-zinc-805 text-white px-[18px] py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl max-w-sm"
          >
            <div className="h-5 w-5 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20">
              <Info className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
