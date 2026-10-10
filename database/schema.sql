-- ============================================================================
-- DotNetForge — PostgreSQL schema
-- Stores curriculum content, user progress, quiz scores, capstone trackers.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users & auth
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    display_name  TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Curriculum: tracks -> modules -> lessons -> content blocks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tracks (
    id          SERIAL PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    subtitle    TEXT NOT NULL,
    description TEXT NOT NULL,
    icon        TEXT NOT NULL DEFAULT 'code',
    accent      TEXT NOT NULL DEFAULT '#6366f1',
    sort_order  INT  NOT NULL DEFAULT 0,
    is_capstone BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS modules (
    id          SERIAL PRIMARY KEY,
    track_id    INT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    slug        TEXT NOT NULL,
    title       TEXT NOT NULL,
    summary     TEXT NOT NULL DEFAULT '',
    sort_order  INT  NOT NULL DEFAULT 0,
    UNIQUE (track_id, slug)
);

CREATE TABLE IF NOT EXISTS lessons (
    id            SERIAL PRIMARY KEY,
    module_id     INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    slug          TEXT NOT NULL,
    title         TEXT NOT NULL,
    est_minutes   INT NOT NULL DEFAULT 10,
    sort_order    INT NOT NULL DEFAULT 0,
    -- content is an ordered array of blocks: {type, ...}
    content       JSONB NOT NULL DEFAULT '[]'::jsonb,
    UNIQUE (module_id, slug)
);

-- ---------------------------------------------------------------------------
-- Quizzes (per lesson) & answers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
    id            SERIAL PRIMARY KEY,
    lesson_id     INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    prompt        TEXT NOT NULL,
    options       JSONB NOT NULL,          -- array of {id,text}
    correct_id    TEXT NOT NULL,
    explanation   TEXT NOT NULL DEFAULT '',
    sort_order    INT NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- User progress
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
    id            BIGSERIAL PRIMARY KEY,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id     INT  NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | completed
    score         INT,
    completed_at  TIMESTAMPTZ,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS code_snippets (
    id            BIGSERIAL PRIMARY KEY,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id     INT REFERENCES lessons(id) ON DELETE SET NULL,
    label         TEXT NOT NULL DEFAULT 'sandbox',
    language      TEXT NOT NULL DEFAULT 'csharp',
    source        TEXT NOT NULL DEFAULT '',
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Capstone Lab Hub
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capstone_projects (
    id            SERIAL PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    objective     TEXT NOT NULL,
    difficulty    TEXT NOT NULL DEFAULT 'intermediate',
    est_hours     INT  NOT NULL DEFAULT 6,
    tools         JSONB NOT NULL DEFAULT '[]'::jsonb,   -- ["VS Code","WSL2",...]
    deliverables  JSONB NOT NULL DEFAULT '[]'::jsonb,
    accent        TEXT NOT NULL DEFAULT '#6366f1',
    icon          TEXT NOT NULL DEFAULT 'rocket',
    sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS capstone_steps (
    id            SERIAL PRIMARY KEY,
    project_id    INT NOT NULL REFERENCES capstone_projects(id) ON DELETE CASCADE,
    slug          TEXT NOT NULL,
    title         TEXT NOT NULL,
    body          TEXT NOT NULL DEFAULT '',
    -- ordered list of terminal commands for WSL/CLI guides
    commands      JSONB NOT NULL DEFAULT '[]'::jsonb,
    code          TEXT,
    code_language TEXT NOT NULL DEFAULT 'csharp',
    sort_order    INT NOT NULL DEFAULT 0,
    UNIQUE (project_id, slug)
);

CREATE TABLE IF NOT EXISTS capstone_progress (
    id            BIGSERIAL PRIMARY KEY,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_id       INT  NOT NULL REFERENCES capstone_steps(id) ON DELETE CASCADE,
    completed     BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, step_id)
);

-- ---------------------------------------------------------------------------
-- Design-pattern drag & drop game
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS design_patterns (
    id          SERIAL PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,          -- creational | structural | behavioral
    description TEXT NOT NULL,
    intent      TEXT NOT NULL DEFAULT '',
    code_hint   TEXT NOT NULL DEFAULT '',
    sort_order  INT NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_modules_track        ON modules(track_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_module       ON lessons(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_lesson          ON quiz_questions(lesson_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_capstone_steps_proj  ON capstone_steps(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_capstone_prog_user   ON capstone_progress(user_id);
