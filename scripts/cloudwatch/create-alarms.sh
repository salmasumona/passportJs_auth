#!/usr/bin/env bash
set -Eeuo pipefail

AWS_REGION="${AWS_REGION:-$(aws configure get region 2>/dev/null || true)}"
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
INSTANCE_ID="${INSTANCE_ID:-$(curl -sS --max-time 2 http://169.254.169.254/latest/meta-data/instance-id || true)}"
SNS_TOPIC_ARN="${SNS_TOPIC_ARN:-}"
ALARM_PREFIX="${ALARM_PREFIX:-passport-auth}"

if [[ -z "$INSTANCE_ID" ]]; then echo "INSTANCE_ID is required."; exit 1; fi
if ! command -v aws >/dev/null 2>&1; then echo "AWS CLI is required."; exit 1; fi

COMMON=(--region "$AWS_REGION")

aws cloudwatch put-metric-alarm "${COMMON[@]}" \
  --alarm-name "${ALARM_PREFIX}-cpu-high" \
  --alarm-description "EC2 CPU above 80%" \
  --namespace AWS/EC2 --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value="$INSTANCE_ID" \
  --statistic Average --period 300 --evaluation-periods 2 \
  --threshold 80 --comparison-operator GreaterThanThreshold \
  ${SNS_TOPIC_ARN:+--alarm-actions "$SNS_TOPIC_ARN"}

aws cloudwatch put-metric-alarm "${COMMON[@]}" \
  --alarm-name "${ALARM_PREFIX}-memory-high" \
  --alarm-description "EC2 memory above 80%" \
  --namespace PassportAuth/EC2 --metric-name mem_used_percent \
  --dimensions Name=InstanceId,Value="$INSTANCE_ID" \
  --statistic Average --period 300 --evaluation-periods 2 \
  --threshold 80 --comparison-operator GreaterThanThreshold \
  ${SNS_TOPIC_ARN:+--alarm-actions "$SNS_TOPIC_ARN"}

aws cloudwatch put-metric-alarm "${COMMON[@]}" \
  --alarm-name "${ALARM_PREFIX}-disk-high" \
  --alarm-description "EC2 root disk above 80%" \
  --namespace PassportAuth/EC2 --metric-name used_percent \
  --dimensions Name=InstanceId,Value="$INSTANCE_ID",Name=path,Value=/ \
  --statistic Average --period 300 --evaluation-periods 2 \
  --threshold 80 --comparison-operator GreaterThanThreshold \
  ${SNS_TOPIC_ARN:+--alarm-actions "$SNS_TOPIC_ARN"}

echo "CloudWatch alarms created for $INSTANCE_ID in $AWS_REGION"
