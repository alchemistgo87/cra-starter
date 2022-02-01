import { LAMPORTS_PER_SOL } from "@solana/web3.js";

function findSigner(accKeys: any[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const [i, el] of accKeys.entries()) {
    if (el.signer) {
      return [i, el.pubkey];
    }
  }
  return null;
}

export default function getPurchasePrice(tx: any, owner: string): number {
  // identify the token through postTokenBalances
  const tokenMint = tx.meta.preTokenBalances[0].mint;
  // there's only one signer = the buyer, that's the acc we need
  const [buyerIdx, buyerAcc] = findSigner(tx.transaction.message.accountKeys)!;
  const { preBalances } = tx.meta;
  const { postBalances } = tx.meta;
  const buyerSpent =
    (preBalances[buyerIdx] - postBalances[buyerIdx]) / LAMPORTS_PER_SOL;
  if (buyerAcc.toBase58() === owner) {
    console.log(`Bought ${tokenMint} for ${buyerSpent} SOL`);
  } else {
    console.log(`Sold ${tokenMint} for ${buyerSpent} SOL`);
  }
  return buyerSpent;
}
