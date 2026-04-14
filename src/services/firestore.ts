import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Section, Entry, FieldBlueprint } from '@/types';

// Simple implementation of a subscriber pattern for localStorage fallback
class LocalDB {
  private listeners: Record<string, Function[]> = {};

  private notify(key: string) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb());
    }
  }

  subscribe(key: string, cb: Function) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(cb);
    return () => {
      this.listeners[key] = this.listeners[key].filter(l => l !== cb);
    };
  }

  getData<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  saveData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
    this.notify(key);
  }
}

const localDB = new LocalDB();
const STORAGE_KEYS = {
  SECTIONS: 'flexform_sections',
  ENTRIES: 'flexform_entries'
};

// Sections
export const subscribeToSections = (userId: string, callback: (sections: Section[]) => void) => {
  if (!isFirebaseConfigured || !db) {
    const fetch = () => {
      const all = localDB.getData<Section>(STORAGE_KEYS.SECTIONS);
      const filtered = all.filter(s => s.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
      callback(filtered);
    };
    fetch();
    return localDB.subscribe(STORAGE_KEYS.SECTIONS, fetch);
  }

  const q = query(
    collection(db, 'users', userId, 'sections'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
    callback(sections);
  });
};

export const createSection = async (userId: string, name: string, blueprint: FieldBlueprint[]) => {
  if (!isFirebaseConfigured || !db) {
    const id = Math.random().toString(36).substring(2, 11);
    const newSection: Section = {
      id,
      name,
      blueprint,
      userId,
      createdAt: Date.now()
    };
    const all = localDB.getData<Section>(STORAGE_KEYS.SECTIONS);
    localDB.saveData(STORAGE_KEYS.SECTIONS, [newSection, ...all]);
    return { id };
  }
  return addDoc(collection(db, 'users', userId, 'sections'), {
    name,
    blueprint,
    userId,
    createdAt: Date.now()
  });
};

export const updateSection = async (userId: string, sectionId: string, updates: Partial<Section>) => {
  if (!isFirebaseConfigured || !db) {
    const all = localDB.getData<Section>(STORAGE_KEYS.SECTIONS);
    const updated = all.map(s => s.id === sectionId ? { ...s, ...updates } : s);
    localDB.saveData(STORAGE_KEYS.SECTIONS, updated);
    return;
  }
  const docRef = doc(db, 'users', userId, 'sections', sectionId);
  return updateDoc(docRef, updates);
};

export const deleteSection = async (userId: string, sectionId: string) => {
  if (!isFirebaseConfigured || !db) {
    const sections = localDB.getData<Section>(STORAGE_KEYS.SECTIONS).filter(s => s.id !== sectionId);
    const entries = localDB.getData<Entry>(STORAGE_KEYS.ENTRIES).filter(e => e.sectionId !== sectionId);
    localDB.saveData(STORAGE_KEYS.SECTIONS, sections);
    localDB.saveData(STORAGE_KEYS.ENTRIES, entries);
    return;
  }

  const docRef = doc(db, 'users', userId, 'sections', sectionId);
  const entriesQ = query(collection(db, 'users', userId, 'entries'), where('sectionId', '==', sectionId));
  const entriesSnapshot = await getDocs(entriesQ);
  const batch = writeBatch(db);
  entriesSnapshot.forEach((entryDoc) => {
    batch.delete(entryDoc.ref);
  });
  batch.delete(docRef);
  return batch.commit();
};

// Entries
export const subscribeToEntries = (userId: string, sectionId: string, callback: (entries: Entry[]) => void) => {
  if (!isFirebaseConfigured || !db) {
    const fetch = () => {
      const all = localDB.getData<Entry>(STORAGE_KEYS.ENTRIES);
      const filtered = all
        .filter(e => e.sectionId === sectionId && e.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
      callback(filtered);
    };
    fetch();
    return localDB.subscribe(STORAGE_KEYS.ENTRIES, fetch);
  }

  const q = query(
    collection(db, 'users', userId, 'entries'),
    where('sectionId', '==', sectionId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
    callback(entries);
  });
};

export const createEntry = async (userId: string, sectionId: string, values: Record<string, any>) => {
  if (!isFirebaseConfigured || !db) {
    const id = Math.random().toString(36).substring(2, 11);
    const newEntry: Entry = {
      id,
      sectionId,
      userId,
      values,
      createdAt: Date.now()
    };
    const all = localDB.getData<Entry>(STORAGE_KEYS.ENTRIES);
    localDB.saveData(STORAGE_KEYS.ENTRIES, [newEntry, ...all]);
    return { id };
  }
  return addDoc(collection(db, 'users', userId, 'entries'), {
    sectionId,
    userId,
    values,
    createdAt: Date.now()
  });
};

export const updateEntry = async (userId: string, entryId: string, values: Record<string, any>) => {
  if (!isFirebaseConfigured || !db) {
    const all = localDB.getData<Entry>(STORAGE_KEYS.ENTRIES);
    const updated = all.map(e => e.id === entryId ? { ...e, values: { ...e.values, ...values } } : e);
    localDB.saveData(STORAGE_KEYS.ENTRIES, updated);
    return;
  }
  const docRef = doc(db, 'users', userId, 'entries', entryId);
  return updateDoc(docRef, { values });
};

export const deleteEntry = async (userId: string, entryId: string) => {
  if (!isFirebaseConfigured || !db) {
    const all = localDB.getData<Entry>(STORAGE_KEYS.ENTRIES);
    const filtered = all.filter(e => e.id !== entryId);
    localDB.saveData(STORAGE_KEYS.ENTRIES, filtered);
    return;
  }
  const docRef = doc(db, 'users', userId, 'entries', entryId);
  return deleteDoc(docRef);
};