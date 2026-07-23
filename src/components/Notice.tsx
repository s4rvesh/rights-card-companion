import meta from "@/content/meta.json";
import { useLang } from "@/i18n/useLang";

/**
 * Standing disclaimer for screens carrying legal or medical content.
 * Deliberately not alert-red: red is reserved for live emergencies in this
 * app, and a permanent red bar teaches people to ignore red.
 */
export function Notice({ kind }: { kind: "legal" | "medical" }) {
  const { t } = useLang();
  const key = kind === "legal" ? "draft_banner" : "medical_banner";
  return (
    <div className="mx-4 mb-1 mt-2 rounded-[14px] border border-steel/30 bg-paper px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wide text-steel">
        {t(meta, "notice_label")}
      </div>
      <p className="mt-1 font-sans text-[13.5px] leading-snug text-ink/80">
        {t(meta, key)}
      </p>
    </div>
  );
}
