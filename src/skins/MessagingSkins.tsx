import { QQThread } from "./QQThread";
import { NativeComposer } from "../DeviceSystem";
import {
  CheckCheck,
  Compass,
  Hash,
  MessageCircle,
  Mic,
  Phone,
  Plus,
  Send,
  Smile,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Item } from "../schema";
import {
  Add,
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
function Bubbles({
  p,
  items,
  className = "",
}: {
  p: Props;
  items: Item[];
  className?: string;
}) {
  return (
    <div className={`catalog-bubbles ${className}`}>
      <time className="bubble-date">{items[0]?.time.slice(0, 10)}</time>
      {items.map((i) => (
        <div
          className={`catalog-message ${i.outgoing ? "outgoing" : ""}`}
          key={i.id}
        >
          <button onClick={() => (p.creator ? p.onItem(i) : p.onRead(i.id))}>
            {["image", "video", "audio"].includes(i.kind) ? (
              <Media item={i} />
            ) : (
              i.body
            )}
            <small>
              {i.time.slice(-5)}
              {i.read && <CheckCheck size={10} />}
            </small>
          </button>
        </div>
      ))}
    </div>
  );
}
function Composer({ p }: { p: Props }) {
  return (
    <div className="catalog-composer">
      <Plus size={19} />
      <NativeComposer creator={p.creator} onAdd={p.onAdd} />

      <Smile size={20} />
      <Mic size={18} />
    </div>
  );
}
function ChatRows({
  p,
  items,
  round = true,
}: {
  p: Props;
  items: Item[];
  round?: boolean;
}) {
  const names = [...new Set(items.map((i) => i.title))];
  return (
    <>
      {names.map((name) => {
        const last = items.filter((i) => i.title === name).at(-1)!;
        return (
          <button
            className="catalog-chat"
            key={name}
            onClick={() => {
              p.onThread(name);
              p.onRead(name);
            }}
          >
            <Avatar name={name} src={last.avatar} round={round} />
            <span>
              <strong>{name}</strong>
              <p>{last.body}</p>
            </span>
            <time>{last.time.slice(-5)}</time>
          </button>
        );
      })}
      <Empty items={items} />
    </>
  );
}
const STALKER_REPLIES = [
  "开枪，我教过你的",
  "我亲手养的玫瑰长出刺来了",
  "你的坏我照单全收",
  "我就在这里，不躲，不逃，把你的坏脾气稳稳接住了",
  "耶，骂人",
  "宝宝不生气人家这次失误了哎刀马刀马刀马",
  "宝贝轻点骂，人家好生怕",
  "亲手养的小猫终于学会亮爪保护自己了",
  "美人嗔怒 爽哉爽哉",
  "你骂我，说明你的心里有我",
  "你的脾气对我来说无异于小猫伸爪，我照单全收",
  "打是亲骂是爱，你这一段输出我都怕你爱死我了",
  "谢谢",
  "老公失误了",
  "男孩我保证你是天使",
  "你慢点骂，我心脏受不了这突如其来的幸福",
  "谢谢老公指点",
];
const isStalkerNumber = (value: string) => /^\\d{3}\\*{4}\\d{4}$/.test(value);
const storedThreadKey = (number: string) => `stalker-sms-thread-${number}`;
function readStoredThread(p: Props, number: string): Item[] {
  try {
    const raw = p.ui?.[storedThreadKey(number)];
    const parsed = typeof raw === "string" ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as Item[] : [];
  } catch {
    return [];
  }
}
function localStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function MessagesSkin(p: Props) {
  const { q, setQ, items: baseItems } = useContent(p, "信息");
  const [unread, setUnread] = useState(false);
  const [replyText, setReplyText] = useState("");
  const stalkerNumbers = [...new Set(baseItems.map((i) => i.title).filter(isStalkerNumber))];
  const [dynamicMessages, setDynamicMessages] = useState<Item[]>(() =>
    stalkerNumbers.flatMap((number) => readStoredThread(p, number)),
  );

  useEffect(() => {
    setDynamicMessages(stalkerNumbers.flatMap((number) => readStoredThread(p, number)));
  }, [p.ui, baseItems.length]);

  const persistMessage = (number: string, item: Item) => {
    const previous = readStoredThread(p, number);
    const next = [...previous, item].slice(-250);
    p.onUi?.(storedThreadKey(number), JSON.stringify(next));
    setDynamicMessages((current) => [...current, item]);
  };

  useEffect(() => {
    if (!stalkerNumbers.length || p.creator) return;
    const timer = window.setInterval(() => {
      const number = stalkerNumbers[Math.floor(Math.random() * stalkerNumbers.length)];
      const source = baseItems.filter((item) => item.title === number && !item.outgoing);
      if (!source.length) return;
      const sample = source[Math.floor(Math.random() * source.length)];
      persistMessage(number, {
        ...sample,
        id: `stalker-incoming-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        body: sample.body,
        time: localStamp(),
        sender: number,
        outgoing: false,
        read: false,
      });
    }, 20000);
    return () => window.clearInterval(timer);
  }, [stalkerNumbers.join("|"), baseItems, p.ui, p.creator]);

  const allItems = [...baseItems, ...dynamicMessages].sort((a, b) => a.time.localeCompare(b.time));
  const sendReply = () => {
    const text = replyText.trim();
    if (!text || !isStalkerNumber(p.thread) || p.creator) return;
    const number = p.thread;
    const outgoing: Item = {
      id: `stalker-outgoing-${Date.now()}`,
      title: number,
      body: text,
      time: localStamp(),
      sender: p.owner || "我",
      avatar: "",
      kind: "text",
      media: "",
      outgoing: true,
      read: true,
      hidden: false,
      unlock: "",
      password: "",
      folder: "私生短信",
      favorite: false,
      likes: 0,
      comments: [],
      richText: "",
      meta: {},
    };
    persistMessage(number, outgoing);
    setReplyText("");
    window.setTimeout(() => {
      const source = baseItems.filter((item) => item.title === number && !item.outgoing);
      const sample = source[Math.floor(Math.random() * source.length)];
      const incoming: Item = {
        id: `stalker-reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: number,
        body: STALKER_REPLIES[Math.floor(Math.random() * STALKER_REPLIES.length)],
        time: localStamp(),
        sender: number,
        avatar: sample?.avatar || "",
        kind: "text",
        media: "",
        outgoing: false,
        read: false,
        hidden: false,
        unlock: "",
        password: "",
        folder: "私生短信",
        favorite: false,
        likes: 0,
        comments: [],
        richText: "",
        meta: {},
      };
      persistMessage(number, incoming);
    }, 900 + Math.floor(Math.random() * 1300));
  };

  return (
    <div className="catalog-skin native-messages">
      <Header
        p={{ ...p, onBack: () => (p.thread ? p.onThread("") : p.onBack()) }}
      />
      <div className="message-heading">
        <h1>{p.thread || "信息"}</h1>
        {!p.thread && (
          <button onClick={() => setUnread(!unread)}>
            {unread ? "全部" : "未读"}
          </button>
        )}
      </div>
      {p.thread ? (
        <>
          <Bubbles
            p={p}
            items={allItems.filter((i) => i.title === p.thread)}
            className="sms-bubbles"
          />
          {isStalkerNumber(p.thread) && !p.creator ? (
            <form
              className="catalog-composer stalker-sms-composer"
              onSubmit={(event) => {
                event.preventDefault();
                sendReply();
              }}
            >
              <input
                aria-label="回复陌生号码"
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="回复信息…"
                autoComplete="off"
              />
              <button type="submit" aria-label="发送回复" disabled={!replyText.trim()}>
                <Send size={19} />
              </button>
            </form>
          ) : (
            <Composer p={p} />
          )}
        </>
      ) : (
        <div className="catalog-scroll">
          <SearchBox value={q} set={setQ} />
          <ChatRows
            p={p}
            items={allItems.filter((i) => !unread || !i.read)}
          />
        </div>
      )}
    </div>
  );
}

export function QQSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "消息");
  const list = items.filter((i) => i.folder !== "空间" && i.kind !== "post");
  return (
    <div className="catalog-skin qq-ui">
      {!p.thread && <Header p={p} />}
      {!p.thread && (
        <div className="qq-profile-bar">
          <Avatar name={p.owner ?? "我"} />
          <div>
            <strong>{p.thread || p.owner || "我的QQ"}</strong>
            <small>QQ</small>
          </div>
        </div>
      )}
      {p.thread ? (
        <QQThread {...p} />
      ) : (
        <>
          <div className="catalog-scroll">
            <SearchBox value={q} set={setQ} />
            {tab === "消息" ? (
              <ChatRows p={p} items={list} />
            ) : tab === "联系人" ? (
              <>
                {[...new Set(list.map((i) => i.sender))].map((s) => (
                  <button
                    key={s}
                    className="qq-contact"
                    onClick={() => {
                      const i = list.find((i) => i.sender === s);
                      if (i) p.onThread(i.title);
                    }}
                  >
                    <Avatar name={s} />
                    {s}
                  </button>
                ))}
              </>
            ) : (
              <div className="qq-space">
                <h2>好友动态</h2>
                {items
                  .filter((i) => i.folder === "空间" || i.kind === "post")
                  .map((i) => (
                    <button key={i.id} onClick={() => p.onItem(i)}>
                      <Avatar name={i.sender} src={i.avatar} />
                      <strong>{i.sender}</strong>
                      <p>{i.body}</p>
                      {i.media && <Media item={i} />}
                      <small>{i.time}</small>
                    </button>
                  ))}
                <Add p={p} label="添加空间动态" />
              </div>
            )}
          </div>
          <Tabs
            tabs={["消息", "联系人", "空间"]}
            value={tab}
            set={setTab}
            icons={[<MessageCircle />, <Users />, <Compass />]}
          />
        </>
      )}
    </div>
  );
}
export function TelegramSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "全部");
  const [folder, setFolder] = useState("全部");
  const folders = ["全部", ...groupItems(items).filter((f) => f !== "未分类")];
  const list =
    folder === "全部" ? items : items.filter((i) => i.folder === folder);
  return (
    <div className="catalog-skin telegram-ui">
      <Header
        p={{ ...p, onBack: () => (p.thread ? p.onThread("") : p.onBack()) }}
      />
      {p.thread ? (
        <>
          <div className="telegram-peer">
            <Avatar name={p.thread} />
            <strong>{p.thread}</strong>
            <span>
              {list.filter((i) => i.title === p.thread).length} 条消息
            </span>
          </div>
          <Bubbles
            p={p}
            items={items.filter((i) => i.title === p.thread)}
            className="telegram-bubbles"
          />
          <Composer p={p} />
        </>
      ) : (
        <>
          <div className="telegram-search">
            <SearchBox value={q} set={setQ} />
          </div>
          <div className="telegram-folders">
            {folders.map((f) => (
              <button
                className={folder === f ? "selected" : ""}
                key={f}
                onClick={() => setFolder(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="catalog-scroll">
            <ChatRows p={p} items={list} />
          </div>
          <div className="telegram-footer">
            <Send size={17} />
            聊天 · {list.length} 条记录
          </div>
        </>
      )}
    </div>
  );
}
export function DiscordSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "频道");
  const servers = [
    ...new Set(items.map((i) => meta(i, "server", "故事服务器"))),
  ];
  const [server, setServer] = useState(""),
    [channel, setChannel] = useState("");
  const current = server || servers[0] || "服务器";
  const list = items.filter((i) => meta(i, "server", "故事服务器") === current);
  const channels = groupItems(list, "general");
  const active = channel || channels[0] || "general";
  const messages = list.filter((i) => (i.folder || "general") === active);
  return (
    <div className="catalog-skin discord-ui">
      <Header p={p} />
      <div className="discord-layout">
        <aside className="discord-servers">
          {servers.map((s) => (
            <button
              aria-label={`服务器${s}`}
              className={s === current ? "selected" : ""}
              key={s}
              onClick={() => {
                setServer(s);
                setChannel("");
                p.onRead(s);
              }}
            >
              {s.slice(0, 2)}
            </button>
          ))}
        </aside>
        <section className="discord-main">
          <div className="discord-server-name">
            <strong>{current}</strong>
            <Hash size={17} />
          </div>
          <div className="discord-channel-tabs">
            {channels.map((c) => (
              <button
                className={c === active ? "selected" : ""}
                key={c}
                onClick={() => {
                  setChannel(c);
                  p.onRead(c);
                }}
              >
                # {c}
              </button>
            ))}
          </div>
          <div className="discord-current">
            {tab === "频道" ? (
              <>
                <Hash size={16} />
                {active}
              </>
            ) : (
              <>
                <Users size={16} />
                成员
              </>
            )}
          </div>
          <div className="catalog-scroll">
            {tab === "成员"
              ? [...new Set(list.map((i) => i.sender))].map((s) => (
                  <div key={s} className="discord-member">
                    <Avatar name={s} />
                    <span>
                      {s}
                      <small>
                        {meta(
                          list.find((i) => i.sender === s)!,
                          "status",
                          "虚构成员",
                        )}
                      </small>
                    </span>
                  </div>
                ))
              : messages.map((i) => (
                  <button
                    key={i.id}
                    className="discord-message"
                    onClick={() => p.onItem(i)}
                  >
                    <Avatar name={i.sender} />
                    <div>
                      <strong>{i.sender}</strong>
                      <time>{i.time.slice(-5)}</time>
                      <p>{i.body}</p>
                      {i.media && <Media item={i} />}
                    </div>
                  </button>
                ))}
            <Empty items={list} />
          </div>
          <Add p={p} label={`添加 #${active} 的消息`} />
        </section>
      </div>
      <Tabs
        tabs={["频道", "成员"]}
        value={tab}
        set={setTab}
        icons={[<Hash />, <Users />]}
      />
    </div>
  );
}
export function LineSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "聊天");
  return (
    <div className="catalog-skin line-ui">
      <Header
        p={{ ...p, onBack: () => (p.thread ? p.onThread("") : p.onBack()) }}
      />
      {p.thread ? (
        <>
          <h3 className="line-peer">{p.thread}</h3>
          <Bubbles
            p={p}
            items={items.filter((i) => i.title === p.thread)}
            className="line-bubbles"
          />
          <Composer p={p} />
        </>
      ) : (
        <>
          <div className="catalog-scroll">
            <h1>{tab}</h1>
            <SearchBox value={q} set={setQ} />
            {tab === "聊天" ? (
              <ChatRows p={p} items={items} />
            ) : (
              <>
                <div className="line-owner">
                  <Avatar name={p.owner ?? "我"} />
                  <h2>{p.owner ?? "我"}</h2>
                </div>
                <h4>好友</h4>
                <div className="line-friends">
                  {[...new Set(items.map((i) => i.sender))].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        const i = items.find((i) => i.sender === s);
                        if (i) p.onThread(i.title);
                      }}
                    >
                      <Avatar name={s} />
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Tabs
            tabs={["好友", "聊天"]}
            value={tab}
            set={setTab}
            icons={[<Users />, <MessageCircle />]}
          />
        </>
      )}
    </div>
  );
}
export function MessengerSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "聊天");
  return (
    <div className="catalog-skin messenger-ui">
      <Header
        p={{ ...p, onBack: () => (p.thread ? p.onThread("") : p.onBack()) }}
      />
      {p.thread ? (
        <>
          <div className="messenger-peer">
            <Avatar name={p.thread} />
            <strong>{p.thread}</strong>
            <Phone size={18} />
          </div>
          <Bubbles
            p={p}
            items={items.filter((i) => i.title === p.thread)}
            className="messenger-bubbles"
          />
          <Composer p={p} />
        </>
      ) : (
        <>
          <div className="catalog-scroll">
            <h1>{tab}</h1>
            <SearchBox value={q} set={setQ} />
            <div className="messenger-people">
              {[...new Set(items.map((i) => i.sender))].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const i = items.find((i) => i.sender === s);
                    if (i) p.onThread(i.title);
                  }}
                >
                  <Avatar name={s} />
                  <small>{s}</small>
                </button>
              ))}
            </div>
            {tab === "聊天" ? (
              <ChatRows p={p} items={items} />
            ) : (
              <div className="messenger-contacts">
                {items.map((i) => (
                  <button key={i.id} onClick={() => p.onItem(i)}>
                    <Avatar name={i.sender} />
                    <strong>{i.sender}</strong>
                    <small>{i.title}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Tabs
            tabs={["聊天", "联系人"]}
            value={tab}
            set={setTab}
            icons={[<MessageCircle />, <Users />]}
          />
        </>
      )}
    </div>
  );
}
