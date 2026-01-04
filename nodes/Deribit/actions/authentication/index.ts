/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest, clearTokenForCredentials, IDeribitCredentials } from '../../transport';

export const authenticationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['authentication'],
      },
    },
    options: [
      {
        name: 'Authenticate',
        value: 'auth',
        description: 'Get access token using client credentials',
        action: 'Get access token',
      },
      {
        name: 'Fork Token',
        value: 'forkToken',
        description: 'Clone session token for multiple connections',
        action: 'Fork token',
      },
      {
        name: 'Logout',
        value: 'logout',
        description: 'Invalidate the current token',
        action: 'Logout',
      },
      {
        name: 'Refresh Token',
        value: 'refreshToken',
        description: 'Refresh access token',
        action: 'Refresh token',
      },
    ],
    default: 'auth',
  },
];

export const authenticationFields: INodeProperties[] = [
  // Refresh Token fields
  {
    displayName: 'Refresh Token',
    name: 'refreshToken',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['authentication'],
        operation: ['refreshToken'],
      },
    },
    description: 'The refresh token received during authentication',
  },
  // Fork Token fields
  {
    displayName: 'Session Name',
    name: 'sessionName',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['authentication'],
        operation: ['forkToken'],
      },
    },
    description: 'Optional name for the new session',
  },
];

export async function executeAuthentication(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const credentials = (await this.getCredentials('deribitApi')) as unknown as IDeribitCredentials;

  let result: unknown;

  switch (operation) {
    case 'auth': {
      result = await deribitApiRequest.call(this, 'public/auth', {
        grant_type: 'client_credentials',
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }, true);
      break;
    }
    case 'refreshToken': {
      const refreshToken = this.getNodeParameter('refreshToken', index) as string;
      result = await deribitApiRequest.call(this, 'public/auth', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }, true);
      break;
    }
    case 'logout': {
      result = await deribitApiRequest.call(this, 'private/logout', {});
      clearTokenForCredentials(credentials);
      break;
    }
    case 'forkToken': {
      const sessionName = this.getNodeParameter('sessionName', index, '') as string;
      const params: Record<string, unknown> = {};
      if (sessionName) {
        params.session_name = sessionName;
      }
      result = await deribitApiRequest.call(this, 'private/fork_token', params);
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return [{ json: result as IDataObject }];
}
