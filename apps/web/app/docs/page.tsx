import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs",
  description: "Freebase documentation: widget setup, API keys, webhooks, and changelog.",
};

const sections = [
  { id: "widget", label: "Widget Setup" },
  { id: "api-keys", label: "API Keys" },
  { id: "webhooks", label: "Webhooks" },
  { id: "changelog", label: "Changelog" },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--surface-raised)] border border-[var(--border)] px-1.5 py-0.5 text-xs font-mono text-[var(--text-secondary)]">
      {children}
    </code>
  );
}

function CodeBlock({ children, lang = "" }: { children: string; lang?: string }) {
  return (
    <pre className={`language-${lang} overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-xs font-mono text-[var(--text-secondary)] leading-relaxed`}>
      <code>{children.trim()}</code>
    </pre>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 text-lg font-semibold text-[var(--text-primary)] scroll-mt-24">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 text-sm font-semibold text-[var(--text-primary)]">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm text-[var(--text-secondary)] leading-relaxed">{children}</p>;
}

export default function DocsPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
            ← Freebase
          </Link>
          <span className="text-sm font-medium text-[var(--text-muted)]">Documentation</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl gap-10 px-6 py-10">
        {/* Sticky sidebar nav */}
        <nav className="hidden md:block w-44 shrink-0">
          <ul className="sticky top-24 space-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-[var(--radius)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-14">

          {/* Widget Setup */}
          <section>
            <SectionTitle id="widget">Widget Setup</SectionTitle>
            <P>
              Drop two script tags into your HTML to embed the feedback button, changelog popup, and roadmap panel.
              The first tag queues commands before the SDK loads; the second tag loads the SDK async.
            </P>
            <CodeBlock lang="html">{`<script>
  window.Freebase = window.Freebase || function(...a) {
    (window.Freebase.q = window.Freebase.q || []).push(a);
  };
  window.Freebase('init', { org: 'your-org-slug' });
</script>
<script src="${appUrl}/cdn/v1/sdk.js" async></script>`}</CodeBlock>

            <SubTitle>Next.js (App Router)</SubTitle>
            <P>
              Use <Code>next/script</Code> with <Code>strategy="afterInteractive"</Code> in your root layout.
              Your org must be created at <Code>/new</Code> before the widget can initialize.
            </P>
            <CodeBlock lang="tsx">{`// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="${appUrl}/cdn/v1/sdk.js"
          strategy="afterInteractive"
          onLoad={() => {
            window.Freebase?.('init', { org: 'your-org-slug' });
          }}
        />
      </body>
    </html>
  );
}`}</CodeBlock>

            <SubTitle>React (Create React App / Vite)</SubTitle>
            <P>
              Use a <Code>useEffect</Code> hook to guard against SSR and load the script once on mount.
            </P>
            <CodeBlock lang="tsx">{`import { useEffect } from "react";

export function FreebaseWidget() {
  useEffect(() => {
    window.Freebase =
      window.Freebase ||
      function (...a) {
        (window.Freebase.q = window.Freebase.q || []).push(a);
      };
    window.Freebase("init", { org: "your-org-slug" });

    const script = document.createElement("script");
    script.src = "${appUrl}/cdn/v1/sdk.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}

// Mount <FreebaseWidget /> once in your root App component`}</CodeBlock>

            <SubTitle>Identify logged-in users (optional)</SubTitle>
            <P>
              Call <Code>identify</Code> after <Code>init</Code> to tie feedback and votes to real user accounts.
              The JWT is signed server-side with your Widget Secret Key (Settings → Widget Secret Key).
            </P>
            <CodeBlock lang="js">{`
window.Freebase('identify', {
  userId: 'user_123',
  email: 'user@example.com',
  name: 'Jane Doe',
  jwt: '<server-signed-jwt>',
});
            `}</CodeBlock>

            <SubTitle>Identify in React (after login)</SubTitle>
            <CodeBlock lang="tsx">{`// Call when user auth state changes
useEffect(() => {
  if (!user) return;
  window.Freebase?.("identify", {
    userId: user.id,
    email: user.email,
    name: user.name,
    jwt: user.freebaseJwt, // server-signed JWT
  });
}, [user]);`}</CodeBlock>

            <SubTitle>Signing the JWT (Node.js)</SubTitle>
            <CodeBlock lang="js">{`
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    name: user.name,
    orgSlug: 'your-org-slug',  // must match your org's URL slug
  },
  process.env.FREEBASE_WIDGET_SECRET,
  { expiresIn: '1h' }
);

// Pass token to the frontend and call window.Freebase('identify', { jwt: token })
            `}</CodeBlock>

            <SubTitle>Widget API</SubTitle>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Command</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    ["init({ org })", "Initialize the widget. Required first call."],
                    ["identify({ userId, email, name, jwt })", "Associate the current user. JWT from your backend."],
                    ["open('feedback')", "Programmatically open the feedback panel."],
                    ["open('changelog')", "Programmatically open the changelog popup."],
                    ["open('roadmap')", "Programmatically open the roadmap panel."],
                    ["getUnreadCount(callback)", "Get count of unread changelog entries (uses localStorage)."],
                  ].map(([cmd, desc]) => (
                    <tr key={cmd}>
                      <td className="px-4 py-2.5 font-mono text-[var(--text-secondary)]">{cmd}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* API Keys */}
          <section>
            <SectionTitle id="api-keys">API Keys</SectionTitle>
            <P>
              Create API keys in Settings → API Keys. Keys use the format <Code>fb_live_xxx</Code> and
              provide full admin access to your org via the REST API. Use them in server-side code only,
              never in browser or mobile clients.
            </P>
            <CodeBlock lang="bash">{`# List feedback posts
curl -H "Authorization: Bearer fb_live_xxx" \\
  ${appUrl}/api/v1/orgs/your-org/posts

# Create a post
curl -X POST \\
  -H "Authorization: Bearer fb_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Dark mode support","authorEmail":"user@example.com"}' \\
  ${appUrl}/api/v1/orgs/your-org/posts

# Update post status
curl -X PATCH \\
  -H "Authorization: Bearer fb_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"in-progress"}' \\
  ${appUrl}/api/v1/orgs/your-org/posts/<post-id>`}</CodeBlock>

            <SubTitle>Available endpoints</SubTitle>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Method</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Path</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    ["GET", "/api/v1/orgs/:org/posts", "List feedback posts (cursor-paginated)"],
                    ["POST", "/api/v1/orgs/:org/posts", "Create a post"],
                    ["GET", "/api/v1/orgs/:org/posts/:id", "Get a single post"],
                    ["PATCH", "/api/v1/orgs/:org/posts/:id", "Update post (status, category, pin)"],
                    ["DELETE", "/api/v1/orgs/:org/posts/:id", "Delete a post"],
                    ["GET", "/api/v1/orgs/:org/categories", "List categories"],
                    ["POST", "/api/v1/orgs/:org/categories", "Create a category"],
                    ["DELETE", "/api/v1/orgs/:org/categories/:id", "Delete a category"],
                    ["GET", "/api/v1/orgs/:org/changelog", "List changelog entries"],
                    ["POST", "/api/v1/orgs/:org/changelog", "Create a changelog entry"],
                    ["PATCH", "/api/v1/orgs/:org/changelog/:slug", "Update / publish a changelog entry"],
                    ["DELETE", "/api/v1/orgs/:org/changelog/:slug", "Delete a changelog entry"],
                    ["GET", "/api/v1/orgs/:org/roadmap", "Get roadmap items grouped by status"],
                    ["POST", "/api/v1/orgs/:org/roadmap", "Create a roadmap item"],
                    ["PATCH", "/api/v1/orgs/:org/roadmap/:id", "Update roadmap item (status, position, visible)"],
                    ["DELETE", "/api/v1/orgs/:org/roadmap/:id", "Delete a roadmap item"],
                  ].map(([method, path, desc]) => (
                    <tr key={path + method}>
                      <td className="px-4 py-2.5 font-mono text-[var(--accent)]">{method}</td>
                      <td className="px-4 py-2.5 font-mono text-[var(--text-secondary)]">{path}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Webhooks */}
          <section>
            <SectionTitle id="webhooks">Webhooks</SectionTitle>
            <P>
              Create webhooks in Settings → Webhooks. Freebase sends a signed HTTP POST to your endpoint
              whenever the selected events fire.
            </P>

            <SubTitle>Events</SubTitle>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Event</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Fires when</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    ["post.created", "A user submits new feedback"],
                    ["post.status_changed", "An admin updates the status of a post"],
                    ["comment.created", "A comment is added to a post"],
                    ["changelog.published", "A changelog entry is published (draft → published)"],
                  ].map(([event, desc]) => (
                    <tr key={event}>
                      <td className="px-4 py-2.5 font-mono text-[var(--text-secondary)]">{event}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubTitle>Request headers</SubTitle>
            <CodeBlock>{`
X-Freebase-Event: post.status_changed
X-Freebase-Signature: sha256=<hmac>
X-Freebase-Timestamp: <unix-timestamp>
            `}</CodeBlock>

            <SubTitle>Signature verification (Node.js)</SubTitle>
            <P>
              Freebase stores webhook secrets hashed. The HMAC key is <Code>SHA256(secret)</Code>,
              not the raw secret string.
            </P>
            <CodeBlock lang="js">{`
const { createHash, createHmac, timingSafeEqual } = require('crypto');

function verifyWebhook(rawBody, timestamp, signature, secret) {
  // Freebase stores secrets hashed — HMAC key is SHA-256(secret)
  const key = createHash('sha256').update(secret).digest('hex');
  const expected = 'sha256=' + createHmac('sha256', key)
    .update(\`\${timestamp}.\${rawBody}\`)
    .digest('hex');
  return timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expected, 'utf8')
  );
}

// In your Express handler:
app.post('/webhooks/freebase', express.raw({ type: '*/*' }), (req, res) => {
  const sig = req.headers['x-freebase-signature'];
  const ts  = req.headers['x-freebase-timestamp'];
  if (!verifyWebhook(req.body.toString(), ts, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = req.headers['x-freebase-event'];
  const payload = JSON.parse(req.body.toString());
  // handle event...
  res.sendStatus(200);
});
            `}</CodeBlock>

            <SubTitle>Retry policy</SubTitle>
            <P>
              Failed deliveries (non-2xx response or timeout) are retried on this schedule:
              immediately → 30 seconds → 5 minutes → 30 minutes → 2 hours. After 5 failures the delivery
              is abandoned.
            </P>
          </section>

          {/* Changelog */}
          <section>
            <SectionTitle id="changelog">Changelog</SectionTitle>

            <SubTitle>Labels</SubTitle>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Label</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Use for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    ["Feature", "Brand-new capabilities"],
                    ["Improvement", "Enhancements to existing features"],
                    ["Bug Fix", "Resolved issues"],
                    ["Announcement", "News, milestones, or meta updates"],
                  ].map(([label, desc]) => (
                    <tr key={label}>
                      <td className="px-4 py-2.5 font-medium text-[var(--text-secondary)]">{label}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubTitle>RSS feed</SubTitle>
            <P>
              Each org has a public RSS 2.0 feed at:
            </P>
            <CodeBlock>{`${appUrl}/{your-org-slug}/changelog/rss.xml`}</CodeBlock>
          </section>

        </main>
      </div>
    </div>
  );
}
