from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
from argparse import ArgumentParser
from threading import Thread

from staticjinja import make_site

if __name__ == "__main__":
    parser = ArgumentParser(description="Build and host static website based on Jinja2 templates")
    sj_opts = parser.add_argument_group(title="StaticJinja options")
    sj_opts.add_argument("-i", "--input", dest="searchpath", default="templates",
                         help='''A string representing the absolute path to the directory that '''
                              '''the Site should search to discover templates. Defaults to 'templates'.''')
    sj_opts.add_argument("-o", "--output", dest="output", default=".",
                         help='''A string representing the name of the directory that the Site '''
                              '''should store rendered files in. Defaults to '.'.''')
    sj_opts.add_argument("-s", "--staticpaths", dest="staticpath", action='append',
                         help='''List of directories to get static files from (relative to searchpath).''')
    httpd_group = parser.add_argument_group(title="WebServer options")
    httpd_group.add_argument("-p", "--port", dest="port", default="8000", type=int,
                             help='''Web-server port. Default: 8000.''')
    httpd_group.add_argument("-b", "--bind", dest="bind", default='',
                             help='''Web-server bind address.''')
    parser.add_argument("command", default="build", choices=["build", "host"], nargs='?')

    args = parser.parse_args()

    site = make_site(searchpath=os.path.abspath(args.searchpath),
                     outpath=os.path.abspath(args.output),
                     staticpaths=args.staticpath)
    do_host = (args.command == "host")
    if not do_host:
        site.render(use_reloader=False)
    else:
        os.chdir(os.path.abspath(args.output))
        server_address = (args.bind, args.port)
        with HTTPServer(server_address=server_address, RequestHandlerClass=SimpleHTTPRequestHandler) as httpd:
            sa = httpd.socket.getsockname()
            serve_message = "Serving HTTP on {host} port {port} (http://{host}:{port}/) ..."
            print(serve_message.format(host="127.0.0.1", port=sa[1]))
            thread = Thread(target=httpd.serve_forever)
            thread.daemon = True
            thread.start()
            # enable automatic reloading
#            try:
            site.render(use_reloader=True)
            # except BaseException as e:
            #     print("""shutdown!!!""")
            #     print(e)
            httpd.shutdown()
            print("after try")
        print("after with")
