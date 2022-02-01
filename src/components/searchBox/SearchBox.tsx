import { useState } from "react";
import styles from "css/searchBox/SearchBox.module.css";

export default function SearchBox({
  onNewSearch,
}: {
  onNewSearch: any;
}): JSX.Element {
  const [searchText, setSearchText] = useState<string>("");
  const onCrossClick = () => {
    setSearchText("");
  };
  const onEnter = () => {
    if (searchText.length > 0) {
      onNewSearch(searchText);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <input
          className={styles.searchWidget}
          type="text"
          value={searchText}
          placeholder="Input an NFT's mint account"
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter();
          }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className={styles.searchIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={styles.searchIconSVG}
          >
            <path
              fillRule="evenodd"
              d="M12.442 12.442a1 1 0 011.415 0l3.85 3.85a1 1 0 01-1.414 1.415l-3.85-3.85a1 1 0 010-1.415z"
            />
            <path
              fillRule="evenodd"
              d="M8.5 14a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM15 8.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
        </div>
        {searchText && (
          <div className={styles.crossIcon}>
            <svg
              onClick={() => onCrossClick()}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={styles.crossIconSVG}
            >
              <path
                fillRule="evenodd"
                d="M10 17a7 7 0 100-14 7 7 0 000 14zm0 1a8 8 0 100-16 8 8 0 000 16z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M12.646 13.354l-6-6 .708-.708 6 6-.708.708z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M7.354 13.354l6-6-.708-.708-6 6 .708.708z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
