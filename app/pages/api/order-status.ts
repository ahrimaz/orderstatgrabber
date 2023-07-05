import axios from 'axios';

export default async function handler(req, res) {
  const { account, orderID, format, type } = req.body;

  const authHeader = `Basic ${Buffer.from('DI:RPLAPI').toString('base64')}`; // Base64 encoded auth header value

  try {
    const response = await axios.post(
      'https://dmz.richmondprolab.net/OrderAPI',
      {
        account,
        orderID,
        format,
        type,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order status. Please try again later.' });
  }
}