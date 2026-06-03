-- Add set modifier columns to set_logs
ALTER TABLE public.set_logs ADD COLUMN is_banded boolean NOT NULL DEFAULT false;
ALTER TABLE public.set_logs ADD COLUMN went_to_failure boolean NOT NULL DEFAULT false;
ALTER TABLE public.set_logs ADD COLUMN equipment_used text;
