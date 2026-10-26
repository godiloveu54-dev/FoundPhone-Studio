import { NativeComposer } from "./DeviceSystem";
import { useSkinState } from "./skinState";
import { Fragment, useState } from "react";
import {
  ChevronLeft,
  Plus,
  CirclePlus,
  Search,
  MessageCircle,
  Users,
  Compass,
  User,
  Camera,
  Phone,
  Video,
  Settings,
  Heart,
  Send,
  Home,
  Play,
  Bookmark,
  MoreHorizontal,
  Mic,
  Smile,
  Grid,
  CheckCheck,
  AtSign,
  Star,
  Music,
  Image as ImageIcon,
  Layers,
  ShoppingBag,
  Gift,
  Wallet,
  X,
} from "lucide-react";
import { safeMedia, type Item, type UiValue } from "./schema";
export type SkinProps = {
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
  appId?: string;
  owner?: string;
  virtualTime?: string;
  name: string;
  items: Item[];
  creator: boolean;
  onRead: (id: string) => void;
  onItem: (i: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  thread: string;
  onThread: (s: string) => void;
  onReply?: (thread: string, text: string) => void;
};
function Avatar({
  name,
  round = false,
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
    "聂玮辰": "./IMG_4400.jpeg",
    "李煜东": "./IMG_4405.jpeg",
    "杨涵博": "./IMG_4415.jpeg",
    "官俊臣": "./IMG_4419.jpeg",
    "张奕然": "./IMG_4425.jpeg",
    "魏子宸": "./IMG_4426.jpeg",
  };
  const normalizedName = name.replace(/^TF家族[-·]/, "").trim();
  const image = safeMedia(src || avatarByName[normalizedName] || "");
  return (
    <span className={`skin-avatar ${round ? "round" : ""}`}>
      {image && /^(data:image\/|https?:\/\/|\.\.?\/|\/)/i.test(image) ? (
        <img src={image} alt={name} loading="lazy" decoding="async" />
      ) : (
        name.slice(0, 1) || "人"
      )}
    </span>
  );
}
function ItemMedia({ item }: { item: Item }) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline preload="none" src={src} />
    ) : (
      <img loading="lazy" decoding="async" alt={item.title} src={src} />
    )
  ) : (
    <div className="skin-photo">
      <span>{item.title}</span>
    </div>
  );
}
function MessageList({
  items,
  creator,
  onItem,
  onRead,
  whatsapp = false,
}: {
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
}) {
  const [playingAudio, setPlayingAudio] = useState("");
  const [callDetail, setCallDetail] = useState<Item | null>(null);
  return (
    <div className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""}`}>
      <div className="skin-date">{items[0]?.time.slice(0, 10)}</div>
      {items.map((i, index) => (
        <Fragment key={i.id}>
        {(index === 0 || items[index - 1].time.slice(0, 10) !== i.time.slice(0, 10)) && (
          <div className="wx-history-date-divider">{i.time.slice(0, 10).replaceAll("-", ".")}</div>
        )}
        <div
          key={i.id}
          className={`skin-message ${i.outgoing ? "outgoing" : ""}`}
        >
          {!whatsapp && !i.outgoing && (
            <Avatar name={i.sender} src={i.avatar} />
          )}
          <button
            className={`skin-bubble ${i.kind === "call" ? "wx-call-bubble" : ""}`}
            onClick={() => {
              if (i.kind === "call") setCallDetail(i);
              else if (i.kind === "audio") setPlayingAudio((current) => current === i.id ? "" : i.id);
              else if (creator) onItem(i);
              else onRead(i.id);
            }}
          >
            {i.kind === "audio" ? (
              <span className={`wx-voice-message ${playingAudio === i.id ? "is-playing" : ""}`}>
                <span className="wx-voice-wave">)))</span>
                <span>语音消息</span>
                {playingAudio === i.id && <span className="wx-voice-playing">播放中…</span>}
                {i.meta?.transcript && <small className="wx-voice-transcript">转文字：{i.meta.transcript}</small>}
              </span>
            ) : i.kind === "call" ? (
              <span className="wx-call-message">
                <Phone size={17} />
                <span>{i.meta?.callType || "通话记录"}<small>{i.meta?.status || "记录"}</small></span>
                {i.meta?.duration && <b>{i.meta.duration}</b>}
              </span>
            ) : ["image", "video"].includes(i.kind) ? (
              <ItemMedia item={i} />
            ) : i.kind === "transfer" ? (
              <div className="skin-transfer">
                ¥ {i.body}
                <small>转账记录 · 虚构</small>
              </div>
            ) : (
              i.body
            )}
            {whatsapp && i.outgoing && (
              <small className="wx-message-time"><CheckCheck size={11} /></small>
            )}
          </button>
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src={i.avatar} />}
        </div>
        </Fragment>
      ))}
      {callDetail && (
        <div className="wx-call-detail-backdrop" role="presentation" onClick={() => setCallDetail(null)}>
          <section className="wx-call-detail" role="dialog" aria-label="通话记录详情" onClick={(e) => e.stopPropagation()}>
            <button className="wx-call-detail-close" onClick={() => setCallDetail(null)}>关闭</button>
            <Phone size={28} />
            <h3>{callDetail.meta?.callType || "通话记录"}</h3>
            <p>{callDetail.meta?.status || "已记录"}</p>
            <p>{callDetail.time}</p>
            {callDetail.meta?.duration && <p>通话时长：{callDetail.meta.duration}</p>}
            <small>仅展示已配置的通话记录，不包含未提供的通话内容。</small>
          </section>
        </div>
      )}
    </div>
  );
}
function Compose({
  creator,
  onAdd,
  wa = false,
  onPlus,
}: {
  creator: boolean;
  onAdd: () => void;
  wa?: boolean;
  onPlus?: () => void;
}) {
  return (
    <div className={`skin-compose ${wa ? "wa-compose" : ""}`}>
      {wa ? <Plus size={20} /> : <Mic size={20} />}
      <NativeComposer creator={creator} onAdd={onAdd} />

      <Smile size={21} />
      {wa ? <Mic size={20} /> : <button aria-label="更多功能" className="wx-compose-plus" onClick={onPlus}><Plus size={22} /></button>}
    </div>
  );
}
export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信"),
    [query, setQuery] = useState(""),
    [moments, setMoments] = useState(false),
    [menu, setMenu] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [utility, setUtility] = useState(""),
    [selectedYear, setSelectedYear] = useState(""),
    [plusMenu, setPlusMenu] = useState(false),
    [financeMode, setFinanceMode] = useState(""),
    [transferAmount, setTransferAmount] = useState(""),
    [financeMessages, setFinanceMessages] = useState<Item[]>([]);
  const [composerOpen, setComposerOpen] = useState(false),
    [draftPost, setDraftPost] = useState(""),
    [draftImage, setDraftImage] = useState(""),
    [draftImageName, setDraftImageName] = useState(""),
    [postError, setPostError] = useState("");
  const [savedMomentPosts, setSavedMomentPosts] = useSkinState<string[]>(
    p,
    "wechatMomentsUserPosts",
    [],
  );
  const [bankBalance, setBankBalance] = useSkinState<number>(p, "wechatBankBalance", 1000000);
  const [readThreads, setReadThreads] = useSkinState<string[]>(
    p,
    "readThreads",
    [],
  );
  const allChatItems = [...p.items, ...financeMessages];
  const conversations = [
    ...new Set(
      allChatItems
        .filter((i) => !["朋友圈", "我"].includes(i.folder))
        .map((i) => i.title),
    ),
  ].sort((a, b) => {
    const latestA = allChatItems.filter((i) => i.title === a).reduce((latest, i) => i.time > latest ? i.time : latest, "");
    const latestB = allChatItems.filter((i) => i.title === b).reduce((latest, i) => i.time > latest ? i.time : latest, "");
    return latestB.localeCompare(latestA);
  });
  // 固定通讯录名单按微信常见的拼音首字母分组；额外配置在聊天记录里的联系人也会保留。
  const preferredContacts = [
    "爸爸", "陈浚铭", "陈思罕", "陈奕恒", "哥哥", "官俊臣", "李煜东",
    "妈妈", "聂玮辰", "王橹杰", "杨博文", "杨涵博",
    "张桂源", "张函瑞", "张奕然", "左奇函", "魏子宸",
    "飞总", "stf",
  ];
  const extraContacts = p.items
    .map((i) => i.sender)
    .filter((s) => s !== "我" && !preferredContacts.includes(s));
  const contacts = [...preferredContacts, ...extraContacts];
  // 已配置的微信模拟群聊与成员名单。
  const groupChats = [
    { name: "金牛（3）", members: ["张桂源", "陈浚铭", "陈奕恒"] },
    { name: "四代同堂", members: ["杨博文", "张桂源", "张函瑞", "官俊臣", "王橹杰", "聂玮辰", "张奕然", "陈奕恒", "陈浚铭", "陈思罕", "魏子宸", "杨涵博", "李煜东"] },
    { name: "四一", members: ["张桂源", "张函瑞", "王橹杰", "左奇函", "陈奕恒", "杨博文", "陈思罕", "陈浚铭"] },
    { name: "瓦", members: ["张桂源", "杨涵博", "陈浚铭"] },
    { name: "幸福一家人", members: ["陈浚铭", "哥哥", "爸爸", "妈妈"] },
  ];

  const contactGroups: Record<string, string[]> = {
    B: contacts.filter((c) => c === "爸爸"),
    C: ["陈浚铭", "陈思罕", "陈奕恒"].filter((c) => contacts.includes(c)),
    G: ["哥哥", "官俊臣"].filter((c) => contacts.includes(c)),
    L: contacts.filter((c) => c === "李煜东"),
    M: contacts.filter((c) => c === "妈妈"),
    N: contacts.filter((c) => c === "聂玮辰"),
    W: ["王橹杰", "王烁然", "魏子宸"].filter((c) => contacts.includes(c)),
    Y: ["杨博文", "杨涵博"].filter((c) => contacts.includes(c)),
    Z: ["张桂源", "张函瑞", "张奕然", "诸葛", "左航航酱", "左奇函"].filter((c) => contacts.includes(c)),
    F: contacts.filter((c) => c === "飞总"),
    S: contacts.filter((c) => c.toLowerCase() === "stf"),
  };
  // 未预设的联系人按名称归入对应首字母区，避免聊天记录中的其他联系人消失。
  for (const c of extraContacts) {
    const letter = /^[A-Z]/i.test(c) ? c[0].toUpperCase() : "#";
    if (!contactGroups[letter]) contactGroups[letter] = [];
    if (!contactGroups[letter].includes(c)) contactGroups[letter].push(c);
  }
  const userPosts: Item[] = savedMomentPosts.flatMap((raw) => {
    try {
      const parsed = JSON.parse(raw) as Item;
      return parsed && parsed.kind === "post" && parsed.sender === (p.owner || "我") ? [parsed] : [];
    } catch {
      return [];
    }
  });
  const posts = [...p.items.filter((i) => i.folder === "朋友圈" || i.kind === "post"), ...userPosts]
    .sort((a, b) => b.time.localeCompare(a.time));
  return (
    <div
      className="wechat-ui independent-skin"
      data-tab={tab}
      data-thread={!!p.thread}
      data-moments={moments}
      data-utility={!!utility}
    >
      <div className="app-nav wx-nav">
        <button
          aria-label={utility || p.thread || moments ? "返回" : "收藏"}
          onClick={() =>
            utility
              ? utility === "按日期查找" && selectedYear
                ? setSelectedYear("")
                : setUtility("")
              : p.thread
                ? p.onThread("")
                : moments
                  ? setMoments(false)
                  : setUtility("收藏")
          }
        >
          {utility || p.thread || moments ? (
            <ChevronLeft size={22} />
          ) : (
            <Star size={22} />
          )}
        </button>
        <strong>
          {utility ||
            p.thread ||
            (moments ? "朋友圈" : tab === "微信" ? p.name : tab)}
        </strong>
        <button
          aria-label={
            p.creator ? "新增内容" : p.thread ? "聊天详情" : "微信菜单"
          }
          onClick={
            p.creator
              ? p.onAdd
              : () => (p.thread ? setUtility("聊天信息") : setMenu(!menu))
          }
        >
          {p.thread ? <MoreHorizontal size={22} /> : <CirclePlus size={22} />}
        </button>
      </div>
      {menu && (
        <div className="wx-popup-menu" role="menu">
          {["搜索", "发起群聊", "添加朋友", "扫一扫", "收付款"].map((label) => (
            <button
              role="menuitem"
              key={label}
              onClick={() => {
                setMenu(false);
                if (label === "搜索") {
                  setSearchOpen(true);
                } else setUtility(label);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {utility ? (
        <div className="skin-scroll wx-utility">
          {utility === "按日期查找" ? (
            selectedYear ? (
              <div className="wx-year-history">
                <p className="wx-year-caption">{selectedYear} 年 · 全部聊天记录</p>
                <MessageList
                  items={p.items
                    .filter((i) => i.title === p.thread && /^\d{4}/.test(i.time) && i.time.slice(0, 4) === selectedYear)
                    .sort((a, b) => b.time.localeCompare(a.time))}
                  creator={p.creator}
                  onItem={p.onItem}
                  onRead={p.onRead}
                />
                {!p.items.some((i) => i.title === p.thread && i.time.slice(0, 4) === selectedYear) && (
                  <p className="skin-empty">这一年还没有配置聊天记录</p>
                )}
              </div>
            ) : (
              <div className="wx-year-picker">
                <p>按年份查找聊天记录</p>
                {["2023", "2024", "2025", "2026"].map((year) => (
                  <button key={year} className="wx-year-row" onClick={() => setSelectedYear(year)}>
                    <span>{year} 年</span><span>›</span>
                  </button>
                ))}
              </div>
            )
          ) : null}
          {utility === "群聊" && (
            <div className="wx-group-chat-list">
              {groupChats.map((group) => (
                <button
                  key={group.name}
                  className="wx-chat-row wx-group-chat-row"
                  onClick={() => { setUtility(""); p.onThread(group.name); }}
                >
                  <span className="wx-chat-avatar"><Avatar name="群" /></span>
                  <div>
                    <strong>{group.name}</strong>
                    <p>{group.members.join("、")}</p>
                  </div>
                  <small>{group.members.length} 人</small>
                </button>
              ))}
            </div>
          )}
          {utility === "聊天信息" && (
            <>
            <div className="wx-members">
              {[
                ...new Set(
                  p.items
                    .filter((i) => i.title === p.thread)
                    .map((i) => i.sender),
                ),
              ].map((name) => (
                <div key={name}>
                  <Avatar
                    name={name}
                    src={p.items.find((i) => i.sender === name)?.avatar || p.items.find((i) => i.title === name)?.avatar}
                  />
                  <small>{name}</small>
                </div>
              ))}
            </div>
            <button className="wx-discovery" onClick={() => { setSelectedYear(""); setUtility("按日期查找"); }}>
              按日期查找 <span>›</span>
            </button>
            </>
          )}
          {utility !== "按日期查找" && p.items
            .filter((i) => i.folder === utility)
            .map((i) => (
              <button
                key={i.id}
                className="wx-discovery"
                onClick={() => p.onItem(i)}
              >
                {i.title}
                <span>›</span>
              </button>
            ))}
          {!p.items.some((i) => i.folder === utility) &&
            utility !== "聊天信息" && utility !== "按日期查找" && utility !== "群聊" && <p className="skin-empty">暂无内容</p>}
        </div>
      ) : p.thread ? (
        <>
          <MessageList
            items={allChatItems.filter((i) => i.title === p.thread).sort((a, b) => b.time.localeCompare(a.time))}
            creator={p.creator}
            onItem={p.onItem}
            onRead={p.onRead}
          />
          {groupChats.some((group) => group.name === p.thread) && !allChatItems.some((i) => i.title === p.thread) && (
            <section className="wx-group-members-panel">
              <div className="wx-group-members-title">群成员（{groupChats.find((group) => group.name === p.thread)?.members.length}）</div>
              <div className="wx-group-members-grid">
                {groupChats.find((group) => group.name === p.thread)?.members.map((member) => (
                  <div key={member}><Avatar name={member} /><small>{member}</small></div>
                ))}
              </div>
              <p>以上为已配置的群成员。聊天记录可后续继续添加。</p>
            </section>
          )}
          {p.thread === "四代同堂" && !p.creator && (
            <div className="wx-quick-replies">
              <button style={{ padding: "7px 18px", borderRadius: 18, border: "1px solid #d8e5ff", background: "#eef4ff", color: "#2468d7", fontWeight: 600 }} onClick={() => p.onReply?.(p.thread!, "收到")}>收到</button>
            </div>
          )}
          {p.thread === "张桂源" && !p.creator && (
            <div className="wx-quick-replies">
              <button style={{ padding: "7px 12px", borderRadius: 18, border: "1px solid #d8e5ff", background: "#eef4ff", color: "#2468d7", fontWeight: 600 }} onClick={() => p.onReply?.(p.thread!, "解冻了好开心")}>解冻了好开心</button>
              <button style={{ padding: "7px 12px", borderRadius: 18, border: "1px solid #d8e5ff", background: "#eef4ff", color: "#2468d7", fontWeight: 600 }} onClick={() => p.onReply?.(p.thread!, "不能耍起了呀")}>不能耍起了呀</button>
            </div>
          )}
          <Compose creator={p.creator} onAdd={p.onAdd} onPlus={() => setPlusMenu((v) => !v)} />
        </>
      ) : moments ? (
        <div className="wx-moments">
          <div className="wx-moment-cover">
            <span>朋友圈</span>
            <button className="wx-moment-camera" aria-label="发布朋友圈" onClick={() => { setPostError(""); setComposerOpen(true); }}>
              <Camera size={25} />
            </button>
          </div>
          {posts.map((i) => (
            <button
              key={i.id}
              className="wx-moment-post"
              onClick={() => p.onItem(i)}
            >
              <Avatar name={i.sender} />
              <div>
                <strong>{i.sender}</strong>
                <p>{i.body}</p>
                {i.media && <ItemMedia item={i} />}
                <small>{i.time.slice(0, 10)}{i.meta?.location ? ` · ${i.meta.location}` : ""}</small>
                {i.comments.length > 0 && <div className="wx-moment-comment-preview">{i.comments.slice(0, 2).map((comment, n) => <p key={n}>{comment}</p>)}</div>}
              </div>
            </button>
          ))}
          {composerOpen && (
            <div className="wx-moment-composer-backdrop" role="presentation" onClick={() => setComposerOpen(false)}>
              <section className="wx-moment-composer" role="dialog" aria-modal="true" aria-label="发表朋友圈" onClick={(e) => e.stopPropagation()}>
                <header><button onClick={() => setComposerOpen(false)}>取消</button><strong>发表朋友圈</strong><button className="wx-moment-send" disabled={!draftPost.trim() && !draftImage} onClick={() => {
                  const now = new Date();
                  const time = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0") + " " + String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
                  const keywordReplies: [RegExp, string[]][] = [
                    [/吃|饭|奶茶|蛋糕|好吃|饿/, ["陈奕恒：给我也尝一口！😋", "陈浚铭：你又背着我吃好吃的！", "张桂源：看着就香哈哈哈"]],
                    [/累|困|睡|熬夜|辛苦/, ["陈浚铭：辛苦啦，早点休息。", "陈奕恒：别太累了！", "杨博文：劳逸结合啊"]],
                    [/雪|下雨|天气|冷|热|太阳/, ["官俊臣：我也想出去玩！", "陈浚铭：这天气真的绝了😁", "张函瑞：记得穿暖和点～"]],
                    [/帅|美|漂亮|自拍|照片|拍照/, ["陈奕恒：拍得不错嘛😎", "张桂源：这不得多发几张？", "左奇函：很会拍💅"]],
                    [/想你|想念|喜欢|爱/, ["陈浚铭：突然这么煽情啊🥹", "陈奕恒：谁呀谁呀，展开说说！", "张函瑞：嘿嘿嘿～"]],
                  ];
                  const matching = keywordReplies.find(([pattern]) => pattern.test(draftPost));
                  const pool = matching?.[1] || [
                    "陈奕恒：哈哈哈哈哈哈😂",
                    "陈浚铭：你这条我必须评论一下😁",
                    "杨博文：？展开讲讲",
                    "张桂源：笑死我了哈哈哈",
                    "张函瑞：好可爱！",
                    "王橹杰：哈哈哈哈",
                    "官俊臣：带我一个！",
                    "左奇函：有点东西💅",
                    "陈思罕：👍",
                  ];
                  const shuffled = [...pool].sort(() => Math.random() - 0.5);
                  const chosen = shuffled.slice(0, 1 + Math.floor(Math.random() * 2));
                  const event: Item = {
                    id: "wechat-moment-user-" + Date.now(),
                    title: (p.owner || "我") + "的朋友圈",
                    body: draftPost.trim(),
                    richText: "",
                    meta: { source: "用户发布" },
                    time,
                    sender: p.owner || "我",
                    avatar: "",
                    kind: "post",
                    media: draftImage,
                    hidden: false,
                    unlock: "",
                    password: "",
                    folder: "朋友圈",
                    favorite: false,
                    outgoing: true,
                    read: true,
                    likes: 0,
                    comments: chosen,
                  };
                  setSavedMomentPosts((current) => [...current, JSON.stringify(event)]);
                  setDraftPost("");
                  setDraftImage("");
                  setDraftImageName("");
                  setPostError("");
                  setComposerOpen(false);
                }}>发表</button></header>
                <textarea aria-label="朋友圈文字" placeholder="这一刻的想法…" value={draftPost} onChange={(e) => setDraftPost(e.target.value)} />
                {draftImage && <div className="wx-moment-image-preview"><img src={draftImage} alt="待发布图片" /><button onClick={() => { setDraftImage(""); setDraftImageName(""); }}>移除图片</button></div>}
                <label className="wx-moment-image-picker"><ImageIcon size={22} /><span>{draftImageName || "添加图片"}</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1500000) { setPostError("图片请控制在 1.5MB 以内，再选择一次。"); e.currentTarget.value = ""; return; }
                  const reader = new FileReader();
                  reader.onload = () => {
                    const value = typeof reader.result === "string" ? reader.result : "";
                    if (/^data:image\/(png|jpeg|webp|gif);base64,/.test(value)) { setDraftImage(value); setDraftImageName(file.name); setPostError(""); }
                    else setPostError("这张图片无法读取，请重新选择。");
                  };
                  reader.readAsDataURL(file);
                }} /></label>
                {postError && <p className="wx-moment-error">{postError}</p>}
                <small>发布后会显示在朋友圈；好友评论由本地随机回复规则生成，并非 AI 实时对话。</small>
              </section>
            </div>
          )}
          {!posts.length && <p className="skin-empty">暂无朋友圈动态</p>}
          {p.creator && (
            <button className="phone-add" onClick={p.onAdd}>
              添加朋友圈动态
            </button>
          )}
        </div>
      ) : (
        <div className="skin-scroll">
          {tab === "微信" ? (
            <>
              {searchOpen && (
                <label className="wx-search">
                  <Search size={14} />
                  <input
                    aria-label="搜索微信内容"
                    placeholder="搜索"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              )}
              {conversations
                .filter(
                  (t) =>
                    t.includes(query) ||
                    p.items.some(
                      (i) => i.title === t && i.body.includes(query),
                    ),
                )
                .map((t) => {
                  const list = p.items.filter((i) => i.title === t).sort((a, b) => b.time.localeCompare(a.time)),
                    last = list[0];
                  return (
                    <button
                      className="wx-chat-row"
                      key={t}
                      onClick={() => {
                        setReadThreads((v) => (v.includes(t) ? v : [...v, t]));
                        p.onThread(t);
                        p.onRead(t);
                      }}
                    >
                      <span className="wx-chat-avatar">
                        <Avatar name={t} src={last.avatar || p.items.find((i) => i.sender === t)?.avatar || p.items.find((i) => i.title === t)?.avatar} />
                        {!readThreads.includes(t) &&
                          list.some((i) => !i.read) && (
                            <b className="wx-unread">
                              {list.filter((i) => !i.read).length}
                            </b>
                          )}
                      </span>
                      <div>
                        <strong>{t}</strong>
                        <p>{last.body}</p>
                      </div>
                      <time>{last.time.slice(0, 10)}</time>
                    </button>
                  );
                })}
              {!conversations.length && <p className="skin-empty">暂无聊天</p>}
            </>
          ) : tab === "通讯录" ? (
            <>
              <div className="wx-contact-shortcuts">
                {["新的朋友", "群聊", "标签", "公众号"].map((label, index) => (
                  <button key={label} className="wx-contact-shortcut" onClick={() => { if (label === "群聊") setUtility("群聊"); }}>
                    <span>{["＋", "👥", "🏷", "◎"][index]}</span>{label}
                  </button>
                ))}
              </div>
              {Object.entries(contactGroups)
                .filter(([, names]) => names.length > 0)
                .map(([letter, names]) => (
                  <section className="wx-contact-group" key={letter} id={`wx-contact-${letter}`}>
                    <div className="wx-section-label">{letter}</div>
                    {names.map((c) => (
                      <button
                        key={c}
                        className="wx-contact"
                        onClick={() => {
                          const item = p.items.find((i) => i.sender === c);
                          p.onThread(item?.title || c);
                          p.onRead(item?.title || c);
                        }}
                      >
                        <Avatar
                          name={c}
                          src={p.items.find((i) => i.sender === c)?.avatar || p.items.find((i) => i.title === c)?.avatar}
                        />
                        {c}
                      </button>
                    ))}
                  </section>
                ))}
              <nav className="wx-contact-index" aria-label="通讯录字母索引">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("").map((letter) => (
                  <button
                    key={letter}
                    disabled={!contactGroups[letter]?.length}
                    onClick={() => document.getElementById(`wx-contact-${letter}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >{letter}</button>
                ))}
              </nav>
            </>
          ) : tab === "发现" ? (
            <div className="wx-discover-groups">
              {[
                [Camera, "朋友圈", "#26a958"],
                [Play, "视频号", "#fa9d3b"],
                [Music, "听一听", "#fa5151"],
              ].map(([Icon, label, color]) => {
                const Glyph = Icon as typeof Camera;
                return (
                  <button
                    key={String(label)}
                    className="wx-discovery"
                    onClick={() =>
                      label === "朋友圈"
                        ? setMoments(true)
                        : setUtility(String(label))
                    }
                  >
                    <Glyph size={22} style={{ color: String(color) }} />
                    {String(label)}
                    <span>›</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="wx-profile">
                <Avatar name={p.owner || "机主"} src={p.owner === "陈浚铭" ? "./IMG_4390.jpeg" : ""} />
                <div>
                  <h2>{p.owner || "机主"}</h2>
                  <small>微信号：未设置</small>
                  <button
                    className="wx-profile-status"
                    onClick={() => setUtility("状态")}
                  >
                    ＋ 状态
                  </button>
                </div>
              </div>
              <div className="wx-profile-menu">
                {[
                  [MessageCircle, "服务", "#07c160"],
                  [Layers, "收藏", "#e8a828"],
                  [ImageIcon, "朋友圈", "#3a9bd9"],
                  [Layers, "作品", "#329dd8"],
                  [ShoppingBag, "小店与卡包", "#ed7c59"],
                  [Smile, "表情", "#f7b900"],
                  [Settings, "设置", "#1696d2"],
                ].map(([Icon, label, color]) => {
                  const Glyph = Icon as typeof Settings;
                  return (
                    <button
                      key={String(label)}
                      className="wx-discovery"
                      onClick={() =>
                        label === "朋友圈"
                          ? setMoments(true)
                          : setUtility(String(label))
                      }
                    >
                      <Glyph size={22} style={{ color: String(color) }} />
                      {String(label)}
                      <span>›</span>
                    </button>
                  );
                })}
              </div>
              {p.items
                .filter((i) => i.folder === "我")
                .map((i) => (
                  <button
                    className="wx-discovery"
                    key={i.id}
                    onClick={() => p.onItem(i)}
                  >
                    <User size={18} />
                    {i.title}
                    <span>›</span>
                  </button>
                ))}
              {p.creator && (
                <button className="phone-add" onClick={p.onAdd}>
                  编辑个人资料内容
                </button>
              )}
            </>
          )}
        </div>
      )}
      {p.thread && plusMenu && (
        <div className="wx-plus-panel" role="dialog" aria-label="聊天更多功能">
          <button onClick={() => { setPlusMenu(false); setFinanceMode("gift"); }}><span className="wx-plus-icon gift"><Gift size={22} /></span><small>礼物</small></button>
          <button onClick={() => { setPlusMenu(false); setFinanceMode("transfer"); }}><span className="wx-plus-icon transfer"><Wallet size={22} /></span><small>转账</small></button>
        </div>
      )}
      {financeMode === "transfer" && (
        <div className="wx-finance-backdrop" role="presentation" onClick={() => setFinanceMode("")}>
          <section className="wx-finance-sheet" role="dialog" aria-label="微信转账" onClick={(e) => e.stopPropagation()}>
            <button className="wx-finance-close" aria-label="关闭" onClick={() => setFinanceMode("")}><X size={19} /></button>
            <div className="wx-finance-heading"><Wallet size={25} /><h2>转账给 {p.thread}</h2></div>
            <p className="wx-finance-label">转账金额（人民币）</p>
            <label className="wx-transfer-input"><span>¥</span><input inputMode="decimal" type="number" min="0.01" step="0.01" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} /></label>
            <div className="wx-balance-note">模拟银行卡余额：¥{bankBalance.toLocaleString("zh-CN", {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
            <button className="wx-finance-primary" disabled={!Number.isFinite(Number(transferAmount)) || Number(transferAmount) <= 0 || Number(transferAmount) > bankBalance} onClick={() => {
              const amount = Math.round(Number(transferAmount) * 100) / 100;
              const stamp = new Date();
              const time = stamp.getFullYear() + "-" + String(stamp.getMonth()+1).padStart(2,"0") + "-" + String(stamp.getDate()).padStart(2,"0") + " " + String(stamp.getHours()).padStart(2,"0") + ":" + String(stamp.getMinutes()).padStart(2,"0");
              const event: Item = { id: "wechat-transfer-" + Date.now(), title: p.thread, body: amount.toFixed(2), richText: "", meta: { transactionType: "微信转账", status: "待对方确认", amount: "-¥" + amount.toFixed(2), recipient: p.thread, source: "模拟银行卡" }, time, sender: "我", avatar: "", kind: "transfer", media: "", hidden: false, unlock: "", password: "", folder: p.thread, favorite: false, outgoing: true, read: true, likes: 0, comments: [] };
              setBankBalance((v) => Math.round((v - amount) * 100) / 100);
              setFinanceMessages((v) => [...v, event]);
              setTransferAmount("");
              setFinanceMode("");
            }}>确认转账（模拟）</button>
            <small className="wx-finance-disclaimer">仅为模拟器内的虚拟转账，不会真实扣款。</small>
          </section>
        </div>
      )}
      {financeMode === "gift" && (
        <div className="wx-finance-backdrop" role="presentation" onClick={() => setFinanceMode("")}>
          <section className="wx-finance-sheet wx-gift-sheet" role="dialog" aria-label="挑选礼物" onClick={(e) => e.stopPropagation()}>
            <button className="wx-finance-close" aria-label="关闭" onClick={() => setFinanceMode("")}><X size={19} /></button>
            <div className="wx-finance-heading"><Gift size={25} /><h2>送给 {p.thread} 的礼物</h2></div>
            <p className="wx-gift-intro">先选择礼物，后续可接入淘宝购买和送达流程。</p>
            {[{name:"鲜花礼盒",price:199,emoji:"💐"},{name:"巧克力礼盒",price:128,emoji:"🍫"},{name:"毛绒玩偶",price:168,emoji:"🧸"},{name:"惊喜礼物盒",price:299,emoji:"🎁"}].map((gift) => (
              <button className="wx-gift-row" key={gift.name} onClick={() => {
                const stamp = new Date();
                const time = stamp.getFullYear() + "-" + String(stamp.getMonth()+1).padStart(2,"0") + "-" + String(stamp.getDate()).padStart(2,"0") + " " + String(stamp.getHours()).padStart(2,"0") + ":" + String(stamp.getMinutes()).padStart(2,"0");
                const event: Item = { id: "wechat-gift-" + Date.now(), title: p.thread, body: "我想送你一个" + gift.name + "（¥" + gift.price + "）", richText: "", meta: { transactionType: "礼物", giftName: gift.name, giftPrice: String(gift.price), recipient: p.thread, status: "待前往淘宝购买" }, time, sender: "我", avatar: "", kind: "order", media: "", hidden: false, unlock: "", password: "", folder: p.thread, favorite: false, outgoing: true, read: true, likes: 0, comments: [] };
                setFinanceMessages((v) => [...v, event]);
                setFinanceMode("");
              }}><span className="wx-gift-emoji">{gift.emoji}</span><span><strong>{gift.name}</strong><small>¥{gift.price} · 模拟商品</small></span><span className="wx-gift-arrow">›</span></button>
            ))}
            <small className="wx-finance-disclaimer">当前是礼物挑选预览，尚未跳转淘宝或创建订单。</small>
          </section>
        </div>
      )}
      {!p.thread && !moments && !utility && (
        <nav className="wx-bottom">
          {[
            { label: "微信", icon: MessageCircle },
            { label: "通讯录", icon: Users },
            { label: "发现", icon: Compass },
            { label: "我", icon: User },
          ].map((t) => (
            <button
              className={tab === t.label ? "selected" : ""}
              key={t.label}
              onClick={() => setTab(t.label)}
            >
              <t.icon size={21} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function WhatsAppSkin(p: SkinProps) {
  const [tab, setTab] = useState("聊天"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("全部");
  const tabs = [
    { label: "动态", icon: Compass },
    { label: "通话", icon: Phone },
    { label: "社区", icon: Users },
    { label: "聊天", icon: MessageCircle },
    { label: "设置", icon: Settings },
  ];
  const conversations = [
    ...new Set(
      p.items
        .filter((i) => !["动态", "通话", "社区", "设置"].includes(i.folder))
        .filter((i) => filter !== "未读" || !i.read)
        .map((i) => i.title),
    ),
  ];
  const name = tab === "聊天" ? p.name : tab;
  return (
    <div className="whatsapp-ui independent-skin">
      <div className="app-nav wa-nav">
        <button
          aria-label="返回"
          onClick={() => (p.thread ? p.onThread("") : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{p.thread || name}</strong>
        <button
          aria-label={p.creator ? "新增内容" : "搜索内容"}
          onClick={
            p.creator
              ? p.onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(".wa-search input")
                    ?.focus()
          }
        >
          {p.creator ? <Plus size={21} /> : <Search size={20} />}
        </button>
      </div>
      {p.thread ? (
        <>
          <div className="wa-thread-profile">
            <button aria-label="返回聊天列表" onClick={() => p.onThread("")}>
              <ChevronLeft size={23} />
            </button>
            <Avatar
              name={p.thread}
              src={p.items.find((i) => i.title === p.thread)?.avatar}
              round
            />
            <div>
              <strong>{p.thread}</strong>
              <small>联系人</small>
            </div>
            <Video size={18} />
            <Phone size={17} />
          </div>
          <MessageList
            items={p.items.filter((i) => i.title === p.thread)}
            creator={p.creator}
            onItem={p.onItem}
            onRead={p.onRead}
            whatsapp
          />
          <Compose creator={p.creator} onAdd={p.onAdd} wa />
        </>
      ) : (
        <div className="skin-scroll">
          <h1 className="wa-large-title">{tab}</h1>
          {tab === "聊天" ? (
            <>
              <label className="wa-search">
                <Search size={16} />
                <input
                  placeholder="搜索"
                  aria-label="搜索WhatsApp"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="wa-filters">
                {["全部", "未读", "群组"].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {conversations
                .filter((t) => t.includes(query))
                .filter(
                  (t) =>
                    filter !== "群组" ||
                    p.items.some((i) => i.title === t && i.folder === "群组"),
                )
                .map((t) => {
                  const last = p.items.filter((i) => i.title === t).at(-1)!;
                  return (
                    <button
                      className="wa-chat-row"
                      key={t}
                      onClick={() => {
                        p.onThread(t);
                        p.onRead(t);
                      }}
                    >
                      <Avatar name={t} src={last.avatar} round />
                      <div>
                        <strong>{t}</strong>
                        <p>
                          {last.outgoing && <CheckCheck size={12} />}{" "}
                          {last.body}
                        </p>
                      </div>
                      <time>{last.time.slice(-5)}</time>
                    </button>
                  );
                })}
            </>
          ) : tab === "设置" ? (
            <>
              <div className="wa-settings-profile">
                <Avatar name="我" round />
                <h2>个人资料</h2>
              </div>
              {p.items
                .filter((i) => i.folder === "设置")
                .map((i) => (
                  <button
                    key={i.id}
                    className="wa-record"
                    onClick={() => p.onItem(i)}
                  >
                    {i.title}
                    <span>›</span>
                  </button>
                ))}
            </>
          ) : (
            <>
              {tab === "动态" && (
                <div className="wa-status">
                  <Avatar name="我" round />
                  <span>我的状态</span>
                  {p.creator && (
                    <button aria-label="添加状态" onClick={p.onAdd}>
                      <Plus size={17} />
                    </button>
                  )}
                </div>
              )}
              {p.items
                .filter(
                  (i) =>
                    i.folder === tab || (tab === "通话" && i.kind === "call"),
                )
                .map((i) => (
                  <button
                    className="wa-record"
                    key={i.id}
                    onClick={() => p.onItem(i)}
                  >
                    <Avatar name={i.sender} src={i.avatar} round />
                    <div>
                      <strong>{i.title}</strong>
                      <p>{i.body}</p>
                    </div>
                    <span>
                      {tab === "通话" ? (
                        <Phone size={17} />
                      ) : (
                        <ChevronLeft size={15} />
                      )}
                    </span>
                  </button>
                ))}
              {!p.items.some((i) => i.folder === tab) && (
                <p className="skin-empty">暂无{tab}内容</p>
              )}
            </>
          )}
          {p.creator && (
            <button className="phone-add" onClick={p.onAdd}>
              添加{tab === "聊天" ? "聊天" : tab}内容
            </button>
          )}
        </div>
      )}
      {!p.thread && (
        <nav className="wa-bottom">
          {tabs.map((t) => (
            <button
              className={tab === t.label ? "selected" : ""}
              key={t.label}
              onClick={() => setTab(t.label)}
            >
              <t.icon size={20} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function InstagramSkin(p: SkinProps) {
  const [tab, setTab] = useState("首页"),
    [dm, setDm] = useState(false),
    [query, setQuery] = useState(""),
    [likes, setLikes] = useSkinState<string[]>(p, "likes", []),
    [saved, setSaved] = useSkinState<string[]>(p, "saved", []),
    [showSaved, setShowSaved] = useState(false);
  const posts = p.items.filter(
      (i) =>
        i.kind === "post" ||
        !["私信", "Story", "Reels", "个人主页"].includes(i.folder),
    ),
    stories = p.items.filter((i) => i.folder === "Story"),
    reels = p.items.filter((i) => i.kind === "video" || i.folder === "Reels"),
    messages = p.items.filter((i) => i.folder === "私信");
  const tabs = [
    { label: "首页", icon: Home },
    { label: "搜索", icon: Search },
    { label: "Reels", icon: Play },
    { label: "个人主页", icon: User },
  ];
  const shown = (
    showSaved ? posts.filter((i) => saved.includes(i.id)) : posts
  ).filter((i) => (i.title + i.body + i.sender).includes(query));
  return (
    <div className="instagram-ui independent-skin">
      <div className="app-nav ig-nav">
        <button
          aria-label="返回"
          onClick={() => (dm ? setDm(false) : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{dm ? "私信" : p.name}</strong>
        <div>
          {p.creator && (
            <button aria-label="新增内容" onClick={p.onAdd}>
              <Plus size={21} />
            </button>
          )}
          <button aria-label="Instagram 私信" onClick={() => setDm(!dm)}>
            <Send size={20} />
          </button>
        </div>
      </div>
      <div className="skin-scroll ig-scroll">
        {dm ? (
          <>
            {messages.map((i) => (
              <button
                key={i.id}
                className="ig-dm-row"
                onClick={() => p.onItem(i)}
              >
                <Avatar name={i.sender} round />
                <div>
                  <strong>{i.sender}</strong>
                  <p>{i.body}</p>
                </div>
              </button>
            ))}
            {!messages.length && <p className="skin-empty">暂无私信</p>}
            {p.creator && (
              <button className="phone-add" onClick={p.onAdd}>
                添加私信
              </button>
            )}
          </>
        ) : tab === "首页" ? (
          <>
            <div className="ig-stories">
              <button
                className="ig-story"
                onClick={
                  p.creator
                    ? p.onAdd
                    : () => {
                        if (stories[0]) p.onItem(stories[0]);
                      }
                }
                disabled={!p.creator && !stories.length}
              >
                <span>
                  <Avatar name="我" round />
                </span>
                <small>你的快拍</small>
              </button>
              {stories.map((i) => (
                <button
                  key={i.id}
                  className="ig-story"
                  onClick={() => p.onItem(i)}
                >
                  <span>
                    <Avatar name={i.sender} round />
                  </span>
                  <small>{i.sender}</small>
                </button>
              ))}
            </div>
            {posts.map((i) => (
              <article className="ig-post" key={i.id}>
                <div className="ig-post-author">
                  <Avatar name={i.sender} round />
                  <strong>{i.sender}</strong>
                  <button
                    aria-label={`帖子详情${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </div>
                <button className="ig-post-media" onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
                <div className="ig-post-controls">
                  <button
                    aria-label={`喜欢${i.title}`}
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((x) => x !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={23}
                      fill={likes.includes(i.id) ? "#ed4956" : "none"}
                      color={likes.includes(i.id) ? "#ed4956" : "currentColor"}
                    />
                  </button>
                  <button
                    aria-label={`评论${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MessageCircle size={22} />
                  </button>
                  <button
                    aria-label={`查看${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <Send size={21} />
                  </button>
                  <button
                    aria-label={`收藏${i.title}`}
                    onClick={() =>
                      setSaved(
                        saved.includes(i.id)
                          ? saved.filter((x) => x !== i.id)
                          : [...saved, i.id],
                      )
                    }
                  >
                    <Bookmark
                      size={22}
                      fill={saved.includes(i.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="ig-post-caption">
                  <strong>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次赞
                  </strong>
                  <p>
                    <b>{i.sender}</b> {i.body}
                  </p>
                  <button onClick={() => p.onItem(i)}>
                    查看全部 {i.comments.length} 条评论
                  </button>
                  <time>{i.time}</time>
                </div>
              </article>
            ))}
          </>
        ) : tab === "搜索" ? (
          <>
            <label className="ig-search">
              <Search size={15} />
              <input
                value={query}
                aria-label="搜索Instagram"
                placeholder="搜索"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        ) : tab === "Reels" ? (
          <>
            {reels.map((i) => (
              <div className="ig-reel" key={i.id}>
                <ItemMedia item={i} />
                <button onClick={() => p.onItem(i)}>
                  {i.sender} · {i.title}
                </button>
              </div>
            ))}
            {!reels.length && <p className="skin-empty">暂无 Reels</p>}
          </>
        ) : (
          <>
            <div className="ig-profile">
              <Avatar name={posts[0]?.sender ?? "我"} src={posts[0]?.sender === "陈浚铭" ? "./IMG_4399.jpeg" : ""} round />
              <div>
                <strong>{posts.length}</strong>
                <small>帖子</small>
              </div>
              <div>
                <strong>0</strong>
                <small>关注者</small>
              </div>
              <div>
                <strong>0</strong>
                <small>正在关注</small>
              </div>
            </div>
            <h3 className="ig-profile-name">{posts[0]?.sender ?? "我"}</h3>
            <div className="ig-profile-tabs">
              <button aria-label="帖子网格" onClick={() => setShowSaved(false)}>
                <Grid size={21} />
              </button>
              <button
                aria-label="已收藏帖子"
                onClick={() => setShowSaved(true)}
              >
                <Bookmark size={21} />
              </button>
              <button
                aria-label="资料内容"
                onClick={() => {
                  const i = p.items.find((i) => i.folder === "个人主页");
                  if (i) p.onItem(i);
                  else if (p.creator) p.onAdd();
                }}
              >
                <AtSign size={21} />
              </button>
            </div>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <nav className="ig-bottom">
        {tabs.map((t) => (
          <button
            key={t.label}
            className={tab === t.label ? "selected" : ""}
            aria-label={`Instagram ${t.label}`}
            onClick={() => {
              setTab(t.label);
              setDm(false);
            }}
          >
            <t.icon size={23} />
          </button>
        ))}
      </nav>
    </div>
  );
}
