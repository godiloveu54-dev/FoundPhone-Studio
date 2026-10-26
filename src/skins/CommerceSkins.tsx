import {
  Home,
  MapPin,
  Receipt,
  ShoppingBag,
  Star,
  Ticket,
  Truck,
  Utensils,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useSkinState } from "../skinState";
import type { Item } from "../schema";
import {
  Empty,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
export function AlipaySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "账单");
  const [transactions] = useSkinState<string[]>(p, "simulatedTransactions", []);
  const transactionItems = transactions.map((raw) => {
    try { return JSON.parse(raw) as Item; } catch { return null; }
  }).filter((x): x is Item => !!x);
  const displayItems = tab === "账单" ? [...transactionItems, ...items] : items;
  const list =
    tab === "卡包"
      ? items.filter((i) => i.folder === "卡包" || i.folder === "票券")
      : displayItems.filter((i) => !["卡包", "票券"].includes(i.folder));
  return (
    <div className="catalog-skin alipay-ui">
      <Header p={p} />
      <div className="alipay-blue">
        <h2>{tab}</h2>
        <div>
          <button onClick={() => setTab("账单")}>
            <Receipt size={28} />
            账单
          </button>
          <button onClick={() => setTab("卡包")}>
            <Ticket size={28} />
            卡包
          </button>
        </div>
        <small>作品内的虚构支付记录</small>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {list.map((i) =>
          tab === "卡包" ? (
            <button
              className="alipay-ticket"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Ticket size={23} />
              <div>
                <strong>{i.title}</strong>
                <p>{i.body}</p>
                <small>{i.time}</small>
              </div>
            </button>
          ) : (
            <button
              className="alipay-bill"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Wallet size={27} />
              <div>
                <strong>{i.title}</strong>
                <small>
                  {meta(i, "merchant", i.sender)} · {i.time.slice(5, 16)}
                </small>
              </div>
              <span>
                <strong>{meta(i, "amount", "—")}</strong>
                <small>{meta(i, "status", "账单记录")}</small>
              </span>
            </button>
          ),
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["账单", "卡包"]}
        value={tab}
        set={setTab}
        icons={[<Receipt />, <Ticket />]}
      />
    </div>
  );
}
export function TaobaoSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商品");
  const [status, setStatus] = useState("全部");
  const [visibleProducts, setVisibleProducts] = useState(30);
  const [cart, setCart] = useSkinState<string[]>(p, "taobaoCart", []);
  const [orders, setOrders] = useSkinState<string[]>(p, "taobaoOrders", []);
  const [selected, setSelected] = useState<Item | null>(null);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [checkout, setCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("招商银行储蓄卡 · 尾号 6688");
  const [, setTransactions] = useSkinState<string[]>(p, "simulatedTransactions", []);
  const [familyCardPopup, setFamilyCardPopup] = useState<{ sender: string; text: string; kind: "food" | "plain" } | null>(null);
  const orderItems = orders.flatMap((raw) => {
    try { return [JSON.parse(raw) as Item]; } catch { return []; }
  });
  const paymentMethods = [
    "招商银行储蓄卡 · 尾号 6688",
    "张桂源的副卡",
    "爸爸的副卡",
    "妈妈的副卡",
    "哥哥的副卡",
    "陈奕恒的亲情卡",
    "张桂源的亲情卡",
    "亲密付 · 陈奕恒",
    "亲密付 · 张桂源",
    "亲密付 · 杨博文",
  ];
  const list = [...items, ...orderItems]
    .filter((i) =>
      tab === "商品"
        ? i.folder !== "订单" && i.folder !== "物流" && i.kind === "product"
        : tab === "购物车"
          ? false
          : i.folder === tab,
    )
    .filter((i) => status === "全部" || meta(i, "status") === status);
  const readCart = () => cart.map((raw) => {
    try { return JSON.parse(raw) as { cartId: string; productId: string; title: string; brand: string; price: number; color: string; size: string; quantity: number }; }
    catch { return null; }
  }).filter((x): x is NonNullable<typeof x> => !!x);
  const cartItems = readCart();
  const optionsFor = (item: Item) => {
    const category = meta(item, "category", item.folder);
    const title = item.title.toLowerCase();
    let colors: string[] = [];
    let sizes: string[] = [];
    if (category === "服饰" || /卫衣|风衣|羽绒|夹克|大衣|外套|针织|棉服|派克|冲锋衣|瑜伽裤|棒球帽|帽子/.test(item.title)) {
      colors = /格纹|老花|熊猫|白黑|纯白|黑白|黑水鬼|蓝盘|绿水鬼/.test(item.title)
        ? ["经典配色", "黑色", "米白色"]
        : ["黑色", "白色", "灰色", "米色", "藏青色"];
      sizes = /帽|围巾/.test(item.title) ? ["均码"] : ["XS", "S", "M", "L", "XL", "XXL"];
    } else if (category === "鞋履") {
      colors = /白绿/.test(item.title) ? ["白绿"] : /白黑|熊猫|纯白|小白鞋/.test(item.title) ? ["白黑", "纯白"] : ["黑色", "白色", "灰色", "棕色"];
      sizes = /男|训练|篮球|足球|Jordan|Dunk|Samba|Yeezy|Ultraboost|Predator|Harden|Triple S|Trainer|990|2002R|Cloud/.test(item.title)
        ? ["39", "40", "41", "42", "43", "44", "45", "46"]
        : ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
    } else if (category === "箱包") {
      colors = /老花|monogram|格纹|编织|酒神|法棍/.test(title) ? ["经典老花/经典款", "黑色", "棕色", "米白色"] : ["黑色", "棕色", "奶油白", "酒红色", "粉色"];
    } else if (category === "珠宝" && /戒指|ring|指环/.test(title)) {
      colors = /18k金|金/.test(title) ? ["黄金色", "玫瑰金", "白金色"] : ["银色", "金色"];
      sizes = ["10号", "12号", "14号", "16号", "18号", "20号"];
    } else if (category === "珠宝" && /手镯|手链|手环/.test(title)) {
      colors = /18k金|金/.test(title) ? ["黄金色", "玫瑰金", "白金色"] : ["银色", "金色"];
      sizes = ["S（约15cm）", "M（约16.5cm）", "L（约18cm）"];
    } else if (category === "珠宝") {
      colors = /珍珠/.test(title) ? ["白色珍珠"] : ["黄金色", "玫瑰金", "白金色"];
      if (/耳环|耳钉/.test(title)) sizes = ["均码"];
    } else if (category === "腕表") {
      colors = /蓝盘/.test(title) ? ["蓝盘", "黑盘"] : /绿水鬼/.test(title) ? ["绿色表盘"] : ["原款配色", "黑色", "银色"];
      sizes = /41mm|42mm|44mm|40mm/.test(item.title) ? [item.title.match(/\d{2}mm/)?.[0] ?? "标准尺寸"] : ["标准尺寸"];
    } else if (category === "美妆") {
      if (/口红|唇膏|黑管/.test(item.title)) colors = ["正红色", "豆沙色", "玫瑰色", "裸棕色"];
      else if (/眼影/.test(item.title)) colors = ["暖棕盘", "玫瑰盘", "大地色盘"];
      else if (/香水|香氛/.test(item.title)) sizes = ["原规格"];
      else sizes = ["原规格"];
    } else if (category === "数码" || category === "家电") {
      if (/iphone|ipad|macbook|watch|手机|平板|电脑/.test(title)) colors = ["黑色/深空色", "银色", "白色", "星光色"];
      else if (/耳机|airpods/.test(title)) colors = ["白色"];
      else if (/vision pro/.test(title)) colors = ["银色"];
      else colors = ["原款配色"];
    } else if (category === "潮玩") {
      colors = /盲盒/.test(item.title) ? ["随机款"] : ["按商品图款式"];
      if (/整盒/.test(item.title)) sizes = ["整盒（款式不重复，按系列配置）"];
    } else if (category === "配饰") {
      colors = /围巾|帽|腰带/.test(item.title) ? ["经典款", "黑色", "米色"] : ["金色", "银色", "黑色"];
      if (/围巾|帽/.test(item.title)) sizes = ["均码"];
    } else if (category === "运动") {
      colors = ["黑色", "白色", "蓝色"];
      sizes = /瑜伽垫/.test(item.title) ? ["标准尺寸"] : ["均码"];
    }
    return { colors: [...new Set(colors)], sizes: [...new Set(sizes)] };
  };
  const openProduct = (item: Item) => {
    const options = optionsFor(item);
    setSelected(item);
    setColor(options.colors[0] ?? "");
    setSize(options.sizes[0] ?? "");
    setQuantity(1);
  };
  const addToCart = () => {
    if (!selected) return;
    const entry = {
      cartId: `${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: selected.id,
      title: selected.title,
      brand: selected.sender,
      price: Number(meta(selected, "price", "0")),
      color,
      size,
      quantity,
    };
    setCart((current) => [...current, JSON.stringify(entry)]);
    setSelected(null);
    setTab("购物车");
  };
  const removeCartItem = (cartId: string) => setCart((current) => current.filter((raw) => {
    try { return JSON.parse(raw).cartId !== cartId; } catch { return true; }
  }));
  const changeCartQuantity = (cartId: string, next: number) => setCart((current) => current.map((raw) => {
    try {
      const entry = JSON.parse(raw);
      return entry.cartId === cartId ? JSON.stringify({ ...entry, quantity: next }) : raw;
    } catch { return raw; }
  }).filter((raw) => {
    try { return JSON.parse(raw).quantity > 0; } catch { return true; }
  }));
  return (
    <div className="catalog-skin taobao-ui">
      <Header p={p} />
      <div className="taobao-search">
        <SearchBox value={q} set={setQ} placeholder="搜索商品或订单" />
      </div>
      <div className="catalog-scroll">
        {tab === "商品" ? (
          <div className="taobao-products">
            {list.slice(0, visibleProducts).map((i) => (
              <button key={i.id} onClick={() => openProduct(i)}>
                <Media item={i} />
                <strong>{i.title}</strong>
                <p>¥ <b>{meta(i, "price", "—")}</b></p>
                <small>{i.sender} · {meta(i, "rating", "—")}分</small>
                <small>销量 {meta(i, "sales", "0")}</small>
              </button>
            ))}
            {list.length > visibleProducts && (
              <button className="taobao-load-more" onClick={() => setVisibleProducts((count) => count + 30)}>
                加载更多商品（还剩 {list.length - visibleProducts} 件）
              </button>
            )}
          </div>
        ) : tab === "购物车" ? (
          <div className="taobao-cart">
            <h2>购物车（{cartItems.reduce((sum, x) => sum + x.quantity, 0)}）</h2>
            {cartItems.map((entry) => (
              <section className="taobao-cart-row" key={entry.cartId}>
                <div>
                  <strong>{entry.title}</strong>
                  <small>{entry.brand}</small>
                  <small>{[entry.color, entry.size].filter(Boolean).join(" · ") || "标准款"}</small>
                  <b>¥ {entry.price.toLocaleString("zh-CN")}</b>
                </div>
                <div className="taobao-cart-controls">
                  <button aria-label="减少数量" onClick={() => changeCartQuantity(entry.cartId, entry.quantity - 1)}>−</button>
                  <span>{entry.quantity}</span>
                  <button aria-label="增加数量" onClick={() => changeCartQuantity(entry.cartId, entry.quantity + 1)}>+</button>
                  <button aria-label="删除商品" onClick={() => removeCartItem(entry.cartId)}>删除</button>
                </div>
              </section>
            ))}
            {!cartItems.length && <p className="catalog-empty">购物车还是空的，去挑选喜欢的商品吧</p>}
            {!!cartItems.length && <>
              <footer className="taobao-cart-total">合计：¥ {cartItems.reduce((sum, x) => sum + x.price * x.quantity, 0).toLocaleString("zh-CN")}</footer>
              <button className="taobao-add-cart" onClick={() => setCheckout(true)}>结算 · 选择付款方式</button>
            </>}
          </div>
        ) : (
          <>
            <div className="taobao-status">
              {["全部", "待付款", "待发货", "待收货", "已完成"].map((s) => (
                <button className={s === status ? "selected" : ""} key={s} onClick={() => setStatus(s)}>{s}</button>
              ))}
            </div>
            {list.map((i) => (
              <button className="taobao-order" key={i.id} onClick={() => p.onItem(i)}>
                <div><ShoppingBag size={16} /><strong>{i.sender}</strong><small>{meta(i, "status", "订单记录")}</small></div>
                <section><Media item={i} /><span><strong>{i.title}</strong><p>{tab === "物流" ? meta(i, "tracking", i.body) : i.body}</p><b>¥ {meta(i, "price", "—")}</b></span></section>
                <footer>{meta(i, "number", i.time)}</footer>
              </button>
            ))}
          </>
        )}
        <Empty items={tab === "商品" ? list : tab === "购物车" ? cartItems as unknown as Item[] : list} />
      </div>
      <Tabs
        tabs={["商品", "购物车", "订单", "物流"]}
        value={tab}
        set={(t) => { setTab(t); setStatus("全部"); }}
        icons={[<Home />, <ShoppingBag />, <ShoppingBag />, <Truck />]}
      />
      {checkout && (
        <div className="taobao-product-backdrop" role="presentation" onClick={() => setCheckout(false)}>
          <section className="taobao-product-sheet" role="dialog" aria-modal="true" aria-label="确认付款" onClick={(e) => e.stopPropagation()}>
            <button className="taobao-sheet-close" onClick={() => setCheckout(false)} aria-label="关闭">×</button>
            <h2>确认订单</h2>
            <p>{cartItems.map((x) => `${x.title} × ${x.quantity}`).join("、")}</p>
            <strong className="taobao-product-price">合计 ¥ {cartItems.reduce((sum, x) => sum + x.price * x.quantity, 0).toLocaleString("zh-CN")}</strong>
            <h3>选择付款方式</h3>
            <div className="taobao-option-group"><div>{paymentMethods.map((method) => <button className={paymentMethod === method ? "selected" : ""} key={method} onClick={() => setPaymentMethod(method)}>{method}</button>)}</div></div>
            <button className="taobao-add-cart" onClick={() => {
              const total = cartItems.reduce((sum, x) => sum + x.price * x.quantity, 0);
              const now = new Date();
              const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
              const orderId = `TB${Date.now()}`;
              const order = { id: `taobao-order-${Date.now()}`, title: cartItems.length === 1 ? cartItems[0].title : `淘宝购物（${cartItems.length}件商品）`, body: cartItems.map((x) => `${x.title} × ${x.quantity}`).join("\\n"), sender: "淘宝", kind: "text", time, folder: "订单", meta: { merchant: "淘宝", amount: `-¥${total.toFixed(2)}`, price: total.toFixed(2), status: "待发货", number: orderId, paymentMethod, transactionType: "购物订单", total } };
              const record = { ...order, id: `simulated-payment-${Date.now()}`, folder: "账单", meta: { merchant: "淘宝", amount: `-¥${total.toFixed(2)}`, status: "支付成功（模拟）", paymentMethod, transactionType: "购物支出", total } };
              setOrders((current) => [JSON.stringify(order), ...current]);
              setTransactions((current) => [JSON.stringify(record), ...current]);
              setCart([]);
              setCheckout(false);
              setTab("订单");
            }}>确认付款（模拟）</button>
            <small>仅记录模拟交易，不会真实扣款。</small>
          </section>
        </div>
      )}
      {selected && (() => {
        const options = optionsFor(selected);
        return (
          <div className="taobao-product-backdrop" role="presentation" onClick={() => setSelected(null)}>
            <section className="taobao-product-sheet" role="dialog" aria-modal="true" aria-label={selected.title} onClick={(e) => e.stopPropagation()}>
              <button className="taobao-sheet-close" onClick={() => setSelected(null)} aria-label="关闭">×</button>
              <Media item={selected} className="taobao-product-image" />
              <small>{selected.sender}</small>
              <h2>{selected.title}</h2>
              <strong className="taobao-product-price">¥ {Number(meta(selected, "price", "0")).toLocaleString("zh-CN")}</strong>
              <p className="taobao-product-stats">评分 {meta(selected, "rating", "—")} · 已售 {meta(selected, "sales", "0")} · 库存 {meta(selected, "stock", "—")}</p>
              {!!options.colors.length && <div className="taobao-option-group"><strong>颜色 / 款式</strong><div>{options.colors.map((v) => <button className={color === v ? "selected" : ""} key={v} onClick={() => setColor(v)}>{v}</button>)}</div></div>}
              {!!options.sizes.length && <div className="taobao-option-group"><strong>尺码 / 规格</strong><div>{options.sizes.map((v) => <button className={size === v ? "selected" : ""} key={v} onClick={() => setSize(v)}>{v}</button>)}</div></div>}
              <div className="taobao-quantity"><strong>数量</strong><div><button onClick={() => setQuantity((n) => Math.max(1, n - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity((n) => Math.min(Number(meta(selected, "stock", "999")) || 999, n + 1))}>+</button></div></div>
              <button className="taobao-add-cart" onClick={addToCart}>加入购物车</button>
            </section>
          </div>
        );
      })()}
      {familyCardPopup && (
        <div className="taobao-product-backdrop" role="presentation" onClick={() => setFamilyCardPopup(null)}>
          <section className="taobao-product-sheet" role="dialog" aria-modal="true" aria-label="亲情卡消息" onClick={(e) => e.stopPropagation()}>
            <h2>微信 · {familyCardPopup.sender}</h2>
            <p style={{ lineHeight: 1.7, margin: "16px 0" }}>{familyCardPopup.text}</p>
            {familyCardPopup.kind === "food" && (
              <div className="taobao-option-group"><div>
                <button onClick={() => { const text = p.onFamilyCardReply?.("听"); setFamilyCardPopup({ sender: "陈奕恒", text: text || "好！", kind: "plain" }); }}>听</button>
                <button onClick={() => { const text = p.onFamilyCardReply?.("不听"); setFamilyCardPopup({ sender: "陈奕恒", text: text || "你好坏啊", kind: "plain" }); }}>不听</button>
              </div></div>
            )}
            <button className="taobao-add-cart" onClick={() => setFamilyCardPopup(null)}>知道了</button>
          </section>
        </div>
      )}
    </div>
  );
}
const deliveryMenuRows = "西式快餐|肯德基 KFC|吮指原味鸡（块）:12.5;香辣鸡腿堡:20;黄金脆皮鸡（块）:15;劲爆鸡米花:13;薯条大份:12;葡式蛋挞（个）:8;老北京鸡肉卷:17;九珍果汁:12\n西式快餐|麦当劳 McDonald's|巨无霸:24;麦辣鸡腿堡:22;板烧鸡腿堡:21;麦乐鸡10块:14;薯条大份:12;麦旋风奥利奥:15;双层吉士汉堡:18;那么大鸡排:16\n西式快餐|汉堡王 Burger King|皇堡:26;双层芝士牛堡:22;霸王鸡腿皇堡:25;王道嫩香鸡块:13;大份洋葱圈:15;粗薯条:12;巧克力新地:11\n西式快餐|华莱士|香辣鸡腿堡:12;蜜汁手扒鸡（只）:28;全鸡汉堡:14;劲爆鸡米花:10;薯条:9;可乐:6;香芋派:5\n中餐·火锅冒菜|海底捞·外送火锅|单人嗨捞套餐:88;双人畅吃套餐:168;四人聚餐套餐:328;牛油麻辣锅底:45;番茄锅底:38;三鲜清汤锅底:35;菌菇锅底:38;四宫格锅底:60;捞派滑牛肉:38;捞派毛肚:42;虾滑:45;鸭血:12;宽粉:10;捞面:8;蔬菜拼盘:22;海底捞蘸料（份）:9\n中餐·火锅冒菜|川魂·老街冒菜|单人牛肉冒菜套餐:32;单人全家福冒菜:38;双人畅享冒菜:68;冒毛肚:18;冒午餐肉:12;冒鹌鹑蛋:8;冒千层肚:20;冒鸭血:8;冒宽粉:6;米饭:2;唯怡豆奶:10;冰镇酸梅汤:6\n中餐·川湘菜|蜀香极品·地道川菜|招牌水煮鱼片:58;重庆毛血旺:48;干煸四季豆:26;鱼香肉丝:32;麻婆豆腐:22;歌乐山辣子鸡:45;红糖糍粑:18;唯怡豆奶:15\n中餐·广式茶点|广式茶点·陶陶居|水晶虾饺皇:28;秘制叉烧包:18;豉汁蒸凤爪:22;干炒牛河:32;鲜虾红米肠:30;腊味煲仔饭:38;陈皮红豆沙:15;冻柠茶:16\n中餐·面食小吃|西北风味·老陕面馆|油泼扯面:26;肉夹馍:15;羊肉泡馍:38;凉皮:16;臊子面:22;烤羊肉串（串）:6;冰峰汽水:5\n中餐·北京风味|北京烤鸭·胡同里|果木烤鸭半套:98;京酱肉丝:36;老北京炸酱面:28;鸭架汤:18;爆肚:42;乾隆白菜:22;驴打滚:18;北冰洋:6\n中餐·川湘菜|湘江水·地道湖南菜|剁椒鱼头:68;农家小炒肉:38;辣椒炒肉盖码饭:28;臭豆腐:16;干锅肥肠:48;擂椒皮蛋:22\n日料|鮨·匠心江户前寿司|蓝鳍金枪鱼大腹（贯）:45;海鲜刺身拼盘:128;蒲烧鳗鱼饭:68;日式茶碗蒸:15;火炙三文鱼芝士卷:38;日式冷豆腐:15;可尔必思:12\n韩料|首尔炸鸡&部队火锅|蜂蜜黄油无骨炸鸡:62;芝士年糕部队锅:88;韩式手抓紫菜饭团:22;韩式大酱汤:25;甜辣炸鸡:58;石锅拌饭:32;韩式泡菜饼:28\n西餐正餐·汉堡|纽约客·厚切和牛汉堡|双层车打芝士和牛堡:58;经典培根牛肉堡:48;美式粗薯条:18;奥尔良炸鸡翅:25;夏威夷菠萝鸡腿堡:38;洋葱圈:15;手工柠檬红茶:15\n西餐正餐·披萨意面|罗马假日·窑烤披萨|玛格丽特披萨9寸:68;帕尔马火腿芝麻菜披萨:89;黑松露蘑菇披萨:98;奶油培根意面:52;经典肉酱意面:48;凯撒沙拉:35;意式提拉米苏:28\n西餐正餐·烟熏烤肉|德州烟熏烤肉|慢烤牛胸肉（半磅）:88;烟熏猪肋排:68;手撕猪肉汉堡:42;卷心菜沙拉:18;烤香肠拼盘:45;炸酸黄瓜:15;精酿啤酒:28\n东南亚菜·泰餐|泰浪漫·冬阴功海鲜局|招牌冬阴功海鲜汤:68;泰式菠萝海鲜炒饭:45;香茅烤鸡半只:42;泰式手打柠檬茶:18;泰式咖喱鸡:48;月亮虾饼:32;青木瓜沙拉:28\n东南亚菜·越南菜|西贡小馆·Pho|招牌生牛肉河粉:38;越式香茅烤猪排饭:42;现炸越南春卷:22;越南滴漏咖啡:25;越式法棍三明治:28;鲜虾米纸卷:26\n南亚菜·印度菜|恒河之香·正宗印度咖喱|黄油鸡肉咖喱:58;印度羊肉咖喱:68;蒜香烤饼:15;香料烤鸡块:45;鹰嘴豆玛莎拉:38;印度长粒香米:10;印度拉茶:18\n轻食·波奇饭|加州轻食·波奇饭|三文鱼牛油果波奇饭:52;黑椒牛肉粒波奇饭:48;凯撒鸡胸肉沙拉:38;羽衣甘蓝苹果汁:22;照烧鸡腿肉波奇饭:38;考伯沙拉:42;无糖冷萃美式:18\n轻食·沙拉|绿野仙踪·沙拉工坊|牛油果考伯沙拉:42;藜麦鸡胸肉能量碗:38;全麦鸡肉卷饼:28;无糖冷萃美式:18;烟熏三文鱼沙拉:48;奇异果青提汁:22\n奶茶·原叶鲜奶茶|霸王茶姬·原叶鲜奶茶|伯牙绝弦:18;花田乌龙:16;桂馥兰香:18;白雾红尘:20;青青糯山:18;寻香山茶:17\n奶茶·鲜果茶|喜茶·灵感之茶|多肉葡萄:22;芝芝莓莓:21;烤黑糖波波牛乳:19;满杯红柚:18;多肉青提:24;纯绿妍茶后:9\n奶茶·鲜果茶|奈雪的茶·鲜果茶|霸气橙子:19;霸气芝士草莓:25;鸭屎香宝藏茶:18;金色山脉宝藏茶:22;霸气葡萄:24;霸气杨梅:26\n奶茶·平价奶茶|蜜雪冰城·高性价比|冰鲜柠檬水:4;摇摇奶昔草莓味:6;珍珠奶茶:7;摩天脆脆冰淇淋:3;棒打鲜橙:6;满杯百香果:7\n奶茶·鲜果茶|茶百道·杨枝甘露|杨枝甘露:18;豆乳玉麒麟:16;西瓜啵啵:15;桂花酒酿奶茶:16;茉莉奶绿:12;芋圆奶茶:14\n奶茶·鲜果茶|古茗·鲜果茶饮|超A芝士葡萄:19;大叔奶茶:12;杨枝甘露椰奶:18;龙井香青团:16;清补凉椰椰:15\n奶茶·经典奶茶|CoCo都可·经典奶茶|珍珠奶茶:13;百香双响炮:15;鲜芋青稞牛奶:18;红果小姐姐:16;茉香奶绿:11\n奶茶·国风奶茶|茶颜悦色·国风奶茶|幽兰拿铁:18;声声乌龙:16;筝筝纸鸢:17;桂花弄:16;三季虫:18;少年时:17\n蛋糕甜品·蛋糕|治愈系·动物奶油蛋糕|草莓红丝绒切块:32;巴斯克焦烤芝士:28;北海道牛乳卷:22;抹茶柚子千层:36;焦糖海盐切块:30;纯脂黑巧千层:35\n蛋糕甜品·法式烘焙|巴黎左岸·法式烘焙|经典提拉米苏:28;原味法式可颂:18;杏仁巧克力可颂:22;法式柠檬塔:26;树莓开心果慕斯:38;可露丽（2个）:15\n蛋糕甜品·芝士甜品|好利来·半熟芝士|原味半熟芝士（一盒）:32;奥利奥半熟芝士（一盒）:35;冰山熔岩巧克力:28;蜂蜜蛋糕:20;芋泥雪贝:26;抹茶半熟芝士（一盒）:35\n蛋糕甜品·港式糖水|满记甜品·港式糖水|芒果班戟:25;杨枝甘露:28;榴莲忘返:38;芝麻糊:18;椰汁西米露:20;糖不甩:16\n蛋糕甜品·中式糕点|稻香村·中式糕点|山楂锅盔（个）:8;牛舌饼（个）:7;枣花酥（个）:9;拿破仑蛋糕（块）:15;绿豆潮糕（一盒）:12;抹茶酥（个）:8\n蛋糕甜品·提拉米苏|提拉米苏专门店|经典意式提拉米苏:26;草莓提拉米苏:32;开心果提拉米苏:36;提拉米苏大福（2个）:18;抹茶提拉米苏:32".split("\n").map((line, index) => {
  const [category, name, menu] = line.split("|");
  return {
    id: `delivery-shop-${index + 1}`,
    category,
    name,
    rating: (4.6 + ((index * 7) % 4) / 10).toFixed(1),
    duration: `${22 + (index * 5) % 28}-${35 + (index * 7) % 25}分钟`,
    menu: menu.split(";").map((entry, itemIndex) => {
      const splitAt = entry.lastIndexOf(":");
      return { id: `${index + 1}-${itemIndex + 1}`, name: entry.slice(0, splitAt), price: Number(entry.slice(splitAt + 1)) };
    }),
  };
});
export function DeliverySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商家");
  const [category, setCategory] = useState("全部");
  const [selectedMerchant, setSelectedMerchant] = useState<(typeof deliveryMenuRows)[number] | null>(null);
  const [cart, setCart] = useSkinState<string[]>(p, "deliveryCart", []);
  const [paymentMethod, setPaymentMethod] = useState("招商银行储蓄卡 · 尾号 6688");
  const [, setTransactions] = useSkinState<string[]>(p, "simulatedTransactions", []);
  const [deliveryOrders, setDeliveryOrders] = useSkinState<string[]>(p, "deliveryOrders", []);
  const paymentMethods = [
    "招商银行储蓄卡 · 尾号 6688", "张桂源的副卡", "爸爸的副卡", "妈妈的副卡",
    "哥哥的副卡", "亲密付 · 陈奕恒", "亲密付 · 张桂源", "亲密付 · 杨博文",
  ];
  const parsedDeliveryOrders = deliveryOrders.map((raw) => { try { return JSON.parse(raw) as Item; } catch { return null; } }).filter((x): x is Item => !!x);
  const cartItems = cart.map((raw) => { try { return JSON.parse(raw) as { key: string; shopId: string; shopName: string; name: string; price: number; quantity: number }; } catch { return null; } }).filter((x): x is NonNullable<typeof x> => !!x);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const categories = ["全部", ...Array.from(new Set(deliveryMenuRows.map((shop) => shop.category.split("·")[0]))), ...Array.from(new Set(deliveryMenuRows.map((shop) => shop.category)))];
  const shops = deliveryMenuRows.filter((shop) =>
    (category === "全部" || shop.category.startsWith(category)) &&
    (shop.name.toLowerCase().includes(q.toLowerCase()) || shop.category.includes(q) || shop.menu.some((dish) => dish.name.includes(q)))
  );
  const addDish = (shop: (typeof deliveryMenuRows)[number], dish: (typeof deliveryMenuRows)[number]["menu"][number]) => {
    const key = `${shop.id}-${dish.id}`;
    const existing = cartItems.find((item) => item.key === key);
    if (existing) {
      setCart((current) => current.map((raw) => {
        try { const item = JSON.parse(raw); return item.key === key ? JSON.stringify({ ...item, quantity: item.quantity + 1 }) : raw; } catch { return raw; }
      }));
    } else {
      setCart((current) => [...current, JSON.stringify({ key, shopId: shop.id, shopName: shop.name, name: dish.name, price: dish.price, quantity: 1 })]);
    }
  };
  const changeDishQuantity = (key: string, delta: number) => setCart((current) => current.map((raw) => {
    try { const item = JSON.parse(raw); return item.key === key ? JSON.stringify({ ...item, quantity: item.quantity + delta }) : raw; } catch { return raw; }
  }).filter((raw) => { try { return JSON.parse(raw).quantity > 0; } catch { return true; } }));
  const checkout = () => {
    if (!cartItems.length) return;
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const grouped = Array.from(new Set(cartItems.map((item) => item.shopName)));
    const summary = cartItems.map((item) => `${item.shopName}：${item.name} × ${item.quantity}`).join("\n");
    const record = { id: `simulated-delivery-payment-${Date.now()}`, title: grouped.length === 1 ? grouped[0] : `外卖订单（${grouped.length}家店）`, body: summary, sender: "外卖", kind: "text", time, folder: "账单", meta: { merchant: grouped.join("、"), amount: `-¥${cartTotal.toFixed(2)}`, status: "支付成功（模拟）", paymentMethod, transactionType: "外卖支出", total: cartTotal } };
    const order = { ...record, id: `delivery-order-${Date.now()}`, folder: "订单", meta: { ...record.meta, status: "商家接单（模拟）", price: cartTotal, address: "长江国际十八楼" } };
    setTransactions((current) => [JSON.stringify(record), ...current]);
    setDeliveryOrders((current) => [JSON.stringify(order), ...current]);
    setCart([]);
    setSelectedMerchant(null);
    setTab("订单");
  };
  return (
    <div className="catalog-skin delivery-ui">
      <Header p={p} />
      <div className="delivery-location">
        <MapPin size={18} />
        <div><strong>长江国际十八楼</strong><small>配送地址 · 点击店铺选择菜品</small></div>
      </div>
      <SearchBox value={q} set={setQ} placeholder="搜索店铺、菜品" />
      <div className="delivery-category-strip">
        {categories.map((value) => <button key={value} className={category === value ? "selected" : ""} onClick={() => { setCategory(value); setTab("商家"); }}>{value.replace("·", " / ")}</button>)}
      </div>
      <div className="catalog-scroll">
        {tab === "商家" ? (
          shops.map((shop) => (
            <button className="delivery-merchant" key={shop.id} onClick={() => setSelectedMerchant(shop)}>
              <div className="delivery-shop-art"><Utensils size={25} /><span>{shop.category.split("·")[0]}</span></div>
              <div>
                <h3>{shop.name}</h3>
                <p><Star size={12} /> {shop.rating}<span>{shop.duration}</span></p>
                <small>{shop.menu.slice(0, 3).map((dish) => dish.name).join(" · ")}</small>
                <strong>{shop.menu.length} 道菜 · 人均 ¥{Math.round(shop.menu.reduce((sum, dish) => sum + dish.price, 0) / shop.menu.length)}</strong>
              </div>
            </button>
          ))
        ) : tab === "购物车" ? (
          <div className="delivery-cart">
            <h2>购物车（{cartCount}）</h2>
            <div className="delivery-address-card"><MapPin size={17} /><div><strong>长江国际十八楼</strong><small>送达地址</small></div></div>
            {cartItems.map((item) => (
              <section className="delivery-cart-row" key={item.key}>
                <div><strong>{item.name}</strong><small>{item.shopName}</small><b>¥{item.price.toFixed(2)}</b></div>
                <div className="delivery-quantity"><button onClick={() => changeDishQuantity(item.key, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeDishQuantity(item.key, 1)}>+</button></div>
              </section>
            ))}
            {!cartItems.length && <p className="catalog-empty">购物车还是空的，去店铺挑选喜欢的菜品吧。</p>}
            {!!cartItems.length && <footer className="delivery-cart-footer"><div><small>共 {cartCount} 件</small><strong>合计 ¥{cartTotal.toFixed(2)}</strong></div><button className="taobao-add-cart" onClick={() => setTab("确认订单")}>去结算</button></footer>}
          </div>
        ) : tab === "确认订单" ? (
          <div className="delivery-checkout">
            <h2>确认订单</h2>
            <div className="delivery-address-card"><MapPin size={18}/><div><strong>长江国际十八楼</strong><small>配送地址</small></div></div>
            {cartItems.map((item) => <div className="delivery-checkout-row" key={item.key}><span>{item.shopName} · {item.name} × {item.quantity}</span><b>¥{(item.price * item.quantity).toFixed(2)}</b></div>)}
            <h3>付款方式</h3>
            <div className="taobao-option-group"><div>{paymentMethods.map((method) => <button className={paymentMethod === method ? "selected" : ""} key={method} onClick={() => setPaymentMethod(method)}>{method}</button>)}</div></div>
            <div className="delivery-checkout-total"><span>订单合计</span><strong>¥{cartTotal.toFixed(2)}</strong></div>
            <button className="taobao-add-cart" onClick={checkout}>确认下单并付款（模拟）</button>
            <small>仅记录模拟订单，不会真实扣款。</small>
          </div>
        ) : (
          <div className="delivery-orders">
            {parsedDeliveryOrders.map((order) => (
              <section className="delivery-order" key={order.id}>
                <header><Utensils size={17}/><strong>{order.title}</strong><span>{meta(order, "status", "配送记录")}</span></header>
                <p>{order.body}</p><small>{order.time}</small>
                <footer><MapPin size={13}/>{meta(order, "address", "长江国际十八楼")}<b>¥{meta(order, "price", "—")}</b></footer>
              </section>
            ))}
            {items.filter((item) => item.folder === "订单").map((item) => <button className="delivery-order" key={item.id} onClick={() => p.onItem(item)}><header><Utensils size={17}/><strong>{item.sender}</strong><span>{meta(item,"status","配送记录")}</span></header><p>{item.body}</p></button>)}
            {!parsedDeliveryOrders.length && !items.some((item) => item.folder === "订单") && <p className="catalog-empty">还没有外卖订单。</p>}
          </div>
        )}
      </div>
      <Tabs tabs={["商家", "购物车", "订单"]} value={tab === "确认订单" ? "购物车" : tab} set={(value) => setTab(value)} icons={[<Utensils />, <ShoppingBag />, <Receipt />]} />
      {selectedMerchant && (
        <div className="delivery-menu-backdrop" role="presentation" onClick={() => setSelectedMerchant(null)}>
          <section className="delivery-menu-sheet" role="dialog" aria-modal="true" aria-label={selectedMerchant.name} onClick={(event) => event.stopPropagation()}>
            <button className="delivery-menu-close" onClick={() => setSelectedMerchant(null)} aria-label="关闭">×</button>
            <div className="delivery-menu-header"><div className="delivery-shop-art large"><Utensils size={30}/></div><div><h2>{selectedMerchant.name}</h2><p><Star size={13}/> {selectedMerchant.rating} · {selectedMerchant.duration}</p><small>{selectedMerchant.category}</small></div></div>
            <div className="delivery-menu-list">
              <h3>完整菜单（{selectedMerchant.menu.length} 道）</h3>
              {selectedMerchant.menu.map((dish) => {
                const inCart = cartItems.find((item) => item.key === `${selectedMerchant.id}-${dish.id}`);
                return <div className="delivery-dish-row" key={dish.id}><div><strong>{dish.name}</strong><small>现点现做 · 模拟菜单</small><b>¥{dish.price.toFixed(2)}</b></div><div className="delivery-dish-actions">{inCart && <span>{inCart.quantity}</span>}<button onClick={() => addDish(selectedMerchant, dish)} aria-label={`添加${dish.name}`}>+</button></div></div>;
              })}
            </div>
            <div className="delivery-menu-bottom"><div><small>购物车 {cartCount} 件</small><strong>¥{cartTotal.toFixed(2)}</strong></div><button className="taobao-add-cart" onClick={() => { setSelectedMerchant(null); setTab("购物车"); }}>去购物车</button></div>
          </section>
        </div>
      )}
    </div>
  );
}