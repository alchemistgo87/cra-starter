type AccountDetails = {
  program: string;
  type: string;

  info: {
    decimals?: number;
    // freezeAuthority?: string;
    isInitialized?: boolean;
    // mintAuthority?: string;
    supply?: string;
    // isNative?: false;
    // mint?: string;
    // owner?: string;
    // state?: string;
    // tokenAmount?: {
    //   amount: string;
    //   decimals: number;
    //   uiAmount: number;
    //   uiAmountString: string;
    // };
  };
};

export default AccountDetails;
