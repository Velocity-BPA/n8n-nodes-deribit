/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';

export const publicOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['public'],
      },
    },
    options: [
      {
        name: 'Get Time',
        value: 'getTime',
        description: 'Get server time',
        action: 'Get time',
      },
      {
        name: 'Status',
        value: 'status',
        description: 'Get exchange status',
        action: 'Get status',
      },
      {
        name: 'Test',
        value: 'test',
        description: 'Test API connectivity',
        action: 'Test connectivity',
      },
    ],
    default: 'test',
  },
];

export const publicFields: INodeProperties[] = [];

export async function executePublic(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getTime': {
      result = await deribitApiRequest.call(this, 'public/get_time', {}, true);
      // Result is just a timestamp number
      if (typeof result === 'number') {
        result = {
          timestamp: result,
          datetime: new Date(result).toISOString(),
        };
      }
      break;
    }
    case 'test': {
      result = await deribitApiRequest.call(this, 'public/test', {}, true);
      break;
    }
    case 'status': {
      result = await deribitApiRequest.call(this, 'public/status', {}, true);
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return [{ json: result as IDataObject }];
}
