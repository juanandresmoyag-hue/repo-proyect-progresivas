import { Injectable, signal, computed } from '@angular/core';
import { OrderItem, Product, SelectedOptions } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'fastorder_cart';

  public items = signal<OrderItem[]>([]);
  public isCartOpen = signal<boolean>(false);
  public clientName = signal<string>('');
  public serviceType = signal<'MESA' | 'LLEVAR' | 'AUTOSERVICIO'>('MESA');
  public tableNumber = signal<string>('1');
  public generalNotes = signal<string>('');

  public itemCount = computed(() => {
    return this.items().reduce((acc, item) => acc + item.quantity, 0);
  });

  public subtotal = computed(() => {
    return this.items().reduce((acc, item) => acc + (item.finalUnitPrice * item.quantity), 0);
  });

  public discount = computed(() => {
    // Descuento automático del 5% si el subtotal supera los $25
    return this.subtotal() >= 25 ? +(this.subtotal() * 0.05).toFixed(2) : 0;
  });

  public total = computed(() => {
    return +(this.subtotal() - this.discount()).toFixed(2);
  });

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          this.items.set(JSON.parse(saved));
        } catch {}
      }
    }
  }

  private saveCart(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
    }
  }

  public addItem(product: Product, quantity = 1, options?: SelectedOptions): void {
    let finalUnitPrice = product.price;

    if (options?.size) {
      const sizeOpt = product.availableOptions?.sizes?.find(s => s.name === options.size);
      if (sizeOpt) finalUnitPrice += sizeOpt.extraPrice;
    }

    if (options?.selectedExtras?.length) {
      const extrasTotal = options.selectedExtras.reduce((sum, e) => sum + e.price, 0);
      finalUnitPrice += extrasTotal;
    }

    const current = [...this.items()];
    // Generar un ID único basado en producto y opciones para distinguir personalizaciones
    const optionSignature = JSON.stringify(options || {});
    const existingIndex = current.findIndex(
      i => i.productId === product.id && JSON.stringify(i.options || {}) === optionSignature
    );

    if (existingIndex > -1) {
      current[existingIndex].quantity += quantity;
    } else {
      current.push({
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        finalUnitPrice: +finalUnitPrice.toFixed(2),
        quantity,
        image: product.image,
        options
      });
    }

    this.items.set(current);
    this.saveCart();
  }

  public updateQuantity(itemId: string, delta: number): void {
    const current = this.items()
      .map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is OrderItem => item !== null);

    this.items.set(current);
    this.saveCart();
  }

  public removeItem(itemId: string): void {
    this.items.set(this.items().filter(i => i.id !== itemId));
    this.saveCart();
  }

  public clearCart(): void {
    this.items.set([]);
    this.generalNotes.set('');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  public toggleCart(open?: boolean): void {
    if (open !== undefined) {
      this.isCartOpen.set(open);
    } else {
      this.isCartOpen.set(!this.isCartOpen());
    }
  }
}
