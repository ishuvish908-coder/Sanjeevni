import os
import sys
import shutil

# Ensure parent directory is in python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import server

# On Vercel serverless environment, filesystem is read-only except /tmp
if os.environ.get("VERCEL"):
    tmp_db = "/tmp/sanjeevni.db"
    src_db = os.path.join(root_dir, "sanjeevni.db")
    if not os.path.exists(tmp_db) and os.path.exists(src_db):
        try:
            shutil.copyfile(src_db, tmp_db)
        except Exception as e:
            print(f"Error copying initial sqlite db to /tmp: {e}")
    server.DB_PATH = tmp_db

# Initialize database schema and seeds
try:
    server.init_db()
except Exception as e:
    print(f"Error initializing DB: {e}")

# Vercel Python runtime detects subclass of BaseHTTPRequestHandler named 'handler'
class handler(server.SanjeevniHandler):
    pass
