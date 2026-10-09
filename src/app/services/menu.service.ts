import { Injectable, signal } from '@angular/core';
import { Category, Product, CategoryId } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly STORAGE_KEY = 'fastorder_menu_cache';

  public categories = signal<Category[]>([
    { id: 'all', name: 'Todos', icon: '🍽️' },
    { id: 'burgers', name: 'Hamburguesas', icon: '🍔' },
    { id: 'combos', name: 'Combos & Promos', icon: '🍟' },
    { id: 'sides', name: 'Acompañamientos', icon: '🍗' },
    { id: 'drinks', name: 'Bebidas', icon: '🥤' },
    { id: 'desserts', name: 'Postres', icon: '🍦' }
  ]);

  public products = signal<Product[]>([
    {
      id: 'prod-1',
      name: 'Super Fast Bacon Doble',
      categoryId: 'burgers',
      description: 'Doble carne de res a la parrilla (300g), queso cheddar fundido, tocino ahumado ultra crocante y salsa BBQ de la casa.',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      badge: 'Popular',
      prepTimeMinutes: 10,
      availableOptions: {
        sizes: [
          { name: 'Simple (150g)', extraPrice: -2.00 },
          { name: 'Doble (300g - Estándar)', extraPrice: 0 },
          { name: 'Triple Monstruo (450g)', extraPrice: 3.00 }
        ],
        extras: [
          { id: 'ext-1', name: 'Queso Cheddar Extra', price: 1.25 },
          { id: 'ext-2', name: 'Extra Tiras de Tocino', price: 1.50 },
          { id: 'ext-3', name: 'Huevo Frito', price: 1.00 },
          { id: 'ext-4', name: 'Cebolla Caramelizada', price: 0.75 }
        ],
        removableIngredients: ['Pepinillos', 'Cebolla Morada', 'Salsa BBQ', 'Mostaza']
      }
    },
    {
      id: 'prod-2',
      name: 'Crispy Chicken Supreme',
      categoryId: 'burgers',
      description: 'Pechuga de pollo empanizada estilo sureño con especias secretas, lechuga fresca, tomate y mayonesa de ajo suave.',
      price: 7.50,
      image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
      badge: 'Chef',
      prepTimeMinutes: 8,
      availableOptions: {
        extras: [
          { id: 'ext-5', name: 'Salsa Picante Habanero', price: 0.50 },
          { id: 'ext-1', name: 'Queso Cheddar Extra', price: 1.25 }
        ],
        removableIngredients: ['Tomate', 'Lechuga', 'Mayonesa de Ajo']
      }
    },
    {
      id: 'prod-3',
      name: 'Smoky Smash Burger',
      categoryId: 'burgers',
      description: 'Técnica smash con bordes súper crujientes, queso americano, cebolla grillada y salsa secreta FastOrder.',
      price: 6.99,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      prepTimeMinutes: 7,
      availableOptions: {
        extras: [
          { id: 'ext-2', name: 'Extra Tiras de Tocino', price: 1.50 },
          { id: 'ext-1', name: 'Queso Cheddar Extra', price: 1.25 }
        ],
        removableIngredients: ['Pepinillos', 'Cebolla Grillada']
      }
    },
    {
      id: 'prod-4',
      name: 'Mega Combo Dúo Fast',
      categoryId: 'combos',
      description: '2 Hamburguesas Super Fast + 2 Papas Fritas Medianas + 2 Bebidas de 500ml a elección.',
      price: 18.50,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
      badge: 'Oferta',
      prepTimeMinutes: 12,
      availableOptions: {
        extras: [
          { id: 'ext-6', name: 'Agrandar Papas y Bebidas a Grandes', price: 2.00 },
          { id: 'ext-7', name: 'Dip Queso Fundido Grande', price: 1.75 }
        ]
      }
    },
    {
      id: 'prod-5',
      name: 'Combo Familiar Box (4 Personas)',
      categoryId: 'combos',
      description: '4 Burgers clásicas + 12 Alitas BBQ + Porción Familiar de Papas Rústicas + 1 Gaseosa 1.5L.',
      price: 32.90,
      image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80',
      badge: 'Popular',
      prepTimeMinutes: 18
    },
    {
      id: 'prod-6',
      name: 'Papas Rústicas con Queso & Bacon',
      categoryId: 'sides',
      description: 'Papas cortadas a mano con piel, bañadas en queso cheddar fundido y trocitos de tocino crujiente.',
      price: 4.50,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
      prepTimeMinutes: 5,
      availableOptions: {
        extras: [
          { id: 'ext-8', name: 'Jalapeños en Rodajas', price: 0.75 }
        ]
      }
    },
    {
      id: 'prod-7',
      name: 'Alitas Glaseadas BBQ (8 Unidades)',
      categoryId: 'sides',
      description: 'Alitas de pollo horneadas y glaseadas con salsa barbacoa dulce y toque de sésamo.',
      price: 6.80,
      image: 'https://images.unsplash.com/photo-1527477321055-436159750f78?auto=format&fit=crop&w=600&q=80',
      prepTimeMinutes: 10
    },
    {
      id: 'prod-8',
      name: 'Refresco Botella 500ml',
      categoryId: 'drinks',
      description: 'Elige entre Coca-Cola Clásica, Sin Azúcar, Sprite, Fanta Naranja o Agua Mineral.',
      price: 2.00,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      prepTimeMinutes: 1
    },
    {
      id: 'prod-9',
      name: 'Milkshake de Frutilla & Galleta Oreo',
      categoryId: 'desserts',
      description: 'Cremoso batido artesanal con helado de vainilla, puré de frutilla natural y trozos de Oreo.',
      price: 4.20,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
      badge: 'Nuevo',
      prepTimeMinutes: 4
    }
  ]);

  constructor() {
    this.loadFromCacheOrSaveInitial();
  }

  private loadFromCacheOrSaveInitial(): void {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        try {
          this.products.set(JSON.parse(cached));
        } catch {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products()));
        }
      } else {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products()));
      }
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }
}
