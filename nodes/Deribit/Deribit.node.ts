/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

import { emitLicenseWarning } from './utils';

// Import operations and fields
import { authenticationOperations, authenticationFields, executeAuthentication } from './actions/authentication';
import { accountOperations, accountFields, executeAccount } from './actions/account';
import { tradingOperations, tradingFields, executeTrading } from './actions/trading';
import { marketDataOperations, marketDataFields, executeMarketData } from './actions/marketData';
import { optionsOperations, optionsFields, executeOptions } from './actions/options';
import { portfolioOperations, portfolioFields, executePortfolio } from './actions/portfolio';
import { walletOperations, walletFields, executeWallet } from './actions/wallet';
import { blockTradeOperations, blockTradeFields, executeBlockTrade } from './actions/blockTrade';
import { comboOperations, comboFields, executeCombo } from './actions/combo';
import { publicOperations, publicFields, executePublic } from './actions/public';

export class Deribit implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Deribit',
    name: 'deribit',
    icon: 'file:deribit.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Deribit cryptocurrency derivatives exchange API',
    defaults: {
      name: 'Deribit',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'deribitApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
            description: 'Manage account information and positions',
          },
          {
            name: 'Authentication',
            value: 'authentication',
            description: 'Manage authentication tokens',
          },
          {
            name: 'Block Trade',
            value: 'blockTrade',
            description: 'Execute and manage block trades',
          },
          {
            name: 'Combo',
            value: 'combo',
            description: 'Work with combo instruments',
          },
          {
            name: 'Instruments',
            value: 'instruments',
            description: 'Get instrument information',
          },
          {
            name: 'Market Data',
            value: 'marketData',
            description: 'Access market data and pricing',
          },
          {
            name: 'Options',
            value: 'options',
            description: 'Options-specific data',
          },
          {
            name: 'Orders',
            value: 'orders',
            description: 'Place and manage orders',
          },
          {
            name: 'Portfolio',
            value: 'portfolio',
            description: 'Portfolio margin and simulation',
          },
          {
            name: 'Positions',
            value: 'positions',
            description: 'Get position information',
          },
          {
            name: 'Public',
            value: 'public',
            description: 'Public API endpoints',
          },
          {
            name: 'Trading',
            value: 'trading',
            description: 'Place and manage orders',
          },
          {
            name: 'Wallet',
            value: 'wallet',
            description: 'Manage deposits and withdrawals',
          },
        ],
        default: 'trading',
      },
      // Authentication
      ...authenticationOperations,
      ...authenticationFields,
      // Account
      ...accountOperations,
      ...accountFields,
      // Trading
      ...tradingOperations,
      ...tradingFields,
      // Market Data
      ...marketDataOperations,
      ...marketDataFields,
      // Options
      ...optionsOperations,
      ...optionsFields,
      // Portfolio
      ...portfolioOperations,
      ...portfolioFields,
      // Wallet
      ...walletOperations,
      ...walletFields,
      // Block Trade
      ...blockTradeOperations,
      ...blockTradeFields,
      // Combo
      ...comboOperations,
      ...comboFields,
      // Public
      ...publicOperations,
      ...publicFields,
      // New generated fields for instruments, orders, and positions
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['instruments'] } },
        options: [
          { name: 'Get Instruments', value: 'getInstruments', description: 'Get available instruments', action: 'Get instruments' },
          { name: 'Get Instrument', value: 'getInstrument', description: 'Get instrument details', action: 'Get instrument details' },
          { name: 'Get Currencies', value: 'getCurrencies', description: 'Get supported currencies', action: 'Get supported currencies' },
          { name: 'Get Order Book', value: 'getOrderBook', description: 'Get order book for instrument', action: 'Get order book' },
          { name: 'Get Last Trades by Instrument', value: 'getLastTradesByInstrument', description: 'Get recent trades for instrument', action: 'Get last trades by instrument' },
          { name: 'Get Ticker', value: 'getTicker', description: 'Get ticker information', action: 'Get ticker information' },
          { name: 'Get TradingView Chart Data', value: 'getTradingViewChartData', description: 'Get chart data for TradingView', action: 'Get TradingView chart data' },
        ],
        default: 'getInstruments',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['orders'] } },
        options: [
          { name: 'Create Buy Order', value: 'createBuyOrder', description: 'Place a buy order', action: 'Create buy order' },
          { name: 'Create Sell Order', value: 'createSellOrder', description: 'Place a sell order', action: 'Create sell order' },
          { name: 'Edit Order', value: 'editOrder', description: 'Modify an existing order', action: 'Edit order' },
          { name: 'Cancel Order', value: 'cancelOrder', description: 'Cancel a specific order', action: 'Cancel order' },
          { name: 'Cancel All Orders', value: 'cancelAllOrders', description: 'Cancel all open orders', action: 'Cancel all orders' },
          { name: 'Cancel All by Currency', value: 'cancelAllByCurrency', description: 'Cancel all orders for a specific currency', action: 'Cancel all by currency' },
          { name: 'Cancel All by Instrument', value: 'cancelAllByInstrument', description: 'Cancel all orders for a specific instrument', action: 'Cancel all by instrument' },
          { name: 'Get Open Orders', value: 'getOpenOrders', description: 'Get all open orders', action: 'Get open orders' },
          { name: 'Get Open Orders by Currency', value: 'getOpenOrdersByCurrency', description: 'Get open orders for a specific currency', action: 'Get open orders by currency' },
          { name: 'Get Open Orders by Instrument', value: 'getOpenOrdersByInstrument', description: 'Get open orders for a specific instrument', action: 'Get open orders by instrument' },
          { name: 'Get Order History by Currency', value: 'getOrderHistoryByCurrency', description: 'Get order history for a specific currency', action: 'Get order history by currency' },
          { name: 'Get Order History by Instrument', value: 'getOrderHistoryByInstrument', description: 'Get order history for a specific instrument', action: 'Get order history by instrument' },
        ],
        default: 'createBuyOrder',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['positions'] } },
        options: [
          { name: 'Get Positions', value: 'getPositions', description: 'Get all positions', action: 'Get positions' },
          { name: 'Get Position', value: 'getPosition', description: 'Get position for instrument', action: 'Get position' },
          { name: 'Get User Trades By Currency', value: 'getUserTradesByCurrency', description: 'Get user trades by currency', action: 'Get user trades by currency' },
          { name: 'Get User Trades By Currency And Time', value: 'getUserTradesByCurrencyAndTime', description: 'Get user trades by currency and time', action: 'Get user trades by currency and time' },
          { name: 'Get User Trades By Instrument', value: 'getUserTradesByInstrument', description: 'Get user trades by instrument', action: 'Get user trades by instrument' },
          { name: 'Get User Trades By Instrument And Time', value: 'getUserTradesByInstrumentAndTime', description: 'Get user trades by instrument and time', action: 'Get user trades by instrument and time' },
        ],
        default: 'getPositions',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    emitLicenseWarning();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        let results: INodeExecutionData[] = [];

        switch (resource) {
          case 'authentication':
            results = await executeAuthentication.call(this, i);
            break;
          case 'account':
            results = await executeAccount.call(this, i);
            break;
          case 'trading':
            results = await executeTrading.call(this, i);
            break;
          case 'marketData':
            results = await executeMarketData.call(this, i);
            break;
          case 'options':
            results = await executeOptions.call(this, i);
            break;
          case 'portfolio':
            results = await executePortfolio.call(this, i);
            break;
          case 'wallet':
            results = await executeWallet.call(this, i);
            break;
          case 'blockTrade':
            results = await executeBlockTrade.call(this, i);
            break;
          case 'combo':
            results = await executeCombo.call(this, i);
            break;
          case 'public':
            results = await executePublic.call(this, i);
            break;
          case 'instruments':
            results = await executeInstrumentsOperations.call(this, [items[i]]);
            break;
          case 'orders':
            results = await executeOrdersOperations.call(this, [items[i]]);
            break;
          case 'positions':
            results = await executePositionsOperations.call(this, [items[i]]);
            break;
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }

        returnData.push(...results);
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// ============================================================
// New Resource Handler Functions
// ============================================================

async function executeInstrumentsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('deribitApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.environment === 'production' ? 'https://www.deribit.com/api/v2' : 'https://test.deribit.com/api/v2';

      switch (operation) {
        case 'getInstruments': {
          const currency = this.getNodeParameter('currency', i) as string;
          const kind = this.getNodeParameter('kind', i) as string;
          const expired = this.getNodeParameter('expired', i) as boolean;

          const params = new URLSearchParams({
            currency,
            ...(kind && { kind }),
            expired: expired.toString(),
          });

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/public/get_instruments?${params.toString()}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getInstrument': {
          const instrumentName = this.getNodeParameter('instrumentName', i) as string;

          const params = new URLSearchParams({
            instrument_name: instrumentName,
          });

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/public/get_instrument?${params.toString()}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCurrencies': {
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/public/get_currencies`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getOrderBook': {
          const instrumentName = this.getNodeParameter('instrumentName', i) as string;
          const depth = this.getNodeParameter('depth', i) as number;

          const params = new URLSearchParams({
            instrument_name: instrumentName,
            ...(depth && { depth: depth.toString() }),
          });

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/public/get_order_book?${params.toString()}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLastTradesByInstrument': {
          const instrumentName = this.getNodeParameter('instrumentName', i) as string;
          const count = this.getNodeParameter('count', i) as number;
          const startSeq = this.getNodeParameter('startSeq', i) as number;
          const endSeq = this.getNodeParameter('endSeq', i) as number;
          const includeOld = this.getNodeParameter('includeOld', i) as boolean;

          const params = new URLSearchParams({
            instrument_name: instrumentName,
            ...(count && { count: count.toString() }),
            ...(startSeq && { start_seq: startSeq.toString() }),
            ...(endSeq && { end_seq: endSeq.toString() }),
            include_old: includeOld.toString(),
          });

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/public/get_last_trades_by_instrument?${params.toString()}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTicker': {
          const instrumentName = this.getNodeParameter('instrumentName', i) as string;

          const params = new URLSearchParams({
            instrument_name: instrumentName,
          });

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/public/ticker?${params.toString()}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTradingViewChartData': {
          const instrumentName = this.getNodeParameter('instrumentName', i) as string;
          const startTimestamp = this.getNodeParameter('startTimestamp', i) as number;
          const endTimestamp = this.getNodeParameter('endTimestamp', i) as number;
          const resolution = this.getNodeParameter('resolution', i) as string;

          const params = new URLSearchParams({
            instrument_name: instrumentName,
            start_timestamp: startTimestamp.toString(),
            end_timestamp: endTimestamp.toString(),
            resolution,
          });

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/public/get_tradingview_chart_data?${params.toString()}`,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeOrdersOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('deribitApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const timestamp = Date.now();
      const baseUrl = credentials.environment === 'production' ? 'https://www.deribit.com/api/v2' : 'https://test.deribit.com/api/v2';

      switch (operation) {
        case 'createBuyOrder': {
          const instrumentName = this.getNodeParameter('instrumentName', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;
          const orderType = this.getNodeParameter('orderType', i) as string;
          const price = this.getNodeParameter('price', i) as number;
          const timeInForce = this.getNodeParameter('timeInForce', i) as string;
          const maxShow = this.getNodeParameter('maxShow', i) as number;
          const postOnly = this.getNodeParameter('postOnly', i) as boolean;
          const reduceOnly = this.getNodeParameter('reduceOnly', i) as boolean;
          const label = this.getNodeParameter('label', i) as string;

          const params: any = {
            instrument_name: instrumentName,
            amount,
            type: orderType,
            timestamp,
          };

          if (orderType === 'limit') params.price = price;
          if (timeInForce) params.time_in_force = timeInForce;
          if (maxShow > 0) params.max_show = maxShow;
          if (postOnly) params.post_only = postOnly;
          if (reduceOnly) params.reduce_only = reduceOnly;
          if (label) params.label = label;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/private/buy`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            body: { params },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executePositionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('deribitApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const timestamp = Date.now();
      const baseUrl = credentials.environment === 'production' ? 'https://www.deribit.com/api/v2' : 'https://test.deribit.com/api/v2';
      
      switch (operation) {
        case 'getPositions': {
          const currency = this.getNodeParameter('currency', i) as string;
          const kind = this.getNodeParameter('kind', i) as string;
          
          const params: any = { currency };
          if (kind) params.kind = kind;
          
          const queryString = new URLSearchParams(params).toString();
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/private/get_positions?${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getPosition': {
          const instrumentName = this.getNodeParameter('instrumentName', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/private/get_position?instrument_name=${instrumentName}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }
  
  return returnData;
}