0.6.0 / 2017-12-14
==================
- Update npm dependencies
- Set 'opens' and 'closes' to undefined on openingTimesAlterationsAsOffset when closed all day

0.5.1 / 2017-11-21
==================
- Allow shard and replica numbers to be set on index creation

0.5.0 / 2017-11-16
==================
- Upgrade Docker container to `node:8.9.1-alpine`
- Remove redundant `--` for forwarding script options
- Update npm dependencies

0.4.0 / 2017-10-31
==================
- Upgrade Docker container to `node:8.8.1-alpine`
- Update npm dependencies
- Add CHANGELOG
- Add mapping type for odsCode and choicesId

0.3.3 / 2017-09-11
==================
- Upgrade to node 8.4.0
- Swap aliases in atomic action, rather than rely on deletion of index
- Add pharmacies data updater logic

0.3.2 / 2017-08-20
==================
- CHANGE_THRESHOLD environment variable value is now converted to a number.

0.3.1 / 2017-08-18
==================
- Remove ci-deployment script sub-module.

0.3.0 / 2017-08-18
==================
- Expose ES_HOST_PROFILES as environment variable
- add `_PROFILES` suffix to env vars to allow multiple updaters to run in stack

0.2.0 / 2017-07-13
==================
- Upgrade to node `8.1.4` to address [security issue](https://nodejs.org/en/blog/vulnerability/july-2017-security-releases/)

0.1.1 / 2017-07-06
==================
- The alternative name field is populated with the first line of the address as it often holds the practice name.
This is given a high priority in search results along with the name and doctors.

0.1.0 / 2017-07-05
==================
- Initial release capable of updating a profiles Elasticsearch instance.
