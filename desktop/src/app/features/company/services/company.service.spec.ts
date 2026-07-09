import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';
import { UserApiDto } from '@features/users/models/user-api.model';
import { IUser, UserRole } from '@features/users/models/user.model';

import { CompanyApiDto } from '../models/company-api.model';
import { ICompany } from '../models/company.model';
import { CompanyService } from './company.service';

const API_URL = environment.api_url;

function buildCompanyDto(overrides: Partial<CompanyApiDto> = {}): CompanyApiDto {
    return {
        id: 'company-1',
        name: 'Acme',
        slug: 'acme',
        cnpj: '11222333000181',
        imageUrl: 'https://example.com/logo.png',
        active: true,
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-02T10:00:00Z',
        ...overrides,
    };
}

function buildResponse<T>(data: T, overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
    return {
        success: true,
        message: 'ok',
        count: null,
        currentPage: 1,
        totalPages: 1,
        next: null,
        previous: null,
        data,
        ...overrides,
    };
}

describe('CompanyService', () => {
    let service: CompanyService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), CompanyService],
        });

        service = TestBed.inject(CompanyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getCompanies', () => {
        it('should map a single page of companies into ICompany objects with dates and a normalized imageUrl', () => {
            const dto = buildCompanyDto({ imageUrl: null });
            let result: ICompany[] | undefined;

            service.getCompanies().subscribe((companies) => (result = companies));

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${API_URL}/companies` &&
                    request.params.get('page') === '0' &&
                    request.params.get('size') === '100',
            );
            req.flush(buildResponse([dto]));

            expect(result).toEqual([
                {
                    id: dto.id,
                    name: dto.name,
                    slug: dto.slug,
                    cnpj: dto.cnpj,
                    imageUrl: undefined,
                    active: dto.active,
                    createdAt: new Date(dto.createdAt),
                    updatedAt: new Date(dto.updatedAt),
                },
            ]);
        });

        it('should follow every page until totalPages is reached and concatenate the results in order', () => {
            const first = buildCompanyDto({ id: 'company-0', name: 'First' });
            const second = buildCompanyDto({ id: 'company-1', name: 'Second' });
            let result: ICompany[] | undefined;

            service.getCompanies().subscribe((companies) => (result = companies));

            const firstReq = httpMock.expectOne((request) => request.params.get('page') === '0');
            firstReq.flush(buildResponse([first], { currentPage: 1, totalPages: 2 }));

            const secondReq = httpMock.expectOne((request) => request.params.get('page') === '1');
            secondReq.flush(buildResponse([second], { currentPage: 2, totalPages: 2 }));

            expect(result?.map((company) => company.id)).toEqual(['company-0', 'company-1']);
        });

        it('should return an empty array without making a second request when there are no companies', () => {
            let result: ICompany[] | undefined;

            service.getCompanies().subscribe((companies) => (result = companies));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/companies`);
            req.flush(buildResponse<CompanyApiDto[]>([], { currentPage: 1, totalPages: 1 }));

            expect(result).toEqual([]);
        });

        it('should treat a null currentPage/totalPages as a single page and issue exactly one request', () => {
            let result: ICompany[] | undefined;

            service.getCompanies().subscribe((companies) => (result = companies));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/companies`);
            req.flush(buildResponse([buildCompanyDto()], { currentPage: null, totalPages: null }));

            httpMock.expectNone((request) => request.params.get('page') === '1');
            expect(result).toHaveLength(1);
        });
    });

    describe('createCompany', () => {
        it('should send a POST and omit an empty imageUrl from the request body', () => {
            let capturedBody: unknown;

            service.createCompany({ name: 'Acme', cnpj: '11222333000181', imageUrl: '' }).subscribe();

            const req = httpMock.expectOne(`${API_URL}/companies`);
            expect(req.request.method).toBe('POST');
            capturedBody = req.request.body;
            req.flush(buildResponse(buildCompanyDto()));

            expect(capturedBody).toEqual({ name: 'Acme', cnpj: '11222333000181', imageUrl: undefined });
        });

        it('should keep a non-empty imageUrl in the request body and map the created company from the response', () => {
            const dto = buildCompanyDto({ id: 'new-company' });
            let capturedBody: unknown;
            let result: ICompany | undefined;

            service
                .createCompany({ name: 'Acme', cnpj: '11222333000181', imageUrl: 'https://example.com/logo.png' })
                .subscribe((company) => (result = company));

            const req = httpMock.expectOne(`${API_URL}/companies`);
            capturedBody = req.request.body;
            req.flush(buildResponse(dto));

            expect(capturedBody).toEqual({
                name: 'Acme',
                cnpj: '11222333000181',
                imageUrl: 'https://example.com/logo.png',
            });
            expect(result?.id).toBe('new-company');
        });
    });

    describe('updateCompany', () => {
        it('should PATCH the company id URL and preserve an explicit active:false in the body', () => {
            const dto = buildCompanyDto({ active: false });
            let result: ICompany | undefined;

            service.updateCompany('company-1', { active: false }).subscribe((company) => (result = company));

            const req = httpMock.expectOne(`${API_URL}/companies/company-1`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body.active).toBe(false);
            req.flush(buildResponse(dto));

            expect(result?.active).toBe(false);
        });
    });

    describe('getCompanyUsers', () => {
        it("should fetch a company's users scoped to its id and map them through toUser", () => {
            const userDto: UserApiDto = {
                id: 'user-1',
                name: 'Jane Doe',
                email: 'jane@example.com',
                imageUrl: null,
                cpf: '12345678901',
                role: 'MANAGER',
                createdAt: '2026-01-01T10:00:00Z',
                updatedAt: '2026-01-01T10:00:00Z',
            };
            let result: IUser[] | undefined;

            service.getCompanyUsers('company-1').subscribe((users) => (result = users));

            const req = httpMock.expectOne(
                (request) => request.url === `${API_URL}/companies/company-1/users` && request.params.get('page') === '0',
            );
            req.flush(buildResponse([userDto]));

            expect(result).toEqual([
                {
                    id: 'user-1',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    imageUrl: undefined,
                    cpf: '12345678901',
                    role: UserRole.MANAGER,
                    createdAt: new Date(userDto.createdAt),
                    updatedAt: new Date(userDto.updatedAt),
                },
            ]);
        });
    });

    describe('associateUser', () => {
        it('should POST the userId to the company users endpoint and resolve without a value', () => {
            let emitted: void;
            let emittedCount = 0;

            service.associateUser('company-1', 'user-1').subscribe((value) => {
                emitted = value;
                emittedCount += 1;
            });

            const req = httpMock.expectOne(`${API_URL}/companies/company-1/users`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ userId: 'user-1' });
            req.flush(buildResponse(null));

            expect(emittedCount).toBe(1);
            expect(emitted).toBeUndefined();
        });
    });

    describe('removeUser', () => {
        it('should DELETE the company/user URL and resolve without a value', () => {
            let emitted: void;
            let emittedCount = 0;

            service.removeUser('company-1', 'user-1').subscribe((value) => {
                emitted = value;
                emittedCount += 1;
            });

            const req = httpMock.expectOne(`${API_URL}/companies/company-1/users/user-1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(buildResponse(null));

            expect(emittedCount).toBe(1);
            expect(emitted).toBeUndefined();
        });
    });
});
