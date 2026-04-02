/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Deribit } from '../nodes/Deribit/Deribit.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Deribit Node', () => {
  let node: Deribit;

  beforeAll(() => {
    node = new Deribit();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Deribit');
      expect(node.description.name).toBe('deribit');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Authentication Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key', 
        baseUrl: 'https://www.deribit.com/api/v2' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  test('authenticate operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('authenticate')
      .mockReturnValueOnce('client_credentials')
      .mockReturnValueOnce('test-client-id')
      .mockReturnValueOnce('test-client-secret');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      access_token: 'test-token',
      token_type: 'bearer'
    });

    const result = await executeAuthenticationOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.access_token).toBe('test-token');
  });

  test('logout operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('logout')
      .mockReturnValueOnce(true);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      result: 'ok'
    });

    const result = await executeAuthenticationOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('ok');
  });

  test('getAccessLog operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccessLog')
      .mockReturnValueOnce(50)
      .mockReturnValueOnce(0);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      result: { logs: [] }
    });

    const result = await executeAuthenticationOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result.logs).toEqual([]);
  });

  test('changeApiKeyName operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('changeApiKeyName')
      .mockReturnValueOnce('key-id-123')
      .mockReturnValueOnce('new-key-name');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      result: 'ok'
    });

    const result = await executeAuthenticationOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('ok');
  });

  test('getAccountSummary operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccountSummary')
      .mockReturnValueOnce('BTC')
      .mockReturnValueOnce(false);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      result: { currency: 'BTC', balance: 1.5 }
    });

    const result = await executeAuthenticationOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result.currency).toBe('BTC');
  });

  test('error handling with continueOnFail', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('authenticate');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeAuthenticationOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Instruments Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://www.deribit.com/api/v2' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getInstruments operation', () => {
    it('should successfully get instruments', async () => {
      const mockResponse = { 
        result: [{ 
          instrument_name: 'BTC-PERPETUAL',
          kind: 'future',
          currency: 'BTC',
        }] 
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getInstruments')
        .mockReturnValueOnce('BTC')
        .mockReturnValueOnce('future')
        .mockReturnValueOnce(false);
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeInstrumentsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/public/get_instruments'),
        headers: { 'Content-Type': 'application/json' },
        json: true,
      });
    });

    it('should handle errors in getInstruments operation', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getInstruments')
        .mockReturnValueOnce('BTC')
        .mockReturnValueOnce('future')
        .mockReturnValueOnce(false);
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];

      await expect(
        executeInstrumentsOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('API Error');
    });
  });

  describe('getInstrument operation', () => {
    it('should successfully get instrument details', async () => {
      const mockResponse = { 
        result: { 
          instrument_name: 'BTC-PERPETUAL',
          kind: 'future',
          currency: 'BTC',
        } 
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getInstrument')
        .mockReturnValueOnce('BTC-PERPETUAL');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeInstrumentsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getOrderBook operation', () => {
    it('should successfully get order book', async () => {
      const mockResponse = { 
        result: { 
          bids: [[50000, 1.5]],
          asks: [[50100, 2.0]],
        } 
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getOrderBook')
        .mockReturnValueOnce('BTC-PERPETUAL')
        .mockReturnValueOnce(10);
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeInstrumentsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTicker operation', () => {
    it('should successfully get ticker information', async () => {
      const mockResponse = { 
        result: { 
          instrument_name: 'BTC-PERPETUAL',
          last_price: 50000,
          best_bid_price: 49999,
          best_ask_price: 50001,
        } 
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTicker')
        .mockReturnValueOnce('BTC-PERPETUAL');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeInstrumentsOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Orders Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://www.deribit.com/api/v2' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('createBuyOrder', () => {
    it('should create a buy order successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createBuyOrder')
        .mockReturnValueOnce('BTC-PERPETUAL')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce('limit')
        .mockReturnValueOnce(50000)
        .mockReturnValueOnce('good_til_cancelled')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce('test-order');

      const mockResponse = {
        result: {
          order: {
            order_id: '123',
            instrument_name: 'BTC-PERPETUAL',
            amount: 100
          }
        }
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrdersOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://www.deribit.com/api/v2/private/buy'
        })
      );
    });

    it('should handle createBuyOrder errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('createBuyOrder');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeOrdersOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('cancelOrder')
        .mockReturnValueOnce('order-123');

      const mockResponse = {
        result: {
          order: {
            order_id: 'order-123',
            order_state: 'cancelled'
          }
        }
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrdersOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getOpenOrders', () => {
    it('should get open orders successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getOpenOrders')
        .mockReturnValueOnce('BTC')
        .mockReturnValueOnce('future')
        .mockReturnValueOnce('all');

      const mockResponse = {
        result: [
          {
            order_id: '123',
            instrument_name: 'BTC-PERPETUAL',
            amount: 100
          }
        ]
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOrdersOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Positions Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://www.deribit.com/api/v2',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	test('getPositions operation should succeed', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
			switch (paramName) {
				case 'operation': return 'getPositions';
				case 'currency': return 'BTC';
				case 'kind': return 'future';
				default: return undefined;
			}
		});

		const mockResponse = { result: [{ instrument_name: 'BTC-PERPETUAL', size: 100 }] };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executePositionsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual(mockResponse);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: expect.stringContaining('/private/get_positions'),
			headers: expect.objectContaining({
				'Authorization': 'Bearer test-key',
			}),
			json: true,
		});
	});

	test('getPosition operation should succeed', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
			switch (paramName) {
				case 'operation': return 'getPosition';
				case 'instrumentName': return 'BTC-PERPETUAL';
				default: return undefined;
			}
		});

		const mockResponse = { result: { instrument_name: 'BTC-PERPETUAL', size: 100 } };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executePositionsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual(mockResponse);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: expect.stringContaining('/private/get_position'),
			headers: expect.objectContaining({
				'Authorization': 'Bearer test-key',
			}),
			json: true,
		});
	});

	test('getUserTradesByCurrency operation should succeed', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
			switch (paramName) {
				case 'operation': return 'getUserTradesByCurrency';
				case 'currency': return 'BTC';
				case 'count': return 10;
				default: return undefined;
			}
		});

		const mockResponse = { result: { trades: [] } };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executePositionsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual(mockResponse);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: expect.stringContaining('/private/get_user_trades_by_currency'),
			headers: expect.objectContaining({
				'Authorization': 'Bearer test-key',
			}),
			json: true,
		});
	});

	test('should handle API errors gracefully', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
			switch (paramName) {
				case 'operation': return 'getPositions';
				case 'currency': return 'BTC';
				default: return undefined;
			}
		});

		const mockError = new Error('API Error');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executePositionsOperations.call(mockExecuteFunctions, [{ json: {} }]);
		
		expect(result).toHaveLength(1);
		expect(result[0].json.error).toEqual('API Error');
	});

	test('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
			switch (paramName) {
				case 'operation': return 'getPositions';
				case 'currency': return 'BTC';
				default: return undefined;
			}
		});

		const mockError = new Error('API Error');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);

		await expect(executePositionsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
	});
});

describe('Wallet Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://www.deribit.com/api/v2' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get account summary successfully', async () => {
    const mockResponse = { result: { equity: 1000, balance: 950 } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getAccountSummary';
        case 'currency': return 'BTC';
        case 'extended': return false;
        default: return null;
      }
    });

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://www.deribit.com/api/v2/private/get_account_summary?currency=BTC',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  it('should handle errors when getting account summary fails', async () => {
    const error = new Error('API Error');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getAccountSummary';
        case 'currency': return 'BTC';
        case 'extended': return false;
        default: return null;
      }
    });

    await expect(executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });

  it('should submit transfer to subaccount successfully', async () => {
    const mockResponse = { result: { id: 'transfer_123', status: 'confirmed' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'submitTransferToSubaccount';
        case 'currency': return 'BTC';
        case 'amount': return 0.1;
        case 'destination': return 'subaccount_1';
        default: return null;
      }
    });

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://www.deribit.com/api/v2/private/submit_transfer_to_subaccount',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      body: {
        currency: 'BTC',
        amount: 0.1,
        destination: 'subaccount_1',
      },
      json: true,
    });
  });

  it('should handle errors when transfer fails', async () => {
    const error = new Error('Transfer failed');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'submitTransferToSubaccount';
        case 'currency': return 'BTC';
        case 'amount': return 0.1;
        case 'destination': return 'subaccount_1';
        default: return null;
      }
    });

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'Transfer failed' }, pairedItem: { item: 0 } }]);
  });
});

describe('MarketData Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://www.deribit.com/api/v2' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get book summary by currency successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBookSummaryByCurrency')
      .mockReturnValueOnce('BTC')
      .mockReturnValueOnce('future');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      result: [{ instrument_name: 'BTC-PERPETUAL', volume: 123.45 }]
    });

    const result = await executeMarketDataOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('result');
  });

  it('should get book summary by instrument successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBookSummaryByInstrument')
      .mockReturnValueOnce('BTC-PERPETUAL');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      result: { volume: 123.45 }
    });

    const result = await executeMarketDataOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('result');
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getIndex');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeMarketDataOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('error', 'API Error');
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getIndex');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(
      executeMarketDataOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('API Error');
  });
});
});
