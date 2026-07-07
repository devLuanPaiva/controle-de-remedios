import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import { CreateUserRequest, toUser, UpdateUserRequest, UserApiDto, UsersPage } from '../models/user-api.model';
import { IUser, UserRole } from '../models/user.model';

const DEFAULT_PAGE_SIZE = 20;

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getUsers(page = 0, size = DEFAULT_PAGE_SIZE): Observable<UsersPage> {
        return this.http
            .get<ApiResponse<UserApiDto[]>>(`${this.apiUrl()}/users`, {
                params: { page, size },
            })
            .pipe(
                map((response) => ({
                    users: response.data.map(toUser),
                    count: response.count ?? response.data.length,
                    currentPage: response.currentPage ?? 1,
                    totalPages: response.totalPages ?? 1,
                    next: response.next,
                    previous: response.previous,
                })),
            );
    }

    getUserById(id: string): Observable<IUser> {
        return this.http
            .get<ApiResponse<UserApiDto>>(`${this.apiUrl()}/users/${id}`)
            .pipe(map((response) => toUser(response.data)));
    }

    createUser(payload: CreateUserRequest): Observable<IUser> {
        const body = {
            ...payload,
            imageUrl: payload.imageUrl || undefined,
            role: UserRole[payload.role],
        };

        return this.http
            .post<ApiResponse<UserApiDto>>(`${this.apiUrl()}/users`, body)
            .pipe(map((response) => toUser(response.data)));
    }

    updateUser(id: string, payload: UpdateUserRequest): Observable<IUser> {
        const body = {
            ...payload,
            imageUrl: payload.imageUrl || undefined,
        };

        return this.http
            .patch<ApiResponse<UserApiDto>>(`${this.apiUrl()}/users/${id}`, body)
            .pipe(map((response) => toUser(response.data)));
    }

    resetPassword(email: string): Observable<void> {
        return this.http
            .post<ApiResponse<null>>(`${this.apiUrl()}/users/reset-password`, { email })
            .pipe(map(() => undefined));
    }
}
