import { PRODUCT_X_MENTION } from "./brand";

export const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const handleFiTipsAbi = [
  {
    type: "function",
    name: "nextTipId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "createTip",
    stateMutability: "nonpayable",
    inputs: [
      { name: "postUrl", type: "string" },
      { name: "recipientHandle", type: "string" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "claimDeadline", type: "uint64" },
    ],
    outputs: [{ name: "tipId", type: "uint256" }],
  },
  {
    type: "function",
    name: "claimTip",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tipId", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "sigDeadline", type: "uint64" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "refundExpiredTip",
    stateMutability: "nonpayable",
    inputs: [{ name: "tipId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getTip",
    stateMutability: "view",
    inputs: [{ name: "tipId", type: "uint256" }],
    outputs: [
      { name: "tipper", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "postUrl", type: "string" },
      { name: "recipientHandle", type: "string" },
      { name: "createdAt", type: "uint64" },
      { name: "claimDeadline", type: "uint64" },
      { name: "claimed", type: "bool" },
      { name: "refunded", type: "bool" },
      { name: "recipient", type: "address" },
    ],
  },
] as const;

export const handleFiSwapAbi = [
  {
    type: "function",
    name: "previewSwap",
    stateMutability: "view",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "swap",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

export function makeClaimProof(tipId: bigint) {
  return `HANDLEFI-CLAIM-${tipId.toString()}`;
}

export function makeProofTweetText(proof: string) {
  return `${PRODUCT_X_MENTION} ${proof}`;
}

export function makeProofTweetIntentUrl(proof: string) {
  const text = makeProofTweetText(proof);
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}

export function makeClaimCelebrationTweetText(input?: {
  handle?: string;
  amount?: string;
  tokenSymbol?: string;
}) {
  const amountText =
    input?.amount && input?.tokenSymbol
      ? `I just claimed ${input.amount} ${input.tokenSymbol}`
      : "I just claimed my reward";

  return `${amountText} through ${PRODUCT_X_MENTION} ^^ Built on @arc. #BuildOnArc`;
}

export function makeClaimCelebrationIntentUrl(input?: {
  handle?: string;
  amount?: string;
  tokenSymbol?: string;
}) {
  return `https://x.com/intent/post?text=${encodeURIComponent(
    makeClaimCelebrationTweetText(input),
  )}`;
}

export function makeRewardAnnouncementText({
  recipientHandle,
  message,
  tipId,
  postUrl,
}: {
  recipientHandle: string;
  message: string;
  tipId: bigint;
  postUrl?: string;
}) {
  const cleanHandle = recipientHandle.replace(/^@/, "");
  const cleanMessage = message.trim() || "great content";
  const cleanPostUrl = postUrl?.trim();
  if (cleanPostUrl) {
    return `I am sending a reward to @${cleanHandle} because of "${cleanMessage}" with ${PRODUCT_X_MENTION}. Built on @arc. #BuildOnArc ${cleanPostUrl}`;
  }
  return `I am sending a reward to @${cleanHandle} because of "${cleanMessage}" with ${PRODUCT_X_MENTION}. Built on @arc. #BuildOnArc`;
}

export function makeRewardAnnouncementIntentUrl(input: {
  recipientHandle: string;
  message: string;
  tipId: bigint;
  postUrl?: string;
}) {
  return `https://x.com/intent/post?text=${encodeURIComponent(
    makeRewardAnnouncementText(input),
  )}`;
}
