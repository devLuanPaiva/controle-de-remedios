CREATE TABLE deliveries (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    prescription_item_id UUID NOT NULL,
    delivery_date DATE,
    next_available_date DATE,
    delivery_quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_deliveries_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_deliveries_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_deliveries_prescription_item
        FOREIGN KEY (prescription_item_id)
        REFERENCES prescription_items(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_deliveries_prescription_item
        UNIQUE (prescription_item_id)
);
