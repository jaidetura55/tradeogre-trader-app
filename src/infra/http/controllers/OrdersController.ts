import { Request, Response } from "express";

export default class OrdersController {
  public async create(request: Request, response: Response): Promise<Response> {
    return response.json({ status: 200 })
  }
}

