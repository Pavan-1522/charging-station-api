// File: api/cancel_order.js

export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { order_id, amount } = req.body;

    if (!order_id || !amount) {
        return res.status(400).json({ error: "Missing order_id or amount" });
    }

    // 2. Setup Cashfree Credentials (Make sure these are in your Vercel Env Variables)
    const isProduction = true; // Change to false if using Cashfree Sandbox
    const baseURL = isProduction ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
    
    const clientId = process.env.CF_APP_ID;
    const clientSecret = process.env.CF_SECRET_KEY;

    // Generate a unique refund ID based on the order ID and timestamp
    const refund_id = `ref_${order_id}_${Date.now()}`;

    try {
        // 3. Call the Cashfree Refund API
        const response = await fetch(`${baseURL}/orders/${order_id}/refunds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': clientId,
                'x-client-secret': clientSecret,
                'x-api-version': '2023-08-01' 
            },
            body: JSON.stringify({
                refund_amount: amount,
                refund_id: refund_id,
                refund_note: "User cancelled EV charging slot reservation."
            })
        });

        const data = await response.json();

        // 4. Handle the Response
        if (response.ok) {
            return res.status(200).json({ 
                success: true, 
                message: "Refund initiated successfully", 
                refund_details: data 
            });
        } else {
            return res.status(response.status).json({ 
                error: "Cashfree Gateway Error", 
                details: data 
            });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}