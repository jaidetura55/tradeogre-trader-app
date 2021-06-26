import axios, { AxiosInstance } from 'axios'
import tradeogre from '../configs/tradeogre';

interface IBalances {
  balances: {
    [key: string]: string;
  }
}

interface IAssetData {
  initialprice: string;
  price: string;
  high: string;
  low: string;
}

interface IMarketsResponse {
  [key: string]: IAssetData
}

interface IGetAssetInfoResponse extends IAssetData {
  usd_price: string;
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

  private async getBTCFoundsBeforeBuyOrder(value: number) {
    const balance = await this.getBalances();

    const btc = balance.find(({ market }) => 'BTC');

    if (!btc || +btc.balance < value) {
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
   * @param code can be any altcoin in pair with BTC or USDT-BTC
   * @example tradeOgre.getAssetInfo('BTC-XMR');
   * @example tradeOgre.getAssetInfo('USDT-BTC');
   */
  public async getAssetInfo(code: string): Promise<IGetAssetInfoResponse> {
    const { data } = await this.public_client.get<Array<IMarketsResponse>>(`markets`);

    const btc = data.find(market => Object.keys(market)[0] === this.btc_code);

    if (!btc) throw new Error(`Tradeogre API error!`);

    if (code === this.btc_code) 
      return {
        ...btc[this.btc_code], 
        usd_price: btc[this.btc_code].price
      }

    const asset = data.find(market => Object.keys(market)[0] === code);

    if (!asset) throw new Error(`Wrong asset code provided!`);

    const asset_data = asset[code];

    const { price } = btc[this.btc_code];

    const response = {
      ...asset_data, 
      usd_price: this.formatNumber(+price * +asset_data.price)
    };

    return response;
  }

  /**
   * 
   * @returns all scheduled order
   */
  public async getOrders() {
    const { data } = await this.private_client.post('/account/orders');
  
    return data;
  }

  /**
   * 
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
   * Create an order with the current price provided by the tradeogre API
   */
  public async createImmediateSellOrder({
    market,
    quantity,
  }: Omit<ICreateOrderDTO, `price`>) { 
    const { price } = await this.getAssetInfo(market)

    const { data } = await this.private_client.post('/order/sell', this.formatBody({
      market,
      quantity,
      price,
    }));

    return data;
  }

  /**
   * Create an order with the current price provided by the tradeogre API
   * Each tradeogre coin is exchanged using BTC, so if there is no BTC enough, this method will buy the amount needed to finish the order
   */
  public async createImmediateBuyOrder({
    market,
    quantity,
  }: Omit<ICreateOrderDTO, `price`>) { 
    const { price } = await this.getAssetInfo(market);

    await this.getBTCFoundsBeforeBuyOrder(+price * quantity);

    const { data } = await this.private_client.post('/order/buy', this.formatBody({
      market,
      quantity,
      price,
    }));

    return data;
  }
}

export default TradeOgre;