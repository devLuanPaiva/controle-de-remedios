ALTER TABLE medicine_movements
    ADD COLUMN prescription_item_id UUID,

    ADD CONSTRAINT fk_medicine_movements_prescription_item
        FOREIGN KEY (prescription_item_id)
        REFERENCES prescription_items(id)
        ON DELETE SET NULL;

CREATE INDEX idx_medicine_movements_medicine_type ON medicine_movements(medicine_id, movement_type);

CREATE INDEX idx_deliveries_patient_id ON deliveries(patient_id);
