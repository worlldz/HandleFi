import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTRACTS } from "../../../lib/wagmi";
import {
  formatRewardAmount,
  formatRewardDate,
  getPublicReward,
  getRewardStatus,
  shortAddress,
} from "../../../lib/rewards";

export const revalidate = 20;

const explorer = "https://testnet.arcscan.app";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Reward #${id} | HandleFi`,
    description: `Public onchain receipt for HandleFi reward #${id}.`,
  };
}

export default async function RewardReceipt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let reward;
  try {
    reward = await getPublicReward(BigInt(id));
  } catch {
    reward = null;
  }
  if (!reward) notFound();

  const status = getRewardStatus(reward);
  const statusLabel = status === "active" ? "Locked for claim" : status === "expired" ? "Claim window ended" : status;
  const handle = reward.recipientHandle.replace(/^@/, "");

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-6 sm:px-7 sm:py-10">
      <nav className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#92ffe7]/25 bg-[#92ffe7]/10 text-lg font-semibold text-[#92ffe7]">H</span>
          <span>
            <strong className="block text-sm uppercase tracking-[0.24em]">HandleFi</strong>
            <span className="text-xs text-slate-500">Public reward ledger</span>
          </span>
        </Link>
        <Link href="/" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]">Open app</Link>
      </nav>

      <section data-ui="hero" className="relative overflow-hidden rounded-[38px] border border-white/8 bg-[linear-gradient(145deg,rgba(13,20,31,0.98),rgba(5,9,15,0.99))] p-6 shadow-[0_50px_140px_rgba(0,0,0,0.55)] sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(146,255,231,0.16),transparent_30%),radial-gradient(circle_at_10%_100%,rgba(42,93,255,0.15),transparent_36%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#92ffe7]/20 bg-[#92ffe7]/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#92ffe7]">Onchain receipt</span>
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${status === "claimed" ? "bg-[#92ffe7] text-[#04130e]" : status === "active" ? "bg-blue-400/15 text-blue-200" : "bg-amber-300/12 text-amber-200"}`}>{statusLabel}</span>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">Reward #{reward.id.toString()}</p>
            <h1 className="mt-4 text-5xl font-medium leading-none text-white sm:text-7xl">{formatRewardAmount(reward)}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Reserved for <Link href={`/creator/${handle}`} className="font-semibold text-[#92ffe7] hover:underline">@{handle}</Link> through HandleFi.</p>
          </div>

          <div data-ui="subpanel" className="rounded-[28px] border border-white/8 bg-white/[0.035] p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Settlement route</p>
            <div className="mt-5 flex items-center gap-3">
              {['Sender', 'HandleFi', status === 'claimed' ? 'Creator' : 'Locked'].map((step, index) => (
                <div key={step} className="contents">
                  <div className="grid min-w-0 flex-1 place-items-center rounded-2xl border border-white/8 bg-black/15 px-2 py-4 text-center text-xs font-semibold text-white">{step}</div>
                  {index < 2 ? <span className="text-[#92ffe7]">→</span> : null}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-400">The receipt is reconstructed from the deployed HandleFi contract on Arc Testnet.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div data-ui="panel" className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,23,35,0.96),rgba(8,12,19,0.98))] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#92ffe7]">Reward details</p>
          <dl className="mt-6 divide-y divide-white/8">
            {[
              ["Created", formatRewardDate(reward.createdAt)],
              ["Claim deadline", formatRewardDate(reward.claimDeadline)],
              ["Recipient handle", `@${handle}`],
              ["Network", "Arc Testnet"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-4">
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="text-right text-sm font-medium text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-ui="panel" className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,23,35,0.96),rgba(8,12,19,0.98))] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#92ffe7]">Independent verification</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={`${explorer}/address/${reward.tipper}`} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#92ffe7]/30 hover:bg-[#92ffe7]/5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Sender</span>
              <strong className="mt-2 block font-mono text-sm text-white">{shortAddress(reward.tipper)} ↗</strong>
            </a>
            <a href={`${explorer}/address/${CONTRACTS.tips}`} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#92ffe7]/30 hover:bg-[#92ffe7]/5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Reward contract</span>
              <strong className="mt-2 block font-mono text-sm text-white">{CONTRACTS.tips ? shortAddress(CONTRACTS.tips) : "Unavailable"} ↗</strong>
            </a>
            {reward.claimed ? (
              <a href={`${explorer}/address/${reward.recipient}`} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#92ffe7]/30 hover:bg-[#92ffe7]/5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Claim wallet</span>
                <strong className="mt-2 block font-mono text-sm text-white">{shortAddress(reward.recipient)} ↗</strong>
              </a>
            ) : null}
            <a href={reward.postUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-[#1d9bf0]/25 bg-[#1d9bf0]/8 p-4 transition hover:bg-[#1d9bf0]/14">
              <span className="text-[10px] uppercase tracking-[0.2em] text-blue-300">Linked content</span>
              <strong className="mt-2 block text-sm text-white">View original post on X ↗</strong>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

