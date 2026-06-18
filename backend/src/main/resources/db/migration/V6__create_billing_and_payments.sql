-- V6: Billing, premium schedules, payments, and refunds

CREATE TABLE premium_schedules (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policies (id) ON DELETE CASCADE,
    installment_number  INTEGER NOT NULL,
    due_date            DATE NOT NULL,
    amount              NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED')),
    paid_at             TIMESTAMPTZ,
    grace_period_end    DATE,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_premium_schedules_policy_installment
        UNIQUE (policy_id, installment_number)
);

CREATE INDEX idx_premium_schedules_policy_id ON premium_schedules (policy_id);
CREATE INDEX idx_premium_schedules_due_date ON premium_schedules (due_date);
CREATE INDEX idx_premium_schedules_status ON premium_schedules (status);
CREATE INDEX idx_premium_schedules_overdue
    ON premium_schedules (due_date) WHERE status IN ('PENDING', 'OVERDUE');

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference   VARCHAR(100) NOT NULL,
    policy_id           UUID NOT NULL REFERENCES policies (id) ON DELETE RESTRICT,
    premium_schedule_id UUID REFERENCES premium_schedules (id) ON DELETE SET NULL,
    citizen_profile_id  UUID NOT NULL REFERENCES citizen_profiles (id) ON DELETE RESTRICT,
    organization_id     UUID NOT NULL REFERENCES organizations (id) ON DELETE RESTRICT,
    amount              NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    payment_method      VARCHAR(50) NOT NULL
        CHECK (payment_method IN (
            'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'CASH', 'WALLET', 'OTHER'
        )),
    provider            VARCHAR(100),
    provider_reference  VARCHAR(255),
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN (
            'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'
        )),
    initiated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    failure_reason      TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_payments_reference UNIQUE (payment_reference)
);

CREATE INDEX idx_payments_policy_id ON payments (policy_id);
CREATE INDEX idx_payments_premium_schedule_id ON payments (premium_schedule_id);
CREATE INDEX idx_payments_citizen_profile_id ON payments (citizen_profile_id);
CREATE INDEX idx_payments_organization_id ON payments (organization_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_provider_reference ON payments (provider_reference)
    WHERE provider_reference IS NOT NULL;
CREATE INDEX idx_payments_initiated_at ON payments (initiated_at DESC);

CREATE TABLE payment_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id          UUID NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
    event_type          VARCHAR(50) NOT NULL
        CHECK (event_type IN (
            'INITIATED', 'AUTHORIZED', 'CAPTURED', 'COMPLETED',
            'FAILED', 'CANCELLED', 'REFUND_INITIATED', 'REFUNDED'
        )),
    event_data          JSONB NOT NULL DEFAULT '{}',
    source              VARCHAR(100),
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_events_payment_id ON payment_events (payment_id);
CREATE INDEX idx_payment_events_occurred_at ON payment_events (payment_id, occurred_at DESC);

CREATE TABLE refunds (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_reference    VARCHAR(100) NOT NULL,
    payment_id          UUID NOT NULL REFERENCES payments (id) ON DELETE RESTRICT,
    policy_id           UUID NOT NULL REFERENCES policies (id) ON DELETE RESTRICT,
    amount              NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    currency            CHAR(3) NOT NULL DEFAULT 'RWF',
    reason              TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED')),
    requested_by        UUID REFERENCES users (id) ON DELETE SET NULL,
    approved_by         UUID REFERENCES users (id) ON DELETE SET NULL,
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    provider_reference  VARCHAR(255),
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_refunds_reference UNIQUE (refund_reference)
);

CREATE INDEX idx_refunds_payment_id ON refunds (payment_id);
CREATE INDEX idx_refunds_policy_id ON refunds (policy_id);
CREATE INDEX idx_refunds_status ON refunds (status);
