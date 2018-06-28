from staticjinja import make_site

if __name__ == "__main__":
    site = make_site()
    # enable automatic reloading
    site.render(use_reloader=True)
