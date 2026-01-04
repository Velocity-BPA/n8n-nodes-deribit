/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const DERIBIT_API_URLS = {
  production: 'https://www.deribit.com/api/v2',
  testnet: 'https://test.deribit.com/api/v2',
} as const;

export const CURRENCIES = [
  { name: 'Bitcoin (BTC)', value: 'BTC' },
  { name: 'Ethereum (ETH)', value: 'ETH' },
  { name: 'USD Coin (USDC)', value: 'USDC' },
  { name: 'Tether (USDT)', value: 'USDT' },
] as const;

export const INSTRUMENT_KINDS = [
  { name: 'Future', value: 'future' },
  { name: 'Option', value: 'option' },
  { name: 'Spot', value: 'spot' },
  { name: 'Future Combo', value: 'future_combo' },
  { name: 'Option Combo', value: 'option_combo' },
] as const;

export const ORDER_TYPES = [
  { name: 'Limit', value: 'limit' },
  { name: 'Market', value: 'market' },
  { name: 'Stop Limit', value: 'stop_limit' },
  { name: 'Stop Market', value: 'stop_market' },
] as const;

export const TIME_IN_FORCE = [
  { name: 'Good Till Cancelled', value: 'good_til_cancelled' },
  { name: 'Fill Or Kill', value: 'fill_or_kill' },
  { name: 'Immediate Or Cancel', value: 'immediate_or_cancel' },
] as const;

export const TRIGGER_TYPES = [
  { name: 'Index Price', value: 'index_price' },
  { name: 'Mark Price', value: 'mark_price' },
  { name: 'Last Price', value: 'last_price' },
] as const;

export const RESOLUTIONS = [
  { name: '1 Minute', value: '1' },
  { name: '3 Minutes', value: '3' },
  { name: '5 Minutes', value: '5' },
  { name: '10 Minutes', value: '10' },
  { name: '15 Minutes', value: '15' },
  { name: '30 Minutes', value: '30' },
  { name: '1 Hour', value: '60' },
  { name: '2 Hours', value: '120' },
  { name: '3 Hours', value: '180' },
  { name: '6 Hours', value: '360' },
  { name: '12 Hours', value: '720' },
  { name: '1 Day', value: '1D' },
] as const;

export const SORT_ORDERS = [
  { name: 'Ascending', value: 'asc' },
  { name: 'Descending', value: 'desc' },
] as const;

export const DERIBIT_ERROR_CODES: Record<number, string> = {
  9999: 'Not implemented',
  10000: 'Bad request',
  10001: 'Not authorized',
  10002: 'Method not found',
  10003: 'Unauthorized',
  10004: 'Forbidden',
  10005: 'Not found',
  10006: 'Rate limit exceeded',
  10007: 'Invalid parameter',
  10008: 'Price too high',
  10009: 'Price too low',
  10010: 'Not enough balance',
  10011: 'Not available in testnet',
  10012: 'Order already exists',
  10013: 'Order not found',
  10014: 'Position not found',
  10015: 'Invalid timestamp',
  10016: 'Invalid signature',
  10017: 'Invalid nonce',
  10018: 'Invalid scope',
  10019: 'Access denied',
  10020: 'Matching engine unavailable',
  10021: 'Leverage exceeded',
  10022: 'Amount too small',
  10023: 'Amount too large',
  11044: 'Order price exceeds limits',
  11050: 'Invalid order state transition',
  11054: 'Order would be immediately filled and cancelled',
  13004: 'Withdrawal blocked',
  13005: 'Withdrawal address invalid',
} as const;
