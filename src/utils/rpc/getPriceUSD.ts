// @ts-ignore
import * as CoinGecko from "coingecko-api";

const COIN_ID = "solana";
const CoinGeckoClient = new CoinGecko();

export interface CoinInfo {
  price: number;
  last_updated: Date;
}

export interface CoinInfoResult {
  data: {
    market_data: {
      current_price: {
        usd: number;
      };
    };
    last_updated: string;
  };
}

export async function getPriceUSD(): Promise<CoinInfo | undefined> {
  let coinInfo;

  await CoinGeckoClient.coins
    .fetch(COIN_ID)
    .then((info: CoinInfoResult) => {
      coinInfo = {
        price: info.data.market_data.current_price.usd,
        last_updated: new Date(info.data.last_updated),
      };
    })
    .catch((error: any) => {
      console.error("getPriceUSD error:", error);
    });

  // console.log("getPriceUSD coinInfo:", coinInfo);
  return coinInfo;
}
