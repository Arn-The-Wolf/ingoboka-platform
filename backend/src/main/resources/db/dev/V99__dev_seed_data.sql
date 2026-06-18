-- V99: Development seed data (runs only with dev profile via classpath:db/dev)

-- BCrypt hash for password: Ingoboka@2026

INSERT INTO organizations (id, name, slug, organization_type, status, contact_email)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Ingoboka Platform', 'ingoboka-platform', 'PLATFORM', 'ACTIVE', 'admin@ingoboka.rw'),
    ('22222222-2222-2222-2222-222222222222', 'Demo Insurer Rwanda', 'demo-insurer-rw', 'INSURER', 'ACTIVE', 'contact@demo-insurer.rw');

INSERT INTO users (id, organization_id, email, phone, password_hash, first_name, last_name, role, status, preferred_language, phone_verified, email_verified)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL, '0780000001',
     '$2b$10$X1/sNfBQvx3nrMZvKZyFo.ycR9DgGKJRzVz4u95xSIyLHrG3ilAsq',
     'Aline', 'Mukamana', 'CITIZEN', 'ACTIVE', 'RW', TRUE, FALSE),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'eric@demo-insurer.rw', NULL,
     '$2b$10$X1/sNfBQvx3nrMZvKZyFo.ycR9DgGKJRzVz4u95xSIyLHrG3ilAsq',
     'Eric', 'Habimana', 'INSURER_CLAIMS_OFFICER', 'ACTIVE', 'EN', FALSE, TRUE),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'diane@demo-insurer.rw', NULL,
     '$2b$10$X1/sNfBQvx3nrMZvKZyFo.ycR9DgGKJRzVz4u95xSIyLHrG3ilAsq',
     'Diane', 'Uwase', 'INSURER_ADMIN', 'ACTIVE', 'EN', FALSE, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'admin@ingoboka.rw', NULL,
     '$2b$10$X1/sNfBQvx3nrMZvKZyFo.ycR9DgGKJRzVz4u95xSIyLHrG3ilAsq',
     'Platform', 'Admin', 'PLATFORM_ADMIN', 'ACTIVE', 'EN', FALSE, TRUE),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222', 'agent@demo-insurer.rw', '0780000099',
     '$2b$10$X1/sNfBQvx3nrMZvKZyFo.ycR9DgGKJRzVz4u95xSIyLHrG3ilAsq',
     'Jean', 'Agent', 'AGENT', 'ACTIVE', 'RW', TRUE, FALSE);

INSERT INTO citizen_profiles (id, user_id, national_id, date_of_birth, gender, kyc_status, district, occupation)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '1199880012345678', '1995-03-15', 'FEMALE', 'VERIFIED', 'Gasabo', 'Trader');

INSERT INTO insurance_products (id, organization_id, code, name, category, description, status)
VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222',
     'PA-HC-BUNDLE', 'Personal Accident + Hospital Cash Bundle', 'BUNDLE',
     'Microinsurance bundle covering personal accident and daily hospital cash benefits.', 'ACTIVE');

INSERT INTO product_versions (id, product_id, version_number, effective_from, terms_summary, status, published_at, published_by)
VALUES
    ('10101010-1010-1010-1010-101010101010', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1,
     CURRENT_DATE, 'Comprehensive microinsurance coverage for everyday risks.', 'PUBLISHED', NOW(), 'cccccccc-cccc-cccc-cccc-cccccccccccc');

UPDATE insurance_products SET current_version_id = '10101010-1010-1010-1010-101010101010'
WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

INSERT INTO product_plans (id, product_version_id, code, name, billing_frequency, premium_amount, sum_assured, is_default)
VALUES
    ('20202020-2020-2020-2020-202020202020', '10101010-1010-1010-1010-101010101010', 'DAILY', 'Daily Plan', 'DAILY', 200.00, 500000.00, FALSE),
    ('30303030-3030-3030-3030-303030303030', '10101010-1010-1010-1010-101010101010', 'WEEKLY', 'Weekly Plan', 'WEEKLY', 1200.00, 500000.00, FALSE),
    ('40404040-4040-4040-4040-404040404040', '10101010-1010-1010-1010-101010101010', 'MONTHLY', 'Monthly Plan', 'MONTHLY', 4500.00, 500000.00, TRUE);

INSERT INTO product_benefits (product_version_id, code, name, description, benefit_type, coverage_amount, sort_order)
VALUES
    ('10101010-1010-1010-1010-101010101010', 'PA-DEATH', 'Accidental Death Benefit', 'Lump sum on accidental death', 'LUMP_SUM', 500000.00, 1),
    ('10101010-1010-1010-1010-101010101010', 'HC-DAILY', 'Hospital Cash Daily', 'Daily cash during hospitalization', 'DAILY_CASH', 15000.00, 2);

INSERT INTO product_exclusions (product_version_id, code, title, description, sort_order)
VALUES
    ('10101010-1010-1010-1010-101010101010', 'EX-WAR', 'War and civil unrest', 'Losses arising from war, riots, or civil unrest are excluded.', 1),
    ('10101010-1010-1010-1010-101010101010', 'EX-SELF', 'Self-inflicted injury', 'Intentional self-harm or suicide within the first year.', 2);

INSERT INTO product_required_documents (product_version_id, document_type, is_mandatory, description)
VALUES
    ('10101010-1010-1010-1010-101010101010', 'NATIONAL_ID', TRUE, 'Valid Rwanda national ID'),
    ('10101010-1010-1010-1010-101010101010', 'MEDICAL_REPORT', FALSE, 'Medical report for claim substantiation');

INSERT INTO policies (id, policy_number, citizen_profile_id, product_plan_id, organization_id, status,
                      coverage_start_date, coverage_end_date, premium_amount, next_billing_date, activated_at)
VALUES
    ('50505050-5050-5050-5050-505050505050', 'ING-2026-DEMO01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
     '40404040-4040-4040-4040-404040404040', '22222222-2222-2222-2222-222222222222', 'ACTIVE',
     CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 4500.00, CURRENT_DATE + INTERVAL '1 month', NOW());

INSERT INTO claims (id, claim_number, policy_id, citizen_profile_id, organization_id, status,
                    incident_date, claim_type, description, claimed_amount, submitted_at)
VALUES
    ('60606060-6060-6060-6060-606060606060', 'ING-CLM-2026-DEMO01', '50505050-5050-5050-5050-505050505050',
     'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'UNDER_REVIEW',
     CURRENT_DATE - INTERVAL '7 days', 'ACCIDENT', 'Minor road accident requiring outpatient treatment.', 75000.00, NOW() - INTERVAL '5 days');

INSERT INTO partner_contracts (id, organization_id, partner_id, contract_number, status, start_date, terms)
VALUES
    ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222',
     '11111111-1111-1111-1111-111111111111', 'PC-2026-DEMO01', 'ACTIVE', CURRENT_DATE, '{}');

INSERT INTO contract_price_rules (contract_id, rule_type, rate_value, currency, effective_from)
VALUES
    ('77777777-7777-7777-7777-777777777777', 'COMMISSION_PERCENT', 5.0000, 'RWF', CURRENT_DATE);

INSERT INTO revenue_ledger (organization_id, entry_type, amount, currency, reference_type, reference_id, description)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'CREDIT', 225.00, 'RWF', 'PAYMENT',
     '50505050-5050-5050-5050-505050505050', 'Platform service fee on demo payment');
