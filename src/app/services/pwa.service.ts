import { Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  public isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  public promptEvent = signal<any>(null);
  public isInstallable = signal<boolean>(false);
  public hasUpdate = signal<boolean>(false);

  constructor(private swUpdate: SwUpdate) {
    this.initNetworkListeners();
    this.initPwaInstallPrompt();
    this.initSwUpdates();
  }

  private initNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline.set(true);
      });
      window.addEventListener('offline', () => {
        this.isOnline.set(false);
      });
    }
  }

  private initPwaInstallPrompt(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent.set(event);
        this.isInstallable.set(true);
      });

      window.addEventListener('appinstalled', () => {
        this.promptEvent.set(null);
        this.isInstallable.set(false);
      });
    }
  }

  private initSwUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.hasUpdate.set(true);
        });
    }
  }

  public async installApp(): Promise<boolean> {
    const prompt = this.promptEvent();
    if (!prompt) return false;

    prompt.prompt();
    const result = await prompt.userChoice;
    this.promptEvent.set(null);
    this.isInstallable.set(false);
    return result.outcome === 'accepted';
  }

  public reloadToUpdate(): void {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}
