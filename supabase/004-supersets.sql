-- Add superset grouping to template_exercises
-- Exercises with the same non-null superset_group value alternate sets
ALTER TABLE public.template_exercises ADD COLUMN superset_group int;
