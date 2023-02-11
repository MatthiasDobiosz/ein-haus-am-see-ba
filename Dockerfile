FROM node as build

WORKDIR /ein-haus-am-see-ba

COPY package.json .
COPY tsconfig.json .
COPY yarn.lock .
COPY client ./client
COPY server ./server
COPY shared ./shared

RUN yarn install --frozen-lockfile 

RUN yarn build

FROM node

WORKDIR /ein-haus-am-see-ba

COPY ./package.json .
COPY yarn.lock .

COPY --from=build /ein-haus-am-see-ba/client /ein-haus-am-see-ba/client
COPY --from=build /ein-haus-am-see-ba/server/package.json /ein-haus-am-see-ba/server/package.json

COPY --from=build /ein-haus-am-see-ba/dist /ein-haus-am-see-ba/dist

RUN yarn install --frozen-lockfile --production

EXPOSE 5173 3200 

WORKDIR /ein-haus-am-see-ba

CMD ["yarn", "start"]