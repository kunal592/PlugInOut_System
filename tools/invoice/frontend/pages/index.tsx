import React, { useState, useEffect } from 'react';

export default function InvoiceList() {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        // In a real implementation, use the passed API client
        fetch('/api/tools/invoice')
            .then(res => res.json())
            .then(data => setInvoices(data.data || []));
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Invoices</h1>
                <button className="bg-primary text-white px-4 py-2 rounded">New Invoice</button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="p-4">Client</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv: any) => (
                            <tr key={inv.id} className="border-t">
                                <td className="p-4 font-medium">{inv.clientName}</td>
                                <td className="p-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">₹{(inv.amount / 100).toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No invoices found. Create your first one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
