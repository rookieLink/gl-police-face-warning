---
description: "Kill existing Flask process, restart API server, and verify endpoint health"
---

# Flask API Restart + Test

Restarts the Flask backend API and runs a quick health check.

## Usage

```
flask-restart [port] [project_path]
```

- `port`: API port (default: 5001)
- `project_path`: Path to Flask project root (default: current directory)

## Procedure

1. Kill any existing process on the target port
2. Start Flask API in background: `nohup python3 api/app.py > /tmp/flask.log 2>&1 &`
3. Wait 2 seconds for startup
4. Verify health: `curl -s -I http://localhost:{port}/` or `curl -s -X POST http://localhost:{port}/api/gulou-face/search -H "Content-Type: application/json" -d '{"pageSize":2}'`
5. Report status

## Example

```bash
# Default: restart on port 5001
pkill -f "python3 api/app.py" 2>/dev/null; sleep 1
nohup python3 api/app.py > /tmp/flask.log 2>&1 & sleep 2
curl -s -X POST http://localhost:5001/api/gulou-face/search \
  -H "Content-Type: application/json" \
  -d '{"pageSize":2}' | python3 -m json.tool | head -20
```

## Notes

- Port 5000 may be in use; prefer 5001
- Check `/tmp/flask.log` if startup fails
- MySQL must be running for database-dependent APIs
