import Body2 from "components/text/Body2";
import Activity from "types/Activity";
import ColorClass from "types/enums/ColorClass";
import LoadingState from "types/enums/LoadingState";
import ActivityRow from "./ActivityRow";
import styles from "css/activity/Activities.module.css";
import { getPriceUSD } from "utils/rpc/getPriceUSD";
import { useState } from "react";
import LoadingSpinner from "components/loading/LoadingSpinner";
import ResponsiveContainer from "components/containers/ResponsiveContainer";

const Fetching = () => (
  <ResponsiveContainer>
    <LoadingSpinner />
  </ResponsiveContainer>
);

export default function Activities({
  loading,
  activities,
}: {
  loading: LoadingState;
  activities: Activity[] | null;
}): JSX.Element {
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const fetchPrice = async () => {
    const priceInfo = await getPriceUSD();
    if (priceInfo) setUsdPrice(priceInfo.price);
  };
  switch (loading) {
    case LoadingState.Loading:
      return <Fetching />;

    case LoadingState.Loaded:
      if (!activities) {
        return <div>No Activities</div>;
      }

      fetchPrice();
      return (
        <div className={styles.container}>
          <Body2 colorClass={ColorClass.Secondary}>ACTIVITY</Body2>
          {activities.map((activity: Activity, index) => (
            <div key={activity.extraInfo.transactionId[0]}>
              <ActivityRow activity={activity} usdPrice={usdPrice} />
              {index < activities.length - 1 && (
                <div className={styles.divider} />
              )}
            </div>
          ))}
        </div>
      );

    default:
      return <div> </div>;
  }
}
