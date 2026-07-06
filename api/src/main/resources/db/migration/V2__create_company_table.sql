CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_companies (
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,

    PRIMARY KEY (user_id, company_id),

    CONSTRAINT fk_user_companies_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_companies_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);