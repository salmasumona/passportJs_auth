#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/cloudwatch/setup-cloudwatch-agent.sh"
  exit 1
fi

APP_DIR="${APP_DIR:-/var/www/passportJs_auth}"
AWS_REGION="${AWS_REGION:-$(curl -sS --max-time 2 http://169.254.169.254/latest/meta-data/placement/region || true)}"
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
ARCH="$(dpkg --print-architecture)"

case "$ARCH" in
  amd64) PACKAGE_ARCH="amd64" ;;
  arm64) PACKAGE_ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

DEB_URL="https://amazoncloudwatch-agent-${AWS_REGION}.s3.${AWS_REGION}.amazonaws.com/ubuntu/${PACKAGE_ARCH}/latest/amazon-cloudwatch-agent.deb"
TMP_DEB="/tmp/amazon-cloudwatch-agent.deb"

apt-get update
apt-get install -y curl wget
wget -q "$DEB_URL" -O "$TMP_DEB"
dpkg -i -E "$TMP_DEB" || apt-get install -f -y

mkdir -p /opt/aws/amazon-cloudwatch-agent/etc
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<CONFIG
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "metrics": {
    "namespace": "PassportAuth/EC2",
    "append_dimensions": {
      "InstanceId": "\${aws:InstanceId}"
    },
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_active", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
        "metrics_collection_interval": 60,
        "totalcpu": true
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["/"]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ubuntu/.pm2/logs/passport-auth-out.log",
            "log_group_name": "/passport-auth/pm2/out",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "/home/ubuntu/.pm2/logs/passport-auth-error.log",
            "log_group_name": "/passport-auth/pm2/error",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/passport-auth/nginx/access",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/passport-auth/nginx/error",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          }
        ]
      }
    }
  }
}
CONFIG

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s

systemctl enable amazon-cloudwatch-agent
systemctl restart amazon-cloudwatch-agent
systemctl --no-pager --full status amazon-cloudwatch-agent

echo "CloudWatch Agent configured for region: $AWS_REGION"
echo "Ensure the EC2 instance has an IAM role containing CloudWatchAgentServerPolicy."
