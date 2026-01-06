export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { order_id } = req.query;
  const url = `https://api.cashfree.com/pg/orders/${order_id}`;
  
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
    res.status(200).json(data); // Returns full order details
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}