FROM node:8.8.1-alpine

ENV USERNAME nodeuser

RUN adduser -D "$USERNAME" && \
    mkdir -p /code/data && \
    chown "$USERNAME":"$USERNAME" /code

USER $USERNAME
WORKDIR /code

COPY yarn.lock package.json /code/
RUN if [ "$NODE_ENV" == "production" ]; then yarn install --production --pure-lockfile; else yarn install --pure-lockfile; fi

COPY . /code

USER root
RUN find /code -user 0 -print0 | xargs -0 chown "$USERNAME":"$USERNAME"
USER $USERNAME

VOLUME /code/data

CMD [ "node", "app" ]
