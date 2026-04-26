const getBase = () =>
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${getBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('PayPal auth failed')
  const data = await res.json()
  return data.access_token
}

export async function createPayPalOrder({
  amountUsd,
  description,
  returnUrl,
  cancelUrl,
}: {
  amountUsd: number
  description: string
  returnUrl: string
  cancelUrl: string
}) {
  const token = await getAccessToken()

  const res = await fetch(`${getBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
          description,
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'ShuttleWave',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
      },
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(JSON.stringify(err))
  }

  const order = await res.json()
  const approveLink = order.links.find(
    (l: { rel: string; href: string }) => l.rel === 'approve'
  )
  if (!approveLink) throw new Error('No approve link in PayPal order')

  return { orderId: order.id as string, approveUrl: approveLink.href as string }
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken()

  const res = await fetch(`${getBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  // ORDER_ALREADY_CAPTURED → idempotent success
  if (res.status === 422) {
    const err = await res.json()
    const alreadyCaptured = err?.details?.some(
      (d: { issue: string }) => d.issue === 'ORDER_ALREADY_CAPTURED'
    )
    if (alreadyCaptured) return { alreadyCaptured: true }
  }

  if (!res.ok) {
    const err = await res.json()
    throw new Error(JSON.stringify(err))
  }

  return await res.json()
}
