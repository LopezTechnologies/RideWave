create or replace function public.reserve_shuttle_booking_atomic(
  p_order_id text,
  p_customer_name text,
  p_customer_email text,
  p_customer_whatsapp text,
  p_flight_number text,
  p_travel_date date,
  p_pickup_time time without time zone,
  p_destination text,
  p_booking_mode text,
  p_vehicle_type text,
  p_is_round_trip boolean,
  p_passengers integer,
  p_price_usd numeric,
  p_deposit_paid numeric,
  p_notes text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_pickup timestamp;
  v_candidate_start timestamp;
  v_candidate_end timestamp;
  v_outbound_minutes integer;
  v_return_minutes integer;
  v_conflict_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('ridewave-shuttle-' || p_travel_date::text));

  v_outbound_minutes := case p_destination
    when 'puerto-la-libertad' then 60
    when 'el-tunco' then 75
    when 'el-sunzal' then 75
    when 'el-zonte' then 90
    else 75
  end;

  v_return_minutes := case when coalesce(p_is_round_trip, false) then v_outbound_minutes else v_outbound_minutes end;

  v_pickup := p_travel_date::timestamp + p_pickup_time;
  v_candidate_start := v_pickup - interval '45 minutes';
  v_candidate_end := v_candidate_start + make_interval(mins => (45 + v_outbound_minutes + v_return_minutes + 20));

  select b.id
    into v_conflict_id
  from bookings b
  where b.service_type = 'shuttle'
    and b.status in ('pending', 'confirmed', 'completed')
    and (
      (
        ((b.travel_date::timestamp + b.pickup_time) - interval '45 minutes') < v_candidate_end
      )
      and
      (
        (
          ((b.travel_date::timestamp + b.pickup_time) - interval '45 minutes')
          + make_interval(
              mins => (
                45
                + case b.destination
                    when 'puerto-la-libertad' then 60
                    when 'el-tunco' then 75
                    when 'el-sunzal' then 75
                    when 'el-zonte' then 90
                    else 75
                  end
                + case coalesce(b.is_round_trip, false)
                    when true then case b.destination
                      when 'puerto-la-libertad' then 60
                      when 'el-tunco' then 75
                      when 'el-sunzal' then 75
                      when 'el-zonte' then 90
                      else 75
                    end
                    else case b.destination
                      when 'puerto-la-libertad' then 60
                      when 'el-tunco' then 75
                      when 'el-sunzal' then 75
                      when 'el-zonte' then 90
                      else 75
                    end
                  end
                + 20
              )
            )
        ) > v_candidate_start
      )
    )
  limit 1;

  if v_conflict_id is not null then
    return jsonb_build_object('success', false, 'conflict', true, 'conflict_id', v_conflict_id);
  end if;

  insert into bookings (
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
    origin,
    destination,
    price_usd,
    deposit_paid,
    paypal_order_id,
    notes
  ) values (
    'shuttle',
    'confirmed',
    p_customer_name,
    p_customer_email,
    p_customer_whatsapp,
    nullif(p_flight_number, ''),
    p_travel_date,
    p_pickup_time,
    p_passengers,
    p_booking_mode,
    p_vehicle_type,
    'Aeropuerto SAL',
    p_destination,
    p_price_usd,
    p_deposit_paid,
    p_order_id,
    nullif(p_notes, '')
  );

  return jsonb_build_object('success', true, 'conflict', false);
end;
$$;
