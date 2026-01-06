// api/check_status.js
export default async function handler(req, res) {
  // START OF NEW CODE
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  const { order_id } = req.query; // This will receive the link_id from ESP32

  // CHANGE: Check the status of the LINK, not the order
  const url = `https://sandbox.cashfree.com/pg/links/${order_id}`;
  
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-api-version': '2022-09-01',
      'x-client-id': process.env.CF_APP_ID,
      'x-client-secret': process.env.CF_SECRET_KEY
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Cashfree Links return "PAID", "ACTIVE" (Not Paid), or "EXPIRED"
    res.status(200).json({ status: data.link_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}