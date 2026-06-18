-- V2: Organizations and identity (users, sessions, verification)

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    organization_type VARCHAR(50) NOT NULL
        CHECK (organization_type IN ('PLATFORM', 'INSURER', 'PARTNER', 'AGENCY')),
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL')),
    registration_number VARCHAR(100),
    tax_id          VARCHAR(100),
    country_code    CHAR(2) NOT NULL DEFAULT 'RW',
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(20),
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    district        VARCHAR(100),
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_organizations_slug UNIQUE (slug)
);

CREATE INDEX idx_organizations_type ON organizations (organization_type);
CREATE INDEX idx_organizations_status ON organizations (status);
CREATE INDEX idx_organizations_country ON organizations (country_code);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID REFERENCES organizations (id) ON DELETE SET NULL,
    email               VARCHAR(255),
    phone               VARCHAR(20),
    password_hash       VARCHAR(255) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    role                user_role NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING_VERIFICATION', 'SUSPENDED')),
    preferred_language  language_code NOT NULL DEFAULT 'RW',
    mfa_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret          VARCHAR(255),
    email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    version             INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_contact_check CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE UNIQUE INDEX uq_users_email ON users (LOWER(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX uq_users_phone ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_organization_id ON users (organization_id);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_org_role ON users (organization_id, role) WHERE organization_id IS NOT NULL;

CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    device_info     VARCHAR(500),
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at) WHERE revoked = FALSE;
CREATE INDEX idx_refresh_tokens_user_active ON refresh_tokens (user_id, expires_at) WHERE revoked = FALSE;

CREATE TABLE verification_challenges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL
        CHECK (type IN (
            'EMAIL_VERIFICATION',
            'PHONE_VERIFICATION',
            'PASSWORD_RESET',
            'MFA_LOGIN',
            'MFA_SETUP'
        )),
    code_hash       VARCHAR(255) NOT NULL,
    attempts        INTEGER NOT NULL DEFAULT 0,
    max_attempts    INTEGER NOT NULL DEFAULT 5,
    expires_at      TIMESTAMPTZ NOT NULL,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    used_at         TIMESTAMPTZ,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_challenges_user_id ON verification_challenges (user_id);
CREATE INDEX idx_verification_challenges_type ON verification_challenges (type);
CREATE INDEX idx_verification_challenges_user_type_active
    ON verification_challenges (user_id, type, expires_at)
    WHERE used = FALSE;
