import { ParsedMessageAccount } from "@solana/web3.js";
import ActivityType from "./enums/ActivityType";

type Activity = {
  activityType: ActivityType;
  doneByAddress?: string;
  doneToAddress?: string;
  priceInCrypto?: string;
  priceInUSD?: string;
  blocktime: number | null | undefined;
  extraInfo: {
    transactionId: string[];
    trasferredFromAccount?: string | undefined;
    solanaPrice?: number | undefined;
    inputAccounts?: ParsedMessageAccount[] | undefined;
  };
};

export default Activity;
