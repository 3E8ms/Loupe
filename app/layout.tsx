import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "./lib/auth";
import { logout } from "./lib/actions";

export const metadata: Metadata = { title: "Loupe", description: "A small photo-sharing app" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="top-in">
            <Link href="/" className="brand"><span className="lens" aria-hidden="true" />Loupe</Link>
            <nav className="tabs">
              <Link className="tab" href="/">Feed</Link>
              <Link className="tab" href="/explore">Explore</Link>
              {me && <Link className="tab" href={`/u/${me.username}`}>Profile</Link>}
            </nav>
            {me ? (
              <>
                <Link className="share-btn" href="/new">+ Share</Link>
                <form action={logout}><button className="tab" type="submit">Log out</button></form>
              </>
            ) : (
              <Link className="share-btn" href="/login">Log in</Link>
            )}
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
