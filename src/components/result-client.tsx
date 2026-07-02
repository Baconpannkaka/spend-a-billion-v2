"use client";

import { AdSlot } from "@/components/ad-slot";
import { MoneyDisplay } from "@/components/money-display";
import { useCatalog } from "@/catalog/use-catalog";
import { useGame } from "@/context/game-context";
import { useToast } from "@/context/toast-context";
import { useLanguage } from "@/i18n/language-context";
import { getAchievements, getResultVerdict } from "@/lib/achievements";
import { withBasePath } from "@/lib/assets";
import { getBudgetSourceLabel } from "@/lib/budget";
import { getCartTotal, getSpentRatio, getTotalQuantity } from "@/lib/cart";
import { formatCompactMoneyFromSek, formatMoneyFromSek, formatNumber, formatPercent } from "@/lib/format";
import { decodeShareData, encodeShareData, peekShareMode } from "@/lib/share";
import type { CompletedResult, GameMode } from "@/types";
import { Award, Copy, Download, ExternalLink, RefreshCcw, Share2, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function createShareText(result: CompletedResult, total: number, largestName: string) {
  return `${result.name} spelade ${result.mode === "luxury" ? "Miljardärsläget" : "Vardagsläget"} och köpte bland annat ${largestName}. Totalt försvann ${formatMoneyFromSek(total, result.currency)}. Kan du spendera bättre?`;
}

export function ResultClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { completedResult, hydrated, mode: activeMode, products: activeProducts, resetGame, startChallenge } = useGame();
  const { showToast } = useToast();
  const { locale } = useLanguage();
  const haul = params.get("haul");
  const sharedMode = haul ? peekShareMode(haul) : null;
  const targetMode: GameMode = sharedMode ?? completedResult?.mode ?? activeMode;
  const { catalog, state } = useCatalog(targetMode);
  const products = useMemo(() => catalog?.products ?? (targetMode === activeMode ? activeProducts : []), [catalog, targetMode, activeMode, activeProducts]);
  const shared = useMemo(() => (haul && products.length ? decodeShareData(haul, products) : null), [haul, products]);
  const invalidShared = Boolean(haul && state !== "loading" && products.length > 0 && !shared);
  const result: CompletedResult | null = shared ? {
    name: shared.name,
    mode: shared.mode,
    cart: shared.cart,
    completedAt: shared.timestamp ? new Date(shared.timestamp).toISOString() : "",
    startingBudgetSek: shared.startingBudgetSek,
    currency: shared.currency,
    budgetSource: shared.budgetSource,
  } : completedResult;
  const readOnly = Boolean(shared);

  if ((!hydrated && !haul) || (haul && (state === "loading" || products.length === 0))) return <div className="shell min-h-[65vh] py-12"><div className="h-96 animate-pulse rounded-xl bg-white/5" /></div>;
  if (invalidShared) return <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]"><div className="shell max-w-xl"><h1 className="font-display text-5xl">Den delade länken gick sönder</h1><p className="mt-4 text-black/55">Länken är trasig, ofullständig eller innehåller okända produkter.</p><Link href="/" className="primary-button mt-6">Skapa ett eget spel</Link></div></section>;
  if (!result || result.cart.length === 0) return <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]"><div className="shell max-w-xl"><h1 className="font-display text-5xl">Inget färdigt resultat ännu</h1><p className="mt-4 text-black/55">Genomför fantasiköpet i kassan så skapas sammanställningen.</p><Link href="/shop" className="primary-button mt-6">Till shoppen</Link></div></section>;

  const finalResult = result;
  const productMap = new Map(products.map((product) => [product.id, product]));
  const entries = finalResult.cart.flatMap((item) => {
    const product = productMap.get(item.productId);
    return product ? [{ item, product, subtotal: product.priceSek * item.quantity }] : [];
  }).sort((a, b) => b.subtotal - a.subtotal);
  const total = getCartTotal(finalResult.cart, products);
  const remaining = Math.max(0, finalResult.startingBudgetSek - total);
  const ratio = getSpentRatio(finalResult.cart, products, finalResult.startingBudgetSek);
  const totalQuantity = getTotalQuantity(finalResult.cart);
  const achievements = getAchievements(finalResult.cart, products, finalResult.startingBudgetSek);
  const categoryTotals = entries.reduce<Record<string, { label: string; value: number }>>((acc, entry) => {
    const current = acc[entry.product.categoryId] ?? { label: entry.product.categoryLabel, value: 0 };
    current.value += entry.subtotal;
    acc[entry.product.categoryId] = current;
    return acc;
  }, {});
  const shareCode = encodeShareData(finalResult.mode, finalResult.name, finalResult.cart, finalResult.startingBudgetSek, finalResult.currency, finalResult.budgetSource, finalResult.completedAt ? new Date(finalResult.completedAt).getTime() : 0);
  const shareUrl = typeof window !== "undefined" ? `${new URL(withBasePath("/resultat/"), window.location.origin).toString()}?haul=${shareCode}` : `?haul=${shareCode}`;
  const shareText = createShareText(finalResult, total, entries[0] ? `${entries[0].item.quantity} × ${entries[0].product.name}` : "några väl valda saker");

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareUrl);
      else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      showToast("Resultatlänken är kopierad.", "success");
    } catch { showToast("Kunde inte kopiera länken automatiskt.", "error"); }
  }
  async function shareResult() {
    if (navigator.share) {
      try { await navigator.share({ title: "Mitt Spend a Billion-resultat", text: shareText, url: shareUrl }); return; }
      catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
    }
    await copyLink();
  }
  function downloadImage() {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 1400;
    const context = canvas.getContext("2d"); if (!context) return;
    context.fillStyle = "#11110f"; context.fillRect(0, 0, 1200, 1400); context.strokeStyle = "#d3b875"; context.lineWidth = 3; context.strokeRect(55, 55, 1090, 1290);
    context.fillStyle = "#d3b875"; context.font = "700 28px Arial"; context.fillText("SPEND A BILLION", 90, 125);
    context.fillStyle = "#f5f1e8"; context.font = "700 66px Georgia"; context.fillText(finalResult.name.slice(0, 26), 90, 225);
    context.fillStyle = "#aaa59b"; context.font = "24px Arial"; context.fillText(getBudgetSourceLabel(finalResult.budgetSource).slice(0, 70), 90, 275);
    context.fillStyle = "#f5f1e8"; context.font = "700 52px Georgia"; context.fillText(formatCompactMoneyFromSek(total, finalResult.currency), 90, 370);
    context.fillStyle = "#aaa59b"; context.font = "25px Arial"; context.fillText(`${formatCompactMoneyFromSek(remaining, finalResult.currency)} kvar · ${formatPercent(ratio)} av budgeten använd`, 90, 420);
    context.fillStyle = "#f5f1e8"; context.font = "700 34px Georgia"; context.fillText("Största köp", 90, 510);
    entries.slice(0, 5).forEach((entry, index) => { const y = 600 + index * 135; context.fillStyle = "#252521"; context.fillRect(90, y - 50, 1020, 100); context.fillStyle = "#f5f1e8"; context.font = "700 27px Arial"; context.fillText(`${entry.item.quantity}× ${entry.product.name}`.slice(0, 52), 120, y - 5); context.fillStyle = "#d3b875"; context.font = "24px Arial"; context.fillText(formatCompactMoneyFromSek(entry.subtotal, finalResult.currency), 120, y + 32); });
    const link = document.createElement("a"); link.download = "spend-a-billion-resultat.png"; link.href = canvas.toDataURL("image/png"); link.click(); showToast("Resultatbilden är skapad.", "success");
  }

  return <section className="bg-[var(--paper)] py-8 text-[var(--ink)]"><div className="shell">
    {readOnly && <div className="mb-5 rounded-md border border-[var(--gold-dark)]/25 bg-[var(--gold)]/15 px-4 py-3 text-sm font-semibold">Skrivskyddat resultat. Du kan titta, dela eller starta en ny utmaning med samma budget.</div>}
    <div className="rounded-2xl bg-[var(--ink)] p-6 text-white md:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-end"><div><p className="eyebrow">{finalResult.name} · {getBudgetSourceLabel(finalResult.budgetSource)}</p><h1 className="mt-3 max-w-2xl font-display text-4xl leading-[.96] md:text-6xl">{getResultVerdict(ratio)}</h1></div><div className="grid grid-cols-2 gap-2 md:grid-cols-3">{[
      ["Startbudget", finalResult.startingBudgetSek], ["Spenderat", total], ["Kvar", remaining],
    ].map(([label, value]) => <div key={String(label)} className="min-w-0 rounded-lg bg-white/5 p-3"><p className="text-[10px] uppercase tracking-[.12em] text-white/35">{label}</p><p className="mt-1 break-words font-display text-lg leading-tight"><MoneyDisplay valueSek={Number(value)} currency={finalResult.currency} fullClassName="text-white" compactClassName="block basis-full pt-1 font-sans text-[10px] text-white/40" /></p></div>)}<div className="rounded-lg bg-white/5 p-3"><p className="text-[10px] uppercase tracking-[.12em] text-white/35">Andel av budgeten använd</p><p className="mt-1 font-display text-xl">{formatPercent(ratio)}</p></div><div className="rounded-lg bg-white/5 p-3"><p className="text-[10px] uppercase tracking-[.12em] text-white/35">Unika produkter</p><p className="mt-1 font-display text-xl">{entries.length.toLocaleString("sv-SE")}</p></div><div className="rounded-lg bg-white/5 p-3"><p className="text-[10px] uppercase tracking-[.12em] text-white/35">Totalt antal</p><p className="mt-1 font-display text-xl">{formatNumber(totalQuantity, locale)}</p></div></div></div><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[var(--gold)]" style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start"><div><div className="flex items-end justify-between gap-3"><h2 className="font-display text-4xl">Hela samlingen</h2><p className="text-xs text-black/40">Exakta belopp visas vid hovring</p></div><div className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white">{entries.map((entry) => <article key={entry.product.id} className="grid gap-2 border-b border-black/8 px-4 py-3 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--gold-dark)]">{entry.product.categoryLabel}</p><h3 className="mt-0.5 truncate font-display text-xl">{entry.item.quantity}× {entry.product.name}</h3><p className="mt-1 text-xs text-black/40">{formatMoneyFromSek(entry.product.priceSek, finalResult.currency)} / st</p></div><p className="font-display text-xl sm:text-right" title={formatMoneyFromSek(entry.subtotal, finalResult.currency)}><MoneyDisplay valueSek={entry.subtotal} currency={finalResult.currency} compactClassName="block basis-full pt-1 font-sans text-[10px] text-black/40" /></p></article>)}</div></div>
      <aside className="space-y-4 xl:sticky xl:top-24"><div className="rounded-xl border border-black/10 bg-white p-5"><div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-[var(--gold-dark)]" /><h2 className="font-display text-2xl">Achievements</h2></div><div className="mt-4 grid gap-2">{achievements.length ? achievements.map((achievement) => <div key={achievement.id} className="rounded-md bg-[var(--paper)] p-3"><p className="flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4 text-[var(--gold-dark)]" />{achievement.title}</p><p className="mt-1 text-xs leading-5 text-black/50">{achievement.description}</p></div>) : <p className="text-sm text-black/50">Inga specialutmärkelser den här gången.</p>}</div></div>
      <div className="rounded-xl border border-black/10 bg-white p-5"><h2 className="font-display text-2xl">Kategorier</h2><div className="mt-4 space-y-3">{Object.values(categoryTotals).sort((a, b) => b.value - a.value).slice(0, 8).map((entry) => <div key={entry.label}><div className="flex justify-between gap-3 text-xs"><span>{entry.label}</span><strong title={formatMoneyFromSek(entry.value, finalResult.currency)}><MoneyDisplay valueSek={entry.value} currency={finalResult.currency} compactClassName="hidden" /></strong></div><div className="mt-1 h-1 overflow-hidden rounded bg-black/8"><div className="h-full bg-[var(--gold-dark)]" style={{ width: `${total ? (entry.value / total) * 100 : 0}%` }} /></div></div>)}</div></div>
      <div className="rounded-xl bg-[var(--ink)] p-5 text-white"><div className="flex items-center gap-2"><Share2 className="h-5 w-5 text-[var(--gold)]" /><h2 className="font-display text-2xl">Dela resultatet</h2></div><p className="mt-2 text-xs leading-5 text-white/50">{shareText}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={copyLink} className="share-button"><Copy className="h-4 w-4" /> Kopiera länk</button><button type="button" onClick={shareResult} className="share-button bg-[var(--gold)] text-black"><ExternalLink className="h-4 w-4" /> Dela</button><button type="button" onClick={downloadImage} className="share-button col-span-2"><Download className="h-4 w-4" /> Resultatbild</button><button type="button" onClick={async () => { await startChallenge({ name: "Future Challenger", mode: finalResult.mode, cart: [], startingBudgetSek: finalResult.startingBudgetSek, currency: finalResult.currency, budgetSource: finalResult.budgetSource }); router.push("/shop"); }} className="share-button col-span-2 border-[var(--gold)]/40 text-[var(--gold)]"><RefreshCcw className="h-4 w-4" /> Utmana en vän med samma budget</button></div></div>
      <AdSlot placement="result-rail" />
      <button type="button" onClick={() => { resetGame(); router.push("/"); }} className="primary-button w-full"><Sparkles className="h-4 w-4" /> Skapa ett nytt spel</button></aside></div>
  </div></section>;
}
