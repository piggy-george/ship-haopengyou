CREATE TABLE "ai_generation_records" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_generation_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"prompt" text,
	"negative_prompt" text,
	"output_urls" json,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"params" json,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"input_images" json,
	"multi_view_images" json,
	"cloud_job_id" varchar(255),
	"queue_position" integer,
	"processing_started_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_public" boolean DEFAULT false,
	"share_settings" json,
	"community_tags" json,
	"like_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ai_generation_records_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"post_uuid" varchar(255) NOT NULL,
	"author_uuid" varchar(255) NOT NULL,
	"parent_uuid" varchar(255),
	"content" text NOT NULL,
	"status" varchar(50) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "comments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "community_posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"author_uuid" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"images" json,
	"video_url" varchar(255),
	"product_uuid" varchar(255),
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"ai_prompt" text,
	"generation_cost" integer,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "community_posts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "creators_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"bio" text,
	"avatar_url" varchar(255),
	"portfolio" json,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"total_designs" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"rating" numeric(3, 2),
	"commission_rate" numeric(3, 2) DEFAULT '0.30' NOT NULL,
	"store_name" varchar(255),
	"store_slug" varchar(255),
	"store_banner" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "creators_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "creators_user_uuid_unique" UNIQUE("user_uuid"),
	CONSTRAINT "creators_store_slug_unique" UNIQUE("store_slug")
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "credit_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"description" text,
	"related_uuid" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "credit_transactions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "earnings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "earnings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"creator_uuid" varchar(255) NOT NULL,
	"order_uuid" varchar(255) NOT NULL,
	"product_uuid" varchar(255) NOT NULL,
	"sale_price" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(3, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"settled_at" timestamp with time zone,
	"withdrawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "earnings_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"inviter_uuid" varchar(255) NOT NULL,
	"invitee_uuid" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"reward_credits" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	CONSTRAINT "invites_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "unique_invite" UNIQUE("inviter_uuid","invitee_uuid")
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "materials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price_modifier" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"properties" json,
	"availability" boolean DEFAULT true NOT NULL,
	"lead_time" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "materials_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "model3d_interactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "model3d_interactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"record_uuid" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"interaction_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "model3d_queue" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "model3d_queue_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"record_uuid" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"version" varchar(20) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"peak_period" boolean DEFAULT false NOT NULL,
	"estimated_time" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "model3d_queue_record_uuid_unique" UNIQUE("record_uuid")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"order_uuid" varchar(255) NOT NULL,
	"product_uuid" varchar(255) NOT NULL,
	"design_uuid" varchar(255),
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"customization" json,
	"production_notes" text,
	"production_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "order_items_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"production_time" integer DEFAULT 7 NOT NULL,
	"min_order_quantity" integer DEFAULT 1 NOT NULL,
	"max_order_quantity" integer DEFAULT 100 NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_categories_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"images" json,
	"category_uuid" varchar(255) NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"designer_uuid" varchar(255),
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"ai_prompt" text,
	"ai_params" json,
	"stock" integer DEFAULT 0 NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"customizable" boolean DEFAULT true NOT NULL,
	"available_materials" json,
	"available_sizes" json,
	"available_colors" json,
	"allow_engraving" boolean DEFAULT false NOT NULL,
	"tags" json,
	"featured" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "products_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_uuid" varchar(255) NOT NULL,
	"post_uuid" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_reaction" UNIQUE("user_uuid","post_uuid","type")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"product_uuid" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"order_uuid" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"images" json,
	"status" varchar(50) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reviews_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "uuid" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subtotal" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tax" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address" json;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cart" json;--> statement-breakpoint
CREATE INDEX "ai_records_user_idx" ON "ai_generation_records" USING btree ("user_uuid");--> statement-breakpoint
CREATE INDEX "ai_records_type_idx" ON "ai_generation_records" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ai_records_status_idx" ON "ai_generation_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_uuid");--> statement-breakpoint
CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_uuid");--> statement-breakpoint
CREATE INDEX "community_posts_author_idx" ON "community_posts" USING btree ("author_uuid");--> statement-breakpoint
CREATE INDEX "community_posts_status_idx" ON "community_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "community_posts_featured_idx" ON "community_posts" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "creators_verified_idx" ON "creators" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "creators_level_idx" ON "creators" USING btree ("level");--> statement-breakpoint
CREATE INDEX "credit_transactions_user_idx" ON "credit_transactions" USING btree ("user_uuid");--> statement-breakpoint
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "earnings_creator_idx" ON "earnings" USING btree ("creator_uuid");--> statement-breakpoint
CREATE INDEX "earnings_status_idx" ON "earnings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invites_inviter_idx" ON "invites" USING btree ("inviter_uuid");--> statement-breakpoint
CREATE INDEX "invites_invitee_idx" ON "invites" USING btree ("invitee_uuid");--> statement-breakpoint
CREATE INDEX "model3d_interactions_record_idx" ON "model3d_interactions" USING btree ("record_uuid");--> statement-breakpoint
CREATE INDEX "model3d_interactions_user_idx" ON "model3d_interactions" USING btree ("user_uuid");--> statement-breakpoint
CREATE INDEX "model3d_queue_status_idx" ON "model3d_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "model3d_queue_created_idx" ON "model3d_queue" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "model3d_queue_peak_idx" ON "model3d_queue" USING btree ("peak_period");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_uuid");--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_uuid");--> statement-breakpoint
CREATE INDEX "product_categories_status_idx" ON "product_categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_uuid");--> statement-breakpoint
CREATE INDEX "products_designer_idx" ON "products" USING btree ("designer_uuid");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reactions_user_idx" ON "reactions" USING btree ("user_uuid");--> statement-breakpoint
CREATE INDEX "reactions_post_idx" ON "reactions" USING btree ("post_uuid");--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_uuid");--> statement-breakpoint
CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_uuid");--> statement-breakpoint
CREATE INDEX "orders_user_uuid_idx" ON "orders" USING btree ("user_uuid");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_uuid_unique" UNIQUE("uuid");