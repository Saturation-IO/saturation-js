'use client';

import { useEffect, useState } from 'react';
import { type Transaction } from '@saturation-api/js';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSaturation } from '@/contexts/SaturationContext';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const client = useSaturation();

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { transactions: transactionsData } = await client.listTransactions({
          limit: 100,
          expands: ['project', 'contact', 'account', 'actual', 'attachments']
        });
        setTransactions(transactionsData);
        setFetchError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [client]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Transactions</h1>
          <p>Loading transactions (limit: 100)...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Transactions</h1>
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-600">{fetchError}</p>
          </div>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transactions (Latest 100)</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="overflow-auto text-sm">
            {JSON.stringify(transactions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}