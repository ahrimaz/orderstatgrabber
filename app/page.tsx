'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';


interface OrderStatus {
  Account: string;
  LabOrderID: string;
  CustomerOrderID: string;
  Status: OrderStatusItem[];
}

interface OrderStatusItem {
  code: string;
  timestamp: string;
  carrier?: string;
  tracking?: string;
}

export default function Home() {
  const [account, setAccount] = useState('');
  const [minOrderNum, setMinOrderNum] = useState('');
  const [maxOrderNum, setMaxOrderNum] = useState('');
  const [singleOrderNum, setSingleOrderNum] = useState('');
  const [orders, setOrders] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRangeSearch = async () => {
    if (account.trim() !== '' && minOrderNum.trim() !== '' && maxOrderNum.trim() !== '') {
      setOrders([]);
      setLoading(true);
      setError(null);
  
      const authHeader = `Basic ${btoa('DI:RPLAPI')}`;
  
      const minOrder = parseInt(minOrderNum.trim().substr(1));
      const maxOrder = parseInt(maxOrderNum.trim().substr(1));
  
      const orderPromises = [];
  
      for (let i = minOrder; i <= maxOrder; i++) {
        const orderID = `Q${i.toString().padStart(7, '0')}`;
  
        const orderPromise = axios
          .post(
            '/api/OrderAPI',
            {
              account,
              orderID,
              format: 'json',
              type: 'standard',
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: authHeader,
              },
            }
          )
          .then((response) => response.data.Response[0])
          .catch(() => null); // Ignore errors and return null for failed requests
  
        orderPromises.push(orderPromise);
      }
  
      try {
        const responses = await Promise.all(orderPromises);
        const validOrders = responses.filter((orderStatus) => orderStatus !== null);
  
        if (validOrders.length > 0) {
          setOrders(validOrders);
        } else {
          setError('No orders found in the specified range.');
        }
      } catch (err) {
        setError('Failed to fetch order status. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSingleSearch = async () => {
    if (account.trim() !== '' && singleOrderNum.trim() !== '') {
      setOrders([]);
      setLoading(true);
      setError(null);

      const authHeader = `Basic ${btoa('DI:RPLAPI')}`;

      const orderID = singleOrderNum.trim();

      try {
        const response = await axios.post(
          '/api/OrderAPI',
          {
            account,
            orderID,
            format: 'json',
            type: 'standard',
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: authHeader,
            },
          }
        );

        const orderStatus = response.data.Response[0];

        if (orderStatus.Status.length > 0) {
          setOrders([orderStatus]);
        } else {
          setError(`No status found for order: ${orderID}`);
        }
      } catch (err) {
        setError('Failed to fetch order status. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOrders([]);
    setLoading(true);
    setError(null);

    if (minOrderNum.trim() !== '' && maxOrderNum.trim() !== '') {
      handleRangeSearch();
    } else if (singleOrderNum.trim() !== '') {
      handleSingleSearch();
    } else {
      setError('Please enter a valid order range or a single order number.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold">Order Status Checker</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="my-6 flex flex-col items-center p-2">
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="Account Number"
            className="p-2 my-2 border border-gray-300"
          />
          <input
            type="text"
            value={singleOrderNum}
            onChange={(e) => setSingleOrderNum(e.target.value)}
            placeholder="Single Order Number (e.g., Q1234567)"
            className="p-2 my-2 border border-gray-300"
          />
        </div>
        <div className="flex justify-center mt-4">
  <button
    type="button"
    className="bg-blue-500 rounded-lg px-4 py-2 text-white"
    onClick={handleSingleSearch}
  >
    Search Order ID
  </button>
</div>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {orders.length > 0 && (
  <div className="mt-8">
    <h2 className="text-lg font-semibold">Orders Found:</h2>
    <div className="grid grid-cols-2 gap-4 mt-4">
      {orders.map((order) => (
        <div key={order.LabOrderID} className="bg-white p-4 rounded-md shadow-md">
          <h3 className="text-lg font-semibold">Order ID: {order.LabOrderID}</h3>
          <p className="mt-2">
            Status:{" "}
            <span
              className={`inline-block px-2 py-1 rounded-md ${
                order.Status[0].code === "Shipped" ? "bg-green-500 text-white" : ""
              }`}
            >
              {order.Status[0].code}
            </span>
          </p>
          <p className="mt-1">Timestamp: {order.Status[0].timestamp}</p>
          {order.Status[0].carrier && (
            <p className="mt-1">Carrier: {order.Status[0].carrier}</p>
          )}
          {order.Status[0].tracking && (
            <p className="mt-1">Tracking: {order.Status[0].tracking}</p>
          )}
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  );
}