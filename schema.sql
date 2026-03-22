DROP TABLE IF EXISTS signatures;

CREATE TABLE IF NOT EXISTS signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  country TEXT NOT NULL,
  message TEXT DEFAULT '',
  ip_hash TEXT NOT NULL,
  build_version TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_signatures_created_at ON signatures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signatures_country ON signatures(country);
CREATE INDEX IF NOT EXISTS idx_signatures_ip_hash ON signatures(ip_hash);
