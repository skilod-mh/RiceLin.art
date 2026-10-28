import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CopyButton } from "@/app/components/copy-button";
import { signOut } from "@/app/actions";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  kind: "tutorial" | "rice" | "question" | "showcase";
  difficulty: string | null;
  created_at: string;
};

const examples: Post[] = [
  { id: "demo-1", title: "Build a clean terminal setup", slug: "#terminal-setup", excerpt: "A practical starting point for a fast, minimal terminal workflow.", kind: "tutorial", difficulty: "Beginner", created_at: new Date().toISOString() },
  { id: "demo-2", title: "A purple Hyprland rice", slug: "#hyprland-rice", excerpt: "Waybar, terminal colors, wallpaper, and a cohesive desktop palette.", kind: "rice", difficulty: "Intermediate", created_at: new Date().toISOString() },
  { id: "demo-3", title: "Show us your desktop", slug: "#community", excerpt: "Share your current setup and help someone discover their next idea.", kind: "showcase", difficulty: "Community", created_at: new Date().toISOString() },
];

export default async function HomePage() {
  let posts = examples;
  let configured = false;
  let currentUser: { email?: string } | null = null;

  try {
    const supabase = await createClient();
    const {
  data: { user },
} = await supabase.auth.getUser();

currentUser = user;
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,slug,excerpt,kind,difficulty,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error && data) {
      configured = true;
      posts = data as Post[];
    }
  } catch {
    // Keep the preview usable before the user configures Supabase.
  }

  return (
    <>
      <header className="topbar">
        <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 72, gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 850, fontSize: 21 }}>
            <span className="brand-mark">R</span> RiceLin
          </Link>
          <nav className="desktop-nav" style={{ display: "flex", gap: 24, fontSize: 14 }}>
            <a className="nav-link" href="#explore">Explore</a>
            <a className="nav-link" href="#tutorials">Tutorials</a>
            <a className="nav-link" href="#community">Community</a>
          </nav>
        
<div style={{ display: "flex", gap: 9, alignItems: "center" }}>
  {currentUser ? (
    <>
      <span className="muted" style={{ fontSize: 13 }}>
        {currentUser.email}
      </span>
      <form action={signOut}>
        <button className="btn-secondary" type="submit">
          Sign out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link className="btn-secondary" href="/login">
        Sign in
      </Link>
      <Link className="btn-primary" href="/login">
        Join RiceLin ↗
      </Link>
    </>
  )}
</div>

        </div>
      </header>

      <main>
        <section className="shell" style={{ paddingTop: 76, paddingBottom: 64 }}>
          <div style={{ maxWidth: 790 }}>
            <div className="tag">✦ A community for Linux customization</div>
            <h1 style={{ fontSize: "clamp(44px, 7vw, 76px)", lineHeight: 1.02, letterSpacing: "-.055em", fontWeight: 900, margin: "22px 0 18px" }}>
              Your Linux.<br /><span style={{ color: "#b7a2ff" }}>Your aesthetic.</span>
            </h1>
            <p className="muted" style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 650 }}>
              Discover beautiful desktop setups, learn the tricks behind them, and make your Linux environment feel like yours.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 25 }}>
              <a className="btn-primary" href="#explore">Explore rices <span aria-hidden="true">↗</span></a>
              <Link className="btn-secondary" href="/login">Share your setup</Link>
            </div>
            <div className="muted" style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13, marginTop: 27 }}>
              <span>◈ Themes & dotfiles</span><span>⌘ Copyable commands</span><span>◎ Community help</span>
            </div>
          </div>
        </section>

        <section id="explore" style={{ borderTop: "1px solid #242530", borderBottom: "1px solid #242530", background: "#0e0f15" }}>
          <div className="shell" style={{ paddingTop: 34, paddingBottom: 38 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", marginBottom: 22 }}>
              <div>
                <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".15em" }}>Find your next setup</div>
                <h2 style={{ fontSize: 30, letterSpacing: "-.03em", margin: "7px 0 0", fontWeight: 800 }}>Explore the rice universe</h2>
              </div>
              <span className="muted" style={{ fontSize: 13 }}>Themes · Tutorials · Setups</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))", gap: 15 }}>
              {[
                { title: "Hyprland", desc: "Animations, Waybar, window rules", icon: "◈", color: "#b7a2ff" },
                { title: "GNOME", desc: "Extensions, GTK themes, workflow", icon: "◉", color: "#8bd5ff" },
                { title: "KDE Plasma", desc: "Widgets, panels, global themes", icon: "◇", color: "#8ce6bd" },
              ].map((item) => (
                <article className="panel" key={item.title} style={{ padding: 21 }}>
                  <div style={{ color: item.color, fontSize: 28 }}>{item.icon}</div>
                  <h3 style={{ fontWeight: 800, fontSize: 18, margin: "14px 0 5px" }}>{item.title}</h3>
                  <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="tutorials" className="shell" style={{ paddingTop: 58, paddingBottom: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
            <div>
              <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".15em" }}>Fresh from the community</div>
              <h2 style={{ fontSize: 30, letterSpacing: "-.03em", margin: "7px 0 0", fontWeight: 800 }}>Latest drops</h2>
            </div>
            <span className="tag">{configured ? "Live from database" : "Preview content"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {posts.map((post) => (
              <article className="panel" key={post.id} style={{ padding: 21, display: "flex", flexDirection: "column", minHeight: 210 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span className="tag">{post.kind}</span>
                  {post.difficulty && <span className="muted" style={{ fontSize: 12 }}>{post.difficulty}</span>}
                </div>
                <h3 style={{ fontSize: 20, lineHeight: 1.3, fontWeight: 800, margin: "17px 0 8px" }}>{post.title}</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>{post.excerpt ?? "Explore this community post on RiceLin."}</p>
                <div style={{ marginTop: "auto", color: "#b7a2ff", fontSize: 13 }}>Explore guide ↗</div>
              </article>
            ))}
          </div>
        </section>

        <section id="community" className="shell" style={{ paddingBottom: 62 }}>
          <div className="panel" style={{ padding: "clamp(22px, 5vw, 40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28, alignItems: "center" }}>
            <div>
              <div className="tag">Built by Linux people</div>
              <h2 style={{ fontSize: 30, fontWeight: 850, letterSpacing: "-.03em", margin: "14px 0 8px" }}>A better rice starts with sharing.</h2>
              <p className="muted" style={{ lineHeight: 1.7 }}>Ask questions, post your desktop, share dotfiles, and help someone solve a frustrating config problem.</p>
              <Link className="btn-primary" href="/login">Join the community ↗</Link>
            </div>
            <div className="code-panel">
              <div style={{ padding: "11px 14px", borderBottom: "1px solid #343442", display: "flex", justifyContent: "space-between", color: "#a5a6b6", fontSize: 12 }}>
                <span>terminal — example only</span><span>● ● ●</span>
              </div>
              <pre><span style={{ color: "#8ce6bd" }}>❯</span> echo "Hello, RiceLin!"{"\n"}<span style={{ color: "#b7a2ff" }}>Hello, RiceLin!</span>{"\n\n"}<span style={{ color: "#8ce6bd" }}>❯</span> uname -s{"\n"}Linux</pre>
              <div style={{ padding: 12, borderTop: "1px solid #343442", display: "flex", justifyContent: "end" }}>
                <CopyButton text={'echo "Hello, RiceLin!"'} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid #252631" }}>
        <div className="shell" style={{ paddingTop: 24, paddingBottom: 28, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 800 }}>RiceLin <span className="muted" style={{ fontWeight: 400 }}>— Rice your Linux.</span></span>
          <span className="muted" style={{ fontSize: 13 }}>Made for people who love customizing Linux.</span>
        </div>
      </footer>
    </>
  );
}
