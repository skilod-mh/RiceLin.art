"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const postSchema = z.object({
  title: z.string().trim().min(5).max(120),
  slug: z.string().trim().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().max(280).optional(),
  body: z.string().trim().min(20).max(50000),
  kind: z.enum(["tutorial", "rice"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export async function publishPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?error=Sign%20in%20first");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/?error=Admin%20access%20required");

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || undefined,
    body: formData.get("body"),
    kind: formData.get("kind"),
    difficulty: formData.get("difficulty"),
  });

  if (!parsed.success) redirect("/admin?error=Check%20the%20fields%20and%20try%20again");

  const { error } = await supabase.from("posts").insert({
    ...parsed.data,
    author_id: user.id,
    status: "published",
  });

  if (error) redirect("/admin?error=Could%20not%20publish.%20Check%20that%20the%20slug%20is%20unique");
  revalidatePath("/");
  redirect("/admin?message=Published%20successfully");
}
