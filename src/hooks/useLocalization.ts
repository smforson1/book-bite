import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

// Define types for our translations
type LanguageCode = 'en' | 'tw' | 'ga' | 'ee';

interface TranslationDict {
  [key: string]: string;
}

interface Translations {
  en: TranslationDict;
  tw: TranslationDict;
  ga: TranslationDict;
  ee: TranslationDict;
}

// Translation dictionaries
const translations: Translations = {
  en: {
    // Common terms
    'welcome': 'Welcome',
    'home': 'Home',
    'hotels': 'Hotels',
    'restaurants': 'Restaurants',
    'bookings': 'Bookings',
    'orders': 'Orders',
    'profile': 'Profile',
    'settings': 'Settings',
    'notifications': 'Notifications',
    'language': 'Language',
    'currency': 'Currency',
    
    // Hotel related
    'hotel': 'Hotel',
    'room': 'Room',
    'booking': 'Booking',
    'check_in': 'Check In',
    'check_out': 'Check Out',
    'guests': 'Guests',
    'total_price': 'Total Price',
    
    // Restaurant related
    'restaurant': 'Restaurant',
    'menu': 'Menu',
    'order': 'Order',
    'delivery': 'Delivery',
    'estimated_delivery': 'Estimated Delivery',
    
    // Actions
    'search': 'Search',
    'filter': 'Filter',
    'book_now': 'Book Now',
    'order_now': 'Order Now',
    'pay_now': 'Pay Now',
    'cancel': 'Cancel',
    'save': 'Save',
    'confirm': 'Confirm',
    
    // Status
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    
    // Messages
    'loading': 'Loading...',
    'no_data': 'No data available',
    'error_occurred': 'An error occurred',
    'try_again': 'Please try again',
  },
  
  tw: {
    // Twi translations
    'welcome': 'Akwaaba',
    'home': 'Fie',
    'hotels': 'Hotels',
    'restaurants': 'Restaurants',
    'bookings': 'Nsiesiei',
    'orders': 'Nsiesiei',
    'profile': 'Profael',
    'settings': 'Nsiesiei',
    'notifications': 'Nsiesiei',
    'language': 'Kasa',
    'currency': 'Sika',
    
    'hotel': 'Hotel',
    'room': 'Room',
    'booking': 'Nsiesiei',
    'check_in': 'Bra mu',
    'check_out': 'Twam',
    'guests': 'Ɔmanfoɔ',
    'total_price': 'Tɛkɛɛ a wɔbɛtɔ',
    
    'restaurant': 'Restaurant',
    'menu': 'Menu',
    'order': 'Nsiesiei',
    'delivery': 'Nsiesiei',
    'estimated_delivery': 'Nsiesiei a wɔbɛtɔ',
    
    'search': 'Hwehwɛ',
    'filter': 'Hwehwɛ',
    'book_now': 'Buei seisei ara',
    'order_now': 'Order Now',
    'pay_now': 'Pay Now',
    'cancel': 'Twam',
    'save': 'Kora',
    'confirm': 'Gye to mu',
    
    'pending': 'Nsiesiei',
    'confirmed': 'Gye to mu',
    'completed': 'Awie',
    'cancelled': 'Atwa mu',
    
    'loading': 'Ɛrehunu...',
    'no_data': 'Enni data biara',
    'error_occurred': 'Enyi ahyɛn bi',
    'try_again': 'Yɛsrɛ wo bɔ mbɔ bio',
  },
  
  ga: {
    // Ga translations
    'welcome': 'Woe akwaaba',
    'home': 'Fie',
    'hotels': 'Hotels',
    'restaurants': 'Restaurants',
    'bookings': 'Nsiesiei',
    'orders': 'Nsiesiei',
    'profile': 'Profael',
    'settings': 'Nsiesiei',
    'notifications': 'Nsiesiei',
    'language': 'Kasa',
    'currency': 'Sika',
    
    'hotel': 'Hotel',
    'room': 'Room',
    'booking': 'Nsiesiei',
    'check_in': 'Bra mu',
    'check_out': 'Twam',
    'guests': 'Ɔmanfoɔ',
    'total_price': 'Tɛkɛɛ a wɔbɛtɔ',
    
    'restaurant': 'Restaurant',
    'menu': 'Menu',
    'order': 'Nsiesiei',
    'delivery': 'Nsiesiei',
    'estimated_delivery': 'Nsiesiei a wɔbɛtɔ',
    
    'search': 'Hwehwɛ',
    'filter': 'Hwehwɛ',
    'book_now': 'Buei seisei ara',
    'order_now': 'Order Now',
    'pay_now': 'Pay Now',
    'cancel': 'Twam',
    'save': 'Kora',
    'confirm': 'Gye to mu',
    
    'pending': 'Nsiesiei',
    'confirmed': 'Gye to mu',
    'completed': 'Awie',
    'cancelled': 'Atwa mu',
    
    'loading': 'Ɛrehunu...',
    'no_data': 'Enni data biara',
    'error_occurred': 'Enyi ahyɛn bi',
    'try_again': 'Yɛsrɛ wo bɔ mbɔ bio',
  },
  
  ee: {
    // Ewe translations
    'welcome': 'Woe akwaaba',
    'home': 'Fie',
    'hotels': 'Hotels',
    'restaurants': 'Restaurants',
    'bookings': 'Nsiesiei',
    'orders': 'Nsiesiei',
    'profile': 'Profael',
    'settings': 'Nsiesiei',
    'notifications': 'Nsiesiei',
    'language': 'Kasa',
    'currency': 'Sika',
    
    'hotel': 'Hotel',
    'room': 'Room',
    'booking': 'Nsiesiei',
    'check_in': 'Bra mu',
    'check_out': 'Twam',
    'guests': 'Ɔmanfoɔ',
    'total_price': 'Tɛkɛɛ a wɔbɛtɔ',
    
    'restaurant': 'Restaurant',
    'menu': 'Menu',
    'order': 'Nsiesiei',
    'delivery': 'Nsiesiei',
    'estimated_delivery': 'Nsiesiei a wɔbɛtɔ',
    
    'search': 'Hwehwɛ',
    'filter': 'Hwehwɛ',
    'book_now': 'Buei seisei ara',
    'order_now': 'Order Now',
    'pay_now': 'Pay Now',
    'cancel': 'Twam',
    'save': 'Kora',
    'confirm': 'Gye to mu',
    
    'pending': 'Nsiesiei',
    'confirmed': 'Gye to mu',
    'completed': 'Awie',
    'cancelled': 'Atwa mu',
    
    'loading': 'Ɛrehunu...',
    'no_data': 'Enni data biara',
    'error_occurred': 'Enyi ahyɛn bi',
    'try_again': 'Yɛsrɛ wo bɔ mbɔ bio',
  }
};

export const useLocalization = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [translationsDict, setTranslationsDict] = useState<TranslationDict>(translations.en);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const settings = await storageService.getAppSettings();
      const language = (settings.language || 'en') as LanguageCode;
      setCurrentLanguage(language);
      setTranslationsDict(translations[language] || translations.en);
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      const settings = await storageService.getAppSettings();
      settings.language = languageCode;
      await storageService.saveAppSettings(settings);
      const langCode = languageCode as LanguageCode;
      setCurrentLanguage(langCode);
      setTranslationsDict(translations[langCode] || translations.en);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const t = (key: string): string => {
    return translationsDict[key] || key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
    languages: Object.keys(translations) as LanguageCode[],
  };
};