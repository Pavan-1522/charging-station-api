// api/check_status.js
export default async function handler(req, res) {
  const { order_id } = req.query; 

  const url = `https://sandbox.cashfree.com/pg/orders/${order_id}`;
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
    // Return status: "PAID", "ACTIVE", or "EXPIRED"
    res.status(200).json({ status: data.order_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}