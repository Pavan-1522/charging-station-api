// api/create_order.js
export default async function handler(req, res) {
  // 1. Get data from ESP32
  const { amount, phone } = req.body;

  // 2. Prepare Cashfree Config (Use 'api.cashfree.com' for production)
  const url = 'https://sandbox.cashfree.com/pg/orders'; 
  
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'x-api-version': '2022-09-01',
      'content-type': 'application/json',
      'x-client-id': process.env.CF_APP_ID,       // Set this in Vercel Settings
      'x-client-secret': process.env.CF_SECRET_KEY // Set this in Vercel Settings
    },
    body: JSON.stringify({
      order_id: "order_" + Date.now(), // Unique ID
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_001",
        customer_phone: phone || "9999999999"
      },
      order_meta: {
        return_url: "https://elegets.in" // Just a dummy placeholder
      }
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // 3. Send ONLY what ESP32 needs
    // We send payment_session_id so we can generate QR codes if needed, 
    // or just the raw link.
    res.status(200).json({ 
        order_id: data.order_id, 
        payment_link: data.payment_link 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}