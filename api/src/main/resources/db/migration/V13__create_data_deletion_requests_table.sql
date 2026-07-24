CREATE TYPE data_deletion_request_status AS ENUM (
    'PENDING',
    'COMPLETED'
);

CREATE TABLE data_deletion_requests (
    id UUID PRIMARY KEY,
    requester_name VARCHAR(120) NOT NULL,
    requester_email VARCHAR(180) NOT NULL,
    requester_cpf VARCHAR(11) NOT NULL,
    message VARCHAR(1000),
    status data_deletion_request_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_deletion_requests_requester_email ON data_deletion_requests (requester_email);
