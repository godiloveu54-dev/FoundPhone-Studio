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
  const list =
    tab === "卡包"
      ? items.filter((i) => i.folder === "卡包" || i.folder === "票券")
      : items.filter((i) => !["卡包", "票券"].includes(i.folder));
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
  const [cart, setCart] = useSkinState<string[]>(p, "taobaoCart", []);
  const [selected, setSelected] = useState<Item | null>(null);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const products = items.filter((i) => i.kind === "product");
  const list = items
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
    const brand = item.sender.toLowerCase();
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
            {list.map((i) => (
              <button key={i.id} onClick={() => openProduct(i)}>
                <Media item={i} />
                <strong>{i.title}</strong>
                <p>¥ <b>{meta(i, "price", "—")}</b></p>
                <small>{i.sender} · {meta(i, "rating", "—")}分</small>
                <small>销量 {meta(i, "sales", "0")}</small>
              </button>
            ))}
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
            {!!cartItems.length && <footer className="taobao-cart-total">合计：¥ {cartItems.reduce((sum, x) => sum + x.price * x.quantity, 0).toLocaleString("zh-CN")}</footer>}
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
    </div>
  );
}
export function DeliverySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商家");
  const list = items.filter((i) =>
    tab === "订单" ? i.folder === "订单" : i.folder !== "订单",
  );
  return (
    <div className="catalog-skin delivery-ui">
      <Header p={p} />
      <div className="delivery-location">
        <MapPin size={18} />
        <strong>{meta(items[0], "address", "作品配送地址")}</strong>
      </div>
      <SearchBox value={q} set={setQ} placeholder="搜索商家或订单" />
      <div className="catalog-scroll">
        {tab === "商家"
          ? list.map((i) => (
              <button
                className="delivery-merchant"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <Media item={i} />
                <div>
                  <h3>{i.title}</h3>
                  <p>
                    <Star size={12} />
                    {meta(i, "rating", "—")}
                    <span>{meta(i, "duration")}</span>
                  </p>
                  <small>{i.body.split("\n")[0]}</small>
                  <strong>¥ {meta(i, "price", "—")}</strong>
                </div>
              </button>
            ))
          : list.map((i) => (
              <button
                className="delivery-order"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <header>
                  <Utensils size={18} />
                  <strong>{i.sender}</strong>
                  <span>{meta(i, "status", "配送记录")}</span>
                </header>
                <section>
                  <Media item={i} />
                  <div>
                    <strong>{i.title}</strong>
                    <p>{i.body}</p>
                    <small>{i.time}</small>
                  </div>
                  <b>¥ {meta(i, "price", "—")}</b>
                </section>
                <footer>
                  <MapPin size={13} />
                  {meta(i, "address")}
                </footer>
              </button>
            ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["商家", "订单"]}
        value={tab}
        set={setTab}
        icons={[<Utensils />, <Receipt />]}
      />
    </div>
  );
}
