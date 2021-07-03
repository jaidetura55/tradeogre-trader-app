import axios, { AxiosInstance } from 'axios'
import tradeogre from '../configs/tradeogre';
import AppError from '../error/AppError';
import { ITOCrypto } from '../models/ITOCrypto';

interface IBalances {
  balances: Record<string, string>
}

interface IAssetInfoResponse extends ITOCrypto {
  btc_price: string;
}

interface ICreateOrderDTO {
  market: string; 
  quantity: number; 
  price: string;
}

class TradeOgre {
  private public_client: AxiosInstance;

  private private_client: AxiosInstance;

  private USDT_BTC = 'USDT-BTC';

  constructor() {
    this.public_client = axios.create({
      baseURL: 'https://' + tradeogre.endpoint
    });

    this.private_client = axios.create({
      baseURL: 'https://' + tradeogre.key + ":" + tradeogre.secret + "@" + tradeogre.endpoint
    });
  } 

  private formatBodyToURL(data: any) {
    const keys = Object.keys(data);

    let formattedBody = '';

    keys.forEach((key, index) => {
      const text = index > 0 ? '&' + key + '=' + data[key] : key + '=' + data[key];

      formattedBody = formattedBody + text;
    });

    return formattedBody;
  }

  private formatNumber(value1: string, value2: string) {
    return (Number(value1) * Number(value2)).toFixed(8)
  }

  private async sellBTCFounds(amount: number) {
    const { price } = await this.getAssetValues(this.USDT_BTC);

    return this.private_client.post('/order/sell', this.formatBodyToURL({
      market: this.USDT_BTC,
      quantity: amount,
      price,
    }));
  }

  /**
   * @description 
   * Check if you got the provided amount of BTC, if you do not, it will 
   * buy the difference between what you have and the value provided.
   * @param amount value to perform the check
   */
  private async checkBTCFounds(amount: number) {
    const balance = await this.getBalances();

    const btc = balance.find(({ market }) => market === 'BTC');

    if (!btc || + btc.balance < amount) {
      const amount_to_buy = amount - Number(btc?.balance || 0);

      const { price } = await this.getAssetValues(this.USDT_BTC);

      return this.private_client.post('/order/buy', this.formatBodyToURL({
        market: this.USDT_BTC,
        quantity: amount_to_buy,
        price,
      }));
    }
  }

  /**
   * @param market_code must be a coin pair, like USDT-BTC or BTC-( Altcoin code )
   * @example 
   * tradeOgre.getAssetValues('BTC-XMR');
   * tradeOgre.getAssetValues('USDT-BTC');
   */
  public async getAssetValues(market_code: string): Promise<IAssetInfoResponse> {
    const { data } = await this.public_client.get<Array<Record<string,ITOCrypto>>>(`markets`);

    const btc = data.find(market => Object.keys(market)[0] === this.USDT_BTC);

    if (!btc) throw new AppError({ message: `Tradeogre API error!` });

    if (market_code === this.USDT_BTC) return {...btc[this.USDT_BTC], btc_price: '1'}

    const asset = data.find(market => Object.keys(market)[0] === market_code);

    if (!asset) throw new AppError({ message: `Wrong asset code provided!` });

    const btc_data = btc[this.USDT_BTC];

    const { high, initialprice, low, price } = asset[market_code];

    const response = {
      low: this.formatNumber(btc_data.price, low),
      high: this.formatNumber(btc_data.price, high),
      price: this.formatNumber(btc_data.price, price),
      initialprice: this.formatNumber(btc_data.price, initialprice),
      btc_price: price,
    };

    return response;
  }

  /**
   * @returns all scheduled order
   */
  public async getOrders() {
    const { data } = await this.private_client.post('/account/orders');
  
    return data;
  }

  /**
   * @returns all asset that you got 
   */
  public async getBalances() {
    const { data: { balances } } = await this.private_client.get<IBalances>(
      '/account/balances'
    );
  
    const balance_markets = Object.keys(balances);
  
    const not_null_balances = balance_markets.filter(market => 
      Number(balances[market]) > 0,
    );
    
    return not_null_balances.map(market => ({
      market,
      balance: balances[market],
    }));
  }

  public async createSellOrder(dto: ICreateOrderDTO) { 
    const { data } = await this.private_client.post('/order/sell', this.formatBodyToURL(dto));

    return data;
  }

  public async createBuyOrder(dto: ICreateOrderDTO) { 
    const { data } = await this.private_client.post('/order/buy', this.formatBodyToURL(dto));

    return data;
  }

  /**
   * @param market USDT-BTC or BTC-( Altcoin code )
   * @description Create an order with the current price provided by the tradeogre API
   */
  public async createImmediateSellOrder({
    market,
    quantity,
  }: Omit<ICreateOrderDTO, `price`>) { 
    const { btc_price } = await this.getAssetValues(market)

    const { data } = await this.private_client.post('/order/sell', this.formatBodyToURL({
      market,
      quantity,
      price: btc_price,
    }));

    if (market !== this.USDT_BTC) {
      await this.sellBTCFounds(+ btc_price * quantity);
    }

    return data;
  }

  /**
   * @description 
   * Create an order with the current price provided by the tradeogre API
   * @summary 
   * Each altcoin is exchanged using BTC, so if there is no BTC enough, 
   * this method will buy the amount needed to finish the order
   * @param market USDT-BTC or BTC-( Altcoin code )
   */
  public async createImmediateBuyOrder({
    market,
    quantity,
  }: Omit<ICreateOrderDTO, `price`>) { 
    const { btc_price } = await this.getAssetValues(market);

    const result = await this.checkBTCFounds(Number(btc_price) * quantity);

    if (market === this.USDT_BTC) return result;

    const { data } = await this.private_client.post('/order/buy', this.formatBodyToURL({
      market,
      quantity,
      price: btc_price,
    }));

    return data;
  }
}

export default TradeOgre;