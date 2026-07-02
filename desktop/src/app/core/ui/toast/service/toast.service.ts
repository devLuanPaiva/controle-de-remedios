import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: ToastType, message: string) {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type,
      message
    }

    this.toasts.update((toasts) => [...toasts, toast]);

    setTimeout(() => {
      this.toasts.update((toasts) => toasts.filter((t) => t.id !== toast.id));
    }, 3000);
  }

  remove(id: string) {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
