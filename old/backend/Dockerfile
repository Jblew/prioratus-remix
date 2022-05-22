FROM skip_pulling_metadata_for_a_while
WORKDIR /app

ADD package.json package-lock.json /app/
RUN npm ci

ADD ./prisma /app/prisma
RUN npx prisma generate

ADD . /app/
RUN npm run build

CMD ["npm", "run", "start:docker"]
