/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { deribitApiRequest } from '../../transport';
import { CURRENCIES, INSTRUMENT_KINDS, RESOLUTIONS, SORT_ORDERS } from '../../constants';
import { sanitizeParams } from '../../utils';

export const marketDataOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['marketData'],
      },
    },
    options: [
      {
        name: 'Get Book Summary By Currency',
        value: 'getBookSummaryByCurrency',
        description: 'Get order book summary for a currency',
        action: 'Get book summary by currency',
      },
      {
        name: 'Get Book Summary By Instrument',
        value: 'getBookSummaryByInstrument',
        description: 'Get order book for an instrument',
        action: 'Get book summary by instrument',
      },
      {
        name: 'Get Contract Size',
        value: 'getContractSize',
        description: 'Get contract size for an instrument',
        action: 'Get contract size',
      },
      {
        name: 'Get Currencies',
        value: 'getCurrencies',
        description: 'Get list of supported currencies',
        action: 'Get currencies',
      },
      {
        name: 'Get Delivery Prices',
        value: 'getDeliveryPrices',
        description: 'Get delivery prices',
        action: 'Get delivery prices',
      },
      {
        name: 'Get Funding Chart Data',
        value: 'getFundingChartData',
        description: 'Get funding rate chart data',
        action: 'Get funding chart data',
      },
      {
        name: 'Get Funding Rate History',
        value: 'getFundingRateHistory',
        description: 'Get funding rate history',
        action: 'Get funding rate history',
      },
      {
        name: 'Get Funding Rate Value',
        value: 'getFundingRateValue',
        description: 'Get current funding rate',
        action: 'Get funding rate value',
      },
      {
        name: 'Get Historical Volatility',
        value: 'getHistoricalVolatility',
        description: 'Get historical volatility data',
        action: 'Get historical volatility',
      },
      {
        name: 'Get Index Price',
        value: 'getIndexPrice',
        description: 'Get index price',
        action: 'Get index price',
      },
      {
        name: 'Get Index Price Names',
        value: 'getIndexPriceNames',
        description: 'Get list of index names',
        action: 'Get index price names',
      },
      {
        name: 'Get Instrument',
        value: 'getInstrument',
        description: 'Get instrument details',
        action: 'Get instrument',
      },
      {
        name: 'Get Instruments',
        value: 'getInstruments',
        description: 'Get all instruments for a currency',
        action: 'Get instruments',
      },
      {
        name: 'Get Last Settlements By Currency',
        value: 'getLastSettlementsByCurrency',
        description: 'Get recent settlements',
        action: 'Get last settlements by currency',
      },
      {
        name: 'Get Last Trades By Currency',
        value: 'getLastTradesByCurrency',
        description: 'Get recent trades for a currency',
        action: 'Get last trades by currency',
      },
      {
        name: 'Get Last Trades By Instrument',
        value: 'getLastTradesByInstrument',
        description: 'Get recent trades for an instrument',
        action: 'Get last trades by instrument',
      },
      {
        name: 'Get Mark Price History',
        value: 'getMarkPriceHistory',
        description: 'Get mark price history',
        action: 'Get mark price history',
      },
      {
        name: 'Get Order Book',
        value: 'getOrderBook',
        description: 'Get full order book',
        action: 'Get order book',
      },
      {
        name: 'Get Ticker',
        value: 'getTicker',
        description: 'Get ticker for an instrument',
        action: 'Get ticker',
      },
      {
        name: 'Get Tradingview Chart Data',
        value: 'getTradingviewChartData',
        description: 'Get OHLCV data for charts',
        action: 'Get tradingview chart data',
      },
      {
        name: 'Get Volatility Index Data',
        value: 'getVolatilityIndexData',
        description: 'Get volatility index data',
        action: 'Get volatility index data',
      },
    ],
    default: 'getTicker',
  },
];

export const marketDataFields: INodeProperties[] = [
  // Currency selection
  {
    displayName: 'Currency',
    name: 'currency',
    type: 'options',
    options: [...CURRENCIES],
    default: 'BTC',
    required: true,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: [
          'getBookSummaryByCurrency',
          'getDeliveryPrices',
          'getHistoricalVolatility',
          'getInstruments',
          'getLastSettlementsByCurrency',
          'getLastTradesByCurrency',
          'getVolatilityIndexData',
        ],
      },
    },
    description: 'The currency',
  },
  // Instrument name
  {
    displayName: 'Instrument Name',
    name: 'instrumentName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: [
          'getBookSummaryByInstrument',
          'getContractSize',
          'getFundingChartData',
          'getFundingRateHistory',
          'getFundingRateValue',
          'getInstrument',
          'getLastTradesByInstrument',
          'getMarkPriceHistory',
          'getOrderBook',
          'getTicker',
          'getTradingviewChartData',
        ],
      },
    },
    description: 'The instrument name (e.g., BTC-PERPETUAL)',
    placeholder: 'BTC-PERPETUAL',
  },
  // Index name
  {
    displayName: 'Index Name',
    name: 'indexName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: ['getIndexPrice'],
      },
    },
    description: 'The index name (e.g., btc_usd)',
    placeholder: 'btc_usd',
  },
  // Kind filter for instruments
  {
    displayName: 'Kind',
    name: 'kind',
    type: 'options',
    options: [
      { name: 'All', value: '' },
      ...INSTRUMENT_KINDS,
    ],
    default: '',
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: ['getInstruments', 'getBookSummaryByCurrency'],
      },
    },
    description: 'Filter by instrument kind',
  },
  // Expired filter
  {
    displayName: 'Include Expired',
    name: 'expired',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: ['getInstruments'],
      },
    },
    description: 'Whether to include expired instruments',
  },
  // Depth for order book
  {
    displayName: 'Depth',
    name: 'depth',
    type: 'number',
    default: 10,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: ['getOrderBook'],
      },
    },
    description: 'Number of price levels to retrieve',
  },
  // Chart data options
  {
    displayName: 'Resolution',
    name: 'resolution',
    type: 'options',
    options: [...RESOLUTIONS],
    default: '60',
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: ['getTradingviewChartData', 'getFundingChartData'],
      },
    },
    description: 'Time resolution for the chart data',
  },
  {
    displayName: 'Start Timestamp',
    name: 'startTimestamp',
    type: 'dateTime',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: [
          'getTradingviewChartData',
          'getMarkPriceHistory',
          'getFundingRateHistory',
          'getVolatilityIndexData',
        ],
      },
    },
    description: 'Start time for the data',
  },
  {
    displayName: 'End Timestamp',
    name: 'endTimestamp',
    type: 'dateTime',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: [
          'getTradingviewChartData',
          'getMarkPriceHistory',
          'getFundingRateHistory',
          'getVolatilityIndexData',
        ],
      },
    },
    description: 'End time for the data',
  },
  // Count for trades
  {
    displayName: 'Count',
    name: 'count',
    type: 'number',
    default: 100,
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: [
          'getLastTradesByCurrency',
          'getLastTradesByInstrument',
          'getLastSettlementsByCurrency',
        ],
      },
    },
    description: 'Number of results to retrieve',
  },
  // Sorting
  {
    displayName: 'Sorting',
    name: 'sorting',
    type: 'options',
    options: [...SORT_ORDERS],
    default: 'desc',
    displayOptions: {
      show: {
        resource: ['marketData'],
        operation: [
          'getLastTradesByCurrency',
          'getLastTradesByInstrument',
        ],
      },
    },
    description: 'Sort order for results',
  },
];

export async function executeMarketData(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  let result: unknown;

  switch (operation) {
    case 'getBookSummaryByCurrency': {
      const currency = this.getNodeParameter('currency', index) as string;
      const kind = this.getNodeParameter('kind', index, '') as string;
      const params: Record<string, unknown> = { currency };
      if (kind) {
        params.kind = kind;
      }
      result = await deribitApiRequest.call(this, 'public/get_book_summary_by_currency', sanitizeParams(params), true);
      break;
    }
    case 'getBookSummaryByInstrument': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_book_summary_by_instrument', {
        instrument_name: instrumentName,
      }, true);
      break;
    }
    case 'getContractSize': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_contract_size', {
        instrument_name: instrumentName,
      }, true);
      break;
    }
    case 'getCurrencies': {
      result = await deribitApiRequest.call(this, 'public/get_currencies', {}, true);
      break;
    }
    case 'getDeliveryPrices': {
      const currency = this.getNodeParameter('currency', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_delivery_prices', {
        index_name: `${currency.toLowerCase()}_usd`,
      }, true);
      break;
    }
    case 'getFundingChartData': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const resolution = this.getNodeParameter('resolution', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_funding_chart_data', {
        instrument_name: instrumentName,
        length: resolution,
      }, true);
      break;
    }
    case 'getFundingRateHistory': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const startTimestamp = this.getNodeParameter('startTimestamp', index) as string;
      const endTimestamp = this.getNodeParameter('endTimestamp', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_funding_rate_history', {
        instrument_name: instrumentName,
        start_timestamp: new Date(startTimestamp).getTime(),
        end_timestamp: new Date(endTimestamp).getTime(),
      }, true);
      break;
    }
    case 'getFundingRateValue': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_funding_rate_value', {
        instrument_name: instrumentName,
      }, true);
      break;
    }
    case 'getHistoricalVolatility': {
      const currency = this.getNodeParameter('currency', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_historical_volatility', {
        currency,
      }, true);
      break;
    }
    case 'getIndexPrice': {
      const indexName = this.getNodeParameter('indexName', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_index_price', {
        index_name: indexName,
      }, true);
      break;
    }
    case 'getIndexPriceNames': {
      result = await deribitApiRequest.call(this, 'public/get_index_price_names', {}, true);
      break;
    }
    case 'getInstrument': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_instrument', {
        instrument_name: instrumentName,
      }, true);
      break;
    }
    case 'getInstruments': {
      const currency = this.getNodeParameter('currency', index) as string;
      const kind = this.getNodeParameter('kind', index, '') as string;
      const expired = this.getNodeParameter('expired', index, false) as boolean;
      const params: Record<string, unknown> = { currency, expired };
      if (kind) {
        params.kind = kind;
      }
      result = await deribitApiRequest.call(this, 'public/get_instruments', sanitizeParams(params), true);
      break;
    }
    case 'getLastSettlementsByCurrency': {
      const currency = this.getNodeParameter('currency', index) as string;
      const count = this.getNodeParameter('count', index, 100) as number;
      result = await deribitApiRequest.call(this, 'public/get_last_settlements_by_currency', {
        currency,
        count,
      }, true);
      break;
    }
    case 'getLastTradesByCurrency': {
      const currency = this.getNodeParameter('currency', index) as string;
      const count = this.getNodeParameter('count', index, 100) as number;
      const sorting = this.getNodeParameter('sorting', index, 'desc') as string;
      result = await deribitApiRequest.call(this, 'public/get_last_trades_by_currency', {
        currency,
        count,
        sorting,
      }, true);
      break;
    }
    case 'getLastTradesByInstrument': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const count = this.getNodeParameter('count', index, 100) as number;
      const sorting = this.getNodeParameter('sorting', index, 'desc') as string;
      result = await deribitApiRequest.call(this, 'public/get_last_trades_by_instrument', {
        instrument_name: instrumentName,
        count,
        sorting,
      }, true);
      break;
    }
    case 'getMarkPriceHistory': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const startTimestamp = this.getNodeParameter('startTimestamp', index) as string;
      const endTimestamp = this.getNodeParameter('endTimestamp', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_mark_price_history', {
        instrument_name: instrumentName,
        start_timestamp: new Date(startTimestamp).getTime(),
        end_timestamp: new Date(endTimestamp).getTime(),
      }, true);
      break;
    }
    case 'getOrderBook': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const depth = this.getNodeParameter('depth', index, 10) as number;
      result = await deribitApiRequest.call(this, 'public/get_order_book', {
        instrument_name: instrumentName,
        depth,
      }, true);
      break;
    }
    case 'getTicker': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      result = await deribitApiRequest.call(this, 'public/ticker', {
        instrument_name: instrumentName,
      }, true);
      break;
    }
    case 'getTradingviewChartData': {
      const instrumentName = this.getNodeParameter('instrumentName', index) as string;
      const resolution = this.getNodeParameter('resolution', index) as string;
      const startTimestamp = this.getNodeParameter('startTimestamp', index) as string;
      const endTimestamp = this.getNodeParameter('endTimestamp', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_tradingview_chart_data', {
        instrument_name: instrumentName,
        resolution,
        start_timestamp: new Date(startTimestamp).getTime(),
        end_timestamp: new Date(endTimestamp).getTime(),
      }, true);
      break;
    }
    case 'getVolatilityIndexData': {
      const currency = this.getNodeParameter('currency', index) as string;
      const startTimestamp = this.getNodeParameter('startTimestamp', index) as string;
      const endTimestamp = this.getNodeParameter('endTimestamp', index) as string;
      result = await deribitApiRequest.call(this, 'public/get_volatility_index_data', {
        currency,
        start_timestamp: new Date(startTimestamp).getTime(),
        end_timestamp: new Date(endTimestamp).getTime(),
        resolution: '60',
      }, true);
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  // Handle trades response format
  if (result && typeof result === 'object' && 'trades' in (result as IDataObject)) {
    const trades = (result as { trades: IDataObject[] }).trades;
    return trades.map((trade) => ({ json: trade as IDataObject }));
  }

  // Handle settlements response format
  if (result && typeof result === 'object' && 'settlements' in (result as IDataObject)) {
    const settlements = (result as { settlements: IDataObject[] }).settlements;
    return settlements.map((s) => ({ json: s as IDataObject }));
  }

  const resultArray = Array.isArray(result) ? result : [result];
  return resultArray.map((item) => ({ json: item as IDataObject }));
}
