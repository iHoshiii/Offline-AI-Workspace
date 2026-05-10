import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "phi-3-mini")
CHAT_DB_PATH = Path(os.getenv("CHAT_DB_PATH", BASE_DIR / "data" / "workspace.db"))

MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "10"))
STREAM_CHUNK_SIZE = int(os.getenv("STREAM_CHUNK_SIZE", "4096"))
