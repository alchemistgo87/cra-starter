import styles from "css/header/Header.module.css";
import Body2Medium from "components/text/Body2Medium";

export default function Header(): JSX.Element {
  return (
    <>
      <div className={styles.container}>
        <Body2Medium>nifty information</Body2Medium>
      </div>
      {/* <div className={styles.mobileContainer}>
        <HeaderMobile />
      </div> 
      <div className={styles.desktopContainer}>
        <HeaderDesktop />
      </div>
      */}
    </>
  );
}
