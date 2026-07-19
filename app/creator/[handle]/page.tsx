import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatRewardAmount,
  formatRewardDate,
  getCreatorRewards,
  getRewardAsset,
  getRewardStatus,
} from "../../../lib/rewards";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `@${handle} Rewards | HandleFi`,
    description: `Public HandleFi reward profile for @${handle} on Arc Testnet.`,
  };
}

export default async function CreatorProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle).replace(/^@/, "");
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) notFound();

  let rewards = [];
  try {
    rewards = await getCreatorRewards(handle);
  } catch {
    rewards = [];
  }

  const claimed = rewards.filter((reward) => reward.claimed);
  const active = rewards.filter((reward) => getRewardStatus(reward) === "active");
  const totals = claimed.reduce<Record<string, bigint>>((result, reward) => {
    const asset = getRewardAsset(reward);
    result[asset.symbol] = (result[asset.symbol] ?? 0n) + reward.amount;
    return result;
  }, {});

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-6 sm:px-7 sm:py-10">
      <nav className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-white">HandleFi</Link>
        <Link href="/" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300">Open app</Link>
      </nav>

      <section data-ui="hero" className="relative overflow-hidden rounded-[38px] border border-white/8 bg-[linear-gradient(145deg,rgba(13,20,31,0.98),rgba(5,9,15,0.99))] p-6 shadow-[0_50px_140px_rgba(0,0,0,0.55)] sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(146,255,231,0.18),transparent_30%),radial-gradient(circle_at_0%_100%,rgba(42,93,255,0.15),transparent_35%)]" />
        <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="grid h-28 w-28 place-items-center rounded-[32px] border border-[#92ffe7]/25 bg-[#92ffe7]/10 text-5xl font-semibold text-[#92ffe7]">{handle[0]?.toUpperCase()}</div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#92ffe7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#04130e]">X-linked identity</span>
              <span className="text-xs text-slate-500">Arc Testnet ledger</span>
            </div>
            <h1 className="mt-5 text-4xl font-medium text-white sm:text-6xl">@{handle}</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-400">A public view of stablecoin rewards assigned to this X handle through HandleFi.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div data-ui="panel" className="rounded-[26px] border border-white/8 bg-white/[0.035] p-5"><p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Rewards received</p><strong className="mt-3 block text-3xl text-white">{claimed.length}</strong></div>
        <div data-ui="panel" className="rounded-[26px] border border-white/8 bg-white/[0.035] p-5"><p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Ready to claim</p><strong className="mt-3 block text-3xl text-[#92ffe7]">{active.length}</strong></div>
        <div data-ui="panel" className="rounded-[26px] border border-white/8 bg-white/[0.035] p-5"><p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Claimed value</p><strong className="mt-3 block text-lg leading-8 text-white">{Object.entries(totals).length ? Object.entries(totals).map(([symbol, amount]) => `${formatRewardAmount({ ...claimed.find((reward) => getRewardAsset(reward).symbol === symbol)!, amount })}`).join(" + ") : "No claims yet"}</strong></div>
      </section>

      <section data-ui="panel" className="mt-8 rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,23,35,0.96),rgba(8,12,19,0.98))] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-3 border-b border-white/8 pb-6 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#92ffe7]">Reward ledger</p><h2 className="mt-3 text-3xl font-medium text-white">Public activity</h2></div>
          <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-300 hover:underline">View @{handle} on X ↗</a>
        </div>

        {rewards.length ? (
          <div className="divide-y divide-white/8">
            {rewards.map((reward) => {
              const status = getRewardStatus(reward);
              return (
                <Link key={reward.id.toString()} href={`/reward/${reward.id.toString()}`} className="grid gap-4 py-6 transition hover:translate-x-1 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Reward #{reward.id.toString()} · {formatRewardDate(reward.createdAt)}</p><strong className="mt-2 block text-xl text-white">{formatRewardAmount(reward)}</strong></div>
                  <div className="flex items-center gap-4"><span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${status === "claimed" ? "bg-[#92ffe7] text-[#04130e]" : status === "active" ? "bg-blue-400/15 text-blue-200" : "bg-amber-300/12 text-amber-200"}`}>{status}</span><span className="text-[#92ffe7]">→</span></div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center"><p className="text-lg font-medium text-white">No HandleFi rewards yet.</p><p className="mt-2 text-sm text-slate-500">When a reward is assigned to @{handle}, it will appear here.</p></div>
        )}
      </section>
    </main>
  );
}

