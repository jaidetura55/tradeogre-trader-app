import App from "./App";

const app = new App();

const asset_code = String(process.env.ASSET_CODE);
const price = Number(process.env.ASSET_PRICE);
const quantity = Number(process.env.ASSET_QUANTITY);

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
