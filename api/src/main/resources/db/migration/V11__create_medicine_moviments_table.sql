CREATE TYPE movement_type AS ENUM (
    'RECEIVED',
    'DELIVERED',
    'REQUESTED'
);

CREATE TABLE medicine_movements (
    id UUID PRIMARY KEY,
    medicine_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    movement_date DATE,
    movement_type movement_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_medicine_movements_medicine
        FOREIGN KEY (medicine_id)
        REFERENCES medicines(id)
        ON DELETE CASCADE
);
