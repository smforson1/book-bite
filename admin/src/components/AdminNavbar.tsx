import { HiMenu } from 'react-icons/hi';

export default function AdminNavbar() {
    return (
        <header className="flex justify-between items-center py-4 px-6 bg-white border-b-4 border-indigo-600">
            <div className="flex items-center">
                <button className="text-gray-500 focus:outline-none lg:hidden">
                    <HiMenu className="h-6 w-6" />
                </button>
            </div>

            <div className="flex items-center">
                <div className="relative">
                    <button className="flex mx-4 text-gray-600 focus:outline-none">
                        <span className="sr-only">Notifications</span>
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 7.96249 16.0239 5.37632 13.25 4.54226V4.25C13.25 3.55964 12.6904 3 12 3C11.3096 3 10.75 3.55964 10.75 4.25V4.54226C7.97613 5.37632 6 7.96249 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="relative">
                    <button className="block h-8 w-8 rounded-full overflow-hidden shadow focus:outline-none">
                        <div className="h-full w-full bg-indigo-500 flex items-center justify-center text-white font-bold">A</div>
                    </button>
                </div>
            </div>
        </header>
    );
}
