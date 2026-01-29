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
exports.TallerStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const cognito = __importStar(require("aws-cdk-lib/aws-cognito"));
const path_1 = require("path");
class TallerStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const stackName = this.stackName;
        // ========================================
        // DYNAMODB TABLES
        // ========================================
        // Tabla Clientes
        const clientesTable = new dynamodb.Table(this, 'ClientesTable', {
            tableName: `${stackName}-Clientes`,
            partitionKey: { name: 'clienteId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // GSI para búsqueda por nombre
        clientesTable.addGlobalSecondaryIndex({
            indexName: 'nombre-index',
            partitionKey: { name: 'nombre', type: dynamodb.AttributeType.STRING },
        });
        // Tabla Vehiculos
        const vehiculosTable = new dynamodb.Table(this, 'VehiculosTable', {
            tableName: `${stackName}-Vehiculos`,
            partitionKey: { name: 'vehiculoId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        vehiculosTable.addGlobalSecondaryIndex({
            indexName: 'placa-index',
            partitionKey: { name: 'placa', type: dynamodb.AttributeType.STRING },
        });
        vehiculosTable.addGlobalSecondaryIndex({
            indexName: 'customerId-index',
            partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
        });
        // Tabla OrdenesTrabajo
        const ordenesTrabajoTable = new dynamodb.Table(this, 'OrdenesTrabajoTable', {
            tableName: `${stackName}-OrdenesTrabajo`,
            partitionKey: { name: 'workOrderId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        ordenesTrabajoTable.addGlobalSecondaryIndex({
            indexName: 'estado-creadoEn-index',
            partitionKey: { name: 'estado', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'creadoEn', type: dynamodb.AttributeType.STRING },
        });
        ordenesTrabajoTable.addGlobalSecondaryIndex({
            indexName: 'customerId-index',
            partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
        });
        // Tabla InventarioItems
        const inventarioTable = new dynamodb.Table(this, 'InventarioTable', {
            tableName: `${stackName}-InventarioItems`,
            partitionKey: { name: 'inventarioItemId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        inventarioTable.addGlobalSecondaryIndex({
            indexName: 'sku-index',
            partitionKey: { name: 'sku', type: dynamodb.AttributeType.STRING },
        });
        // Tabla Facturas
        const facturasTable = new dynamodb.Table(this, 'FacturasTable', {
            tableName: `${stackName}-Facturas`,
            partitionKey: { name: 'facturaId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        facturasTable.addGlobalSecondaryIndex({
            indexName: 'numeroFactura-index',
            partitionKey: { name: 'numeroFactura', type: dynamodb.AttributeType.STRING },
        });
        facturasTable.addGlobalSecondaryIndex({
            indexName: 'estado-creadoEn-index',
            partitionKey: { name: 'estado', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'creadoEn', type: dynamodb.AttributeType.STRING },
        });
        // Tabla Detalles (Items de OT + Movimientos de Inventario)
        const detallesTable = new dynamodb.Table(this, 'DetallesTable', {
            tableName: `${stackName}-Detalles`,
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Tabla Usuarios
        const usuariosTable = new dynamodb.Table(this, 'UsuariosTable', {
            tableName: `${stackName}-Usuarios`,
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Tabla ConfiguracionTaller
        const configuracionTable = new dynamodb.Table(this, 'ConfiguracionTable', {
            tableName: `${stackName}-ConfiguracionTaller`,
            partitionKey: { name: 'config', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Tabla RolesPermisos
        const rolesPermisosTable = new dynamodb.Table(this, 'RolesPermisosTable', {
            tableName: `${stackName}-RolesPermisos`,
            partitionKey: { name: 'rolId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // ========================================
        // S3 BUCKET para PDFs y archivos
        // ========================================
        const documentsBucket = new s3.Bucket(this, 'DocumentsBucket', {
            bucketName: `${stackName.toLowerCase()}-documents`,
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            lifecycleRules: [
                {
                    id: 'archive-old-pdfs',
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                            transitionAfter: cdk.Duration.days(90),
                        },
                        {
                            storageClass: s3.StorageClass.GLACIER,
                            transitionAfter: cdk.Duration.days(365),
                        },
                    ],
                },
            ],
        });
        // ========================================
        // COGNITO USER POOL
        // ========================================
        const userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: `${stackName}-users`,
            selfSignUpEnabled: false,
            signInAliases: {
                email: true,
                username: true,
            },
            autoVerify: {
                email: true,
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        const userPoolClient = userPool.addClient('UserPoolClient', {
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            generateSecret: false,
        });
        // ========================================
        // LAMBDA LAYER (shared utilities)
        // ========================================
        const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/shared')),
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_11],
            description: 'Shared utilities for all lambdas',
        });
        // ========================================
        // VARIABLES DE ENTORNO COMUNES
        // ========================================
        const commonEnvironment = {
            CLIENTES_TABLE: clientesTable.tableName,
            VEHICULOS_TABLE: vehiculosTable.tableName,
            ORDENES_TRABAJO_TABLE: ordenesTrabajoTable.tableName,
            INVENTARIO_TABLE: inventarioTable.tableName,
            FACTURAS_TABLE: facturasTable.tableName,
            DETALLES_TABLE: detallesTable.tableName,
            USUARIOS_TABLE: usuariosTable.tableName,
            CONFIGURACION_TABLE: configuracionTable.tableName,
            ROLES_PERMISOS_TABLE: rolesPermisosTable.tableName,
            DOCUMENTS_BUCKET: documentsBucket.bucketName,
            USER_POOL_ID: userPool.userPoolId,
        };
        // ========================================
        // API GATEWAY
        // ========================================
        const api = new apigateway.RestApi(this, 'TallerApi', {
            restApiName: `${stackName}-API`,
            description: 'API para Sistema de Gestión de Taller',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                ],
            },
            deployOptions: {
                stageName: 'api',
                throttlingRateLimit: 100,
                throttlingBurstLimit: 200,
            },
        });
        // ========================================
        // LAMBDAS - CUSTOMERS
        // ========================================
        // Customer Create
        const customerCreateLambda = new lambda.Function(this, 'CustomerCreateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'create.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/customers')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        clientesTable.grantReadWriteData(customerCreateLambda);
        // Customer Read
        const customerReadLambda = new lambda.Function(this, 'CustomerReadFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'read.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/customers')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        clientesTable.grantReadData(customerReadLambda);
        // Customer Update
        const customerUpdateLambda = new lambda.Function(this, 'CustomerUpdateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'update.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/customers')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        clientesTable.grantReadWriteData(customerUpdateLambda);
        // Customer Delete
        const customerDeleteLambda = new lambda.Function(this, 'CustomerDeleteFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'delete.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/customers')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        clientesTable.grantReadWriteData(customerDeleteLambda);
        ordenesTrabajoTable.grantReadData(customerDeleteLambda);
        // ========================================
        // LAMBDAS - VEHICLES
        // ========================================
        // Vehicle Create
        const vehicleCreateLambda = new lambda.Function(this, 'VehicleCreateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'create.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/vehicles')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        vehiculosTable.grantReadWriteData(vehicleCreateLambda);
        clientesTable.grantReadData(vehicleCreateLambda);
        // Vehicle Read
        const vehicleReadLambda = new lambda.Function(this, 'VehicleReadFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'read.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/vehicles')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        vehiculosTable.grantReadData(vehicleReadLambda);
        // Vehicle Update
        const vehicleUpdateLambda = new lambda.Function(this, 'VehicleUpdateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'update.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/vehicles')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        vehiculosTable.grantReadWriteData(vehicleUpdateLambda);
        // Vehicle Delete
        const vehicleDeleteLambda = new lambda.Function(this, 'VehicleDeleteFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'delete.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/vehicles')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        vehiculosTable.grantReadWriteData(vehicleDeleteLambda);
        ordenesTrabajoTable.grantReadData(vehicleDeleteLambda);
        // ========================================
        // LAMBDAS - INVENTORY
        // ========================================
        // Inventory Create
        const inventoryCreateLambda = new lambda.Function(this, 'InventoryCreateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'create.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/inventory')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        inventarioTable.grantReadWriteData(inventoryCreateLambda);
        detallesTable.grantReadWriteData(inventoryCreateLambda);
        // Inventory Read
        const inventoryReadLambda = new lambda.Function(this, 'InventoryReadFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'read.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/inventory')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        inventarioTable.grantReadData(inventoryReadLambda);
        // Inventory Update
        const inventoryUpdateLambda = new lambda.Function(this, 'InventoryUpdateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'update.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/inventory')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        inventarioTable.grantReadWriteData(inventoryUpdateLambda);
        // Inventory Delete
        const inventoryDeleteLambda = new lambda.Function(this, 'InventoryDeleteFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'delete.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/inventory')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        inventarioTable.grantReadWriteData(inventoryDeleteLambda);
        // Inventory Movement
        const inventoryMovementLambda = new lambda.Function(this, 'InventoryMovementFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'movement.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/inventory')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        inventarioTable.grantReadWriteData(inventoryMovementLambda);
        detallesTable.grantReadWriteData(inventoryMovementLambda);
        // Inventory List Movements
        const inventoryListMovementsLambda = new lambda.Function(this, 'InventoryListMovementsFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'list_movements.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/inventory')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        detallesTable.grantReadData(inventoryListMovementsLambda);
        // ========================================
        // LAMBDAS - WORK ORDERS
        // ========================================
        // Work Order Create
        const workOrderCreateLambda = new lambda.Function(this, 'WorkOrderCreateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'create.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadWriteData(workOrderCreateLambda);
        clientesTable.grantReadData(workOrderCreateLambda);
        vehiculosTable.grantReadData(workOrderCreateLambda);
        // Work Order Read
        const workOrderReadLambda = new lambda.Function(this, 'WorkOrderReadFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'read.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadData(workOrderReadLambda);
        detallesTable.grantReadData(workOrderReadLambda);
        // Work Order Update
        const workOrderUpdateLambda = new lambda.Function(this, 'WorkOrderUpdateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'update.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadWriteData(workOrderUpdateLambda);
        // Work Order Update State
        const workOrderUpdateStateLambda = new lambda.Function(this, 'WorkOrderUpdateStateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'update_state.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadWriteData(workOrderUpdateStateLambda);
        detallesTable.grantReadData(workOrderUpdateStateLambda);
        // Work Order Delete
        const workOrderDeleteLambda = new lambda.Function(this, 'WorkOrderDeleteFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'delete.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadWriteData(workOrderDeleteLambda);
        // Work Order Add Item
        const workOrderAddItemLambda = new lambda.Function(this, 'WorkOrderAddItemFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'add_item.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(15),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadData(workOrderAddItemLambda);
        detallesTable.grantReadWriteData(workOrderAddItemLambda);
        inventarioTable.grantReadWriteData(workOrderAddItemLambda);
        // Work Order Update Item
        const workOrderUpdateItemLambda = new lambda.Function(this, 'WorkOrderUpdateItemFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'update_item.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(15),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadData(workOrderUpdateItemLambda);
        detallesTable.grantReadWriteData(workOrderUpdateItemLambda);
        inventarioTable.grantReadWriteData(workOrderUpdateItemLambda);
        // Work Order Delete Item
        const workOrderDeleteItemLambda = new lambda.Function(this, 'WorkOrderDeleteItemFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'delete_item.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/work_orders')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(15),
            memorySize: 256,
        });
        ordenesTrabajoTable.grantReadData(workOrderDeleteItemLambda);
        detallesTable.grantReadWriteData(workOrderDeleteItemLambda);
        inventarioTable.grantReadWriteData(workOrderDeleteItemLambda);
        // ========================================
        // LAMBDAS - INVOICES
        // ========================================
        // Invoice Create
        const invoiceCreateLambda = new lambda.Function(this, 'InvoiceCreateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'create.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/invoices')),
            environment: { ...commonEnvironment, CONFIGURACION_TALLER_TABLE: configuracionTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(15),
            memorySize: 256,
        });
        facturasTable.grantReadWriteData(invoiceCreateLambda);
        ordenesTrabajoTable.grantReadWriteData(invoiceCreateLambda);
        detallesTable.grantReadData(invoiceCreateLambda);
        configuracionTable.grantReadWriteData(invoiceCreateLambda);
        // Invoice Read
        const invoiceReadLambda = new lambda.Function(this, 'InvoiceReadFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'read.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/invoices')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        facturasTable.grantReadData(invoiceReadLambda);
        // Invoice Anular
        const invoiceAnularLambda = new lambda.Function(this, 'InvoiceAnularFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'anular.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/invoices')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        facturasTable.grantReadWriteData(invoiceAnularLambda);
        // Invoice Registrar Pago
        const invoiceRegistrarPagoLambda = new lambda.Function(this, 'InvoiceRegistrarPagoFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'registrar_pago.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/invoices')),
            environment: commonEnvironment,
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        facturasTable.grantReadWriteData(invoiceRegistrarPagoLambda);
        // Venta Rapida Create
        const ventaRapidaCreateLambda = new lambda.Function(this, 'VentaRapidaCreateFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'venta_rapida_create.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/invoices')),
            environment: { ...commonEnvironment, CONFIGURACION_TALLER_TABLE: configuracionTable.tableName, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(15),
            memorySize: 256,
        });
        facturasTable.grantReadWriteData(ventaRapidaCreateLambda);
        inventarioTable.grantReadWriteData(ventaRapidaCreateLambda);
        detallesTable.grantReadWriteData(ventaRapidaCreateLambda);
        configuracionTable.grantReadWriteData(ventaRapidaCreateLambda);
        // Venta Rapida Anular
        const ventaRapidaAnularLambda = new lambda.Function(this, 'VentaRapidaAnularFunction', {
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'venta_rapida_anular.lambda_handler',
            code: lambda.Code.fromAsset((0, path_1.join)(__dirname, '../../lambdas/invoices')),
            environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
            layers: [sharedLayer],
            timeout: cdk.Duration.seconds(15),
            memorySize: 256,
        });
        facturasTable.grantReadWriteData(ventaRapidaAnularLambda);
        inventarioTable.grantReadWriteData(ventaRapidaAnularLambda);
        detallesTable.grantReadWriteData(ventaRapidaAnularLambda);
        // ========================================
        // API ROUTES - CUSTOMERS
        // ========================================
        const customers = api.root.addResource('customers');
        customers.addMethod('POST', new apigateway.LambdaIntegration(customerCreateLambda));
        customers.addMethod('GET', new apigateway.LambdaIntegration(customerReadLambda));
        const customer = customers.addResource('{clienteId}');
        customer.addMethod('GET', new apigateway.LambdaIntegration(customerReadLambda));
        customer.addMethod('PUT', new apigateway.LambdaIntegration(customerUpdateLambda));
        customer.addMethod('DELETE', new apigateway.LambdaIntegration(customerDeleteLambda));
        // ========================================
        // API ROUTES - VEHICLES
        // ========================================
        const vehicles = api.root.addResource('vehicles');
        vehicles.addMethod('POST', new apigateway.LambdaIntegration(vehicleCreateLambda));
        vehicles.addMethod('GET', new apigateway.LambdaIntegration(vehicleReadLambda));
        const vehicle = vehicles.addResource('{vehiculoId}');
        vehicle.addMethod('GET', new apigateway.LambdaIntegration(vehicleReadLambda));
        vehicle.addMethod('PUT', new apigateway.LambdaIntegration(vehicleUpdateLambda));
        vehicle.addMethod('DELETE', new apigateway.LambdaIntegration(vehicleDeleteLambda));
        // ========================================
        // API ROUTES - INVENTORY
        // ========================================
        const inventory = api.root.addResource('inventory');
        inventory.addMethod('POST', new apigateway.LambdaIntegration(inventoryCreateLambda));
        inventory.addMethod('GET', new apigateway.LambdaIntegration(inventoryReadLambda));
        const inventoryItem = inventory.addResource('{inventarioItemId}');
        inventoryItem.addMethod('GET', new apigateway.LambdaIntegration(inventoryReadLambda));
        inventoryItem.addMethod('PUT', new apigateway.LambdaIntegration(inventoryUpdateLambda));
        inventoryItem.addMethod('DELETE', new apigateway.LambdaIntegration(inventoryDeleteLambda));
        const inventoryMovements = inventory.addResource('movements');
        inventoryMovements.addMethod('POST', new apigateway.LambdaIntegration(inventoryMovementLambda));
        inventoryMovements.addMethod('GET', new apigateway.LambdaIntegration(inventoryListMovementsLambda));
        // ========================================
        // API ROUTES - WORK ORDERS
        // ========================================
        const workOrders = api.root.addResource('work-orders');
        workOrders.addMethod('POST', new apigateway.LambdaIntegration(workOrderCreateLambda));
        workOrders.addMethod('GET', new apigateway.LambdaIntegration(workOrderReadLambda));
        const workOrder = workOrders.addResource('{workOrderId}');
        workOrder.addMethod('GET', new apigateway.LambdaIntegration(workOrderReadLambda));
        workOrder.addMethod('PUT', new apigateway.LambdaIntegration(workOrderUpdateLambda));
        workOrder.addMethod('DELETE', new apigateway.LambdaIntegration(workOrderDeleteLambda));
        const workOrderState = workOrder.addResource('state');
        workOrderState.addMethod('PUT', new apigateway.LambdaIntegration(workOrderUpdateStateLambda));
        const workOrderItems = workOrder.addResource('items');
        workOrderItems.addMethod('POST', new apigateway.LambdaIntegration(workOrderAddItemLambda));
        workOrderItems.addMethod('PUT', new apigateway.LambdaIntegration(workOrderUpdateItemLambda));
        workOrderItems.addMethod('DELETE', new apigateway.LambdaIntegration(workOrderDeleteItemLambda));
        // ========================================
        // API ROUTES - INVOICES
        // ========================================
        const invoices = api.root.addResource('invoices');
        invoices.addMethod('POST', new apigateway.LambdaIntegration(invoiceCreateLambda));
        invoices.addMethod('GET', new apigateway.LambdaIntegration(invoiceReadLambda));
        const invoice = invoices.addResource('{facturaId}');
        invoice.addMethod('GET', new apigateway.LambdaIntegration(invoiceReadLambda));
        const invoiceAnular = invoice.addResource('anular');
        invoiceAnular.addMethod('POST', new apigateway.LambdaIntegration(invoiceAnularLambda));
        const invoicePago = invoice.addResource('pago');
        invoicePago.addMethod('POST', new apigateway.LambdaIntegration(invoiceRegistrarPagoLambda));
        // ========================================
        // API ROUTES - VENTAS RAPIDAS
        // ========================================
        const ventasRapidas = api.root.addResource('ventas-rapidas');
        ventasRapidas.addMethod('POST', new apigateway.LambdaIntegration(ventaRapidaCreateLambda));
        const ventaRapida = ventasRapidas.addResource('{facturaId}');
        const ventaRapidaAnular = ventaRapida.addResource('anular');
        ventaRapidaAnular.addMethod('POST', new apigateway.LambdaIntegration(ventaRapidaAnularLambda));
        // ========================================
        // OUTPUTS
        // ========================================
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: api.url,
            description: 'API Gateway URL',
        });
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
            description: 'Cognito User Pool ID',
        });
        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
        });
        new cdk.CfnOutput(this, 'DocumentsBucketName', {
            value: documentsBucket.bucketName,
            description: 'S3 Bucket for documents',
        });
        // Guardar referencias para usar en otros constructs
        new cdk.CfnOutput(this, 'ApiIdExport', {
            value: api.restApiId,
            exportName: `${stackName}-ApiId`,
        });
        new cdk.CfnOutput(this, 'ClientesTableExport', {
            value: clientesTable.tableName,
            exportName: `${stackName}-ClientesTable`,
        });
    }
}
exports.TallerStack = TallerStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFsbGVyLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGFsbGVyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUVuQyxtRUFBcUQ7QUFDckQsK0RBQWlEO0FBQ2pELHVFQUF5RDtBQUN6RCx1REFBeUM7QUFDekMsaUVBQW1EO0FBQ25ELCtCQUE0QjtBQUU1QixNQUFhLFdBQVksU0FBUSxHQUFHLENBQUMsS0FBSztJQUN4QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFakMsMkNBQTJDO1FBQzNDLGtCQUFrQjtRQUNsQiwyQ0FBMkM7UUFFM0MsaUJBQWlCO1FBQ2pCLE1BQU0sYUFBYSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzlELFNBQVMsRUFBRSxHQUFHLFNBQVMsV0FBVztZQUNsQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN4RSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQ2pELG1CQUFtQixFQUFFLElBQUk7WUFDekIsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTtTQUN4QyxDQUFDLENBQUM7UUFFSCwrQkFBK0I7UUFDL0IsYUFBYSxDQUFDLHVCQUF1QixDQUFDO1lBQ3BDLFNBQVMsRUFBRSxjQUFjO1lBQ3pCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1NBQ3RFLENB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S0FBSyxFQUFFLGNBQWMsQ0FBQyxnQkFBZ0I7WUFDdEMsV0FBVyxFQUFFLDZCQUE2QjtTQUMzQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzdDLEtBQUssRUFBRSxlQUFlLENBQUMsVUFBVTtZQUNqQyxXQUFXLEVBQUUseUJBQXlCO1NBQ3ZDLENBQUMsQ0FBQztRQUVILG9EQUFvRDtRQUNwRCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFNBQVM7WUFDcEIsVUFBVSxFQUFFLEdBQUcsU0FBUyxRQUFRO1NBQ2pDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsS0FBSyxFQUFFLGFBQWEsQ0FBQyxTQUFTO1lBQzlCLFVBQVUsRUFBRSxHQUFHLFNBQVMsZ0JBQWdCO1NBQ3pDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQS91QkQsa0NBK3VCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xyXG5pbXBvcnQgKiBhcyBjb2duaXRvIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2duaXRvJztcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRhbGxlclN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuICAgIFxyXG4gICAgY29uc3Qgc3RhY2tOYW1lID0gdGhpcy5zdGFja05hbWU7XHJcblxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gRFlOQU1PREIgVEFCTEVTXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgLy8gVGFibGEgQ2xpZW50ZXNcclxuICAgIGNvbnN0IGNsaWVudGVzVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0NsaWVudGVzVGFibGUnLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogYCR7c3RhY2tOYW1lfS1DbGllbnRlc2AsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnY2xpZW50ZUlkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogdHJ1ZSxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR1NJIHBhcmEgYsO6c3F1ZWRhIHBvciBub21icmVcclxuICAgIGNsaWVudGVzVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xyXG4gICAgICBpbmRleE5hbWU6ICdub21icmUtaW5kZXgnLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ25vbWJyZScsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUYWJsYSBWZWhpY3Vsb3NcclxuICAgIGNvbnN0IHZlaGljdWxvc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdWZWhpY3Vsb3NUYWJsZScsIHtcclxuICAgICAgdGFibGVOYW1lOiBgJHtzdGFja05hbWV9LVZlaGljdWxvc2AsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAndmVoaWN1bG9JZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXHJcbiAgICAgIHBvaW50SW5UaW1lUmVjb3Zlcnk6IHRydWUsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcclxuICAgIH0pO1xyXG5cclxuICAgIHZlaGljdWxvc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAncGxhY2EtaW5kZXgnLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3BsYWNhJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZlaGljdWxvc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAnY3VzdG9tZXJJZC1pbmRleCcsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnY3VzdG9tZXJJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUYWJsYSBPcmRlbmVzVHJhYmFqb1xyXG4gICAgY29uc3Qgb3JkZW5lc1RyYWJham9UYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnT3JkZW5lc1RyYWJham9UYWJsZScsIHtcclxuICAgICAgdGFibGVOYW1lOiBgJHtzdGFja05hbWV9LU9yZGVuZXNUcmFiYWpvYCxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd3b3JrT3JkZXJJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXHJcbiAgICAgIHBvaW50SW5UaW1lUmVjb3Zlcnk6IHRydWUsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcclxuICAgIH0pO1xyXG5cclxuICAgIG9yZGVuZXNUcmFiYWpvVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xyXG4gICAgICBpbmRleE5hbWU6ICdlc3RhZG8tY3JlYWRvRW4taW5kZXgnLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2VzdGFkbycsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ2NyZWFkb0VuJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIG9yZGVuZXNUcmFiYWpvVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xyXG4gICAgICBpbmRleE5hbWU6ICdjdXN0b21lcklkLWluZGV4JyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdjdXN0b21lcklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRhYmxhIEludmVudGFyaW9JdGVtc1xyXG4gICAgY29uc3QgaW52ZW50YXJpb1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdJbnZlbnRhcmlvVGFibGUnLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogYCR7c3RhY2tOYW1lfS1JbnZlbnRhcmlvSXRlbXNgLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2ludmVudGFyaW9JdGVtSWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXHJcbiAgICB9KTtcclxuXHJcbiAgICBpbnZlbnRhcmlvVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xyXG4gICAgICBpbmRleE5hbWU6ICdza3UtaW5kZXgnLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3NrdScsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUYWJsYSBGYWN0dXJhc1xyXG4gICAgY29uc3QgZmFjdHVyYXNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnRmFjdHVyYXNUYWJsZScsIHtcclxuICAgICAgdGFibGVOYW1lOiBgJHtzdGFja05hbWV9LUZhY3R1cmFzYCxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdmYWN0dXJhSWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXHJcbiAgICB9KTtcclxuXHJcbiAgICBmYWN0dXJhc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAnbnVtZXJvRmFjdHVyYS1pbmRleCcsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnbnVtZXJvRmFjdHVyYScsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBmYWN0dXJhc1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcclxuICAgICAgaW5kZXhOYW1lOiAnZXN0YWRvLWNyZWFkb0VuLWluZGV4JyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdlc3RhZG8nLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICdjcmVhZG9FbicsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUYWJsYSBEZXRhbGxlcyAoSXRlbXMgZGUgT1QgKyBNb3ZpbWllbnRvcyBkZSBJbnZlbnRhcmlvKVxyXG4gICAgY29uc3QgZGV0YWxsZXNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnRGV0YWxsZXNUYWJsZScsIHtcclxuICAgICAgdGFibGVOYW1lOiBgJHtzdGFja05hbWV9LURldGFsbGVzYCxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdQSycsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ1NLJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogdHJ1ZSxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGFibGEgVXN1YXJpb3NcclxuICAgIGNvbnN0IHVzdWFyaW9zVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ1VzdWFyaW9zVGFibGUnLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogYCR7c3RhY2tOYW1lfS1Vc3Vhcmlvc2AsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAndXNlcklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGFibGEgQ29uZmlndXJhY2lvblRhbGxlclxyXG4gICAgY29uc3QgY29uZmlndXJhY2lvblRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdDb25maWd1cmFjaW9uVGFibGUnLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogYCR7c3RhY2tOYW1lfS1Db25maWd1cmFjaW9uVGFsbGVyYCxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdjb25maWcnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUYWJsYSBSb2xlc1Blcm1pc29zXHJcbiAgICBjb25zdCByb2xlc1Blcm1pc29zVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ1JvbGVzUGVybWlzb3NUYWJsZScsIHtcclxuICAgICAgdGFibGVOYW1lOiBgJHtzdGFja05hbWV9LVJvbGVzUGVybWlzb3NgLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3JvbElkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gUzMgQlVDS0VUIHBhcmEgUERGcyB5IGFyY2hpdm9zXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgY29uc3QgZG9jdW1lbnRzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnRG9jdW1lbnRzQnVja2V0Jywge1xyXG4gICAgICBidWNrZXROYW1lOiBgJHtzdGFja05hbWUudG9Mb3dlckNhc2UoKX0tZG9jdW1lbnRzYCxcclxuICAgICAgdmVyc2lvbmVkOiB0cnVlLFxyXG4gICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXHJcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcclxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBpZDogJ2FyY2hpdmUtb2xkLXBkZnMnLFxyXG4gICAgICAgICAgdHJhbnNpdGlvbnM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHN0b3JhZ2VDbGFzczogczMuU3RvcmFnZUNsYXNzLklORlJFUVVFTlRfQUNDRVNTLFxyXG4gICAgICAgICAgICAgIHRyYW5zaXRpb25BZnRlcjogY2RrLkR1cmF0aW9uLmRheXMoOTApLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgc3RvcmFnZUNsYXNzOiBzMy5TdG9yYWdlQ2xhc3MuR0xBQ0lFUixcclxuICAgICAgICAgICAgICB0cmFuc2l0aW9uQWZ0ZXI6IGNkay5EdXJhdGlvbi5kYXlzKDM2NSksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBDT0dOSVRPIFVTRVIgUE9PTFxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNvbnN0IHVzZXJQb29sID0gbmV3IGNvZ25pdG8uVXNlclBvb2wodGhpcywgJ1VzZXJQb29sJywge1xyXG4gICAgICB1c2VyUG9vbE5hbWU6IGAke3N0YWNrTmFtZX0tdXNlcnNgLFxyXG4gICAgICBzZWxmU2lnblVwRW5hYmxlZDogZmFsc2UsXHJcbiAgICAgIHNpZ25JbkFsaWFzZXM6IHtcclxuICAgICAgICBlbWFpbDogdHJ1ZSxcclxuICAgICAgICB1c2VybmFtZTogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgYXV0b1ZlcmlmeToge1xyXG4gICAgICAgIGVtYWlsOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICBwYXNzd29yZFBvbGljeToge1xyXG4gICAgICAgIG1pbkxlbmd0aDogOCxcclxuICAgICAgICByZXF1aXJlTG93ZXJjYXNlOiB0cnVlLFxyXG4gICAgICAgIHJlcXVpcmVVcHBlcmNhc2U6IHRydWUsXHJcbiAgICAgICAgcmVxdWlyZURpZ2l0czogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlU3ltYm9sczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgIGFjY291bnRSZWNvdmVyeTogY29nbml0by5BY2NvdW50UmVjb3ZlcnkuRU1BSUxfT05MWSxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgdXNlclBvb2xDbGllbnQgPSB1c2VyUG9vbC5hZGRDbGllbnQoJ1VzZXJQb29sQ2xpZW50Jywge1xyXG4gICAgICBhdXRoRmxvd3M6IHtcclxuICAgICAgICB1c2VyUGFzc3dvcmQ6IHRydWUsXHJcbiAgICAgICAgdXNlclNycDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgZ2VuZXJhdGVTZWNyZXQ6IGZhbHNlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gTEFNQkRBIExBWUVSIChzaGFyZWQgdXRpbGl0aWVzKVxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNvbnN0IHNoYXJlZExheWVyID0gbmV3IGxhbWJkYS5MYXllclZlcnNpb24odGhpcywgJ1NoYXJlZExheWVyJywge1xyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL3NoYXJlZCcpKSxcclxuICAgICAgY29tcGF0aWJsZVJ1bnRpbWVzOiBbbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTFdLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1NoYXJlZCB1dGlsaXRpZXMgZm9yIGFsbCBsYW1iZGFzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIFZBUklBQkxFUyBERSBFTlRPUk5PIENPTVVORVNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCBjb21tb25FbnZpcm9ubWVudCA9IHtcclxuICAgICAgQ0xJRU5URVNfVEFCTEU6IGNsaWVudGVzVGFibGUudGFibGVOYW1lLFxyXG4gICAgICBWRUhJQ1VMT1NfVEFCTEU6IHZlaGljdWxvc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgT1JERU5FU19UUkFCQUpPX1RBQkxFOiBvcmRlbmVzVHJhYmFqb1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgSU5WRU5UQVJJT19UQUJMRTogaW52ZW50YXJpb1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgRkFDVFVSQVNfVEFCTEU6IGZhY3R1cmFzVGFibGUudGFibGVOYW1lLFxyXG4gICAgICBERVRBTExFU19UQUJMRTogZGV0YWxsZXNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIFVTVUFSSU9TX1RBQkxFOiB1c3Vhcmlvc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgQ09ORklHVVJBQ0lPTl9UQUJMRTogY29uZmlndXJhY2lvblRhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgUk9MRVNfUEVSTUlTT1NfVEFCTEU6IHJvbGVzUGVybWlzb3NUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIERPQ1VNRU5UU19CVUNLRVQ6IGRvY3VtZW50c0J1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICBVU0VSX1BPT0xfSUQ6IHVzZXJQb29sLnVzZXJQb29sSWQsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIEFQSSBHQVRFV0FZXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnVGFsbGVyQXBpJywge1xyXG4gICAgICByZXN0QXBpTmFtZTogYCR7c3RhY2tOYW1lfS1BUElgLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBwYXJhIFNpc3RlbWEgZGUgR2VzdGnDs24gZGUgVGFsbGVyJyxcclxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XHJcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXHJcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXHJcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXHJcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcclxuICAgICAgICAgICdYLUFtei1EYXRlJyxcclxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcclxuICAgICAgICAgICdYLUFwaS1LZXknLFxyXG4gICAgICAgICAgJ1gtQW16LVNlY3VyaXR5LVRva2VuJyxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XHJcbiAgICAgICAgc3RhZ2VOYW1lOiAnYXBpJyxcclxuICAgICAgICB0aHJvdHRsaW5nUmF0ZUxpbWl0OiAxMDAsXHJcbiAgICAgICAgdGhyb3R0bGluZ0J1cnN0TGltaXQ6IDIwMCxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIExBTUJEQVMgLSBDVVNUT01FUlNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICAvLyBDdXN0b21lciBDcmVhdGVcclxuICAgIGNvbnN0IGN1c3RvbWVyQ3JlYXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ3VzdG9tZXJDcmVhdGVGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICdjcmVhdGUubGFtYmRhX2hhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL2N1c3RvbWVycycpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBjbGllbnRlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShjdXN0b21lckNyZWF0ZUxhbWJkYSk7XHJcblxyXG4gICAgLy8gQ3VzdG9tZXIgUmVhZFxyXG4gICAgY29uc3QgY3VzdG9tZXJSZWFkTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ3VzdG9tZXJSZWFkRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxyXG4gICAgICBoYW5kbGVyOiAncmVhZC5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvY3VzdG9tZXJzJykpLFxyXG4gICAgICBlbnZpcm9ubWVudDogY29tbW9uRW52aXJvbm1lbnQsXHJcbiAgICAgIGxheWVyczogW3NoYXJlZExheWVyXSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuICAgIGNsaWVudGVzVGFibGUuZ3JhbnRSZWFkRGF0YShjdXN0b21lclJlYWRMYW1iZGEpO1xyXG5cclxuICAgIC8vIEN1c3RvbWVyIFVwZGF0ZVxyXG4gICAgY29uc3QgY3VzdG9tZXJVcGRhdGVMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDdXN0b21lclVwZGF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3VwZGF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvY3VzdG9tZXJzJykpLFxyXG4gICAgICBlbnZpcm9ubWVudDogY29tbW9uRW52aXJvbm1lbnQsXHJcbiAgICAgIGxheWVyczogW3NoYXJlZExheWVyXSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuICAgIGNsaWVudGVzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGN1c3RvbWVyVXBkYXRlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBDdXN0b21lciBEZWxldGVcclxuICAgIGNvbnN0IGN1c3RvbWVyRGVsZXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ3VzdG9tZXJEZWxldGVGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICdkZWxldGUubGFtYmRhX2hhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL2N1c3RvbWVycycpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBjbGllbnRlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShjdXN0b21lckRlbGV0ZUxhbWJkYSk7XHJcbiAgICBvcmRlbmVzVHJhYmFqb1RhYmxlLmdyYW50UmVhZERhdGEoY3VzdG9tZXJEZWxldGVMYW1iZGEpO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIExBTUJEQVMgLSBWRUhJQ0xFU1xyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIC8vIFZlaGljbGUgQ3JlYXRlXHJcbiAgICBjb25zdCB2ZWhpY2xlQ3JlYXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVmVoaWNsZUNyZWF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ2NyZWF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvdmVoaWNsZXMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgdmVoaWN1bG9zVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHZlaGljbGVDcmVhdGVMYW1iZGEpO1xyXG4gICAgY2xpZW50ZXNUYWJsZS5ncmFudFJlYWREYXRhKHZlaGljbGVDcmVhdGVMYW1iZGEpO1xyXG5cclxuICAgIC8vIFZlaGljbGUgUmVhZFxyXG4gICAgY29uc3QgdmVoaWNsZVJlYWRMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdWZWhpY2xlUmVhZEZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3JlYWQubGFtYmRhX2hhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL3ZlaGljbGVzJykpLFxyXG4gICAgICBlbnZpcm9ubWVudDogY29tbW9uRW52aXJvbm1lbnQsXHJcbiAgICAgIGxheWVyczogW3NoYXJlZExheWVyXSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuICAgIHZlaGljdWxvc1RhYmxlLmdyYW50UmVhZERhdGEodmVoaWNsZVJlYWRMYW1iZGEpO1xyXG5cclxuICAgIC8vIFZlaGljbGUgVXBkYXRlXHJcbiAgICBjb25zdCB2ZWhpY2xlVXBkYXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVmVoaWNsZVVwZGF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3VwZGF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvdmVoaWNsZXMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgdmVoaWN1bG9zVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHZlaGljbGVVcGRhdGVMYW1iZGEpO1xyXG5cclxuICAgIC8vIFZlaGljbGUgRGVsZXRlXHJcbiAgICBjb25zdCB2ZWhpY2xlRGVsZXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVmVoaWNsZURlbGV0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ2RlbGV0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvdmVoaWNsZXMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgdmVoaWN1bG9zVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHZlaGljbGVEZWxldGVMYW1iZGEpO1xyXG4gICAgb3JkZW5lc1RyYWJham9UYWJsZS5ncmFudFJlYWREYXRhKHZlaGljbGVEZWxldGVMYW1iZGEpO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIExBTUJEQVMgLSBJTlZFTlRPUllcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICAvLyBJbnZlbnRvcnkgQ3JlYXRlXHJcbiAgICBjb25zdCBpbnZlbnRvcnlDcmVhdGVMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbnZlbnRvcnlDcmVhdGVGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICdjcmVhdGUubGFtYmRhX2hhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL2ludmVudG9yeScpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHsgLi4uY29tbW9uRW52aXJvbm1lbnQsIElOVkVOVEFSSU9fSVRFTVNfVEFCTEU6IGludmVudGFyaW9UYWJsZS50YWJsZU5hbWUgfSxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgaW52ZW50YXJpb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnZlbnRvcnlDcmVhdGVMYW1iZGEpO1xyXG4gICAgZGV0YWxsZXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoaW52ZW50b3J5Q3JlYXRlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBJbnZlbnRvcnkgUmVhZFxyXG4gICAgY29uc3QgaW52ZW50b3J5UmVhZExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ludmVudG9yeVJlYWRGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICdyZWFkLmxhbWJkYV9oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhcy9pbnZlbnRvcnknKSksXHJcbiAgICAgIGVudmlyb25tZW50OiB7IC4uLmNvbW1vbkVudmlyb25tZW50LCBJTlZFTlRBUklPX0lURU1TX1RBQkxFOiBpbnZlbnRhcmlvVGFibGUudGFibGVOYW1lIH0sXHJcbiAgICAgIGxheWVyczogW3NoYXJlZExheWVyXSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuICAgIGludmVudGFyaW9UYWJsZS5ncmFudFJlYWREYXRhKGludmVudG9yeVJlYWRMYW1iZGEpO1xyXG5cclxuICAgIC8vIEludmVudG9yeSBVcGRhdGVcclxuICAgIGNvbnN0IGludmVudG9yeVVwZGF0ZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ludmVudG9yeVVwZGF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3VwZGF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvaW52ZW50b3J5JykpLFxyXG4gICAgICBlbnZpcm9ubWVudDogeyAuLi5jb21tb25FbnZpcm9ubWVudCwgSU5WRU5UQVJJT19JVEVNU19UQUJMRTogaW52ZW50YXJpb1RhYmxlLnRhYmxlTmFtZSB9LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBpbnZlbnRhcmlvVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGludmVudG9yeVVwZGF0ZUxhbWJkYSk7XHJcblxyXG4gICAgLy8gSW52ZW50b3J5IERlbGV0ZVxyXG4gICAgY29uc3QgaW52ZW50b3J5RGVsZXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW52ZW50b3J5RGVsZXRlRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxyXG4gICAgICBoYW5kbGVyOiAnZGVsZXRlLmxhbWJkYV9oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhcy9pbnZlbnRvcnknKSksXHJcbiAgICAgIGVudmlyb25tZW50OiB7IC4uLmNvbW1vbkVudmlyb25tZW50LCBJTlZFTlRBUklPX0lURU1TX1RBQkxFOiBpbnZlbnRhcmlvVGFibGUudGFibGVOYW1lIH0sXHJcbiAgICAgIGxheWVyczogW3NoYXJlZExheWVyXSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuICAgIGludmVudGFyaW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoaW52ZW50b3J5RGVsZXRlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBJbnZlbnRvcnkgTW92ZW1lbnRcclxuICAgIGNvbnN0IGludmVudG9yeU1vdmVtZW50TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW52ZW50b3J5TW92ZW1lbnRGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICdtb3ZlbWVudC5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvaW52ZW50b3J5JykpLFxyXG4gICAgICBlbnZpcm9ubWVudDogeyAuLi5jb21tb25FbnZpcm9ubWVudCwgSU5WRU5UQVJJT19JVEVNU19UQUJMRTogaW52ZW50YXJpb1RhYmxlLnRhYmxlTmFtZSB9LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBpbnZlbnRhcmlvVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGludmVudG9yeU1vdmVtZW50TGFtYmRhKTtcclxuICAgIGRldGFsbGVzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGludmVudG9yeU1vdmVtZW50TGFtYmRhKTtcclxuXHJcbiAgICAvLyBJbnZlbnRvcnkgTGlzdCBNb3ZlbWVudHNcclxuICAgIGNvbnN0IGludmVudG9yeUxpc3RNb3ZlbWVudHNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbnZlbnRvcnlMaXN0TW92ZW1lbnRzRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxyXG4gICAgICBoYW5kbGVyOiAnbGlzdF9tb3ZlbWVudHMubGFtYmRhX2hhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL2ludmVudG9yeScpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBkZXRhbGxlc1RhYmxlLmdyYW50UmVhZERhdGEoaW52ZW50b3J5TGlzdE1vdmVtZW50c0xhbWJkYSk7XHJcblxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gTEFNQkRBUyAtIFdPUksgT1JERVJTXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgLy8gV29yayBPcmRlciBDcmVhdGVcclxuICAgIGNvbnN0IHdvcmtPcmRlckNyZWF0ZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1dvcmtPcmRlckNyZWF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ2NyZWF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvd29ya19vcmRlcnMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgb3JkZW5lc1RyYWJham9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEod29ya09yZGVyQ3JlYXRlTGFtYmRhKTtcclxuICAgIGNsaWVudGVzVGFibGUuZ3JhbnRSZWFkRGF0YSh3b3JrT3JkZXJDcmVhdGVMYW1iZGEpO1xyXG4gICAgdmVoaWN1bG9zVGFibGUuZ3JhbnRSZWFkRGF0YSh3b3JrT3JkZXJDcmVhdGVMYW1iZGEpO1xyXG5cclxuICAgIC8vIFdvcmsgT3JkZXIgUmVhZFxyXG4gICAgY29uc3Qgd29ya09yZGVyUmVhZExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1dvcmtPcmRlclJlYWRGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICdyZWFkLmxhbWJkYV9oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhcy93b3JrX29yZGVycycpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBvcmRlbmVzVHJhYmFqb1RhYmxlLmdyYW50UmVhZERhdGEod29ya09yZGVyUmVhZExhbWJkYSk7XHJcbiAgICBkZXRhbGxlc1RhYmxlLmdyYW50UmVhZERhdGEod29ya09yZGVyUmVhZExhbWJkYSk7XHJcblxyXG4gICAgLy8gV29yayBPcmRlciBVcGRhdGVcclxuICAgIGNvbnN0IHdvcmtPcmRlclVwZGF0ZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1dvcmtPcmRlclVwZGF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3VwZGF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvd29ya19vcmRlcnMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgb3JkZW5lc1RyYWJham9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEod29ya09yZGVyVXBkYXRlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBXb3JrIE9yZGVyIFVwZGF0ZSBTdGF0ZVxyXG4gICAgY29uc3Qgd29ya09yZGVyVXBkYXRlU3RhdGVMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdXb3JrT3JkZXJVcGRhdGVTdGF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3VwZGF0ZV9zdGF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvd29ya19vcmRlcnMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgb3JkZW5lc1RyYWJham9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEod29ya09yZGVyVXBkYXRlU3RhdGVMYW1iZGEpO1xyXG4gICAgZGV0YWxsZXNUYWJsZS5ncmFudFJlYWREYXRhKHdvcmtPcmRlclVwZGF0ZVN0YXRlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBXb3JrIE9yZGVyIERlbGV0ZVxyXG4gICAgY29uc3Qgd29ya09yZGVyRGVsZXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnV29ya09yZGVyRGVsZXRlRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxyXG4gICAgICBoYW5kbGVyOiAnZGVsZXRlLmxhbWJkYV9oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhcy93b3JrX29yZGVycycpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBvcmRlbmVzVHJhYmFqb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh3b3JrT3JkZXJEZWxldGVMYW1iZGEpO1xyXG5cclxuICAgIC8vIFdvcmsgT3JkZXIgQWRkIEl0ZW1cclxuICAgIGNvbnN0IHdvcmtPcmRlckFkZEl0ZW1MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdXb3JrT3JkZXJBZGRJdGVtRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxyXG4gICAgICBoYW5kbGVyOiAnYWRkX2l0ZW0ubGFtYmRhX2hhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL3dvcmtfb3JkZXJzJykpLFxyXG4gICAgICBlbnZpcm9ubWVudDogeyAuLi5jb21tb25FbnZpcm9ubWVudCwgSU5WRU5UQVJJT19JVEVNU19UQUJMRTogaW52ZW50YXJpb1RhYmxlLnRhYmxlTmFtZSB9LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDE1KSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBvcmRlbmVzVHJhYmFqb1RhYmxlLmdyYW50UmVhZERhdGEod29ya09yZGVyQWRkSXRlbUxhbWJkYSk7XHJcbiAgICBkZXRhbGxlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh3b3JrT3JkZXJBZGRJdGVtTGFtYmRhKTtcclxuICAgIGludmVudGFyaW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEod29ya09yZGVyQWRkSXRlbUxhbWJkYSk7XHJcblxyXG4gICAgLy8gV29yayBPcmRlciBVcGRhdGUgSXRlbVxyXG4gICAgY29uc3Qgd29ya09yZGVyVXBkYXRlSXRlbUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1dvcmtPcmRlclVwZGF0ZUl0ZW1GdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICd1cGRhdGVfaXRlbS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvd29ya19vcmRlcnMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiB7IC4uLmNvbW1vbkVudmlyb25tZW50LCBJTlZFTlRBUklPX0lURU1TX1RBQkxFOiBpbnZlbnRhcmlvVGFibGUudGFibGVOYW1lIH0sXHJcbiAgICAgIGxheWVyczogW3NoYXJlZExheWVyXSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTUpLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuICAgIG9yZGVuZXNUcmFiYWpvVGFibGUuZ3JhbnRSZWFkRGF0YSh3b3JrT3JkZXJVcGRhdGVJdGVtTGFtYmRhKTtcclxuICAgIGRldGFsbGVzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHdvcmtPcmRlclVwZGF0ZUl0ZW1MYW1iZGEpO1xyXG4gICAgaW52ZW50YXJpb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh3b3JrT3JkZXJVcGRhdGVJdGVtTGFtYmRhKTtcclxuXHJcbiAgICAvLyBXb3JrIE9yZGVyIERlbGV0ZSBJdGVtXHJcbiAgICBjb25zdCB3b3JrT3JkZXJEZWxldGVJdGVtTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnV29ya09yZGVyRGVsZXRlSXRlbUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ2RlbGV0ZV9pdGVtLmxhbWJkYV9oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhcy93b3JrX29yZGVycycpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHsgLi4uY29tbW9uRW52aXJvbm1lbnQsIElOVkVOVEFSSU9fSVRFTVNfVEFCTEU6IGludmVudGFyaW9UYWJsZS50YWJsZU5hbWUgfSxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxNSksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgb3JkZW5lc1RyYWJham9UYWJsZS5ncmFudFJlYWREYXRhKHdvcmtPcmRlckRlbGV0ZUl0ZW1MYW1iZGEpO1xyXG4gICAgZGV0YWxsZXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEod29ya09yZGVyRGVsZXRlSXRlbUxhbWJkYSk7XHJcbiAgICBpbnZlbnRhcmlvVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHdvcmtPcmRlckRlbGV0ZUl0ZW1MYW1iZGEpO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIExBTUJEQVMgLSBJTlZPSUNFU1xyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIC8vIEludm9pY2UgQ3JlYXRlXHJcbiAgICBjb25zdCBpbnZvaWNlQ3JlYXRlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW52b2ljZUNyZWF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ2NyZWF0ZS5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvaW52b2ljZXMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiB7IC4uLmNvbW1vbkVudmlyb25tZW50LCBDT05GSUdVUkFDSU9OX1RBTExFUl9UQUJMRTogY29uZmlndXJhY2lvblRhYmxlLnRhYmxlTmFtZSB9LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDE1KSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBmYWN0dXJhc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnZvaWNlQ3JlYXRlTGFtYmRhKTtcclxuICAgIG9yZGVuZXNUcmFiYWpvVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGludm9pY2VDcmVhdGVMYW1iZGEpO1xyXG4gICAgZGV0YWxsZXNUYWJsZS5ncmFudFJlYWREYXRhKGludm9pY2VDcmVhdGVMYW1iZGEpO1xyXG4gICAgY29uZmlndXJhY2lvblRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnZvaWNlQ3JlYXRlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBJbnZvaWNlIFJlYWRcclxuICAgIGNvbnN0IGludm9pY2VSZWFkTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW52b2ljZVJlYWRGdW5jdGlvbicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXHJcbiAgICAgIGhhbmRsZXI6ICdyZWFkLmxhbWJkYV9oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhcy9pbnZvaWNlcycpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBmYWN0dXJhc1RhYmxlLmdyYW50UmVhZERhdGEoaW52b2ljZVJlYWRMYW1iZGEpO1xyXG5cclxuICAgIC8vIEludm9pY2UgQW51bGFyXHJcbiAgICBjb25zdCBpbnZvaWNlQW51bGFyTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW52b2ljZUFudWxhckZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ2FudWxhci5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvaW52b2ljZXMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiBjb21tb25FbnZpcm9ubWVudCxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgZmFjdHVyYXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoaW52b2ljZUFudWxhckxhbWJkYSk7XHJcblxyXG4gICAgLy8gSW52b2ljZSBSZWdpc3RyYXIgUGFnb1xyXG4gICAgY29uc3QgaW52b2ljZVJlZ2lzdHJhclBhZ29MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbnZvaWNlUmVnaXN0cmFyUGFnb0Z1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3JlZ2lzdHJhcl9wYWdvLmxhbWJkYV9oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vbGFtYmRhcy9pbnZvaWNlcycpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IGNvbW1vbkVudmlyb25tZW50LFxyXG4gICAgICBsYXllcnM6IFtzaGFyZWRMYXllcl0sXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgfSk7XHJcbiAgICBmYWN0dXJhc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnZvaWNlUmVnaXN0cmFyUGFnb0xhbWJkYSk7XHJcblxyXG4gICAgLy8gVmVudGEgUmFwaWRhIENyZWF0ZVxyXG4gICAgY29uc3QgdmVudGFSYXBpZGFDcmVhdGVMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdWZW50YVJhcGlkYUNyZWF0ZUZ1bmN0aW9uJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcclxuICAgICAgaGFuZGxlcjogJ3ZlbnRhX3JhcGlkYV9jcmVhdGUubGFtYmRhX2hhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICcuLi8uLi9sYW1iZGFzL2ludm9pY2VzJykpLFxyXG4gICAgICBlbnZpcm9ubWVudDogeyAuLi5jb21tb25FbnZpcm9ubWVudCwgQ09ORklHVVJBQ0lPTl9UQUxMRVJfVEFCTEU6IGNvbmZpZ3VyYWNpb25UYWJsZS50YWJsZU5hbWUsIElOVkVOVEFSSU9fSVRFTVNfVEFCTEU6IGludmVudGFyaW9UYWJsZS50YWJsZU5hbWUgfSxcclxuICAgICAgbGF5ZXJzOiBbc2hhcmVkTGF5ZXJdLFxyXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxNSksXHJcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcclxuICAgIH0pO1xyXG4gICAgZmFjdHVyYXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEodmVudGFSYXBpZGFDcmVhdGVMYW1iZGEpO1xyXG4gICAgaW52ZW50YXJpb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh2ZW50YVJhcGlkYUNyZWF0ZUxhbWJkYSk7XHJcbiAgICBkZXRhbGxlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh2ZW50YVJhcGlkYUNyZWF0ZUxhbWJkYSk7XHJcbiAgICBjb25maWd1cmFjaW9uVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHZlbnRhUmFwaWRhQ3JlYXRlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBWZW50YSBSYXBpZGEgQW51bGFyXHJcbiAgICBjb25zdCB2ZW50YVJhcGlkYUFudWxhckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1ZlbnRhUmFwaWRhQW51bGFyRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxyXG4gICAgICBoYW5kbGVyOiAndmVudGFfcmFwaWRhX2FudWxhci5sYW1iZGFfaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgJy4uLy4uL2xhbWJkYXMvaW52b2ljZXMnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiB7IC4uLmNvbW1vbkVudmlyb25tZW50LCBJTlZFTlRBUklPX0lURU1TX1RBQkxFOiBpbnZlbnRhcmlvVGFibGUudGFibGVOYW1lIH0sXHJcbiAgICAgIGxheWVyczogW3NoYXJlZExheWVyXSxcclxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTUpLFxyXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXHJcbiAgICB9KTtcclxuICAgIGZhY3R1cmFzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHZlbnRhUmFwaWRhQW51bGFyTGFtYmRhKTtcclxuICAgIGludmVudGFyaW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEodmVudGFSYXBpZGFBbnVsYXJMYW1iZGEpO1xyXG4gICAgZGV0YWxsZXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEodmVudGFSYXBpZGFBbnVsYXJMYW1iZGEpO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIEFQSSBST1VURVMgLSBDVVNUT01FUlNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCBjdXN0b21lcnMgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnY3VzdG9tZXJzJyk7XHJcbiAgICBjdXN0b21lcnMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3VzdG9tZXJDcmVhdGVMYW1iZGEpKTtcclxuICAgIGN1c3RvbWVycy5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN1c3RvbWVyUmVhZExhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IGN1c3RvbWVyID0gY3VzdG9tZXJzLmFkZFJlc291cmNlKCd7Y2xpZW50ZUlkfScpO1xyXG4gICAgY3VzdG9tZXIuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdXN0b21lclJlYWRMYW1iZGEpKTtcclxuICAgIGN1c3RvbWVyLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3VzdG9tZXJVcGRhdGVMYW1iZGEpKTtcclxuICAgIGN1c3RvbWVyLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3VzdG9tZXJEZWxldGVMYW1iZGEpKTtcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBBUEkgUk9VVEVTIC0gVkVISUNMRVNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCB2ZWhpY2xlcyA9IGFwaS5yb290LmFkZFJlc291cmNlKCd2ZWhpY2xlcycpO1xyXG4gICAgdmVoaWNsZXMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odmVoaWNsZUNyZWF0ZUxhbWJkYSkpO1xyXG4gICAgdmVoaWNsZXMuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih2ZWhpY2xlUmVhZExhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IHZlaGljbGUgPSB2ZWhpY2xlcy5hZGRSZXNvdXJjZSgne3ZlaGljdWxvSWR9Jyk7XHJcbiAgICB2ZWhpY2xlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odmVoaWNsZVJlYWRMYW1iZGEpKTtcclxuICAgIHZlaGljbGUuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih2ZWhpY2xlVXBkYXRlTGFtYmRhKSk7XHJcbiAgICB2ZWhpY2xlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odmVoaWNsZURlbGV0ZUxhbWJkYSkpO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIEFQSSBST1VURVMgLSBJTlZFTlRPUllcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCBpbnZlbnRvcnkgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnaW52ZW50b3J5Jyk7XHJcbiAgICBpbnZlbnRvcnkuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW52ZW50b3J5Q3JlYXRlTGFtYmRhKSk7XHJcbiAgICBpbnZlbnRvcnkuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnZlbnRvcnlSZWFkTGFtYmRhKSk7XHJcblxyXG4gICAgY29uc3QgaW52ZW50b3J5SXRlbSA9IGludmVudG9yeS5hZGRSZXNvdXJjZSgne2ludmVudGFyaW9JdGVtSWR9Jyk7XHJcbiAgICBpbnZlbnRvcnlJdGVtLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW52ZW50b3J5UmVhZExhbWJkYSkpO1xyXG4gICAgaW52ZW50b3J5SXRlbS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGludmVudG9yeVVwZGF0ZUxhbWJkYSkpO1xyXG4gICAgaW52ZW50b3J5SXRlbS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGludmVudG9yeURlbGV0ZUxhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IGludmVudG9yeU1vdmVtZW50cyA9IGludmVudG9yeS5hZGRSZXNvdXJjZSgnbW92ZW1lbnRzJyk7XHJcbiAgICBpbnZlbnRvcnlNb3ZlbWVudHMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW52ZW50b3J5TW92ZW1lbnRMYW1iZGEpKTtcclxuICAgIGludmVudG9yeU1vdmVtZW50cy5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGludmVudG9yeUxpc3RNb3ZlbWVudHNMYW1iZGEpKTtcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBBUEkgUk9VVEVTIC0gV09SSyBPUkRFUlNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCB3b3JrT3JkZXJzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3dvcmstb3JkZXJzJyk7XHJcbiAgICB3b3JrT3JkZXJzLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHdvcmtPcmRlckNyZWF0ZUxhbWJkYSkpO1xyXG4gICAgd29ya09yZGVycy5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHdvcmtPcmRlclJlYWRMYW1iZGEpKTtcclxuXHJcbiAgICBjb25zdCB3b3JrT3JkZXIgPSB3b3JrT3JkZXJzLmFkZFJlc291cmNlKCd7d29ya09yZGVySWR9Jyk7XHJcbiAgICB3b3JrT3JkZXIuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih3b3JrT3JkZXJSZWFkTGFtYmRhKSk7XHJcbiAgICB3b3JrT3JkZXIuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih3b3JrT3JkZXJVcGRhdGVMYW1iZGEpKTtcclxuICAgIHdvcmtPcmRlci5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHdvcmtPcmRlckRlbGV0ZUxhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IHdvcmtPcmRlclN0YXRlID0gd29ya09yZGVyLmFkZFJlc291cmNlKCdzdGF0ZScpO1xyXG4gICAgd29ya09yZGVyU3RhdGUuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih3b3JrT3JkZXJVcGRhdGVTdGF0ZUxhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IHdvcmtPcmRlckl0ZW1zID0gd29ya09yZGVyLmFkZFJlc291cmNlKCdpdGVtcycpO1xyXG4gICAgd29ya09yZGVySXRlbXMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24od29ya09yZGVyQWRkSXRlbUxhbWJkYSkpO1xyXG4gICAgd29ya09yZGVySXRlbXMuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih3b3JrT3JkZXJVcGRhdGVJdGVtTGFtYmRhKSk7XHJcbiAgICB3b3JrT3JkZXJJdGVtcy5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHdvcmtPcmRlckRlbGV0ZUl0ZW1MYW1iZGEpKTtcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBBUEkgUk9VVEVTIC0gSU5WT0lDRVNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCBpbnZvaWNlcyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdpbnZvaWNlcycpO1xyXG4gICAgaW52b2ljZXMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW52b2ljZUNyZWF0ZUxhbWJkYSkpO1xyXG4gICAgaW52b2ljZXMuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnZvaWNlUmVhZExhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IGludm9pY2UgPSBpbnZvaWNlcy5hZGRSZXNvdXJjZSgne2ZhY3R1cmFJZH0nKTtcclxuICAgIGludm9pY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnZvaWNlUmVhZExhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IGludm9pY2VBbnVsYXIgPSBpbnZvaWNlLmFkZFJlc291cmNlKCdhbnVsYXInKTtcclxuICAgIGludm9pY2VBbnVsYXIuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW52b2ljZUFudWxhckxhbWJkYSkpO1xyXG5cclxuICAgIGNvbnN0IGludm9pY2VQYWdvID0gaW52b2ljZS5hZGRSZXNvdXJjZSgncGFnbycpO1xyXG4gICAgaW52b2ljZVBhZ28uYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW52b2ljZVJlZ2lzdHJhclBhZ29MYW1iZGEpKTtcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBBUEkgUk9VVEVTIC0gVkVOVEFTIFJBUElEQVNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCB2ZW50YXNSYXBpZGFzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3ZlbnRhcy1yYXBpZGFzJyk7XHJcbiAgICB2ZW50YXNSYXBpZGFzLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHZlbnRhUmFwaWRhQ3JlYXRlTGFtYmRhKSk7XHJcblxyXG4gICAgY29uc3QgdmVudGFSYXBpZGEgPSB2ZW50YXNSYXBpZGFzLmFkZFJlc291cmNlKCd7ZmFjdHVyYUlkfScpO1xyXG4gICAgY29uc3QgdmVudGFSYXBpZGFBbnVsYXIgPSB2ZW50YVJhcGlkYS5hZGRSZXNvdXJjZSgnYW51bGFyJyk7XHJcbiAgICB2ZW50YVJhcGlkYUFudWxhci5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih2ZW50YVJhcGlkYUFudWxhckxhbWJkYSkpO1xyXG5cclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIE9VVFBVVFNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpVXJsJywge1xyXG4gICAgICB2YWx1ZTogYXBpLnVybCxcclxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgR2F0ZXdheSBVUkwnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VzZXJQb29sSWQnLCB7XHJcbiAgICAgIHZhbHVlOiB1c2VyUG9vbC51c2VyUG9vbElkLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvZ25pdG8gVXNlciBQb29sIElEJyxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdVc2VyUG9vbENsaWVudElkJywge1xyXG4gICAgICB2YWx1ZTogdXNlclBvb2xDbGllbnQudXNlclBvb2xDbGllbnRJZCxcclxuICAgICAgZGVzY3JpcHRpb246ICdDb2duaXRvIFVzZXIgUG9vbCBDbGllbnQgSUQnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0RvY3VtZW50c0J1Y2tldE5hbWUnLCB7XHJcbiAgICAgIHZhbHVlOiBkb2N1bWVudHNCdWNrZXQuYnVja2V0TmFtZSxcclxuICAgICAgZGVzY3JpcHRpb246ICdTMyBCdWNrZXQgZm9yIGRvY3VtZW50cycsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHdWFyZGFyIHJlZmVyZW5jaWFzIHBhcmEgdXNhciBlbiBvdHJvcyBjb25zdHJ1Y3RzXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpSWRFeHBvcnQnLCB7XHJcbiAgICAgIHZhbHVlOiBhcGkucmVzdEFwaUlkLFxyXG4gICAgICBleHBvcnROYW1lOiBgJHtzdGFja05hbWV9LUFwaUlkYCxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2xpZW50ZXNUYWJsZUV4cG9ydCcsIHtcclxuICAgICAgdmFsdWU6IGNsaWVudGVzVGFibGUudGFibGVOYW1lLFxyXG4gICAgICBleHBvcnROYW1lOiBgJHtzdGFja05hbWV9LUNsaWVudGVzVGFibGVgLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==