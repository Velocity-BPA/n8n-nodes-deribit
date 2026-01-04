/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';
import { CURRENCIES } from '../../constants';

export const optionsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['options'],
      },
    },
    options: [
      {
        name: 'Get Option Mark Prices',
        value: 'getOptionMarkPrices',
        description: 'Get mark prices for all options',
        action: 'Get option mark prices',
      },
      {
        name: 'Get Option Summary',
        value: 'getOptionSummary',
        description: 'Get summary data for options',
        action: 'Get option summary',
      },
    ],
    default: 'getOptionMarkPrices',
  },
];

export const optionsFields: INodeProperties[] = [
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['options'],
        operation: ['getOptionMarkPrices', 'getOptionSummary'],
      },
    },
    description: 'The currency for options',
  },
];

export async function executeOptions(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const currency = this.getNodeParameter('currency', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getOptionMarkPrices': {
      result = await deribitApiRequest.call(this, 'public/get_option_mark_prices', {
        currency,
      }, true);
      break;
    }
    case 'getOptionSummary': {
      result = await deribitApiRequest.call(this, 'public/get_book_summary_by_currency', {
        currency,
        kind: 'option',
      }, true);
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  const resultArray = Array.isArray(result) ? result : [result];
  return resultArray.map((item) => ({ json: item as IDataObject }));
}
