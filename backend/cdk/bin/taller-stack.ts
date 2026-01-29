#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TallerStack } from '../lib/taller-stack';

const app = new cdk.App();

// Obtener contexto (dev, prod, etc.)
const env = app.node.tryGetContext('env') || 'dev';
const tallerName = app.node.tryGetContext('tallerName') || 'TallerDemo';

new TallerStack(app, `TallerStack-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  stackName: `${tallerName}-${env}`,
  description: `Sistema de Gestión de Taller - ${tallerName} (${env})`,
  tags: {
    Environment: env,
    Project: 'TallerManagement',
    ManagedBy: 'CDK',
  },
});
