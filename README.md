# Mint Information App

Get information about any solana mint. Currently it supports following types of txns:

- NFT was minted
- NFT was transferred
- NFT was listed on Magic Eden
- NFT listing was cancelled on Magic Eden
- NFT was bought on Magic Eden

Note:
To change maximum activities to show:
Go to src/constants/constants.ts and update MAX_ACTIVITIES constant.

## Getting started

1. [Install the classic version of Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
2. Run `yarn` to install packages
   - If `yarn` complains about your Node version, [install nvm](https://github.com/nvm-sh/nvm), then run `nvm use 14.17.0`
3. Run `yarn tsc && yarn eslint` to make sure TypeScript and ESLint are working
4. Run `yarn start` to start the development server

## Development

Add new pages to `src/routes/Routes.tsx`
