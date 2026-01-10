import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Sale, Fair, SaleItem, ProductSize } from './types';

// ============ PRODUCTOS ============

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProduct(productId: string) {
  const productRef = doc(db, 'products', productId);
  await deleteDoc(productRef);
}

export async function getAllProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, orderBy('name'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  } as Product));
}

export async function getProductById(productId: string): Promise<Product | null> {
  const productRef = doc(db, 'products', productId);
  const productDoc = await getDoc(productRef);

  if (!productDoc.exists()) return null;

  return {
    id: productDoc.id,
    ...productDoc.data(),
    createdAt: productDoc.data().createdAt?.toDate(),
    updatedAt: productDoc.data().updatedAt?.toDate(),
  } as Product;
}

// ============ VENTAS ============

export async function addSale(sale: Omit<Sale, 'id' | 'createdAt'>) {
  const salesRef = collection(db, 'sales');
  const docRef = await addDoc(salesRef, {
    ...sale,
    createdAt: Timestamp.now(),
  });

  // Actualizar stock de productos
  for (const item of sale.items) {
    const product = await getProductById(item.productId);
    if (product) {
      // Si el producto no tiene talle (item.size === 'Sin talle'), solo actualizar totalStock
      if (item.size === 'Sin talle') {
        await updateProduct(item.productId, {
          totalStock: product.totalStock - item.quantity
        });
      } else {
        // Si tiene talle, actualizar el talle específico y el total
        const updatedSizes = product.sizes.map(s =>
          s.size === item.size
            ? { ...s, stock: s.stock - item.quantity }
            : s
        );
        const newTotalStock = updatedSizes.reduce((sum, s) => sum + s.stock, 0);

        await updateProduct(item.productId, {
          sizes: updatedSizes,
          totalStock: newTotalStock
        });
      }
    }
  }

  return docRef.id;
}

export async function getSalesByFair(fairId?: string): Promise<Sale[]> {
  const salesRef = collection(db, 'sales');
  let q;

  if (fairId) {
    q = query(salesRef, where('fairId', '==', fairId), orderBy('createdAt', 'desc'));
  } else {
    q = query(salesRef, orderBy('createdAt', 'desc'));
  }

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  } as Sale));
}

export async function getAllSales(): Promise<Sale[]> {
  return getSalesByFair();
}

export async function deleteSale(saleId: string) {
  const saleRef = doc(db, 'sales', saleId);
  await deleteDoc(saleRef);
}

// ============ FERIAS ============

export async function addFair(fair: Omit<Fair, 'id' | 'createdAt'>) {
  const fairsRef = collection(db, 'fairs');
  const docRef = await addDoc(fairsRef, {
    ...fair,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateFair(fairId: string, updates: Partial<Fair>) {
  const fairRef = doc(db, 'fairs', fairId);
  await updateDoc(fairRef, updates);
}

export async function getAllFairs(): Promise<Fair[]> {
  const fairsRef = collection(db, 'fairs');
  const q = query(fairsRef, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  } as Fair));
}

export async function getActiveFair(): Promise<Fair | null> {
  const fairsRef = collection(db, 'fairs');
  const q = query(fairsRef, where('isActive', '==', true));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  } as Fair;
}
