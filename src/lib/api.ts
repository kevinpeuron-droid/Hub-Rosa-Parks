import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { DashboardItem } from '../types';

const ITEMS_COLLECTION = 'items';

export const getItems = async (userId: string): Promise<DashboardItem[]> => {
  // On récupère tous les éléments de la collection sans filtrer par appareil
  // afin que les données soient synchronisées entre l'ordinateur et le téléphone.
  const q = query(collection(db, ITEMS_COLLECTION));
  const querySnapshot = await getDocs(q);
  
  const items: DashboardItem[] = [];
  querySnapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() } as DashboardItem);
  });
  
  return items.sort((a, b) => b.createdAt - a.createdAt);
};

export const createItem = async (item: Omit<DashboardItem, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
    ...item,
    createdAt: Date.now()
  });
  return docRef.id;
};

export const updateItem = async (id: string, updates: Partial<DashboardItem>): Promise<void> => {
  const docRef = doc(db, ITEMS_COLLECTION, id);
  await updateDoc(docRef, updates);
};

export const deleteItem = async (id: string, allItems: DashboardItem[]): Promise<void> => {
  // If it's a folder, we should also delete all children (recursive deletion would be ideal, but for now we'll do a simple child removal or just leave them orphaned. Better to delete them)
  const itemsToDelete = [id];
  
  const findChildren = (parentId: string) => {
    const children = allItems.filter(item => item.parentId === parentId);
    for (const child of children) {
      itemsToDelete.push(child.id);
      if (child.type === 'folder') {
        findChildren(child.id);
      }
    }
  };
  
  findChildren(id);
  
  for (const itemId of itemsToDelete) {
    await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
  }
};
