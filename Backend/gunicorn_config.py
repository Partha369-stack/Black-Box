# Gunicorn configuration for Railway deployment
import os

# Server socket
bind = f"0.0.0.0:{os.environ.get('PORT', '3005')}"
backlog = 2048

# Worker processes
workers = int(os.environ.get('WEB_CONCURRENCY', '1'))
worker_class = "gevent"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, with up to 50% jitter
max_requests = 1000
max_requests_jitter = 50

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'black_box_backend'

# Preload app for better performance
preload_app = True

# Enable stats
enable_stdio_inheritance = True
