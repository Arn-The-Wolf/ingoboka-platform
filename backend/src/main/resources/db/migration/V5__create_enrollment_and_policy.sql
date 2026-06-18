-- V5: Policy enrollment, issuance, and lifecycle events

CREATE TABLE policy_applications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number  VARCHAR(50) NOT NULL,
    citizen_profile_id  UUID NOT NULL REFERENCES citizen_profiles (id) ON DELETE RESTRICT,
    product_plan_id     UUID NOT NULL REFERENCES product_plans (id) ON DELETE RESTRICT,
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN (
            'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED',
            'REJECTED', 'CANCELLED', 'CONVERTED'
        )),
    submitted_at        TIMESTAMPTZ,
    reviewed_at         TIMESTAMPTZ,
    reviewed_by         UUID REFERENCES users (id) ON DELETE SET NULL,
    rejection_reason    TEXT,
    coverage_start_date DATE,
    coverage_end_date   DATE,
    premium_amount      NUMERIC(14, 2) NOT NULL CHECK (premium_amount >= 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    underwriting_notes  TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_policy_applications_number UNIQUE (application_number)
);

CREATE INDEX idx_policy_applications_citizen_profile_id ON policy_applications (citizen_profile_id);
CREATE INDEX idx_policy_applications_product_plan_id ON policy_applications (product_plan_id);
CREATE INDEX idx_policy_applications_organization_id ON policy_applications (organization_id);
CREATE INDEX idx_policy_applications_status ON policy_applications (status);
CREATE INDEX idx_policy_applications_submitted_at ON policy_applications (submitted_at DESC);

CREATE TABLE application_beneficiaries (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id      UUID NOT NULL REFERENCES policy_applications (id) ON DELETE CASCADE,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    relationship        VARCHAR(50) NOT NULL
        CHECK (relationship IN (
            'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'
        )),
    date_of_birth       DATE,
    national_id         VARCHAR(20),
    allocation_percent  NUMERIC(5, 2) NOT NULL DEFAULT 100.00
        CHECK (allocation_percent > 0 AND allocation_percent <= 100),
    phone               VARCHAR(20),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_application_beneficiaries_application_id
    ON application_beneficiaries (application_id);

CREATE TABLE policies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_number       VARCHAR(50) NOT NULL,
    application_id      UUID REFERENCES policy_applications (id) ON DELETE SET NULL,
    citizen_profile_id  UUID NOT NULL REFERENCES citizen_profiles (id) ON DELETE RESTRICT,
    product_plan_id     UUID NOT NULL REFERENCES product_plans (id) ON DELETE RESTRICT,
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING_ACTIVATION'
        CHECK (status IN (
            'PENDING_ACTIVATION', 'ACTIVE', 'LAPSED', 'CANCELLED',
            'EXPIRED', 'SUSPENDED', 'TERMINATED'
        )),
    coverage_start_date DATE NOT NULL,
    coverage_end_date   DATE,
    premium_amount      NUMERIC(14, 2) NOT NULL CHECK (premium_amount >= 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    next_billing_date   DATE,
    activated_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancellation_reason TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_policies_policy_number UNIQUE (policy_number)
);

CREATE INDEX idx_policies_citizen_profile_id ON policies (citizen_profile_id);
CREATE INDEX idx_policies_product_plan_id ON policies (product_plan_id);
CREATE INDEX idx_policies_organization_id ON policies (organization_id);
CREATE INDEX idx_policies_status ON policies (status);
CREATE INDEX idx_policies_application_id ON policies (application_id);
CREATE INDEX idx_policies_next_billing_date ON policies (next_billing_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_policies_org_status ON policies (organization_id, status);

CREATE TABLE policy_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policies (id) ON DELETE CASCADE,
    event_type          VARCHAR(50) NOT NULL
        CHECK (event_type IN (
            'CREATED', 'ACTIVATED', 'RENEWED', 'PREMIUM_PAID', 'LAPSED',
            'REINSTATED', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'UPDATED', 'NOTE'
        )),
    event_data          JSONB NOT NULL DEFAULT '{}',
    performed_by        UUID REFERENCES users (id) ON DELETE SET NULL,
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_events_policy_id ON policy_events (policy_id);
CREATE INDEX idx_policy_events_event_type ON policy_events (event_type);
CREATE INDEX idx_policy_events_occurred_at ON policy_events (policy_id, occurred_at DESC);

CREATE TABLE policy_verification_tokens (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policies (id) ON DELETE CASCADE,
    token_hash          VARCHAR(255) NOT NULL,
    purpose             VARCHAR(50) NOT NULL DEFAULT 'VERIFICATION'
        CHECK (purpose IN ('VERIFICATION', 'SHARE', 'QR_ACCESS')),
    expires_at          TIMESTAMPTZ NOT NULL,
    used                BOOLEAN NOT NULL DEFAULT FALSE,
    used_at             TIMESTAMPTZ,
    created_by          UUID REFERENCES users (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_policy_verification_tokens_hash UNIQUE (token_hash)
);

CREATE INDEX idx_policy_verification_tokens_policy_id ON policy_verification_tokens (policy_id);
CREATE INDEX idx_policy_verification_tokens_expires_at
    ON policy_verification_tokens (expires_at) WHERE used = FALSE;
