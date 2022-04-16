FROM node:lts-alpine as builder
WORKDIR /app/client
COPY package.json /app/client
RUN npm install --legacy-peer-deps
COPY . /app/client
RUN npm run build 

FROM nginx:alpine
COPY --from=builder /app/client/nginx/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/client/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]