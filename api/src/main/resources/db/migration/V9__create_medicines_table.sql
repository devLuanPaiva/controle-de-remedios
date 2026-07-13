CREATE TABLE medicines (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    ean_code VARCHAR(14) NOT NULL,
    image_url VARCHAR(200) NOT NULL,
    company_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_medicines_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);

ALTER TABLE prescription_items
    ADD COLUMN medicine_id UUID NOT NULL,

    ADD CONSTRAINT fk_prescription_items_medicine
        FOREIGN KEY (medicine_id)
        REFERENCES medicines(id)
        ON DELETE RESTRICT;
