FROM node:22.23.4-alpine3.23

WORKDIR /usr/src/web

COPY package*.json ./

RUN npm clean-install

COPY . .

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
