import app from './app';
import envConfig from './config/env';

const PORT: number = envConfig.SERVER_PORT;

app.listen(PORT, (): void => {
  // eslint-disable-next-line no-console
  console.log(`
  ==========================================
    HR Management API Server
    Status:  Running ✓
    Port:    ${PORT}
    Mode:    ${envConfig.NODE_ENV}
    URL:     http://localhost:${PORT}
  ==========================================
  `);
});
