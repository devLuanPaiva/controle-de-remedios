import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AuthCard } from '../../components/auth-card/auth-card';
import { LoginForm } from '../../components/login-form/login-form';

@Component({
    selector: 'app-login',
    imports: [AuthCard, LoginForm],
    templateUrl: './login.html',
    styleUrl: './login.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {

}
