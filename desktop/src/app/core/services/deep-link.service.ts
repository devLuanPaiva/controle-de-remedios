import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';

@Injectable({
    providedIn: 'root',
})
export class DeepLinkService {
    private readonly router = inject(Router);

    async init(): Promise<void> {
        const startUrls = await getCurrent();
        if (startUrls?.length) {
            this.handleUrls(startUrls);
        }

        await onOpenUrl((urls) => this.handleUrls(urls));
    }

    private handleUrls(urls: string[]): void {
        for (const url of urls) {
            this.handleUrl(url);
        }
    }

    private handleUrl(url: string): void {
        let parsed: URL;

        try {
            parsed = new URL(url);
        } catch {
            return;
        }

        const path = `${parsed.hostname}${parsed.pathname}`.replace(/^\/+|\/+$/g, '');
        const token = parsed.searchParams.get('token');

        if (path === 'reset-password' && token) {
            this.router.navigate(['/reset-password'], { queryParams: { token } });
        }
    }
}
