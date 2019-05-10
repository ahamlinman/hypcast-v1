# NOTE: If using Docker v18.09+, it is highly recommended that you set
# DOCKER_BUILDKIT=1 in your environment. BuildKit can take advantage of the
# many stages in this file to parallelize the build, cutting the time roughly
# in half.

FROM debian:buster-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
      nodejs \
      ca-certificates \
      gnupg \
      python \
      build-essential \
      pkg-config \
  && rm -rf /var/lib/apt/lists/*

COPY ./build/deb-multimedia-keyring_2016.8.1_all.deb /tmp
RUN echo 'deb http://www.deb-multimedia.org buster main non-free' >> \
    /etc/apt/sources.list.d/deb-multimedia.list \
  && dpkg -i /tmp/deb-multimedia-keyring_2016.8.1_all.deb \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
      dvb-apps \
      ffmpeg \
      libfdk-aac2 \
  && rm -rf /var/lib/apt/lists/*


RUN apt-get update \
  && apt-get install -y --no-install-recommends \
      libgstreamer1.0-dev \
      libgstreamer-plugins-base1.0-dev \
      gstreamer1.0-plugins-good \
      gstreamer1.0-plugins-bad \
      gstreamer1.0-plugins-ugly \
  && rm -rf /var/lib/apt/lists/*

COPY ./build/yarn.gpg /tmp
RUN apt-key add /tmp/yarn.gpg \
  && echo 'deb https://dl.yarnpkg.com/debian/ stable main' >> \
    /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends yarn \
  && rm -rf /var/lib/apt/lists/*

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

  COPY --from=dist-modules /hypcast/node_modules /hypcast/node_modules
  COPY --from=build-server /hypcast/dist/models /hypcast/dist/models
  COPY --from=build-server /hypcast/dist/server /hypcast/dist/server
  COPY --from=build-client /hypcast/dist/client /hypcast/dist/client
