# 1. Use official Node.js image
FROM node:22-slim

# 2. Install system dependencies required by Chromium/Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    wget \
    chromium \
 && rm -rf /var/lib/apt/lists/*

# 3. Ensure Puppeteer uses system Chromium and doesn't download one
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 4. Set working directory inside the container
WORKDIR /app

# 5. Copy only package.json and package-lock.json first (for caching)
COPY package*.json ./

# 6. Install dependencies (include dev deps for build step)
RUN npm ci

# 7. Copy all project files into container
COPY . .

# 8. Build client and server
RUN npm run build

# 9. Set production env for runtime
ENV NODE_ENV=production

# 10. Expose the port the app listens on
EXPOSE 5000

# 11. Start the app
CMD ["npm", "start"]
