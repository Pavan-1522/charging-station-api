export default async function handler(req, res) {
  // CORS Check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { amount, phone } = req.body;

  // 1. URL: Use Orders API
  const url = 'https://sandbox.cashfree.com/pg/orders'; 
  
  // 2. ID: Generate unique Order ID
  const orderId = "order_" + Date.now(); 

  // 3. RETURN URL: Where user goes after paying
  // Cashfree will replace {order_id} automatically
  const returnUrl = "https://pavan-1522.github.io/elegets-charging-station/?order_id={order_id}";

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
        customer_id: "cust_" + Date.now(),
        customer_phone: phone || "9999999999",
        customer_name: "EV User",
        customer_email: "user@elegets.in"
      },
      order_meta: {
        return_url: returnUrl
      }
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.type === "error") {
      return res.status(400).json({ error: data.message });
    }

    // 4. RESPONSE: Send the Session ID to frontend
    res.status(200).json({ 
        order_id: data.order_id, 
        payment_session_id: data.payment_session_id 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}