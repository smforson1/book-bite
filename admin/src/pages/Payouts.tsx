import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Badge } from 'flowbite-react';
import { HiCheck, HiX, HiCurrencyDollar } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const API_URL = 'http://localhost:5000/api';

export default function Payouts() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/wallet/admin/payouts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayouts(response.data);
        } catch (error) {
            console.error('Error fetching payouts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (status: 'SUCCESS' | 'FAILED') => {
        if (!selectedPayout) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(
                `${API_URL}/wallet/admin/payouts/${selectedPayout.id}`,
                { status, rejectionReason: status === 'FAILED' ? rejectionReason : undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setModalOpen(false);
            setSelectedPayout(null);
            setRejectionReason('');
            fetchPayouts();
        } catch (error) {
            alert('Failed to process payout');
        }
    };

    const openApproveModal = (payout: any) => {
        // For approval, we might want a confirmation too, but for speed let's just confirm dialog or direct
        if (window.confirm(`Approve payout of ${payout.wallet.currency} ${payout.amount}?`)) {
            setSelectedPayout(payout);
            // Direct call for now as handleProcess uses selectedPayout state which updates async? 
            // Safer to just call API directly or use state proper.
            // Let's reuse handleProcess but set state first.
            // Actually, let's just do it cleanly:
            processDirectly(payout.id, 'SUCCESS');
        }
    };

    const processDirectly = async (id: string, status: 'SUCCESS') => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(
                `${API_URL}/wallet/admin/payouts/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPayouts();
        } catch (error) {
            alert('Failed to approve');
        }
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Payout Requests</h1>

                    <div className="grid grid-cols-1 gap-4">
                        {loading ? <p>Loading...</p> : payouts.length === 0 ? <p>No pending payouts.</p> : (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payouts.map((payout: any) => (
                                            <tr key={payout.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {payout.wallet.manager.user.name || payout.wallet.manager.user.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{payout.wallet.manager.user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{payout.wallet.manager.business?.name || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {payout.wallet.currency} {payout.amount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(payout.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => openApproveModal(payout)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedPayout(payout); setModalOpen(true); }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                    <Modal.Header>Reject Payout</Modal.Header>
                    <Modal.Body>
                        <div className="space-y-6">
                            <p className="text-base leading-relaxed text-gray-500">
                                Please provide a reason for rejecting this payout request. The funds will be returned to the manager's wallet.
                            </p>
                            <textarea
                                className="w-full border rounded p-2"
                                placeholder="Rejection reason..."
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button color="failure" onClick={() => handleProcess('FAILED')}>
                            Confirm Rejection
                        </Button>
                        <Button color="gray" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}
