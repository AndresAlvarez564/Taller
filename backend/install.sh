#!/bin/bash

echo "🚀 Instalando dependencias del backend..."

# Instalar dependencias de CDK
echo "📦 Instalando dependencias de CDK..."
cd cdk
npm install

echo "✅ Instalación completada!"
echo ""
echo "Para desplegar:"
echo "  cd cdk"
echo "  npm run deploy:dev"
