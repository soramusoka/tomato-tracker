#!/usr/bin/env python
import os
import sys

if sys.version_info < (3,):
    from BaseHTTPServer import HTTPServer as ServerClass
    from SimpleHTTPServer import SimpleHTTPRequestHandler as HandlerClass
else:
    from http.server import HTTPServer as ServerClass
    from http.server import SimpleHTTPRequestHandler as HandlerClass


def main():
    os.chdir('public')
    httpd = ServerClass(('127.0.0.1', 8000), HandlerClass)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        sys.exit('\n')


if __name__ == '__main__':
    main()
