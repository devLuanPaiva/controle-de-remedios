CREATE TABLE prescription_images (
    prescription_id UUID NOT NULL,
    position INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,

    PRIMARY KEY (prescription_id, position),

    CONSTRAINT fk_prescription_images_prescription
        FOREIGN KEY (prescription_id)
        REFERENCES prescriptions(id)
        ON DELETE CASCADE
);

INSERT INTO prescription_images (prescription_id, position, image_url)
SELECT id, 0, image_url
FROM prescriptions
WHERE image_url IS NOT NULL;

ALTER TABLE prescriptions DROP COLUMN image_url;
