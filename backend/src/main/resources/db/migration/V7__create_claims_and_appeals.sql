-- V7: Claims processing, documents, decisions, and appeals

CREATE TABLE claims (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number        VARCHAR(50) NOT NULL,
    policy_id           UUID NOT NULL REFERENCES policies (id) ON DELETE RESTRICT,
    citizen_profile_id  UUID NOT NULL REFERENCES citizen_profiles (id) ON DELETE RESTRICT,
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN (
            'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUIRED',
            'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID', 'CLOSED', 'APPEALED'
        )),
    incident_date       DATE NOT NULL,
    reported_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claim_type          VARCHAR(100) NOT NULL,
    description         TEXT NOT NULL,
    claimed_amount      NUMERIC(14, 2) NOT NULL CHECK (claimed_amount >= 0),
    approved_amount     NUMERIC(14, 2) CHECK (approved_amount IS NULL OR approved_amount >= 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    assigned_to         UUID REFERENCES users (id) ON DELETE SET NULL,
    submitted_at        TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_claims_claim_number UNIQUE (claim_number)
);

CREATE INDEX idx_claims_policy_id ON claims (policy_id);
CREATE INDEX idx_claims_citizen_profile_id ON claims (citizen_profile_id);
CREATE INDEX idx_claims_organization_id ON claims (organization_id);
CREATE INDEX idx_claims_status ON claims (status);
CREATE INDEX idx_claims_assigned_to ON claims (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_claims_reported_at ON claims (reported_at DESC);
CREATE INDEX idx_claims_org_status ON claims (organization_id, status);

CREATE TABLE claim_documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id            UUID NOT NULL REFERENCES claims (id) ON DELETE CASCADE,
    document_type       VARCHAR(100) NOT NULL
        CHECK (document_type IN (
            'INCIDENT_REPORT', 'MEDICAL_REPORT', 'POLICE_REPORT', 'RECEIPT',
            'INVOICE', 'PHOTO', 'NATIONAL_ID', 'OTHER'
        )),
    file_name           VARCHAR(255) NOT NULL,
    file_path           VARCHAR(500) NOT NULL,
    file_size_bytes     BIGINT,
    mime_type           VARCHAR(100),
    uploaded_by         UUID REFERENCES users (id) ON DELETE SET NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claim_documents_claim_id ON claim_documents (claim_id);
CREATE INDEX idx_claim_documents_type ON claim_documents (claim_id, document_type);

CREATE TABLE claim_status_history (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id            UUID NOT NULL REFERENCES claims (id) ON DELETE CASCADE,
    from_status         VARCHAR(50),
    to_status           VARCHAR(50) NOT NULL,
    reason              TEXT,
    changed_by          UUID REFERENCES users (id) ON DELETE SET NULL,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claim_status_history_claim_id ON claim_status_history (claim_id);
CREATE INDEX idx_claim_status_history_changed_at ON claim_status_history (claim_id, changed_at DESC);

CREATE TABLE claim_decisions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id            UUID NOT NULL REFERENCES claims (id) ON DELETE CASCADE,
    decision            VARCHAR(50) NOT NULL
        CHECK (decision IN ('APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'REFERRED')),
    approved_amount     NUMERIC(14, 2) CHECK (approved_amount IS NULL OR approved_amount >= 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    rationale           TEXT NOT NULL,
    decided_by          UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    decided_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_final            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claim_decisions_claim_id ON claim_decisions (claim_id);
CREATE INDEX idx_claim_decisions_decided_by ON claim_decisions (decided_by);
CREATE INDEX idx_claim_decisions_decided_at ON claim_decisions (decided_at DESC);

CREATE TABLE claim_appeals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id            UUID NOT NULL REFERENCES claims (id) ON DELETE RESTRICT,
    appeal_number       VARCHAR(50) NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'UPHELD', 'DENIED', 'WITHDRAWN')),
    reason              TEXT NOT NULL,
    requested_amount    NUMERIC(14, 2) CHECK (requested_amount IS NULL OR requested_amount >= 0),
    submitted_by        UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    assigned_to         UUID REFERENCES users (id) ON DELETE SET NULL,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    resolution_notes    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_claim_appeals_number UNIQUE (appeal_number)
);

CREATE INDEX idx_claim_appeals_claim_id ON claim_appeals (claim_id);
CREATE INDEX idx_claim_appeals_status ON claim_appeals (status);
CREATE INDEX idx_claim_appeals_submitted_at ON claim_appeals (submitted_at DESC);
