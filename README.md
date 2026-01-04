# n8n-nodes-deribit

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for **Deribit**, the world's largest cryptocurrency options and derivatives exchange. This node provides full access to Deribit's REST API v2 for trading options, perpetual futures, and futures contracts with up to 50x leverage.

![n8n Version](https://img.shields.io/badge/n8n-community--node-orange)
![Node Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## Features

- **Complete Trading Operations**: Place market, limit, stop-limit, and stop-market orders
- **Options Trading**: Full support for BTC and ETH options with Greeks data
- **Perpetual Futures**: Trade perpetual contracts with up to 50x leverage
- **Portfolio Management**: Monitor positions, margins, and account balances
- **Market Data**: Access real-time order books, tickers, trades, and OHLCV data
- **Block Trading**: Execute and verify block trades for institutional volumes
- **Wallet Management**: Handle deposits, withdrawals, and internal transfers
- **Testnet Support**: Safe testing environment with testnet API
- **Polling Triggers**: React to order fills, position changes, settlements, and more
- **OAuth 2.0 Authentication**: Secure API access with automatic token refresh

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-deribit`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-deribit

# Restart n8n
```

### Development Installation

```bash
# Clone and build
git clone https://github.com/Velocity-BPA/n8n-nodes-deribit.git
cd n8n-nodes-deribit
npm install
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-deribit

# Restart n8n
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| **Client ID** | Your Deribit API client ID |
| **Client Secret** | Your Deribit API client secret |
| **Environment** | Production or Testnet |

### Getting API Credentials

1. Log in to your Deribit account
2. Navigate to **Account** → **API**
3. Click **Add New Key**
4. Set appropriate permissions (read, trade, wallet)
5. Copy the Client ID and Client Secret

> **Note**: Use testnet credentials for development. Get testnet credentials at https://test.deribit.com

## Resources & Operations

### Authentication
| Operation | Description |
|-----------|-------------|
| `auth` | Get access token using client credentials |
| `refreshToken` | Refresh access token |
| `logout` | Invalidate token |
| `forkToken` | Clone session token for multiple connections |

### Account
| Operation | Description |
|-----------|-------------|
| `getAccountSummary` | Get account summary by currency |
| `getPositions` | Get all positions for currency |
| `getPosition` | Get position for specific instrument |
| `getSubaccounts` | List subaccounts |
| `createSubaccount` | Create new subaccount |
| `changeSubaccountName` | Rename subaccount |
| `getTransactionLog` | Get transaction history |
| `getAnnouncements` | Get platform announcements |

### Trading
| Operation | Description |
|-----------|-------------|
| `buy` | Place buy order |
| `sell` | Place sell order |
| `edit` | Modify existing order |
| `cancel` | Cancel order by ID |
| `cancelAll` | Cancel all orders |
| `cancelAllByCurrency` | Cancel all by currency |
| `cancelAllByInstrument` | Cancel all by instrument |
| `cancelByLabel` | Cancel orders by label |
| `closePosition` | Close position for instrument |
| `getMargins` | Calculate margin for order |
| `getOpenOrders` | Get open orders |
| `getOpenOrdersByCurrency` | Get open orders by currency |
| `getOpenOrdersByInstrument` | Get open orders by instrument |
| `getOrderHistory` | Get order history |
| `getOrderState` | Get order status |
| `getUserTradesByCurrency` | Get trades by currency |
| `getUserTradesByInstrument` | Get trades by instrument |
| `getUserTradesByOrder` | Get trades by order |

### Market Data
| Operation | Description |
|-----------|-------------|
| `getBookSummaryByCurrency` | Get order book summary |
| `getBookSummaryByInstrument` | Get book for instrument |
| `getContractSize` | Get contract size |
| `getCurrencies` | Get supported currencies |
| `getDeliveryPrices` | Get delivery prices |
| `getFundingChartData` | Get funding rate chart |
| `getFundingRateHistory` | Get funding rate history |
| `getFundingRateValue` | Get current funding rate |
| `getHistoricalVolatility` | Get historical volatility |
| `getIndexPrice` | Get index price |
| `getIndexPriceNames` | Get index names |
| `getInstrument` | Get instrument details |
| `getInstruments` | Get all instruments |
| `getLastSettlementsByCurrency` | Get settlements |
| `getLastTradesByCurrency` | Get recent trades |
| `getLastTradesByInstrument` | Get trades for instrument |
| `getMarkPriceHistory` | Get mark price history |
| `getOrderBook` | Get order book |
| `getTicker` | Get ticker for instrument |
| `getTradingviewChartData` | Get OHLCV data |
| `getVolatilityIndexData` | Get volatility index |

### Options
| Operation | Description |
|-----------|-------------|
| `getOptionMarkPrices` | Get option mark prices |
| `getOptionSummary` | Get option summary data |

### Portfolio
| Operation | Description |
|-----------|-------------|
| `getPortfolioMargins` | Get portfolio margin info |
| `simulatePortfolio` | Simulate portfolio changes |

### Wallet
| Operation | Description |
|-----------|-------------|
| `getDeposits` | Get deposit history |
| `getWithdrawals` | Get withdrawal history |
| `withdraw` | Request withdrawal |
| `cancelWithdrawal` | Cancel pending withdrawal |
| `getTransfers` | Get internal transfers |
| `createTransfer` | Transfer between accounts |

### Block Trade
| Operation | Description |
|-----------|-------------|
| `getBlockTrades` | Get block trade history |
| `executeBlockTrade` | Execute block trade |
| `verifyBlockTrade` | Verify block trade |
| `invalidateBlockTradeSignature` | Invalidate signature |

### Combo
| Operation | Description |
|-----------|-------------|
| `getCombos` | Get combo instruments |
| `createCombo` | Create combo order |

### Public
| Operation | Description |
|-----------|-------------|
| `getTime` | Get server time |
| `test` | Test API connectivity |
| `status` | Get exchange status |

## Trigger Node

The **Deribit Trigger** node provides poll-based triggers for trading events:

| Trigger | Description |
|---------|-------------|
| `newOrder` | Fires when a new order is placed |
| `orderFilled` | Fires when an order is executed |
| `orderCanceled` | Fires when an order is canceled |
| `positionChanged` | Fires when a position is updated |
| `priceAlert` | Fires when price crosses a threshold |
| `settlementOccurred` | Fires on settlement events |
| `fundingRateChanged` | Fires when funding rate updates |

## Usage Examples

### Place a Limit Order

```javascript
// Buy 0.1 BTC perpetual at $50,000
{
  "resource": "trading",
  "operation": "buy",
  "instrumentName": "BTC-PERPETUAL",
  "amount": 0.1,
  "type": "limit",
  "price": 50000,
  "timeInForce": "good_til_cancelled"
}
```

### Get Option Chain

```javascript
// Get all BTC options expiring in June
{
  "resource": "marketData",
  "operation": "getInstruments",
  "currency": "BTC",
  "kind": "option",
  "expired": false
}
```

### Monitor Portfolio

```javascript
// Get current BTC positions and margins
{
  "resource": "account",
  "operation": "getAccountSummary",
  "currency": "BTC",
  "extended": true
}
```

## Deribit Concepts

### Instrument Names

| Format | Example | Description |
|--------|---------|-------------|
| Perpetual | `BTC-PERPETUAL` | Perpetual futures contract |
| Future | `BTC-28JUN24` | Futures expiring June 28, 2024 |
| Option | `BTC-28JUN24-50000-C` | Call option, $50K strike, June expiry |

### Order Types

| Type | Description |
|------|-------------|
| `limit` | Executes at specified price or better |
| `market` | Executes immediately at market price |
| `stop_limit` | Limit order triggered at stop price |
| `stop_market` | Market order triggered at stop price |

### Time in Force

| Option | Description |
|--------|-------------|
| `good_til_cancelled` | Remains until filled or cancelled |
| `fill_or_kill` | Fill entire order immediately or cancel |
| `immediate_or_cancel` | Fill what's possible immediately |

## Networks

| Network | API URL | Description |
|---------|---------|-------------|
| Production | `https://www.deribit.com/api/v2` | Live trading |
| Testnet | `https://test.deribit.com/api/v2` | Paper trading |

## Error Handling

The node handles Deribit API errors with descriptive messages:

| Code | Description |
|------|-------------|
| `10000` | Authorization required |
| `10001` | Not enough balance |
| `10009` | Rate limit exceeded |
| `10028` | Invalid order parameters |
| `11044` | Order not found |
| `11050` | Invalid instrument |

## Security Best Practices

1. **Use testnet first**: Test all workflows on testnet before production
2. **Limit API permissions**: Only grant necessary permissions to API keys
3. **Use IP whitelisting**: Restrict API access to known IPs
4. **Store credentials securely**: Use n8n's credential encryption
5. **Monitor activity**: Review API activity regularly in Deribit dashboard

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Watch mode
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`npm test`)
- Code is linted (`npm run lint`)
- Documentation is updated

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-deribit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-deribit/discussions)
- **Deribit API Docs**: [docs.deribit.com](https://docs.deribit.com)

## Acknowledgments

- [Deribit](https://www.deribit.com) for their comprehensive API
- [n8n](https://n8n.io) for the automation platform
- [Velocity BPA](https://velobpa.com) for development and maintenance
