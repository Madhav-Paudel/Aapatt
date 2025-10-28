@echo off
setlocal enableextensions enabledelayedexpansion

pushd %~dp0\..
call npm install
call npm run -w backend prisma:generate
popd

echo Setup complete. Use npm run dev:* scripts to start services.
