import express from 'express';
import { SystemScanAgent } from './agents/SystemScanAgent';
import { KernelAgent } from './agents/KernelAgent';
import { DriverAgent } from './agents/DriverAgent';
import { SchedulerAgent } from './agents/SchedulerAgent';
import { FilesystemAgent } from './agents/FilesystemAgent';
import { IntegrationAgent } from './agents/IntegrationAgent';
import { PerformanceAgent } from './agents/PerformanceAgent';
import { DebugAgent } from './agents/DebugAgent';
import { LearnAgent } from './agents/LearnAgent';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Initialize agents
const systemScanAgent = new SystemScanAgent();
const kernelAgent = new KernelAgent();
const driverAgent = new DriverAgent();
const schedulerAgent = new SchedulerAgent();
const filesystemAgent = new FilesystemAgent();
const integrationAgent = new IntegrationAgent();
const performanceAgent = new PerformanceAgent();
const debugAgent = new DebugAgent();
const learnAgent = new LearnAgent();

// Bootstrap system scan
async function bootstrap() {
  try {
    const profile = await systemScanAgent.scanSystem();
    console.log('System Profile:', profile);
    
    // Validate system before unlocking agents
    if (profile.valid) {
      console.log('System validated. Unlocking agents...');
      // Agents are now unlocked and ready to use
    } else {
      console.error('System validation failed. Aborting.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

// API Routes
app.get('/api/system/profile', (req, res) => {
  res.json(systemScanAgent.getProfile());
});

app.get('/api/tools', (req, res) => {
  res.json(systemScanAgent.getTools());
});

app.post('/api/os/build', async (req, res) => {
  try {
    const buildId = await integrationAgent.buildOS();
    res.json({ id: buildId });
  } catch (error) {
    res.status(500).json({ error: 'Build failed' });
  }
});

app.get('/api/os/:id/cycle', (req, res) => {
  const { id } = req.params;
  res.json({ cycle: integrationAgent.getCycle(id) });
});

app.get('/api/os/:id/performance', (req, res) => {
  const { id } = req.params;
  res.json({ performance: performanceAgent.getPerformance(id) });
});

app.get('/api/os/:id/logs', (req, res) => {
  const { id } = req.params;
  res.json({ logs: debugAgent.getLogs(id) });
});

app.get('/api/memory/kernel-failures', (req, res) => {
  res.json(learnAgent.getKernelFailures());
});

app.get('/api/memory/driver-integration', (req, res) => {
  res.json(learnAgent.getDriverIntegration());
});

app.get('/api/memory/performance-strategies', (req, res) => {
  res.json(learnAgent.getPerformanceStrategies());
});

app.get('/api/memory/meta', (req, res) => {
  res.json(learnAgent.getMetaLearningIndex());
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server and bootstrap
bootstrap().then(() => {
  app.listen(port, () => {
    console.log(`OS Designer running at http://localhost:${port}`);
  });
});