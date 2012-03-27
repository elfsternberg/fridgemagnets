from fabric.api import *
from fabric.decorators import hosts
import fabric.contrib


# Devserver
# env.user = 'ubuntu'
# DEFAULT_HOSTS = [env.user + 'devserver']

# Production Server
env.user = 'htmlmagnets'
DEFAULT_HOSTS = [env.user + '@elfsternberg.com']

def send_server():
    rsync_cmd = 'rsync -r --progress'
    local('%s %s %s:%s' % (rsync_cmd, "server/magnet_server.coffee js/wordlist.js private/config.coffee", DEFAULT_HOSTS[0], "server/"))

def send_client():
    rsync_cmd = 'rsync -r --progress'
    content = 'index.html *.jpg *.png *.css js media ui-lightness'
    local('%s %s %s:%s' % (rsync_cmd, content, DEFAULT_HOSTS[0], "htdocs/"))

    
    
