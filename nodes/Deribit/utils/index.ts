/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodePropertyOptions, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { deribitApiRequest } from '../transport';

export interface IInstrument {
  instrument_name: string;
  kind: string;
  base_currency: string;
  quote_currency: string;
  is_active: boolean;
  settlement_period: string;
  expiration_timestamp: number;
  strike?: number;
  option_type?: string;
}

export interface ICurrency {
  currency: string;
  currency_long: string;
}

export async function getInstruments(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  currency: string,
  kind?: string,
): Promise<INodePropertyOptions[]> {
  const params: Record<string, unknown> = { currency };
  if (kind) {
    params.kind = kind;
  }

  const instruments = await deribitApiRequest.call(
    this,
    'public/get_instruments',
    params,
    true,
  ) as IInstrument[];

  return instruments
    .filter((inst) => inst.is_active)
    .map((inst) => ({
      name: inst.instrument_name,
      value: inst.instrument_name,
      description: `${inst.kind} - ${inst.base_currency}/${inst.quote_currency}`,
    }));
}

export async function getCurrencies(
  this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const currencies = await deribitApiRequest.call(
    this,
    'public/get_currencies',
    {},
    true,
  ) as ICurrency[];

  return currencies.map((curr) => ({
    name: `${curr.currency_long} (${curr.currency})`,
    value: curr.currency,
  }));
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

export function parseTimestamp(dateString: string): number {
  return new Date(dateString).getTime();
}

export function validateInstrumentName(instrumentName: string): boolean {
  // Deribit instrument naming conventions:
  // Perpetual: BTC-PERPETUAL, ETH-PERPETUAL
  // Futures: BTC-28JUN24, ETH-28JUN24
  // Options: BTC-28JUN24-50000-C, ETH-28JUN24-3000-P
  const patterns = [
    /^[A-Z]+-PERPETUAL$/,
    /^[A-Z]+-\d{1,2}[A-Z]{3}\d{2}$/,
    /^[A-Z]+-\d{1,2}[A-Z]{3}\d{2}-\d+(-[CP])?$/,
  ];

  return patterns.some((pattern) => pattern.test(instrumentName));
}

export function buildOrderParams(params: {
  instrumentName: string;
  amount: number;
  type?: string;
  price?: number;
  label?: string;
  timeInForce?: string;
  postOnly?: boolean;
  reduceOnly?: boolean;
  triggerPrice?: number;
  trigger?: string;
}): Record<string, unknown> {
  const orderParams: Record<string, unknown> = {
    instrument_name: params.instrumentName,
    amount: params.amount,
  };

  if (params.type) {
    orderParams.type = params.type;
  }

  if (params.price !== undefined && params.type !== 'market') {
    orderParams.price = params.price;
  }

  if (params.label) {
    orderParams.label = params.label;
  }

  if (params.timeInForce) {
    orderParams.time_in_force = params.timeInForce;
  }

  if (params.postOnly !== undefined) {
    orderParams.post_only = params.postOnly;
  }

  if (params.reduceOnly !== undefined) {
    orderParams.reduce_only = params.reduceOnly;
  }

  if (params.triggerPrice !== undefined && (params.type === 'stop_limit' || params.type === 'stop_market')) {
    orderParams.trigger_price = params.triggerPrice;
  }

  if (params.trigger) {
    orderParams.trigger = params.trigger;
  }

  return orderParams;
}

export function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function emitLicenseWarning(): void {
  const globalObj = globalThis as any;
  const hasEmitted = globalObj.__deribitLicenseWarningEmitted;
  if (!hasEmitted) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    globalObj.__deribitLicenseWarningEmitted = true;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
