FROM node:17-alpine

# RUN set -x \
  # && apk update \
  # && apk upgrade \
  # && apk add --no-cache \
  # udev \
  # ttf-freefont 
  # chromium 
  # && npm install puppeteer

# # We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PORT 8080
ENV HOST 0.0.0.0

WORKDIR /customserver

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 8080

CMD [ "npm", "run", "start"]


# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-stable'})
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true


# CMD ["google-chrome-stable"]
