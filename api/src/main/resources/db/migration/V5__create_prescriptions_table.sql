CREATE TYPE prescription_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'DELIVERED',
    'PARTIAL_DELIVERED'
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY,
    status prescription_status NOT NULL,
    image_url VARCHAR(255),
    issue_date DATE NOT NULL,
    patient_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prescriptions_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);
