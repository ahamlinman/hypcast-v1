# NOTE: If using Docker v18.09+, it is highly recommended that you set
# DOCKER_BUILDKIT=1 in your environment. BuildKit can take advantage of the
# many stages in this file to parallelize the build, cutting the time roughly
# in half.

FROM node:14-buster-slim AS base
WORKDIR /hypcast


  FROM base AS build-base
  COPY package.json yarn.lock ./
  RUN yarn install --frozen-lockfile --ignore-optional
  COPY models/ models/


    FROM build-base AS dist-modules
    RUN yarn install --production


    FROM build-base AS build-server
    COPY server/ server/
    RUN yarn run build:server


    FROM build-base AS build-client
    COPY webpack.config.js ./
    COPY client/ client/
    RUN yarn run build:client:mini


  FROM base AS dist
  LABEL maintainer="Alex Hamlin <alex@alexhamlin.co>"

  COPY build/tini /bin/tini
  ENTRYPOINT ["/bin/tini", "--"]
  CMD ["node", "./dist/server/index.js"]
  EXPOSE 9400

  COPY ./build/deb-multimedia-keyring_2016.8.1_all.deb /tmp
  RUN echo 'deb http://www.deb-multimedia.org buster main non-free' >> \
      /etc/apt/sources.list.d/deb-multimedia.list \
    && dpkg -i /tmp/deb-multimedia-keyring_2016.8.1_all.deb

  # makedev, a dependency of dvb-apps, tries to create device nodes when
  # installed. This is unnecessary (we expect the user to pass their DVB
  # devices to the container) and not allowed in rootless builds. We use the
  # strategy from https://serverfault.com/a/663803 to prevent its installation.
  RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libfdk-aac2 ffmpeg dvb-apps makedev- \
    && rm -rf /var/lib/apt/lists/*

  COPY --from=dist-modules /hypcast/node_modules /hypcast/node_modules
  COPY --from=build-server /hypcast/dist/models /hypcast/dist/models
  COPY --from=build-server /hypcast/dist/server /hypcast/dist/server
  COPY --from=build-client /hypcast/dist/client /hypcast/dist/client
