export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    name: 'United States Dollar',
    symbol: '$',
    flag: '🇺🇸',
    decimalPlaces: 2
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    decimalPlaces: 2
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    flag: '🇬🇧',
    decimalPlaces: 2
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    decimalPlaces: 0
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan Renminbi',
    symbol: '¥',
    flag: '🇨🇳',
    decimalPlaces: 2
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    decimalPlaces: 2
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    decimalPlaces: 2
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    decimalPlaces: 2
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    flag: '🇧🇷',
    decimalPlaces: 2
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    flag: '🇿🇦',
    decimalPlaces: 2
  },
  KRW: {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    flag: '🇰🇷',
    decimalPlaces: 0
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: 'Mex$',
    flag: '🇲🇽',
    decimalPlaces: 2
  },
  RUB: {
    code: 'RUB',
    name: 'Russian Ruble',
    symbol: '₽',
    flag: '🇷🇺',
    decimalPlaces: 2
  },
  IDR: {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    flag: '🇮🇩',
    decimalPlaces: 0
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    symbol: '₺',
    flag: '🇹🇷',
    decimalPlaces: 2
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    decimalPlaces: 2
  },
  SEK: {
    code: 'SEK',
    name: 'Swedish Krona',
    symbol: 'kr',
    flag: '🇸🇪',
    decimalPlaces: 2
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    decimalPlaces: 2
  },
  HKD: {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    flag: '🇭🇰',
    decimalPlaces: 2
  },
  BDT: {
    code: 'BDT',
    name: 'Bangladeshi Taka',
    symbol: '৳',
    flag: '🇧🇩',
    decimalPlaces: 2
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'Fr',
    flag: '🇨🇭',
    decimalPlaces: 2
  },
  THB: {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    flag: '🇹🇭',
    decimalPlaces: 2
  }
};

// Helper function to format currency amount
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) {
    return amount.toString();
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  });

  return formatter.format(amount);
}

// Helper function to get currency display string with flag
export function getCurrencyDisplay(currencyCode: string): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) {
    return currencyCode;
  }
  return `${currency.flag} ${currency.code}`;
}

// Helper function to get currency symbol
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) {
    return currencyCode;
  }
  return currency.symbol;
}

// Get all currency codes
export const CURRENCY_CODES = Object.keys(CURRENCIES);

// Get all currencies as an array
export const CURRENCIES_ARRAY = Object.values(CURRENCIES); 