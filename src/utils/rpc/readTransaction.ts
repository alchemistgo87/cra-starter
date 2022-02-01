import {
  ParsedConfirmedTransaction,
  ParsedInnerInstruction,
  ParsedInstruction,
  PartiallyDecodedInstruction,
} from "@solana/web3.js";
import Activity from "types/Activity";
import ActivityType from "types/enums/ActivityType";
import {
  MAGIC_EDEN_PROGRAM_ID,
  MAGIC_EDEN_AUTHORITY_ID,
  MAGIC_EDEN_CANCEL_LISTING_INSTRUCTION,
} from "constants/meConstants";
import convertMeDataToSol from "utils/convertMeDataToSol";

function checkListingTxn(
  transaction: ParsedConfirmedTransaction
): Activity | null {
  if (transaction !== null) {
    const ixs = transaction.transaction.message.instructions;
    const innerIxs = transaction.meta?.innerInstructions;
    const innerIxsMap = new Map<number, ParsedInnerInstruction>();
    if (innerIxs && innerIxs !== undefined) {
      innerIxs?.forEach((innerIx) => {
        innerIxsMap.set(innerIx.index, innerIx);
      });
    }

    let meProgramAccountCheck = false;
    let meAuthorityCheck = false;
    let listingAuthority = "";
    let listingPrice: number | undefined;
    ixs.forEach(
      (ix: ParsedInstruction | PartiallyDecodedInstruction, index) => {
        if (ix.programId.toBase58() === MAGIC_EDEN_PROGRAM_ID) {
          // console.log("This is Magic Eden Program");
          innerIxsMap
            .get(index)
            ?.instructions.forEach(
              (i: ParsedInstruction | PartiallyDecodedInstruction) => {
                if ("parsed" in i) {
                  if (!meProgramAccountCheck) {
                    if (
                      i.parsed.type === "createAccount" &&
                      i.parsed.info.owner === MAGIC_EDEN_PROGRAM_ID &&
                      i.program === "system"
                    ) {
                      // console.log("ME program account created");
                      meProgramAccountCheck = true;
                    }
                  } else if (!meAuthorityCheck) {
                    if (
                      i.parsed.type === "setAuthority" &&
                      i.parsed.info.authorityType === "accountOwner" &&
                      i.parsed.info.newAuthority === MAGIC_EDEN_AUTHORITY_ID &&
                      i.program === "spl-token"
                    ) {
                      meAuthorityCheck = true;
                      listingAuthority = i.parsed.info.authority;
                      if ("data" in ix) {
                        // console.log("Instruction Data:", ix.data);
                        listingPrice = convertMeDataToSol(ix.data);
                      }
                    }
                  }
                }
              }
            );
        }
      }
    );
    if (meProgramAccountCheck && meAuthorityCheck) {
      console.log("This is a Listing Transaction by", listingAuthority);
      const timeStamp = transaction.blockTime;
      const activity: Activity = {
        activityType: ActivityType.Listed,
        doneByAddress: listingAuthority,
        blocktime: timeStamp,
        extraInfo: {
          transactionId: transaction.transaction.signatures,
          solanaPrice: listingPrice,
        },
      };
      return activity;
    }
  }
  return null;
}

function checkCancelListingOrSaleTxn(
  transaction: ParsedConfirmedTransaction
): Activity | null {
  if (transaction !== null) {
    const ixs = transaction.transaction.message.instructions;
    const innerIxs = transaction.meta?.innerInstructions;
    const innerIxsMap = new Map<number, ParsedInnerInstruction>();
    if (innerIxs && innerIxs !== undefined) {
      innerIxs?.forEach((innerIx) => {
        innerIxsMap.set(innerIx.index, innerIx);
      });
    }

    let meAuthorityTransferred = false;
    const solTransferredBy: string[] = [];
    let newAuthority = "";
    let instructionData: string | null = null;
    let purchasePrice: number | undefined;
    ixs.forEach(
      (ix: ParsedInstruction | PartiallyDecodedInstruction, index) => {
        if (ix.programId.toBase58() === MAGIC_EDEN_PROGRAM_ID) {
          innerIxsMap
            .get(index)
            ?.instructions.forEach(
              (i: ParsedInstruction | PartiallyDecodedInstruction) => {
                // console.log(i);
                if ("parsed" in i) {
                  if (!meAuthorityTransferred) {
                    if (i.parsed.type === "transfer") {
                      solTransferredBy.push(i.parsed.info.source);
                      // console.log("Sol Transferred by:", i.parsed.info.source);
                    }

                    if (
                      i.parsed.type === "setAuthority" &&
                      i.parsed.info.authorityType === "accountOwner" &&
                      i.parsed.info.authority === MAGIC_EDEN_AUTHORITY_ID &&
                      i.program === "spl-token"
                    ) {
                      meAuthorityTransferred = true;
                      newAuthority = i.parsed.info.newAuthority;

                      if ("data" in ix) {
                        // console.log("Instruction Data:", ix.data);
                        instructionData = ix.data;
                      }
                    }
                  }
                }
              }
            );
        }
      }
    );
    if (meAuthorityTransferred) {
      let typeOfActivity;

      if (MAGIC_EDEN_CANCEL_LISTING_INSTRUCTION === instructionData) {
        typeOfActivity = ActivityType.ListingCancelled;

        console.log(
          "This is a Cancel Listing Transaction, new authority:",
          newAuthority
        );
      } else if (
        solTransferredBy.length > 0 &&
        solTransferredBy.includes(newAuthority)
      ) {
        typeOfActivity = ActivityType.Bought;
        if (instructionData) {
          purchasePrice = convertMeDataToSol(instructionData);
        }
        console.log("This is a Sale Transaction, new authority:", newAuthority);
      }
      if (typeOfActivity) {
        const timeStamp = transaction.blockTime;
        const activity: Activity = {
          activityType: typeOfActivity,
          doneByAddress: newAuthority,
          blocktime: timeStamp,
          extraInfo: {
            transactionId: transaction.transaction.signatures,
            solanaPrice: purchasePrice,
          },
        };
        return activity;
      }
    }
  }
  return null;
}

function checkMintTxn(
  transaction: ParsedConfirmedTransaction,
  mintId: string
): Activity | null {
  if (transaction !== null) {
    const ixs = transaction.transaction.message.instructions;
    const innerIxs = transaction.meta?.innerInstructions;
    const innerIxsMap = new Map<number, ParsedInnerInstruction>();
    if (innerIxs && innerIxs !== undefined) {
      innerIxs?.forEach((innerIx) => {
        innerIxsMap.set(innerIx.index, innerIx);
      });
    }

    let mintedCheck = false;
    let authority = "";
    ixs.forEach((ix: ParsedInstruction | PartiallyDecodedInstruction) => {
      // console.log("Checking for Mint");
      // console.log(ix);
      if ("parsed" in ix) {
        if (ix.parsed.type === "mintTo" && ix.program === "spl-token") {
          if (ix.parsed.info.mint === mintId && ix.parsed.info.amount === "1") {
            mintedCheck = true;
            authority = ix.parsed.info.mintAuthority;
          }
        }
      }
    });
    if (mintedCheck) {
      console.log("This is a Mint Transaction");
      const timeStamp = transaction.blockTime;
      const activity: Activity = {
        activityType: ActivityType.Minted,
        doneByAddress: authority,
        blocktime: timeStamp,
        extraInfo: {
          transactionId: transaction.transaction.signatures,
        },
      };
      return activity;
    }
  }
  return null;
}

function checkTransferTxn(
  transaction: ParsedConfirmedTransaction,
  mintId: string
): Activity | null {
  console.log(mintId);
  if (transaction !== null) {
    const ixs = transaction.transaction.message.instructions;
    const innerIxs = transaction.meta?.innerInstructions;
    const innerIxsMap = new Map<number, ParsedInnerInstruction>();
    if (innerIxs && innerIxs !== undefined) {
      innerIxs?.forEach((innerIx) => {
        innerIxsMap.set(innerIx.index, innerIx);
      });
    }

    let transferedCheck = false;
    let newAuthority = "";
    let sourceTokenAccount;
    let newTokenAccount: string | undefined;
    ixs.forEach((ix: ParsedInstruction | PartiallyDecodedInstruction) => {
      // console.log("Checking for Transfer");
      // console.log(ix);
      if ("parsed" in ix && !transferedCheck) {
        if (
          ix.parsed.type === "initializeAccount" &&
          ix.program === "spl-token" &&
          ix.parsed.info.mint === mintId
        ) {
          newTokenAccount = ix.parsed.info.account;
        }

        if (
          (ix.parsed.type === "transferChecked" ||
            ix.parsed.type === "transfer") &&
          ix.program === "spl-token"
        ) {
          if (
            ix.parsed.info.mint === mintId &&
            ix.parsed.info.tokenAmount.uiAmountString === "1"
          ) {
            transferedCheck = true;
            newAuthority = ix.parsed.info.authority;
            sourceTokenAccount = ix.parsed.info.source;
          } else if (
            newTokenAccount &&
            newTokenAccount === ix.parsed.info.destination &&
            ix.parsed.info.amount === "1"
          ) {
            transferedCheck = true;
            newAuthority = ix.parsed.info.authority;
            sourceTokenAccount = ix.parsed.info.source;
          }
        }
      }
      // innerIxsMap
      //   .get(index)
      //   ?.instructions.forEach(
      //     (i: ParsedInstruction | PartiallyDecodedInstruction) => {
      //       // console.log(i);
      //       if ("parsed" in i) {
      //         if (i.parsed.type === "transfer" && i.program === "spl-token") {
      //           transferedCheck = true;
      //           newAuthority = i.parsed.info.authority;
      //           sourceTokenAccount = i.parsed.info.source;
      //         }
      //       }
      //     }
      //   );
    });
    if (transferedCheck) {
      console.log("This is a Transfer Txn");
      const timeStamp = transaction.blockTime;
      const activity: Activity = {
        activityType: ActivityType.Transferred,
        doneToAddress: newAuthority,
        blocktime: timeStamp,
        extraInfo: {
          trasferredFromAccount: sourceTokenAccount,
          transactionId: transaction.transaction.signatures,
        },
      };
      return activity;
    }
  }
  return null;
}

function readTransaction(
  transaction: ParsedConfirmedTransaction,
  mintId: string
): Activity | null {
  console.log("Reading Txn:", transaction);

  let activity = checkListingTxn(transaction);
  if (activity !== null) {
    return activity;
  }
  activity = checkCancelListingOrSaleTxn(transaction);
  if (activity !== null) {
    return activity;
  }
  activity = checkMintTxn(transaction, mintId);
  if (activity !== null) {
    return activity;
  }
  activity = checkTransferTxn(transaction, mintId);
  if (activity !== null) {
    return activity;
  }

  console.log("OTHER TYPE OF TXN");
  const otherActivity: Activity = {
    activityType: ActivityType.Other,
    blocktime: transaction.blockTime,
    extraInfo: {
      transactionId: transaction.transaction.signatures,
      inputAccounts: transaction.transaction.message.accountKeys,
    },
  };

  return otherActivity;
}

export default readTransaction;
