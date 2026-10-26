import http from 'http';
import { app } from './app';
import { seedInitialData } from './seed';

const PORT = parseInt(process.env.PORT_API || '4000', 10);
const PAYMENT_MODE = process.env.PAYMENT_MODE || 'simulation';

if (PAYMENT_MODE !== 'simulation') {
  console.error('\n❌ FATAL: PAYMENT_MODE must be "simulation"! Real payment gateways are strictly forbidden.\n');
  process.exit(1);
}

// Seed initial marketplace data
seedInitialData();

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`
================================================================
  ⚡ HUKUM MARKETPLACE API ENGINE RUNNING (Node.js/TypeScript)
================================================================
  - API Base:       http://localhost:${PORT}/api/v1
  - Health:         http://localhost:${PORT}/health
  - Short Domain:   http://localhost:${PORT}/:code
  - System Lab API: http://localhost:${PORT}/api/v1/lab/overview
  - Payment Mode:   SIMULATION (100% Free & Open Source)
================================================================
`);
});
