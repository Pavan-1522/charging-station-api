export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // 1. Get data from ESP32
  const { amount, phone } = req.body;

  // CHANGE 1: Use the 'links' endpoint instead of 'orders'
  const url = 'https://sandbox.cashfree.com/pg/links'; 

  // CHANGE 2: Generate a Link ID instead of Order ID
  const linkId = "link_" + Date.now(); 

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'x-api-version': '2022-09-01',
      'content-type': 'application/json',
      'x-client-id': process.env.CF_APP_ID,
      'x-client-secret': process.env.CF_SECRET_KEY
    },
    // CHANGE 3: The body structure for Links is different
    body: JSON.stringify({
      link_id: linkId,
      link_amount: amount,
      link_currency: "INR",
      link_purpose: "EV Charging",
      customer_details: {
        customer_phone: phone || "9876543210",
        customer_email: "user@elegets.in" // Email is required for Links, using a dummy is fine
      },
      link_meta: {
        return_url: "https://pavan-1522.github.io/elegets-charging-station/"
      }
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Check if Cashfree returned an error
    if (data.type === "error") {
      // Return the error details to help debug
      return res.status(400).json({ error: data.message });
    }
    
    // CHANGE 4: Map 'link_url' to 'payment_link' so your ESP32 understands it
    res.status(200).json({ 
        order_id: data.link_id,      // We send back link_id as the order_id
        payment_link: data.link_url  // This is the clickable/scannable URL
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}