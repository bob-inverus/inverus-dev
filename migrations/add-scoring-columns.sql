-- Add scoring columns to people_db with update timestamp
-- Adjust types as needed for your DB. This assumes PostgreSQL (Supabase)

-- Raw Trust component scores
ALTER TABLE public.people_db
  ADD COLUMN IF NOT EXISTS ts_score_ivh numeric,
  ADD COLUMN IF NOT EXISTS ts_score_abd numeric,
  ADD COLUMN IF NOT EXISTS ts_score_dit numeric,
  ADD COLUMN IF NOT EXISTS ts_score_rie numeric,
  ADD COLUMN IF NOT EXISTS ts_score_ivsd numeric,
  ADD COLUMN IF NOT EXISTS ts_score_rep numeric,
  ADD COLUMN IF NOT EXISTS ts_score_beh numeric,
  ADD COLUMN IF NOT EXISTS tsraw numeric,
  ADD COLUMN IF NOT EXISTS cs numeric,
  ADD COLUMN IF NOT EXISTS dis_direct numeric,
  ADD COLUMN IF NOT EXISTS dis_hybrid numeric,

  -- Data Quality metrics
  ADD COLUMN IF NOT EXISTS dq_completeness numeric,
  ADD COLUMN IF NOT EXISTS dq_consistency numeric,
  ADD COLUMN IF NOT EXISTS dq_validity numeric,
  ADD COLUMN IF NOT EXISTS dq_accuracy numeric,
  ADD COLUMN IF NOT EXISTS dq_timeliness numeric,
  ADD COLUMN IF NOT EXISTS dq_uniqueness numeric,
  ADD COLUMN IF NOT EXISTS dq_precision numeric,
  ADD COLUMN IF NOT EXISTS dq_usability numeric,

  -- Source Trustworthiness metrics
  ADD COLUMN IF NOT EXISTS st_security numeric,
  ADD COLUMN IF NOT EXISTS st_privacy numeric,
  ADD COLUMN IF NOT EXISTS st_ethics numeric,
  ADD COLUMN IF NOT EXISTS st_resiliency numeric,
  ADD COLUMN IF NOT EXISTS st_robustness numeric,
  ADD COLUMN IF NOT EXISTS st_reliability numeric,
  ADD COLUMN IF NOT EXISTS st_reputation numeric,
  ADD COLUMN IF NOT EXISTS st_transparency numeric,
  ADD COLUMN IF NOT EXISTS st_update_frequency numeric,

  -- Confidence weighting inputs (pre-normalization)
  ADD COLUMN IF NOT EXISTS wdq numeric,
  ADD COLUMN IF NOT EXISTS wst numeric,

  -- Timestamp when scoring columns were last updated
  ADD COLUMN IF NOT EXISTS scoring_updated_at timestamptz DEFAULT now();

-- Optional index on updated timestamp
CREATE INDEX IF NOT EXISTS idx_people_db_scoring_updated_at
  ON public.people_db (scoring_updated_at); 