/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';
import { CURRENCIES, ORDER_TYPES, TIME_IN_FORCE, TRIGGER_TYPES } from '../../constants';
import { buildOrderParams, sanitizeParams } from '../../utils';

export const tradingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['trading'],
      },
    },
    options: [
      {
        name: 'Buy',
        value: 'buy',
        description: 'Place a buy order',
        action: 'Place buy order',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel an order by ID',
        action: 'Cancel order',
      },
      {
        name: 'Cancel All',
        value: 'cancelAll',
        description: 'Cancel all open orders',
        action: 'Cancel all orders',
      },
      {
        name: 'Cancel All By Currency',
        value: 'cancelAllByCurrency',
        description: 'Cancel all orders for a currency',
        action: 'Cancel all orders by currency',
      },
      {
        name: 'Cancel All By Instrument',
        value: 'cancelAllByInstrument',
        description: 'Cancel all orders for an instrument',
        action: 'Cancel all orders by instrument',
      },
      {
        name: 'Cancel By Label',
        value: 'cancelByLabel',
        description: 'Cancel orders by label',
        action: 'Cancel orders by label',
      },
      {
        name: 'Close Position',
        value: 'closePosition',
        description: 'Close position for an instrument',
        action: 'Close position',
      },
      {
        name: 'Edit',
        value: 'edit',
        description: 'Modify an existing order',
        action: 'Edit order',
      },
      {
        name: 'Get Margins',
        value: 'getMargins',
        description: 'Calculate margin for an order',
        action: 'Get margins',
      },
      {
        name: 'Get Open Orders',
        value: 'getOpenOrders',
        description: 'Get all open orders',
        action: 'Get open orders',
      },
      {
        name: 'Get Open Orders By Currency',
        value: 'getOpenOrdersByCurrency',
        description: 'Get open orders by currency',
        action: 'Get open orders by currency',
      },
      {
        name: 'Get Open Orders By Instrument',
        value: 'getOpenOrdersByInstrument',
        description: 'Get open orders by instrument',
        action: 'Get open orders by instrument',
      },
      {
        name: 'Get Order History',
        value: 'getOrderHistory',
        description: 'Get order history',
        action: 'Get order history',
      },
      {
        name: 'Get Order State',
        value: 'getOrderState',
        description: 'Get order status',
        action: 'Get order state',
      },
      {
        name: 'Get User Trades By Currency',
        value: 'getUserTradesByCurrency',
        description: 'Get trades by currency',
        action: 'Get user trades by currency',
      },
      {
        name: 'Get User Trades By Instrument',
        value: 'getUserTradesByInstrument',
        description: 'Get trades by instrument',
        action: 'Get user trades by instrument',
      },
      {
        name: 'Get User Trades By Order',
        value: 'getUserTradesByOrder',
        description: 'Get trades by order',
        action: 'Get user trades by order',
      },
      {
        name: 'Sell',
        value: 'sell',
        description: 'Place a sell order',
        action: 'Place sell order',
      },
    ],
    default: 'buy',
  },
];

export const tradingFields: INodeProperties[] = [
  // Instrument name for buy/sell/edit
  {
    displayName: 'Instrument Name',
    name: 'instrumentName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: [
          'buy',
          'sell',
          'closePosition',
          'getMargins',
          'getOpenOrdersByInstrument',
          'getUserTradesByInstrument',
          'cancelAllByInstrument',
        ],
      },
    },
    description: 'The instrument name (e.g., BTC-PERPETUAL)',
    placeholder: 'BTC-PERPETUAL',
  },
  // Amount for buy/sell
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['buy', 'sell', 'getMargins'],
      },
    },
    description: 'Amount in contracts',
  },
  // Order type
  {
    displayName: 'Order Type',
    name: 'orderType',
    type: 'options',
    options: [...ORDER_TYPES],
    default: 'limit',
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['buy', 'sell', 'closePosition'],
      },
    },
    description: 'The type of order',
  },
  // Price for limit orders
  {
    displayName: 'Price',
    name: 'price',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['buy', 'sell', 'edit', 'getMargins'],
        orderType: ['limit', 'stop_limit'],
      },
    },
    description: 'Limit price for the order',
  },
  // Order ID for edit/cancel/get state
  {
    displayName: 'Order ID',
    name: 'orderId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['cancel', 'edit', 'getOrderState', 'getUserTradesByOrder'],
      },
    },
    description: 'The order ID',
  },
  // New amount for edit
  {
    displayName: 'New Amount',
    name: 'newAmount',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['edit'],
      },
    },
    description: 'New amount for the order',
  },
  // New price for edit
  {
    displayName: 'New Price',
    name: 'newPrice',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['edit'],
      },
    },
    description: 'New price for the order',
  },
  // Currency for currency-based operations
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: [
          'cancelAllByCurrency',
          'getOpenOrdersByCurrency',
          'getOrderHistory',
          'getUserTradesByCurrency',
        ],
      },
    },
    description: 'The currency',
  },
  // Label for cancel by label
  {
    displayName: 'Label',
    name: 'label',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['cancelByLabel'],
      },
    },
    description: 'The label to cancel orders for',
  },
  // Order options
  {
    displayName: 'Order Options',
    name: 'orderOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: ['buy', 'sell'],
      },
    },
    options: [
      {
        displayName: 'Label',
        name: 'label',
        type: 'string',
        default: '',
        description: 'Custom label for the order',
      },
      {
        displayName: 'Time in Force',
        name: 'timeInForce',
        type: 'options',
        options: [...TIME_IN_FORCE],
        default: 'good_til_cancelled',
        description: 'Time in force for the order',
      },
      {
        displayName: 'Post Only',
        name: 'postOnly',
        type: 'boolean',
        default: false,
        description: 'Whether the order should only be a maker order',
      },
      {
        displayName: 'Reduce Only',
        name: 'reduceOnly',
        type: 'boolean',
        default: false,
        description: 'Whether the order should only reduce a position',
      },
      {
        displayName: 'Trigger Price',
        name: 'triggerPrice',
        type: 'number',
        default: 0,
        description: 'Trigger price for stop orders',
      },
      {
        displayName: 'Trigger',
        name: 'trigger',
        type: 'options',
        options: [...TRIGGER_TYPES],
        default: 'last_price',
        description: 'Price type for trigger',
      },
    ],
  },
  // Additional options for queries
  {
    displayName: 'Query Options',
    name: 'queryOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['trading'],
        operation: [
          'getOrderHistory',
          'getUserTradesByCurrency',
          'getUserTradesByInstrument',
        ],
      },
    },
    options: [
      {
        displayName: 'Start Timestamp',
        name: 'startTimestamp',
        type: 'dateTime',
        default: '',
        description: 'Start time for the query',
      },
      {
        displayName: 'End Timestamp',
        name: 'endTimestamp',
        type: 'dateTime',
        default: '',
        description: 'End time for the query',
      },
      {
        displayName: 'Count',
        name: 'count',
        type: 'number',
        default: 100,
        description: 'Number of results to retrieve',
      },
      {
        displayName: 'Include Old',
        name: 'includeOld',
        type: 'boolean',
        default: false,
        description: 'Whether to include older trades',
      },
      {
        displayName: 'Sorting',
        name: 'sorting',
        type: 'options',
        options: [
          { name: 'Ascending', value: 'asc' },
          { name: 'Descending', value: 'desc' },
        ],
        default: 'desc',
        description: 'Sort order',
      },
    ],
  },
];

export async function executeTrading(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  let result: unknown;

  switch (operation) {
    case 'buy':
    case 'sell': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const orderType = this.getNodeParameter('orderType', index) as string;
      const orderOptions = this.getNodeParameter('orderOptions', index, {}) as IDataObject;
      
      let price: number | undefined;
      if (orderType === 'limit' || orderType === 'stop_limit') {
        price = this.getNodeParameter('price', index, 0) as number;
      }

      const params = buildOrderParams({
        instrumentName,
        amount,
        type: orderType,
        price,
        label: orderOptions.label as string | undefined,
        timeInForce: orderOptions.timeInForce as string | undefined,
        postOnly: orderOptions.postOnly as boolean | undefined,
        reduceOnly: orderOptions.reduceOnly as boolean | undefined,
        triggerPrice: orderOptions.triggerPrice as number | undefined,
        trigger: orderOptions.trigger as string | undefined,
      });

      result = await deribitApiRequest.call(this, `private/${operation}`, sanitizeParams(params));
      break;
    }
    case 'edit': {
      const orderId = this.getNodeParameter('orderId', index) as string;
      const newAmount = this.getNodeParameter('newAmount', index) as number;
      const newPrice = this.getNodeParameter('newPrice', index, undefined) as number | undefined;
      
      const params: Record<string, unknown> = {
        order_id: orderId,
        amount: newAmount,
      };
      if (newPrice !== undefined && newPrice > 0) {
        params.price = newPrice;
      }

      result = await deribitApiRequest.call(this, 'private/edit', sanitizeParams(params));
      break;
    }
    case 'cancel': {
      const orderId = this.getNodeParameter('orderId', index) as string;
      result = await deribitApiRequest.call(this, 'private/cancel', {
        order_id: orderId,
      });
      break;
    }
    case 'cancelAll': {
      result = await deribitApiRequest.call(this, 'private/cancel_all', {});
      break;
    }
    case 'cancelAllByCurrency': {
      const currency = this.getNodeParameter('currency', index) as string;
      result = await deribitApiRequest.call(this, 'private/cancel_all_by_currency', {
        currency,
      });
      break;
    }
    case 'cancelAllByInstrument': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'private/cancel_all_by_instrument', {
        instrument_name: instrumentName,
      });
      break;
    }
    case 'cancelByLabel': {
      const label = this.getNodeParameter('label', index) as string;
      result = await deribitApiRequest.call(this, 'private/cancel_by_label', {
        label,
      });
      break;
    }
    case 'closePosition': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const orderType = this.getNodeParameter('orderType', index) as string;
      const params: Record<string, unknown> = {
        instrument_name: instrumentName,
        type: orderType,
      };
      if (orderType === 'limit') {
        const price = this.getNodeParameter('price', index, 0) as number;
        if (price > 0) {
          params.price = price;
        }
      }
      result = await deribitApiRequest.call(this, 'private/close_position', sanitizeParams(params));
      break;
    }
    case 'getMargins': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const price = this.getNodeParameter('price', index, undefined) as number | undefined;
      const params: Record<string, unknown> = {
        instrument_name: instrumentName,
        amount,
      };
      if (price !== undefined && price > 0) {
        params.price = price;
      }
      result = await deribitApiRequest.call(this, 'private/get_margins', sanitizeParams(params));
      break;
    }
    case 'getOpenOrders': {
      result = await deribitApiRequest.call(this, 'private/get_open_orders', {});
      break;
    }
    case 'getOpenOrdersByCurrency': {
      const currency = this.getNodeParameter('currency', index) as string;
      result = await deribitApiRequest.call(this, 'private/get_open_orders_by_currency', {
        currency,
      });
      break;
    }
    case 'getOpenOrdersByInstrument': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'private/get_open_orders_by_instrument', {
        instrument_name: instrumentName,
      });
      break;
    }
    case 'getOrderHistory': {
      const currency = this.getNodeParameter('currency', index) as string;
      const queryOptions = this.getNodeParameter('queryOptions', index, {}) as IDataObject;
      const params: Record<string, unknown> = { currency };
      if (queryOptions.startTimestamp) {
        params.start_timestamp = new Date(queryOptions.startTimestamp as string).getTime();
      }
      if (queryOptions.endTimestamp) {
        params.end_timestamp = new Date(queryOptions.endTimestamp as string).getTime();
      }
      if (queryOptions.count) {
        params.count = queryOptions.count;
      }
      if (queryOptions.includeOld !== undefined) {
        params.include_old = queryOptions.includeOld;
      }
      result = await deribitApiRequest.call(this, 'private/get_order_history_by_currency', sanitizeParams(params));
      break;
    }
    case 'getOrderState': {
      const orderId = this.getNodeParameter('orderId', index) as string;
      result = await deribitApiRequest.call(this, 'private/get_order_state', {
        order_id: orderId,
      });
      break;
    }
    case 'getUserTradesByCurrency': {
      const currency = this.getNodeParameter('currency', index) as string;
      const queryOptions = this.getNodeParameter('queryOptions', index, {}) as IDataObject;
      const params: Record<string, unknown> = { currency };
      if (queryOptions.startTimestamp) {
        params.start_timestamp = new Date(queryOptions.startTimestamp as string).getTime();
      }
      if (queryOptions.endTimestamp) {
        params.end_timestamp = new Date(queryOptions.endTimestamp as string).getTime();
      }
      if (queryOptions.count) {
        params.count = queryOptions.count;
      }
      if (queryOptions.sorting) {
        params.sorting = queryOptions.sorting;
      }
      result = await deribitApiRequest.call(this, 'private/get_user_trades_by_currency', sanitizeParams(params));
      break;
    }
    case 'getUserTradesByInstrument': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const queryOptions = this.getNodeParameter('queryOptions', index, {}) as IDataObject;
      const params: Record<string, unknown> = { instrument_name: instrumentName };
      if (queryOptions.startTimestamp) {
        params.start_timestamp = new Date(queryOptions.startTimestamp as string).getTime();
      }
      if (queryOptions.endTimestamp) {
        params.end_timestamp = new Date(queryOptions.endTimestamp as string).getTime();
      }
      if (queryOptions.count) {
        params.count = queryOptions.count;
      }
      if (queryOptions.sorting) {
        params.sorting = queryOptions.sorting;
      }
      result = await deribitApiRequest.call(this, 'private/get_user_trades_by_instrument', sanitizeParams(params));
      break;
    }
    case 'getUserTradesByOrder': {
      const orderId = this.getNodeParameter('orderId', index) as string;
      result = await deribitApiRequest.call(this, 'private/get_user_trades_by_order', {
        order_id: orderId,
      });
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  if (result && typeof result === 'object' && 'trades' in (result as IDataObject)) {
    const trades = (result as { trades: IDataObject[] }).trades;
    return trades.map((trade) => ({ json: trade as IDataObject }));
  }

  const resultArray = Array.isArray(result) ? result : [result];
  return resultArray.map((item) => ({ json: item as IDataObject }));
}
