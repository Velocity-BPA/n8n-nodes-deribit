/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IPollFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  NodeApiError,
  NodeOperationError,
  IDataObject,
} from 'n8n-workflow';

import { DERIBIT_API_URLS, DERIBIT_ERROR_CODES } from '../constants';

export interface IDeribitCredentials {
  environment: 'production' | 'testnet';
  clientId: string;
  clientSecret: string;
}

export interface IDeribitAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface IDeribitResponse<T = unknown> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  usIn: number;
  usOut: number;
  usDiff: number;
  testnet: boolean;
}

// Token cache for session management
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

function getCredentialKey(credentials: IDeribitCredentials): string {
  return `${credentials.environment}:${credentials.clientId}`;
}

export async function getAccessToken(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
  credentials: IDeribitCredentials,
): Promise<string> {
  const cacheKey = getCredentialKey(credentials);
  const cached = tokenCache.get(cacheKey);

  // Return cached token if still valid (with 60 second buffer)
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.token;
  }

  const baseUrl = DERIBIT_API_URLS[credentials.environment];

  const options: IHttpRequestOptions = {
    method: 'GET' as IHttpRequestMethods,
    url: `${baseUrl}/public/auth`,
    qs: {
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    },
    json: true,
  };

  try {
    const response = await this.helpers.httpRequest(options);
    const authResponse = response as IDeribitResponse<IDeribitAuthResponse>;

    if (authResponse.error) {
      throw new NodeApiError(this.getNode(), {
        code: authResponse.error.code,
        message: authResponse.error.message,
      }, {
        message: authResponse.error.message,
      });
    }

    if (!authResponse.result?.access_token) {
      throw new NodeOperationError(this.getNode(), 'No access token in response');
    }

    // Cache the token
    tokenCache.set(cacheKey, {
      token: authResponse.result.access_token,
      expiresAt: Date.now() + authResponse.result.expires_in * 1000,
    });

    return authResponse.result.access_token;
  } catch (error) {
    const errorObj = error as Error;
    throw new NodeApiError(this.getNode(), {
      message: errorObj.message || 'Unknown error',
    }, {
      message: 'Failed to authenticate with Deribit',
    });
  }
}

export async function deribitApiRequest<T = unknown>(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
  method: string,
  params: Record<string, unknown> = {},
  isPublic = false,
): Promise<T> {
  const credentials = (await this.getCredentials('deribitApi')) as unknown as IDeribitCredentials;
  const baseUrl = DERIBIT_API_URLS[credentials.environment];

  const url = `${baseUrl}/${method}`;
  const options: IHttpRequestOptions = {
    method: 'GET' as IHttpRequestMethods,
    url,
    json: true,
  };

  if (!isPublic) {
    const accessToken = await getAccessToken.call(this, credentials);
    options.headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  // Add query parameters
  if (Object.keys(params).length > 0) {
    options.qs = params as IDataObject;
  }

  try {
    const response = await this.helpers.httpRequest(options);
    const apiResponse = response as IDeribitResponse<T>;

    if (apiResponse.error) {
      const errorMessage =
        DERIBIT_ERROR_CODES[apiResponse.error.code] || apiResponse.error.message;
      throw new NodeApiError(this.getNode(), {
        code: apiResponse.error.code,
        message: apiResponse.error.message,
      }, {
        message: `Deribit API Error: ${errorMessage}`,
        description: `Error code: ${apiResponse.error.code}`,
      });
    }

    return apiResponse.result as T;
  } catch (error) {
    if (error instanceof NodeApiError) {
      throw error;
    }
    const errorObj = error as Error;
    throw new NodeApiError(this.getNode(), {
      message: errorObj.message || 'Unknown error',
    }, {
      message: 'Deribit API request failed',
    });
  }
}

export async function deribitApiRequestAllItems<T = unknown>(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
  method: string,
  params: Record<string, unknown> = {},
  isPublic = false,
): Promise<T[]> {
  const returnData: T[] = [];
  let hasMore = true;
  let continuation: string | undefined;

  while (hasMore) {
    const requestParams = { ...params };
    if (continuation) {
      requestParams.continuation = continuation;
    }

    const response = await deribitApiRequest.call(this, method, requestParams, isPublic);

    if (Array.isArray(response)) {
      returnData.push(...response);
      hasMore = false;
    } else if (response && typeof response === 'object') {
      const responseObj = response as Record<string, unknown>;
      if (responseObj.trades && Array.isArray(responseObj.trades)) {
        returnData.push(...(responseObj.trades as T[]));
        continuation = responseObj.continuation as string | undefined;
        hasMore = !!continuation;
      } else if (responseObj.orders && Array.isArray(responseObj.orders)) {
        returnData.push(...(responseObj.orders as T[]));
        hasMore = false;
      } else {
        returnData.push(response as T);
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return returnData;
}

export function clearTokenCache(): void {
  tokenCache.clear();
}

export function clearTokenForCredentials(credentials: IDeribitCredentials): void {
  const cacheKey = getCredentialKey(credentials);
  tokenCache.delete(cacheKey);
}
