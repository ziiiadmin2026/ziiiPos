-- Add positioning fields to restaurant_tables for visual floor plan
DO $$
BEGIN
  -- Add position and size columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'restaurant_tables' 
    AND column_name = 'pos_x'
  ) THEN
    ALTER TABLE public.restaurant_tables 
    ADD COLUMN pos_x integer,
    ADD COLUMN pos_y integer,
    ADD COLUMN width integer DEFAULT 80,
    ADD COLUMN height integer DEFAULT 80,
    ADD COLUMN rotation integer DEFAULT 0,
    ADD COLUMN shape text DEFAULT 'square' CHECK (shape IN ('square', 'round', 'rectangle'));
  END IF;
END $$;

COMMENT ON COLUMN public.restaurant_tables.pos_x IS 'X position on floor plan grid (pixels)';
COMMENT ON COLUMN public.restaurant_tables.pos_y IS 'Y position on floor plan grid (pixels)';
COMMENT ON COLUMN public.restaurant_tables.width IS 'Width of table on floor plan (pixels)';
COMMENT ON COLUMN public.restaurant_tables.height IS 'Height of table on floor plan (pixels)';
COMMENT ON COLUMN public.restaurant_tables.rotation IS 'Rotation angle in degrees (0-360)';
COMMENT ON COLUMN public.restaurant_tables.shape IS 'Visual shape for rendering (square, round, rectangle)';
