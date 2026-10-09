import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { NavigationService } from '../../services/navigation.service';
import { Product, ExtraOption, SelectedOptions } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="product-detail-page container">
      <!-- Botón Superior de Retroceso -->
      <div class="top-nav-bar">
        <button class="btn-back" (click)="navService.goBack()">
          <span class="arrow">⬅️</span>
          <span>Volver</span>
        </button>
        <span class="category-crumb" *ngIf="product()">
          Menú / {{ product()?.name }}
        </span>
      </div>

      <div *ngIf="!product()" class="not-found animate-fade-in">
        <h2>Producto no encontrado</h2>
        <p>El producto solicitado no existe o fue retirado del menú.</p>
        <button class="btn-primary" routerLink="/menu">Explorar Menú</button>
      </div>

      <!-- Contenido Principal en 2 Columnas (Desktop) / 1 Columna (Móvil) -->
      <div *ngIf="product()" class="detail-layout animate-fade-in">
        <!-- Columna Izquierda: Imagen Grande y Badges -->
        <div class="image-column">
          <div class="main-image-card">
            <img [src]="product()!.image" [alt]="product()!.name" class="product-hero-img" />
            <span *ngIf="product()!.badge" class="badge-tag" [class]="'badge-' + product()!.badge?.toLowerCase()">
              {{ product()!.badge }}
            </span>
            <span class="prep-badge">⏱️ Preparación ~{{ product()!.prepTimeMinutes }} min</span>
          </div>
        </div>

        <!-- Columna Derecha: Configuración, Extras y Agregar -->
        <div class="info-column">
          <div class="header-info">
            <h1 class="product-title">{{ product()!.name }}</h1>
            <div class="price-box">
              <span class="price-label">Precio Unitario</span>
              <span class="price-amount">\${{ calculatedUnitPrice.toFixed(2) }}</span>
            </div>
          </div>

          <p class="product-description">{{ product()!.description }}</p>

          <!-- 1. Selección de Tamaño -->
          <div *ngIf="product()!.availableOptions?.sizes?.length" class="custom-card">
            <h3 class="section-title">
              <span class="step-num">1</span> Elige el Tamaño
            </h3>
            <div class="sizes-list">
              <label 
                *ngFor="let size of product()!.availableOptions?.sizes" 
                class="size-card"
                [class.selected]="selectedSize === size.name">
                <input 
                  type="radio" 
                  name="productSize" 
                  [value]="size.name" 
                  [(ngModel)]="selectedSize"
                  (change)="recalculatePrice()" />
                <div class="size-text">
                  <span class="size-name">{{ size.name }}</span>
                  <span class="size-diff" *ngIf="size.extraPrice !== 0">
                    ({{ size.extraPrice > 0 ? '+' : '' }}\${{ size.extraPrice.toFixed(2) }})
                  </span>
                </div>
              </label>
            </div>
          </div>

          <!-- 2. Extras y Adicionales -->
          <div *ngIf="product()!.availableOptions?.extras?.length" class="custom-card">
            <h3 class="section-title">
              <span class="step-num">2</span> Adicionales y Extras
            </h3>
            <div class="extras-grid">
              <label 
                *ngFor="let extra of product()!.availableOptions?.extras" 
                class="extra-card"
                [class.checked]="isExtraSelected(extra)">
                <input 
                  type="checkbox" 
                  [checked]="isExtraSelected(extra)" 
                  (change)="toggleExtra(extra)" />
                <span class="extra-name">{{ extra.name }}</span>
                <span class="extra-cost">+\${{ extra.price.toFixed(2) }}</span>
              </label>
            </div>
          </div>

          <!-- 3. Quitar Ingredientes -->
          <div *ngIf="product()!.availableOptions?.removableIngredients?.length" class="custom-card">
            <h3 class="section-title">
              <span class="step-num">3</span> ¿Deseas retirar algún ingrediente?
            </h3>
            <div class="remove-pills">
              <button 
                type="button" 
                *ngFor="let ing of product()!.availableOptions?.removableIngredients" 
                class="pill-btn" 
                [class.removed]="removedIngredients.includes(ing)"
                (click)="toggleRemoveIngredient(ing)">
                {{ removedIngredients.includes(ing) ? '❌ Sin ' + ing : '✓ Con ' + ing }}
              </button>
            </div>
          </div>

          <!-- 4. Notas para Cocina -->
          <div class="custom-card">
            <h3 class="section-title">
              <span class="step-num">4</span> Instrucciones Especiales para Cocina
            </h3>
            <textarea 
              [(ngModel)]="specialNotes" 
              placeholder="Ej. Tostar bien el pan, servilletas extra, cortar a la mitad..."
              rows="2"
              class="notes-textarea">
            </textarea>
          </div>

          <!-- Barra de Acción y Compra -->
          <div class="action-footer">
            <div class="quantity-controller">
              <span class="qty-label">Cantidad:</span>
              <div class="qty-stepper">
                <button type="button" class="btn-step" (click)="adjustQuantity(-1)" [disabled]="quantity <= 1">-</button>
                <span class="qty-val">{{ quantity }}</span>
                <button type="button" class="btn-step" (click)="adjustQuantity(1)">+</button>
              </div>
            </div>

            <button class="btn-add-cart" (click)="addToCart()">
              <span class="cart-icon">🛒</span>
              <span>Añadir al Carrito • \${{ (calculatedUnitPrice * quantity).toFixed(2) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding: 24px 16px 90px 16px;
      max-width: 1100px;
    }
    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--dark);
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
    }
    .btn-back:hover {
      background: #f4f4f5;
      transform: translateX(-2px);
    }
    .category-crumb {
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 36px;
      align-items: start;
    }
    .main-image-card {
      position: relative;
      background: #ffffff;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-md);
      height: 400px;
    }
    .product-hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge-tag {
      position: absolute;
      top: 16px;
      left: 16px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 800;
      color: #fff;
    }
    .badge-popular { background: #d32f2f; }
    .badge-nuevo { background: #0288d1; }
    .badge-chef { background: #7b1fa2; }
    .badge-oferta { background: #ed6c02; }
    .prep-badge {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: rgba(0,0,0,0.75);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
    }
    .info-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .product-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--dark);
      line-height: 1.2;
    }
    .price-box {
      text-align: right;
      background: #ffebee;
      padding: 8px 14px;
      border-radius: var(--radius-md);
    }
    .price-label {
      font-size: 0.75rem;
      color: var(--primary-dark);
      font-weight: 700;
      display: block;
      text-transform: uppercase;
    }
    .price-amount {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--primary);
    }
    .product-description {
      font-size: 1.05rem;
      color: #555;
      line-height: 1.6;
    }
    .custom-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 18px;
      box-shadow: var(--shadow-sm);
    }
    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--dark);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }
    .step-num {
      background: var(--primary);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
    }
    .sizes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .size-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .size-card.selected {
      border-color: var(--primary);
      background: #fff5f5;
    }
    .size-text {
      display: flex;
      justify-content: space-between;
      width: 100%;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .size-diff {
      color: var(--primary);
    }
    .extras-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }
    .extra-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .extra-card.checked {
      border-color: var(--accent);
      background: #fffde7;
    }
    .extra-cost {
      color: var(--primary);
      font-weight: 700;
    }
    .remove-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .pill-btn {
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #f0f0f0;
      color: #555;
    }
    .pill-btn.removed {
      background: #ffebee;
      color: var(--primary);
    }
    .notes-textarea {
      width: 100%;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.95rem;
      resize: vertical;
    }
    .action-footer {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      box-shadow: var(--shadow-md);
    }
    .quantity-controller {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .qty-label {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--dark);
    }
    .qty-stepper {
      display: flex;
      align-items: center;
      background: #f0f0f0;
      border-radius: 8px;
      padding: 4px;
    }
    .btn-step {
      width: 38px;
      height: 38px;
      background: #fff;
      border-radius: 6px;
      font-weight: 800;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qty-val {
      padding: 0 14px;
      font-weight: 800;
      font-size: 1.05rem;
    }
    .btn-add-cart {
      flex: 1;
      background: var(--primary);
      color: white;
      font-weight: 800;
      font-size: 1.05rem;
      padding: 16px 20px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(211, 47, 47, 0.35);
    }
    .btn-add-cart:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
    }
    @media (max-width: 850px) {
      .detail-layout {
        grid-template-columns: 1fr;
      }
      .main-image-card {
        height: 260px;
      }
      .product-title {
        font-size: 1.5rem;
      }
      .action-footer {
        flex-direction: column;
        align-items: stretch;
      }
      .quantity-controller {
        justify-content: space-between;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  quantity = 1;
  selectedSize?: string;
  selectedExtras: ExtraOption[] = [];
  removedIngredients: string[] = [];
  specialNotes = '';
  calculatedUnitPrice = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private cartService: CartService,
    public navService: NavigationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.menuService.getProductById(id);
        if (found) {
          this.product.set(found);
          if (found.availableOptions?.sizes?.length) {
            this.selectedSize = found.availableOptions.sizes[1]?.name || found.availableOptions.sizes[0].name;
          }
          this.recalculatePrice();
        }
      }
    });
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
    const p = this.product();
    if (!p) return;

    let price = p.price;
    if (this.selectedSize && p.availableOptions?.sizes) {
      const sizeObj = p.availableOptions.sizes.find(s => s.name === this.selectedSize);
      if (sizeObj) price += sizeObj.extraPrice;
    }
    const extrasTotal = this.selectedExtras.reduce((sum, e) => sum + e.price, 0);
    this.calculatedUnitPrice = +(price + extrasTotal).toFixed(2);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    const options: SelectedOptions = {
      size: this.selectedSize,
      selectedExtras: [...this.selectedExtras],
      removedIngredients: [...this.removedIngredients],
      specialNotes: this.specialNotes.trim() || undefined
    };

    this.cartService.addItem(p, this.quantity, options);
    this.cartService.toggleCart(true);
    this.router.navigate(['/menu']);
  }
}
