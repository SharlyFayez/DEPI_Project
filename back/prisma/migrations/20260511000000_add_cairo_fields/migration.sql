-- AlterTable: add new columns with safe defaults for existing rows
ALTER TABLE "public"."TrafficData"
  ADD COLUMN IF NOT EXISTS "district"         TEXT NOT NULL DEFAULT 'Downtown Cairo',
  ADD COLUMN IF NOT EXISTS "roadType"         TEXT NOT NULL DEFAULT 'ARTERIAL',
  ADD COLUMN IF NOT EXISTS "incidentType"     TEXT NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "weatherCondition" TEXT NOT NULL DEFAULT 'CLEAR';
