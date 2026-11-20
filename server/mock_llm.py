"""Tiny OpenAI-compatible mock used only to test the model pipeline locally."""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

ANSWER = "印尼的代表菜是炒饭、仁当牛肉 [S1]，街头常见沙爹和炸豆腐 [S2]。"


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        self.rfile.read(length)
        body = {
            "id": "mock-1",
            "object": "chat.completion",
            "model": "mock-llm",
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": ANSWER},
                    "finish_reason": "stop",
                }
            ],
            "usage": {"prompt_tokens": 100, "completion_tokens": 30},
        }
        data = json.dumps(body).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8200), Handler).serve_forever()
