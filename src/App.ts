import TradeOgre from "./providers/TradeOgre";
import { format } from 'date-fns';

interface IRequest {
  price: number;
  asset_code: string;
  quantity: number;
}

class App {
  private exchange: TradeOgre;

  constructor() {
    this.exchange = new TradeOgre();
  }

  private async timer() {
    return new Promise(resolve => setTimeout(resolve, 60000));
  }

  public async sellOrder({
    asset_code,
    quantity,
    price,
  }: IRequest) {
    console.info(`Method sellOrder initialized 🚀\n`);

    const target_price = price;
  
    let is_price_bellow_target = true;
  
    let asset_current_price: number;
  
    while (is_price_bellow_target) {
      asset_current_price = Number((await this.exchange.getAssetInfo(asset_code)).usd_price);
  
      console.info(
        `📈 ${asset_code} current price: ${asset_current_price}, time: ${format(new Date(), 'HH:mm')}\n`
      );
  
      if (asset_current_price >= target_price) {
        console.info(`💸 Selling ${quantity} ${asset_code} with the price: ${asset_current_price}\n`);
  
        const result = await this.exchange.createImmediateSellOrder({
          market: asset_code,
          quantity,
        })  
    
        console.info(result);
    
        is_price_bellow_target = false;

        return;
      }
  
      console.info(`⌛ awaiting for new prices...\n`)
  
      await this.timer();
    }
  }

  public async buyOrder({
    asset_code,
    quantity,
    price,
  }: IRequest) {
    console.info(`Method buyOrder initialized 🚀\n`);

    const target_price = price;
  
    let is_price_above_target = true;
  
    let asset_current_price: number;
  
    while (is_price_above_target) {
      asset_current_price = Number((await this.exchange.getAssetInfo(asset_code)).usd_price);
  
      console.info(
        `📈 ${asset_code} current price: ${asset_current_price}, time: ${format(new Date(), 'HH:mm')}\n`
      );
  
      if (asset_current_price <= target_price) {
        console.info(`💸 Buying ${quantity} ${asset_code} with the price: ${asset_current_price}\n`);
  
        const result = await this.exchange.createImmediateBuyOrder({
          market: asset_code,
          quantity,
        })  
    
        console.info(result);
    
        is_price_above_target = false;

        return;
      }
  
      console.info(`⌛ awaiting for new prices...\n`)
  
      await this.timer();
    }
  }
}

export default App;