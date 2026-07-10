CREATE TABLE patients (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    birth_date TIMESTAMP NOT NULL,
    company_id UUID NOT NULL,
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_patients_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_patients_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT uk_patients_company_cpf
        UNIQUE (company_id, cpf),

    CONSTRAINT uk_patients_company_user
        UNIQUE (company_id, user_id)
);
