/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';
import { CURRENCIES } from '../../constants';

export const portfolioOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['portfolio'],
      },
    },
    options: [
      {
        name: 'Get Portfolio Margins',
        value: 'getPortfolioMargins',
        description: 'Get portfolio margin information',
        action: 'Get portfolio margins',
      },
      {
        name: 'Simulate Portfolio',
        value: 'simulatePortfolio',
        description: 'Simulate portfolio changes',
        action: 'Simulate portfolio',
      },
    ],
    default: 'getPortfolioMargins',
  },
];

export const portfolioFields: INodeProperties[] = [
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['portfolio'],
        operation: ['getPortfolioMargins', 'simulatePortfolio'],
      },
    },
    description: 'The currency for portfolio calculations',
  },
  {
    displayName: 'Simulation Type',
    name: 'simulationType',
    type: 'options',
    options: [
      { name: 'Add Position', value: 'add_position' },
      { name: 'Close Position', value: 'close_position' },
    ],
    default: 'add_position',
    displayOptions: {
      show: {
        resource: ['portfolio'],
        operation: ['simulatePortfolio'],
      },
    },
    description: 'Type of simulation to perform',
  },
  {
    displayName: 'Simulated Positions (JSON)',
    name: 'simulatedPositions',
    type: 'json',
    default: '[]',
    displayOptions: {
      show: {
        resource: ['portfolio'],
        operation: ['simulatePortfolio'],
      },
    },
    description: 'Array of simulated position changes in JSON format',
    placeholder: '[{"instrument_name": "BTC-PERPETUAL", "amount": 1000}]',
  },
];

export async function executePortfolio(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const currency = this.getNodeParameter('currency', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getPortfolioMargins': {
      result = await deribitApiRequest.call(this, 'private/get_portfolio_margins', {
        currency,
      });
      break;
    }
    case 'simulatePortfolio': {
      const simulatedPositions = this.getNodeParameter('simulatedPositions', index) as string;
      let positions: unknown[];
      try {
        positions = JSON.parse(simulatedPositions) as unknown[];
      } catch {
        throw new Error('Invalid JSON format for simulated positions');
      }
      result = await deribitApiRequest.call(this, 'private/simulate_portfolio', {
        currency,
        simulated_positions: positions,
      });
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return [{ json: result as IDataObject }];
}
