'use client';

import { useEffect, useState } from 'react';
import { type Contact } from '@saturation-api/js';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSaturation } from '@/contexts/SaturationContext';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const client = useSaturation();

  useEffect(() => {
    async function fetchContacts() {
      try {
        const { contacts: contactsData } = await client.listContacts({
          expands: ['secureInfo', 'origin', 'projects', 'projects.accounts', 'startwork', 'taxDocuments', 'attachments', 'bankInfo', 'linkedUser']
        });
        setContacts(contactsData);
        setFetchError(null);
      } catch (err: any) {
        const errorMessage = err?.error?.message || err?.message || 'Failed to fetch contacts';
        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [client]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contacts</h1>
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contacts</h1>
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
          <h1 className="text-3xl font-bold">Contacts</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="overflow-auto text-sm">
            {JSON.stringify(contacts, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}