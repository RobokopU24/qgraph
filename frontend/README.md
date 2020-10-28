# Frontend 

This folder contains the code for the React.js frontend of the Robokop application.

## Dependency Installation

This component is designed to run in a Docker container. For more details, please refer to the top-level README.md in this repository. It is not recommended to install npm dependencies outside of the container. The easiest way to install new dependencies is through the [add-dependencies](https://www.npmjs.com/package/npm-add-dependencies) helper, which can be invoked as follows (from the root folder of the repository):

```bash
(cd frontend/ && npx add-dependencies <dep_name>)
```

This will not create a local node\_modules folder but will add the dependency to the package.json file. After this step, all that needs to be done is to restart the docker-compose script which will recreate the container with the new dependency installed.
