ALTER TABLE prescription_items
    ALTER COLUMN observations DROP NOT NULL,
    ALTER COLUMN start_date DROP NOT NULL;
