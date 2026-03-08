export default async function handler(req, res) {
  // 1. CORS Headers (Crucial to prevent "Failed to fetch")
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order_id, amount } = req.body;

  if (!order_id || !amount) {
    return res.status(400).json({ error: "Missing order_id or amount" });
  }

  // Create a unique refund ID (Cashfree requires this to prevent duplicate refunds)
  const refund_id = `ref_${order_id}_${Date.now()}`;
  
  const url = `https://api.cashfree.com/pg/orders/${order_id}/refunds`;
  
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-version': '2022-09-01',
      'x-client-id': process.env.CF_APP_ID,       // Reusing your existing Env Vars
      'x-client-secret': process.env.CF_SECRET_KEY
    },
    body: JSON.stringify({
      refund_amount: amount,
      refund_id: refund_id,
      refund_note: "EV Slot Cancellation"
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
        res.status(200).json({ success: true, details: data });
    } else {
        res.status(response.status).json({ error: "Refund failed", details: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}