import { containerinstance } from "@pulumi/azure-native";
import { resourceGroupName } from "./env";

export const containerGroup = new containerinstance.ContainerGroup(
  containerInstanceName,
  {
    containerGroupName: containerInstanceName,
    resourceGroupName: resourceGroupName,
    osType: "Linux",
    restartPolicy: "OnFailure",
    containers: [
      {
        // Anti virus
        name: `test-av-container`,
        image: "mkodockx/docker-clamav:1.1.2-alpine",
        resources: {
          requests: {
            cpu: 1,
            memoryInGB: 2,
          },
        },
        command: [],
        ports: [
          {
            port: 80,
            protocol: containerinstance.ContainerNetworkProtocol.TCP,
          },
          {
            port: 3310,
            protocol: containerinstance.ContainerNetworkProtocol.TCP,
          },
        ],
      },
    ],
    ipAddress: {
      ports: [
        {
          port: 80,
          protocol: containerinstance.ContainerNetworkProtocol.TCP,
        },
        {
          port: 3310,
          protocol: containerinstance.ContainerNetworkProtocol.TCP,
        },
      ],
      type: containerinstance.ContainerGroupIpAddressType.Private,
    },
  }
);

const containerIpRes = containerGroup.ipAddress.apply(
  (ipRes) => ipRes?.ip || ""
);
export const containerIp = containerIpRes;
