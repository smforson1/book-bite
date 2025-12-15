import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import {
    PlusIcon,
    ClipboardDocumentCheckIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function ActivationCodes() {
    const [codes, setCodes] = useState([]);
    const [price, setPrice] = useState('10.00');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            const response = await api.get('/admin/activation-codes');
            setCodes(response.data);
        } catch (error) {
            console.error('Failed to fetch codes', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCode = async () => {
        if (!price || isNaN(Number(price))) {
            alert('Please enter a valid price');
            return;
        }

        setGenerating(true);
        try {
            await api.post('/admin/generate-code', { price: Number(price) });
            fetchCodes();
            alert('Code generated successfully!');
        } catch (error) {
            console.error('Failed to generate code', error);
            alert('Failed to generate code');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Activation Codes</h1>
                            <p className="text-gray-500 mt-2">Manage access codes for new managers.</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 pl-7 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="0.00"
                                />
                            </div>
                            <button
                                onClick={generateCode}
                                disabled={generating}
                                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                            >
                                {generating ? 'Generating...' : (
                                    <>
                                        <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                                        Generate Code
                                    </>
                                )}
                            </button>
                        </div>
                    </header>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                                        </tr>
                                    ) : codes.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                No activation codes generated yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        codes.map((code: any) => (
                                            <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">{code.code}</span>
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(code.code); alert('Copied!') }}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${code.price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${code.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {code.isUsed ? 'Used' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(code.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
