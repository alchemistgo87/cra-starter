import { ParsedMessageAccount, PublicKey } from "@solana/web3.js";
import { MAX_ACTIVITIES } from "constants/constants";
import Activity from "types/Activity";
import ActivityType from "types/enums/ActivityType";
import { getTokenAccount, getAccountActivities } from "./fetchData";

async function getActivities(
  mintPubkey: PublicKey
): Promise<Activity[] | null> {
  let account: PublicKey | null = await getTokenAccount(mintPubkey);
  const allActivitiesToShow: any[] = [];
  const otherActivities: any[] = [];
  const fetchedTxns: string[] = [];
  let beforeTxn;

  while (account !== null && allActivitiesToShow.length <= MAX_ACTIVITIES) {
    // Note: 3rd Param is 'before txn id' (which might also be used when implementing pagination)
    // eslint-disable-next-line no-await-in-loop
    const activities = await getAccountActivities(
      account,
      mintPubkey.toBase58(),
      fetchedTxns,
      beforeTxn
    );
    account = null;
    beforeTxn = undefined;
    if (activities && activities.length > 0) {
      activities.forEach((act: Activity) => {
        if (act.activityType === ActivityType.Other) {
          otherActivities.push(act);
        } else {
          fetchedTxns.push(act.extraInfo.transactionId[0]);
          allActivitiesToShow.push(act);
        }
      });

      const lastActivity: Activity = activities[activities.length - 1];
      if (lastActivity.activityType === ActivityType.Transferred) {
        console.log("Transfer Instruction Encountered");
        // When token account is transferred, get the previous token account to fetch previous txns.
        if (lastActivity.extraInfo?.trasferredFromAccount) {
          console.log(
            "Transferred from Account:",
            lastActivity.extraInfo?.trasferredFromAccount
          );
          const newAccount: PublicKey = new PublicKey(
            lastActivity.extraInfo.trasferredFromAccount
          );
          account = newAccount;
        }
      } else if (lastActivity.activityType === ActivityType.Minted) {
        account = null;
      } else if (allActivitiesToShow.length < MAX_ACTIVITIES) {
        if (otherActivities.length > 0) {
          // eslint-disable-next-line no-restricted-syntax
          for (const act of otherActivities.reverse()) {
            const inputAccounts: string[] = [];
            act.extraInfo.inputAccounts?.forEach(
              (acc: ParsedMessageAccount) => {
                inputAccounts.push(acc.pubkey.toBase58());
              }
            );
            // console.log("Input Accounts:", inputAccounts);
            if (inputAccounts.includes(mintPubkey.toBase58())) {
              console.log("Now Fetching Direct Mint Txns");
              account = mintPubkey;
              // eslint-disable-next-line prefer-destructuring
              beforeTxn = act.extraInfo.transactionId[0];
              break;
            }
          }
        }
      }
    }
  }

  return allActivitiesToShow;
}

export default getActivities;
