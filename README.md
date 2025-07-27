# GitHub Star Bot

Automated bot for starring GitHub repositories.

## Quick Start

```bash
npm install
npm run setup
npm start
```

## Configuration

Create `.env` file:

```env
GITHUB_TOKEN=your_token_here
REPOSITORIES=owner/repo1,owner/repo2
STAR_INTERVAL=2
MODE=star
```

## Usage

```bash
# Star repositories
npm start

# Check star status
npm run check

# Remove stars
npm run unstar
```

## Modes

- `star` - Add stars to repositories
- `unstar` - Remove stars from repositories
- `check` - Check current star status

## Token Setup

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scope: `public_repo`
4. Copy token to `.env` file

## Commands

```bash
npm run setup      # Interactive configuration
npm run validate   # Validate configuration
npm run diagnose   # Diagnose token permissions
```

## Rate Limits

- 5,000 requests/hour for authenticated users
- Built-in interval control to prevent rate limiting
- Automatic retry with exponential backoff

## License

MIT
