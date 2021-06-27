import readlineSync from "readline-sync";
import { greenText } from "../logger/styles";

export const requestOperationData = () => {
  const operations = [`buy`, `sell`];

  const op_choosed = readlineSync.keyInSelect(
    operations, 
    greenText(`📊 Which operation do you want to perform\n >> `),
  );

  if (op_choosed === -1) {
    console.info(`⏳ Closing application...`)

    process.exit();
  }

  const market = readlineSync.question(
    greenText(
      `🛒 Input the order market.\nEx: BTC-ARRR, USDT-BTC...\n >> `
    ),
  );

  const price = readlineSync.question(
    greenText(
      `💸 Imput the asset target price.\n >> `
    ),
  );

  const amount = readlineSync.question(
    greenText(
      `💰 Imput the amount.\n >> `
    ),
  );
 
  return { operation: operations[op_choosed] ,market, price, amount }
}