import { z } from "zod";
import {
  workSchema,
  itemSchema,
  nodeSchema,
  validateWork,
  safeMedia,
  type Work,
} from "../schema";
import { registry } from "../registry";
import { validateGraph } from "../engine";
const id = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_.-]*$/, "需要稳定的英文 ID");
const content = itemSchema
  .partial()
  .extend({ id, title: z.string().default(""), body: z.string().default("") })
  .strict();
const event = nodeSchema
  .partial()
  .extend({
    id,
    label: z.string(),
    type: nodeSchema.shape.type.default("event"),
  })
  .strict();
export const storySchema = z
  .object({
    scriptVersion: z.literal(1),
    id,
    title: z.string().min(1),
    description: z.string().default(""),
    revision: z.number().int().positive().default(1),
    phone: workSchema.shape.phone
      .partial()
      .extend({
        owner: z.string(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .default("2026-10-23"),
      })
      .strict(),
    installedApps: z
      .array(z.union([z.string(), workSchema.shape.apps.element]))
      .default([
        "appstore",
        "phone",
        "messages",
        "photos",
        "notes",
        "safari",
        "settings",
      ]),
    contacts: z
      .array(
        z.object({
          id,
          name: z.string(),
          phone: z.string().default(""),
          avatar: z.string().default(""),
          bio: z.string().default(""),
        }),
      )
      .default([]),
    chats: z
      .array(
        z.object({
          id,
          app: z.string().default("messages"),
          title: z.string(),
          participants: z.array(z.string()),
          messages: z.array(
            content.extend({ senderId: z.string().optional() }),
          ),
        }),
      )
      .default([]),
    content: z.record(z.string(), z.array(content)).default({}),
    variables: workSchema.shape.variables.default({}),
    events: z.array(event).default([]),
    tests: z
      .array(
        z.object({
          name: z.string(),
          steps: z.array(
            z.object({
              event: z.string().optional(),
              target: z.string().default(""),
              advanceMs: z.number().min(0).optional(),
              choose: z.string().optional(),
              password: z.string().optional(),
            }),
          ),
          ending: z.string(),
          expectUnlocked: z.array(z.string()).default([]),
        }),
      )
      .default([]),
  })
  .strict();
export type Story = z.infer<typeof storySchema>;
export class StoryIssue extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
  }
}
export function compileStory(raw: unknown): { story: Story; work: Work } {
  // Normalize legacy simulator data before strict schema validation. The template
  // contains UI-specific phone/contact fields and primitive metadata values that
  // are valid for the simulator but need canonical forms in the story engine.
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy simulator data is normalized before schema validation.
    const input = raw as Record<string, any>;
    if (input.phone && typeof input.phone === "object") {
      const phoneKeys = new Set([
        "owner", "date", "time", "battery", "network", "wallpaper",
        "wallpaperImage", "passcode", "theme", "notifications",
      ]);
      for (const key of Object.keys(input.phone)) {
        if (!phoneKeys.has(key)) delete input.phone[key];
      }
    }
    if (Array.isArray(input.contacts)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- contact fields vary across legacy story formats.
      input.contacts = input.contacts.map((contact: Record<string, any>) => ({
        id: String(contact.id ?? "contact"),
        name: String(contact.name ?? contact.meta?.name ?? contact.title ?? contact.sender ?? "联系人"),
        phone: String(contact.phone ?? contact.meta?.phone ?? ""),
        avatar: String(contact.avatar ?? ""),
        bio: String(contact.bio ?? contact.meta?.relationship ?? contact.body ?? ""),
      }));
    }
    if (input.content && typeof input.content === "object") {
      const validKinds = new Set([
        "text", "image", "audio", "video", "file", "transfer", "call",
        "order", "note", "post", "event",
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- content is untrusted legacy input normalized below.
      for (const [app, items] of Object.entries(input.content as Record<string, any>)) {
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          if (!item || typeof item !== "object") continue;
          if (item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)) {
            for (const [key, value] of Object.entries(item.meta)) {
              item.meta[key] = typeof value === "string" ? value : String(value);
            }
          }
          if (!validKinds.has(item.kind)) {
            item.kind = item.kind === "product" || app === "taobao"
              ? "order"
              : app === "photos" || app === "camera"
                ? "image"
                : app === "music" || app === "netease"
                  ? "audio"
                  : "text";
          }
        }
      }
    }
  }
  const s = storySchema.parse(raw);
  const fail = (p: string, m: string): never => {
    throw new StoryIssue(p, m);
  };
  const names = new Set<string>();
  const unique = (v: string, p: string) => {
    if (names.has(v)) fail(p, "重复 ID: " + v);
    names.add(v);
  };
  const contacts = new Map(s.contacts.map((c) => [c.id, c]));
  s.contacts.forEach((c, i) => unique(c.id, `contacts.${i}.id`));
  const configuredIds = s.installedApps.map((a) =>
    typeof a === "string" ? a : a.id,
  );
  const installed = new Set(
    s.installedApps
      .filter((a) => typeof a === "string" || a.installed)
      .map((a) => (typeof a === "string" ? a : a.id)),
  );
  if (new Set(configuredIds).size !== s.installedApps.length)
    fail("installedApps", "App 重复");
  s.installedApps.forEach((a, i) => {
    if (!registry.some((r) => r.id === (typeof a === "string" ? a : a.id)))
      fail(`installedApps.${i}`, "未注册的 App");
  });
  const data: Work["data"] = {};
  const add = (
    app: string,
    raw: Partial<z.infer<typeof itemSchema>>,
    p: string,
  ) => {
    if (!installed.has(app)) fail(p, `App ${app} 未安装`);
    unique(raw.id!, p + ".id");
    const item = itemSchema.parse({
      time: s.phone.date + " " + (s.phone.time || "21:41"),
      sender: s.phone.owner,
      ...raw,
    });
    for (const k of ["media", "avatar"] as const)
      if (item[k] && !safeMedia(item[k]))
        fail(p + "." + k, "仅允许受支持的内嵌媒体，不允许脚本或远程资源");
    if (item.richText) {
      let doc;
      try {
        doc = JSON.parse(item.richText);
      } catch {
        fail(p + ".richText", "必须是结构化富文本 JSON，不能导入 HTML");
      }
      if (!doc || typeof doc !== "object") fail(p + ".richText", "无效富文本");
    }
    (data[app] ??= []).push(item);
  };
  for (const [app, items] of Object.entries(s.content))
    items.forEach((i, n) => {
      // Keep authored content in story.json even when its app is uninstalled.
      // It is omitted from the playable runtime until that app is installed again.
      if (installed.has(app)) add(app, i, `content.${app}.${n}`);
    });
  s.contacts.forEach((c, n) => {
    if (c.avatar && !safeMedia(c.avatar))
      fail(`contacts.${n}.avatar`, "无效头像");
    if (installed.has("contacts"))
      add(
        "contacts",
        {
          id: c.id + "-card",
          title: c.name,
          body: c.bio,
          meta: { phone: c.phone },
          avatar: c.avatar,
        },
        `contacts.${n}`,
      );
  });
  s.chats.forEach((chat, n) => {
    unique(chat.id, `chats.${n}.id`);
    if (!registry.some((a) => a.id === chat.app && a.engine === "messaging"))
      fail(`chats.${n}.app`, "需要聊天 App");
    chat.participants.forEach((c, j) => {
      if (!contacts.has(c) && c !== "owner")
        fail(`chats.${n}.participants.${j}`, "联系人不存在: " + c);
    });
    chat.messages.forEach((m, j) => {
      if (
        m.senderId &&
        m.senderId !== "owner" &&
        !chat.participants.includes(m.senderId)
      )
        fail(`chats.${n}.messages.${j}.senderId`, "发信人不在会话中");
      const { senderId, ...item } = m;
      add(
        chat.app,
        {
          ...item,
          title: chat.title,
          sender:
            senderId === "owner"
              ? s.phone.owner
              : contacts.get(senderId || "")?.name || m.sender || s.phone.owner,
          avatar: m.avatar || contacts.get(senderId || "")?.avatar || "",
          outgoing: senderId === "owner" || m.outgoing,
          meta: {
            ...m.meta,
            conversationId: chat.id,
            participants: chat.participants.join(","),
          },
        },
        `chats.${n}.messages.${j}`,
      );
    });
  });
  const nodes = s.events.map((e, n) => {
    unique(e.id, `events.${n}.id`);
    return nodeSchema.parse({
      event: "",
      target: "",
      conditions: [],
      logic: "and",
      actions: [],
      next: [],
      once: true,
      x: 0,
      y: 0,
      ...e,
    });
  });
  const itemIds = new Set(
      Object.values(data)
        .flat()
        .map((i) => i.id),
    ),
    nodeIds = new Set(nodes.map((n) => n.id));
  nodes.forEach((n, i) => {
    n.next.forEach((x, j) => {
      if (!nodeIds.has(x)) fail(`events.${i}.next.${j}`, "不存在的节点: " + x);
    });
    if (n.event === "read" && n.target && !itemIds.has(n.target))
      fail(`events.${i}.target`, "不存在的内容");
    if (n.event === "openApp" && n.target && !installed.has(n.target))
      fail(`events.${i}.target`, "事件 App 未安装");
    n.actions.forEach((a, j) => {
      if (["unlock", "hide"].includes(a.type) && !itemIds.has(a.key))
        fail(`events.${i}.actions.${j}.key`, "不存在的内容");
      if (a.type === "message" && !installed.has(a.key))
        fail(`events.${i}.actions.${j}.key`, "消息 App 未安装");
      if (a.type === "choice" && !nodeIds.has(a.key))
        fail(`events.${i}.actions.${j}.key`, "选项节点不存在");
    });
    n.conditions.forEach((c, j) => {
      const [scope, ...rest] = c.key.split(":");
      const key = rest.join(":");
      if (["read", "unlocked"].includes(scope) && !itemIds.has(key))
        fail(`events.${i}.conditions.${j}.key`, "条件内容不存在");
      if (scope === "visited" && !installed.has(key))
        fail(`events.${i}.conditions.${j}.key`, "条件 App 未安装");
    });
  });
  const errors = validateGraph(nodes);
  if (errors.length) fail("events", errors.join("; "));
  const work = validateWork({
    formatVersion: 1,
    id: s.id,
    title: s.title,
    description: s.description,
    category: "互动手机故事",
    cover: "",
    updatedAt: s.revision,
    phone: {
      passcode: "",
      wallpaper: "sage",
      theme: "light",
      time: "21:41",
      battery: 86,
      network: "5G",
      notifications: true,
      ...s.phone,
    },
    apps: [...registry]
      .sort((a, b) => {
        const ids = s.installedApps.map((x) =>
          typeof x === "string" ? x : x.id,
        );
        return (
          (ids.includes(a.id) ? ids.indexOf(a.id) : 999) -
          (ids.includes(b.id) ? ids.indexOf(b.id) : 999)
        );
      })
      .map((r) => {
        const custom = s.installedApps.find(
          (a) => typeof a !== "string" && a.id === r.id,
        );
        return {
          id: r.id,
          name: r.name,
          installed: installed.has(r.id),
          visible: installed.has(r.id),
          dock: ["phone", "messages", "safari"].includes(r.id),
          folder: "",
          icon: "",
          ...(typeof custom === "object" ? custom : {}),
        };
      }),
    data,
    nodes,
    variables: s.variables,
    mode: nodes.length ? "mixed" : "explore",
  });
  return { story: s, work };
}
