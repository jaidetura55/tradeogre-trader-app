# tradeogre-trader-app
I am building an app to automatically perform crypto trades using the TradeOgre API

## Issues that the app solves
- Currently, the platform TradeOgre only performs trades using altcoins in pair with BTC, 
so there is no way to schedule trades orders taking the USD price as reference.

- In moments of bear marketing, regardless we schedule an order to sell our altcoins, the
tradeogre platform only performs altcoins transactions to the BTC pair, so putting a scheduled
order won't get your money safe from BTC prices fall.

- To create altcoins sell orders, you must have the equivalence amount in BTC, what means you 
can't left your money safe using an stable coin.

### What the app currently does
- Scheduling orders using the USD price by watching the USDT-BTC pair.
- Performing altcoins orders using your USDT amount.
- Scheduling orders of altcoin sale and convert the amount to USDT.

  <div>
    <img src="https://github.com/robertokbr/tradeogre-trader-app/blob/master/.Github/schedule.gif" />
  </div>

### To do
- Implement pump and dump function
- Implement multiple orders in the same process

