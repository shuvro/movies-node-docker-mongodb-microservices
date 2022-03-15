FROM node:16.14-alpine

RUN mkdir -p /app
WORKDIR /app
# copy source files
ADD . /app
# compile and run
RUN npm install --also=dev

EXPOSE 3000
CMD npm run dev
#CMD ["node", "./src/server.js"]
