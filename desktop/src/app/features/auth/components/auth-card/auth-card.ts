import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-auth-card',
    imports: [NgOptimizedImage],
    templateUrl: './auth-card.html',
    styleUrl: './auth-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCard {
    readonly logoSrc = input('/assets/logo.png');
    readonly subtitle = input('');
}
