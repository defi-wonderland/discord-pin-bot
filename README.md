# Discord Pin Bot

A Discord bot that adds pin/unpin functionality through context menu commands.

## Local Development

### Prerequisites
- Node.js 20+
- pnpm
- Discord Bot Token

### Setup
```bash
# Install dependencies
pnpm install

# Create .env with your Discord token
echo "DISCORD_TOKEN=your_token_here" > .env

# Run locally
pnpm dev
```

## Deployment

1. Configure GitHub repository:
   - Secrets:
     - `AWS_ROLE_ARN`: IAM role for GitHub Actions
     - `DISCORD_TOKEN`: Discord bot token
   - Variables:
     - `AWS_SUBNET_ID`: Public subnet ID
     - `AWS_SECURITY_GROUP_ID`: Security group ID

2. Deploy:
   - Automatic on push to main
   - Manual via GitHub Actions

3. Cleanup:
   - Use "Cleanup AWS Resources" workflow in GitHub Actions

## Usage

1. Right-click any message
2. Apps → "Pin Message" or "Unpin Message"