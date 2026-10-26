import { StatusGlyph } from "./ios/StatusGlyph";
import { SocialDetail, socialDetailApps } from "./skins/SocialDetails";
import { NativeCalculator } from "./ios/Calculator";
import { HomeLauncher } from "./launcher/HomeLauncher";
import { useDeviceLayout } from "./launcher/layout";
import "./launcher/launcher.css";
import { NativeDetail, nativeDetailApps } from "./ios/Details";
import "./ios/details.css";
import {
  SystemNotifications,
  notificationContent,
} from "./SystemNotifications";
import {
  readLauncherOrigin,
  AppWindow,
  screenOrigin,
} from "./vendor/ios-web/Launcher";
import {
  DeviceLock,
  ControlCenter,
  DeviceKeyboard,
  KeyboardContext,
  NativeSettings,
} from "./DeviceSystem";
import { AppArtwork, hasNativeArtwork } from "./AppArtwork";
import { getFields } from "./fields";
import { catalogSkins } from "./skins/catalog";
import "./skins/skins.css";
import "./ios18.css";
import "./device-system.css";
import "./ios/tokens.css";
import "./ios/reference.css";
import "./ios/status-bar.css";
import { WeChatSkin, WhatsAppSkin } from "./AppSkins";
import { RichText } from "./RichText";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  Suspense,
  type CSSProperties,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Plus,
  Search,
  LockKeyhole,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ArrowUp,
  Folder,
  Phone as PhoneIcon,
} from "lucide-react";
import { getApp, type AppPlugin } from "./registry";
import {
  initialRuntime,
  makeItem,
  safeMedia,
  type Work,
  type Item,
  type Runtime,
  type UiValue,
} from "./schema";
import { dispatch, choose, visible, advance } from "./engine";
import { db } from "./persistence";
export function AppIcon({
  id,
  name,
  small = false,
  custom = "",
  date,
  time,
}: {
  id: string;
  name?: string;
  small?: boolean;
  custom?: string;
  date?: string;
  time?: string;
}) {
  const a = getApp(id);
  const Icon = a.icon;
  return (
    <span className={`app-icon-wrap ${small ? "small" : ""}`}>
      <span className="app-icon" style={{ background: a.color }}>
        {custom ? (
          safeMedia(custom) ? (
            <img src={safeMedia(custom)} alt="自定义图标" />
          ) : (
            <span>{custom.slice(0, 2)}</span>
          )
        ) : hasNativeArtwork(id) ? (
          <AppArtwork id={id} date={date} time={time} />
        ) : (
          <Icon size={small ? 21 : 28} strokeWidth={1.65} />
        )}
      </span>
      {name && <span className="app-name">{name}</span>}
    </span>
  );
}
type PhoneProps = Omit<Parameters<typeof PhoneRuntime>[0], "deviceLayout">;

type CallDialogueLine = { speaker: string; text: string };
const sasaengSeedMessage: Item = {
  id: "sasaeng-seed-message",
  title: "私生",
  body: "哥哥，你终于上线了……",
  richText: "",
  meta: {},
  time: "2026-10-26 09:41",
  sender: "私生",
  avatar: "",
  kind: "text",
  media: "",
  hidden: false,
  unlock: "",
  password: "",
  folder: "",
  favorite: false,
  outgoing: false,
  read: false,
  likes: 0,
  comments: [],
};
const sasaengCallRecord: Item = { id: "sasaeng-call", title: "中国电信 10000", body: "", richText: "", meta: {}, time: "2026-10-26 09:41", sender: "中国电信", avatar: "", kind: "call", media: "", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 0, comments: [] };
const sasaengCallDialogue: CallDialogueLine[] = [
  { speaker: "？", text: "你好，是陈先生吗？" },
  { speaker: "我", text: "有事吗？" },
  { speaker: "？", text: "不好意思打扰您，我是中国电信的客服，这边给您来电是因为系统检测到您的流量包业务……（憋笑）" },
  { speaker: "我", text: "挂了。" },
  { speaker: "？", text: "别挂哥哥……哥哥对不起，我错了……好想你啊哥哥，终于听到你的声音了。" },
  { speaker: "我", text: "……" },
];
function getCallDialogue(item?: Item): CallDialogueLine[] {
  if (item?.id === "sasaeng-call") return sasaengCallDialogue;
  if (!item?.meta?.dialogue) return [];
  try {
    const value: unknown = JSON.parse(item.meta.dialogue);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (line): line is CallDialogueLine =>
        !!line &&
        typeof line === "object" &&
        typeof (line as CallDialogueLine).speaker === "string" &&
        typeof (line as CallDialogueLine).text === "string",
    );
  } catch {
    return [];
  }
}
export function Phone(props: PhoneProps) {
  const deviceLayout = useDeviceLayout(props.work, props.creator);
  return (
    <PhoneRuntime
      {...props}
      work={deviceLayout.work}
      deviceLayout={deviceLayout}
    />
  );
}
function PhoneRuntime({
  deviceLayout,
  work,
  creator = false,
  onEdit,
  onAdd,
  onSettings,
  onOpen,
  runtime: external,
  onRuntime,
}: {
  deviceLayout: ReturnType<typeof useDeviceLayout>;
  work: Work;
  creator?: boolean;
  onEdit?: (app: string, item: Item) => void;
  onAdd?: (app: string) => void;
  onSettings?: () => void;
  onOpen?: (app: string) => void;
  runtime?: Runtime;
  onRuntime?: (s: Runtime) => void;
}) {
  const [app, setApp] = useState("");
  const [homeRequest, setHomeRequest] = useState(0);
  const [locked, setLocked] = useState(!creator);
  const [pinOpen, setPinOpen] = useState(false);
  const [quickCamera, setQuickCamera] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const appSnapshots = useRef(new Map<string, HTMLElement>());
  const [banner, setBanner] = useState("");
  const noticesSeen = useRef(0);
  const [contextApp, setContextApp] = useState("");
  const [deviceScale, setDeviceScale] = useState(0.84);
  const shell = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, time: 0, zone: "" });
  const [launchOrigin, setLaunchOrigin] = useState(screenOrigin);

  const beginUnlock = () => {
    setPinError("");
    setQuickCamera(false);
    if (work.phone.passcode) setPinOpen(true);
    else unlock();
  };
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const gestureConsumed = useRef(false);
  const [pinError, setPinError] = useState("");
  const [folder, setFolder] = useState("");
  const [panel, setPanel] = useState("");
  const [own, setOwn] = useState(() => initialRuntime(work));
  const [callDialogueIndex, setCallDialogueIndex] = useState(0);
  const [ready, setReady] = useState(creator || !!external);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const fit = () => {
      setDeviceScale(
        Math.max(
          0.4,
          Math.min(
            1,
            (el.parentElement!.clientWidth - 24) / 407,
            (window.innerHeight - (creator ? 170 : external ? 150 : 40)) / 866,
          ),
        ),
      );
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement!);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [creator, ready]);
  const s = external ?? own;
  const runtimeRef = useRef(s);
  runtimeRef.current = s;
  const update = useCallback((next: Runtime) => {
    runtimeRef.current = next;
    setOwn(next);
    onRuntime?.(next);
  }, [onRuntime]);
  useEffect(() => {
    let active = true;
    if (creator || external) return;
    void db.saves
      .get(work.id)
      .then((saved) => {
        if (!active) return;
        if (saved && saved.state.revision === work.updatedAt)
          setOwn(saved.state);
        else {
          setOwn(dispatch(work, initialRuntime(work), "start"));
          if (saved) setLoadError("作品已更新，已开始新的进度。");
        }
        setReady(true);
      })
      .catch(() => {
        setOwn(dispatch(work, initialRuntime(work), "start"));
        setLoadError("无法读取本地存档。本次仍可游玩。");
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [work.id, work.updatedAt, creator, external]);
  useEffect(() => {
    if (!creator && !external && ready)
      void db.saves
        .put({ id: work.id, state: own })
        .catch(() => setLoadError("存档失败，请检查浏览器存储权限。"));
  }, [own, creator, work.id, external, ready]);
  useEffect(() => {
    if (creator || !ready) return;
    const interval = setInterval(() => {
      const previous = runtimeRef.current;
      const next = advance(work, previous, 1000);
      runtimeRef.current = next;
      const changed =
        next.time !== previous.time ||
        next.trace.join() !== previous.trace.join() ||
        (next.scheduled?.length ?? 0) !== (previous.scheduled?.length ?? 0) ||
        (next.scheduled?.length ?? 0) > 0 ||
        Math.floor((next.elapsedMs ?? 0) / 5000) !==
          Math.floor((previous.elapsedMs ?? 0) / 5000);
      if (changed) update(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [creator, ready, work.id, work.updatedAt]);
  const callTarget = s.incomingCall?.target ?? "";
  const callStatus = s.incomingCall?.status ?? "";
  const callRecord = work.data.phone?.find((item) => item.id === callTarget) ??
    (callTarget === "sasaeng-call" ? sasaengCallRecord : undefined);
  const callDialogue = useMemo(() => getCallDialogue(callRecord), [callRecord]);
  useEffect(() => {
    if (creator || callStatus !== "answered" || callDialogue.length === 0) {
      setCallDialogueIndex(0);
      return;
    }
    setCallDialogueIndex(0);
    let index = 0;
    const timer = setInterval(() => {
      if (index < callDialogue.length - 1) {
        index += 1;
        setCallDialogueIndex(index);
        return;
      }
      clearInterval(timer);
      const current = runtimeRef.current.incomingCall;
      if (current?.status === "answered" && current.target === callTarget) {
        const ended = dispatch(
          work,
          { ...runtimeRef.current, incomingCall: null },
          "callEnded",
          current.target || current.caller,
        );
        if (
          current.target === "sasaeng-call" &&
          !ended.endings.includes("私生来电剧情结束")
        ) {
          ended.endings.push("私生来电剧情结束");
        }
        update(ended);
      }
    }, 2400);
    return () => clearInterval(timer);
  }, [creator, callStatus, callTarget, callDialogue, work, update]);
  const event = (event: string, target: string) => {
    if (!creator) update(dispatch(work, runtimeRef.current, event, target));
  };
  const handleFamilyCardPayment = (card: "陈奕恒" | "张桂源", isFood: boolean) => {
    const isTaobao = app === "taobao";
    const text = card === "陈奕恒"
      ? (isFood
          ? "陈浚铭 如果我和你说 就是 你少吃点些对你不好的东西 多吃健康的食物 你会听吗？"
          : "你终于愿意花我的卡了😆😆")
      : (isFood ? "陈浚铭好能吃啊陈浚铭" : "陈浚铭好能买啊陈浚铭");
    const sender = card === "陈奕恒" ? "陈奕恒" : "张桂源";
    const current = runtimeRef.current;
    const stamp = `${current.date ?? work.phone.date ?? "2026-10-26"} ${current.time ?? work.phone.time}`;
    const incoming = makeItem({
      id: `family-card-${Date.now()}`,
      title: sender,
      body: text,
      sender,
      time: stamp,
      kind: "text",
      outgoing: false,
      read: false,
    });
    update({
      ...current,
      messages: {
        ...current.messages,
        wechat: [...(current.messages.wechat ?? []), incoming],
      },
      notifications: [...current.notifications, `微信 · ${sender}：${text}`],
    });
    return { sender, text, kind: card === "陈奕恒" && isFood && !isTaobao ? "food" as const : "plain" as const };
  };
  const handleFamilyCardReply = (choice: "听" | "不听") => {
    const current = runtimeRef.current;
    const stamp = `${current.date ?? work.phone.date ?? "2026-10-26"} ${current.time ?? work.phone.time}`;
    const outgoing = makeItem({
      id: `family-card-choice-${Date.now()}`,
      title: "陈奕恒",
      body: choice,
      sender: work.phone.owner || "陈浚铭",
      time: stamp,
      kind: "text",
      outgoing: true,
      read: true,
    });
    const response = makeItem({
      id: `family-card-response-${Date.now()}`,
      title: "陈奕恒",
      body: choice === "听" ? "陈浚铭你真好😁😁" : "你好坏啊",
      sender: "陈奕恒",
      time: stamp,
      kind: "text",
      outgoing: false,
      read: true,
    });
    update({
      ...current,
      messages: {
        ...current.messages,
        wechat: [...(current.messages.wechat ?? []), outgoing, response],
      },
      notifications: [...current.notifications, `微信 · 陈奕恒：${response.body}`],
    });
    return response.body;
  };
  const handleMessageReply = (thread: string, text: string) => {
    if (creator) return;
    const current = runtimeRef.current;
    if (thread === "张桂源" && ["解冻了好开心", "不能耍起了呀"].includes(text)) {
      const alreadyReplied = Boolean(current.variables.zhangGuiyuanReplyDone) ||
        (current.messages.wechat ?? []).some((item) =>
          item.title === thread && item.outgoing &&
          ["解冻了好开心", "不能耍起了呀"].includes(item.body),
        );
      if (alreadyReplied) return;
      const outgoing = makeItem({
        id: `zhang-guiyuan-player-${Date.now()}`,
        title: thread,
        body: text,
        sender: work.phone.owner,
        time: `${current.date ?? work.phone.date ?? "2026-10-26"} ${current.time ?? work.phone.time}`,
        outgoing: true,
        read: true,
      });
      update({
        ...current,
        messages: { ...current.messages, wechat: [...(current.messages.wechat ?? []).map((item) => item.title === thread ? { ...item, read: true } : item), outgoing] },
        variables: { ...current.variables, zhangGuiyuanReplyDone: true },
        notifications: current.notifications.filter((item) => !item.includes("张桂源")),
      });
      return;
    }
    if (thread === "四代同堂") {
      const outgoing = makeItem({
        id: `fourth-gen-player-${Date.now()}`,
        title: thread,
        body: text,
        sender: work.phone.owner,
        time: `${current.date ?? work.phone.date ?? "2026-10-26"} ${current.time ?? work.phone.time}`,
        outgoing: true,
      });
      const alreadyReplied = Boolean(current.variables.fourthGenAckTriggered);
      const staffNoticeExists = [
        ...(work.data.wechat ?? []),
        ...(current.messages.wechat ?? []),
      ].some((item) =>
        item.title === thread && /近期准备恢复训练/.test(item.body),
      );
      if (text === "收到" && (alreadyReplied || !staffNoticeExists)) return;
      const cleanWechat = (current.messages.wechat ?? []).filter((item) => !item.id.startsWith("fourth-gen-ack-"));
      update({
        ...current,
        messages: { ...current.messages, wechat: [...cleanWechat, outgoing] },
        variables: text === "收到"
          ? { ...current.variables, fourthGenAckTriggered: true }
          : current.variables,
      });
      if (text !== "收到") return;
      const members = ["张桂源", "左奇函", "陈奕恒", "杨博文", "杨涵博", "官俊臣", "张奕然", "张函瑞", "陈思罕", "魏子宸", "王橹杰", "聂玮辰", "李煜东"];
      members.forEach((sender, index) => {
        window.setTimeout(() => {
          const latest = runtimeRef.current;
          const reply = makeItem({
            id: `fourth-gen-ack-${index}-${Date.now()}`,
            title: thread,
            body: "收到",
            sender,
            time: `${latest.date ?? work.phone.date ?? "2026-10-26"} ${latest.time ?? work.phone.time}`,
            read: true,
          });
          update({
            ...latest,
            messages: { ...latest.messages, wechat: [...(latest.messages.wechat ?? []), reply] },
          });
        }, 650 * (index + 1));
      });
      window.setTimeout(() => {
        const latest = runtimeRef.current;
        update({
          ...latest,
          notifications: [...latest.notifications, "张桂源：遭不住了兄弟"],
        });
      }, 650 * (members.length + 1));
      return;
    }
    const isSasaengThread =
      /^私生\d{2}$/.test(thread) ||
      /私生|私生粉|跟踪者/i.test(thread) ||
      [...(work.data.messages ?? []), ...(current.messages.messages ?? []), ...(current.messages.wechat ?? [])].some(
        (item) => item.title === thread && /私生|私生粉|跟踪者/i.test(item.sender),
      );
    const alreadyTriggered = Boolean(current.variables.sasaengCallTriggered);
    const timestamp = `${current.date ?? work.phone.date ?? "2026-10-26"} ${current.time ?? work.phone.time}`;
    const outgoing = makeItem({
      id: `player-reply-${Date.now()}`,
      title: thread,
      body: text,
      sender: work.phone.owner,
      time: timestamp,
      outgoing: true,
      read: true,
    });
    if (!isSasaengThread) {
      const nextMessages = [...(current.messages.messages ?? []), outgoing];
      update({
        ...current,
        messages: { ...current.messages, messages: nextMessages },
      });
      return;
    }
    const isWeChatStalker = app === "wechat" && /^私生\d{2}$/.test(thread);
    const nextMessages = isWeChatStalker
      ? (current.messages.wechat ?? []).map((item) => item.title === thread ? { ...item, read: true } : item).concat(outgoing)
      : [...(current.messages.messages ?? []).map((item) => item.title === thread ? { ...item, read: true } : item), outgoing];
    update({
      ...current,
      messages: {
        ...current.messages,
        ...(isWeChatStalker ? { wechat: nextMessages } : { messages: nextMessages }),
      },
      variables: !alreadyTriggered
        ? { ...current.variables, sasaengCallTriggered: true }
        : current.variables,
      read: [...new Set([
        ...current.read,
        ...[...(work.data[app] ?? []), ...(current.messages[app] ?? [])]
          .filter((item) => item.title === thread).map((item) => item.id),
      ])],
      notifications: current.notifications.filter((item) => !item.includes(thread)),
    });
    const replies = [
      "哥哥，你终于回我了……我一直在等你。",
      "你回我了！我就知道你不会真的不理我。",
      "哥哥，我好想你，你能不能再跟我说一句话？",
      "我没有恶意，我只是太想见到你了。",
      "哥哥，你是不是生气了？我以后会乖的。",
      "你终于肯理我了，我真的好开心。",
    ];
    window.setTimeout(() => {
      const latest = runtimeRef.current;
      const stalkerReply = makeItem({
        id: `sasaeng-reply-${Date.now()}`,
        title: thread,
        body: replies[Math.floor(Math.random() * replies.length)],
        sender: thread,
        time: `${latest.date ?? work.phone.date ?? "2026-10-26"} ${latest.time ?? work.phone.time}`,
        read: true,
      });
      update({
        ...latest,
        messages: {
          ...latest.messages,
          ...(isWeChatStalker
            ? { wechat: [...(latest.messages.wechat ?? []), stalkerReply] }
            : { messages: [...(latest.messages.messages ?? []), stalkerReply] }),
        },
        ...(!alreadyTriggered ? {
          notifications: [...latest.notifications, "中国电信 10000 来电"],
          incomingCall: {
            caller: "中国电信 10000",
            target: "sasaeng-call",
            status: "ringing",
          },
        } : {}),
      });
    }, 1300);
  };
  const captureApp = () => {
    if (!app) return;
    const current = shell.current?.querySelector<HTMLElement>(".app-screen");
    if (!current) return;
    const snapshot = current.cloneNode(true) as HTMLElement;
    snapshot.style.transform = "none";
    snapshot.style.opacity = "1";
    snapshot.style.filter = "none";
    snapshot.style.borderRadius = "0";
    snapshot.querySelectorAll("audio").forEach((el) => el.remove());
    snapshot.querySelectorAll("video").forEach((el) => {
      el.removeAttribute("autoplay");
      el.removeAttribute("src");
    });
    snapshot.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    appSnapshots.current.set(app, snapshot);
    for (const id of appSnapshots.current.keys())
      if (!recent.includes(id) && id !== app) appSnapshots.current.delete(id);
  };
  const open = (id: string) => {
    if (!work.apps.some((a) => a.id === id && a.installed)) return;
    setApp(id);
    setKeyboard(false);
    setRecent((v) => [id, ...v.filter((a) => a !== id)].slice(0, 8));
    setFolder("");
    setPanel("");
    onOpen?.(id);
    event("openApp", id);
  };
  const installedApps = work.apps.filter((a) => a.installed);
  const apps = installedApps.filter((a) => a.visible);
  const unlock = (pin = "") => {
    if (!work.phone.passcode || pin === work.phone.passcode) {
      setLocked(false);
      setPinOpen(false);
      event("password", pin);
    } else {
      setPinError("密码不正确");
      setPinOpen(true);
    }
  };
  useEffect(() => {
    if (app && !work.apps.some((a) => a.id === app && a.installed)) setApp("");
  }, [app, work.apps]);
  const displayTime = creator ? work.phone.time : s.time || work.phone.time;
  const plugin = getApp(app);
  useEffect(() => {
    if (creator || !ready) return;
    const current = runtimeRef.current;
    if (current.variables.fourthGenNoticeQueued) return;
    const notice = "@所有人 接通知，近期准备恢复训练，所有人尽快返回重庆。看到消息回复「收到」，不要遗漏。";
    update({
      ...current,
      variables: { ...current.variables, fourthGenNoticeQueued: true },
      notifications: [...current.notifications, `TF四代工作群：${notice}`],
    });
  }, [creator, ready, work.id, update]);
  useEffect(() => {
    const count = s.notifications.length;
    if (!locked && work.phone.notifications && count > noticesSeen.current) {
      setBanner(s.notifications.at(-1) || "");
      const timer = setTimeout(() => setBanner(""), 4500);
      noticesSeen.current = count;
      return () => clearTimeout(timer);
    }
    if (!locked) noticesSeen.current = count;
  }, [s.notifications.length, locked, work.phone.notifications]);
  const dismissNotice = (index: number) =>
    update({
      ...runtimeRef.current,
      notifications: runtimeRef.current.notifications.filter(
        (_, i) => i !== index,
      ),
    });
  const handleNotificationOpen = (text: string) => {
    setPanel("");
    if (text.includes("TF四代工作群") || text.includes("张桂源：遭不住了兄弟")) {
      const current = runtimeRef.current;
      const targetThread = text.includes("遭不住了兄弟") ? "张桂源" : "四代同堂";
      update({
        ...current,
        ui: { ...current.ui, wechat: { ...current.ui?.wechat, openThread: targetThread } },
      });
      if (locked) beginUnlock();
      else open("wechat");
      return;
    }
    const target = text.match(/\u2063([a-z0-9-]+)\u2063/)?.[1];
    if (target) {
      const current = runtimeRef.current;
      update({
        ...current,
        ui: {
          ...current.ui,
          weibo: {
            ...current.ui?.weibo,
            "weibo-notification-target": target,
          },
        },
      });
      open("weibo");
      if (locked) beginUnlock();
      return;
    }
    if (locked) beginUnlock();
    else open(notificationContent(text, work.apps).appId);
  };
  if (!ready) return <div className="phone-loading">正在恢复进度…</div>;
  return (
    <div
      ref={shell}
      style={{ "--phone-scale": deviceScale } as CSSProperties}
      className={`phone-shell ios18 ${work.phone.theme === "dark" ? "dark-phone" : ""}`}
    >
      <KeyboardContext.Provider value={setKeyboard}>
        <div
          className={`phone-screen wallpaper-${work.phone.wallpaper} ${locked ? "is-locked" : ""} ${app ? "in-app" : ""} ${keyboard ? "keyboard-open" : ""}`}
          style={work.phone.wallpaperImage || work.phone.wallpaper.startsWith("custom-") ? { backgroundImage: `url("${work.phone.wallpaperImage || `./${work.phone.wallpaper.slice(7)}.jpeg`}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          data-app={app}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            gestureConsumed.current = false;
            const button = (e.target as HTMLElement).closest<HTMLElement>(
              "[data-app-id]",
            );
            if (button) {
              pressTimer.current = setTimeout(() => {
                gestureConsumed.current = true;
                setContextApp(button.dataset.appId || "");
              }, 550);
            }
            const box = e.currentTarget.getBoundingClientRect(),
              x = (e.clientX - box.left) / deviceScale,
              y = (e.clientY - box.top) / deviceScale;
            gesture.current = {
              x,
              y,
              time: Date.now(),
              zone: y < 58 ? "top" : y > 818 ? "bottom" : locked ? "lock" : "",
            };
          }}
          onPointerMove={(e) => {
            if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5)
              clearTimeout(pressTimer.current);
          }}
          onPointerCancel={() => clearTimeout(pressTimer.current)}
          onPointerUp={(e) => {
            clearTimeout(pressTimer.current);
            const box = e.currentTarget.getBoundingClientRect(),
              y = (e.clientY - box.top) / deviceScale,
              g = gesture.current;
            const dy = y - g.y;
            if (g.zone === "top" && dy > 65)
              setPanel(g.x > 230 ? "control" : "notification");
            else if ((g.zone === "bottom" || g.zone === "lock") && dy < -55) {
              gestureConsumed.current = true;
              if (!locked) captureApp();
              setKeyboard(false);
              if (panel) {
                setPanel("");
              } else if (locked) {
                beginUnlock();
              } else if (g.zone === "bottom" && Date.now() - g.time > 450) {
                captureApp();
                setPanel("switcher");
              } else {
                setApp("");
                setPanel("");
                setFolder("");
              }
            }
          }}
          onClickCapture={(e) => {
            const target = (e.target as HTMLElement).closest(
              ".home-app-grid button,.dock button",
            );
            if (target) {
              setLaunchOrigin(
                readLauncherOrigin(target as HTMLElement, e.currentTarget),
              );
            }
          }}
        >
          <div className="wallpaper-orb orb-one" />
          <div className="wallpaper-orb orb-two" />
          <div className="status-bar">
            <button
              onClick={() =>
                setPanel(panel === "notification" ? "" : "notification")
              }
              className="status-time"
              aria-label="通知中心"
            >
              {displayTime}
              <StatusGlyph kind="silent" />
            </button>
            <div className="dynamic-island" />
            <button
              className="signals"
              onClick={() => setPanel(panel === "control" ? "" : "control")}
              aria-label="控制中心"
            >
              <StatusGlyph kind="cellular" />
              <StatusGlyph kind="wifi" />
              <span
                className={`ios-battery${work.phone.battery <= 20 ? " low-battery" : ""}`}
              >
                <span style={{ width: `${work.phone.battery}%` }} />
                <b>{work.phone.battery}</b>
              </span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            {locked && !(quickCamera && app === "camera") ? (
              <DeviceLock
                work={
                  s.date
                    ? { ...work, phone: { ...work.phone, date: s.date } }
                    : work
                }
                time={displayTime}
                notices={s.notifications}
                onDismiss={dismissNotice}
                pinOpen={pinOpen}
                setPinOpen={setPinOpen}
                error={pinError}
                onUnlock={unlock}
                onLight={() => setPanel("light")}
                onOpenNotice={handleNotificationOpen}
                onCamera={() => {
                  setQuickCamera(true);
                  open("camera");
                }}
              />
            ) : app && app !== "appstore" ? (
              <AppWindow
                key={app}
                className={`app-screen engine-${plugin.engine} skin-${app}`}
                creator={creator}
                origin={launchOrigin}
              >
                <AppContent
                  app={plugin}
                  name={
                    work.apps.find((a) => a.id === app)?.name ?? plugin.name
                  }
                  items={[
                    ...(work.data[app] ?? []),
                    ...(s.messages[app] ?? []),
                    ...(!creator && app === "messages" &&
                      ![...(work.data[app] ?? []), ...(s.messages[app] ?? [])].some(
                        (item) => /私生|私生粉|跟踪者/i.test(item.title + " " + item.sender),
                      )
                      ? [sasaengSeedMessage]
                      : []),
                  ].map((item) => s.read.includes(item.id) ? { ...item, read: true } : item)}
                  creator={creator}
                  state={s}
                  onRead={(id) => {
                    const current = runtimeRef.current;
                    const sourceItems = [
                      ...(work.data[app] ?? []),
                      ...(current.messages[app] ?? []),
                    ];
                    const readItem = sourceItems.find((item) => item.id === id);
                    const title = readItem?.title;
                    const notifications = title
                      ? current.notifications.filter((notice) => !notice.includes(title))
                      : current.notifications;
                    update(dispatch(work, { ...current, notifications }, "read", id));
                  }}
                  onEdit={(item) => onEdit?.(app, item)}
                  onAdd={() => onAdd?.(app)}
                  onReply={handleMessageReply}
                  onFamilyCardPayment={handleFamilyCardPayment}
                  onFamilyCardReply={handleFamilyCardReply}
                  onBack={() => setApp("")}
                  onSettings={onSettings}
                  onUi={(key, value) => {
                    const current = runtimeRef.current;
                    if (app === "weibo" && key === "weibo-reply-notification") {
                      const marker = String.fromCharCode(0x2063);
                      const notice = `微博：陈奕恒回复了你的评论${marker}${String(value)}${marker}`;
                      update({ ...current, notifications: [...current.notifications, notice] });
                      setBanner(notice);
                      return;
                    }
                    update(
                      dispatch(
                        work,
                        {
                          ...current,
                          ui: {
                            ...current.ui,
                            [app]: { ...current.ui?.[app], [key]: value },
                          },
                        },
                        "variable",
                        `ui:${app}:${key}`,
                      ),
                    );
                  }}
                  work={work}
                />
              </AppWindow>
            ) : (
              <HomeLauncher
                key={
                  "home-" + homeRequest + (app === "appstore" ? "store" : "")
                }
                storeOpen={app === "appstore"}
                closeStore={() => setApp("")}
                work={work}
                layout={deviceLayout.layout}
                change={deviceLayout.change}
                importLayout={deviceLayout.importLayout}
                error={deviceLayout.error}
                open={open}
                onFolder={setFolder}
                search={() => setPanel("search")}
                time={displayTime}
                icon={(a, small) => (
                  <AppIcon
                    key={a.id}
                    id={a.id}
                    name={small ? undefined : a.name}
                    small={small}
                    custom={a.icon}
                    date={s.date || work.phone.date}
                    time={s.time}
                  />
                )}
                clearApp={(id) =>
                  update({
                    ...runtimeRef.current,
                    messages: Object.fromEntries(
                      Object.entries(runtimeRef.current.messages).filter(
                        ([app]) => app !== id,
                      ),
                    ),
                  })
                }
              />
            )}
          </AnimatePresence>
          {folder && (
            <div className="folder-overlay" onClick={() => setFolder("")}>
              <h2>{folder}</h2>
              <div className="folder-apps" onClick={(e) => e.stopPropagation()}>
                {apps
                  .filter((a) => a.folder === folder)
                  .map((a) => (
                    <button key={a.id} onClick={() => open(a.id)}>
                      <AppIcon id={a.id} name={a.name} custom={a.icon} />
                    </button>
                  ))}
              </div>
              <button className="glass-btn" onClick={() => setFolder("")}>
                关闭文件夹
              </button>
            </div>
          )}
          {panel === "control" && (
            <ControlCenter
              battery={work.phone.battery}
              network={work.phone.network}
              close={() => setPanel("")}
            />
          )}
          {panel && panel !== "control" && panel !== "switcher" && (
            <div
              className={`system-panel ${panel === "light" ? "flash-on" : ""}`}
            >
              <button className="panel-close" onClick={() => setPanel("")}>
                关闭 <ChevronLeft size={14} />
              </button>
              {panel === "notification" ? (
                <>
                  <h2>通知中心</h2>
                  {work.phone.notifications && s.notifications.length ? (
                    <SystemNotifications
                      notices={s.notifications}
                      apps={work.apps}
                      onOpen={handleNotificationOpen}
                      onDismiss={dismissNotice}
                    />
                  ) : (
                    <p>没有新通知</p>
                  )}
                </>
              ) : panel === "search" ? (
                <>
                  <h2>搜索 App</h2>
                  <AppSearch apps={installedApps} open={open} />
                </>
              ) : (
                <h2>手电筒已打开</h2>
              )}
            </div>
          )}
          {!creator && s.choices.length > 0 && !locked && (
            <div className="story-overlay">
              <span className="eyebrow">故事来到一个岔路口</span>
              <h3>你会如何选择？</h3>
              {s.choices.map((c) => (
                <button
                  key={c.target}
                  onClick={() => update(choose(work, s, c.target))}
                >
                  {c.label}
                  <ArrowUp size={15} />
                </button>
              ))}
            </div>
          )}
          {!creator && s.endings.length > 0 && !locked && (
            <div className="story-overlay ending">
              <span className="eyebrow">ENDING · {s.endings.length}</span>
              <h2>故事在这里停泊。</h2>
              <p>{s.endings[s.endings.length - 1]}</p>
              <button
                onClick={() => {
                  update(dispatch(work, initialRuntime(work), "start"));
                  setApp("");
                  setLocked(true);
                }}
              >
                重新开始
              </button>
            </div>
          )}
          {!creator && s.incomingCall && (
            <div className="incoming-call-screen">
              <small>
                {s.incomingCall.status === "ringing" ? "来电" : "通话中"} ·
                作品内模拟
              </small>
              <div className="incoming-avatar">
                {s.incomingCall.caller.slice(0, 1)}
              </div>
              <h2>{s.incomingCall.caller}</h2>
              {s.incomingCall.status === "answered" &&
                (() => {
                  const record = work.data.phone?.find(
                    (i) => i.id === s.incomingCall?.target,
                  ) ?? (s.incomingCall?.target === "sasaeng-call"
                    ? sasaengCallRecord
                    : undefined);
                  if (record?.kind === "audio" && safeMedia(record.media))
                    return <audio controls src={safeMedia(record.media)} />;
                  const dialogue = getCallDialogue(record);
                  if (dialogue.length > 0) {
                    const line = dialogue[
                      Math.min(callDialogueIndex, dialogue.length - 1)
                    ];
                    return (
                      <div
                        className="call-dialogue"
                        aria-live="polite"
                        style={{
                          width: "100%",
                          maxWidth: 310,
                          margin: "20px auto",
                          padding: "14px 16px",
                          borderRadius: 16,
                          background: "rgba(255,255,255,0.12)",
                          textAlign: "left",
                          boxSizing: "border-box",
                        }}
                      >
                        <small style={{ opacity: 0.72 }}>{line.speaker}</small>
                        <p style={{ margin: "8px 0 0", lineHeight: 1.65 }}>
                          {line.text}
                        </p>
                        <small style={{ display: "block", opacity: 0.62, marginTop: 12 }}>
                          {callDialogueIndex + 1} / {dialogue.length}
                        </small>
                      </div>
                    );
                  }
                  return <p>这是一通虚构来电。</p>;
                })()}
              <div className="incoming-actions">
                <button
                  className="decline-call"
                  onClick={() => {
                    const call = runtimeRef.current.incomingCall;
                    if (call)
                      update(
                        dispatch(
                          work,
                          { ...runtimeRef.current, incomingCall: null },
                          call.status === "ringing"
                            ? "callDeclined"
                            : "callEnded",
                          call.target || call.caller,
                        ),
                      );
                  }}
                >
                  <PhoneIcon size={25} />
                  <span>
                    {s.incomingCall.status === "ringing" ? "拒接" : "挂断"}
                  </span>
                </button>
                {s.incomingCall.status === "ringing" && (
                  <button
                    className="accept-call"
                    onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (call)
                        update(
                          dispatch(
                            work,
                            {
                              ...runtimeRef.current,
                              incomingCall: { ...call, status: "answered" },
                            },
                            "callAnswered",
                            call.target || call.caller,
                          ),
                        );
                    }}
                  >
                    <PhoneIcon size={25} />
                    <span>接听</span>
                  </button>
                )}
              </div>
            </div>
          )}
          {banner && !locked && (
            <button
              className="device-banner"
              onClick={() => {
                const text = banner;
                setBanner("");
                handleNotificationOpen(text);
              }}
            >
              <AppIcon
                id={notificationContent(banner, work.apps).appId}
                small
              />
              <span>
                <strong>{notificationContent(banner, work.apps).title}</strong>
                <span>{notificationContent(banner, work.apps).body}</span>
              </span>
            </button>
          )}
          {panel === "switcher" && (
            <div className="device-switcher">
              <div className="switcher-cards">
                {recent
                  .filter(
                    (id) =>
                      installedApps.some((a) => a.id === id) &&
                      appSnapshots.current.has(id),
                  )
                  .map((id) => (
                    <button
                      className="recent-app-card"
                      key={id}
                      onClick={() => open(id)}
                    >
                      <span className="recent-app-label">
                        <AppIcon id={id} small />
                        <strong>
                          {work.apps.find((a) => a.id === id)?.name}
                        </strong>
                      </span>
                      <span className="recent-app-window">
                        <span
                          className="recent-app-snapshot"
                          aria-hidden="true"
                          inert
                          ref={(el) => {
                            const snapshot = appSnapshots.current.get(id);
                            if (el && snapshot)
                              el.replaceChildren(snapshot.cloneNode(true));
                          }}
                        />
                      </span>
                    </button>
                  ))}
              </div>
              <button className="switcher-done" onClick={() => setPanel("")}>
                完成
              </button>
            </div>
          )}
          {contextApp && (
            <div
              className="home-context-shade"
              onClick={() => setContextApp("")}
            >
              <div className="home-context-menu">
                <AppIcon id={contextApp} />
                <strong>
                  {work.apps.find((a) => a.id === contextApp)?.name}
                </strong>
                <button
                  onClick={() => {
                    open(contextApp);
                    setContextApp("");
                  }}
                >
                  打开 App
                </button>
                <button
                  onClick={() => {
                    setContextApp("");
                    setPanel("search");
                  }}
                >
                  在 App 库中查看
                </button>
                <button onClick={() => setContextApp("")}>取消</button>
              </div>
            </div>
          )}
          {keyboard && <DeviceKeyboard close={() => setKeyboard(false)} />}
          {loadError && (
            <button className="runtime-error" onClick={() => setLoadError("")}>
              {loadError}
            </button>
          )}
          <button
            className="home-indicator"
            aria-label="返回桌面"
            onClick={() => {
              if (gestureConsumed.current) return;
              if (locked) {
                beginUnlock();
                return;
              }
              captureApp();
              setHomeRequest((n) => n + 1);
              setKeyboard(false);
              setApp("");
              setFolder("");
              setPanel("");
            }}
          />
          <div className="screen-dimmer" />
          <div className="hardware-reflection" />
        </div>
      </KeyboardContext.Provider>
    </div>
  );
}
function AppSearch({
  apps,
  open,
}: {
  apps: Work["apps"];
  open: (id: string) => void;
}) {
  const [q, set] = useState("");
  return (
    <>
      <input
        autoFocus
        value={q}
        placeholder="App 名称"
        onChange={(e) => set(e.target.value)}
      />
      {apps
        .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
        .map((a) => (
          <button
            className="search-result"
            key={a.id}
            onClick={() => open(a.id)}
          >
            <AppIcon id={a.id} small />
            {a.name}
          </button>
        ))}
    </>
  );
}
function Media({ item }: { item: Item }) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline src={src} />
    ) : (
      <img loading="lazy" src={src} alt={item.title} />
    )
  ) : (
    <div
      className={`original-art art-${item.id.includes("ticket") ? "ticket" : "rain"}`}
    >
      <span>
        {item.id.includes("ticket") ? "城南 / SOUTHBOUND" : "after the rain"}
      </span>
      <strong>{item.id.includes("ticket") ? "09 · 01" : "雨 后"}</strong>
      <small>
        {item.id.includes("ticket")
          ? "16:30 · 一张未完成的约定"
          : "a little moment of quiet"}
      </small>
    </div>
  );
}
function AppContent({
  app,
  name,
  items,
  creator,
  state,
  onRead,
  onEdit,
  onAdd,
  onBack,
  onSettings,
  onUi,
  onFamilyCardPayment,
  onFamilyCardReply,
  onReply,
  work,
}: {
  app: AppPlugin;
  name: string;
  items: Item[];
  creator: boolean;
  state: Runtime;
  onRead: (id: string) => void;
  onEdit: (item: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  onSettings?: () => void;
  onUi?: (key: string, value: UiValue) => void;
  onFamilyCardPayment: (card: "陈奕恒" | "张桂源", isFood: boolean) => { sender: string; text: string; kind: "food" | "plain" };
  onFamilyCardReply: (choice: "听" | "不听") => string;
  onReply: (thread: string, text: string) => void;
  work: Work;
}) {
  const [detail, setDetail] = useState<Item | null>(null);
  const [thread, setThread] = useState("");
  useEffect(() => {
    const requested = state.ui?.wechat?.openThread;
    if (app.id === "wechat" && typeof requested === "string" && requested) {
      setThread(requested);
      onUi?.("openThread", "");
    }
  }, [app.id, state.ui?.wechat?.openThread]);
  const [tab, setTab] = useState(app.tabs[0]);
  const [q, setQ] = useState("");
  const [pw, setPw] = useState("");
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [pwError, setPwError] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const [familyCardPopup, setFamilyCardPopup] = useState<{ sender: string; text: string; kind: "food" | "plain" } | null>(null);
  const shown = items
    .filter((i) => creator || visible(i, state))
    .filter((i) =>
      (i.title + i.body + i.sender).toLowerCase().includes(q.toLowerCase()),
    );
  const filtered =
    tab === "收藏"
      ? shown.filter((i) => i.favorite)
      : tab === app.tabs[0]
        ? shown
        : shown.filter((i) => i.folder === tab);
  const read = (i: Item) => {
    if (creator) {
      onEdit(i);
      return;
    }
    setDetail(i);
    if (!i.password || unlocks.includes(i.id)) onRead(i.id);
  };
  const payWithFamilyCard = (card: "陈奕恒" | "张桂源") => {
    if (creator || !detail) return;
    const popup = onFamilyCardPayment(card, app.id === "delivery");
    setFamilyCardPopup(popup);
  };
  const chooseFamilyCardReply = (choice: "听" | "不听") => {
    const popup = familyCardPopup;
    if (!popup || popup.kind !== "food") return;
    const text = onFamilyCardReply(choice);
    setFamilyCardPopup({ sender: "陈奕恒", text, kind: "plain" });
  };
  const chats = [...new Set(shown.map((i) => i.title))];
  const back = () => {
    if (detail) setDetail(null);
    else if (thread) setThread("");
    else onBack();
  };
  const Skin =
    app.id === "wechat"
      ? WeChatSkin
      : app.id === "whatsapp"
        ? WhatsAppSkin
        : (catalogSkins[app.id as keyof typeof catalogSkins] ?? null);
  const detailView = detail ? (
    <div className="phone-content detail-content">
      {detail.password && !creator && !unlocks.includes(detail.id) ? (
        <div className="locked-note">
          <LockKeyhole size={36} />
          <h3>这条内容已锁定</h3>
          <input
            type="password"
            placeholder="内容密码"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            onClick={() => {
              if (pw === detail.password) {
                setUnlocks([...unlocks, detail.id]);
                onRead(detail.id);
                setPwError("");
              } else setPwError("密码不正确");
            }}
          >
            解锁内容
          </button>
          <small>{pwError}</small>
        </div>
      ) : (
        <>
          <small className="detail-meta">
            {detail.time} · {detail.sender}
          </small>
          <h2>{detail.title}</h2>
          {(detail.media || ["media", "social"].includes(app.engine)) && (
            <Media item={detail} />
          )}
          <RichText value={detail.richText} fallback={detail.body} />
          {!creator && ["delivery", "taobao"].includes(app.id) && (
            <div style={{ marginTop: 22, display: "grid", gap: 8 }}>
              <button
                onClick={() => setFamilyCardPopup({ sender: "选择亲情卡", text: "请选择本次支付使用的亲情卡", kind: "plain" })}
                style={{ width: "100%", padding: "13px 16px", border: 0, borderRadius: 12, background: "#ff6a00", color: "#fff", fontWeight: 700, fontSize: 15 }}
              >
                购买 / 下单 · 亲情卡代付
              </button>
              {familyCardPopup?.sender === "选择亲情卡" && (
                <div style={{ display: "grid", gap: 8, padding: 12, borderRadius: 12, background: "var(--surface, #f5f5f5)" }}>
                  <button onClick={() => payWithFamilyCard("陈奕恒")} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, background: "#fff" }}>陈奕恒的亲情卡</button>
                  <button onClick={() => payWithFamilyCard("张桂源")} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, background: "#fff" }}>张桂源的亲情卡</button>
                </div>
              )}
            </div>
          )}
          {familyCardPopup && familyCardPopup.sender !== "选择亲情卡" && (
            <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,.38)", display: "grid", placeItems: "center", padding: 24 }}>
              <div style={{ width: "100%", maxWidth: 320, borderRadius: 22, background: "#f7f7f7", padding: 18, boxShadow: "0 18px 60px rgba(0,0,0,.25)", color: "#111" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "#07c160", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>微</div>
                  <div><strong>微信</strong><div style={{ fontSize: 12, color: "#777" }}>{familyCardPopup.sender}</div></div>
                </div>
                <div style={{ padding: "12px 14px", borderRadius: "4px 14px 14px 14px", background: "#fff", lineHeight: 1.6, fontSize: 15 }}>{familyCardPopup.text}</div>
                {familyCardPopup.kind === "food" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                    <button onClick={() => chooseFamilyCardReply("听")} style={{ padding: 11, border: 0, borderRadius: 10, background: "#07c160", color: "#fff", fontWeight: 700 }}>听</button>
                    <button onClick={() => chooseFamilyCardReply("不听")} style={{ padding: 11, border: "1px solid #ddd", borderRadius: 10, background: "#fff", color: "#222", fontWeight: 700 }}>不听</button>
                  </div>
                )}
                <button onClick={() => { setFamilyCardPopup(null); }} style={{ marginTop: 12, width: "100%", padding: 10, border: 0, borderRadius: 10, background: "#e7e7e7", color: "#333" }}>关闭</button>
              </div>
            </div>
          )}
          <dl className="item-metadata">
            {getFields(app.id)
              .filter((f) => detail.meta?.[f.key])
              .map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>{detail.meta[f.key]}</dd>
                </div>
              ))}
          </dl>
          {detail.folder && (
            <span className="folder-label">
              <Folder size={12} />
              {detail.folder}
            </span>
          )}
          {detail.comments.map((c, i) => (
            <p key={i} className="comment">
              {c}
            </p>
          ))}
        </>
      )}
    </div>
  ) : null;
  if (Skin)
    return (
      <>
        <div className="catalog-slot" hidden={!!detail}>
          <Suspense fallback={<div className="catalog-loading">正在打开…</div>}>
            <Skin
              appId={app.id}
              owner={work.phone.owner}
              virtualTime={state.time}
              ui={state.ui?.[app.id]}
              onUi={creator ? undefined : onUi}
              name={name}
              items={shown}
              creator={creator}
              onRead={onRead}
              onItem={read}
              onAdd={onAdd}
              onBack={onBack}
              thread={thread}
              onThread={setThread}
              onReply={onReply}
            />
          </Suspense>
        </div>
        {detail &&
          (socialDetailApps.has(app.id) &&
          (!detail.password || unlocks.includes(detail.id)) ? (
            <SocialDetail
              app={app.id}
              item={detail}
              back={back}
              owner={work.phone.owner}
              ui={state.ui?.[app.id]}
              onUi={onUi}
            />
          ) : nativeDetailApps.has(app.id) &&
            (!detail.password || unlocks.includes(detail.id)) ? (
            <NativeDetail app={app.id} item={detail} back={back} />
          ) : (
            <>
              <div className="app-nav">
                <button aria-label="返回" onClick={back}>
                  <ChevronLeft size={23} />
                </button>
                <strong>{detail.title}</strong>
                <span />
              </div>
              {detailView}
            </>
          ))}
      </>
    );
  return (
    <>
      <div className="app-nav">
        <button onClick={back} aria-label="返回">
          <ChevronLeft size={23} />
          {detail || thread ? "返回" : ""}
        </button>
        <strong>{thread || name}</strong>
        <button
          onClick={
            creator
              ? onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(
                      ".app-screen .phone-search input",
                    )
                    ?.focus()
          }
          aria-label={creator ? "新增内容" : "搜索内容"}
        >
          {creator ? <Plus size={22} /> : <Search size={20} />}
        </button>
      </div>
      {app.id === "settings" && !detail ? (
        <NativeSettings
          work={work}
          items={items}
          creator={creator}
          onItem={read}
          onSettings={onSettings}
        />
      ) : app.id === "calculator" && !detail ? (
        <NativeCalculator
          items={shown}
          onRead={read}
          ui={state.ui?.[app.id]}
          onUi={onUi}
        />
      ) : detail ? (
        detailView
      ) : app.engine === "messaging" && thread ? (
        <div className="chat-content">
          <div className="chat-time">2026 年 9 月 1 日</div>
          {shown
            .filter((i) => i.title === thread)
            .map((i) => (
              <button
                key={i.id}
                className={`message-row ${i.outgoing ? "outgoing" : ""}`}
                onClick={() => (creator ? onEdit(i) : onRead(i.id))}
              >
                <span className="avatar">{i.sender.slice(0, 1)}</span>
                <span className="bubble">
                  {i.kind === "image" ||
                  i.kind === "audio" ||
                  i.kind === "video" ? (
                    <Media item={i} />
                  ) : i.kind === "transfer" ? (
                    <span className="transfer">
                      ¥ {i.body}
                      <small>虚构转账记录</small>
                    </span>
                  ) : (
                    i.body
                  )}
                  <small>
                    {i.time.slice(-5)} {i.read ? "✓✓" : ""}
                  </small>
                  {creator && (i.hidden || i.unlock) && (
                    <LockKeyhole size={12} />
                  )}
                </span>
              </button>
            ))}
          {creator ? (
            <button className="chat-compose" onClick={onAdd}>
              ＋ 添加一条消息
            </button>
          ) : (
            <div className="chat-compose muted">
              根据剧情推进，互动回复将在这里出现。
            </div>
          )}
        </div>
      ) : (
        <div
          className={`phone-content ${app.engine === "social" ? "feed-content" : ""}`}
        >
          {app.engine !== "media" && (
            <div className="phone-search">
              <Search size={15} />
              <input
                placeholder={`搜索${name}`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}
          {app.engine === "messaging" ? (
            chats.map((t) => {
              const list = shown.filter((i) => i.title === t),
                last = list[list.length - 1];
              return (
                <button
                  className="contact-row"
                  key={t}
                  onClick={() => {
                    setThread(t);
                    onRead(t);
                  }}
                >
                  <span className="avatar" style={{ background: app.color }}>
                    {t.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{t}</strong>
                    <p>{last.body}</p>
                  </span>
                  <small>{last.time.slice(-5)}</small>
                </button>
              );
            })
          ) : app.engine === "media" ? (
            <>
              <div className="media-heading">
                <h1>{tab}</h1>
                <p>{filtered.length} 个故事片段</p>
              </div>
              <div className="media-grid">
                {filtered.map((i) => (
                  <button key={i.id} onClick={() => read(i)}>
                    <Media item={i} />
                    <span>
                      {i.title} {creator && i.hidden ? "· 隐藏" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : app.engine === "social" ? (
            filtered.map((i) => (
              <article className="social-post" key={i.id}>
                <div className="post-author">
                  <span className="avatar" style={{ background: app.color }}>
                    {i.sender.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{i.sender}</strong>
                    <small>{i.time}</small>
                  </div>
                  <button aria-label="查看帖子详情" onClick={() => read(i)}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <button className="post-image" onClick={() => read(i)}>
                  <Media item={i} />
                </button>
                <div className="post-actions">
                  <button
                    aria-label="虚构点赞"
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((id) => id !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={22}
                      fill={likes.includes(i.id) ? "#d67670" : "none"}
                    />
                  </button>
                  <button aria-label="查看评论" onClick={() => read(i)}>
                    <MessageCircle size={22} />
                  </button>
                  <small>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次虚构喜欢
                  </small>
                </div>
                <button className="post-text" onClick={() => read(i)}>
                  <strong>{i.title}</strong>
                  <p>{i.body}</p>
                </button>
              </article>
            ))
          ) : (
            filtered.map((i) => (
              <button
                key={i.id}
                className={`record-row ${app.engine === "document" ? "document-row" : ""}`}
                onClick={() => read(i)}
              >
                <div className="record-symbol">
                  {app.engine === "records" ? (
                    <app.icon size={20} />
                  ) : (
                    <span>{i.title.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <strong>{i.title}</strong>
                  <p>{i.body.split("\n")[0]}</p>
                  <small>
                    {i.time} {i.folder && `· ${i.folder}`}
                  </small>
                </div>
                {i.password || i.hidden ? (
                  <LockKeyhole size={14} />
                ) : (
                  <ChevronLeft className="chevron-right" size={16} />
                )}
              </button>
            ))
          )}
          {!filtered.length && app.engine !== "messaging" && (
            <div className="empty-app">
              <app.icon size={36} />
              <h3>这一页还很安静</h3>
              <p>
                {creator
                  ? "添加属于这个 App 的故事内容。"
                  : "暂时没有可浏览的内容。"}
              </p>
            </div>
          )}
          {creator && (
            <button className="phone-add" onClick={onAdd}>
              <Plus size={15} />
              添加
              {app.engine === "messaging"
                ? "聊天"
                : app.engine === "social"
                  ? "帖子"
                  : app.engine === "media"
                    ? "素材"
                    : "内容"}
            </button>
          )}
        </div>
      )}
      {!detail &&
        !thread &&
        app.id !== "calculator" &&
        app.id !== "settings" && (
          <div className="app-tabs">
            {app.tabs.map((t, i) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {i === 0 ? (
                  <MessageCircle size={17} />
                ) : i === 1 ? (
                  <Search size={17} />
                ) : (
                  <UsersIcon />
                )}
                <span>{t}</span>
              </button>
            ))}
          </div>
        )}
    </>
  );
}
function UsersIcon() {
  return <PhoneIcon size={17} />;
}
