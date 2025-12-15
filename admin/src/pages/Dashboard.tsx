import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { motion } from 'framer-motion';
import {
    UsersIcon,
    BriefcaseIcon,
    TicketIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalManagers: 0,
        activeCodes: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')}`}>
                <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    {trend && (
                        <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                            {trend}
                        </span>
                    )}
                </div>

                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
        </motion.div>
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                            <p className="text-gray-500 mt-2">Welcome back, Admin. Performance metrics for today.</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                Last updated: {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </header>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <StatCard
                                title="Total Users"
                                value={stats.totalUsers.toLocaleString()}
                                icon={UsersIcon}
                                color="bg-blue-500"
                                trend="+12%"
                            />
                            <StatCard
                                title="Total Managers"
                                value={stats.totalManagers.toLocaleString()}
                                icon={BriefcaseIcon}
                                color="bg-purple-500"
                                trend="+5%"
                            />
                            <StatCard
                                title="Active Codes"
                                value={stats.activeCodes.toLocaleString()}
                                icon={TicketIcon}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Total Revenue"
                                value={`$${stats.totalRevenue.toLocaleString()}`}
                                icon={BanknotesIcon}
                                color="bg-amber-500"
                                trend="+18%"
                            />
                        </motion.div>
                    )}

                    {/* Activity Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
                                <select className="text-sm border-gray-200 rounded-lg text-gray-500">
                                    <option>Accrued Revenue</option>
                                </select>
                            </div>

                            {/* Mock Chart Area */}
                            <div className="h-64 flex items-end justify-between gap-2 px-4">
                                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                    <div key={i} className="w-full bg-indigo-50 hover:bg-indigo-100 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            ${h * 10}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-gray-400">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="space-y-4">
                                <Link to="/activation-codes" className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <TicketIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-gray-700">Generate Code</span>
                                    </div>
                                    <span className="text-gray-400 text-sm">→</span>
                                </Link>

                                <Link to="/users" className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <UsersIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-gray-700">Manage Users</span>
                                    </div>
                                    <span className="text-gray-400 text-sm">→</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
