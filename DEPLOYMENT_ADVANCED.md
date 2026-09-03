# Advanced CI/CD + CloudWatch + Rollback

## CI/CD flow
1. Push to `master`.
2. GitHub Actions installs dependencies.
3. Syntax check runs.
4. Tests run.
5. `npm audit --audit-level=high` runs.
6. Production deployment runs over SSH.
7. The server records the previous Git SHA.
8. The new SHA is deployed.
9. PM2 restarts the application.
10. `/health` is retried for up to 60 seconds.
11. If health fails, the server automatically restores the previous SHA and restarts PM2.

## CloudWatch
The project includes `scripts/cloudwatch/setup-cloudwatch-agent.sh`.
It collects CPU, memory, disk, PM2 logs, and NGINX logs.

Before running it, attach an EC2 IAM role containing `CloudWatchAgentServerPolicy`.
Then:

```bash
cd /var/www/passportJs_auth
sudo AWS_REGION=ap-southeast-1 bash scripts/cloudwatch/setup-cloudwatch-agent.sh
```

Install AWS CLI if you want to create alarms from the included script. Then:

```bash
AWS_REGION=ap-southeast-1 INSTANCE_ID=i-xxxxxxxxxxxxxxxxx \
  bash scripts/cloudwatch/create-alarms.sh
```

Optional SNS notifications:

```bash
SNS_TOPIC_ARN=arn:aws:sns:REGION:ACCOUNT:TOPIC \
AWS_REGION=ap-southeast-1 INSTANCE_ID=i-xxxxxxxxxxxxxxxxx \
bash scripts/cloudwatch/create-alarms.sh
```

## Manual rollback
The last successful deployment records the previous SHA in `/var/lib/passport-auth-deploy/previous_sha`.

```bash
cd /var/www/passportJs_auth
sudo bash scripts/rollback.sh
```

Or specify an exact known-good commit:

```bash
sudo bash scripts/rollback.sh <GOOD_GIT_SHA>
```

## Important
- The `.env` file is preserved on the server and is not overwritten by Git.
- The deployment lock prevents two deployments from running at the same time.
- Automatic rollback is based on the Git commit that was running before deployment.
- For zero-downtime or multi-instance deployment, move later to an ALB + Auto Scaling architecture.
