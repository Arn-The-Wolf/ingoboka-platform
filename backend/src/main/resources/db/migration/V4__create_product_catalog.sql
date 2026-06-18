-- V4: Insurance product catalog (circular FK resolved via ALTER)

CREATE TABLE insurance_products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    code                VARCHAR(50) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(100) NOT NULL
        CHECK (category IN (
            'HEALTH', 'LIFE', 'ACCIDENT', 'PROPERTY', 'MICROINSURANCE', 'BUNDLE', 'OTHER'
        )),
    description         TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED')),
    current_version_id  UUID,
    min_entry_age       INTEGER,
    max_entry_age       INTEGER,
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_insurance_products_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_insurance_products_organization_id ON insurance_products (organization_id);
CREATE INDEX idx_insurance_products_status ON insurance_products (status);
CREATE INDEX idx_insurance_products_category ON insurance_products (category);

CREATE TABLE product_versions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID NOT NULL REFERENCES insurance_products (id) ON DELETE CASCADE,
    version_number      INTEGER NOT NULL,
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    terms_summary       TEXT,
    underwriting_rules  JSONB NOT NULL DEFAULT '{}',
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'SUPERSEDED', 'ARCHIVED')),
    published_at        TIMESTAMPTZ,
    published_by        UUID REFERENCES users (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_versions_product_version UNIQUE (product_id, version_number)
);

CREATE INDEX idx_product_versions_product_id ON product_versions (product_id);
CREATE INDEX idx_product_versions_status ON product_versions (status);
CREATE INDEX idx_product_versions_effective ON product_versions (product_id, effective_from, effective_to);

ALTER TABLE insurance_products
    ADD CONSTRAINT fk_insurance_products_current_version
        FOREIGN KEY (current_version_id) REFERENCES product_versions (id) ON DELETE SET NULL;

CREATE TABLE product_plans (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_version_id  UUID NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
    code                VARCHAR(50) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    billing_frequency   VARCHAR(20) NOT NULL
        CHECK (billing_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL')),
    premium_amount      NUMERIC(14, 2) NOT NULL CHECK (premium_amount >= 0),
    sum_assured         NUMERIC(14, 2),
    waiting_period_days INTEGER NOT NULL DEFAULT 0,
    grace_period_days   INTEGER NOT NULL DEFAULT 0,
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    status              VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_plans_version_code UNIQUE (product_version_id, code)
);

CREATE INDEX idx_product_plans_product_version_id ON product_plans (product_version_id);
CREATE INDEX idx_product_plans_billing_frequency ON product_plans (billing_frequency);
CREATE INDEX idx_product_plans_status ON product_plans (status);

CREATE TABLE product_benefits (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_version_id  UUID NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
    code                VARCHAR(50) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    benefit_type        VARCHAR(50) NOT NULL
        CHECK (benefit_type IN ('LUMP_SUM', 'DAILY_CASH', 'REIMBURSEMENT', 'SERVICE', 'OTHER')),
    coverage_amount     NUMERIC(14, 2),
    coverage_percentage NUMERIC(5, 2),
    max_occurrences     INTEGER,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_benefits_version_code UNIQUE (product_version_id, code)
);

CREATE INDEX idx_product_benefits_product_version_id ON product_benefits (product_version_id);

CREATE TABLE product_exclusions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_version_id  UUID NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
    code                VARCHAR(50) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_exclusions_version_code UNIQUE (product_version_id, code)
);

CREATE INDEX idx_product_exclusions_product_version_id ON product_exclusions (product_version_id);

CREATE TABLE product_required_documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_version_id  UUID NOT NULL REFERENCES product_versions (id) ON DELETE CASCADE,
    document_type       VARCHAR(100) NOT NULL
        CHECK (document_type IN (
            'NATIONAL_ID', 'PASSPORT', 'PROOF_OF_ADDRESS', 'MEDICAL_REPORT',
            'EMPLOYMENT_LETTER', 'BANK_STATEMENT', 'PHOTO', 'OTHER'
        )),
    is_mandatory        BOOLEAN NOT NULL DEFAULT TRUE,
    description         TEXT,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_required_documents_version_type
        UNIQUE (product_version_id, document_type)
);

CREATE INDEX idx_product_required_documents_product_version_id
    ON product_required_documents (product_version_id);
