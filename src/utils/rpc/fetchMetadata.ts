/* eslint-disable no-async-promise-executor */
import { MetadataJson, programs } from "@metaplex/js";
import { PublicKey } from "@solana/web3.js";
import { connection } from "constants/constants";
import Meta from "types/Meta";

const {
  metadata: { Metadata },
} = programs;

async function getMetaDataJSON(
  id: string,
  metadata: programs.metadata.MetadataData
): Promise<MetadataJson | undefined> {
  // eslint-disable-next-line consistent-return
  return new Promise(async (resolve) => {
    const { uri } = metadata.data;
    // eslint-disable-next-line no-promise-executor-return
    if (!uri) return resolve(undefined);

    const processJson = (extended: any) => {
      if (!extended || extended?.properties?.files?.length === 0) {
        return;
      }

      if (extended?.image) {
        // eslint-disable-next-line no-param-reassign
        extended.image = extended.image.startsWith("http")
          ? extended.image
          : `${metadata.data.uri}/${extended.image}`;
      }

      // eslint-disable-next-line consistent-return
      return extended;
    };

    try {
      fetch(uri)
        .then(async (_) => {
          try {
            const data = await _.json();
            // try {
            //   localStorage.setItem(uri, JSON.stringify(data));
            // } catch {
            //   // ignore
            // }
            resolve(processJson(data));
          } catch {
            resolve(undefined);
          }
        })
        .catch(() => {
          resolve(undefined);
        });
    } catch (ex) {
      console.error(ex);
      resolve(undefined);
    }
  });
}

async function getMetadata(tokenPublicKey: PublicKey): Promise<Meta | null> {
  try {
    const pda = await Metadata.getPDA(tokenPublicKey);
    // console.log("PDA:", pda.toBase58());
    const metadataObj = await Metadata.load(connection, pda);
    // console.log(metadataObj);
    if (metadataObj) {
      const metadataJSON = await getMetaDataJSON(
        tokenPublicKey.toBase58(),
        metadataObj.data
      );
      // console.log("Metadata JSON:", metadataJSON);
      return {
        data: metadataObj.data,
        json: metadataJSON,
      } as Meta;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch metadata:", err);
    return null;
  }
}

export default getMetadata;
