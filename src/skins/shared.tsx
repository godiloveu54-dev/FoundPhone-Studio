import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LockKeyhole,
  Plus,
  Search,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { SkinProps } from "../AppSkins";
import { safeMedia, type Item } from "../schema";
export type Props = SkinProps;
export const meta = (
  i: Pick<Item, "meta"> | undefined,
  key: string,
  fallback = "",
) => String(i?.meta?.[key] ?? fallback);
export function Header({ p, children }: { p: Props; children?: ReactNode }) {
  return (
    <header
      className="app-nav catalog-nav"
      data-authoring={p.creator}
      data-root={!p.thread}
    >
      <button aria-label="返回" onClick={p.onBack}>
        <ChevronLeft size={22} />
      </button>
      <strong>{p.name}</strong>
      <div>
        {children}
        {p.creator && (
          <button aria-label="新增内容" onClick={p.onAdd}>
            <Plus size={21} />
          </button>
        )}
      </div>
    </header>
  );
}
export function Tabs({
  tabs,
  value,
  set,
  icons,
}: {
  tabs: string[];
  value: string;
  set: (s: string) => void;
  icons?: ReactNode[];
}) {
  return (
    <nav className="catalog-tabs">
      {tabs.map((t, i) => (
        <button
          key={t}
          className={value === t ? "selected" : ""}
          onClick={() => set(t)}
        >
          {icons?.[i]}
          <span>{t}</span>
        </button>
      ))}
    </nav>
  );
}
export function SearchBox({
  value,
  set,
  placeholder = "搜索",
}: {
  value: string;
  set: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="catalog-search">
      <Search size={15} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}
export function Avatar({
  name,
  round = true,
  src = "",
}: {
  name: string;
  round?: boolean;
  src?: string;
}) {
  const avatarByName: Record<string, string> = {
    "陈浚铭": "./IMG_4390.jpeg",
    "张桂源": "./IMG_4391.jpeg",
    "左奇函": "./IMG_4392.jpeg",
    "陈思罕": "./IMG_4393.jpeg",
    "杨博文": "./IMG_4394.jpeg",
    "张函瑞": "./IMG_4395.jpeg",
    "王橹杰": "./IMG_4396.jpeg",
    "陈奕恒": "./IMG_4398.jpeg",
  };
  const normalizedName = name.replace(/^TF家族[-·]/, "").replace(/Jonathan|chen$/i, "").trim();
  const fallbackAvatar = Object.entries(avatarByName).find(([person]) => normalizedName.includes(person))?.[1] || "";
  const image = safeMedia(src || avatarByName[normalizedName] || fallbackAvatar);
  return (
    <span className={`catalog-avatar ${round ? "round" : ""}`}>
      {image && /^(data:image\/|https?:\/\/|\.\.?\/)/.test(image) ? (
        <img src={image} alt={name} loading="lazy" decoding="async" />
      ) : (
        name.slice(0, 1) || "人"
      )}
    </span>
  );
}
export function Media({
  item,
  className = "",
}: {
  item: Item;
  className?: string;
}) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio className={className} controls src={src} />
    ) : item.kind === "video" ? (
      <video
        className={className}
        controls
        playsInline
        src={src}
        preload="none"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <img className={className} loading="lazy" decoding="async" alt={item.title} src={src} />
    )
  ) : (
    <div className={`catalog-art ${className}`}>
      <span>{item.title}</span>
    </div>
  );
}
export function Row({
  item,
  onItem,
  leading,
  children,
}: {
  item: Item;
  onItem: (i: Item) => void;
  leading?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button className="catalog-row" onClick={() => onItem(item)}>
      {leading ?? <FileText size={22} />}
      <span>
        <strong>{item.title}</strong>
        <p>{item.body.split("\n")[0]}</p>
        <small>{item.time}</small>
      </span>
      {children ??
        (item.password ? (
          <LockKeyhole size={13} />
        ) : (
          <ChevronRight size={15} />
        ))}
    </button>
  );
}
export function Empty({
  items,
  label = "暂无内容",
}: {
  items: Item[];
  label?: string;
}) {
  return !items.length ? <p className="catalog-empty">{label}</p> : null;
}
export function Add({ p, label = "添加内容" }: { p: Props; label?: string }) {
  return p.creator ? (
    <button className="catalog-add" onClick={p.onAdd}>
      <Plus size={15} />
      {label}
    </button>
  ) : null;
}
export function useContent(p: Props, first: string) {
  const [tab, setTab] = useState(first),
    [q, setQ] = useState("");
  const items = p.items.filter((i) =>
    (
      i.title +
      i.body +
      i.sender +
      i.folder +
      Object.values(i.meta ?? {}).join(" ")
    )
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return { tab, setTab, q, setQ, items };
}
export function groupItems(items: Item[], fallback = "未分类") {
  return [...new Set(items.map((i) => i.folder || fallback))];
}
