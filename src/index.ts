import TradeOgre from "./modules/TradeOgre";

(async () => {
  const tradeOgre = new TradeOgre();

  const balances = await tradeOgre.getBalances();

  console.log(balances);

  // To do!
})()