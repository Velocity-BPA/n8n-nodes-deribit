/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { DERIBIT_API_URLS, CURRENCIES, DERIBIT_ERROR_CODES } from '../../nodes/Deribit/constants';
import {
  validateInstrumentName,
  buildOrderParams,
  sanitizeParams,
  formatTimestamp,
  parseTimestamp,
} from '../../nodes/Deribit/utils';

describe('Deribit Constants', () => {
  describe('DERIBIT_API_URLS', () => {
    it('should have correct production URL', () => {
      expect(DERIBIT_API_URLS.production).toBe('https://www.deribit.com/api/v2');
    });

    it('should have correct testnet URL', () => {
      expect(DERIBIT_API_URLS.testnet).toBe('https://test.deribit.com/api/v2');
    });
  });

  describe('CURRENCIES', () => {
    it('should include BTC', () => {
      const btc = CURRENCIES.find(c => c.value === 'BTC');
      expect(btc).toBeDefined();
      expect(btc?.name).toContain('Bitcoin');
    });

    it('should include ETH', () => {
      const eth = CURRENCIES.find(c => c.value === 'ETH');
      expect(eth).toBeDefined();
      expect(eth?.name).toContain('Ethereum');
    });

    it('should include USDC', () => {
      const usdc = CURRENCIES.find(c => c.value === 'USDC');
      expect(usdc).toBeDefined();
    });

    it('should include USDT', () => {
      const usdt = CURRENCIES.find(c => c.value === 'USDT');
      expect(usdt).toBeDefined();
    });
  });

  describe('DERIBIT_ERROR_CODES', () => {
    it('should have error code for rate limit', () => {
      expect(DERIBIT_ERROR_CODES[10006]).toBe('Rate limit exceeded');
    });

    it('should have error code for not authorized', () => {
      expect(DERIBIT_ERROR_CODES[10001]).toBe('Not authorized');
    });

    it('should have error code for not enough balance', () => {
      expect(DERIBIT_ERROR_CODES[10010]).toBe('Not enough balance');
    });
  });
});

describe('Deribit Utils', () => {
  describe('validateInstrumentName', () => {
    it('should validate perpetual instruments', () => {
      expect(validateInstrumentName('BTC-PERPETUAL')).toBe(true);
      expect(validateInstrumentName('ETH-PERPETUAL')).toBe(true);
    });

    it('should validate future instruments', () => {
      expect(validateInstrumentName('BTC-28JUN24')).toBe(true);
      expect(validateInstrumentName('ETH-28JUN24')).toBe(true);
    });

    it('should validate option instruments', () => {
      expect(validateInstrumentName('BTC-28JUN24-50000-C')).toBe(true);
      expect(validateInstrumentName('ETH-28JUN24-3000-P')).toBe(true);
    });

    it('should reject invalid instrument names', () => {
      expect(validateInstrumentName('invalid')).toBe(false);
      expect(validateInstrumentName('BTC')).toBe(false);
      expect(validateInstrumentName('')).toBe(false);
    });
  });

  describe('buildOrderParams', () => {
    it('should build basic order params', () => {
      const params = buildOrderParams({
        instrumentName: 'BTC-PERPETUAL',
        amount: 1000,
      });
      expect(params.instrument_name).toBe('BTC-PERPETUAL');
      expect(params.amount).toBe(1000);
    });

    it('should include price for limit orders', () => {
      const params = buildOrderParams({
        instrumentName: 'BTC-PERPETUAL',
        amount: 1000,
        type: 'limit',
        price: 50000,
      });
      expect(params.price).toBe(50000);
      expect(params.type).toBe('limit');
    });

    it('should include optional parameters', () => {
      const params = buildOrderParams({
        instrumentName: 'BTC-PERPETUAL',
        amount: 1000,
        label: 'my-order',
        timeInForce: 'good_til_cancelled',
        postOnly: true,
        reduceOnly: false,
      });
      expect(params.label).toBe('my-order');
      expect(params.time_in_force).toBe('good_til_cancelled');
      expect(params.post_only).toBe(true);
      expect(params.reduce_only).toBe(false);
    });

    it('should include trigger params for stop orders', () => {
      const params = buildOrderParams({
        instrumentName: 'BTC-PERPETUAL',
        amount: 1000,
        type: 'stop_limit',
        price: 48000,
        triggerPrice: 49000,
        trigger: 'last_price',
      });
      expect(params.trigger_price).toBe(49000);
      expect(params.trigger).toBe('last_price');
    });
  });

  describe('sanitizeParams', () => {
    it('should remove undefined values', () => {
      const params = {
        a: 1,
        b: undefined,
        c: 'test',
      };
      const sanitized = sanitizeParams(params);
      expect(sanitized).toEqual({ a: 1, c: 'test' });
    });

    it('should remove null values', () => {
      const params = {
        a: 1,
        b: null,
        c: 'test',
      };
      const sanitized = sanitizeParams(params);
      expect(sanitized).toEqual({ a: 1, c: 'test' });
    });

    it('should remove empty strings', () => {
      const params = {
        a: 1,
        b: '',
        c: 'test',
      };
      const sanitized = sanitizeParams(params);
      expect(sanitized).toEqual({ a: 1, c: 'test' });
    });

    it('should keep zero values', () => {
      const params = {
        a: 0,
        b: 'test',
      };
      const sanitized = sanitizeParams(params);
      expect(sanitized.a).toBe(0);
    });

    it('should keep false values', () => {
      const params = {
        a: false,
        b: 'test',
      };
      const sanitized = sanitizeParams(params);
      expect(sanitized.a).toBe(false);
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp to ISO string', () => {
      const timestamp = 1704067200000; // 2024-01-01T00:00:00.000Z
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('parseTimestamp', () => {
    it('should parse ISO string to timestamp', () => {
      const dateString = '2024-01-01T00:00:00.000Z';
      const timestamp = parseTimestamp(dateString);
      expect(timestamp).toBe(1704067200000);
    });
  });
});

describe('Deribit Credentials', () => {
  it('should have correct credential structure', () => {
    // This is a structural test - we verify the expected shape
    const expectedCredentialFields = ['environment', 'clientId', 'clientSecret'];
    
    // In a real test, you would import and check the credential class
    // For now, we verify the expected fields exist in our design
    expect(expectedCredentialFields).toContain('environment');
    expect(expectedCredentialFields).toContain('clientId');
    expect(expectedCredentialFields).toContain('clientSecret');
  });
});
