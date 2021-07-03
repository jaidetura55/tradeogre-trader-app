import { app } from "./app";
import 'dotenv/config';

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server initialized on PORT ${PORT}`)
})

const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

exitSignals.forEach(sign => {
  process.on(sign, () => {
    console.info(`\nClosing server...`);
  
    server.close();
  
    process.exit(0);
  });
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    `App closing due to ${reason} with the unhandled promise ${promise}`
  );

  process.exit(1)
})

process.on('uncaughtException', error => {
  console.error(`App exiting dua to an uncaught exception: ${error}`);

  process.exit(1)
});
