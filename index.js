#!/usr/bin/env node
// require('./run-app.js')
import { runApp } from './build/run-app.js'

(async () => {
    await runApp();
})()