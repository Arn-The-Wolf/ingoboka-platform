-- V8: Partner contracts and revenue ledger

CREATE TABLE partner_contracts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    partner_id          UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    contract_number     VARCHAR(50) NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED')),
    start_date          DATE NOT NULL,
    end_date            DATE,
    terms               JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_partner_contracts_number UNIQUE (contract_number)
);

CREATE TABLE contract_price_rules (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id         UUID NOT NULL REFERENCES partner_contracts (id) ON DELETE CASCADE,
    product_id          UUID REFERENCES insurance_products (id) ON DELETE SET NULL,
    rule_type           VARCHAR(50) NOT NULL
        CHECK (rule_type IN ('COMMISSION_PERCENT', 'FLAT_FEE', 'REVENUE_SHARE')),
    rate_value          NUMERIC(14, 4) NOT NULL,
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE revenue_ledger (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    entry_type          VARCHAR(10) NOT NULL CHECK (entry_type IN ('CREDIT', 'DEBIT')),
    amount              NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    reference_type      VARCHAR(100) NOT NULL,
    reference_id        UUID NOT NULL,
    description         TEXT,
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revenue_ledger_org ON revenue_ledger (organization_id);
CREATE INDEX idx_revenue_ledger_reference ON revenue_ledger (reference_type, reference_id);

CREATE TABLE invoices (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    invoice_number      VARCHAR(50) NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'VOID')),
    total_amount        NUMERIC(14, 2) NOT NULL,
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    issued_at           TIMESTAMPTZ,
    paid_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoices_number UNIQUE (invoice_number)
);
