import axios, { AxiosInstance } from "axios";
import coinmarketcap from "../configs/coinmarketcap";
import AppError from "../error/AppError";
import { ICMCCrypto } from "../models/ICMCCrypto";

type IDateRange = `percent_change_24h` | `percent_change_7d` | `percent_change_30d`

interface ICryptocurrencyReturn {
  status: string;
  data: Array<ICMCCrypto>;
}

export interface IFindCryptoByMarketMovementDTO {
  market_movement: 'down' | 'up'
  date_range: `day` | `week` | `month`
  percent: number
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

  public async findCryptoByMovement({ market_movement ,percent, date_range }: IFindCryptoByMarketMovementDTO) {  
    const date_range_correspondence = {
      day: `percent_change_24h`,
      week: `percent_change_7d`,
      month: `percent_change_30d`
    }

    const percent_change_range = date_range_correspondence[date_range] as IDateRange

    if (!percent_change_range) {
      throw new AppError({
        description: 'Wrong request params',
        message: 'You must provide the right params',
        documentation: {
          market_movement: ['down', 'up'],
          date_range: [`day` , `week` , `month`],
          percent: "number"
        }
      });
    }

    const { data } = await this.client.get<ICryptocurrencyReturn>(
      'cryptocurrency/listings/latest'
    );

    const asset = data.data.filter(
      ({ quote: { USD } }) => 
        market_movement === 'down' 
        ? USD[percent_change_range] <= percent 
        : USD[percent_change_range] >= percent
    );

    return asset
  }
}

export default CoinMarketCap;