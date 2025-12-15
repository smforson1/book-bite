import { create } from 'zustand';

interface Business {
    id: string;
    name: string;
    type: string;
    description?: string;
    address: string;
    images: string[];
}

interface BusinessState {
    business: Business | null;
    setBusiness: (business: Business | null) => void;
    clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
    business: null,
    setBusiness: (business) => set({ business }),
    clearBusiness: () => set({ business: null }),
}));
