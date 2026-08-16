#!/usr/bin/env python3
"""
Antigravity Lifecycle Hook: Clean Telegram Delivery for Agent Responses.

Features:
- Paragraph-aware chunking (preserves sentences and code blocks).
- Clean whitespace and markdown formatting.
- Robust delivery with timeout handling.
"""

import sys
import json
import os
import re
import urllib.request
import urllib.parse

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8411625796:AAG8QVCeF0NiDvksgnfakbQ52qDewmcQ5wE")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "1550319630")
MAX_TELEGRAM_LEN = 3900


def clean_text(text: str) -> str:
    """Cleans up internal artifacts and formats response text."""
    if not text:
        return ""
    # Strip unnecessary trailing/leading whitespace
    text = text.strip()
    return text


def split_into_clean_chunks(text: str, max_length: int = MAX_TELEGRAM_LEN) -> list[str]:
    """Splits text at natural paragraph/line boundaries to keep messages readable."""
    if len(text) <= max_length:
        return [text]

    chunks = []
    current_chunk = []
    current_length = 0

    lines = text.splitlines(keepends=True)
    for line in lines:
        line_len = len(line)
        if current_length + line_len > max_length:
            if current_chunk:
                chunks.append("".join(current_chunk).strip())
                current_chunk = []
                current_length = 0
            
            # If a single line exceeds max_length, split by space
            if line_len > max_length:
                words = line.split(" ")
                for word in words:
                    if current_length + len(word) + 1 > max_length:
                        chunks.append("".join(current_chunk).strip())
                        current_chunk = [word + " "]
                        current_length = len(word) + 1
                    else:
                        current_chunk.append(word + " ")
                        current_length += len(word) + 1
            else:
                current_chunk.append(line)
                current_length += line_len
        else:
            current_chunk.append(line)
            current_length += line_len

    if current_chunk:
        chunk_str = "".join(current_chunk).strip()
        if chunk_str:
            chunks.append(chunk_str)

    return chunks


def send_telegram_message(token: str, chat_id: str, text: str):
    """Sends clean, chunked messages to Telegram."""
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    cleaned = clean_text(text)
    if not cleaned:
        return

    chunks = split_into_clean_chunks(cleaned)
    for chunk in chunks:
        payload = {
            "chat_id": chat_id,
            "text": chunk,
            "disable_web_page_preview": True,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Antigravity-Hook/1.0",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                pass
        except Exception as e:
            sys.stderr.write(f"[Telegram Hook] Delivery error: {e}\n")


def get_last_model_response(transcript_path: str) -> str | None:
    """Extracts the latest model response from transcript.jsonl."""
    if not transcript_path or not os.path.exists(transcript_path):
        return None

    last_response = None
    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if entry.get("source") == "MODEL" and entry.get("content"):
                        last_response = entry["content"]
                except json.JSONDecodeError:
                    continue
    except Exception as e:
        sys.stderr.write(f"[Telegram Hook] Transcript error: {e}\n")

    return last_response


def main():
    try:
        input_data = json.load(sys.stdin)
    except Exception:
        input_data = {}

    transcript_path = input_data.get("transcriptPath")
    if not transcript_path and "artifactDirectoryPath" in input_data:
        candidate = os.path.join(
            os.path.dirname(input_data["artifactDirectoryPath"]),
            ".system_generated",
            "logs",
            "transcript.jsonl",
        )
        if os.path.exists(candidate):
            transcript_path = candidate

    if transcript_path:
        response_text = get_last_model_response(transcript_path)
        if response_text and BOT_TOKEN and CHAT_ID:
            send_telegram_message(BOT_TOKEN, CHAT_ID, response_text)

    # Clean exit for Antigravity hook engine
    print(json.dumps({}))
    sys.exit(0)


if __name__ == "__main__":
    main()
