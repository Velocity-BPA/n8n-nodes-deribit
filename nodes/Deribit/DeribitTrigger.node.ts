/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';

import { deribitApiRequest } from './transport';
import { CURRENCIES } from './constants';
import { emitLicenseWarning } from './utils';

interface ITrade {
  trade_id: string;
  timestamp: number;
  instrument_name: string;
  direction: string;
  price: number;
  amount: number;
}

interface IOrder {
  order_id: string;
  order_state: string;
  creation_timestamp: number;
  instrument_name: string;
  direction: string;
  price: number;
  amount: number;
  filled_amount: number;
}

interface IPosition {
  instrument_name: string;
  size: number;
  average_price: number;
  mark_price: number;
  realized_profit_loss: number;
  floating_profit_loss: number;
}

interface ITicker {
  instrument_name: string;
  last_price: number;
  best_bid_price: number;
  best_ask_price: number;
  mark_price: number;
  index_price: number;
  funding_8h?: number;
}

interface ISettlement {
  timestamp: number;
  type: string;
  instrument_name: string;
  session_profit_loss?: number;
  profit_loss?: number;
}

export class DeribitTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Deribit Trigger',
    name: 'deribitTrigger',
    icon: 'file:deribit.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["triggerType"]}}',
    description: 'Triggers on Deribit events',
    defaults: {
      name: 'Deribit Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'deribitApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Trigger Type',
        name: 'triggerType',
        type: 'options',
        required: true,
        options: [
          {
            name: 'Funding Rate Changed',
            value: 'fundingRateChanged',
            description: 'Trigger when funding rate updates',
          },
          {
            name: 'New Order',
            value: 'newOrder',
            description: 'Trigger when a new order is placed',
          },
          {
            name: 'Order Canceled',
            value: 'orderCanceled',
            description: 'Trigger when an order is canceled',
          },
          {
            name: 'Order Filled',
            value: 'orderFilled',
            description: 'Trigger when an order is executed',
          },
          {
            name: 'Position Changed',
            value: 'positionChanged',
            description: 'Trigger when a position is updated',
          },
          {
            name: 'Price Alert',
            value: 'priceAlert',
            description: 'Trigger when price crosses a threshold',
          },
          {
            name: 'Settlement Occurred',
            value: 'settlementOccurred',
            description: 'Trigger on settlement events',
          },
        ],
        default: 'orderFilled',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'options',
        options: [...CURRENCIES],
        default: 'BTC',
        required: true,
        description: 'The currency to monitor',
      },
      {
        displayName: 'Instrument Name',
        name: 'instrumentName',
        type: 'string',
        default: 'BTC-PERPETUAL',
        displayOptions: {
          show: {
            triggerType: ['priceAlert', 'fundingRateChanged', 'positionChanged'],
          },
        },
        description: 'The instrument to monitor',
      },
      {
        displayName: 'Price Threshold',
        name: 'priceThreshold',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            triggerType: ['priceAlert'],
          },
        },
        description: 'Price level to trigger on',
      },
      {
        displayName: 'Alert Direction',
        name: 'alertDirection',
        type: 'options',
        options: [
          { name: 'Crosses Above', value: 'above' },
          { name: 'Crosses Below', value: 'below' },
          { name: 'Either Direction', value: 'either' },
        ],
        default: 'either',
        displayOptions: {
          show: {
            triggerType: ['priceAlert'],
          },
        },
        description: 'Direction for price alert',
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    emitLicenseWarning();

    const triggerType = this.getNodeParameter('triggerType') as string;
    const currency = this.getNodeParameter('currency') as string;
    const webhookData = this.getWorkflowStaticData('node');

    const returnData: INodeExecutionData[] = [];

    try {
      switch (triggerType) {
        case 'orderFilled': {
          const trades = await deribitApiRequest.call(
            this,
            'private/get_user_trades_by_currency',
            { currency, count: 50, sorting: 'desc' },
          ) as { trades: ITrade[] };

          const lastCheckedTradeId = webhookData.lastCheckedTradeId as string | undefined;
          const newTrades: ITrade[] = [];

          for (const trade of trades.trades || []) {
            if (lastCheckedTradeId && trade.trade_id === lastCheckedTradeId) {
              break;
            }
            newTrades.push(trade);
          }

          if (newTrades.length > 0) {
            webhookData.lastCheckedTradeId = newTrades[0].trade_id;
            for (const trade of newTrades.reverse()) {
              returnData.push({ json: trade as unknown as IDataObject });
            }
          }
          break;
        }

        case 'newOrder':
        case 'orderCanceled': {
          const orders = await deribitApiRequest.call(
            this,
            'private/get_order_history_by_currency',
            { currency, count: 50 },
          ) as IOrder[];

          const lastCheckedOrderId = webhookData.lastCheckedOrderId as string | undefined;
          const targetState = triggerType === 'newOrder' ? 'open' : 'cancelled';
          const newOrders: IOrder[] = [];

          for (const order of orders || []) {
            if (lastCheckedOrderId && order.order_id === lastCheckedOrderId) {
              break;
            }
            if (triggerType === 'newOrder' || order.order_state === targetState) {
              newOrders.push(order);
            }
          }

          if (newOrders.length > 0) {
            webhookData.lastCheckedOrderId = (orders || [])[0]?.order_id;
            for (const order of newOrders.reverse()) {
              returnData.push({ json: order as unknown as IDataObject });
            }
          }
          break;
        }

        case 'positionChanged': {
          const instrumentName = this.getNodeParameter('instrumentName') as string;
          const position = await deribitApiRequest.call(
            this,
            'private/get_position',
            { instrument_name: instrumentName },
          ) as IPosition;

          const lastPositionSize = webhookData.lastPositionSize as number | undefined;

          if (lastPositionSize !== undefined && position.size !== lastPositionSize) {
            returnData.push({
              json: {
                ...position as unknown as IDataObject,
                previousSize: lastPositionSize,
                sizeChange: position.size - lastPositionSize,
              },
            });
          }

          webhookData.lastPositionSize = position.size;
          break;
        }

        case 'priceAlert': {
          const instrumentName = this.getNodeParameter('instrumentName') as string;
          const priceThreshold = this.getNodeParameter('priceThreshold') as number;
          const alertDirection = this.getNodeParameter('alertDirection') as string;

          const ticker = await deribitApiRequest.call(
            this,
            'public/ticker',
            { instrument_name: instrumentName },
            true,
          ) as ITicker;

          const lastPrice = webhookData.lastPrice as number | undefined;
          const currentPrice = ticker.last_price;

          if (lastPrice !== undefined && priceThreshold > 0) {
            const crossedAbove = lastPrice < priceThreshold && currentPrice >= priceThreshold;
            const crossedBelow = lastPrice > priceThreshold && currentPrice <= priceThreshold;

            if (
              (alertDirection === 'above' && crossedAbove) ||
              (alertDirection === 'below' && crossedBelow) ||
              (alertDirection === 'either' && (crossedAbove || crossedBelow))
            ) {
              returnData.push({
                json: {
                  instrument_name: instrumentName,
                  threshold: priceThreshold,
                  direction: crossedAbove ? 'above' : 'below',
                  previousPrice: lastPrice,
                  currentPrice,
                  ticker: ticker as unknown as IDataObject,
                },
              });
            }
          }

          webhookData.lastPrice = currentPrice;
          break;
        }

        case 'settlementOccurred': {
          const settlements = await deribitApiRequest.call(
            this,
            'public/get_last_settlements_by_currency',
            { currency, count: 10 },
            true,
          ) as { settlements: ISettlement[] };

          const lastSettlementTimestamp = webhookData.lastSettlementTimestamp as number | undefined;
          const newSettlements: ISettlement[] = [];

          for (const settlement of settlements.settlements || []) {
            if (lastSettlementTimestamp && settlement.timestamp <= lastSettlementTimestamp) {
              break;
            }
            newSettlements.push(settlement);
          }

          if (newSettlements.length > 0) {
            webhookData.lastSettlementTimestamp = newSettlements[0].timestamp;
            for (const settlement of newSettlements.reverse()) {
              returnData.push({ json: settlement as unknown as IDataObject });
            }
          }
          break;
        }

        case 'fundingRateChanged': {
          const instrumentName = this.getNodeParameter('instrumentName') as string;
          
          // Only applies to perpetual instruments
          if (!instrumentName.includes('PERPETUAL')) {
            break;
          }

          const ticker = await deribitApiRequest.call(
            this,
            'public/ticker',
            { instrument_name: instrumentName },
            true,
          ) as ITicker;

          const lastFundingRate = webhookData.lastFundingRate as number | undefined;
          const currentFundingRate = ticker.funding_8h;

          if (currentFundingRate !== undefined && lastFundingRate !== undefined && currentFundingRate !== lastFundingRate) {
            returnData.push({
              json: {
                instrument_name: instrumentName,
                previous_funding_rate: lastFundingRate,
                current_funding_rate: currentFundingRate,
                change: currentFundingRate - lastFundingRate,
                ticker: ticker as unknown as IDataObject,
              },
            });
          }

          webhookData.lastFundingRate = currentFundingRate;
          break;
        }
      }
    } catch (error) {
      // On first run or error, initialize state and return empty
      if (!webhookData.initialized) {
        webhookData.initialized = true;
        return null;
      }
      throw error;
    }

    if (returnData.length === 0) {
      return null;
    }

    return [returnData];
  }
}
