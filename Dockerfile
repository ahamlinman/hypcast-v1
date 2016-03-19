FROM node:5.9.0
MAINTAINER Alex Hamlin

RUN echo 'deb http://www.deb-multimedia.org stable main non-free' >> \
		/etc/apt/sources.list.d/deb-multimedia.list

RUN apt-get update \
		&& apt-get install -y --force-yes deb-multimedia-keyring \
		&& apt-get update \
		&& apt-get install -y --no-install-recommends libfdk-aac1 ffmpeg dvb-apps \
		&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY npm-shrinkwrap.json /usr/src/app
RUN npm install

COPY . /usr/src/app
RUN npm run build:mini

ENTRYPOINT exec npm start
EXPOSE 9400
