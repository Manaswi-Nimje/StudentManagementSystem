# Deployment guide

You said you want to keep Oracle. Oracle doesn't have a "click to deploy, free
forever" managed database on most PaaS hosts, but **Oracle Cloud Infrastructure
(OCI) itself has an Always Free tier** that's a genuinely good fit here — free
compute and free Oracle database, indefinitely, not just a trial. Below are two
ways to use it, plus notes on push-button hosts if you change your mind on
the database later.

---

## Option A — one Always Free VM, everything on it (simplest)

Runs the whole stack (Oracle XE + API + web) on a single free OCI compute
instance via the `docker-compose.yml` already in this repo.

1. **Create an OCI account** at [cloud.oracle.com](https://cloud.oracle.com) —
   the Always Free tier needs a card for verification but won't charge you as
   long as you stay on Always Free-eligible resources.
2. **Create a compute instance**: Compute → Instances → Create Instance.
   Pick an "Always Free eligible" shape (either the `VM.Standard.E2.1.Micro`
   AMD shape, or an Ampere A1 ARM shape — A1 gives you more free CPU/RAM).
   Choose Ubuntu as the image. Add your SSH key.
3. **Open ports**: in the instance's attached Virtual Cloud Network (VCN),
   edit the security list to allow ingress on `80` (frontend) and `8080`
   (API), in addition to `22` (SSH). OCI instances also run a local firewall
   (`iptables`/`firewalld`) — you'll need to open the same ports there too:
   ```bash
   sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
   sudo netfilter-persistent save   # or: sudo apt install iptables-persistent
   ```
4. **SSH in and install Docker**:
   ```bash
   ssh ubuntu@<your-instance-ip>
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER
   sudo apt install -y docker-compose-plugin
   ```
5. **Get the code onto the VM** — push this project to a GitHub repo, then:
   ```bash
   git clone https://github.com/<you>/<your-repo>.git
   cd <your-repo>/StudentManagementSystem
   cp .env.example .env    # edit with real credentials
   docker compose up -d --build
   ```
6. Visit `http://<your-instance-ip>` for the app and
   `http://<your-instance-ip>:8080/swagger-ui.html` for the API docs.

**Optional but recommended:** point a free domain (e.g. via
[DuckDNS](https://www.duckdns.org)) at the instance IP, then put
[Caddy](https://caddyserver.com/) or nginx + Let's Encrypt in front for HTTPS.
Interview panels notice `https://` and a real domain.

---

## Option B — split hosting (Oracle Cloud for DB + backend, Vercel/Netlify for frontend)

Gives you a CDN-backed frontend with near-instant global loads, which is the
more typical modern setup and a good talking point in interviews.

**Database + API**, on the same OCI Always Free VM as Option A steps 1–4, but
only run `db` and `backend` from the compose file:
```bash
docker compose up -d --build db backend
```

**Frontend**, on Vercel:
1. Push the repo to GitHub.
2. In Vercel: New Project → import the repo → set **Root Directory** to
   `StudentManagementSystem/frontend`.
3. Before deploying (or via the Vercel dashboard's build settings), set the
   backend URL: edit `frontend/src/environments/environment.prod.ts` and set
   `apiBase` to `http://<your-instance-ip>:8080/api` (or your domain), commit,
   and push — Vercel redeploys automatically.
4. On the backend, set `CORS_ALLOWED_ORIGINS` to your Vercel URL
   (e.g. `https://your-app.vercel.app`) so the browser is allowed to call it.
5. Set `JWT_SECRET` on the backend to a long random string (e.g.
   `openssl rand -base64 48`) — this signs the login tokens issued by
   `/api/auth/login` and `/api/auth/register`. Don't ship the dev default.

Netlify works the same way — root directory `frontend`, build command
`npm run build`, publish directory `dist/StudentProject/browser`.

---

## If you ever reconsider the database

Render, Railway, and Fly.io all offer easy free/cheap Postgres and one-click
Docker deploys for the backend — this project's Docker/env-var setup already
works with any database once the JDBC URL and dialect are swapped (only
`pom.xml`'s Oracle driver, `application.properties`, and the Oracle-specific
`ROWNUM` pagination query in `StudentServiceImpl` would need to change).
Worth knowing about even if you stay on Oracle for now.

---

## Checklist before you call it "live"

- [ ] `CORS_ALLOWED_ORIGINS` on the backend matches your real frontend URL
- [ ] `JWT_SECRET` on the backend is a real random secret, not the dev default
- [ ] `environment.prod.ts` on the frontend points at your real backend URL
- [ ] `DDL_AUTO` left as `update` is fine for a demo/portfolio project; if you
      later add real users' data, switch to `validate` and manage schema
      changes with a migration tool (Flyway)
- [ ] Database password isn't the default `student123`
- [ ] HTTPS is set up if you're sharing the link publicly (e.g. on a resume)
