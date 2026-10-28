import Link from "next/link";
import { signIn, signUp } from "@/app/actions";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <main className="shell" style={{ paddingTop: 72, paddingBottom: 90, maxWidth: 540 }}>
      <Link href="/" className="muted">← Back to RiceLin</Link>
      <div className="panel" style={{ padding: 28, marginTop: 22 }}>
        <div className="brand-mark">R</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "18px 0 8px" }}>Join the rice revolution.</h1>
        <p className="muted" style={{ marginTop: 0 }}>Sign in or create an account to join the RiceLin community.</p>
        {params.error && <p role="alert" style={{ color: "#fca5a5" }}>{params.error}</p>}
        {params.message && <p role="status" style={{ color: "#86efac" }}>{params.message}</p>}
        <form action={signIn} style={{ display: "grid", gap: 12, marginTop: 22 }}>
          <label>Email<input className="field" type="email" name="email" autoComplete="email" required style={{ display: "block", marginTop: 7 }} /></label>
          <label>Password<input className="field" type="password" name="password" autoComplete="current-password" required style={{ display: "block", marginTop: 7 }} /></label>
          <button className="btn-primary" type="submit">Sign in</button>
        </form>
        <div style={{ borderTop: "1px solid #292a36", margin: "24px 0" }} />
        <h2 style={{ fontSize: 18, fontWeight: 750 }}>New to RiceLin?</h2>
        <form action={signUp} style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <label>Email<input className="field" type="email" name="email" autoComplete="email" required style={{ display: "block", marginTop: 7 }} /></label>
          <label>Password <span className="muted">(at least 10 characters)</span><input className="field" type="password" name="password" autoComplete="new-password" minLength={10} required style={{ display: "block", marginTop: 7 }} /></label>
          <button className="btn-secondary" type="submit">Create account</button>
        </form>
      </div>
    </main>
  );
}
