#!/bin/bash
if [ ! -d ~/.scripta ] 
then
    echo "setting up local scripta folder"
    mkdir -p ~/.scripta/scripts 
    cp -n ./dist/local-package.json ~/.scripta/package.json 
    npm i --prefix ~/.scripta 
    node ./dist/cli.js --cleanup-shell-init-file
    node ./dist/cli.js --setup-shell-init-file
else
    echo "scripta folder found, might upgrade"
    jsonList=$( (cd ~/.scripta && npm list --json) )
    echo "$jsonList"
    installed=$(node -p "($jsonList).dependencies.scripta.version")
    if [ "$installed" != "$npm_package_version" ]; then
        echo "upgrading scripta in ~/.scripta to version $npm_package_version"
        npm install scripta@$npm_package_version --prefix ~/.scripta
    fi
fi