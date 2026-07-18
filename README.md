# HandleFi

HandleFi lets anyone reserve a USDC or EURC reward for an X handle. The recipient connects the matching X account, verifies ownership, and claims the reward onchain.

HandleFi is an independent product built on Arc Testnet. Arc provides the settlement infrastructure; HandleFi owns the product identity, contracts, and social reward flow.

## Product flow

1. Connect a wallet on Arc Testnet.
2. Create a reward for an X handle or a specific post.
3. Lock USDC or EURC in the HandleFi reward contract.
4. Let the recipient connect the matching X account.
5. Verify the account and claim the reward onchain.
6. Refund an expired, unclaimed reward after its deadline.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add local credentials. Never commit `.env.local`.

## Stack

- Next.js and TypeScript
- Solidity and OpenZeppelin
- wagmi, viem, and RainbowKit
- X OAuth 2.0 with PKCE
- USDC and EURC on Arc Testnet

## Contracts

- `HandleFiTips.sol`: reward creation, claim authorization, expiry, and refunds.
- `HandleFiSwapVault.sol`: optional USDC/EURC swap-vault prototype; it is not used by the current interface.

X identity is stored as a server-signed, HTTP-only session. HandleFi does not retain the OAuth access or refresh token after the callback completes.

## Brand

HandleFi is the application name. Arc is referenced only as the network infrastructure on which the application is built.
