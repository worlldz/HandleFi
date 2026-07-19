import { Address, createPublicClient, formatUnits, http } from "viem";
import { arcTestnet, CONTRACTS, TOKENS } from "./wagmi";
import { handleFiTipsAbi } from "./contracts";

export type RewardStatus = "active" | "claimed" | "refunded" | "expired";

export type PublicReward = {
  id: bigint;
  tipper: Address;
  token: Address;
  amount: bigint;
  postUrl: string;
  recipientHandle: string;
  createdAt: bigint;
  claimDeadline: bigint;
  claimed: boolean;
  refunded: boolean;
  recipient: Address;
};

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(arcTestnet.rpcUrls.default.http[0]),
});

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function parseReward(id: bigint, raw: unknown): PublicReward | null {
  const values = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? (() => {
          const record = raw as Record<string, unknown>;
          return [
            record.tipper,
            record.token,
            record.amount,
            record.postUrl,
            record.recipientHandle,
            record.createdAt,
            record.claimDeadline,
            record.claimed,
            record.refunded,
            record.recipient,
          ];
        })()
      : [];

  if (values.length < 10) return null;
  const [tipper, token, amount, postUrl, recipientHandle, createdAt, claimDeadline, claimed, refunded, recipient] = values;
  if (
    typeof tipper !== "string" ||
    typeof token !== "string" ||
    typeof amount !== "bigint" ||
    typeof postUrl !== "string" ||
    typeof recipientHandle !== "string" ||
    typeof createdAt !== "bigint" ||
    typeof claimDeadline !== "bigint" ||
    typeof claimed !== "boolean" ||
    typeof refunded !== "boolean" ||
    typeof recipient !== "string"
  ) {
    return null;
  }

  if (tipper === "0x0000000000000000000000000000000000000000") return null;

  return {
    id,
    tipper: tipper as Address,
    token: token as Address,
    amount,
    postUrl,
    recipientHandle,
    createdAt,
    claimDeadline,
    claimed,
    refunded,
    recipient: recipient as Address,
  };
}

export async function getPublicReward(id: bigint) {
  if (!CONTRACTS.tips || id < 1n) return null;

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = await (client.readContract as any)({
        address: CONTRACTS.tips,
        abi: handleFiTipsAbi,
        functionName: "getTip",
        args: [id],
      });

      return parseReward(id, raw);
    } catch (error) {
      lastError = error;
      if (attempt < 2) await delay(450 * (attempt + 1));
    }
  }

  throw lastError;
}

export async function getCreatorRewards(handle: string) {
  if (!CONTRACTS.tips) return [];

  const normalizedHandle = handle.replace(/^@/, "").toLowerCase();
  let nextTipId: bigint | undefined;
  let nextTipError: unknown;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      nextTipId = (await (client.readContract as any)({
        address: CONTRACTS.tips,
        abi: handleFiTipsAbi,
        functionName: "nextTipId",
      })) as bigint;
      break;
    } catch (error) {
      nextTipError = error;
      if (attempt < 3) await delay(600 * 2 ** attempt);
    }
  }

  if (nextTipId === undefined) throw nextTipError;

  const rewards: PublicReward[] = [];
  for (let id = nextTipId - 1n; id >= 1n; id -= 1n) {
    try {
      const reward = await getPublicReward(id);
      if (reward?.recipientHandle.replace(/^@/, "").toLowerCase() === normalizedHandle) {
        rewards.push(reward);
      }
    } catch {
      // A single throttled read should not hide the rest of a creator's ledger.
    }
    await delay(180);
  }

  return rewards;
}

export function getRewardStatus(reward: PublicReward): RewardStatus {
  if (reward.claimed) return "claimed";
  if (reward.refunded) return "refunded";
  if (reward.claimDeadline * 1000n < BigInt(Date.now())) return "expired";
  return "active";
}

export function getRewardAsset(reward: PublicReward) {
  const address = reward.token.toLowerCase();
  if (address === TOKENS.USDC.address.toLowerCase()) return TOKENS.USDC;
  if (address === TOKENS.EURC.address.toLowerCase()) return TOKENS.EURC;
  return { symbol: "TOKEN", decimals: 18, address: reward.token } as const;
}

export function formatRewardAmount(reward: PublicReward) {
  const asset = getRewardAsset(reward);
  return `${formatUnits(reward.amount, asset.decimals)} ${asset.symbol}`;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatRewardDate(timestamp: bigint) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(Number(timestamp) * 1000));
}
