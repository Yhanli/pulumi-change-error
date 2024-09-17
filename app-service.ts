import { web } from "@pulumi/azure-native";
import { containerIp } from "./container-instance";

const resourceGroupName = "NZ-SYD-LHS-SANDBOX-ARG-HAN";

export const appServicePlan = new web.AppServicePlan(
  `test-asp-sbx`,
  {
    resourceGroupName: resourceGroupName,
    name: `test-asp-sbx`,
    kind: "Linux,Container",
    reserved: true,
    sku: {
      name: "B2",
    },
  },
  {
    ignoreChanges: ["tags"],
    customTimeouts: { create: "30m", update: "30m", delete: "30m" },
  }
);

const webAppServiceName = `test-pulumi-error-app`;

const restAPI = new web.WebApp(
  webAppServiceName,
  {
    resourceGroupName: resourceGroupName,
    name: webAppServiceName,
    serverFarmId: appServicePlan.id.apply((id) => id),
    vnetRouteAllEnabled: true,
    clientCertEnabled: false,
    httpsOnly: true,
    identity: {
      type: web.ManagedServiceIdentityType.SystemAssigned,
    },
    siteConfig: {
      publicNetworkAccess: "Disabled",
      ftpsState: web.FtpsState.FtpsOnly,
      alwaysOn: true,
      numberOfWorkers: 2,
      linuxFxVersion: "DOCKER|nginx:latest",
      healthCheckPath: "/",

      httpLoggingEnabled: true,
      logsDirectorySizeLimit: 35,
      appSettings: [
        {
          name: "AV_HOST",
          value: containerIp,
        },
        {
          name: "AV_PORT",
          value: "3310",
        },
      ],
    },
  },
  {
    dependsOn: [appServicePlan],
    ignoreChanges: [
      "tags",
      "siteConfig.linuxFxVersion",
      "siteConfig.healthCheckPath",
    ],
    customTimeouts: {
      create: "30m",
      update: "30m",
      delete: "30m",
    },
  }
);
