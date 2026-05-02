-- Atomic credit-only booking confirmation (deposit fully covered by account credit).
-- Mirrors TypeScript helpers: deposit_cents := round(price_cents * session_types.deposit_pct).

CREATE OR REPLACE FUNCTION public.confirm_booking_with_credit_only(p_slot_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_price_cents integer;
  v_deposit_pct numeric;
  v_starts_at timestamptz;
  v_session_type_id uuid;
  v_photographer_id uuid;
  v_private_request_id uuid;
  v_status slot_status;
  v_held_by uuid;
  v_deposit_cents integer;
  v_balance bigint;
  v_booking_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  PERFORM pg_advisory_xact_lock(4829101, hashtext(v_uid::text));

  SELECT
    ast.price_cents,
    st.deposit_pct,
    ast.starts_at,
    ast.session_type_id,
    ast.photographer_id,
    ast.private_request_id,
    ast.status,
    ast.held_by_user
  INTO STRICT
    v_price_cents,
    v_deposit_pct,
    v_starts_at,
    v_session_type_id,
    v_photographer_id,
    v_private_request_id,
    v_status,
    v_held_by
  FROM available_slots ast
  JOIN session_types st ON st.id = ast.session_type_id
  WHERE ast.id = p_slot_id;

  IF v_status <> 'held' OR v_held_by IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'SLOT_NOT_HELD_BY_YOU';
  END IF;

  v_deposit_cents := ROUND(v_price_cents * v_deposit_pct)::integer;

  SELECT COALESCE(SUM(amount_cents), 0)
  INTO v_balance
  FROM credit_ledger
  WHERE customer_id = v_uid;

  IF v_balance < v_deposit_cents THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDIT';
  END IF;

  INSERT INTO bookings (
    slot_id,
    customer_id,
    photographer_id,
    session_type_id,
    starts_at,
    amount_cents,
    deposit_cents,
    credit_applied_cents,
    stripe_payment_intent_id,
    stripe_checkout_session_id,
    pipeline_stage
  )
  VALUES (
    p_slot_id,
    v_uid,
    v_photographer_id,
    v_session_type_id,
    v_starts_at,
    v_price_cents,
    v_deposit_cents,
    v_deposit_cents,
    NULL,
    NULL,
    'booked'::pipeline_stage
  )
  RETURNING id INTO STRICT v_booking_id;

  INSERT INTO credit_ledger (
    customer_id,
    amount_cents,
    reason,
    booking_id,
    issued_by,
    notes
  )
  VALUES (
    v_uid,
    -v_deposit_cents,
    'applied_to_booking',
    v_booking_id,
    NULL,
    NULL
  );

  UPDATE available_slots
  SET status = 'booked'::slot_status,
      hold_expires_at = NULL,
      held_by_user = NULL,
      updated_at = now()
  WHERE id = p_slot_id;

  IF v_private_request_id IS NOT NULL THEN
    UPDATE custom_requests
    SET status = 'converted'::request_status,
        converted_at = now()
    WHERE id = v_private_request_id;
  END IF;

  RETURN v_booking_id;
END;
$$;

COMMENT ON FUNCTION public.confirm_booking_with_credit_only(uuid) IS
  'Confirms booking when Stripe is skipped and deposit is paid entirely from credit_ledger balance. Caller must hold the slot first.';

REVOKE ALL ON FUNCTION public.confirm_booking_with_credit_only(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_booking_with_credit_only(uuid) TO authenticated;
