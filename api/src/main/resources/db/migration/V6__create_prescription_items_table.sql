CREATE TYPE prescription_item_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'DELIVERED',
    'PARTIAL_DELIVERED'
);

CREATE TYPE unity_type AS ENUM (
    'BOX',
    'BLISTER',
    'BOTTLE',
    'TABLET',
    'CAPSULE',
    'SYRUP'
);

CREATE TYPE frequency_type AS ENUM (
    'PER_DAY',
    'PER_WEEK',
    'PER_MONTH'
);

CREATE TYPE treatment_type AS ENUM (
    'CONTINUOUS',
    'SHORT_TERM',
    'LONG_TERM'
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY,
    prescription_id UUID NOT NULL,
    status prescription_item_status NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    prescribed_quantity INTEGER NOT NULL,
    unity_type unity_type NOT NULL,
    frequency INTEGER NOT NULL,
    frequency_type frequency_type NOT NULL,
    treatment_type treatment_type NOT NULL,
    treatment_days INTEGER NOT NULL,
    observations VARCHAR(200),
    start_date DATE,
    received_quantity INTEGER NOT NULL,
    delivered_quantity INTEGER NOT NULL,
    requested_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prescription_items_prescription
        FOREIGN KEY (prescription_id)
        REFERENCES prescriptions(id)
        ON DELETE CASCADE
);
