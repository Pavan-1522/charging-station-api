export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Receive 'minutes' from frontend
  const { amount, phone, minutes } = req.body;
  
  const url = 'https://api.cashfree.com/pg/orders'; 
  const orderId = "ord_" + Date.now(); 

  // 2. Embed 'minutes' in the Return URL so it survives the redirect
  const returnUrl = `https://pavan-1522.github.io/elegets-charging-station/?order_id={order_id}&mins=${minutes}`;

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'x-api-version': '2022-09-01',
      'content-type': 'application/json',
      'x-client-id': process.env.CF_APP_ID,
      'x-client-secret': process.env.CF_SECRET_KEY
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: "user_" + Date.now(),
        customer_phone: phone || "9999999999",
        customer_name: "Tester"
      },
      order_meta: { return_url: returnUrl }
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data.type === "error") return res.status(400).json({ error: data.message });

    res.status(200).json({ 
        order_id: data.order_id, 
        payment_session_id: data.payment_session_id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}