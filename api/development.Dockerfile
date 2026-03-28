FROM node:20.19.0-alpine3.21

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN chmod +x ./bin/boot-app.sh

CMD ["/usr/src/api/bin/boot-app.sh"]
