#!/bin/sh

git clone https://github.com/nhsuk/ci-deployment.git scripts/ci-deployment

bash ./scripts/ci-deployment/deploy.sh
