FROM node:12-alpine
WORKDIR /app
RUN apk add git
RUN git clone https://github.com/sovpro/layout-fun.git .
RUN npm ci
CMD ["npm", "start"]
