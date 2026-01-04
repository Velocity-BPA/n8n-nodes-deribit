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
            name: 'Portfolio',
            value: 'portfolio',
            description: 'Portfolio margin and simulation',
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
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }

        returnData.push(...results);
      } catch (error) {
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
