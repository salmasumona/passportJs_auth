# Deployment Checklist

## MongoDB Atlas

- Create an Atlas cluster and database user.
- Add your local IP for local testing.
- For EC2, configure Atlas Network Access to allow the EC2 server's outbound public IP (or the appropriate secured network range).
- Use the `mongodb+srv://` URI in `.env`.

## EC2

1. Launch Ubuntu 22.04/24.04.
2. Attach an Elastic IP.
3. Security group: SSH 22 from your IP; HTTP 80 and HTTPS 443 from the internet.
4. Clone the repository and run `sudo bash scripts/setup-ec2.sh`.
5. Set `/var/www/passportJs_auth/.env` with Atlas URI, `APP_URL`, `SESSION_SECRET`, and `NODE_ENV=production`.
6. Run `./scripts/deploy.sh`.

## NGINX + TLS

Edit `/etc/nginx/sites-available/passport-auth` and replace `YOUR_DOMAIN` with your DNS name.

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

## GitHub Actions secrets

Create these repository Actions secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_PORT` (optional)

The workflow deploys the `master` branch after the syntax check passes.

## Verification

```bash
pm2 status
pm2 logs passport-auth
curl http://127.0.0.1:1800/health
curl -I https://YOUR_DOMAIN
```

Do not put MongoDB passwords, session secrets, or private SSH keys in the repository.
