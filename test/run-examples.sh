#!/bin/bash
node dist/cli.js examples/ls
node dist/cli.js examples/hello-world "world"
node dist/cli.js examples/hello-world-suggestions --name "world"
node dist/cli.js examples/hello-world-minimal
node dist/cli.js examples/hello-world-import
node dist/cli.js examples/hello-world-history