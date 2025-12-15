import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Squares2X2Icon,
    TicketIcon,
    ArrowRightOnRectangleIcon,
    UsersIcon,
    BuildingStorefrontIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-xl">
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-indigo-500">Book</span>Bite
                </h2>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Admin Portal</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/dashboard')
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <Squares2X2Icon className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                    to="/activation-codes"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/activation-codes')
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <TicketIcon className="w-5 h-5" />
                    <span className="font-medium">Activation Codes</span>
                </Link>

                <Link
                    to="/users"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/users')
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <UsersIcon className="w-5 h-5" />
                    <span className="font-medium">User Management</span>
                </Link>
                <Link
                    to="/businesses"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/businesses')
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <BuildingStorefrontIcon className="w-5 h-5" />
                    <span className="font-medium">Businesses</span>
                </Link>

                <Link
                    to="/revenue"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/revenue')
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span className="font-medium">Revenue</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
