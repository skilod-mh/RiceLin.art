import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publishPost } from "@/app/admin/actions";
import { signOut } from "@/app/actions";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <main className="shell" style={{ paddingTop: 38, paddingBottom: 70, maxWidth: 850 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div><Link href="/" className="muted">← RiceLin</Link><h1 style={{ fontSize: 32, fontWeight: 850, margin: "12px 0 0" }}>Admin studio</h1></div>
        <form action={signOut}><button className="btn-secondary" type="submit">Sign out</button></form>
      </div>
      <p className="muted" style={{ lineHeight: 1.7 }}>Publish tutorials and complete desktop setups. Only verified admin accounts can access this page.</p>
      {params.error && <p role="alert" style={{ color: "#fca5a5" }}>{params.error}</p>}
      {params.message && <p role="status" style={{ color: "#86efac" }}>{params.message}</p>}
      <form action={publishPost} className="panel" style={{ padding: 22, display: "grid", gap: 15, marginTop: 24 }}>
        <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Create a post</h2>
        <label>Title<input className="field" name="title" required minLength={5} maxLength={120} placeholder="e.g. Build a beautiful Kitty terminal" style={{ display: "block", marginTop: 7 }} /></label>
        <label>URL slug<input className="field" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="beautiful-kitty-terminal" style={{ display: "block", marginTop: 7 }} /><span className="muted" style={{ fontSize: 12 }}>Lowercase letters, numbers, and hyphens only.</span></label>
        <label>Short description<input className="field" name="excerpt" maxLength={280} placeholder="What will the reader learn?" style={{ display: "block", marginTop: 7 }} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <label>Post type<select className="field" name="kind" defaultValue="tutorial" style={{ display: "block", marginTop: 7 }}><option value="tutorial">Tutorial</option><option value="rice">Rice / desktop setup</option></select></label>
          <label>Difficulty<select className="field" name="difficulty" defaultValue="beginner" style={{ display: "block", marginTop: 7 }}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
        </div>
        <label>Content<textarea className="field" name="body" required minLength={20} maxLength={50000} rows={12} placeholder={"Write the guide here. You can include shell commands as plain text, for example:\n\n# Arch Linux\nsudo pacman -S kitty\n\nExplain each command and list any risks."} style={{ display: "block", marginTop: 7, resize: "vertical", lineHeight: 1.6 }} /></label>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>Safety: explain commands before readers run them. Do not publish opaque scripts, destructive commands, or commands requiring root privileges without clear warnings and recovery steps.</p>
        <button className="btn-primary" type="submit">Publish post ↗</button>
      </form>
    </main>
  );
}
