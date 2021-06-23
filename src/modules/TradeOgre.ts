import axios, { AxiosInstance } from 'axios'
import tradeogre from '../configs/tradeogre';

interface IBalances {
  balances: {
    [key: string]: string;
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

  public async getMarkets() {
    const { data } = await this.public_client.get('markets');
 
    return data;
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
}

export default TradeOgre;