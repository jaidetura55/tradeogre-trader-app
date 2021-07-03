import axios, { AxiosInstance } from 'axios'
import tradeogre from '../configs/tradeogre';
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

  private btc_code = 'USDT-BTC';

  constructor() {
    this.public_client = axios.create({
      baseURL: 'https://' + tradeogre.endpoint
    });

    this.private_client = axios.create({
      baseURL: 'https://' + tradeogre.key + ":" + tradeogre.secret + "@" + tradeogre.endpoint
    });
  } 

  private formatBody(data: any) {
    const keys = Object.keys(data);

    let formatedBody = '';

    keys.forEach((key, index) => {
      const text = index > 0 ? '&' + key + '=' + data[key] : key + '=' + data[key];

      formatedBody = formatedBody + text;
    });

    return formatedBody;
  }

  private formatNumber(value: number) {
    return value.toFixed(8)
  }

  private async sellBTCFounds(amount: number) {
    const { price } = await this.getAssetInfo(this.btc_code);

    return this.private_client.post('/order/sell', this.formatBody({
      market: this.btc_code,
      quantity: amount,
      price,
    }));
  }

  private async getBTCFounds(value: number) {
    const balance = await this.getBalances();

    const btc = balance.find(({ market }) => market === 'BTC');

    if (!btc || + btc.balance < value) {
      const amount_to_buy = value - Number(btc?.balance || 0);

      const { price } = await this.getAssetInfo(this.btc_code);

      return this.private_client.post('/order/buy', this.formatBody({
        market: this.btc_code,
        quantity: amount_to_buy,
        price,
      }));
    }
  }

  /**
   * @param market_code USDT-BTC or BTC- + Altcoin code
   * @example tradeOgre.getAssetInfo('BTC-XMR');
   * @example tradeOgre.getAssetInfo('USDT-BTC');
   */
  public async getAssetInfo(market_code: string): Promise<IAssetInfoResponse> {
    const { data } = await this.public_client.get<Array<Record<string,ITOCrypto>>>(`markets`);

    const btc = data.find(market => Object.keys(market)[0] === this.btc_code);

    if (!btc) throw new Error(`Tradeogre API error!`);

    if (market_code === this.btc_code) return {...btc[this.btc_code], btc_price: '1'}

    const asset = data.find(market => Object.keys(market)[0] === market_code);

    if (!asset) throw new Error(`Wrong asset code provided!`);

    const btc_data = btc[this.btc_code];

    const { high, initialprice, low, price } = asset[market_code];

    const response = {
      low:  this.formatNumber(+btc_data.price * +low),
      high: this.formatNumber(+btc_data.price * +high),
      price: this.formatNumber(+btc_data.price * +price),
      initialprice:  this.formatNumber(+btc_data.price * +initialprice),
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
    const { data } = await this.private_client.post('/order/sell', this.formatBody(dto));

    return data;
  }

  public async createBuyOrder(dto: ICreateOrderDTO) { 
    const { data } = await this.private_client.post('/order/buy', this.formatBody(dto));

    return data;
  }

  /**
   * @param market USDT-BTC or BTC- + Altcoin code
   * @description Create an order with the current price provided by the tradeogre API
   */
  public async createImmediateSellOrder({
    market,
    quantity,
  }: Omit<ICreateOrderDTO, `price`>) { 
    const { btc_price } = await this.getAssetInfo(market)

    const { data } = await this.private_client.post('/order/sell', this.formatBody({
      market,
      quantity,
      price: btc_price,
    }));

    if (market !== this.btc_code) {
      await this.sellBTCFounds(+ btc_price * quantity);
    }

    return data;
  }

  /**
   * @param market USDT-BTC or BTC + Altcoin code
   * @description Create an order with the current price provided by the tradeogre API
   * @summary Each altcoin is exchanged using BTC, so if there is no BTC enough, this method will buy the amount needed to finish the order
   */
  public async createImmediateBuyOrder({
    market,
    quantity,
  }: Omit<ICreateOrderDTO, `price`>) { 
    const { btc_price } = await this.getAssetInfo(market);

    const result = await this.getBTCFounds(+btc_price * quantity);

    if (market === this.btc_code) return result;

    const { data } = await this.private_client.post('/order/buy', this.formatBody({
      market,
      quantity,
      price: btc_price,
    }));

    return data;
  }
}

export default TradeOgre;