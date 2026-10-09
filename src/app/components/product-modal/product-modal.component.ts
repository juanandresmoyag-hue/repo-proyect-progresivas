import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ExtraOption, SelectedOptions } from '../../models/product.model';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop animate-fade-in" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Encabezado con imagen -->
        <div class="modal-header">
          <img [src]="product.image" [alt]="product.name" class="modal-img" />
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <div class="modal-body">
          <div class="title-row">
            <h2>{{ product.name }}</h2>
            <span class="price">\${{ calculatedPrice.toFixed(2) }}</span>
          </div>
          <p class="description">{{ product.description }}</p>

          <!-- Selección de Tamaño (si aplica) -->
          <div *ngIf="product.availableOptions?.sizes?.length" class="option-section">
            <h4 class="section-title">1. Elige el tamaño</h4>
            <div class="size-options">
              <label 
                *ngFor="let size of product.availableOptions?.sizes" 
                class="size-pill" 
                [class.selected]="selectedSize === size.name">
                <input 
                  type="radio" 
                  name="productSize" 
                  [value]="size.name" 
                  [(ngModel)]="selectedSize"
                  (change)="recalculatePrice()" />
                <span>{{ size.name }}</span>
                <small *ngIf="size.extraPrice !== 0">
                  ({{ size.extraPrice > 0 ? '+' : '' }}\${{ size.extraPrice.toFixed(2) }})
                </small>
              </label>
            </div>
          </div>

          <!-- Extras / Adicionales -->
          <div *ngIf="product.availableOptions?.extras?.length" class="option-section">
            <h4 class="section-title">2. Añade extras deliciosos</h4>
            <div class="extras-grid">
              <label 
                *ngFor="let extra of product.availableOptions?.extras" 
                class="extra-item"
                [class.checked]="isExtraSelected(extra)">
                <input 
                  type="checkbox" 
                  [checked]="isExtraSelected(extra)" 
                  (change)="toggleExtra(extra)" />
                <span class="extra-name">{{ extra.name }}</span>
                <span class="extra-price">+\${{ extra.price.toFixed(2) }}</span>
              </label>
            </div>
          </div>

          <!-- Quitar Ingredientes -->
          <div *ngIf="product.availableOptions?.removableIngredients?.length" class="option-section">
            <h4 class="section-title">3. ¿Deseas retirar algún ingrediente?</h4>
            <div class="remove-tags">
              <button 
                type="button" 
                *ngFor="let ing of product.availableOptions?.removableIngredients" 
                class="remove-tag" 
                [class.removed]="removedIngredients.includes(ing)"
                (click)="toggleRemoveIngredient(ing)">
                {{ removedIngredients.includes(ing) ? '❌ Sin ' + ing : '✓ Con ' + ing }}
              </button>
            </div>
          </div>

          <!-- Notas especiales -->
          <div class="option-section">
            <h4 class="section-title">Instrucciones especiales para cocina</h4>
            <input 
              type="text" 
              [(ngModel)]="specialNotes" 
              placeholder="Ej. Tostar bien el pan, servilletas extra..." 
              class="notes-input" />
          </div>

          <!-- Selector de Cantidad y Botón de Agregar -->
          <div class="modal-footer">
            <div class="quantity-picker">
              <button class="qty-btn" (click)="adjustQuantity(-1)" [disabled]="quantity <= 1">-</button>
              <span class="qty-number">{{ quantity }}</span>
              <button class="qty-btn" (click)="adjustQuantity(1)">+</button>
            </div>

            <button class="add-btn" (click)="confirmAddToCart()">
              Agregar al Pedido (\${{ (calculatedPrice * quantity).toFixed(2) }})
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      border-radius: var(--radius-lg);
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      position: relative;
      width: 100%;
      height: 200px;
    }
    .modal-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .modal-body {
      padding: 20px;
    }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .title-row h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--dark);
    }
    .title-row .price {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--primary);
    }
    .description {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 18px;
    }
    .option-section {
      margin-bottom: 18px;
      border-top: 1px solid #f0f0f0;
      padding-top: 14px;
    }
    .section-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--dark);
    }
    .size-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .size-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .size-pill.selected {
      border-color: var(--primary);
      background: #ffebee;
      color: var(--primary-dark);
    }
    .extras-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .extra-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .extra-item.checked {
      border-color: var(--accent);
      background: #fffde7;
    }
    .extra-price {
      color: var(--primary);
      font-weight: 700;
    }
    .remove-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .remove-tag {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #f0f0f0;
      color: #555;
    }
    .remove-tag.removed {
      background: #ffebee;
      color: var(--primary);
    }
    .notes-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .modal-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 2px solid #f5f5f5;
    }
    .quantity-picker {
      display: flex;
      align-items: center;
      background: #f0f0f0;
      border-radius: 10px;
      padding: 4px;
    }
    .qty-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qty-number {
      padding: 0 14px;
      font-weight: 800;
      font-size: 1rem;
    }
    .add-btn {
      flex: 1;
      background: var(--primary);
      color: white;
      font-weight: 700;
      font-size: 1rem;
      padding: 14px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
    }
    .add-btn:hover {
      background: var(--primary-dark);
    }
  `]
})
export class ProductModalComponent implements OnInit {
  @Input({ required: true }) product!: Product;
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<{ product: Product; quantity: number; options: SelectedOptions }>();

  quantity = 1;
  selectedSize?: string;
  selectedExtras: ExtraOption[] = [];
  removedIngredients: string[] = [];
  specialNotes = '';
  calculatedPrice = 0;

  ngOnInit(): void {
    if (this.product.availableOptions?.sizes?.length) {
      // Elegir el del medio o el primero por defecto
      this.selectedSize = this.product.availableOptions.sizes[1]?.name || this.product.availableOptions.sizes[0].name;
    }
    this.recalculatePrice();
  }

  isExtraSelected(extra: ExtraOption): boolean {
    return this.selectedExtras.some(e => e.id === extra.id);
  }

  toggleExtra(extra: ExtraOption): void {
    if (this.isExtraSelected(extra)) {
      this.selectedExtras = this.selectedExtras.filter(e => e.id !== extra.id);
    } else {
      this.selectedExtras.push(extra);
    }
    this.recalculatePrice();
  }

  toggleRemoveIngredient(ing: string): void {
    if (this.removedIngredients.includes(ing)) {
      this.removedIngredients = this.removedIngredients.filter(i => i !== ing);
    } else {
      this.removedIngredients.push(ing);
    }
  }

  adjustQuantity(delta: number): void {
    const next = this.quantity + delta;
    if (next >= 1) this.quantity = next;
  }

  recalculatePrice(): void {
    let price = this.product.price;
    if (this.selectedSize && this.product.availableOptions?.sizes) {
      const sizeObj = this.product.availableOptions.sizes.find(s => s.name === this.selectedSize);
      if (sizeObj) price += sizeObj.extraPrice;
    }
    const extrasTotal = this.selectedExtras.reduce((sum, e) => sum + e.price, 0);
    this.calculatedPrice = +(price + extrasTotal).toFixed(2);
  }

  confirmAddToCart(): void {
    const options: SelectedOptions = {
      size: this.selectedSize,
      selectedExtras: [...this.selectedExtras],
      removedIngredients: [...this.removedIngredients],
      specialNotes: this.specialNotes.trim() || undefined
    };

    this.add.emit({
      product: this.product,
      quantity: this.quantity,
      options
    });
  }
}
