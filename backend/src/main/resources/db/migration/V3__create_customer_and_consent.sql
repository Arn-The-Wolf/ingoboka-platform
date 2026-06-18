-- V3: Citizen profiles, dependants, consents, and data subject requests

CREATE TABLE citizen_profiles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    national_id             VARCHAR(20),
    date_of_birth           DATE,
    gender                  gender,
    kyc_status              kyc_status NOT NULL DEFAULT 'PENDING',
    kyc_verified_at         TIMESTAMPTZ,
    kyc_rejection_reason    TEXT,
    address_line1           VARCHAR(255),
    address_line2           VARCHAR(255),
    district                VARCHAR(100),
    sector                  VARCHAR(100),
    cell                    VARCHAR(100),
    village                 VARCHAR(100),
    occupation              VARCHAR(150),
    employer_name           VARCHAR(255),
    emergency_contact_name  VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    metadata                JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_citizen_profiles_national_id
    ON citizen_profiles (national_id) WHERE national_id IS NOT NULL;
CREATE INDEX idx_citizen_profiles_kyc_status ON citizen_profiles (kyc_status);
CREATE INDEX idx_citizen_profiles_district ON citizen_profiles (district);

CREATE TABLE dependants (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_profile_id  UUID NOT NULL REFERENCES citizen_profiles (id) ON DELETE CASCADE,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    relationship        VARCHAR(50) NOT NULL
        CHECK (relationship IN (
            'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GUARDIAN', 'OTHER'
        )),
    date_of_birth       DATE,
    gender              gender,
    national_id         VARCHAR(20),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dependants_citizen_profile_id ON dependants (citizen_profile_id);
CREATE INDEX idx_dependants_relationship ON dependants (citizen_profile_id, relationship);

CREATE TABLE consents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_profile_id  UUID NOT NULL REFERENCES citizen_profiles (id) ON DELETE CASCADE,
    consent_type        VARCHAR(100) NOT NULL
        CHECK (consent_type IN (
            'TERMS_OF_SERVICE',
            'PRIVACY_POLICY',
            'MARKETING',
            'DATA_PROCESSING',
            'HEALTH_DATA',
            'THIRD_PARTY_SHARING'
        )),
    consent_version     VARCHAR(50) NOT NULL,
    granted             BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at          TIMESTAMPTZ,
    ip_address          INET,
    user_agent          VARCHAR(500),
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consents_citizen_profile_id ON consents (citizen_profile_id);
CREATE INDEX idx_consents_type ON consents (consent_type);
CREATE INDEX idx_consents_citizen_type_active
    ON consents (citizen_profile_id, consent_type)
    WHERE revoked_at IS NULL AND granted = TRUE;

CREATE TABLE data_requests (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_profile_id  UUID NOT NULL REFERENCES citizen_profiles (id) ON DELETE CASCADE,
    request_type        VARCHAR(50) NOT NULL
        CHECK (request_type IN ('ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION')),
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED')),
    description         TEXT,
    response_notes      TEXT,
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    handled_by          UUID REFERENCES users (id) ON DELETE SET NULL,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_requests_citizen_profile_id ON data_requests (citizen_profile_id);
CREATE INDEX idx_data_requests_status ON data_requests (status);
CREATE INDEX idx_data_requests_type ON data_requests (request_type);
CREATE INDEX idx_data_requests_pending ON data_requests (requested_at) WHERE status = 'PENDING';
