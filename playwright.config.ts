import { defineConfig } from "@playwright/test"

const port = 3210
export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    reducedMotion: "reduce",
    launchOptions: { executablePath: process.env.MONEY_MANAGER_CHROMIUM },
  },
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    timeout: 30_000,
  },
})
