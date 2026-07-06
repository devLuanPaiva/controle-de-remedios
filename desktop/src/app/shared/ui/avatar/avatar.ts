import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-avatar',
    template: `
        @if (imageUrl()) {
            <img class="avatar__image" [class]="sizeClass()" [src]="imageUrl()" [alt]="name()" />
        } @else {
            <span class="avatar__initials" [class]="sizeClass()" aria-hidden="true">{{ initials() }}</span>
        }
    `,
    styleUrl: './avatar.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
    readonly name = input.required<string>();
    readonly imageUrl = input<string | null | undefined>(null);
    readonly size = input<'sm' | 'md' | 'lg'>('md');

    readonly sizeClass = computed(() => `avatar--${this.size()}`);

    readonly initials = computed(() => {
        const parts = this.name().trim().split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] ?? '';
        const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
        return (first + last).toUpperCase();
    });
}
