import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { LucideFileText, LucideImageOff, LucidePill } from '@lucide/angular';

export type ImageFallbackIcon = 'generic' | 'medicine' | 'prescription';

@Component({
    selector: 'app-image-fallback',
    imports: [LucideImageOff, LucidePill, LucideFileText],
    templateUrl: './image-fallback.html',
    styleUrl: './image-fallback.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageFallback {
    readonly src = input<string | null | undefined>(undefined);
    readonly alt = input<string>('');
    readonly icon = input<ImageFallbackIcon>('generic');

    private readonly failed = signal(false);

    readonly showImage = computed(() => !!this.src() && !this.failed());

    constructor() {
        effect(() => {
            this.src();
            this.failed.set(false);
        });
    }

    onError(): void {
        this.failed.set(true);
    }
}
