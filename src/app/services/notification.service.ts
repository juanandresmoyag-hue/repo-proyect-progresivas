import { Injectable, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public permissionStatus = signal<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  // Clave pública VAPID de demostración
  private readonly VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

  constructor(private swPush: SwPush) {
    this.listenToPushMessages();
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false;

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus.set(permission);

      if (permission === 'granted' && this.swPush.isEnabled) {
        try {
          const subscription = await this.swPush.requestSubscription({
            serverPublicKey: this.VAPID_PUBLIC_KEY
          });
          console.log('[FastOrder Push] Suscripción registrada:', subscription);
        } catch (subErr) {
          console.log('[FastOrder Push] Modo local / fallback para notificaciones push');
        }
      }
      return permission === 'granted';
    } catch (e) {
      console.error('[FastOrder Push] Error solicitando permisos:', e);
      return false;
    }
  }

  private listenToPushMessages(): void {
    if (this.swPush.isEnabled) {
      this.swPush.messages.subscribe((msg: any) => {
        this.showLocalNotification(msg.title || 'FastOrder S.A.', {
          body: msg.body || 'Tu pedido ha sido actualizado.',
          icon: 'icons/icon-192x192.png'
        });
      });
    }
  }

  public showLocalNotification(title: string, options?: NotificationOptions): void {
    this.playNotificationSound();

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(registration => {
            const extendedOptions: any = {
              icon: 'icons/icon-192x192.png',
              badge: 'icons/icon-72x72.png',
              vibrate: [200, 100, 200],
              ...options
            };
            registration.showNotification(title, extendedOptions);
          });
        } else {
          new Notification(title, {
            icon: 'icons/icon-192x192.png',
            ...options
          });
        }
      } catch (err) {
        console.warn('No se pudo mostrar la notificación del sistema:', err);
      }
    }
  }

  public playNotificationSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext no interactuado aún
    }
  }
}
