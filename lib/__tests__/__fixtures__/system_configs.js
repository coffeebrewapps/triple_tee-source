const currenciesData = {
  1: {
    id: '1',
    code: 'SGD',
    symbol: '$',
    exchangeRate: 1,
  },
  2: {
    id: '2',
    code: 'USD',
    symbol: '$',
    exchangeRate: 0.75,
  },
};

const contactsData = {
  1: {
    id: '1',
    name: 'Coffee Brew Apps',
    country: 'SGP',
    logo: null,
  },
  2: {
    id: '2',
    name: 'Company ABC',
    country: 'SGP',
    logo: null,
  },
};

const systemConfigsData = {
  1: {
    id: '1',
    effectiveStart: '2023-01-01',
    effectiveEnd: '2023-01-31',
    tagFormat: '{{ category }}:{{ name }}',
    timezone: 'UTC',
    baseCurrencyId: '1',
    baseContactId: '1',
    includes: {
      baseCurrencyId: currenciesData['1'],
      baseContactId: contactsData['1'],
    },
  },
  2: {
    id: '2',
    effectiveStart: '2023-02-01',
    effectiveEnd: null,
    tagFormat: '{{ category }}:{{ name }}',
    timezone: 'Asia/Singapore',
    baseCurrencyId: '1',
    baseContactId: '1',
    includes: {
      baseCurrencyId: currenciesData['1'],
      baseContactId: contactsData['1'],
    },
  },
};

module.exports = {
  systemConfigsData,
};
