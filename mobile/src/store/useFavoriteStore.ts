import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

interface FavoriteState {
    favorites: string[]; // Array of business IDs
    loading: boolean;
    fetchFavorites: (token: string) => Promise<void>;
    toggleFavorite: (businessId: string, token: string) => Promise<void>;
    isFavorite: (businessId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
    favorites: [],
    loading: false,

    fetchFavorites: async (token: string) => {
        try {
            set({ loading: true });
            const response = await axios.get(`${API_URL}/favorites/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const favoriteIds = response.data.map((fav: any) => fav.businessId);
            set({ favorites: favoriteIds, loading: false });
        } catch (error) {
            console.error('Failed to fetch favorites', error);
            set({ loading: false });
        }
    },

    toggleFavorite: async (businessId: string, token: string) => {
        try {
            const response = await axios.post(
                `${API_URL}/favorites/toggle`,
                { businessId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { isFavorite } = response.data;
            set((state) => ({
                favorites: isFavorite
                    ? [...state.favorites, businessId]
                    : state.favorites.filter((id) => id !== businessId),
            }));
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    },

    isFavorite: (businessId: string) => {
        return get().favorites.includes(businessId);
    },
}));
