# Deploying MM26 to Production

Target stack: **Vercel** (Next.js host) + **Neon** (Postgres) + **Resend** (email).

You'll end up with a live URL like `mm26.vercel.app` that anyone can use.

---

## 1. Push the code to GitHub

If you haven't already, initialize a repo and push it. From the `MM26` folder:

```bash
git init
git add -A
git commit -m "Initial commit"
gh repo create mm26 --private --source=. --push
# Or if you don't have the GitHub CLI installed:
# create an empty repo at https://github.com/new, then:
#   git remote add origin git@github.com:YOUR_USERNAME/mm26.git
#   git branch -M main
#   git push -u origin main
```

The repo can be **private** — Vercel can read private repos once you connect your GitHub account.

---

## 2. Create a Neon Postgres database

1. Sign up at https://neon.tech (free).
2. Create a project named `mm26`, default branch `main`, default region near you.
3. From the dashboard, copy the **pooled connection string** under "Connection details". It will look like:
   ```
   postgresql://USER:PASS@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Recommended: in Neon's "Roles & databases", rename or create a database called `mm26` (instead of the default `neondb`) and adjust the URL accordingly.

Keep this URL handy — you'll paste it into Vercel in step 4.

---

## 3. Create a Resend account for email

1. Sign up at https://resend.com.
2. Create an API key (Dashboard → API Keys → Create). Copy it — starts with `re_`.
3. You can send from `onboarding@resend.dev` immediately without verifying a domain. To use your own domain later, add a DNS record on your domain and verify it in Resend.

---

## 4. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo you just created.
2. **Framework Preset:** Next.js (auto-detected).
3. **Build Command:** leave default. (Our `package.json` already runs `prisma migrate deploy && next build`.)
4. **Install Command:** leave default. (`npm install` will trigger `postinstall: prisma generate`.)
5. **Environment Variables** — add these (mark each for Production, Preview, Development):

   | Name                | Value                                                                     |
   | ------------------- | ------------------------------------------------------------------------- |
   | `DATABASE_URL`      | (the Neon pooled URL from step 2, with `sslmode=require`)                 |
   | `AUTH_SECRET`       | generate locally with: `openssl rand -base64 32`                          |
   | `AUTH_TRUST_HOST`   | `true`                                                                    |
   | `SMTP_HOST`         | `smtp.resend.com`                                                         |
   | `SMTP_PORT`         | `465`                                                                     |
   | `SMTP_SECURE`       | `true`                                                                    |
   | `SMTP_USER`         | `resend`                                                                  |
   | `SMTP_PASS`         | your Resend API key (`re_…`)                                              |
   | `MAIL_FROM`         | `MM26 <onboarding@resend.dev>`                                            |

6. Click **Deploy**. The first build will:
   - install dependencies → `postinstall` generates the Prisma client
   - run `prisma migrate deploy` to apply migrations to Neon
   - build Next.js

The deploy takes ~2–3 minutes. When it finishes you'll see a `https://mm26-xxxx.vercel.app` URL.

---

## 5. Seed production (optional)

The seed script is destructive (it wipes the DB), so it's **not** run automatically. If you want demo data in prod for screenshots/demos, run it once from your laptop pointed at Neon:

```bash
# CAUTION: this wipes the prod database.
DATABASE_URL="<your Neon URL>" npm run db:seed
```

For a real launch, skip this step and have your first user sign up through the live site.

---

## 6. Smoke test

Open your Vercel URL and walk through:

1. **Home page** — list of tournaments loads (empty if you skipped seeding).
2. **Sign up** — create an account. You should:
   - get redirected to `/dashboard`
   - receive a welcome email in your inbox (check Resend's "Emails" log if it doesn't arrive)
3. **Log out** and log back in.
4. (If seeded) Open a tournament and click **Register** for a singles draw — you should get a confirmation email.

If any step fails, the **Vercel → Deployments → (your deploy) → Functions logs** are the first place to look.

---

## 7. After launch

A few things you'll likely want next:

- **Custom domain** — add it in Vercel → Settings → Domains. Auth.js will keep working as long as `AUTH_TRUST_HOST=true` is set.
- **Verified email domain** — verify your domain in Resend so emails come from `noreply@yourdomain.com` instead of `onboarding@resend.dev`. Then update `MAIL_FROM`.
- **Auth.js hardening** — at minimum: rate-limit login attempts and add email verification (the spec mentions it). Today the API just sends a welcome email; gating login on email click is a small follow-up.
- **Production logging** — consider Logflare or Axiom for searchable Vercel logs.
- **Backups** — Neon snapshots daily on the free tier; for paying tiers, set up point-in-time recovery.

---

## Troubleshooting

**Build fails on `prisma migrate deploy`**
- Usually means `DATABASE_URL` is unset or unreachable from Vercel. Double-check the env var, and that the URL includes `sslmode=require`.

**`PrismaClientInitializationError` in production**
- Verify `binaryTargets` includes `rhel-openssl-3.0.x` in `prisma/schema.prisma`. It does in this repo.

**Sign-in returns "UntrustedHost" on preview deploys**
- Make sure `AUTH_TRUST_HOST=true` is set for Preview, not just Production.

**Email not arriving**
- Open the Resend dashboard → Emails. If the email is logged there but didn't reach you, the user's mailbox classified it (Resend's `onboarding@resend.dev` works but can land in spam). Verify your own domain to fix this.
- If Resend has no log, check Vercel function logs — there's likely an SMTP auth error.
