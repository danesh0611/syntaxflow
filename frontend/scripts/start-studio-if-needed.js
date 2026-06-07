const net = require('node:net');
const { spawn } = require('node:child_process');
const path = require('node:path');

function isPortInUse(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(600);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function main() {
  const inUse = await isPortInUse(3333);

  if (inUse) {
    console.log('[studio] Port 3333 already in use. Reusing existing Studio instance.');
    return;
  }

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '3333'];
  const studioCwd = path.resolve(__dirname, '../../studio');

  const child = spawn(npmCmd, args, {
    stdio: 'inherit',
    cwd: studioCwd,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error('[studio] Failed to start Studio:', error);
  process.exit(1);
});
