-- Add unique constraint on products(branch_id, name)
-- Required for upsert in the menu import route (ON CONFLICT branch_id,name)
-- Idempotent: safe to run multiple times
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_branch_id_name_key'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_branch_id_name_key UNIQUE (branch_id, name);
  END IF;
END $$;
