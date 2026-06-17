import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const mockApiPort = process.env.MOCK_API_PORT || '4300';
const mockApiHealthUrl = `http://127.0.0.1:${mockApiPort}/api/health`;
const angularArgs = [
  'node_modules/@angular/cli/bin/ng.js',
  'serve',
  '--proxy-config',
  'proxy.conf.json',
  ...process.argv.slice(2),
];

const mockApi = spawn(process.execPath, ['scripts/mock-api-server.mjs'], {
  env: process.env,
  stdio: 'inherit',
});

let angular;

try {
  await waitForMockApi();

  angular = spawn(process.execPath, angularArgs, {
    env: process.env,
    stdio: 'inherit',
  });
} catch (error) {
  console.error(error);
  mockApi.kill('SIGTERM');
  process.exit(1);
}

mockApi.on('exit', (code, signal) => {
  if (angular && angular.exitCode === null) {
    angular.kill('SIGTERM');
  }

  if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
    process.exit(code ?? 1);
  }
});

angular?.on('exit', (code, signal) => {
  if (mockApi.exitCode === null) {
    mockApi.kill('SIGTERM');
  }

  if (signal !== 'SIGTERM' && signal !== 'SIGINT') {
    process.exit(code ?? 0);
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    mockApi.kill(signal);
    angular?.kill(signal);
  });
}

async function waitForMockApi() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 5_000) {
    try {
      const response = await fetch(mockApiHealthUrl);

      if (response.ok) {
        return;
      }
    } catch {
      await wait(100);
    }
  }

  throw new Error(`Mock API did not start at ${mockApiHealthUrl}`);
}
