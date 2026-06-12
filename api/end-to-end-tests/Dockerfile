FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm install

COPY . .

CMD ["/bin/true"]
