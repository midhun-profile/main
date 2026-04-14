
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
  setDoc,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Section, Entry, FieldBlueprint } from '@/types';

const USERS_COL = 'users';

// Sections
export const subscribeToSections = (userId: string, callback: (sections: Section[]) => void) => {
  const q = query(
    collection(db, USERS_COL, userId, 'sections'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
    callback(sections);
  });
};

export const createSection = async (userId: string, name: string, blueprint: FieldBlueprint[]) => {
  return addDoc(collection(db, USERS_COL, userId, 'sections'), {
    name,
    blueprint,
    userId,
    createdAt: Date.now()
  });
};

export const updateSection = async (userId: string, sectionId: string, updates: Partial<Section>) => {
  const docRef = doc(db, USERS_COL, userId, 'sections', sectionId);
  return updateDoc(docRef, updates);
};

export const deleteSection = async (userId: string, sectionId: string) => {
  const docRef = doc(db, USERS_COL, userId, 'sections', sectionId);
  // Also delete all entries associated with this section
  const entriesQ = query(collection(db, USERS_COL, userId, 'entries'), where('sectionId', '==', sectionId));
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
  const q = query(
    collection(db, USERS_COL, userId, 'entries'),
    where('sectionId', '==', sectionId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
    callback(entries);
  });
};

export const createEntry = async (userId: string, sectionId: string, values: Record<string, any>) => {
  return addDoc(collection(db, USERS_COL, userId, 'entries'), {
    sectionId,
    userId,
    values,
    createdAt: Date.now()
  });
};

export const updateEntry = async (userId: string, entryId: string, values: Record<string, any>) => {
  const docRef = doc(db, USERS_COL, userId, 'entries', entryId);
  return updateDoc(docRef, { values });
};

export const deleteEntry = async (userId: string, entryId: string) => {
  const docRef = doc(db, USERS_COL, userId, 'entries', entryId);
  return deleteDoc(docRef);
};
