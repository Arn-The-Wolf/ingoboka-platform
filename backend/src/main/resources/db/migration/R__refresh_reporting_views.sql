-- Repeatable: refresh reporting views

DROP VIEW IF EXISTS v_claim_summary;
DROP VIEW IF EXISTS v_policy_summary;

CREATE VIEW v_policy_summary AS
SELECT
    p.id AS policy_id,
    p.policy_number,
    p.status AS policy_status,
    p.coverage_start_date AS start_date,
    p.coverage_end_date AS end_date,
    p.next_billing_date AS next_premium_due,
    ip.id AS product_id,
    ip.name AS product_name,
    cp.district,
    cp.occupation AS occupation_category,
    cp.kyc_status,
    o.name AS insurer_name
FROM policies p
JOIN product_plans pp ON p.product_plan_id = pp.id
JOIN product_versions pv ON pp.product_version_id = pv.id
JOIN insurance_products ip ON pv.product_id = ip.id
JOIN citizen_profiles cp ON p.citizen_profile_id = cp.id
JOIN organizations o ON p.organization_id = o.id;

CREATE VIEW v_claim_summary AS
SELECT
    c.id AS claim_id,
    c.claim_number,
    c.status AS claim_status,
    c.claim_type,
    c.claimed_amount,
    c.approved_amount,
    c.currency,
    c.reported_at,
    c.submitted_at,
    c.resolved_at,
    p.policy_number,
    p.id AS policy_id,
    o.id AS organization_id,
    o.name AS organization_name
FROM claims c
JOIN policies p ON c.policy_id = p.id
JOIN organizations o ON c.organization_id = o.id;
