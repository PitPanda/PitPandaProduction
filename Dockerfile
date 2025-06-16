FROM node:18-slim

# for canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# install dependencies
COPY PitPandaProduction/package*.json ./
RUN npm ci --omit=dev

# copy backend
COPY PitPandaProduction/ .

# copy frontend
COPY PitPandaFrontend/src /app/PitPandaFrontend/src
COPY PitPandaFrontend/build /app/PitPandaFrontend/build

# expose ports
EXPOSE 5000 5002

CMD ["node", "index.js"] 