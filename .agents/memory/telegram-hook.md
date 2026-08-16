# Antigravity Telegram Bot Response Forwarding

## Summary
The Antigravity agent lifecycle is configured with a `Stop` hook in `.agents/hooks.json` to automatically forward all completed assistant responses to the user's Telegram bot.

## Configuration
- **Hook Config**: `.agents/hooks.json` (`telegram-notifier` on `Stop` event)
- **Script**: `.agents/scripts/send_to_telegram.py`
- **Bot Token**: `8411625796:AAG8QVCeF0NiDvksgnfakbQ52qDewmcQ5wE` (`@truemadadbot`)
- **Chat ID**: `1550319630` (`@Mrr_True`)

## Execution
- Triggered automatically at the end of each agent execution cycle.
- Uses Python standard library `urllib` (no pip dependencies required).
- Implements paragraph-aware chunking and clean text formatting for Telegram delivery.
