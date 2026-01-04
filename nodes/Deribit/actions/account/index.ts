/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';
import { CURRENCIES } from '../../constants';

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['account'],
      },
    },
    options: [
      {
        name: 'Change Subaccount Name',
        value: 'changeSubaccountName',
        description: 'Rename a subaccount',
        action: 'Rename subaccount',
      },
      {
        name: 'Create Subaccount',
        value: 'createSubaccount',
        description: 'Create a new subaccount',
        action: 'Create subaccount',
      },
      {
        name: 'Get Account Summary',
        value: 'getAccountSummary',
        description: 'Get account summary by currency',
        action: 'Get account summary',
      },
      {
        name: 'Get Announcements',
        value: 'getAnnouncements',
        description: 'Get platform announcements',
        action: 'Get announcements',
      },
      {
        name: 'Get Position',
        value: 'getPosition',
        description: 'Get position for a specific instrument',
        action: 'Get position',
      },
      {
        name: 'Get Positions',
        value: 'getPositions',
        description: 'Get all positions for a currency',
        action: 'Get positions',
      },
      {
        name: 'Get Subaccounts',
        value: 'getSubaccounts',
        description: 'List all subaccounts',
        action: 'Get subaccounts',
      },
      {
        name: 'Get Transaction Log',
        value: 'getTransactionLog',
        description: 'Get transaction history',
        action: 'Get transaction log',
      },
    ],
    default: 'getAccountSummary',
  },
];

export const accountFields: INodeProperties[] = [
  // Currency field for account operations
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getAccountSummary', 'getPositions', 'getTransactionLog'],
      },
    },
    description: 'The currency to get information for',
  },
  // Instrument name for position
  {
    displayName: 'Instrument Name',
    name: 'instrumentName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getPosition'],
      },
    },
    description: 'The instrument name (e.g., BTC-PERPETUAL)',
    placeholder: 'BTC-PERPETUAL',
  },
  // Extended option for account summary
  {
    displayName: 'Extended',
    name: 'extended',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getAccountSummary'],
      },
    },
    description: 'Whether to include additional fields in the response',
  },
  // Subaccount fields
  {
    displayName: 'Subaccount ID',
    name: 'subaccountId',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['changeSubaccountName'],
      },
    },
    description: 'The ID of the subaccount',
  },
  {
    displayName: 'New Name',
    name: 'newName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['changeSubaccountName'],
      },
    },
    description: 'The new name for the subaccount',
  },
  // Transaction log options
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getTransactionLog'],
      },
    },
    options: [
      {
        displayName: 'Start Timestamp',
        name: 'startTimestamp',
        type: 'dateTime',
        default: '',
        description: 'Start time for the log query',
      },
      {
        displayName: 'End Timestamp',
        name: 'endTimestamp',
        type: 'dateTime',
        default: '',
        description: 'End time for the log query',
      },
      {
        displayName: 'Count',
        name: 'count',
        type: 'number',
        default: 100,
        description: 'Number of entries to retrieve',
      },
    ],
  },
  // With open orders for subaccounts
  {
    displayName: 'With Open Orders',
    name: 'withOpenOrders',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getSubaccounts'],
      },
    },
    description: 'Whether to include open orders in the response',
  },
];

export async function executeAccount(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getAccountSummary': {
      const currency = this.getNodeParameter('currency', index) as string;
      const extended = this.getNodeParameter('extended', index, false) as boolean;
      result = await deribitApiRequest.call(this, 'private/get_account_summary', {
        currency,
        extended,
      });
      break;
    }
    case 'getPositions': {
      const currency = this.getNodeParameter('currency', index) as string;
      result = await deribitApiRequest.call(this, 'private/get_positions', {
        currency,
      });
      break;
    }
    case 'getPosition': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'private/get_position', {
        instrument_name: instrumentName,
      });
      break;
    }
    case 'getSubaccounts': {
      const withOpenOrders = this.getNodeParameter('withOpenOrders', index, false) as boolean;
      result = await deribitApiRequest.call(this, 'private/get_subaccounts', {
        with_open_orders: withOpenOrders,
      });
      break;
    }
    case 'createSubaccount': {
      result = await deribitApiRequest.call(this, 'private/create_subaccount', {});
      break;
    }
    case 'changeSubaccountName': {
      const sid = this.getNodeParameter('subaccountId', index) as number;
      const name = this.getNodeParameter('newName', index) as string;
      result = await deribitApiRequest.call(this, 'private/change_subaccount_name', {
        sid,
        name,
      });
      break;
    }
    case 'getTransactionLog': {
      const currency = this.getNodeParameter('currency', index) as string;
      const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as {
        startTimestamp?: string;
        endTimestamp?: string;
        count?: number;
      };
      const params: Record<string, unknown> = { currency };
      if (additionalOptions.startTimestamp) {
        params.start_timestamp = new Date(additionalOptions.startTimestamp).getTime();
      }
      if (additionalOptions.endTimestamp) {
        params.end_timestamp = new Date(additionalOptions.endTimestamp).getTime();
      }
      if (additionalOptions.count) {
        params.count = additionalOptions.count;
      }
      result = await deribitApiRequest.call(this, 'private/get_transaction_log', params);
      break;
    }
    case 'getAnnouncements': {
      result = await deribitApiRequest.call(this, 'public/get_announcements', {}, true);
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  const resultArray = Array.isArray(result) ? result : [result];
  return resultArray.map((item) => ({ json: item as IDataObject }));
}
