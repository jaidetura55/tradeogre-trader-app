import axios, { AxiosInstance } from 'axios'
import tradeogre from '../configs/tradeogre';

interface IBalances {
  balances: {
    [key: string]: string;
  }
}

interface IAsset {
  [key: string]: {
    price: number;
    usd_price: string;
  }
}

interface ICreateSellOrderDTO {
  market: string; 
  quantity: number; 
  price: number;
}

class TradeOgre {
  private public_client: AxiosInstance;

  private private_client: AxiosInstance;

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

  public async getAssetInfo(code: string) {
    const { data } = await this.public_client.get<Array<IAsset>>(`markets`);

    const btc = data.find(market => Object.keys(market)[0] === 'USDT-BTC');

    const asset = data.find(market => Object.keys(market)[0] === code);

    if (!asset || !btc) 
      throw new Error(`Wrong asset code provided!`);

    const asset_data = asset[code];

    const btc_data = btc['USDT-BTC'];

    Object.assign(asset_data, {
      usd_price: (btc_data.price * asset_data.price).toFixed(8),
    });

    return asset_data;
  }

  public async getOrders() {
    const { data } = await this.private_client.post('/account/orders');
  
    return data;
  }

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

  public async createSellOrder(dto: ICreateSellOrderDTO) { 
    const { data } = await this.private_client.post('/order/sell', this.formatBody(dto));

    return data;
  }

  public async createImmediateSellOrder({
    market,
    quantity,
  }: Omit<ICreateSellOrderDTO, `price`>) { 
    const { price } = await this.getAssetInfo(market)

    const { data } = await this.private_client.post('/order/sell', this.formatBody({
      market,
      quantity,
      price,
    }));

    return data;
  }

  public async createImmediateBuyOrder({
    market,
    quantity,
  }: Omit<ICreateSellOrderDTO, `price`>) { 
    const { price } = await this.getAssetInfo(market)

    const { data } = await this.private_client.post('/order/buy', this.formatBody({
      market,
      quantity,
      price,
    }));

    return data;
  }
}

export default TradeOgre;