import { requestOperationData } from "./actions/getOperationData";
import App from "./App";

type SimpleObject = {
  [key: string]: 'buyOrder' | 'sellOrder';
}

const { amount, market, operation, price } = requestOperationData();

const app = new App();

const operation_method = {
  buy: 'buyOrder',
  sell: 'sellOrder',
} as SimpleObject;

const method = operation_method[operation];

app[method]({
  asset_code: market,
  price: + price,
  quantity: + amount,
});