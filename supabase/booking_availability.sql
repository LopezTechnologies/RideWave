-- Atomic shuttle reservation function.
-- Prevents overlapping bookings for single-vehicle operation.
-- NOTE: For future fleet support, replace single-conflict rule with capacity checks.

create or replace function public.reserve_shuttle_booking_atomic(
  p_service_type text,
  p_status text,
  p_customer_name text,
  p_customer_email text,
  p_customer_whatsapp text,
  p_flight_number text,
  p_travel_date date,
  p_pickup_time time,
  p_passengers integer,
  p_booking_mode text,
  p_vehicle_type text,
  p_is_round_trip boolean,
  p_origin text,
  p_destination text,
  p_price_usd numeric,
  p_deposit_paid numeric,
  p_paypal_order_id text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_one_way_minutes integer;
  v_duration_minutes integer;
  v_requested_start timestamp;
  v_requested_end timestamp;
  v_booking_id uuid;
  v_conflict_exists boolean;
begin
  perform pg_advisory_xact_lock(hashtext('shuttle:' || p_travel_date::text));

  v_one_way_minutes := case p_destination
    when 'puerto-la-libertad' then 45
    when 'el-tunco' then 55
    when 'el-sunzal' then 60
    when 'el-zonte' then 70
    else 60
  end;

  v_duration_minutes := case when p_is_round_trip then v_one_way_minutes * 2 else v_one_way_minutes end;

  v_requested_start := (p_travel_date::timestamp + p_pickup_time) - interval '45 minutes';
  v_requested_end := (p_travel_date::timestamp + p_pickup_time)
    + make_interval(mins => v_duration_minutes)
    + interval '20 minutes';

  select exists (
    select 1
    from public.bookings b
    where b.service_type = 'shuttle'
      and b.status in ('pending', 'confirmed', 'completed')
      and b.travel_date = p_travel_date
      and (
        v_requested_start < (
          (b.travel_date::timestamp + b.pickup_time)
          + make_interval(
            mins => (
              case b.destination
                when 'puerto-la-libertad' then 45
                when 'el-tunco' then 55
                when 'el-sunzal' then 60
                when 'el-zonte' then 70
                else 60
              end
            ) * case when coalesce(b.is_round_trip, false) then 2 else 1 end
          )
          + interval '20 minutes'
        )
        and
        ((b.travel_date::timestamp + b.pickup_time) - interval '45 minutes') < v_requested_end
      )
  ) into v_conflict_exists;

  if v_conflict_exists then
    return jsonb_build_object(
      'ok', false,
      'conflict', true,
      'message', 'Selected shuttle time is no longer available'
    );
  end if;

  insert into public.bookings (
    service_type,
    status,
    customer_name,
    customer_email,
    customer_whatsapp,
    flight_number,
    travel_date,
    pickup_time,
    passengers,
    booking_mode,
    vehicle_type,
    is_round_trip,
    origin,
    destination,
    price_usd,
    deposit_paid,
    paypal_order_id,
    notes
  ) values (
    p_service_type,
    p_status,
    p_customer_name,
    p_customer_email,
    p_customer_whatsapp,
    nullif(p_flight_number, ''),
    p_travel_date,
    p_pickup_time,
    p_passengers,
    p_booking_mode,
    p_vehicle_type,
    p_is_round_trip,
    p_origin,
    p_destination,
    p_price_usd,
    p_deposit_paid,
    p_paypal_order_id,
    nullif(p_notes, '')
  )
  returning id into v_booking_id;

  return jsonb_build_object(
    'ok', true,
    'conflict', false,
    'booking_id', v_booking_id
  );
end;
$$;
