'use client';

import { useState, useEffect } from 'react';
import { Layers, PlusCircle, Folder, PencilLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useAppStore } from '@/store/use-app-store';
import { subscribeToSections, deleteSection } from '@/services/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import type { Section } from '@/types';

export function Sidebar() {
  const { user } = useAuth();
  const { 
    activeSectionId, 
    setActiveSectionId, 
    setSectionModalOpen,
    setRenameModalOpen,
    setSectionToRename
  } = useAppStore();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSections(user.uid, (data) => {
      setSections(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, section: Section) => {
    e.stopPropagation();
    if (!user) return;
    if (confirm(`Delete the entire section "${section.name}" and all its data? This cannot be undone.`)) {
      try {
        await deleteSection(user.uid, section.id);
        if (activeSectionId === section.id) {
          setActiveSectionId(null);
        }
      } catch (error) {
        console.error('Failed to delete section', error);
      }
    }
  };

  const handleRename = (e: React.MouseEvent, section: Section) => {
    e.stopPropagation();
    setSectionToRename(section);
    setRenameModalOpen(true);
  };

  return (
    <aside className="h-full flex flex-col bg-white border-r w-72 transition-transform duration-300">
      <div className="p-6 border-b hidden lg:flex items-center gap-3">
        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
          <Layers className="text-white h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">FlexForm</h1>
      </div>

      <div className="p-4 border-b">
        <Button 
          onClick={() => setSectionModalOpen(true)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-primary/10 transition-all h-12"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Section</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-2xl animate-pulse" />)}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm italic">
            No sections created yet.
          </div>
        ) : (
          sections.map((section) => (
            <div 
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={cn(
                "group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all",
                activeSectionId === section.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/10" 
                  : "hover:bg-indigo-50 text-gray-700"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Folder className={cn(
                  "h-4 w-4",
                  activeSectionId === section.id ? "text-indigo-100" : "text-primary/60"
                )} />
                <span className="font-bold truncate text-sm">{section.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-7 w-7 rounded-lg",
                    activeSectionId === section.id ? "hover:bg-white/20" : "hover:bg-white"
                  )}
                  onClick={(e) => handleRename(e, section)}
                >
                  <PencilLine className={cn(
                    "h-3 w-3",
                    activeSectionId === section.id ? "text-white" : "text-gray-400"
                  )} />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-7 w-7 rounded-lg",
                    activeSectionId === section.id ? "hover:bg-red-500 hover:text-white" : "hover:bg-red-50"
                  )}
                  onClick={(e) => handleDelete(e, section)}
                >
                  <Trash2 className={cn(
                    "h-3 w-3",
                    activeSectionId === section.id ? "text-white" : "text-gray-400 group-hover:text-red-500"
                  )} />
                </Button>
              </div>
            </div>
          ))
        )}
      </nav>

      <div className="p-4 border-t bg-gray-50/50 flex flex-col items-center gap-2">
        <div className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
          Built for Productivity
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border",
          isFirebaseConfigured 
            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
            : "bg-amber-50 text-amber-700 border-amber-100"
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full animate-pulse", 
            isFirebaseConfigured ? "bg-emerald-500" : "bg-amber-500"
          )} />
          <span>Storage: {isFirebaseConfigured ? 'Firebase Cloud' : 'Local Storage'}</span>
        </div>
      </div>
    </aside>
  );
}
