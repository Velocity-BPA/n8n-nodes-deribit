/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';
import { CURRENCIES } from '../../constants';
import { sanitizeParams } from '../../utils';

export const blockTradeOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['blockTrade'],
      },
    },
    options: [
      {
        name: 'Execute Block Trade',
        value: 'executeBlockTrade',
        description: 'Execute a block trade',
        action: 'Execute block trade',
      },
      {
        name: 'Get Block Trades',
        value: 'getBlockTrades',
        description: 'Get block trade history',
        action: 'Get block trades',
      },
      {
        name: 'Invalidate Block Trade Signature',
        value: 'invalidateBlockTradeSignature',
        description: 'Invalidate a block trade signature',
        action: 'Invalidate block trade signature',
      },
      {
        name: 'Verify Block Trade',
        value: 'verifyBlockTrade',
        description: 'Verify a block trade',
        action: 'Verify block trade',
      },
    ],
    default: 'getBlockTrades',
  },
];

export const blockTradeFields: INodeProperties[] = [
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['blockTrade'],
        operation: ['getBlockTrades'],
      },
    },
    description: 'The currency',
  },
  {
    displayName: 'Trade ID',
    name: 'tradeId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['blockTrade'],
        operation: ['verifyBlockTrade', 'invalidateBlockTradeSignature'],
      },
    },
    description: 'The block trade ID',
  },
  {
    displayName: 'Trades (JSON)',
    name: 'trades',
    type: 'json',
    default: '[]',
    required: true,
    displayOptions: {
      show: {
        resource: ['blockTrade'],
        operation: ['executeBlockTrade'],
      },
    },
    description: 'Array of trades in JSON format',
    placeholder: '[{"instrument_name": "BTC-PERPETUAL", "direction": "buy", "amount": 1000, "price": 50000}]',
  },
  {
    displayName: 'Counterparty',
    name: 'counterparty',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['blockTrade'],
        operation: ['executeBlockTrade'],
      },
    },
    description: 'The counterparty user ID or email',
  },
  {
    displayName: 'Query Options',
    name: 'queryOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['blockTrade'],
        operation: ['getBlockTrades'],
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
    ],
  },
];

export async function executeBlockTrade(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getBlockTrades': {
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
      result = await deribitApiRequest.call(this, 'private/get_block_trade', sanitizeParams(params));
      break;
    }
    case 'executeBlockTrade': {
      const tradesJson = this.getNodeParameter('trades', index) as string;
      const counterparty = this.getNodeParameter('counterparty', index) as string;
      let trades: unknown[];
      try {
        trades = JSON.parse(tradesJson) as unknown[];
      } catch {
        throw new Error('Invalid JSON format for trades');
      }
      result = await deribitApiRequest.call(this, 'private/execute_block_trade', {
        trades,
        counterparty,
      });
      break;
    }
    case 'verifyBlockTrade': {
      const tradeId = this.getNodeParameter('tradeId', index) as string;
      result = await deribitApiRequest.call(this, 'private/verify_block_trade', {
        trade_id: tradeId,
      });
      break;
    }
    case 'invalidateBlockTradeSignature': {
      const tradeId = this.getNodeParameter('tradeId', index) as string;
      result = await deribitApiRequest.call(this, 'private/invalidate_block_trade_signature', {
        trade_id: tradeId,
      });
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  const resultArray = Array.isArray(result) ? result : [result];
  return resultArray.map((item) => ({ json: item as IDataObject }));
}
