BEGIN;

CREATE TABLE workspace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  color_key TEXT NOT NULL DEFAULT 'slate',
  icon TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX workspace_categories_workspace_id_key_key
  ON workspace_categories(workspace_id, key);
CREATE INDEX workspace_categories_workspace_id_is_archived_idx
  ON workspace_categories(workspace_id, is_archived);

WITH labels AS (
  SELECT workspace_id, category AS name FROM transactions
  UNION
  SELECT workspace_id, category AS name FROM category_rules WHERE workspace_id IS NOT NULL
  UNION
  SELECT workspace_id, category_label AS name FROM spending_budget_limits WHERE category_label IS NOT NULL
), normalized AS (
  SELECT workspace_id, min(btrim(name)) AS name,
    lower(regexp_replace(btrim(regexp_replace(normalize(name, NFD), U&'[\0300-\036f]', '', 'g')), '\s+', ' ', 'g')) AS key
  FROM labels
  WHERE btrim(name) <> ''
  GROUP BY workspace_id,
    lower(regexp_replace(btrim(regexp_replace(normalize(name, NFD), U&'[\0300-\036f]', '', 'g')), '\s+', ' ', 'g'))
)
INSERT INTO workspace_categories (workspace_id, key, name, color_key)
SELECT workspace_id, key, name, 'slate'
FROM normalized
WHERE key NOT IN (
  'supermercado', 'restaurantes & delivery', 'servicios financieros', 'transferencias',
  'transporte', 'combustible', 'servicios', 'suscripciones', 'salud & farmacia',
  'compras online', 'hogar', 'ropa & moda', 'entretenimiento', 'tecnologia', 'otros',
  'transferencias propias'
);

ALTER TABLE workspace_categories ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE role_name TEXT; BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE workspace_categories FROM %I', role_name);
    END IF;
  END LOOP;
END $$;

COMMIT;
