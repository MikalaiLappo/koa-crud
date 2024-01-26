#!/bin/bash

SCRIPTS_DIR=`dirname "$0"`

cat "$SCRIPTS_DIR/../sql/schema.sql" "$SCRIPTS_DIR/../sql/seed.sql" \
    | psql -U postgres -d koa_api -p 5432 -h localhost -1 -f -
