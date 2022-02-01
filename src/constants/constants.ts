import { Connection } from "@solana/web3.js";

// eslint-disable-next-line import/prefer-default-export
export const MAX_ACTIVITIES = 50;
export const url = "https://api.metaplex.solana.com/"; // clusterApiUrl("mainnet-beta");
export const connection = new Connection(url, "finalized");
