import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';
import { parseLocalDate } from '@shared/utils/date.util';
import { UserApiDto } from '@features/users/models/user-api.model';
import { IUser, UserRole } from '@features/users/models/user.model';

import { PatientApiDto } from '../models/patient-api.model';
import { IPatient } from '../models/patient.model';
import { PatientService } from './patient.service';

const API_URL = environment.api_url;

function buildPatientDto(overrides: Partial<PatientApiDto> = {}): PatientApiDto {
    return {
        id: 'patient-1',
        name: 'John Doe',
        cpf: '52998224725',
        birthDate: '1990-05-20',
        companyId: 'company-1',
        userId: null,
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-02T10:00:00Z',
        ...overrides,
    };
}

function buildUserDto(overrides: Partial<UserApiDto> = {}): UserApiDto {
    return {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        imageUrl: null,
        cpf: '52998224725',
        role: 'PATIENT',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
        ...overrides,
    };
}

function buildResponse<T>(data: T, overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
    return {
        success: true,
        message: 'ok',
        count: null,
        currentPage: null,
        totalPages: null,
        next: null,
        previous: null,
        data,
        ...overrides,
    };
}

describe('PatientService', () => {
    let service: PatientService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), PatientService],
        });

        service = TestBed.inject(PatientService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getPatients', () => {
        it('should request the default page and size when none are provided', () => {
            service.getPatients().subscribe();

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);

            expect(req.request.params.get('page')).toBe('0');
            expect(req.request.params.get('size')).toBe('20');
            req.flush(buildResponse<PatientApiDto[]>([]));
        });

        it('should request an explicit page and size when provided', () => {
            service.getPatients(2, undefined, 50).subscribe();

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);

            expect(req.request.params.get('page')).toBe('2');
            expect(req.request.params.get('size')).toBe('50');
            req.flush(buildResponse<PatientApiDto[]>([]));
        });

        it('should map a page of patients into IPatient objects with parsed dates', () => {
            const dto = buildPatientDto();
            let result: IPatient[] | undefined;

            service.getPatients().subscribe((page) => (result = page.patients));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);
            req.flush(buildResponse([dto]));

            expect(result).toEqual([
                {
                    id: dto.id,
                    name: dto.name,
                    cpf: dto.cpf,
                    birthDate: parseLocalDate(dto.birthDate),
                    companyId: dto.companyId,
                    userId: undefined,
                    createdAt: new Date(dto.createdAt),
                    updatedAt: new Date(dto.updatedAt),
                },
            ]);
        });

        it('should only include the filter params that are provided', () => {
            service.getPatients(0, { name: 'John' }).subscribe();

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);

            expect(req.request.params.get('name')).toBe('John');
            expect(req.request.params.has('cpf')).toBe(false);
            expect(req.request.params.has('companyId')).toBe(false);
            req.flush(buildResponse<PatientApiDto[]>([]));
        });

        it('should include all filter params when companyId, name and cpf are provided', () => {
            service.getPatients(0, { companyId: 'company-1', name: 'John', cpf: '52998224725' }).subscribe();

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);

            expect(req.request.params.get('companyId')).toBe('company-1');
            expect(req.request.params.get('name')).toBe('John');
            expect(req.request.params.get('cpf')).toBe('52998224725');
            req.flush(buildResponse<PatientApiDto[]>([]));
        });

        it('should not send any filter param when no filter is provided', () => {
            service.getPatients().subscribe();

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);

            expect(req.request.params.has('companyId')).toBe(false);
            expect(req.request.params.has('name')).toBe(false);
            expect(req.request.params.has('cpf')).toBe(false);
            req.flush(buildResponse<PatientApiDto[]>([]));
        });

        it('should fall back to data length and page 1 of 1 when the API omits pagination fields', () => {
            const dto = buildPatientDto();
            let result: { count: number; currentPage: number; totalPages: number } | undefined;

            service.getPatients().subscribe((page) => (result = page));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);
            req.flush(buildResponse([dto], { count: null, currentPage: null, totalPages: null }));

            expect(result).toEqual(expect.objectContaining({ count: 1, currentPage: 1, totalPages: 1 }));
        });

        it('should return an empty patients array with a zero count when the API returns no data', () => {
            let result: { patients: IPatient[]; count: number } | undefined;

            service.getPatients().subscribe((page) => (result = page));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);
            req.flush(buildResponse<PatientApiDto[]>([], { count: null }));

            expect(result).toEqual(expect.objectContaining({ patients: [], count: 0 }));
        });

        it('should propagate the explicit count, currentPage and totalPages when the API provides them', () => {
            const dto = buildPatientDto();
            let result: { count: number; currentPage: number; totalPages: number; next: string | null; previous: string | null } | undefined;

            service.getPatients().subscribe((page) => (result = page));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/patients`);
            req.flush(
                buildResponse([dto], {
                    count: 42,
                    currentPage: 3,
                    totalPages: 5,
                    next: `${API_URL}/patients?page=4`,
                    previous: `${API_URL}/patients?page=2`,
                }),
            );

            expect(result).toEqual(
                expect.objectContaining({
                    count: 42,
                    currentPage: 3,
                    totalPages: 5,
                    next: `${API_URL}/patients?page=4`,
                    previous: `${API_URL}/patients?page=2`,
                }),
            );
        });
    });

    describe('getPatientById', () => {
        it('should fetch the patient by id and map it through toPatient', () => {
            const dto = buildPatientDto({ id: 'patient-2', userId: 'user-2' });
            let result: IPatient | undefined;

            service.getPatientById('patient-2').subscribe((patient) => (result = patient));

            const req = httpMock.expectOne(`${API_URL}/patients/patient-2`);
            expect(req.request.method).toBe('GET');
            req.flush(buildResponse(dto));

            expect(result?.id).toBe('patient-2');
            expect(result?.userId).toBe('user-2');
        });
    });

    describe('createPatient', () => {
        it('should POST the payload to /patients and map the created patient', () => {
            const dto = buildPatientDto({ id: 'new-patient' });
            let capturedBody: unknown;
            let result: IPatient | undefined;

            service
                .createPatient({ name: 'John Doe', cpf: '52998224725', birthDate: '1990-05-20', companyId: 'company-1' })
                .subscribe((patient) => (result = patient));

            const req = httpMock.expectOne(`${API_URL}/patients`);
            expect(req.request.method).toBe('POST');
            capturedBody = req.request.body;
            req.flush(buildResponse(dto));

            expect(capturedBody).toEqual({ name: 'John Doe', cpf: '52998224725', birthDate: '1990-05-20', companyId: 'company-1' });
            expect(result?.id).toBe('new-patient');
        });
    });

    describe('createPatientWithAccount', () => {
        it('should POST to /patients/with-account and map the created patient', () => {
            const dto = buildPatientDto({ id: 'new-patient', userId: 'user-1' });
            let result: IPatient | undefined;

            service
                .createPatientWithAccount({
                    name: 'John Doe',
                    cpf: '52998224725',
                    birthDate: '1990-05-20',
                    companyId: 'company-1',
                    email: 'john@example.com',
                    password: 'secret123',
                })
                .subscribe((patient) => (result = patient));

            const req = httpMock.expectOne(`${API_URL}/patients/with-account`);
            expect(req.request.method).toBe('POST');
            req.flush(buildResponse(dto));

            expect(result?.id).toBe('new-patient');
        });

        it('should omit an empty imageUrl from the request body', () => {
            let capturedBody: { imageUrl?: string } | undefined;

            service
                .createPatientWithAccount({
                    name: 'John Doe',
                    cpf: '52998224725',
                    birthDate: '1990-05-20',
                    companyId: 'company-1',
                    email: 'john@example.com',
                    password: 'secret123',
                    imageUrl: '',
                })
                .subscribe();

            const req = httpMock.expectOne(`${API_URL}/patients/with-account`);
            capturedBody = req.request.body;
            req.flush(buildResponse(buildPatientDto()));

            expect(capturedBody?.imageUrl).toBeUndefined();
        });

        it('should keep a non-empty imageUrl in the request body', () => {
            let capturedBody: { imageUrl?: string } | undefined;

            service
                .createPatientWithAccount({
                    name: 'John Doe',
                    cpf: '52998224725',
                    birthDate: '1990-05-20',
                    companyId: 'company-1',
                    email: 'john@example.com',
                    password: 'secret123',
                    imageUrl: 'https://example.com/photo.png',
                })
                .subscribe();

            const req = httpMock.expectOne(`${API_URL}/patients/with-account`);
            capturedBody = req.request.body;
            req.flush(buildResponse(buildPatientDto()));

            expect(capturedBody?.imageUrl).toBe('https://example.com/photo.png');
        });

        it('should send an undefined imageUrl when it is not provided', () => {
            let capturedBody: { imageUrl?: string } | undefined;

            service
                .createPatientWithAccount({
                    name: 'John Doe',
                    cpf: '52998224725',
                    birthDate: '1990-05-20',
                    companyId: 'company-1',
                    email: 'john@example.com',
                    password: 'secret123',
                })
                .subscribe();

            const req = httpMock.expectOne(`${API_URL}/patients/with-account`);
            capturedBody = req.request.body;
            req.flush(buildResponse(buildPatientDto()));

            expect(capturedBody?.imageUrl).toBeUndefined();
        });
    });

    describe('updatePatient', () => {
        it('should PATCH the patient id URL', () => {
            const dto = buildPatientDto({ name: 'New Name' });
            let result: IPatient | undefined;

            service.updatePatient('patient-1', { name: 'New Name' }).subscribe((patient) => (result = patient));

            const req = httpMock.expectOne(`${API_URL}/patients/patient-1`);
            expect(req.request.method).toBe('PATCH');
            req.flush(buildResponse(dto));

            expect(result?.name).toBe('New Name');
        });

        it('should send only the name field when updating just the name', () => {
            let capturedBody: unknown;

            service.updatePatient('patient-1', { name: 'New Name' }).subscribe();

            const req = httpMock.expectOne(`${API_URL}/patients/patient-1`);
            capturedBody = req.request.body;
            req.flush(buildResponse(buildPatientDto()));

            expect(capturedBody).toEqual({ name: 'New Name' });
        });

        it('should send only the cpf field when updating just the cpf', () => {
            let capturedBody: unknown;

            service.updatePatient('patient-1', { cpf: '11144477735' }).subscribe();

            const req = httpMock.expectOne(`${API_URL}/patients/patient-1`);
            capturedBody = req.request.body;
            req.flush(buildResponse(buildPatientDto()));

            expect(capturedBody).toEqual({ cpf: '11144477735' });
        });

        it('should send only the birthDate field when updating just the birth date', () => {
            let capturedBody: unknown;

            service.updatePatient('patient-1', { birthDate: '1995-03-10' }).subscribe();

            const req = httpMock.expectOne(`${API_URL}/patients/patient-1`);
            capturedBody = req.request.body;
            req.flush(buildResponse(buildPatientDto()));

            expect(capturedBody).toEqual({ birthDate: '1995-03-10' });
        });
    });

    describe('deletePatient', () => {
        it('should DELETE the patient id URL and resolve without a value', () => {
            let emitted: void;
            let emittedCount = 0;

            service.deletePatient('patient-1').subscribe((value) => {
                emitted = value;
                emittedCount += 1;
            });

            const req = httpMock.expectOne(`${API_URL}/patients/patient-1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(buildResponse(null));

            expect(emittedCount).toBe(1);
            expect(emitted).toBeUndefined();
        });
    });

    describe('createPatientAccount', () => {
        it('should POST the email and password to the patient account endpoint and map the created user', () => {
            const userDto = buildUserDto();
            let capturedBody: unknown;
            let result: IUser | undefined;

            service
                .createPatientAccount('patient-1', { email: 'john@example.com', password: 'secret123' })
                .subscribe((user) => (result = user));

            const req = httpMock.expectOne(`${API_URL}/patients/patient-1/account`);
            expect(req.request.method).toBe('POST');
            capturedBody = req.request.body;
            req.flush(buildResponse(userDto));

            expect(capturedBody).toEqual({ email: 'john@example.com', password: 'secret123' });
            expect(result).toEqual({
                id: userDto.id,
                name: userDto.name,
                email: userDto.email,
                imageUrl: undefined,
                cpf: userDto.cpf,
                role: UserRole.PATIENT,
                createdAt: new Date(userDto.createdAt),
                updatedAt: new Date(userDto.updatedAt),
            });
        });
    });

    describe('removePatientAccount', () => {
        it('should DELETE the patient account endpoint and resolve without a value', () => {
            let emitted: void;
            let emittedCount = 0;

            service.removePatientAccount('patient-1').subscribe((value) => {
                emitted = value;
                emittedCount += 1;
            });

            const req = httpMock.expectOne(`${API_URL}/patients/patient-1/account`);
            expect(req.request.method).toBe('DELETE');
            req.flush(buildResponse(null));

            expect(emittedCount).toBe(1);
            expect(emitted).toBeUndefined();
        });
    });
});
