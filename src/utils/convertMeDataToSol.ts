import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

export default function convertMeDataToSol(instructionData: string) {
  const priceHex = bs58
    .decode(instructionData)
    .toString("hex")
    .substring(16, 34);
  // console.log("Decode Instruction Data:", priceHex);
  const sol =
    parseInt(Buffer.from(priceHex, "hex").readUIntLE(0, 8).toString(), 10) /
    LAMPORTS_PER_SOL;
  // console.log("Instruction Data Price:", sol);
  return sol;
}
