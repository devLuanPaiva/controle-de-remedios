ALTER TABLE medicine_moviments
    ADD COLUMN prescription_item_id UUID,

    ADD CONSTRAINT fk_medicine_moviments_prescription_item
        FOREIGN KEY (prescription_item_id)
        REFERENCES prescription_items(id)
        ON DELETE SET NULL;

CREATE INDEX idx_medicine_moviments_medicine_type ON medicine_moviments(medicine_id, movement_type);

CREATE INDEX idx_deliveries_patient_id ON deliveries(patient_id);
