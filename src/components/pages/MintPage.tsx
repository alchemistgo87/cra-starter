import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import getAccountDetails from "utils/rpc/fetchData";
import AccountDetails from "types/AccountDetails";
import getActivities from "utils/rpc/getActivities";
import Activity from "types/Activity";
import Activities from "components/activities/Activities";
import { useState } from "react";
import LoadingState from "types/enums/LoadingState";
import MintProfile from "components/mintprofile/MintProfile";
import Mint from "types/Mint";
import getMetadata from "utils/rpc/fetchMetadata";
import ResponsiveContainer from "components/containers/ResponsiveContainer";
import styles from "css/pages/mintPage/MintPage.module.css";
import SearchBox from "components/searchBox/SearchBox";

export default function MintPage(): JSX.Element {
  const [loadActivitiesState, setLoadActivitiesState] = useState<LoadingState>(
    LoadingState.Idle
  );
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [mint, setMint] = useState<Mint | null>(null);

  const onSubmit = async (searchText: string) => {
    if (searchText) {
      const decodedText = bs58.decode(searchText);
      if (decodedText.length === 32) {
        // console.log("decodedText", decodedText);
        setMint(null);
        setActivities(null);
        setLoadActivitiesState(LoadingState.Idle);

        const pubkey = new PublicKey(decodedText);
        const accountDetails: AccountDetails | null = await getAccountDetails(
          pubkey
        );
        // console.log("Account Details:", accountDetails);
        if (accountDetails !== null) {
          if (
            accountDetails.program === "spl-token" &&
            accountDetails.type === "mint"
          ) {
            console.log("Yes, This is a Mint Token");

            // GET METADATA
            getMetadata(pubkey).then((metadata) => {
              console.log("Metadata:", metadata);

              if (metadata) {
                let name;
                let image;
                if (metadata.data.data.name) {
                  name = metadata.data.data.name;
                } else if (metadata.json?.name) {
                  name = metadata.json.name;
                }
                if (metadata.json?.image) {
                  image = metadata.json.image;
                }
                setMint({
                  image,
                  name,
                });
              }
            });

            // GET ACTIVITIES
            setLoadActivitiesState(LoadingState.Loading);
            const activitiesResult: Activity[] | null = await getActivities(
              pubkey
            );
            // console.log("Activities:", activitiesResult);
            setLoadActivitiesState(LoadingState.Loaded);
            setActivities(activitiesResult);
          }
        }
      } else {
        console.error("Input not an address");
      }
    }
  };

  return (
    <ResponsiveContainer className={styles.container}>
      <SearchBox onNewSearch={onSubmit} />
      <MintProfile mint={mint} />
      <Activities loading={loadActivitiesState} activities={activities} />
    </ResponsiveContainer>
  );
}
