# n8n-nodes-deribit

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for integrating with Deribit's cryptocurrency derivatives exchange. This node provides access to 6 core resources including authentication, instruments, orders, positions, wallet operations, and real-time market data, enabling automated trading strategies and portfolio management workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Deribit API](https://img.shields.io/badge/Deribit-API%20v2-orange)
![Crypto Trading](https://img.shields.io/badge/Crypto-Trading-gold)
![WebSocket](https://img.shields.io/badge/WebSocket-Supported-green)

## Features

- **Complete Trading Operations** - Execute buy/sell orders, modify positions, and manage your trading portfolio
- **Real-time Market Data** - Access live prices, order books, trade history, and market statistics
- **Portfolio Management** - Monitor positions, calculate P&L, and track wallet balances across currencies
- **Advanced Order Types** - Support for limit, market, stop-loss, and conditional orders
- **Instrument Discovery** - Query available trading pairs, contract specifications, and expiration dates
- **Risk Management** - Built-in position sizing, margin calculations, and exposure monitoring
- **WebSocket Integration** - Real-time streaming data for price feeds and order updates
- **Multi-Currency Support** - Handle Bitcoin, Ethereum, and other supported cryptocurrencies

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-deribit`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-deribit
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-deribit.git
cd n8n-nodes-deribit
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-deribit
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| Client ID | Your Deribit API client identifier | Yes |
| Client Secret | Your Deribit API client secret key | Yes |
| Environment | Production or Test environment | Yes |
| Scope | API permissions (read, trade, wallet) | Yes |

## Resources & Operations

### 1. Authentication

| Operation | Description |
|-----------|-------------|
| Get Access Token | Generate OAuth2 access token for API authentication |
| Refresh Token | Refresh expired access token using refresh token |
| Logout | Invalidate current session and revoke access token |
| Get Time | Retrieve server timestamp for synchronization |

### 2. Instruments

| Operation | Description |
|-----------|-------------|
| Get Instruments | List all available trading instruments |
| Get Instrument | Get detailed information about specific instrument |
| Get Currencies | Retrieve supported currencies and their properties |
| Get Index Price | Get current index price for underlying assets |
| Get Mark Price | Retrieve mark price used for margin calculations |

### 3. Orders

| Operation | Description |
|-----------|-------------|
| Buy | Place a buy order with specified parameters |
| Sell | Place a sell order with specified parameters |
| Edit | Modify existing order price, quantity, or parameters |
| Cancel | Cancel single order by order ID |
| Cancel All | Cancel all open orders for instrument or account |
| Get Order State | Retrieve current status and details of specific order |
| Get Open Orders | List all currently open orders |
| Get Order History | Get historical order data with filtering options |

### 4. Positions

| Operation | Description |
|-----------|-------------|
| Get Positions | Retrieve all current positions |
| Get Position | Get detailed information about specific position |
| Change Position | Modify position size or close position |
| Get New Announcements | Get position-related announcements and updates |

### 5. Wallet

| Operation | Description |
|-----------|-------------|
| Get Account Summary | Retrieve complete account balance and summary |
| Get Subaccounts | List all subaccounts and their details |
| Create Subaccount | Create new subaccount with specified name |
| Get Deposits | Retrieve deposit history and pending deposits |
| Get Withdrawals | Get withdrawal history and status |
| Withdraw | Initiate cryptocurrency withdrawal |
| Get Transfer | Get internal transfer details |
| Submit Transfer | Execute transfer between accounts |

### 6. MarketData

| Operation | Description |
|-----------|-------------|
| Get Order Book | Retrieve current order book for specified instrument |
| Get Last Trades | Get recent trade history for instrument |
| Get Trade Volumes | Retrieve trading volume statistics |
| Get Ticker | Get ticker information including prices and volume |
| Get Historical Volatility | Retrieve historical volatility data |
| Get Funding Chart Data | Get funding rate chart data for perpetuals |
| Get Volatility Index | Retrieve volatility index values |

## Usage Examples

```javascript
// Place a buy order for Bitcoin perpetual
{
  "instrument_name": "BTC-PERPETUAL",
  "amount": 10,
  "type": "limit",
  "price": 45000,
  "label": "my_order_001"
}
```

```javascript
// Get current positions
{
  "currency": "BTC",
  "kind": "future"
}
```

```javascript
// Retrieve order book data
{
  "instrument_name": "ETH-PERPETUAL",
  "depth": 20
}
```

```javascript
// Check account balance
{
  "currency": "BTC",
  "extended": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 10009 | Invalid API key or signature | Verify credentials and check client ID/secret |
| 10011 | Invalid instrument name | Use Get Instruments to verify available trading pairs |
| 10012 | Insufficient funds | Check account balance before placing orders |
| 11029 | Order not found | Verify order ID exists and belongs to your account |
| 11035 | Position not found | Check if position exists for specified instrument |
| 13004 | Price too high/low | Adjust price within allowed trading range |

## Development

```bash
npm install
npm run build
npm test
npm run lint
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

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-deribit/issues)
- **Deribit API Documentation**: [docs.deribit.com](https://docs.deribit.com)
- **Deribit Community**: [Deribit Community Forum](https://www.deribit.com/main#/community)