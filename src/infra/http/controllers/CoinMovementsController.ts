import { Request, Response } from "express";
import CoinMarketCap from "../../../providers/CoinMarketCap";

export default class CoinMovementsController {
  public async get(request: Request, response: Response): Promise<Response> {
    const { market_movement, date_range, percent } = request.query;
    
    const coinMarketCap = new CoinMarketCap();

    const result = await coinMarketCap.findCryptoByMovement({
      market_movement: market_movement as any,
      date_range: date_range as any,
      percent: Number(percent),
    });

    return response.json(result)
  }
}

