import App from "./App";

type IOperations = 'buy' | 'sell';

const app = new App();

const operation = process.env.OPERATION as IOperations;

const operation_functions = {
  sell: async () => {
    const asset_code = String(process.env.ASSET_SELL_CODE);
    const price = Number(process.env.ASSET_SELL_PRICE);
    const quantity = Number(process.env.ASSET_SELL_QUANTITY);
  
    console.info(
      `Starting app with parans: 
        asset ${asset_code}, 
        price ${price}, 
        quantity ${quantity}
      `
    );
  
    app.sellOrder({
      asset_code,
      price,
      quantity,
    });
  },
  buy: async () => {
    const asset_code = String(process.env.ASSET_BUY_CODE);
    const price = Number(process.env.ASSET_BUY_PRICE);
    const quantity = Number(process.env.ASSET_BUY_QUANTITY);
  
    console.info(
      `Starting app with parans: 
        asset ${asset_code}, 
        price ${price}, 
        quantity ${quantity}
      `
    );
  
    app.buyOrder({
      asset_code,
      price,
      quantity,
    });
  }
}


const selectd_operation_function = operation_functions[operation];

selectd_operation_function();