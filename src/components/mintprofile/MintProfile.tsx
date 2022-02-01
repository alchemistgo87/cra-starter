import Mint from "types/Mint";
import styles from "css/mintProfile/MintProfile.module.css";

export default function MintProfile({
  mint,
}: {
  mint: Mint | null;
}): JSX.Element {
  if (!mint) {
    return <div> </div>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img src={mint.image} />
      </div>
      {mint.name && <div className={styles.nameContainer}>{mint.name}</div>}
    </div>
  );
}
