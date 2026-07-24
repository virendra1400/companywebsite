import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_trust_bar_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_trust_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_export_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_export_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"country" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_trust_bar_items" ADD CONSTRAINT "pages_blocks_trust_bar_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_bar_items" ADD CONSTRAINT "pages_blocks_trust_bar_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trust_bar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_bar" ADD CONSTRAINT "pages_blocks_trust_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_export_process_steps" ADD CONSTRAINT "pages_blocks_export_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_export_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_export_process" ADD CONSTRAINT "pages_blocks_export_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_trust_bar_items_order_idx" ON "pages_blocks_trust_bar_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_bar_items_parent_id_idx" ON "pages_blocks_trust_bar_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_bar_items_locale_idx" ON "pages_blocks_trust_bar_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_trust_bar_items_logo_idx" ON "pages_blocks_trust_bar_items" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_trust_bar_order_idx" ON "pages_blocks_trust_bar" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_bar_parent_id_idx" ON "pages_blocks_trust_bar" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_bar_path_idx" ON "pages_blocks_trust_bar" USING btree ("_path");
  CREATE INDEX "pages_blocks_trust_bar_locale_idx" ON "pages_blocks_trust_bar" USING btree ("_locale");
  CREATE INDEX "pages_blocks_export_process_steps_order_idx" ON "pages_blocks_export_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_export_process_steps_parent_id_idx" ON "pages_blocks_export_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_export_process_steps_locale_idx" ON "pages_blocks_export_process_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_export_process_order_idx" ON "pages_blocks_export_process" USING btree ("_order");
  CREATE INDEX "pages_blocks_export_process_parent_id_idx" ON "pages_blocks_export_process" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_export_process_path_idx" ON "pages_blocks_export_process" USING btree ("_path");
  CREATE INDEX "pages_blocks_export_process_locale_idx" ON "pages_blocks_export_process" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_items_locale_idx" ON "pages_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_locale_idx" ON "pages_blocks_testimonials" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_trust_bar_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_trust_bar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_export_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_export_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_trust_bar_items" CASCADE;
  DROP TABLE "pages_blocks_trust_bar" CASCADE;
  DROP TABLE "pages_blocks_export_process_steps" CASCADE;
  DROP TABLE "pages_blocks_export_process" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;`)
}
