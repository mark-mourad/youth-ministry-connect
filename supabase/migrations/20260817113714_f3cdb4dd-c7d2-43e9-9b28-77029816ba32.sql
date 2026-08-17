CREATE TYPE public.app_role AS ENUM ('student','servant');
CREATE TYPE public.grade_level AS ENUM ('1st_sec','2nd_sec','3rd_sec');
CREATE TYPE public.event_type AS ENUM ('sunday_school','activity','recreation','liturgy','tasbeha');
CREATE TYPE public.recurrence_type AS ENUM ('once','weekly','custom');
CREATE TYPE public.testament AS ENUM ('old','new');

CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level public.grade_level NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  role public.app_role NOT NULL DEFAULT 'student',
  grade_level public.grade_level,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type public.event_type NOT NULL DEFAULT 'sunday_school',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  recurrence public.recurrence_type NOT NULL DEFAULT 'once',
  custom_days TEXT[] NOT NULL DEFAULT '{}',
  grade_level public.grade_level,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, student_id)
);

CREATE TABLE public.spiritual_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT current_date,
  prayers JSONB NOT NULL DEFAULT '{"baker":false,"ghroob":false,"noom":false,"free":false}'::jsonb,
  bible_testament public.testament,
  bible_book TEXT,
  bible_chapter INTEGER,
  other_readings TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

CREATE TABLE public.followup_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  servant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT SELECT ON public.classes TO anon;
GRANT ALL ON public.classes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spiritual_journal TO authenticated;
GRANT ALL ON public.spiritual_journal TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.followup_notes TO authenticated;
GRANT ALL ON public.followup_notes TO service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.sync_user_role() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role AND current_setting('role', true) <> 'service_role' THEN
    NEW.role := OLD.role;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_sync_role BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes readable by anyone" ON public.classes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "servants manage classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants update classes" ON public.classes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants delete classes" ON public.classes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'servant'));

CREATE POLICY "users read own row" ON public.users FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'servant'));
CREATE POLICY "users insert own row" ON public.users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "users update own row" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'servant'));

CREATE POLICY "events readable" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "servants insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants update events" ON public.events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants delete events" ON public.events FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'servant'));

CREATE POLICY "attendance readable" ON public.attendance FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants log attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants delete attendance" ON public.attendance FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'servant'));

CREATE POLICY "journal readable" ON public.spiritual_journal FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.has_role(auth.uid(),'servant'));
CREATE POLICY "students write journal" ON public.spiritual_journal FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "students update journal" ON public.spiritual_journal FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "students delete journal" ON public.spiritual_journal FOR DELETE TO authenticated USING (student_id = auth.uid());

CREATE POLICY "servants read notes" ON public.followup_notes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants insert notes" ON public.followup_notes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'servant') AND servant_id = auth.uid());
CREATE POLICY "servants update notes" ON public.followup_notes FOR UPDATE TO authenticated USING (servant_id = auth.uid());
CREATE POLICY "servants delete notes" ON public.followup_notes FOR DELETE TO authenticated USING (servant_id = auth.uid());

INSERT INTO public.classes (name, grade_level) VALUES
  ('البابا ألكسندروس','1st_sec'),
  ('البابا أثناسيوس','1st_sec'),
  ('البابا كيرلس عمود الدين','1st_sec'),
  ('البابا ديسقورس','1st_sec'),
  ('البابا بطرس','1st_sec'),
  ('القديس إكليمنضدس','2nd_sec'),
  ('القديس إغناطيوس','2nd_sec'),
  ('القديس بوليكاربوس','2nd_sec'),
  ('القديس تيموثاوس','2nd_sec'),
  ('القديس تيطس','2nd_sec');