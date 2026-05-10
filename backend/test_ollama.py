import asyncio
import httpx
import json

async def test_ollama():
    url = "http://127.0.0.1:11434/api/generate"
    payload = {
        "model": "phi3",
        "prompt": "Hello",
        "stream": False
    }
    print(f"Testing connection to {url} with model 'phi3'...")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ollama())
