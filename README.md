# **DEPRECATED** - no longer actively maintained

---

# Elasticsearch Updater
> Scheduled service to load data from a URL into Elasticsearch

[![GitHub Release](https://img.shields.io/github/release/nhsuk/elasticsearch-updater.svg)](https://github.com/nhsuk/elasticsearch-updater/releases/latest/)
[![Greenkeeper badge](https://badges.greenkeeper.io/nhsuk/elasticsearch-updater.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nhsuk/elasticsearch-updater.svg?branch=master)](https://travis-ci.org/nhsuk/elasticsearch-updater)
[![Coverage Status](https://coveralls.io/repos/github/nhsuk/elasticsearch-updater/badge.svg?branch=master)](https://coveralls.io/github/nhsuk/elasticsearch-updater?branch=master)

The elasticsearch-updater is a dockerised application that will update an
Elasticsearch instance on a regular basis using JSON data from a URL.

The file specified in the `JSON_FILE_URL` environment variable will be used as
the source of the update if it is available, is valid JSON, and if the total
count has not dropped by a significant amount as described in
`CHANGE_THRESHOLD` below.

The destination instance is specified in the `ES_HOST` and `ES_PORT` variables.

As bespoke code is required to create mappings and perform transforms,
Elasticsearch configurations must be provided within the
`elasticsearch-updater` repository. ES configurations are stored on the
`config/esConfig` object, and can be selected with the `ES_INDEX` parameter.
Mappings and transforms for each available index are held in a folder with the
same name as the configuration, i.e. `profiles/mapping.json`.

An ES configuration must provide a `type`, an `idKey`, a `mapping definition`
and an optional `transform` function. The `type` is the index type used in the
mapping, and the `idKey` identifies the unique id in the data. For the
`profiles` configuration these are `gps` and `choicesId` respectively.

The file download and Elasticsearch update will run on startup, then on a daily
schedule while the container continues to run.

The time of day defaults to 7am, and can be changed via the `UPDATE_SCHEDULE`
environment variable. The schedule is run using `node-schedule` which uses a
Cron-like syntax. Further details on node-schedule available
[here](https://www.npmjs.com/package/node-schedule)
Note: the container time is GMT and does not take account of daylight saving,
you may need to subtract an hour from the time if it is currently BST.

When updating the Elasticsearch instance the new data will be inserted into a
date stamped index and validated against the existing index. Once validation
passes the existing index will be deleted and an alias set up to the new index,
i.e. `profiles_20170629140702` will be aliased to `profiles` upon successful
validation.

Validation will fail if the count of records drops significantly. The allowable
drop in record count is controlled by the `CHANGE_THRESHOLD` environment
variable. By default this is set to `0.99` which prevents the data being loaded
if the new count is less than 99% of the previous count.

## Environment variables

Environment variables are expected to be managed by the environment in which
the application is being run. This is best practice as described by
[twelve-factor](https://12factor.net/config).

| Variable             | Description                                                     | Default               | Required |
| :------------------- | :-------------------------------------------------------------- | :-------------------- | :------- |
| `NODE_ENV`           | Node environment                                                | development           |          |
| `LOG_LEVEL`          | [log level](https://github.com/trentm/node-bunyan#levels)       | Depends on `NODE_ENV` |          |
| `JSON_FILE_URL`      | Publicly available URL of JSON data                             |                       | yes      |
| `ES_HOST`            | Host name of Elasticsearch server                               |                       | yes      |
| `ES_INDEX`           | Elasticsearch configuration to read                             |                       | yes      |
| `ES_PORT`            | Port of Elasticsearch server                                    | 27017                 |          |
| `ES_REPLICAS`        | Number of replicas configured for the index                     | 1                     |          |
| `ES_TIMEOUT_SECONDS` | Maximum time in seconds to wait for response from Elasticsearch | 180                   |          |
| `ES_SHARDS`          | Number of shards for the index                                  | 5                     |          |
| `CHANGE_THRESHOLD`   | Factor the data count can change by before erroring             | 0.99                  |          |
| `UPDATE_SCHEDULE`    | Time of day to run the update                                   | 0 7 * * *  (7 am)     |          |

## Docker Compose Structure for Deployment and Development

The `docker-compose.yml` used for development and deployment via Rancher have a similar structure.
A stack is run with three `elasticsearch-updater` images having different configurations pointing at the same Elasticsearch instance.

The convention for environment variables used in the Rancher configuration is to add a suffix to each of the variables in the table above.
These are then mapped to the appropriate suffix-less variable in the container,
i.e. for the `pharmacies` container the `JSON_FILE_URL_PHARMACIES` is mapped to `JSON_FILE_URL`, `ES_HOST_PHARMACIES` is mapped to `ES_HOST` and so on.

## Architecture Decision Records

This repo uses
[Architecture Decision Records](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
to record architectural decisions for this project.
They are stored in [doc/adr](doc/adr).
