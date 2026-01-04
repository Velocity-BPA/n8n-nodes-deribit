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

export const walletOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['wallet'],
      },
    },
    options: [
      {
        name: 'Cancel Withdrawal',
        value: 'cancelWithdrawal',
        description: 'Cancel a pending withdrawal',
        action: 'Cancel withdrawal',
      },
      {
        name: 'Create Transfer',
        value: 'createTransfer',
        description: 'Transfer between accounts',
        action: 'Create transfer',
      },
      {
        name: 'Get Deposits',
        value: 'getDeposits',
        description: 'Get deposit history',
        action: 'Get deposits',
      },
      {
        name: 'Get Transfers',
        value: 'getTransfers',
        description: 'Get internal transfers',
        action: 'Get transfers',
      },
      {
        name: 'Get Withdrawals',
        value: 'getWithdrawals',
        description: 'Get withdrawal history',
        action: 'Get withdrawals',
      },
      {
        name: 'Withdraw',
        value: 'withdraw',
        description: 'Request a withdrawal',
        action: 'Withdraw',
      },
    ],
    default: 'getDeposits',
  },
];

export const walletFields: INodeProperties[] = [
  // Currency
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['getDeposits', 'getWithdrawals', 'withdraw', 'getTransfers', 'createTransfer'],
      },
    },
    description: 'The currency',
  },
  // Withdrawal address
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['withdraw'],
      },
    },
    description: 'The withdrawal address',
  },
  // Amount
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['withdraw', 'createTransfer'],
      },
    },
    description: 'The amount to withdraw or transfer',
  },
  // Withdrawal ID for cancel
  {
    displayName: 'Withdrawal ID',
    name: 'withdrawalId',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['cancelWithdrawal'],
      },
    },
    description: 'The withdrawal ID to cancel',
  },
  // Transfer destination
  {
    displayName: 'Destination',
    name: 'destination',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['createTransfer'],
      },
    },
    description: 'The destination subaccount ID',
  },
  // Priority for withdrawal
  {
    displayName: 'Priority',
    name: 'priority',
    type: 'options',
    options: [
      { name: 'Low', value: 'low' },
      { name: 'Mid', value: 'mid' },
      { name: 'High', value: 'high' },
      { name: 'Very High', value: 'very_high' },
    ],
    default: 'mid',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['withdraw'],
      },
    },
    description: 'Priority for the withdrawal',
  },
  // Query options
  {
    displayName: 'Query Options',
    name: 'queryOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['getDeposits', 'getWithdrawals', 'getTransfers'],
      },
    },
    options: [
      {
        displayName: 'Count',
        name: 'count',
        type: 'number',
        default: 100,
        description: 'Number of entries to retrieve',
      },
      {
        displayName: 'Offset',
        name: 'offset',
        type: 'number',
        default: 0,
        description: 'Offset for pagination',
      },
    ],
  },
];

export async function executeWallet(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getDeposits': {
      const currency = this.getNodeParameter('currency', index) as string;
      const queryOptions = this.getNodeParameter('queryOptions', index, {}) as IDataObject;
      const params: Record<string, unknown> = { currency };
      if (queryOptions.count) {
        params.count = queryOptions.count;
      }
      if (queryOptions.offset) {
        params.offset = queryOptions.offset;
      }
      result = await deribitApiRequest.call(this, 'private/get_deposits', sanitizeParams(params));
      break;
    }
    case 'getWithdrawals': {
      const currency = this.getNodeParameter('currency', index) as string;
      const queryOptions = this.getNodeParameter('queryOptions', index, {}) as IDataObject;
      const params: Record<string, unknown> = { currency };
      if (queryOptions.count) {
        params.count = queryOptions.count;
      }
      if (queryOptions.offset) {
        params.offset = queryOptions.offset;
      }
      result = await deribitApiRequest.call(this, 'private/get_withdrawals', sanitizeParams(params));
      break;
    }
    case 'withdraw': {
      const currency = this.getNodeParameter('currency', index) as string;
      const address = this.getNodeParameter('address', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const priority = this.getNodeParameter('priority', index) as string;
      result = await deribitApiRequest.call(this, 'private/withdraw', {
        currency,
        address,
        amount,
        priority,
      });
      break;
    }
    case 'cancelWithdrawal': {
      const withdrawalId = this.getNodeParameter('withdrawalId', index) as number;
      result = await deribitApiRequest.call(this, 'private/cancel_withdrawal', {
        id: withdrawalId,
      });
      break;
    }
    case 'getTransfers': {
      const currency = this.getNodeParameter('currency', index) as string;
      const queryOptions = this.getNodeParameter('queryOptions', index, {}) as IDataObject;
      const params: Record<string, unknown> = { currency };
      if (queryOptions.count) {
        params.count = queryOptions.count;
      }
      if (queryOptions.offset) {
        params.offset = queryOptions.offset;
      }
      result = await deribitApiRequest.call(this, 'private/get_transfers', sanitizeParams(params));
      break;
    }
    case 'createTransfer': {
      const currency = this.getNodeParameter('currency', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const destination = this.getNodeParameter('destination', index) as number;
      result = await deribitApiRequest.call(this, 'private/submit_transfer_to_subaccount', {
        currency,
        amount,
        destination,
      });
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  // Handle data wrapper
  if (result && typeof result === 'object' && 'data' in (result as IDataObject)) {
    const data = (result as { data: IDataObject[] }).data;
    return data.map((item) => ({ json: item as IDataObject }));
  }

  const resultArray = Array.isArray(result) ? result : [result];
  return resultArray.map((item) => ({ json: item as IDataObject }));
}
