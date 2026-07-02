import type { ImageManifest } from "@/types";
import { ExternalLink, ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";

export const metadata: Metadata = { title: "Bildkällor" };
export const dynamic = "force-static";

function readManifest(): ImageManifest {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), "public", "data", "image-manifest.json"), "utf8")) as ImageManifest;
  } catch {
    return { version: 1, generatedAt: "", images: [] };
  }
}

export default function ImageSourcesPage() {
  const sourced = readManifest().images.filter((image) => image.status === "approved");
  return <section className="bg-[var(--paper)] py-12 text-[var(--ink)]"><div className="shell max-w-6xl"><p className="eyebrow text-[var(--gold-dark)]">Automatiskt bildregister</p><h1 className="mt-3 font-display text-5xl md:text-6xl">Bildkällor</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">Godkända bilder läses från ett centralt manifest. Produkter utan godkänd bild använder automatiskt en kategoribaserad placeholder.</p>{sourced.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-black/20 bg-white/55 p-10 text-center"><ImageIcon className="mx-auto h-7 w-7 text-black/35" /><h2 className="mt-3 font-display text-3xl">Inga externa bilder är godkända ännu</h2><p className="mt-2 text-sm text-black/50">När bildimporteraren eller en manuell import lägger till godkänd metadata visas den här.</p></div> : <div className="mt-8 overflow-x-auto rounded-xl border border-black/10 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-black/[.035]"><tr><th className="p-3">Produkt-id</th><th className="p-3">Fotograf</th><th className="p-3">Källa</th><th className="p-3">Licens</th></tr></thead><tbody>{sourced.map((image) => <tr key={image.productId} className="border-t border-black/8"><td className="p-3 font-mono text-xs">{image.productId}</td><td className="p-3">{image.creator ?? "Ej angivet"}</td><td className="p-3"><a href={image.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">Öppna <ExternalLink className="h-3 w-3" /></a></td><td className="p-3">{image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noreferrer" className="underline">{image.license}</a> : image.license}</td></tr>)}</tbody></table></div>}</div></section>;
}
