import click
import os

@click.group()
def main():
    pass

@main.command()
def dev():
    """ This command starts up a development environment.

    The development environment is started through docker-compose and is visible
    at http://localhost.
    """
    command = f"docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml \
                up --build --renew-anon-volumes --abort-on-container-exit"
    print(command)
    os.system(command)

@main.command()
def local_prod():
    """ This command starts up a local version of the production environment for testing.
    
    No hot reloading is included.
    The environment is started through docker-compose and is visible
    at http://localhost.
    """
    command = f"docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml \
                up --build --renew-anon-volumes --abort-on-container-exit"
    print(command)
    os.system(command)

if __name__ == '__main__':
    main()
