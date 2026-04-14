
import { create } from 'zustand';
import type { Section } from '@/types';

interface AppState {
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  
  // Modal states
  isSectionModalOpen: boolean;
  setSectionModalOpen: (open: boolean) => void;
  
  isRenameModalOpen: boolean;
  setRenameModalOpen: (open: boolean) => void;
  sectionToRename: Section | null;
  setSectionToRename: (section: Section | null) => void;
  
  isEditFieldsModalOpen: boolean;
  setEditFieldsModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeSectionId: null,
  setActiveSectionId: (id) => set({ activeSectionId: id }),
  
  isSectionModalOpen: false,
  setSectionModalOpen: (open) => set({ isSectionModalOpen: open }),
  
  isRenameModalOpen: false,
  setRenameModalOpen: (open) => set({ isRenameModalOpen: open }),
  sectionToRename: null,
  setSectionToRename: (section) => set({ sectionToRename: section }),
  
  isEditFieldsModalOpen: false,
  setEditFieldsModalOpen: (open) => set({ isEditFieldsModalOpen: open }),
}));
