import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth.actions';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.html',
    styleUrl: './home.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
    private readonly store = inject(Store);
    private readonly session = inject(AuthSessionService);

    readonly user = this.session.user;

    onLogout(): void {
        this.store.dispatch(AuthActions.logout());
    }
}
