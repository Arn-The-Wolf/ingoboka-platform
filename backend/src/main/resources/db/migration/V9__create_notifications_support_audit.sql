-- V9: Notifications, support, audit, outbox, idempotency

CREATE TABLE notification_templates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(100) NOT NULL,
    channel             VARCHAR(50) NOT NULL CHECK (channel IN ('SMS', 'EMAIL', 'PUSH', 'IN_APP')),
    subject_en          VARCHAR(255),
    subject_rw          VARCHAR(255),
    body_en             TEXT NOT NULL,
    body_rw             TEXT NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notification_templates_code UNIQUE (code)
);

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    channel             VARCHAR(50) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    body                TEXT NOT NULL,
    read_at             TIMESTAMPTZ,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_user_read ON notifications (user_id, read_at);

CREATE TABLE support_tickets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    subject             VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority            VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    assigned_to         UUID REFERENCES users (id) ON DELETE SET NULL,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id            UUID REFERENCES users (id) ON DELETE SET NULL,
    organization_id     UUID REFERENCES organizations (id) ON DELETE SET NULL,
    action              VARCHAR(100) NOT NULL,
    entity_type         VARCHAR(100) NOT NULL,
    entity_id           UUID,
    correlation_id      VARCHAR(100),
    ip_address          INET,
    before_state        JSONB,
    after_state         JSONB,
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_org ON audit_logs (organization_id);
CREATE INDEX idx_audit_logs_occurred ON audit_logs (occurred_at DESC);

CREATE TABLE outbox_events (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type      VARCHAR(100) NOT NULL,
    aggregate_id        UUID NOT NULL,
    event_type          VARCHAR(100) NOT NULL,
    payload             JSONB NOT NULL,
    published           BOOLEAN NOT NULL DEFAULT FALSE,
    published_at        TIMESTAMPTZ,
    retry_count         INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_events_published ON outbox_events (published, created_at);

CREATE TABLE idempotency_keys (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key                 VARCHAR(100) NOT NULL,
    response_body       JSONB,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_idempotency_keys_key UNIQUE (key)
);
