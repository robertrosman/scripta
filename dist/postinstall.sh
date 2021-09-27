mkdir -p ~/.scripta/scripts && 
cp -n ./dist/local-package.json ~/.scripta/package.json && 
npm i --prefix ~/.scripta && 
node ./dist/cli.js --cleanup-shell-init-file &&
node ./dist/cli.js --setup-shell-init-file