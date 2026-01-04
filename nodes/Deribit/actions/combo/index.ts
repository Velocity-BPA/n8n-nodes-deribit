/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';
import { CURRENCIES } from '../../constants';

export const comboOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['combo'],
      },
    },
    options: [
      {
        name: 'Create Combo',
        value: 'createCombo',
        description: 'Create a combo order',
        action: 'Create combo',
      },
      {
        name: 'Get Combos',
        value: 'getCombos',
        description: 'Get combo instruments',
        action: 'Get combos',
      },
    ],
    default: 'getCombos',
  },
];

export const comboFields: INodeProperties[] = [
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['combo'],
        operation: ['getCombos', 'createCombo'],
      },
    },
    description: 'The currency',
  },
  {
    displayName: 'State',
    name: 'state',
    type: 'options',
    options: [
      { name: 'All', value: 'all' },
      { name: 'Active', value: 'active' },
      { name: 'Inactive', value: 'inactive' },
    ],
    default: 'active',
    displayOptions: {
      show: {
        resource: ['combo'],
        operation: ['getCombos'],
      },
    },
    description: 'Filter combos by state',
  },
  {
    displayName: 'Legs (JSON)',
    name: 'legs',
    type: 'json',
    default: '[]',
    required: true,
    displayOptions: {
      show: {
        resource: ['combo'],
        operation: ['createCombo'],
      },
    },
    description: 'Array of combo legs in JSON format',
    placeholder: '[{"instrument_name": "BTC-PERPETUAL", "direction": "buy", "ratio": 1}]',
  },
];

export async function executeCombo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const currency = this.getNodeParameter('currency', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getCombos': {
      const state = this.getNodeParameter('state', index, 'active') as string;
      result = await deribitApiRequest.call(this, 'public/get_combo_ids', {
        currency,
        state,
      }, true);
      break;
    }
    case 'createCombo': {
      const legsJson = this.getNodeParameter('legs', index) as string;
      let legs: unknown[];
      try {
        legs = JSON.parse(legsJson) as unknown[];
      } catch {
        throw new Error('Invalid JSON format for legs');
      }
      result = await deribitApiRequest.call(this, 'private/create_combo', {
        currency,
        legs,
      });
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  const resultArray = Array.isArray(result) ? result : [result];
  return resultArray.map((item) => {
    if (typeof item === 'string') {
      return { json: { combo_id: item } };
    }
    return { json: item as IDataObject };
  });
}
