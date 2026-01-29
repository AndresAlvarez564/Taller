#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const taller_stack_1 = require("../lib/taller-stack");
const app = new cdk.App();
// Obtener contexto (dev, prod, etc.)
const env = app.node.tryGetContext('env') || 'dev';
const tallerName = app.node.tryGetContext('tallerName') || 'TallerDemo';
new taller_stack_1.TallerStack(app, `TallerStack-${env}`, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFsbGVyLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGFsbGVyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHVDQUFxQztBQUNyQyxpREFBbUM7QUFDbkMsc0RBQWtEO0FBRWxELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLHFDQUFxQztBQUNyQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUM7QUFDbkQsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksWUFBWSxDQUFDO0FBRXhFLElBQUksMEJBQVcsQ0FBQyxHQUFHLEVBQUUsZUFBZSxHQUFHLEVBQUUsRUFBRTtJQUN6QyxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7UUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksV0FBVztLQUN0RDtJQUNELFNBQVMsRUFBRSxHQUFHLFVBQVUsSUFBSSxHQUFHLEVBQUU7SUFDakMsV0FBVyxFQUFFLGtDQUFrQyxVQUFVLEtBQUssR0FBRyxHQUFHO0lBQ3BFLElBQUksRUFBRTtRQUNKLFdBQVcsRUFBRSxHQUFHO1FBQ2hCLE9BQU8sRUFBRSxrQkFBa0I7UUFDM0IsU0FBUyxFQUFFLEtBQUs7S0FDakI7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXHJcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgVGFsbGVyU3RhY2sgfSBmcm9tICcuLi9saWIvdGFsbGVyLXN0YWNrJztcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XHJcblxyXG4vLyBPYnRlbmVyIGNvbnRleHRvIChkZXYsIHByb2QsIGV0Yy4pXHJcbmNvbnN0IGVudiA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ2VudicpIHx8ICdkZXYnO1xyXG5jb25zdCB0YWxsZXJOYW1lID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dCgndGFsbGVyTmFtZScpIHx8ICdUYWxsZXJEZW1vJztcclxuXHJcbm5ldyBUYWxsZXJTdGFjayhhcHAsIGBUYWxsZXJTdGFjay0ke2Vudn1gLCB7XHJcbiAgZW52OiB7XHJcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxyXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gfHwgJ3VzLWVhc3QtMScsXHJcbiAgfSxcclxuICBzdGFja05hbWU6IGAke3RhbGxlck5hbWV9LSR7ZW52fWAsXHJcbiAgZGVzY3JpcHRpb246IGBTaXN0ZW1hIGRlIEdlc3Rpw7NuIGRlIFRhbGxlciAtICR7dGFsbGVyTmFtZX0gKCR7ZW52fSlgLFxyXG4gIHRhZ3M6IHtcclxuICAgIEVudmlyb25tZW50OiBlbnYsXHJcbiAgICBQcm9qZWN0OiAnVGFsbGVyTWFuYWdlbWVudCcsXHJcbiAgICBNYW5hZ2VkQnk6ICdDREsnLFxyXG4gIH0sXHJcbn0pO1xyXG4iXX0=