
# docker build . -t jxmot/some-docker-thing
# docker run -p 18080:8080 -p 11234:1234 -d jxmot/some-docker-thing
# docker run -d jxmot/some-docker-thing

# Get-NetTCPConnection -State Listen

FROM node:12
WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
EXPOSE 1234

CMD [ "node", "./index.js" ]
