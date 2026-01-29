@echo off
echo 🚀 Instalando dependencias del backend...

REM Instalar dependencias de CDK
echo 📦 Instalando dependencias de CDK...
cd cdk
call npm install

echo ✅ Instalación completada!
echo.
echo Para desplegar:
echo   cd cdk
echo   npm run deploy:dev
