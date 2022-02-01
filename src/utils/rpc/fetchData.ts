/* eslint-disable no-await-in-loop */
import {
  AccountInfo,
  ConfirmedSignatureInfo,
  ParsedAccountData,
  ParsedConfirmedTransaction,
  PublicKey,
  RpcResponseAndContext,
  TokenAccountBalancePair,
} from "@solana/web3.js";
import { connection, MAX_ACTIVITIES } from "constants/constants";
import AccountDetails from "types/AccountDetails";
import Activity from "types/Activity";
import ActivityType from "types/enums/ActivityType";
import readTransaction from "./readTransaction";

export async function getConfirmedSignatures(
  pubkey: PublicKey,
  before: string | undefined,
  fetchCount: number
): Promise<ConfirmedSignatureInfo[] | null> {
  try {
    const signatures: ConfirmedSignatureInfo[] =
      await connection.getSignaturesForAddress(pubkey, {
        before,
        limit: fetchCount,
      });
    return signatures;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

export async function getAccountActivities(
  tokenAccount: PublicKey,
  mintId: string,
  fetchedTxns: string[],
  beforeTxnId: string | undefined
): Promise<Activity[] | null> {
  const tokenAccountSignatures: ConfirmedSignatureInfo[] | null =
    await getConfirmedSignatures(
      tokenAccount,
      beforeTxnId,
      MAX_ACTIVITIES - fetchedTxns.length
    );

  if (tokenAccountSignatures) {
    console.log("Signatures:", tokenAccountSignatures);
    const activities: Activity[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const signature of tokenAccountSignatures) {
      if (!fetchedTxns.includes(signature.signature)) {
        await connection
          .getParsedConfirmedTransaction(signature.signature)
          // eslint-disable-next-line consistent-return
          .then((transaction: ParsedConfirmedTransaction | null) => {
            if (transaction) {
              const act = readTransaction(transaction, mintId);
              if (act) {
                activities.push(act);
                if (act.activityType === ActivityType.Transferred) {
                  console.log("Breaking out since its a Transfer Txn");
                  return activities;
                }
                if (act.activityType === ActivityType.Minted) {
                  console.log("Breaking out since its a Mint Txn");
                  return activities;
                }
              }
            }
          });
      }
    }

    return activities;
  }
  return null;
}

export async function getTokenAccount(
  mintPubKey: PublicKey
): Promise<PublicKey | null> {
  // Get Token Accounts of Mint
  const tokenAccounts: TokenAccountBalancePair[] = (
    await connection.getTokenLargestAccounts(mintPubKey)
  ).value;

  console.log("TokenAccounts:", tokenAccounts);

  if (tokenAccounts.length > 0) {
    const tokenAccount: TokenAccountBalancePair = tokenAccounts[0];
    if (tokenAccount.uiAmount && tokenAccount.uiAmount > 0) {
      return tokenAccount.address;
    }
  }
  return null;
}

async function getAccountDetails(
  pubkey: PublicKey
): Promise<AccountDetails | null> {
  try {
    if (pubkey !== undefined) {
      const result = await connection
        .getParsedAccountInfo(pubkey)
        .then(
          (
            accountInfo: RpcResponseAndContext<AccountInfo<
              Buffer | ParsedAccountData
            > | null>
          ) => {
            console.log("Account info: ", accountInfo);
            if (accountInfo) {
              const data = accountInfo.value?.data;
              if (data && "parsed" in data) {
                let accountDetails: AccountDetails;
                if (data.parsed) {
                  accountDetails = {
                    program: data.program,
                    type: data.parsed.type,
                    info: {
                      decimals: data.parsed.info.decimals,
                      isInitialized: data.parsed.info.isInitialized,
                      supply: data.parsed.info.supply,
                    },
                  };
                  return accountDetails;
                }
              }
            }
            return null;
          }
        );
      return result;
    }
    return null;
  } catch (err) {
    console.error("Error while fetching account details:", err);
    return null;
  }
}

export default getAccountDetails;
