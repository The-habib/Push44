#!/usr/bin/env python3
"""
Telegram Bot bridge powered by Google Antigravity Python SDK.

Listens for messages on Telegram, sends prompts to the Antigravity Agent,
and replies with the Agent's responses back to the user on Telegram.

Usage:
  export TELEGRAM_BOT_TOKEN="<YOUR_BOT_TOKEN>"
  python3 scripts/telegram_agent_bot.py
"""

import os
import sys
import asyncio
import logging
from typing import List

# Setup logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

try:
    from telegram import Update
    from telegram.ext import (
        Application,
        CommandHandler,
        MessageHandler,
        ContextTypes,
        filters,
    )
except ImportError:
    print("Error: python-telegram-bot is required. Install it using:")
    print("  pip install python-telegram-bot")
    sys.exit(1)

try:
    from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
except ImportError:
    print("Error: google-antigravity SDK is required. Install it using:")
    print("  pip install google-antigravity")
    sys.exit(1)

# Retrieve token from environment
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

TELEGRAM_MAX_MESSAGE_LENGTH = 4000


def split_message(text: str, max_length: int = TELEGRAM_MAX_MESSAGE_LENGTH) -> List[str]:
    """Splits text into chunks that fit within Telegram's max message limit."""
    if len(text) <= max_length:
        return [text]
    
    chunks = []
    while text:
        if len(text) <= max_length:
            chunks.append(text)
            break
        # Look for a newline to split cleanly
        split_idx = text.rfind("\n", 0, max_length)
        if split_idx == -1:
            # Look for a space if no newline
            split_idx = text.rfind(" ", 0, max_length)
        if split_idx == -1:
            split_idx = max_length
        
        chunks.append(text[:split_idx])
        text = text[split_idx:].lstrip()
    return chunks


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles the /start command."""
    welcome_text = (
        "🤖 *Antigravity Agent Bot Connected*\n\n"
        "Send me any prompt or task, and I will generate a response using the Google Antigravity SDK."
    )
    if update.effective_chat:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=welcome_text,
            parse_mode="Markdown",
        )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles incoming user messages and generates agent responses."""
    if not update.message or not update.message.text:
        return

    chat_id = update.effective_chat.id
    user_prompt = update.message.text

    logger.info("Received prompt from chat %s: %s", chat_id, user_prompt)
    
    # Notify user that processing has started
    status_msg = await context.bot.send_message(
        chat_id=chat_id,
        text="⏳ *Agent is processing...*",
        parse_mode="Markdown",
    )

    try:
        config = LocalAgentConfig(
            system_instructions=(
                "You are an expert AI software engineering assistant. "
                "Provide clear, concise, well-structured, and helpful answers."
            ),
            capabilities=CapabilitiesConfig(),
        )

        async with Agent(config) as agent:
            response = await agent.chat(user_prompt)

            tokens = []
            async for token in response:
                tokens.append(token)

            full_reply = "".join(tokens).strip()

            if not full_reply:
                full_reply = "(Empty response received from agent)"

            # Split into chunks if output exceeds Telegram length limit
            chunks = split_message(full_reply)
            
            # Delete status message
            try:
                await context.bot.delete_message(chat_id=chat_id, message_id=status_msg.message_id)
            except Exception:
                pass

            # Send chunks
            for chunk in chunks:
                await context.bot.send_message(
                    chat_id=chat_id,
                    text=chunk,
                )

    except Exception as e:
        logger.error("Error processing agent response: %s", str(e), exc_info=True)
        try:
            await context.bot.edit_message_text(
                chat_id=chat_id,
                message_id=status_msg.message_id,
                text=f"⚠️ *Error processing request:*\n`{str(e)}`",
                parse_mode="Markdown",
            )
        except Exception:
            await context.bot.send_message(
                chat_id=chat_id,
                text=f"⚠️ *Error processing request:*\n`{str(e)}`",
                parse_mode="Markdown",
            )


def main():
    if not BOT_TOKEN:
        print("ERROR: TELEGRAM_BOT_TOKEN environment variable is not set.")
        print("Set it before running: export TELEGRAM_BOT_TOKEN='<YOUR_TOKEN>'")
        sys.exit(1)

    print("Starting Antigravity Telegram Bot...")
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Bot is polling for messages. Press Ctrl+C to stop.")
    application.run_polling()


if __name__ == "__main__":
    main()
