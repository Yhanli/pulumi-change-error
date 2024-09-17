import { web } from "@pulumi/azure-native";
import { resourceGroupName } from "./env";
// import { containerIp } from "./container-instance";

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

      // add the container instance config later to trigger the error
      // this does not throw error if both resource gets create for the first time.

      //   appSettings: [
      //     {
      //       name: "AV_HOST",
      //       value: containerIp,
      //     },
      //     {
      //       name: "AV_PORT",
      //       value: "3310",
      //     },
      //   ],
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
