import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  Bookmark,
  Check,
  Compass,
  Heart,
  Home,
  MessageCircle,
  Music,
  Play,
  Plus,
  Search,
  SkipForward,
  User,
  Users,
  Video,
  Share2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { safeMedia, type Item } from "../schema";
import {
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
function TrackPlayer({
  item,
  p,
  onNext,
}: {
  item: Item;
  p: Props;
  onNext: () => void;
}) {
  return (
    <div className="track-player">
      <button onClick={() => p.onItem(item)}>
        <Music size={20} />
        <span>
          {item.title}
          <small>{item.sender}</small>
        </span>
      </button>
      {item.kind === "audio" && safeMedia(item.media) ? (
        <AudioPlayer p={p} item={item} />
      ) : (
        <button onClick={() => p.onItem(item)}>查看</button>
      )}
      <button aria-label="下一首" onClick={onNext}>
        <SkipForward size={19} />
      </button>
    </div>
  );
}
export function SpotifySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [playlist, setPlaylist] = useState(""),
    [track, setTrack] = useTrack(p, items);
  const list = playlist
    ? items.filter((i) => (i.folder || "我的音乐") === playlist)
    : items;
  return (
    <div className="catalog-skin spotify-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <div className="spotify-heading">
          <Avatar name={p.owner ?? "我"} />
          <button
            className={tab === "首页" ? "selected" : ""}
            onClick={() => setTab("首页")}
          >
            音乐
          </button>
          <button
            className={tab === "音乐库" ? "selected" : ""}
            onClick={() => setTab("音乐库")}
          >
            音乐库
          </button>
        </div>
        {tab === "搜索" && <SearchBox value={q} set={setQ} />}
        <h1>{playlist || (tab === "音乐库" ? "音乐库" : "为你收藏")}</h1>
        {!playlist && (
          <div className="spotify-playlists">
            {groupItems(items, "我的音乐").map((g) => (
              <button key={g} onClick={() => setPlaylist(g)}>
                <Music size={29} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        )}
        {playlist && (
          <button className="playlist-back" onClick={() => setPlaylist("")}>
            返回全部音乐
          </button>
        )}
        <div className="spotify-tracks">
          {list.map((i, n) => (
            <button
              key={i.id}
              onClick={() => {
                setTrack(i);
              }}
            >
              <span>{n + 1}</span>
              <div>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </div>
              <small>{meta(i, "duration")}</small>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      {track && (
        <TrackPlayer
          item={track}
          p={p}
          onNext={() =>
            setTrack(
              items[
                (items.findIndex((i) => i.id === track.id) + 1) % items.length
              ],
            )
          }
        />
      )}
      <Tabs
        tabs={["首页", "搜索", "音乐库"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setPlaylist("");
        }}
        icons={[<Home />, <Search />, <Music />]}
      />
    </div>
  );
}
const neteaseDemoPlaylist = [
  ["摇曳！摇曳！", "TF家族"],
  ["说好的幸福呢", "TF家族-陈浚铭"],
  ["遇见", "TF家族-陈浚铭"],
  ["第三人称 (Single Version)", "TF家族-陈浚铭"],
  ["危险的关系", "TF家族"],
  ["拜托拜托", "TF家族"],
  ["一直在身边", "TF家族"],
  ["用尽我的一切奔向你", "TF家族练习生"],
  ["遇见你的时候所有星星都落到我头上", "TF家族-陈浚铭"],
  ["心动 (Heart Beating)", "TF家族"],
  ["如果可以 (Live)", "TF家族-陈浚铭"],
  ["带我走 (Live)", "TF家族-陈浚铭"],
  ["同花顺 (Live)", "TF家族-陈浚铭"],
  ["不完美小孩 (2023 TF少年梦工厂)", "TF家族四代练习生"],
  ["想把我唱给你听 (2026TF家族新年音乐会)", "TF家族四代练习生"],
  ["瞬 (Live)", "TF家族-陈浚铭"],
  ["小幸运 (Live吉他弹唱)", "TF家族-陈浚铭"],
  ["蒲公英的约定 (Live)", "TF家族-陈浚铭"],
  ["世界那么大还是遇见你 (Live)", "TF家族-陈浚铭"],
  ["大梦想家 (Live)", "TF家族-陈浚铭"],
  ["剩下的盛夏 (Live)", "TF家族-陈浚铭"],
  ["明天，你好 (Live)", "TF家族-陈浚铭"],
  ["红玫瑰 (Live)", "TF家族-陈浚铭"],
  ["逆光 (Live)", "TF家族-陈浚铭"],
].map(([title, sender], index) => ({
  id: `netease-demo-${index + 1}`,
  title,
  sender,
  folder: "陈浚铭专属歌单",
  kind: "music" as const,
  body: `${title} — ${sender}`,
  richText: "",
  time: "00:00",
  avatar: "",
  media: "",
  hidden: false,
  unlock: "",
  password: "",
  favorite: false,
  outgoing: false,
  read: false,
  likes: 0,
  comments: [],
  meta: { album: "网易云音乐 · 歌单收藏", trackNumber: String(index + 1) },
}));
export function NeteaseSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [folder, setFolder] = useState(""),
    [track, setTrack] = useTrack(p, items);
  const playlist = useMemo(() => {
    const seen = new Set<string>();
    return [...neteaseDemoPlaylist, ...items.filter((item) => item.kind === "music")]
      .filter((item) => {
        const key = `${item.title}|${item.sender}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .filter((item) => !q || item.title.toLowerCase().includes(q.toLowerCase()) || item.sender.toLowerCase().includes(q.toLowerCase()));
  }, [items, q]);
  const list = folder ? playlist.filter((item) => (item.folder || "我的歌单") === folder) : playlist;
  const folders = Array.from(new Set(playlist.map((item) => item.folder || "我的歌单")));
  return (
    <div className="catalog-skin netease-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} placeholder="搜索歌曲或歌手" />
        {tab === "发现" ? (
          <>
            <div className="netease-feature">
              <Music size={44} />
              <h2>推荐歌单</h2>
              <p>把喜欢的歌，放进同一个夏天</p>
            </div>
            <div className="netease-shelves">
              {folders.map((g) => (
                <button key={g} onClick={() => { setFolder(g); setTab("我的"); }}>
                  <div className="netease-playlist-cover"><Music size={28} /><span>♫</span></div>
                  <strong>{g}</strong>
                  <small>{playlist.filter((item) => (item.folder || "我的歌单") === g).length} 首歌曲</small>
                </button>
              ))}
            </div>
            <h3 className="netease-section-title">为你推荐 · 陈浚铭歌单</h3>
          </>
        ) : (
          <>
            <div className="netease-profile">
              <Avatar name={p.owner ?? "我"} />
              <h2>{p.owner ?? "我的音乐"}</h2>
            </div>
            <div className="netease-playlist-heading">
              <div className="netease-playlist-cover large"><Music size={36}/><span>♫</span></div>
              <div><h3>{folder || "全部歌曲"}</h3><p>TF家族 · 24首歌曲</p><small>按你提供的顺序排列</small></div>
            </div>
          </>
        )}
        {list.map((item, n) => (
          <div className="netease-track" key={item.id}>
            <button onClick={() => { setTrack(item); }}>
              <span>{n + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.sender} · 网易云音乐</small>
              </div>
            </button>
            <button aria-label={`歌曲详情${item.title}`} onClick={() => p.onItem(item)}>
              <MessageCircle size={18} />
            </button>
          </div>
        ))}
        {!list.length && <Empty items={[]} />}
      </div>
      {track && (
        <TrackPlayer
          item={track}
          p={p}
          onNext={() => setTrack(playlist[(playlist.findIndex((item) => item.id === track.id) + 1) % playlist.length])}
        />
      )}
      <Tabs
        tabs={["发现", "我的"]}
        value={tab}
        set={(value) => { setTab(value); setFolder(""); }}
        icons={[<Compass />, <Music />]}
      />
    </div>
  );
}
export function YouTubeSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [category, setCategory] = useState("全部");
  const list = items.filter((i) =>
    tab === "Shorts"
      ? i.folder === "Shorts"
      : tab === "订阅"
        ? i.folder === "订阅"
        : tab === "播放列表"
          ? i.favorite || i.folder === "播放列表"
          : category === "全部" || i.folder === category,
  );
  return (
    <div className="catalog-skin youtube-ui">
      <Header p={p} />
      <SearchBox value={q} set={setQ} />
      <div className="youtube-chips">
        {["全部", ...groupItems(items).filter((g) => g !== "未分类")].map(
          (g) => (
            <button
              className={category === g ? "selected" : ""}
              key={g}
              onClick={() => setCategory(g)}
            >
              {g}
            </button>
          ),
        )}
      </div>
      <div className="catalog-scroll">
        <div className={tab === "Shorts" ? "youtube-shorts" : "youtube-videos"}>
          {list.map((i) => (
            <article key={i.id}>
              <button className="youtube-thumb" onClick={() => p.onItem(i)}>
                <Media item={i} />
                {meta(i, "duration") && <time>{meta(i, "duration")}</time>}
              </button>
              <button className="youtube-byline" onClick={() => p.onItem(i)}>
                <Avatar name={i.sender} />
                <div>
                  <strong>{i.title}</strong>
                  <small>
                    {i.sender} · {meta(i, "views", "—")} 次播放
                  </small>
                </div>
              </button>
            </article>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "Shorts", "订阅", "播放列表"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Video />, <Users />, <User />]}
      />
    </div>
  );
}
const bilibiliDemoVideos: Item[] = [
  { id: "bili-demo-01", title: "辐能局1v3残局拆解：什么时候该假身骗枪什么时候直架 | 晚灯Val", body: "高分局残局思路拆解，假身骗枪与直架时机分析。", richText: "", meta: { views: "12.8万", duration: "08:42", category: "游戏" }, time: "2026-10-26 08:00", sender: "晚灯Val", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 2380, comments: [] },
  { id: "bili-demo-02", title: "【恒铭混剪】从此匿名的好友", body: "恒铭向混剪｜从此匿名的好友。", richText: "", meta: { views: "8.6万", duration: "03:16", category: "混剪" }, time: "2026-10-26 08:00", sender: "汽水剪辑社", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 5600, comments: [] },
  { id: "bili-demo-03", title: "中考数学压轴大题｜二次函数综合题型精讲 | 一数", body: "二次函数综合题型精讲，带你拆解中考压轴题。", richText: "", meta: { views: "32.1万", duration: "18:35", category: "学习" }, time: "2026-10-26 08:00", sender: "一数", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 12000, comments: [] },
  { id: "bili-demo-04", title: "捷风不是只有dash！高分局拉扯换身位的节奏逻辑 | JF瓦教学", body: "捷风身位控制、拉扯和进退节奏教学。", richText: "", meta: { views: "6.4万", duration: "11:09", category: "游戏" }, time: "2026-10-26 08:00", sender: "JF瓦教学", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 1900, comments: [] },
  { id: "bili-demo-05", title: "【文铭】杨博文×陈浚铭｜我的耳返有你的贝斯声", body: "文铭向双人混剪｜我的耳返有你的贝斯声。", richText: "", meta: { views: "10.2万", duration: "04:28", category: "混剪" }, time: "2026-10-26 08:00", sender: "橘子汽水放映室", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 7300, comments: [] },
  { id: "bili-demo-06", title: "物理电学难点梳理｜中考高频易错点汇总 | 物理杨老师", body: "中考物理电学知识点与高频易错题梳理。", richText: "", meta: { views: "19.7万", duration: "15:22", category: "学习" }, time: "2026-10-26 08:00", sender: "物理杨老师", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 8400, comments: [] },
  { id: "bili-demo-07", title: "莲华古城A大单向烟进阶变式，老烟位都不一定知道 | 烟位观测站", body: "莲华古城A大单向烟进阶变式点位。", richText: "", meta: { views: "4.8万", duration: "07:51", category: "游戏" }, time: "2026-10-26 08:00", sender: "烟位观测站", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 1500, comments: [] },
  { id: "bili-demo-08", title: "【桂铭】张桂源x陈浚铭｜同手同脚", body: "桂铭向双人混剪｜同手同脚。", richText: "", meta: { views: "7.9万", duration: "03:52", category: "混剪" }, time: "2026-10-26 08:00", sender: "小熊汽水铺", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 4900, comments: [] },
  { id: "bili-demo-09", title: "中考英语完形解题逻辑，避开出题人陷阱 | 南瓜英语", body: "完形填空解题逻辑与常见陷阱分析。", richText: "", meta: { views: "22.4万", duration: "12:47", category: "学习" }, time: "2026-10-26 08:00", sender: "南瓜英语", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 9800, comments: [] },
  { id: "bili-demo-10", title: "职业赛局复盘｜DRG这套默认控图思路放到排位同样好用 | 瓦赛事研究所", body: "职业赛局复盘：默认控图与转点节奏。", richText: "", meta: { views: "9.1万", duration: "16:03", category: "游戏" }, time: "2026-10-26 08:00", sender: "瓦赛事研究所", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 3200, comments: [] },
  { id: "bili-demo-11", title: "【all铭】太爱铭铭了怎么办？｜四代糖点混剪 | 小铭观测站", body: "all铭向四代糖点混剪。", richText: "", meta: { views: "13.6万", duration: "05:06", category: "混剪" }, time: "2026-10-26 08:00", sender: "小铭观测站", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 8800, comments: [] },
  { id: "bili-demo-12", title: "中考历史时间线速记，一口气梳理全部考点 | 历史周老师", body: "中考历史时间线与核心考点速记。", richText: "", meta: { views: "17.3万", duration: "14:18", category: "学习" }, time: "2026-10-26 08:00", sender: "历史周老师", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 7600, comments: [] },
  { id: "bili-demo-13", title: "【高分复盘】钻石到辐能核心常见对位思维误区拆解 | 瓦罗兰特Replays", body: "从钻石到辐能的对位思维与常见误区。", richText: "", meta: { views: "5.7万", duration: "13:41", category: "游戏" }, time: "2026-10-26 08:00", sender: "瓦罗兰特Replays", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 2100, comments: [] },
  { id: "bili-demo-14", title: "深海明珠防守方变速轮转，打破对手默认进点节奏 | 回合制战术", body: "深海明珠防守方变速轮转策略。", richText: "", meta: { views: "3.9万", duration: "09:34", category: "游戏" }, time: "2026-10-26 08:00", sender: "回合制战术", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 1300, comments: [] },
  { id: "bili-demo-15", title: "五排固定车队进攻默认流程拆解，告别乱冲 | 车队战术笔记", body: "五排进攻默认流程、信息交换与协同推进。", richText: "", meta: { views: "2.8万", duration: "10:26", category: "游戏" }, time: "2026-10-26 08:00", sender: "车队战术笔记", avatar: "", kind: "video", media: "", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 950, comments: [] },
];
function bilibiliCover(item: Item) {
  const title = item.title;
  const category = item.meta.category || "生活";
  const visual = category === "游戏" ? "VALORANT" : category === "学习" ? "中考冲刺" : "恒铭混剪";
  const icon = category === "游戏" ? "🎯" : category === "学习" ? "✦" : "♡";
  return (
    <div className={`bili-generated-cover ${category === "游戏" ? "game" : category === "学习" ? "study" : "edit"}`}>
      <span className="bili-cover-kicker">{visual} · BILIBILI</span>
      <span className="bili-cover-symbol">{icon}</span>
      <strong>{title.split(/[｜|]/)[0].slice(0, 26)}</strong>
      <small>{category === "游戏" ? "战术解析 / 高分复盘" : category === "学习" ? "重点梳理 / 考点精讲" : "双人向 / 高光混剪"}</small>
    </div>
  );
}
export function BilibiliSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [category, setCategory] = useState("推荐");
  const seededItems = [...bilibiliDemoVideos, ...items.filter((item) => !bilibiliDemoVideos.some((demo) => demo.title === item.title))];
  const list =
    tab === "历史"
      ? items.filter((i) => i.folder === "历史")
      : tab === "动态"
        ? items.filter((i) => i.folder === "动态")
        : (category === "推荐" ? seededItems : items.filter((i) => i.folder === category))
            .filter((i) => !q.trim() || i.title.toLowerCase().includes(q.toLowerCase()) || i.sender.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="catalog-skin bilibili-ui">
      <Header p={p} />
      <div className="bili-search">
        <Avatar name={p.owner ?? "我"} />
        <SearchBox value={q} set={setQ} />
      </div>
      <div className="bili-categories">
        {["推荐", "动画", "音乐", "生活"].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <div className="bili-grid">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <div>
                {i.id.startsWith("bili-demo-") ? bilibiliCover(i) : <Media item={i} />}
                <small>
                  <Play size={10} />
                  {meta(i, "views", "—")}
                  <time>{meta(i, "duration")}</time>
                </small>
              </div>
              <strong>{i.title}</strong>
              <span>UP · {i.sender}</span>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "动态", "历史"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <MessageCircle />, <User />]}
      />
    </div>
  );
}
function VerticalVideo({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false),
    [saved, setSaved] = useSkinState<boolean>(p, `saved-${item.id}`, false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setPlaying] = useState(true);
  useEffect(() => {
    const video = videoRef.current;
    const card = video?.closest(".vertical-video");
    if (!video || !card) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          video.pause();
          setPlaying(false);
        }
      }
    }, { threshold: [0, 0.65, 1] });
    observer.observe(card);
    return () => observer.disconnect();
  }, [item.id]);
  const activateSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    if (video.paused) void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  };
  return (
    <article className="vertical-video">
      {item.kind === "video" && safeMedia(item.media) ? (
        <video
          ref={videoRef}
          src={safeMedia(item.media)}
          muted={false}
          autoPlay
          loop
          playsInline
          preload="auto"
          aria-label={item.title}
          onTouchStart={activateSound}
          onPointerDown={activateSound}
          onClick={togglePlayback}
        />
      ) : <Media item={item} />}
      <div className="vertical-actions">
        <button
          aria-label={`作者${item.sender}`}
          onClick={() => p.onItem(item)}
        >
          <Avatar name={item.sender} src={item.avatar} />
        </button>
        <button
          aria-label={`喜欢${item.title}`}
          onClick={() => setLiked(!liked)}
        >
          <Heart size={29} fill={liked ? "#f44368" : "white"} />
          <small>{meta(item, "displayLikes", String(item.likes + (liked ? 1 : 0)))}</small>
        </button>
        <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
          <MessageCircle size={29} />
          <small>{meta(item, "commentCount", String(item.comments.length))}</small>
        </button>
        <button aria-label={`转发${item.title}`} onClick={() => p.onItem(item)}>
          <Share2 size={26} />
          <small>{meta(item, "shareCount", "分享")}</small>
        </button>
        <button
          aria-label={`收藏${item.title}`}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark size={27} fill={saved ? "#f8cc55" : "none"} />
        </button>
      </div>
      <button className="vertical-caption" onClick={() => p.onItem(item)}>
        <strong>@{item.sender}</strong>
        <p>{item.body}</p>
        <small>
          <Music size={11} />
          {item.title}
        </small>
      </button>
    </article>
  );
}
const uploadedDouyinVideos: Item[] = [
  {
    id: "uploaded-douyin-01", title: "支持师兄😁😁大战比伯",
    body: "支持师兄😁😁大战比伯",
    richText: "", meta: { handle: "陈浚铭", displayLikes: "28.6w", commentCount: "1.8万", shareCount: "12.4万", reposts: "12.4万", simulatedStats: "true" },
    time: "2026-10-26 10:00", sender: "陈浚铭", avatar: "./IMG_4390.jpeg",
    kind: "video", media: "./912ae0a07e7e9c7e504e49b0c75a101a.MP4", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 286000,
    comments: ["支持师兄！这波必须冲😁😁", "大战比伯哈哈哈哈哈哈这个标题我先笑了", "师兄加油！气势先拉满！", "谁懂这句文案的含金量🤣", "这条必须转给朋友看！", "支持支持，评论区集合！", "哈哈哈哈哈哈赢面先加到百分之百", "师兄的排面不能少！", "这波属于先声夺人😎", "笑死我了，怎么这么有梗", "期待后续！", "评论区全是气氛组哈哈哈", "这句我能重复念一天", "支持师兄😁", "必须大战一场！", "这个视频我刷到第三遍了", "哈哈哈哈哈哈哈哈", "转发给姐妹一起笑", "师兄冲冲冲！", "有点东西，收藏了"]
  },
  {
    id: "uploaded-douyin-02", title: "喜欢小狗是人之常情吗？",
    body: "喜欢小狗是人之常情吗？",
    richText: "", meta: { handle: "陈浚铭", displayLikes: "45.2w", commentCount: "2.6万", shareCount: "8.7万", reposts: "8.7万", simulatedStats: "true" },
    time: "2026-10-26 10:01", sender: "陈浚铭", avatar: "./IMG_4390.jpeg",
    kind: "video", media: "./e4a55bf771b9089c6d893dbca7474771.MP4", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 452000,
    comments: ["当然是人之常情！！小狗谁不爱啊😭", "小狗就是世界上最可爱的生物！", "问出这句话的人已经被小狗拿捏了", "喜欢小狗怎么会有错！", "想把全世界的小狗都抱一遍", "这条建议循环播放", "小狗：你终于懂我了🐶", "小狗真的会治愈一切", "评论区统一回复：是！", "当然是啦！", "谁能拒绝毛茸茸的小狗啊", "我宣布这是今日最佳问题", "小狗可爱值直接拉满", "想看更多小狗日常！", "喜欢小狗是本能哈哈哈哈", "我家狗狗也想回答这个问题", "救命真的太可爱了", "看完想立刻去摸狗", "转发给那个说我太喜欢狗的人", "这个问题不需要思考！"]
  },
  {
    id: "uploaded-douyin-03", title: "找呀找呀找朋友",
    body: "找呀找呀找朋友",
    richText: "", meta: { handle: "陈浚铭", displayLikes: "39.7w", commentCount: "2.1万", shareCount: "9.8万", reposts: "9.8万", simulatedStats: "true" },
    time: "2026-10-26 10:02", sender: "陈浚铭", avatar: "./IMG_4390.jpeg",
    kind: "video", media: "./v0200fg10000cplfgv7og65o0nana5f0.MP4", hidden: false, unlock: "", password: "", folder: "推荐", favorite: false, outgoing: false, read: false, likes: 397000,
    comments: ["找呀找呀找朋友～找到一个好朋友🎵", "这旋律一出来DNA动了", "小时候的回忆突然攻击我", "谁跟我一样自动接上下一句", "这个配乐太有魔性了", "哈哈哈哈哈好可爱", "一秒回到幼儿园", "朋友在哪里！我来啦！", "这条视频好有童趣", "我已经开始跟着唱了", "评论区一起唱起来！", "找到一个好朋友😁", "这首歌真的刻在脑子里", "太适合当循环视频了", "哈哈哈哈哈哈哈", "童年回忆杀", "看完心情都变好了", "我朋友已经被我转发烦了", "可爱可爱可爱", "再看一遍！"]
  },

];
export function DouyinSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "推荐");
  const feedItems = [
    ...uploadedDouyinVideos,
    ...items.filter((item) => !uploadedDouyinVideos.some((video) => video.id === item.id)),
  ];
  const list = tab === "推荐" ? feedItems : feedItems.filter((i) => i.folder === tab);
  return (
    <div className="catalog-skin douyin-ui">
      <Header p={p} />
      <div className="douyin-top">
        {["同城", "关注", "推荐"].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="vertical-feed">
        {list.map((i) => (
          <VerticalVideo key={i.id} p={p} item={i} />
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["推荐", "关注", "我"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function TikTokSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "For You");
  const list =
    tab === "For You"
      ? items
      : tab === "Following"
        ? items.filter((i) => i.folder === "关注" || i.folder === "Following")
        : items.filter((i) => i.folder === "个人主页");
  return (
    <div className="catalog-skin tiktok-ui">
      <Header p={p} />
      <div className="tiktok-top">
        <button
          className={tab === "Following" ? "selected" : ""}
          onClick={() => setTab("Following")}
        >
          Following
        </button>
        <button
          className={tab === "For You" ? "selected" : ""}
          onClick={() => setTab("For You")}
        >
          For You
        </button>
      </div>
      <div className="vertical-feed">
        {list.map((i) => (
          <VerticalVideo key={i.id} p={p} item={i} />
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["For You", "Following", "Profile"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function NetflixSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [saved, setSaved] = useSkinState<string[]>(p, "saved", []);
  const list =
    tab === "我的片单"
      ? items.filter((i) => i.favorite || saved.includes(i.id))
      : items;
  const featured = list[0];
  return (
    <div className="catalog-skin netflix-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {featured && tab === "首页" && (
          <div className="netflix-feature">
            <Media item={featured} />
            <div>
              <strong>{featured.title}</strong>
              <small>
                {meta(featured, "year")} · {meta(featured, "genre")} ·{" "}
                {meta(featured, "duration")}
              </small>
              <button onClick={() => p.onItem(featured)}>
                <Play size={16} />
                播放 / 详情
              </button>
              <button
                onClick={() =>
                  setSaved(
                    saved.includes(featured.id)
                      ? saved.filter((id) => id !== featured.id)
                      : [...saved, featured.id],
                  )
                }
              >
                {saved.includes(featured.id) ? (
                  <Check size={16} />
                ) : (
                  <Plus size={16} />
                )}
                我的片单
              </button>
            </div>
          </div>
        )}
        {groupItems(list, "影片").map((g) => (
          <section className="netflix-shelf" key={g}>
            <h3>{g}</h3>
            <div>
              {list
                .filter((i) => (i.folder || "影片") === g)
                .map((i) => (
                  <button key={i.id} onClick={() => p.onItem(i)}>
                    <Media item={i} />
                    <strong>{i.title}</strong>
                  </button>
                ))}
            </div>
          </section>
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "我的片单"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Bookmark />]}
      />
    </div>
  );
}

