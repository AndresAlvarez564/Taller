import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { join } from 'path';

export class TallerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/shared')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/customers')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/customers')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/customers')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/customers')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/vehicles')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/vehicles')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/vehicles')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/vehicles')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/inventory')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/inventory')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/inventory')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/inventory')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/inventory')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/inventory')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
      environment: { ...commonEnvironment, INVENTARIO_ITEMS_TABLE: inventarioTable.tableName },
      layers: [sharedLayer],
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
    });
    ordenesTrabajoTable.grantReadWriteData(workOrderAddItemLambda);
    detallesTable.grantReadWriteData(workOrderAddItemLambda);
    inventarioTable.grantReadWriteData(workOrderAddItemLambda);

    // Work Order Update Item
    const workOrderUpdateItemLambda = new lambda.Function(this, 'WorkOrderUpdateItemFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'update_item.lambda_handler',
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/work_orders')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/invoices')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/invoices')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/invoices')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/invoices')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/invoices')),
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
      code: lambda.Code.fromAsset(join(__dirname, '../../lambdas/invoices')),
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
