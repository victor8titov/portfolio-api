# Portfolio API

Part of the Portfolio project. This is the server side. Communication with the application occurs through the REST API.


## install

To work the application, you need to configure the file .env

### example .env 

```

PGUSER=user database
PGPASSWORD= passsword database

PGHOST=
PGDATABASE=
PGPORT=5432

USER_ADMIN=
PASSWORD_ADMIN=

JWT_SECRET=
JWT_EXPIRATION=1300
JWT_REFRESH_EXPIRATION=11200

ORIGIN=http://localhost:3000

```

For start develop.

```bash

npm run start

```

## build

```bash

npm run build

```

## build yaml files

```bash

npm run bundle-openapi

```
