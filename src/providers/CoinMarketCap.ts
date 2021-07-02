import axios, { AxiosInstance } from "axios";
import coinmarketcap from "../configs/coinmarketcap";
import { ICryptoCoin } from "../models/ICryptoCoin";

interface ICryptocurrencyReturn {
  status: string;
  data: Array<ICryptoCoin>;
}

class CoinMarketCap {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: coinmarketcap.endpoint,
      headers: {
        'X-CMC_PRO_API_KEY': coinmarketcap.key,
      },
    });
  }

  public async findCryptoByCode(code: string) {
    const { data } = await this.client.get<ICryptocurrencyReturn>('cryptocurrency/listings/latest');
  
    const asset = data.data.find(({ symbol }) => symbol === code)

    return asset
  }

  public async findFallingCryptosOfTheWeek(percentage: number) {
    const { data } = await this.client.get<ICryptocurrencyReturn>('cryptocurrency/listings/latest');
  
    const asset = data.data.filter(
      ({ quote: { USD } }) => USD.percent_change_7d <= percentage,
    );

    return asset
  }
}

export default CoinMarketCap;