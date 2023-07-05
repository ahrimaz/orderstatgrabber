'use client'

import { useState, FormEvent } from 'react'
import axios from 'axios'

interface orderStatusResponse {
  status: string;
}

export default function Home() {
  const [account, setAccount] =useState('')
  const [orderID, setOrderID] =useState('')
  const [orderStatus, setOrderStatus] = useState<orderStatusResponse | null>(null)
  const [loading, setLoading] =useState(false)
  const [error, setSerror] =useState<string | null>(null)

  const handleFormSubmit = async (e: FormEvent ) => {
    e.preventDefault()
    setLoading(true)
    setSerror(null)

    const authHeader = `Basic ${btoa('DI:RPLAPI')}`

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
      console.log(response.data)
      setOrderStatus(response.data.Response[0].Status[0].code);
    } catch (err) {
      setSerror('failed to fetch order status. confirm acct id and order # and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen text-center'>
      <h1 className='text-3xl font-bold'>order status checker</h1>
      <form onSubmit={handleFormSubmit}>
        <div className='flex flex-col items-center my-4'>
          <input
            className='p-2 my-4 border border-s-slate-700'
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="enter account number"
          />
          <input
            className='p-2 my-4 border border-s-slate-700'
            type="text"
            value={orderID}
            onChange={(e) => setOrderID(e.target.value)}
            placeholder='enter order id'
          />
        </div>
        <button
          type="submit"
          className='bg-blue-500 rounded-lg p-4 my-2'>
            check order status
        </button>
      </form>
      {loading && <p>loading...</p>}
      {error && <p>{error}</p>}
      {orderStatus && (
        <div>
          <h2>order id: {orderID}</h2>
          <p>status: {orderStatus}</p>
        </div>
      )}
    </div>
  );
}
