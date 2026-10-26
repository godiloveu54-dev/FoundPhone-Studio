import { useSkinState } from "../skinState";
import {
  ArrowDown,
  ArrowUp,
  AtSign,
  Bookmark,
  Camera,
  ChevronRight,
  Grid,
  Hash,
  Heart,
  Home,
  MessageCircle,
  Repeat2,
  User,
  Users,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import type { Item } from "../schema";
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
function Actions({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false),
    [saved, setSaved] = useSkinState<boolean>(p, `saved-${item.id}`, false);
  return (
    <div className="social-actions">
      <button aria-label={`喜欢${item.title}`} onClick={() => setLiked(!liked)}>
        <Heart size={17} fill={liked ? "currentColor" : "none"} />
        {item.likes + (liked ? 1 : 0) || ""}
      </button>
      <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
        <MessageCircle size={17} />
        {item.comments.length || ""}
      </button>
      <button aria-label={`详情${item.title}`} onClick={() => p.onItem(item)}>
        <Repeat2 size={17} />
        {meta(item, "reposts")}
      </button>
      <button aria-label={`收藏${item.title}`} onClick={() => setSaved(!saved)}>
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
function PostHeader({ item, p }: { item: Item; p: Props }) {
  return (
    <button className="social-author" onClick={() => p.onItem(item)}>
      <Avatar name={item.sender} />
      <span>
        <strong>{item.sender}</strong>
        <small>{meta(item, "handle", item.time)}</small>
      </span>
    </button>
  );
}
function WeiboActions({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false);
  return (
    <div className="social-actions weibo-actions">
      <button aria-label={`转发${item.title}`} onClick={() => p.onItem(item)}>
        <Share2 size={17} />
        {meta(item, "reposts", "转发")}
      </button>
      <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
        <MessageCircle size={17} />
        {item.comments.length || "评论"}
      </button>
      <button
        aria-label={`喜欢${item.title}`}
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <ThumbsUp size={17} fill={liked ? "currentColor" : "none"} />
        {item.likes + (liked ? 1 : 0) || "赞"}
      </button>
    </div>
  );
}
const weiboDemoPosts: Item[] = [
  {
    id: "weibo-demo-chen-yiheng-20240825",
    title: "组员借菜做饭记录",
    body: "我们的组员要去村民的家借菜，我们就随便找了一家，然后还真要了，所以我觉得我们很不错👍，还真要到了。做了一些番茄炒鸡蛋🍅，还做一个鸡蛋🥚，哎，不对，还做了个番茄跟红糖配。陈浚铭很喜欢吃🥰，然后他就是吃光了。我们组整体来说表现得还挺不错的，我们非常开心，还做出咱们自己觉得很美味的菜。😊",
    sender: "TF家族-陈奕恒Jonathan",
    time: "2024-08-25 22:08",
    folder: "关注",
    kind: "text",
    media: "",
    hidden: false,
    favorite: false,
    outgoing: false,
    read: false,
    likes: 0,
    comments: [],
    meta: { handle: "24-8-25 22:08" },
  },
  {
    id: "weibo-demo-chen-yiheng-20250416",
    title: "和陈浚铭一起看电影",
    body: "最近抽出一点时间和陈浚铭一起去看了一部电影😆😆😆，这部电影讲的是关于真人进入了游戏世界里，🥳🥳其实我们在现实中也玩过这个游戏，所以很想看看电影是什么感觉。😆😆😆",
    sender: "TF家族-陈奕恒Jonathan",
    time: "2025-04-16",
    folder: "关注",
    kind: "text",
    media: "",
    hidden: false,
    favorite: false,
    outgoing: false,
    read: false,
    likes: 0,
    comments: [],
    meta: { handle: "25-4-16" },
  },
  {
    id: "weibo-demo-chen-yiheng-20250620",
    title: "夏日派对和陈浚铭生日",
    body: "这次的夏日派对，我们每个人都玩的很嗨，氛围感也很足，没想到玩游戏的时候我还知道很多歌🤣🤣🤣，当时我单人唱的是海芋恋，也很适合这个氛围，而且还在派对期间给陈浚铭过了一个生日。很开心，希望多来点这种派对。😆😆😆",
    sender: "TF家族-陈奕恒Jonathan",
    time: "2025-06-20 22:29",
    folder: "关注",
    kind: "text",
    media: "",
    hidden: false,
    favorite: false,
    outgoing: false,
    read: false,
    likes: 0,
    comments: [],
    meta: { handle: "25-6-20 22:29" },
  },
  {
    id: "weibo-demo-chen-junming-20250426",
    title: "陈太师出来打篮球吃饭",
    body: "哈哈哈哈哈，大家好啊，我是陈太师，今天出来和陈奕恒一起打了篮球吃了饭，大家也要好好吃饭哦，嘻嘻嘻！",
    sender: "TF家族-陈浚铭chen",
    time: "2025-04-26 22:51",
    folder: "我的",
    kind: "text",
    media: "",
    hidden: false,
    favorite: false,
    outgoing: false,
    read: false,
    likes: 0,
    comments: [],
    meta: { handle: "25-4-26 22:51" },
  },
  {
    id: "weibo-demo-chen-junming-20240520",
    title: "学习师兄《非我不可》",
    body: "哈哈哈哈哈哈，学习了一个唱跳，就是师兄的《非我不可》。我们拍的时候是围绕一个剧情来拍的，大概就是讲了原本我们九个人每个人都有一个碎片，想拼成一个图形，但一直拼不出来。最后杨涵博他们，带着剩下的四个碎片登场了，我们一起拼成了一个大爱心，然后被陈奕恒抱走了，陈奕恒最后那个真的很好玩。哈哈哈哈哈哈😂",
    sender: "TF家族-陈浚铭chen",
    time: "2024-05-20 22:30",
    folder: "我的",
    kind: "text",
    media: "",
    hidden: false,
    favorite: false,
    outgoing: false,
    read: false,
    likes: 0,
    comments: [],
    meta: { handle: "24-5-20 22:30" },
  },
];

const weiboFanComments: Record<string, string[]> = {
  "weibo-demo-chen-yiheng-20240825": [
    "哈哈哈哈番茄配红糖是什么神奇组合！陈浚铭吃光了才是重点🤣",
    "救命，原来陈浚铭喜欢吃这个，奕恒记得也太清楚了吧🥹",
    "借菜做饭的故事好有生活感，想看你们下次做什么！",
    "看得出来这一组真的很有默契，做饭也能这么开心😆",
    "陈浚铭：只要好吃我就全部吃光！😂",
    "这段描述怎么这么可爱，尤其是那个“哎，不对”哈哈哈",
    "想看做饭vlog！拜托多更新一点日常吧🙏",
    "你们觉得美味就好啦，快乐才是最重要的🥰",
    "红糖番茄我先观望一下哈哈哈哈，有机会试试看！",
    "每次讲到陈浚铭都好自然，感觉当时一定很欢乐❤️",
  ],
  "weibo-demo-chen-yiheng-20250416": [
    "和朋友一起看喜欢的游戏电影真的会加倍快乐🎮",
    "求电影名字！听起来好有意思！",
    "现实里玩过再看电影，代入感一定很强吧😆",
    "你们下次一起玩游戏也记得分享一下！",
    "这种一起出去玩的日常请多来一点🥹",
    "能和熟悉的人一起看电影真的很幸福呀",
    "感觉你们看完肯定聊了好多游戏细节哈哈哈",
    "电影里的游戏世界和现实对照起来一定很有趣！",
    "期待下一次双人游戏局！🎮",
    "一起玩一起笑的回忆最珍贵啦❤️",
  ],
  "weibo-demo-chen-yiheng-20250620": [
    "海芋恋好适合夏日派对！光想象现场就很有氛围🌺",
    "生日派对听起来太快乐了，祝大家天天开心！",
    "想看完整的派对花絮！一定有好多名场面🤣",
    "能和朋友一起过生日真的很幸福🥰",
    "夏日派对请多办几次，我们还想听你唱歌！",
    "这种热热闹闹的回忆真的会记很久吧❤️",
    "海芋恋一响，夏天的感觉就来了！",
    "生日快乐虽然晚了一点，但祝福一直有效🎂",
    "求一个派对歌单，感觉每首都很适合夏天！",
    "希望以后还有更多值得珍藏的快乐时刻✨",
  ],
  "weibo-demo-chen-junming-20250426": [
    "陈太师哈哈哈哈哈，这个称呼我能笑一天🤣",
    "打完篮球再吃饭，快乐的一天安排得明明白白！",
    "你们两个一起出去玩也太有生活感了🥹",
    "陈太师提醒大家吃饭，自己也要按时吃饭哦！",
    "求篮球局后续！下次还要一起打呀🏀",
    "这条微博每个字都很有画面感哈哈哈",
    "友谊就是一起运动、一起吃饭、一起开心❤️",
    "听劝！这就去好好吃饭！",
    "陈奕恒快来评论区报到哈哈哈哈😆",
    "这种简单快乐的日常真的最治愈了",
  ],
  "weibo-demo-chen-junming-20240520": [
    "大爱心拼起来的瞬间一定超级感动吧❤️",
    "陈奕恒最后把爱心抱走也太有梗了哈哈哈哈",
    "九个人拼爱心的剧情好可爱，想再看一次！",
    "《非我不可》真的很适合你们，舞台记忆点满满！",
    "陈浚铭：爱心先寄存一下，之后记得还我🤣",
    "这段幕后故事一定要多讲，听着就很好玩",
    "全员一起拼成爱心的画面想想都好温暖🥹",
    "最后那个动作是不是大家都没忍住笑哈哈哈",
    "求完整视频！想把这个片段反复看！",
    "这种团体回忆真的值得一直珍藏✨",
  ],
};
const weiboViralStats: Record<string, { reposts: string; comments: string; likes: string }> = {
  "weibo-demo-chen-yiheng-20240825": { reposts: "128.6万", comments: "96.8万", likes: "286.4万" },
  "weibo-demo-chen-yiheng-20250416": { reposts: "106.2万", comments: "82.7万", likes: "241.9万" },
  "weibo-demo-chen-yiheng-20250620": { reposts: "139.5万", comments: "118.3万", likes: "312.8万" },
  "weibo-demo-chen-junming-20250426": { reposts: "115.7万", comments: "91.4万", likes: "267.2万" },
  "weibo-demo-chen-junming-20240520": { reposts: "102.8万", comments: "87.6万", likes: "253.1万" },
};
const weiboAuthorReplies: Record<string, string> = {
  "weibo-demo-chen-yiheng-20240825": "看见你爱吃我可太开心啦😎😁😆",
  "weibo-demo-chen-yiheng-20250416": "和你一起玩游戏看电影真开心😆😆 下次有机会我们一定还要一起！拉钩！",
  "weibo-demo-chen-yiheng-20250620": "虽然你的生日已经过去一个月了 但是我还是想祝你快乐🎉😆 那天真的很开心 我会一直收藏这份回忆的 希望以后一直陪你过生日🥰",
};
const weiboMyPostReplies: Record<string, string> = {
  "weibo-demo-chen-junming-20250426": "真想每天和今天一样开心😆😆",
  "weibo-demo-chen-junming-20240520": "❤️抱走的爱心还给你😆",
};
type WeiboReply = { author: string; text: string; isAuthor?: boolean };
export function WeiboSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "关注");
  const [feed, setFeed] = useState("全部");
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [replies, setReplies] = useState<Record<string, WeiboReply[]>>({});
  const [quickReplyVisible, setQuickReplyVisible] = useState<string | null>(null);
  const allPosts = [
    ...weiboDemoPosts,
    ...items.filter((item) => !weiboDemoPosts.some((demo) => demo.id === item.id)),
  ];
  const tabPosts = tab === "我"
    ? allPosts.filter((item) => item.sender === "TF家族-陈浚铭chen" || item.folder === "个人主页" || item.folder === "我的")
    : allPosts.filter((item) => item.sender !== "TF家族-陈浚铭chen" && item.folder !== "我的");
  const filteredPosts = tabPosts
    .filter((item) =>
      !q.trim() ||
      item.body.toLowerCase().includes(q.toLowerCase()) ||
      item.sender.toLowerCase().includes(q.toLowerCase()) ||
      item.title.toLowerCase().includes(q.toLowerCase())
    )
    .sort((a, b) => b.time.localeCompare(a.time));
  const list = feed === "全部" ? filteredPosts : filteredPosts.filter((i) => i.folder === feed);
  const submitReply = (item: Item) => {
    const text = (drafts[item.id] || "").trim();
    if (!text) return;
    const next: WeiboReply[] = [{ author: p.owner || "我", text }, ...(replies[item.id] || [])];
    if (weiboAuthorReplies[item.id]) {
      next.push({ author: item.sender, text: weiboAuthorReplies[item.id], isAuthor: true });
    }
    setReplies((old) => ({ ...old, [item.id]: [...(old[item.id] || []), ...next] }));
    setDrafts((old) => ({ ...old, [item.id]: "" }));
    setQuickReplyVisible(item.id === "weibo-demo-chen-yiheng-20250620" ? item.id : null);
    setOpenComments(item.id);
  };
  return (
    <div className="catalog-skin weibo-ui">
      <Header p={p} />
      <div className="weibo-sections">
        {["关注", "发现", "我"].map((t) => (
          <button key={t} className={tab === t ? "selected" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="catalog-scroll">
        {tab === "我" ? (
          <div className="weibo-profile">
            <Avatar name={p.owner ?? "我"} />
            <h2>{p.owner ?? "我"}</h2>
            <span>{allPosts.filter((item) => item.sender === "TF家族-陈浚铭chen").length} 条微博</span>
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            <div className="weibo-feed-filter">
              {["全部", ...groupItems(items).filter((g) => g !== "未分类")].map((g) => (
                <button key={g} onClick={() => setFeed(g)}>{g}</button>
              ))}
            </div>
          </>
        )}
        {list.map((i) => {
          const stats = weiboViralStats[i.id];
          const fanComments = weiboFanComments[i.id] || [];
          const thread = replies[i.id] || [];
          const count = stats ? stats.comments : String(i.comments.length || "评论");
          return (
            <article className="weibo-post" key={i.id}>
              <PostHeader p={p} item={i} />
              <button className="social-body" onClick={() => p.onItem(i)}>
                <p>{i.body}</p>
                {i.media && <Media item={i} />}
              </button>
              {stats && (
                <div className="weibo-viral-stats">
                  <span>转发 <strong>{stats.reposts}</strong></span>
                  <span>评论 <strong>{stats.comments}</strong></span>
                  <span>赞 <strong>{stats.likes}</strong></span>
                </div>
              )}
              <div className="social-actions weibo-actions">
                <button aria-label={`转发${i.title}`} onClick={() => setOpenComments(openComments === i.id ? null : i.id)}><Share2 size={17} />{stats?.reposts || "转发"}</button>
                <button aria-label={`评论${i.title}`} onClick={() => setOpenComments(openComments === i.id ? null : i.id)}><MessageCircle size={17} />{count}</button>
                <button aria-label={`喜欢${i.title}`} onClick={() => setOpenComments(openComments === i.id ? null : i.id)}><ThumbsUp size={17} />{stats?.likes || i.likes || "赞"}</button>
              </div>
              {openComments === i.id && (
                <div className="weibo-comments">
                  <div className="weibo-comment-list">
                    {fanComments.map((comment, index) => (
                      <p key={index}><strong>{["小橘灯不熄","浚浚的星球","今天也要开心","银河邮递员","小陈同学","晚风收藏家","柠檬汽水","追光日记","海盐奶盖","心动补给站"][index]}：</strong>{comment}</p>
                    ))}
                    {thread.map((reply, index) => (
                      <p className={reply.isAuthor ? "weibo-author-reply" : ""} key={`${reply.author}-${index}`}><strong>{reply.author}{reply.isAuthor ? " · 作者回复" : ""}：</strong>{reply.text}</p>
                    ))}
                    {weiboMyPostReplies[i.id] && (
                      <p className="weibo-author-reply"><strong>TF家族-陈奕恒Jonathan · 作者评论：</strong>{weiboMyPostReplies[i.id]}</p>
                    )}
                  </div>
                  <form className="weibo-reply-form" onSubmit={(event) => { event.preventDefault(); submitReply(i); }}>
                    <input value={drafts[i.id] || ""} onChange={(event) => setDrafts((old) => ({ ...old, [i.id]: event.target.value }))} placeholder="说点什么..." aria-label="微博评论" />
                    <button type="submit">评论</button>
                  </form>
                  {quickReplyVisible === i.id && (
                    <button className="weibo-quick-reply" onClick={() => setDrafts((old) => ({ ...old, [i.id]: "谢谢你给我送蛋糕😆😆我也很开心 我也希望和你一起度过每一个生日😁😁" }))}>
                      快捷回复：谢谢你给我送蛋糕😆😆我也很开心 我也希望和你一起度过每一个生日😁😁
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
        <Empty items={list} />
      </div>
    </div>
  );
}
export function XSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "为你推荐");
  return (
    <div className="catalog-skin x-ui">
      <Header p={p} />
      <div className="x-feed-tabs">
        <button
          className={tab === "为你推荐" ? "selected" : ""}
          onClick={() => setTab("为你推荐")}
        >
          为你推荐
        </button>
        <button
          className={tab === "正在关注" ? "selected" : ""}
          onClick={() => setTab("正在关注")}
        >
          正在关注
        </button>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {items
          .filter((i) => tab === "为你推荐" || i.folder === "正在关注")
          .map((i) => (
            <article className="x-post" key={i.id}>
              <Avatar name={i.sender} />
              <div>
                <button className="x-byline" onClick={() => p.onItem(i)}>
                  <strong>{i.sender}</strong>
                  <span>
                    @{meta(i, "handle", i.sender)} · {i.time.slice(5, 10)}
                  </span>
                </button>
                <button className="social-body" onClick={() => p.onItem(i)}>
                  <p>{i.body}</p>
                  {i.media && <Media item={i} />}
                </button>
                <Actions p={p} item={i} />
              </div>
            </article>
          ))}
      </div>
      <Tabs
        tabs={["为你推荐", "正在关注"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />]}
      />
    </div>
  );
}
export function ThreadsSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "为你推荐");
  return (
    <div className="catalog-skin threads-ui">
      <Header p={p} />
      <div className="threads-title">
        <AtSign size={30} />
        <button
          onClick={() => setTab(tab === "为你推荐" ? "正在关注" : "为你推荐")}
        >
          {tab} ⌄
        </button>
      </div>
      <div className="catalog-scroll">
        {(tab === "个人主页"
          ? items
          : items.filter((i) => tab !== "正在关注" || i.folder === "正在关注")
        ).map((i) => (
          <article className="threads-post" key={i.id}>
            <div className="thread-avatar">
              <Avatar name={i.sender} />
              <i />
            </div>
            <div>
              <div className="threads-byline">
                <strong>{i.sender}</strong>
                <small>{i.time.slice(5, 10)}</small>
              </div>
              <button className="social-body" onClick={() => p.onItem(i)}>
                <p>{i.body}</p>
                {i.media && <Media item={i} />}
              </button>
              <Actions p={p} item={i} />
              <button className="thread-replies" onClick={() => p.onItem(i)}>
                {i.comments.length} 条回复
              </button>
            </div>
          </article>
        ))}
        <Empty items={items} />
      </div>
      <Tabs
        tabs={["为你推荐", "正在关注", "个人主页"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function FacebookSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "动态");
  const stories = items.filter((i) => i.folder === "Story");
  return (
    <div className="catalog-skin facebook-ui">
      <Header p={p} />
      <Tabs
        tabs={["动态", "好友", "个人主页"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "动态" ? (
          <>
            <button
              className="fb-compose"
              disabled={!p.creator}
              onClick={p.onAdd}
            >
              <Avatar name={p.owner ?? "我"} />
              分享新动态
            </button>
            <div className="fb-stories">
              {stories.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <Media item={i} />
                  <strong>{i.sender}</strong>
                </button>
              ))}
            </div>
            {items
              .filter((i) => i.folder !== "Story")
              .map((i) => (
                <article className="fb-post" key={i.id}>
                  <PostHeader p={p} item={i} />
                  <button className="social-body" onClick={() => p.onItem(i)}>
                    <p>{i.body}</p>
                    {i.media && <Media item={i} />}
                  </button>
                  <Actions p={p} item={i} />
                </article>
              ))}
          </>
        ) : tab === "好友" ? (
          <div className="fb-friends">
            {[...new Set(items.map((i) => i.sender))].map((s) => (
              <button
                key={s}
                onClick={() => p.onItem(items.find((i) => i.sender === s)!)}
              >
                <Avatar name={s} />
                <strong>{s}</strong>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="fb-cover" />
            <div className="fb-profile">
              <Avatar name={p.owner ?? "我"} />
              <h1>{p.owner ?? "我"}</h1>
            </div>
            {items
              .filter((i) => i.folder === "个人主页")
              .map((i) => (
                <button
                  key={i.id}
                  className="fb-profile-note"
                  onClick={() => p.onItem(i)}
                >
                  {i.title}
                  <p>{i.body}</p>
                </button>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
export function RedbookSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const list =
    tab === "收藏"
      ? items.filter((i) => i.favorite)
      : tab === "关注"
        ? items.filter((i) => i.folder === "关注")
        : items;
  return (
    <div className="catalog-skin redbook-ui">
      <Header p={p} />
      <div className="redbook-top">
        {["关注", "发现", "收藏"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        <div className="redbook-masonry">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <Media item={i} />
              <strong>{i.title}</strong>
              <div>
                <Avatar name={i.sender} />
                <small>{i.sender}</small>
                <Heart size={12} />
                <small>{i.likes}</small>
              </div>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["发现", "收藏"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Bookmark />]}
      />
    </div>
  );
}
export function PinterestSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [board, setBoard] = useState("");
  const list = board
    ? items.filter((i) => (i.folder || "未分类") === board)
    : items;
  return (
    <div className="catalog-skin pinterest-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        {tab === "收藏板" && !board ? (
          <>
            <h1>收藏板</h1>
            <div className="pinterest-boards">
              {groupItems(items).map((g) => (
                <button key={g} onClick={() => setBoard(g)}>
                  <Media
                    item={items.find((i) => (i.folder || "未分类") === g)!}
                  />
                  <strong>{g}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            {board && (
              <button
                className="pinterest-board-title"
                onClick={() => setBoard("")}
              >
                {board} · 返回收藏板
              </button>
            )}
            <div className="pinterest-pins">
              {list.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <Media item={i} />
                  <strong>{i.title}</strong>
                </button>
              ))}
            </div>
            <Empty items={list} />
          </>
        )}
      </div>
      <Tabs
        tabs={["发现", "收藏板"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setBoard("");
        }}
        icons={[<Home />, <Grid />]}
      />
    </div>
  );
}
export function RedditSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [sort, setSort] = useState("最新");
  const list = [...items].sort((a, b) =>
    sort === "热门" ? b.likes - a.likes : b.time.localeCompare(a.time),
  );
  return (
    <div className="catalog-skin reddit-ui">
      <Header p={p} />
      <div className="reddit-community">
        <Hash size={21} />
        <button onClick={() => setTab(tab === "首页" ? "社区" : "首页")}>
          {tab} ⌄
        </button>
        <select
          aria-label="帖子排序"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>最新</option>
          <option>热门</option>
        </select>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "社区"
          ? groupItems(items).map((g) => (
              <button
                className="reddit-sub"
                key={g}
                onClick={() => {
                  setQ(g === "未分类" ? "" : g);
                  setTab("首页");
                }}
              >
                <Hash size={22} />
                {g}
                <small>
                  {items.filter((i) => (i.folder || "未分类") === g).length} 帖
                </small>
              </button>
            ))
          : list.map((i) => <RedditPost key={i.id} p={p} item={i} />)}
        <Empty items={items} />
      </div>
      <Tabs
        tabs={["首页", "社区"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />]}
      />
    </div>
  );
}
function RedditPost({ p, item: i }: { p: Props; item: Item }) {
  const [vote, setVote] = useSkinState<number>(p, `vote-${i.id}`, 0);
  return (
    <article className="reddit-post">
      <button className="reddit-byline" onClick={() => p.onItem(i)}>
        r/{meta(i, "community", i.folder || "story")} · u/{i.sender}
      </button>
      <button className="social-body" onClick={() => p.onItem(i)}>
        <h3>{i.title}</h3>
        <p>{i.body}</p>
        {i.media && <Media item={i} />}
      </button>
      <div className="reddit-actions">
        <button
          aria-label={`赞同${i.title}`}
          onClick={() => setVote(vote === 1 ? 0 : 1)}
        >
          <ArrowUp size={17} />
        </button>
        <span>{Number(meta(i, "votes", String(i.likes))) + vote}</span>
        <button
          aria-label={`反对${i.title}`}
          onClick={() => setVote(vote === -1 ? 0 : -1)}
        >
          <ArrowDown size={17} />
        </button>
        <button onClick={() => p.onItem(i)}>
          <MessageCircle size={16} />
          {i.comments.length} 评论
        </button>
      </div>
    </article>
  );
}
export function ForumSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "帖子");
  const [board, setBoard] = useState("");
  const list = board
    ? items.filter((i) => (i.folder || "未分类") === board)
    : items;
  return (
    <div className="catalog-skin forum-ui">
      <Header p={p} />
      <div className="forum-banner">
        <Hash size={27} />
        <strong>{board || "论坛"}</strong>
        <span>{items.length} 个主题</span>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "版块"
          ? groupItems(items).map((g) => (
              <button
                className="forum-board"
                key={g}
                onClick={() => {
                  setBoard(g);
                  setTab("帖子");
                }}
              >
                <FolderIcon />
                <div>
                  <strong>{g}</strong>
                  <small>
                    {items.filter((i) => (i.folder || "未分类") === g).length}{" "}
                    个主题
                  </small>
                </div>
                <ChevronRight size={16} />
              </button>
            ))
          : list.map((i) => (
              <button
                className="forum-topic"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <strong>
                  {meta(i, "status") && <em>{meta(i, "status")}</em>}
                  {i.title}
                </strong>
                <p>{i.body.split("\n")[0]}</p>
                <div>
                  <span>
                    {i.sender} · {i.time.slice(5, 16)}
                  </span>
                  <span>
                    {meta(i, "views", "—")} 浏览 · {i.comments.length} 回复
                  </span>
                </div>
              </button>
            ))}
      </div>
      <Tabs
        tabs={["帖子", "版块"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setBoard("");
        }}
        icons={[<MessageCircle />, <Grid />]}
      />
    </div>
  );
}
function FolderIcon() {
  return <Hash size={27} />;
}
export function SnapchatSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "快拍");
  const [index, setIndex] = useState(0);
  const list = items.filter((i) =>
    tab === "回忆"
      ? i.favorite || i.folder === "回忆"
      : tab === "聊天"
        ? i.folder === "聊天"
        : i.folder !== "聊天",
  );
  const i = list[index % Math.max(list.length, 1)];
  return (
    <div className="catalog-skin snapchat-ui">
      <Header p={p} />
      <div className="snap-content">
        {tab === "聊天" ? (
          <div className="snap-chats">
            {list.map((x) => (
              <button key={x.id} onClick={() => p.onItem(x)}>
                <Avatar name={x.sender} />
                <div>
                  <strong>{x.sender}</strong>
                  <small>{x.body}</small>
                </div>
                <Camera size={20} />
              </button>
            ))}
          </div>
        ) : i ? (
          <>
            <Media item={i} />
            <button className="snap-author" onClick={() => p.onItem(i)}>
              <Avatar name={i.sender} />
              {i.sender}
            </button>
            <button
              className="snap-next"
              aria-label="下一条快拍"
              onClick={() => {
                setIndex((n) => n + 1);
                p.onRead(i.id);
              }}
            >
              <ChevronRight size={25} />
            </button>
            <button className="snap-caption" onClick={() => p.onItem(i)}>
              {i.body}
            </button>
          </>
        ) : (
          <p className="catalog-empty">暂无{tab}</p>
        )}
      </div>
      <Tabs
        tabs={["聊天", "快拍", "回忆"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setIndex(0);
        }}
        icons={[<MessageCircle />, <Camera />, <ImageIcon />]}
      />
    </div>
  );
}
function ImageIcon() {
  return <Grid />;
}
