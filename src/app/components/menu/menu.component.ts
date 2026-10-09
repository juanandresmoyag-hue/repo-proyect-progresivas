import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { PwaService } from '../../services/pwa.service';
import { NavigationService } from '../../services/navigation.service';
import { CategoryId, Product } from '../../models/product.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="menu-page">
      <!-- Banner Promocional Principal con Espaciado Generoso -->
      <section class="hero-banner">
        <div class="container hero-content">
          <div class="hero-text">
            <span class="hero-badge">⚡ Ordena desde tu móvil sin filas</span>
            <h1>Sabor Auténtico, <br><span class="hero-highlight">Directo a tu Mesa</span></h1>
            <p>Pide tus hamburguesas, combos y bebidas favoritas. Funciona 100% sin internet.</p>
            
            <div class="hero-tags">
              <span class="tag-item">🔥 100% Carne de Res</span>
              <span class="tag-item">⏱️ Preparación Express</span>
              <span class="tag-item">📱 PWA Instalable</span>
            </div>
          </div>

          <div class="hero-image-wrap">
            <img 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80" 
              alt="FastOrder Hamburguesa" 
              class="hero-img" />
          </div>
        </div>
      </section>

      <!-- Barra de Filtros, Categorías y Búsqueda -->
      <section class="controls-section container">
        <div class="search-bar-wrap">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [ngModel]="searchTerm()" 
            (ngModelChange)="searchTerm.set($event)" 
            placeholder="Buscar por nombre o descripción (ej. Bacon, Smash, Combo...)" 
            class="search-input" />
          <button *ngIf="searchTerm()" class="clear-btn" (click)="searchTerm.set('')">✕</button>
        </div>

        <!-- Pestañas de Categoría Responsivas -->
        <div class="categories-scroll">
          <button 
            *ngFor="let cat of menuService.categories()" 
            class="category-pill" 
            [class.active]="selectedCategory() === cat.id"
            (click)="selectedCategory.set(cat.id)">
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-label">{{ cat.name }}</span>
          </button>
        </div>
      </section>

      <!-- Catálogo de Productos -->
      <section class="catalog-section container">
        <div class="catalog-header">
          <div class="title-wrap">
            <h2>{{ currentCategoryTitle() }}</h2>
            <span class="items-count">{{ filteredProducts().length }} productos disponibles</span>
          </div>
        </div>

        <!-- Sin resultados -->
        <div *ngIf="filteredProducts().length === 0" class="no-results-card animate-fade-in">
          <p class="empty-icon">🍔</p>
          <h3>No encontramos productos para tu búsqueda</h3>
          <p>Intenta con otros términos o selecciona una categoría diferente.</p>
          <button class="btn-reset" (click)="searchTerm.set(''); selectedCategory.set('all')">
            Ver Catálogo Completo
          </button>
        </div>

        <!-- Grid de Cards de Producto -->
        <div class="products-grid">
          <div 
            *ngFor="let prod of filteredProducts()" 
            class="product-card animate-fade-in">
            
            <!-- Imagen y Badges -->
            <div class="card-media" (click)="goToProductDetail(prod.id)">
              <img [src]="prod.image" [alt]="prod.name" loading="lazy" />
              <span *ngIf="prod.badge" class="badge-ribbon" [class]="'badge-' + prod.badge.toLowerCase()">
                {{ prod.badge }}
              </span>
              <span class="time-tag">⏱️ ~{{ prod.prepTimeMinutes }}m</span>
            </div>

            <!-- Contenido del Producto -->
            <div class="card-details">
              <h3 class="product-title" (click)="goToProductDetail(prod.id)">
                {{ prod.name }}
              </h3>
              <p class="product-snippet">{{ prod.description }}</p>

              <!-- Pie de la Card -->
              <div class="card-footer">
                <div class="price-container">
                  <span class="price-prefix">Precio</span>
                  <span class="price-value">\${{ prod.price.toFixed(2) }}</span>
                </div>

                <div class="action-buttons">
                  <button 
                    class="btn-customize" 
                    (click)="goToProductDetail(prod.id)"
                    title="Personalizar tamaño, extras e ingredientes en página de detalle">
                    ⚙️ Personalizar
                  </button>
                  <button 
                    class="btn-quick-add" 
                    (click)="quickAdd(prod)"
                    title="Añadir directo al pedido">
                    + Añadir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .menu-page {
      padding-bottom: 100px;
    }
    .hero-banner {
      background: linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%);
      color: white;
      padding: 40px 0;
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      margin-bottom: 28px;
    }
    .hero-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
    }
    .hero-text {
      flex: 1;
      max-width: 600px;
    }
    .hero-badge {
      background: rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      display: inline-block;
      margin-bottom: 14px;
    }
    .hero-text h1 {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 14px;
      letter-spacing: -0.5px;
    }
    .hero-highlight {
      color: var(--accent);
    }
    .hero-text p {
      font-size: 1.05rem;
      opacity: 0.95;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .hero-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .tag-item {
      background: rgba(0, 0, 0, 0.3);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .hero-image-wrap {
      flex: 0 0 340px;
      height: 240px;
    }
    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius-lg);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
      border: 3px solid rgba(255, 255, 255, 0.25);
    }
    .controls-section {
      margin-bottom: 28px;
    }
    .search-bar-wrap {
      position: relative;
      margin-bottom: 18px;
    }
    .search-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      opacity: 0.5;
    }
    .search-input {
      width: 100%;
      padding: 16px 48px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 1rem;
      background: #ffffff;
      box-shadow: var(--shadow-sm);
    }
    .clear-btn {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: #ededed;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      font-size: 0.8rem;
    }
    .categories-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
      scrollbar-width: none;
    }
    .categories-scroll::-webkit-scrollbar { display: none; }
    .category-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 22px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 999px;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--dark);
      white-space: nowrap;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .category-pill.active {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 4px 14px rgba(211, 47, 47, 0.35);
    }
    .catalog-section {
      margin-top: 10px;
    }
    .catalog-header {
      margin-bottom: 22px;
    }
    .title-wrap h2 {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--dark);
    }
    .items-count {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 24px;
    }
    .product-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid #eaeaea;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    .card-media {
      position: relative;
      height: 200px;
      cursor: pointer;
      overflow: hidden;
    }
    .card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .card-media:hover img {
      transform: scale(1.06);
    }
    .badge-ribbon {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 800;
      color: white;
    }
    .badge-popular { background: #d32f2f; }
    .badge-nuevo { background: #0288d1; }
    .badge-chef { background: #7b1fa2; }
    .badge-oferta { background: #ed6c02; }
    .time-tag {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .card-details {
      padding: 18px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .product-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 8px;
      cursor: pointer;
      line-height: 1.3;
    }
    .product-title:hover {
      color: var(--primary);
    }
    .product-snippet {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.45;
      margin-bottom: 18px;
      flex: 1;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid #f0f0f0;
      gap: 8px;
    }
    .price-prefix {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
    }
    .price-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--primary);
    }
    .action-buttons {
      display: flex;
      gap: 6px;
    }
    .btn-customize {
      background: #f4f4f5;
      color: var(--dark);
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .btn-customize:hover {
      background: #e4e4e7;
    }
    .btn-quick-add {
      background: var(--primary);
      color: #fff;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .btn-quick-add:hover {
      background: var(--primary-dark);
    }
    .no-results-card {
      text-align: center;
      padding: 60px 20px;
      background: #fff;
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-color);
    }
    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 12px;
    }
    .btn-reset {
      margin-top: 16px;
      background: var(--primary);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
    }
    @media (max-width: 850px) {
      .hero-content {
        flex-direction: column;
        text-align: center;
      }
      .hero-image-wrap {
        display: none;
      }
      .hero-tags {
        justify-content: center;
      }
      .hero-text h1 {
        font-size: 1.8rem;
      }
    }
  `]
})
export class MenuComponent {
  selectedCategory = signal<CategoryId>('all');
  searchTerm = signal<string>('');

  filteredProducts = computed(() => {
    let prods = this.menuService.products();
    const cat = this.selectedCategory();
    const query = this.searchTerm().toLowerCase().trim();

    if (cat !== 'all') {
      prods = prods.filter(p => p.categoryId === cat);
    }

    if (query) {
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return prods;
  });

  currentCategoryTitle = computed(() => {
    const cat = this.menuService.categories().find(c => c.id === this.selectedCategory());
    return cat ? cat.name : 'Menú Completo';
  });

  constructor(
    public menuService: MenuService,
    private cartService: CartService,
    public pwaService: PwaService,
    public navService: NavigationService,
    private router: Router
  ) {}

  goToProductDetail(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  quickAdd(product: Product): void {
    this.cartService.addItem(product, 1);
    this.cartService.toggleCart(true);
  }
}
