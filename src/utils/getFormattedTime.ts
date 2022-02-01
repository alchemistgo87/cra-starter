import dayjs from "dayjs";

export default function getFormattedTime(timeInMillis: number): string {
  return dayjs(timeInMillis).format("MMM DD, YYYY-h:mma").replace("-", " at ");
}
