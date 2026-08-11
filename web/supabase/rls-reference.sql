-- Políticas RLS de referência para Supabase / Postgres com auth.uid()
-- No MVP atual a autorização é feita na aplicação (NextAuth + checagens server-side).
-- Use este arquivo ao migrar auth para Supabase Auth.

-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- Exemplo: aluno só lê a si mesmo
-- CREATE POLICY student_self ON "User"
--   FOR SELECT USING (id = auth.uid()::text OR current_setting('app.role', true) = 'ADMIN');
