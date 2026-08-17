import { createServerFn } from "@tanstack/react-start";

type Input = {
  full_name: string;
  email: string;
  password: string;
  grade_level: "1st_sec" | "2nd_sec" | "3rd_sec";
  passcode: string;
};

export const registerServant = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => data)
  .handler(async ({ data }) => {
    const expected = process.env["SERVANT_SECRET_PASSCODE"];
    if (!expected || data.passcode !== expected) {
      return { ok: false as const, error: "كلمة السر السرية غير صحيحة" };
    }
    if (!data.email || data.password.length < 6 || !data.full_name.trim()) {
      return { ok: false as const, error: "برجاء ملء كل البيانات بشكل صحيح" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) {
      return { ok: false as const, error: error?.message ?? "تعذر إنشاء الحساب" };
    }

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: created.user.id,
      full_name: data.full_name,
      email: data.email,
      role: "servant",
      grade_level: data.grade_level,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return { ok: false as const, error: profileError.message };
    }

    return { ok: true as const };
  });
