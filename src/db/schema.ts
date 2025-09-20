import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  unique,
  uniqueIndex,
  decimal,
  json,
  index,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull(),
    created_at: timestamp({ withTimezone: true }),
    nickname: varchar({ length: 255 }),
    avatar_url: varchar({ length: 255 }),
    locale: varchar({ length: 50 }),
    signin_type: varchar({ length: 50 }),
    signin_ip: varchar({ length: 255 }),
    signin_provider: varchar({ length: 50 }),
    signin_openid: varchar({ length: 255 }),
    invite_code: varchar({ length: 255 }).notNull().default(""),
    updated_at: timestamp({ withTimezone: true }),
    invited_by: varchar({ length: 255 }).notNull().default(""),
    is_affiliate: boolean().notNull().default(false),
    credits: integer().notNull().default(0), // 积分余额
    cart: json(), // 购物车数据
  },
  (table) => [
    uniqueIndex("email_provider_unique_idx").on(
      table.email,
      table.signin_provider
    ),
  ]
);

// Orders table
export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  order_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull().default(""),
  user_email: varchar({ length: 255 }).notNull().default(""),
  amount: integer().notNull(),
  interval: varchar({ length: 50 }),
  expired_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull(),
  stripe_session_id: varchar({ length: 255 }),
  credits: integer().notNull(),
  currency: varchar({ length: 50 }),
  sub_id: varchar({ length: 255 }),
  sub_interval_count: integer(),
  sub_cycle_anchor: integer(),
  sub_period_end: integer(),
  sub_period_start: integer(),
  sub_times: integer(),
  product_id: varchar({ length: 255 }),
  product_name: varchar({ length: 255 }),
  valid_months: integer(),
  order_detail: text(),
  paid_at: timestamp({ withTimezone: true }),
  paid_email: varchar({ length: 255 }),
  paid_detail: text(),

  // AI造物平台新增字段
  subtotal: decimal({ precision: 10, scale: 2 }),
  shipping: decimal({ precision: 10, scale: 2 }),
  tax: decimal({ precision: 10, scale: 2 }),
  total: decimal({ precision: 10, scale: 2 }),
  shipping_address: json(),
  tracking_number: varchar({ length: 255 }),
  shipped_at: timestamp({ withTimezone: true }),
  delivered_at: timestamp({ withTimezone: true }),
  notes: text(),
}, (table) => [
  index("orders_user_uuid_idx").on(table.user_uuid),
  index("orders_status_idx").on(table.status),
]);

// API Keys table
export const apikeys = pgTable("apikeys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  api_key: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 100 }),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
});

// Credits table
export const credits = pgTable("credits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  trans_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull(),
  trans_type: varchar({ length: 50 }).notNull(),
  credits: integer().notNull(),
  order_no: varchar({ length: 255 }),
  expired_at: timestamp({ withTimezone: true }),
});

// Categories table
export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  status: varchar({ length: 50 }),
  sort: integer().notNull().default(0),
  created_at: timestamp({ withTimezone: true }),
  updated_at: timestamp({ withTimezone: true }),
});

// Posts table
export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  slug: varchar({ length: 255 }),
  title: varchar({ length: 255 }),
  description: text(),
  content: text(),
  created_at: timestamp({ withTimezone: true }),
  updated_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  cover_url: varchar({ length: 255 }),
  author_name: varchar({ length: 255 }),
  author_avatar_url: varchar({ length: 255 }),
  locale: varchar({ length: 50 }),
  category_uuid: varchar({ length: 255 }),
});

// Affiliates table
export const affiliates = pgTable("affiliates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull().default(""),
  invited_by: varchar({ length: 255 }).notNull(),
  paid_order_no: varchar({ length: 255 }).notNull().default(""),
  paid_amount: integer().notNull().default(0),
  reward_percent: integer().notNull().default(0),
  reward_amount: integer().notNull().default(0),
});

// Feedbacks table
export const feedbacks = pgTable("feedbacks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  user_uuid: varchar({ length: 255 }),
  content: text(),
  rating: integer(),
});

// AI造物平台相关表

// AI生成记录表
export const aiGenerationRecords = pgTable("ai_generation_records", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(), // text2img, img2img, text2model
  prompt: text(),
  negative_prompt: text(),
  output_urls: json(),
  credits_used: integer().notNull().default(0),
  params: json(),
  status: varchar({ length: 50 }).notNull().default('pending'),
  error_message: text(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  completed_at: timestamp({ withTimezone: true }),
}, (table) => [
  index("ai_records_user_idx").on(table.user_uuid),
  index("ai_records_type_idx").on(table.type),
  index("ai_records_status_idx").on(table.status),
]);

// 产品类别表
export const productCategories = pgTable("product_categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  description: text(),
  base_price: decimal({ precision: 10, scale: 2 }).notNull(),
  production_time: integer().notNull().default(7), // 生产天数
  min_order_quantity: integer().notNull().default(1),
  max_order_quantity: integer().notNull().default(100),
  status: varchar({ length: 50 }).notNull().default('active'),
  sort: integer().notNull().default(0),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("product_categories_status_idx").on(table.status),
]);

// 材质表
export const materials = pgTable("materials", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price_modifier: decimal({ precision: 3, scale: 2 }).notNull().default('1.00'), // 价格系数
  properties: json(), // 材质属性
  availability: boolean().notNull().default(true),
  lead_time: integer().notNull().default(0), // 额外生产时间
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
});

// 产品表
export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  description: text(),
  images: json(), // 商品图片数组
  category_uuid: varchar({ length: 255 }).notNull(),
  base_price: decimal({ precision: 10, scale: 2 }).notNull(),
  designer_uuid: varchar({ length: 255 }),

  // AI生成相关
  is_ai_generated: boolean().notNull().default(false),
  ai_prompt: text(),
  ai_params: json(),

  // 库存与销售
  stock: integer().notNull().default(0),
  sold: integer().notNull().default(0),

  // 定制选项
  customizable: boolean().notNull().default(true),
  available_materials: json(), // 可用材质ID数组
  available_sizes: json(), // 可用尺寸
  available_colors: json(), // 可用颜色
  allow_engraving: boolean().notNull().default(false),

  // SEO与展示
  tags: json(), // 标签数组
  featured: boolean().notNull().default(false),
  status: varchar({ length: 50 }).notNull().default('active'),

  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("products_category_idx").on(table.category_uuid),
  index("products_designer_idx").on(table.designer_uuid),
  index("products_featured_idx").on(table.featured),
  index("products_status_idx").on(table.status),
]);

// 订单项表
export const orderItems = pgTable("order_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  order_uuid: varchar({ length: 255 }).notNull(),
  product_uuid: varchar({ length: 255 }).notNull(),
  design_uuid: varchar({ length: 255 }), // 关联的设计
  quantity: integer().notNull().default(1),
  unit_price: decimal({ precision: 10, scale: 2 }).notNull(),
  total_price: decimal({ precision: 10, scale: 2 }).notNull(),
  customization: json(), // 定制选项
  production_notes: text(),
  production_status: varchar({ length: 50 }).notNull().default('pending'), // pending, designing, producing, completed
  created_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("order_items_order_idx").on(table.order_uuid),
  index("order_items_product_idx").on(table.product_uuid),
]);

// 创作者表
export const creators = pgTable("creators", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull().unique(),

  // 认证信息
  display_name: varchar({ length: 255 }).notNull(),
  bio: text(),
  avatar_url: varchar({ length: 255 }),
  portfolio: json(), // 作品集链接
  verified: boolean().notNull().default(false),
  verified_at: timestamp({ withTimezone: true }),

  // 创作者等级
  level: integer().notNull().default(1),
  experience: integer().notNull().default(0),

  // 统计数据
  total_designs: integer().notNull().default(0),
  total_sales: integer().notNull().default(0),
  total_revenue: decimal({ precision: 12, scale: 2 }).notNull().default('0.00'),
  rating: decimal({ precision: 3, scale: 2 }), // 平均评分

  // 分成设置
  commission_rate: decimal({ precision: 3, scale: 2 }).notNull().default('0.30'), // 30%默认分成

  // 专属设置
  store_name: varchar({ length: 255 }),
  store_slug: varchar({ length: 255 }).unique(),
  store_banner: varchar({ length: 255 }),

  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("creators_verified_idx").on(table.verified),
  index("creators_level_idx").on(table.level),
]);

// 创作者收益表
export const earnings = pgTable("earnings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  creator_uuid: varchar({ length: 255 }).notNull(),

  // 收益来源
  order_uuid: varchar({ length: 255 }).notNull(),
  product_uuid: varchar({ length: 255 }).notNull(),

  // 金额计算
  sale_price: decimal({ precision: 10, scale: 2 }).notNull(),
  commission_rate: decimal({ precision: 3, scale: 2 }).notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(), // 实际收益

  // 结算状态
  status: varchar({ length: 50 }).notNull().default('pending'), // pending, settled, withdrawn, cancelled
  settled_at: timestamp({ withTimezone: true }),
  withdrawn_at: timestamp({ withTimezone: true }),

  created_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("earnings_creator_idx").on(table.creator_uuid),
  index("earnings_status_idx").on(table.status),
]);

// 好朋友社区帖子表
export const communityPosts = pgTable("community_posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  author_uuid: varchar({ length: 255 }).notNull(),

  // 内容信息
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  images: json(),
  video_url: varchar({ length: 255 }),

  // 关联商品
  product_uuid: varchar({ length: 255 }),

  // AI生成信息
  is_ai_generated: boolean().notNull().default(false),
  ai_prompt: text(),
  generation_cost: integer(), // 消耗的积分

  // 互动统计
  views: integer().notNull().default(0),
  likes: integer().notNull().default(0),
  comments: integer().notNull().default(0),
  shares: integer().notNull().default(0),

  // 状态管理
  status: varchar({ length: 50 }).notNull().default('draft'), // draft, published, hidden, deleted
  published_at: timestamp({ withTimezone: true }),
  featured: boolean().notNull().default(false),

  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("community_posts_author_idx").on(table.author_uuid),
  index("community_posts_status_idx").on(table.status),
  index("community_posts_featured_idx").on(table.featured),
]);

// 社区互动表（点赞、收藏等）
export const reactions = pgTable("reactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_uuid: varchar({ length: 255 }).notNull(),
  post_uuid: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(), // like, favorite, share
  created_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("reactions_user_idx").on(table.user_uuid),
  index("reactions_post_idx").on(table.post_uuid),
  unique("unique_reaction").on(table.user_uuid, table.post_uuid, table.type),
]);

// 评论表
export const comments = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  post_uuid: varchar({ length: 255 }).notNull(),
  author_uuid: varchar({ length: 255 }).notNull(),
  parent_uuid: varchar({ length: 255 }), // 回复的评论ID
  content: text().notNull(),
  status: varchar({ length: 50 }).notNull().default('published'),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("comments_post_idx").on(table.post_uuid),
  index("comments_author_idx").on(table.author_uuid),
]);

// 商品评价表
export const reviews = pgTable("reviews", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  product_uuid: varchar({ length: 255 }).notNull(),
  user_uuid: varchar({ length: 255 }).notNull(),
  order_uuid: varchar({ length: 255 }).notNull(),
  rating: integer().notNull(), // 1-5星评分
  content: text(),
  images: json(), // 评价图片
  status: varchar({ length: 50 }).notNull().default('published'),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("reviews_product_idx").on(table.product_uuid),
  index("reviews_user_idx").on(table.user_uuid),
]);

// 邀请记录表
export const invites = pgTable("invites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  inviter_uuid: varchar({ length: 255 }).notNull(),
  invitee_uuid: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 50 }).notNull().default('completed'), // pending, completed, cancelled
  reward_credits: integer().notNull().default(100),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  completed_at: timestamp({ withTimezone: true }),
}, (table) => [
  index("invites_inviter_idx").on(table.inviter_uuid),
  index("invites_invitee_idx").on(table.invitee_uuid),
  unique("unique_invite").on(table.inviter_uuid, table.invitee_uuid),
]);

// 积分交易记录表
export const creditTransactions = pgTable("credit_transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  user_uuid: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(), // earned, spent, refunded
  amount: integer().notNull(),
  reason: varchar({ length: 100 }).notNull(), // purchase, ai_generation, invite_reward等
  description: text(),
  related_uuid: varchar({ length: 255 }), // 关联的订单或生成记录ID
  created_at: timestamp({ withTimezone: true }).defaultNow(),
}, (table) => [
  index("credit_transactions_user_idx").on(table.user_uuid),
  index("credit_transactions_type_idx").on(table.type),
]);
