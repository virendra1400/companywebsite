import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_certifications_status" AS ENUM('registered', 'in-certification');
  CREATE TYPE "public"."enum_products_image_gallery_role" AS ENUM('pack', 'macro', 'context');
  CREATE TYPE "public"."enum_resources_type" AS ENUM('catalog', 'brochure', 'spec-sheet', 'certificate', 'other');
  CREATE TABLE "products_specs_physico_chemical" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"parameter" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"unit" varchar,
  	"method" varchar
  );
  
  CREATE TABLE "products_specs_organoleptic" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"parameter" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"unit" varchar,
  	"method" varchar
  );
  
  CREATE TABLE "products_specs_microbiological" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"parameter" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"unit" varchar,
  	"method" varchar
  );
  
  CREATE TABLE "products_specs_contaminants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"parameter" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"unit" varchar,
  	"method" varchar
  );
  
  CREATE TABLE "products_packaging_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"net_weight" varchar NOT NULL,
  	"units_per_carton" numeric,
  	"cartons_per_pallet" numeric
  );
  
  CREATE TABLE "products_packaging_options_locales" (
  	"format" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "products_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer NOT NULL
  );
  
  CREATE TABLE "products_downloads_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "facility_facts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"verified" boolean DEFAULT false,
  	"display_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "facility_facts_locales" (
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_resources_type" NOT NULL,
  	"file_id" integer NOT NULL,
  	"product_id" integer,
  	"display_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_locales" (
  	"sla_response_time" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "certifications" ADD COLUMN "status" "enum_certifications_status";
  ALTER TABLE "certifications" ADD COLUMN "number" varchar;
  ALTER TABLE "certifications" ADD COLUMN "valid_from" timestamp(3) with time zone;
  ALTER TABLE "certifications" ADD COLUMN "valid_to" timestamp(3) with time zone;
  ALTER TABLE "certifications" ADD COLUMN "target_date" timestamp(3) with time zone;
  ALTER TABLE "certifications_locales" ADD COLUMN "scope" varchar;
  ALTER TABLE "products_image_gallery" ADD COLUMN "role" "enum_products_image_gallery_role";
  ALTER TABLE "products" ADD COLUMN "container_loading_teu20_units" numeric;
  ALTER TABLE "products" ADD COLUMN "container_loading_teu20_net_m_t" numeric;
  ALTER TABLE "products" ADD COLUMN "seo_og_image_id" integer;
  ALTER TABLE "products_locales" ADD COLUMN "container_loading_pallet_note" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "shelf_life" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "storage_temp" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "moq_range" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "facility_facts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "resources_id" integer;
  ALTER TABLE "products_specs_physico_chemical" ADD CONSTRAINT "products_specs_physico_chemical_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs_organoleptic" ADD CONSTRAINT "products_specs_organoleptic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs_microbiological" ADD CONSTRAINT "products_specs_microbiological_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs_contaminants" ADD CONSTRAINT "products_specs_contaminants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_packaging_options" ADD CONSTRAINT "products_packaging_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_packaging_options_locales" ADD CONSTRAINT "products_packaging_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_packaging_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_faq" ADD CONSTRAINT "products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_downloads" ADD CONSTRAINT "products_downloads_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_downloads" ADD CONSTRAINT "products_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_downloads_locales" ADD CONSTRAINT "products_downloads_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facility_facts_locales" ADD CONSTRAINT "facility_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facility_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_locales" ADD CONSTRAINT "resources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_specs_physico_chemical_order_idx" ON "products_specs_physico_chemical" USING btree ("_order");
  CREATE INDEX "products_specs_physico_chemical_parent_id_idx" ON "products_specs_physico_chemical" USING btree ("_parent_id");
  CREATE INDEX "products_specs_physico_chemical_locale_idx" ON "products_specs_physico_chemical" USING btree ("_locale");
  CREATE INDEX "products_specs_organoleptic_order_idx" ON "products_specs_organoleptic" USING btree ("_order");
  CREATE INDEX "products_specs_organoleptic_parent_id_idx" ON "products_specs_organoleptic" USING btree ("_parent_id");
  CREATE INDEX "products_specs_organoleptic_locale_idx" ON "products_specs_organoleptic" USING btree ("_locale");
  CREATE INDEX "products_specs_microbiological_order_idx" ON "products_specs_microbiological" USING btree ("_order");
  CREATE INDEX "products_specs_microbiological_parent_id_idx" ON "products_specs_microbiological" USING btree ("_parent_id");
  CREATE INDEX "products_specs_microbiological_locale_idx" ON "products_specs_microbiological" USING btree ("_locale");
  CREATE INDEX "products_specs_contaminants_order_idx" ON "products_specs_contaminants" USING btree ("_order");
  CREATE INDEX "products_specs_contaminants_parent_id_idx" ON "products_specs_contaminants" USING btree ("_parent_id");
  CREATE INDEX "products_specs_contaminants_locale_idx" ON "products_specs_contaminants" USING btree ("_locale");
  CREATE INDEX "products_packaging_options_order_idx" ON "products_packaging_options" USING btree ("_order");
  CREATE INDEX "products_packaging_options_parent_id_idx" ON "products_packaging_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_packaging_options_locales_locale_parent_id_unique" ON "products_packaging_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_faq_order_idx" ON "products_faq" USING btree ("_order");
  CREATE INDEX "products_faq_parent_id_idx" ON "products_faq" USING btree ("_parent_id");
  CREATE INDEX "products_faq_locale_idx" ON "products_faq" USING btree ("_locale");
  CREATE INDEX "products_downloads_order_idx" ON "products_downloads" USING btree ("_order");
  CREATE INDEX "products_downloads_parent_id_idx" ON "products_downloads" USING btree ("_parent_id");
  CREATE INDEX "products_downloads_file_idx" ON "products_downloads" USING btree ("file_id");
  CREATE UNIQUE INDEX "products_downloads_locales_locale_parent_id_unique" ON "products_downloads_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_texts_locale_parent" ON "products_texts" USING btree ("locale","parent_id");
  CREATE UNIQUE INDEX "facility_facts_key_idx" ON "facility_facts" USING btree ("key");
  CREATE INDEX "facility_facts_updated_at_idx" ON "facility_facts" USING btree ("updated_at");
  CREATE INDEX "facility_facts_created_at_idx" ON "facility_facts" USING btree ("created_at");
  CREATE UNIQUE INDEX "facility_facts_locales_locale_parent_id_unique" ON "facility_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "resources_file_idx" ON "resources" USING btree ("file_id");
  CREATE INDEX "resources_product_idx" ON "resources" USING btree ("product_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE UNIQUE INDEX "resources_locales_locale_parent_id_unique" ON "resources_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_facility_facts_fk" FOREIGN KEY ("facility_facts_id") REFERENCES "public"."facility_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_seo_seo_og_image_idx" ON "products" USING btree ("seo_og_image_id");
  CREATE INDEX "payload_locked_documents_rels_facility_facts_id_idx" ON "payload_locked_documents_rels" USING btree ("facility_facts_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_specs_physico_chemical" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_specs_organoleptic" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_specs_microbiological" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_specs_contaminants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_packaging_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_packaging_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_downloads_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facility_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facility_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_specs_physico_chemical" CASCADE;
  DROP TABLE "products_specs_organoleptic" CASCADE;
  DROP TABLE "products_specs_microbiological" CASCADE;
  DROP TABLE "products_specs_contaminants" CASCADE;
  DROP TABLE "products_packaging_options" CASCADE;
  DROP TABLE "products_packaging_options_locales" CASCADE;
  DROP TABLE "products_faq" CASCADE;
  DROP TABLE "products_downloads" CASCADE;
  DROP TABLE "products_downloads_locales" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "facility_facts" CASCADE;
  DROP TABLE "facility_facts_locales" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "resources_locales" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_seo_og_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_facility_facts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_resources_fk";
  
  DROP INDEX "products_seo_seo_og_image_idx";
  DROP INDEX "payload_locked_documents_rels_facility_facts_id_idx";
  DROP INDEX "payload_locked_documents_rels_resources_id_idx";
  ALTER TABLE "certifications" DROP COLUMN "status";
  ALTER TABLE "certifications" DROP COLUMN "number";
  ALTER TABLE "certifications" DROP COLUMN "valid_from";
  ALTER TABLE "certifications" DROP COLUMN "valid_to";
  ALTER TABLE "certifications" DROP COLUMN "target_date";
  ALTER TABLE "certifications_locales" DROP COLUMN "scope";
  ALTER TABLE "products_image_gallery" DROP COLUMN "role";
  ALTER TABLE "products" DROP COLUMN "container_loading_teu20_units";
  ALTER TABLE "products" DROP COLUMN "container_loading_teu20_net_m_t";
  ALTER TABLE "products" DROP COLUMN "seo_og_image_id";
  ALTER TABLE "products_locales" DROP COLUMN "container_loading_pallet_note";
  ALTER TABLE "products_locales" DROP COLUMN "shelf_life";
  ALTER TABLE "products_locales" DROP COLUMN "storage_temp";
  ALTER TABLE "products_locales" DROP COLUMN "moq_range";
  ALTER TABLE "products_locales" DROP COLUMN "seo_title";
  ALTER TABLE "products_locales" DROP COLUMN "seo_description";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "facility_facts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "resources_id";
  DROP TYPE "public"."enum_certifications_status";
  DROP TYPE "public"."enum_products_image_gallery_role";
  DROP TYPE "public"."enum_resources_type";`)
}
