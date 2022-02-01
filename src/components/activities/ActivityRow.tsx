import Activity from "types/Activity";
import sliceAccountId from "utils/sliceAccountId";
import ActivityType from "types/enums/ActivityType";
import getFormattedTime from "utils/getFormattedTime";
import styles from "css/activity/ActivityRow.module.css";
import Body2 from "components/text/Body2";
import Body1Medium from "components/text/Body1Medium";
import Body3 from "components/text/Body3";
import ColorClass from "types/enums/ColorClass";

export default function ActivityRow({
  activity,
  usdPrice,
}: {
  activity: Activity;
  usdPrice: number | null;
}): JSX.Element {
  let timestamp = "";
  let title = "";
  let solanaPrice: number | undefined;

  if (typeof activity.blocktime === "number") {
    timestamp = getFormattedTime(activity.blocktime * 1000);
  }
  if (activity.extraInfo.solanaPrice) {
    solanaPrice = activity.extraInfo.solanaPrice;
  }

  switch (activity.activityType) {
    case ActivityType.Listed:
      if (activity.doneByAddress)
        title = `Listed by ${sliceAccountId(activity.doneByAddress)}`;
      else title = `Listed`;
      break;
    case ActivityType.ListingCancelled:
      if (activity.doneByAddress)
        title = `Listing cancelled by ${sliceAccountId(
          activity.doneByAddress
        )}`;
      else title = `Listing cancelled`;
      break;
    case ActivityType.Bought:
      if (activity.doneByAddress)
        title = `Bought by ${sliceAccountId(activity.doneByAddress)}`;
      else title = `Bought`;
      break;
    case ActivityType.Transferred:
      if (activity.doneToAddress)
        title = `Transferred to ${sliceAccountId(activity.doneToAddress)}`;
      else title = `Transferred`;
      break;
    case ActivityType.Minted:
      if (activity.doneByAddress)
        title = `Minted by ${sliceAccountId(activity.doneByAddress)}`;
      else title = `Minted`;
      break;
    default:
      break;
  }

  return (
    <div className={styles.container}>
      <div className={styles.subItem}>
        <Body2 className={styles.titleText}>{title}</Body2>
        {solanaPrice && <Body1Medium>{solanaPrice} ◎</Body1Medium>}
      </div>
      <div className={styles.subItem}>
        <Body3 colorClass={ColorClass.Secondary}>{timestamp}</Body3>
        {usdPrice && solanaPrice && (
          <Body3 colorClass={ColorClass.Secondary}>
            ${(usdPrice * solanaPrice).toFixed(2)} USD
          </Body3>
        )}
      </div>
      {/* <div>{activity.extraInfo.transactionId[0]}</div> */}
    </div>
  );
}
