
'use client';

import { useState, useEffect } from 'react';
import { Compass, Plus, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useAppStore } from '@/store/use-app-store';
import { subscribeToSections, subscribeToEntries, createEntry } from '@/services/firestore';
import { EntryCard } from '@/components/entries/entry-card';
import { EditFieldsModal } from '@/components/modals/edit-fields-modal';
import type { Section, Entry } from '@/types';

export function SectionView() {
  const { user } = useAuth();
  const { 
    activeSectionId, 
    setSectionModalOpen, 
    setEditFieldsModalOpen 
  } = useAppStore();
  
  const [section, setSection] = useState<Section | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  useEffect(() => {
    if (!user || !activeSectionId) {
      setSection(null);
      setEntries([]);
      return;
    }

    setIsLoading(true);
    const unsubSection = subscribeToSections(user.uid, (sections) => {
      const active = sections.find(s => s.id === activeSectionId);
      if (active) {
        setSection(active);
      }
    });

    const unsubEntries = subscribeToEntries(user.uid, activeSectionId, (data) => {
      setEntries(data);
      setIsLoading(false);
    });

    return () => {
      unsubSection();
      unsubEntries();
    };
  }, [user, activeSectionId]);

  const handleAddEntry = async () => {
    if (!user || !section) return;
    setIsAddingEntry(true);
    try {
      const defaultValues: Record<string, any> = {};
      section.blueprint.forEach(f => defaultValues[f.name] = '');
      await createEntry(user.uid, section.id, defaultValues);
    } catch (error) {
      console.error('Failed to add entry', error);
    } finally {
      setIsAddingEntry(false);
    }
  };

  if (!activeSectionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-24 h-24 bg-indigo-100 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Compass className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to FlexForm</h2>
        <p className="text-gray-500 max-w-sm mb-8">Start by creating a new section to organize your dynamic forms and data entries.</p>
        
        <Button 
          onClick={() => setSectionModalOpen(true)}
          className="lg:hidden bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3 h-14"
        >
          <Plus className="h-5 w-5" />
          <span>Create Your First Section</span>
        </Button>
      </div>
    );
  }

  if (isLoading && !section) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {section?.name || 'Loading...'}
            </h2>
            <Button 
              size="icon" 
              variant="ghost" 
              className="p-2 text-primary/40 hover:text-primary transition-colors h-10 w-10"
              onClick={() => setEditFieldsModalOpen(true)}
              title="Edit fields/blueprint"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            {entries.length} {entries.length === 1 ? 'Item' : 'Items'} registered
          </p>
        </div>
        <div>
          <Button 
            onClick={handleAddEntry}
            disabled={isAddingEntry}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 h-12"
          >
            {isAddingEntry ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Add New Item</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
            <p className="text-gray-400 font-medium">No items found. Click "Add New Item" to start.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              blueprint={section?.blueprint || []} 
            />
          ))
        )}
      </div>

      <EditFieldsModal section={section} />
    </div>
  );
}
