// Tipos para los productos
export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  sizes: ProductSize[];
  category: string;
  totalStock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para las ventas
export interface SaleItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  profit: number;
  fairId?: string;
  fairName?: string;
  createdAt: Date;
  notes?: string;
}

// Tipos para las ferias
export interface Fair {
  id: string;
  name: string;
  date: Date;
  location?: string;
  totalSales: number;
  totalProfit: number;
  createdAt: Date;
  isActive: boolean;
}

// Categorías de productos
export const PRODUCT_CATEGORIES = [
  'Conjuntos',
  'Enteritos',
  'Bodys',
  'Bandanas',
  'Ajuares',
  'Ropa Interior',
  'Higiene Femenina',
  'Otros'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
