"""Thin wrapper around the Groq client so trading_agent and risk_agent don't
each duplicate client setup and JSON-mode parsing."""

import json
import os
from functools import lru_cache

from groq import Groq

DEFAULT_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")


@lru_cache
def get_client() -> Groq:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set -- required to call the trading/risk agent LLMs.")
    return Groq(api_key=api_key)


def chat_json(system_prompt: str, user_prompt: str, model: str = None) -> dict:
    """Calls the chat completion API in JSON mode and parses the result.
    Raises if the model doesn't return valid JSON -- callers should not
    silently fall back to a fabricated decision."""
    client = get_client()
    response = client.chat.completions.create(
        model=model or DEFAULT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    content = response.choices[0].message.content
    return json.loads(content)
