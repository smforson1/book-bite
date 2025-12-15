import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import {
    BuildingStorefrontIcon,
    FlagIcon,
    MapPinIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';

export default function BusinessManagement() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const response = await api.get('/admin/businesses');
            setBusinesses(response.data);
        } catch (error) {
            console.error('Failed to fetch businesses', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = async (businessId: string) => {
        try {
            await api.post('/admin/toggle-flag-business', { businessId });
            setBusinesses(businesses.map(b =>
                b.id === businessId ? { ...b, isFlagged: !b.isFlagged } : b
            ));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Business Oversight</h1>
                        <p className="text-gray-500 mt-2">Monitor and moderate registered hotels and restaurants.</p>
                    </header>

                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {businesses.map((biz) => (
                                <div key={biz.id} className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${biz.isFlagged ? 'border-red-200 ring-1 ring-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-lg ${biz.type === 'HOTEL' || biz.type === 'HOSTEL' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            <BuildingStorefrontIcon className="w-6 h-6" />
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${biz.isFlagged ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {biz.isFlagged ? 'Flagged' : 'Active'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{biz.name}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mb-3">
                                        <MapPinIcon className="w-4 h-4 mr-1" />
                                        {biz.address}
                                    </div>

                                    <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                                        <p><span className="font-semibold">Manager:</span> {biz.manager?.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500 mt-1">{biz.manager?.user?.email}</p>
                                    </div>

                                    <div className="flex gap-4 text-sm text-gray-500 mb-6 border-t border-b border-gray-100 py-3">
                                        <div className="text-center flex-1 border-r">
                                            <span className="block font-bold text-gray-900">{biz._count?.bookings}</span>
                                            Bookings
                                        </div>
                                        <div className="text-center flex-1">
                                            <span className="block font-bold text-gray-900">{biz._count?.orders}</span>
                                            Orders
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleFlag(biz.id)}
                                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${biz.isFlagged
                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                    >
                                        <FlagIcon className="w-4 h-4" />
                                        {biz.isFlagged ? 'Remove Flag' : 'Flag Inappropriate'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
