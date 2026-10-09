import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderStatus } from '../models/product.model';
import { PwaService } from './pwa.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly STORAGE_ORDERS = 'fastorder_active_orders';
  private readonly STORAGE_OFFLINE_QUEUE = 'fastorder_offline_queue';

  public orders = signal<Order[]>([
    {
      id: 'FO-5120',
      clientName: 'Carlos Mendoza',
      serviceType: 'MESA',
      tableNumber: '4',
      items: [
        {
          id: 'it-1',
          productId: 'prod-1',
          name: 'Super Fast Bacon Doble',
          basePrice: 8.99,
          finalUnitPrice: 10.49,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          options: {
            size: 'Doble (300g - Estándar)',
            selectedExtras: [{ id: 'ext-2', name: 'Extra Tiras de Tocino', price: 1.50 }],
            removedIngredients: ['Pepinillos']
          }
        },
        {
          id: 'it-2',
          productId: 'prod-8',
          name: 'Refresco Botella 500ml',
          basePrice: 2.00,
          finalUnitPrice: 2.00,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
        }
      ],
      subtotal: 24.98,
      discount: 0,
      total: 24.98,
      status: 'EN_PREPARACION',
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      estimatedMinutes: 15,
      isOfflineCreated: false,
      isSynced: true
    },
    {
      id: 'FO-4890',
      clientName: 'María Fernanda Ruiz',
      serviceType: 'LLEVAR',
      items: [
        {
          id: 'it-3',
          productId: 'prod-4',
          name: 'Mega Combo Dúo Fast',
          basePrice: 18.50,
          finalUnitPrice: 20.50,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
          options: {
            selectedExtras: [{ id: 'ext-6', name: 'Agrandar Papas y Bebidas a Grandes', price: 2.00 }]
          }
        }
      ],
      subtotal: 20.50,
      discount: 0,
      total: 20.50,
      status: 'LISTO',
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      estimatedMinutes: 12,
      isOfflineCreated: false,
      isSynced: true
    }
  ]);

  public offlineQueue = signal<Order[]>([]);

  public pendingSyncCount = computed(() => this.offlineQueue().length);

  public activeOrdersCount = computed(() => {
    return this.orders().filter(o => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO').length;
  });

  // Métricas para el portal del Negocio
  public totalSales = computed(() => {
    return this.orders()
      .filter(o => o.status !== 'CANCELADO')
      .reduce((sum, o) => sum + o.total, 0);
  });

  public completedOrdersCount = computed(() => {
    return this.orders().filter(o => o.status === 'ENTREGADO').length;
  });

  constructor(
    private pwaService: PwaService,
    private notifService: NotificationService
  ) {
    this.loadInitialOrders();
    this.listenToConnectivityForSync();
  }

  private loadInitialOrders(): void {
    if (typeof localStorage !== 'undefined') {
      const savedOrders = localStorage.getItem(this.STORAGE_ORDERS);
      if (savedOrders) {
        try {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.orders.set(parsed);
          }
        } catch {}
      }

      const savedQueue = localStorage.getItem(this.STORAGE_OFFLINE_QUEUE);
      if (savedQueue) {
        try {
          this.offlineQueue.set(JSON.parse(savedQueue));
        } catch {}
      }
    }
  }

  private saveState(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_ORDERS, JSON.stringify(this.orders()));
      localStorage.setItem(this.STORAGE_OFFLINE_QUEUE, JSON.stringify(this.offlineQueue()));
    }
  }

  private listenToConnectivityForSync(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncOfflineOrders();
      });
    }
  }

  public placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'isOfflineCreated' | 'isSynced'>): Order {
    const isOnline = this.pwaService.isOnline();
    const orderId = 'FO-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'RECIBIDO',
      isOfflineCreated: !isOnline,
      isSynced: isOnline
    };

    if (isOnline) {
      this.orders.set([newOrder, ...this.orders()]);
      this.notifService.showLocalNotification('🍔 Pedido Recibido en Cocina', {
        body: `Orden #${newOrder.id} confirmada. Tiempo estimado: ${newOrder.estimatedMinutes} min.`
      });
    } else {
      this.offlineQueue.set([...this.offlineQueue(), newOrder]);
      this.orders.set([newOrder, ...this.orders()]);
      this.notifService.showLocalNotification('📶 Pedido Guardado Offline', {
        body: `Orden #${newOrder.id} encolada. Se sincronizará automáticamente al volver internet.`
      });
    }

    this.saveState();
    return newOrder;
  }

  public async syncOfflineOrders(): Promise<number> {
    const queue = [...this.offlineQueue()];
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remainingQueue: Order[] = [];

    for (const item of queue) {
      try {
        item.isSynced = true;
        syncedCount++;
        const updatedOrders = this.orders().map(o => o.id === item.id ? { ...o, isSynced: true } : o);
        this.orders.set(updatedOrders);
      } catch (err) {
        remainingQueue.push(item);
      }
    }

    this.offlineQueue.set(remainingQueue);
    this.saveState();

    if (syncedCount > 0) {
      this.notifService.showLocalNotification('✅ ¡Sincronización Exitosa!', {
        body: `Se enviaron ${syncedCount} pedido(s) pendientes a cocina.`
      });
    }

    return syncedCount;
  }

  public updateOrderStatus(orderId: string, nextStatus: OrderStatus): void {
    const updated = this.orders().map(order => {
      if (order.id === orderId) {
        const modified = { ...order, status: nextStatus };
        
        if (nextStatus === 'EN_PREPARACION') {
          this.notifService.showLocalNotification('🔥 Orden en Preparación', {
            body: `El Chef está cocinando tu pedido #${order.id}.`
          });
        } else if (nextStatus === 'LISTO') {
          this.notifService.showLocalNotification('🎉 ¡Tu Pedido está LISTO!', {
            body: `Orden #${order.id} lista para entrega. ¡Acércate a retirar!`
          });
        } else if (nextStatus === 'ENTREGADO') {
          this.notifService.showLocalNotification('⭐ Pedido Entregado', {
            body: `Orden #${order.id} entregada con éxito. ¡Buen provecho!`
          });
        } else if (nextStatus === 'CANCELADO') {
          this.notifService.showLocalNotification('❌ Orden Cancelada', {
            body: `La orden #${order.id} fue cancelada.`
          });
        }

        return modified;
      }
      return order;
    });

    this.orders.set(updated);
    this.saveState();
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders().find(o => o.id === id);
  }
}
