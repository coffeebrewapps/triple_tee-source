import { setActivePinia, createPinia } from 'pinia';
import { useFormatter } from '../../src/utils/formatter.js';

let formatter;
const timezone = 'Asia/Singapore';

beforeEach(() => {
  setActivePinia(createPinia());

  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    resolvedOptions: () => ({
      locale: 'en-SG',
    }),
  }));

  formatter = useFormatter();
});

describe('useFormatter', () => {
  test('should return functions', () => {
    expect(formatter).toEqual(expect.objectContaining({
      formatDate: expect.anything(),
      formatLongDate: expect.anything(),
      formatTimestamp: expect.anything(),
      formatShortTime: expect.anything(),
      formatNumber: expect.anything(),
      parseTagFormat: expect.anything(),
      parseTagFormatSync: expect.anything(),
      formatTag: expect.anything(),
      formatTagSync: expect.anything(),
      tagStyle: expect.anything(),
    }));
  });
});

describe('formatDate', () => {
  test('when given date should format date', () => {
    const result = formatter.formatDate('2023-04-03T12:34:56.123Z', timezone);
    expect(result).toEqual('03/04/2023');
  });

  test('when not given date should return null', () => {
    const result = formatter.formatDate(null, timezone);
    expect(result).toBeNull();
  });
});

describe('formatLongDate', () => {
  test('when given date should format date', () => {
    const result = formatter.formatLongDate('2023-04-03T12:34:56.123Z', timezone);
    expect(result).toEqual('Monday, 3 April 2023');
  });

  test('when not given date should return null', () => {
    const result = formatter.formatLongDate(null, timezone);
    expect(result).toBeNull();
  });
});

describe('formatTimestamp', () => {
  test('when given date should format date', () => {
    const result = formatter.formatTimestamp('2023-04-03T12:34:56.123Z', timezone);
    expect(result).toEqual('03/04/2023, 8:34:56 pm');
  });

  test('when not given date should return null', () => {
    const result = formatter.formatTimestamp(null, timezone);
    expect(result).toBeNull();
  });
});

describe('formatShortTime', () => {
  test('when given date should format date', () => {
    const result = formatter.formatShortTime('2023-04-03T12:34:56.123Z', timezone);
    expect(result).toEqual('8:34:56 pm');
  });

  test('when not given date should return null', () => {
    const result = formatter.formatShortTime(null, timezone);
    expect(result).toBeNull();
  });
});

describe('formatNumber', () => {
  test('when given number should format number', () => {
    const result = formatter.formatNumber(124.21462, 2);
    expect(result).toEqual('124.21');
  });

  test('when not given number should return 0', () => {
    const result = formatter.formatNumber(null, 2);
    expect(result).toEqual('0.00');
  });
});

describe('parseTagFormat', () => {
  test('when given format string should format tag', async() => {
    const result = await formatter.parseTagFormat('{{ category }}:{{ name }}', { category: 'company', name: 'abc' });
    expect(result).toEqual('company:abc');
  });

  test('when not given format string should return tag as-is', async() => {
    const result = await formatter.parseTagFormat(null, { category: 'company', name: 'abc' });
    expect(result).toEqual({ category: 'company', name: 'abc' });
  });
});

describe('parseTagFormatSync', () => {
  test('when given format string should format tag', () => {
    const result = formatter.parseTagFormatSync('{{ category }}:{{ name }}', { category: 'company', name: 'abc' });
    expect(result).toEqual('company:abc');
  });

  test('when not given format string should return tag as-is', () => {
    const result = formatter.parseTagFormatSync(null, { category: 'company', name: 'abc' });
    expect(result).toEqual({ category: 'company', name: 'abc' });
  });
});

describe('formatTag', () => {
  test('when given includes should format tag', async() => {
    const result = await formatter.formatTag(
      { includes: { tags: { 1: { category: 'company', name: 'abc' } } } },
      '1',
      'tags',
      '{{ category }}:{{ name }}'
    );
    expect(result).toEqual('company:abc');
  });

  test('when not given includes should return tag as-is', async() => {
    const result = await formatter.formatTag(
      { includes: {} },
      '1',
      'tags',
      '{{ category }}:{{ name }}'
    );
    expect(result).toEqual('1');
  });
});

describe('formatTagSync', () => {
  test('when given includes should format tag', () => {
    const result = formatter.formatTagSync(
      { includes: { tags: { 1: { category: 'company', name: 'abc' } } } },
      '1',
      'tags',
      '{{ category }}:{{ name }}'
    );
    expect(result).toEqual('company:abc');
  });

  test('when not given includes should return tag as-is', () => {
    const result = formatter.formatTagSync(
      { includes: {} },
      '1',
      'tags',
      '{{ category }}:{{ name }}'
    );
    expect(result).toEqual('1');
  });
});

describe('tagStyle', () => {
  test('when given includes should return tag style', () => {
    const result = formatter.tagStyle(
      { includes: { tags: { 1: { textColor: '#fff', backgroundColor: '#000' } } } },
      '1',
      'tags'
    );
    expect(result).toEqual('color: #fff !important;background-color: #000 !important;');
  });

  test('when not given includes should return empty string', () => {
    const result = formatter.tagStyle(
      { includes: {} },
      '1',
      'tags'
    );
    expect(result).toEqual('');
  });
});
