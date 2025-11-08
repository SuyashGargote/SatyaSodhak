import os
import httpx
from bs4 import BeautifulSoup
import openai
import json
import asyncio

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_KEY

async def web_search(query, k=5):
    """Call chosen web search API (BING or SERPAPI). Returns list of dict(url,title,snippet)."""
    provider = os.getenv("WEB_SEARCH_PROVIDER", "BING")
    key = os.getenv("WEB_SEARCH_API_KEY")
    results = []
    if provider == "BING":
        url = "https://api.bing.microsoft.com/v7.0/search"
        headers = {"Ocp-Apim-Subscription-Key": key}
        params = {"q": query, "count": k, "textDecorations": False, "textFormat": "Raw"}
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.get(url, headers=headers, params=params)
            data = r.json()
            webPages = data.get("webPages", {}).get("value", [])
            for w in webPages:
                results.append({"url": w.get("url"), "title": w.get("name"), "snippet": w.get("snippet")})
    else:
        # SERPAPI fallback
        url = "https://serpapi.com/search"
        params = {"q": query, "api_key": key, "engine": "google", "num": k}
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.get(url, params=params)
            data = r.json()
            for p in data.get("organic_results", [])[:k]:
                results.append({"url": p.get("link"), "title": p.get("title"), "snippet": p.get("snippet")})
    return results

async def fetch_page_text(url):
    """Fetch page and extract main text (best-effort)."""
    async with httpx.AsyncClient(timeout=15.0) as c:
        try:
            r = await c.get(url, follow_redirects=True)
            if r.status_code != 200:
                return ""
            soup = BeautifulSoup(r.text, "html.parser")
            # remove script/style
            for s in soup(["script", "style", "noscript"]):
                s.extract()
            texts = soup.get_text(separator="\n")
            # simple heuristics: take first 1000 chars of cleaned text
            cleaned = "\n".join([line.strip() for line in texts.splitlines() if line.strip()])
            return cleaned[:5000]
        except Exception:
            return ""

def call_openai_embedding(texts, model="text-embedding-3-large"):
    """Return embeddings (list of floats) for a list of strings."""
    resp = openai.Embeddings.create(model=model, input=texts)
    return [r["embedding"] for r in resp["data"]]

def call_openai_completion(prompt, model="gpt-4o-mini", max_tokens=256):
    resp = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0
    )
    return resp.choices[0].message["content"]
