export type CategoryId = 'all' | 'burgers' | 'combos' | 'sides' | 'drinks' | 'desserts';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: CategoryId;
  description: string;
  price: number;
  image: string;
  badge?: 'Popular' | 'Nuevo' | 'Chef' | 'Oferta';
  prepTimeMinutes: number;
  availableOptions?: {
    sizes?: { name: string; extraPrice: number }[];
    extras?: ExtraOption[];
    removableIngredients?: string[];
  };
}

export interface SelectedOptions {
  size?: string;
  selectedExtras?: ExtraOption[];
  removedIngredients?: string[];
  specialNotes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  basePrice: number;
  finalUnitPrice: number;
  quantity: number;
  image: string;
  options?: SelectedOptions;
}

export type OrderStatus = 'RECIBIDO' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

export interface Order {
  id: string;
  clientName: string;
  serviceType: 'MESA' | 'LLEVAR' | 'AUTOSERVICIO';
  tableNumber?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  estimatedMinutes: number;
  isOfflineCreated: boolean;
  isSynced: boolean;
}
