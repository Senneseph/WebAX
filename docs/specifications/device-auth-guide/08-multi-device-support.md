# Multi-Device Support

## Introduction

This section covers the implementation of multi-device support for device-based authentication in WebAX applications. It builds upon the browser-centric approach introduced earlier and focuses on managing multiple devices, synchronizing data between them, and providing a seamless user experience across all devices using web standards.

## Key Concepts

### Device Groups

A device group is a collection of devices that belong to the same user. The first device registered is designated as the owner device, which has special privileges for managing the group.

### Device Pairing

Device pairing is the process of adding a new device to a device group. This involves:

1. Generating a temporary pairing code on the owner device
2. Entering the code on the new device
3. Establishing a secure connection between devices
4. Authorizing the new device
5. Sharing necessary encryption keys and device information

### Data Synchronization

Data synchronization ensures that all devices in a group have access to the same data. This includes:

1. Application data
2. Device registry information
3. Authentication tokens
4. User preferences

### Access Management

Access management involves controlling which devices have access to the application and what they can do:

1. Viewing all paired devices
2. Revoking access for specific devices
3. Transferring ownership to another device
4. Setting device-specific permissions

## Implementation

### Device Registry Synchronization

The device registry must be synchronized across all devices in the group using WebRTC for direct device-to-device communication:

```javascript
class DeviceSynchronizer {
  constructor(deviceRegistry) {
    this.deviceRegistry = deviceRegistry;
    this.peerConnections = new Map();
    this.dataChannels = new Map();
  }

  /**
   * Initialize WebRTC connections with paired devices
   */
  async initializeConnections() {
    const registry = await this.deviceRegistry.getRegistry();
    const currentDevice = await this.deviceRegistry.getCurrentDevice();

    // Connect to each paired device
    for (const device of registry.devices) {
      // Skip the current device
      if (device.id === currentDevice.id) continue;

      // Skip devices that are not active
      if (device.status !== 'active') continue;

      // Create a connection to the device
      await this.connectToDevice(device);
    }
  }

  /**
   * Connect to a specific device
   */
  async connectToDevice(device) {
    try {
      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      // Create data channel
      const dataChannel = peerConnection.createDataChannel('registry-sync');

      // Set up event handlers
      dataChannel.onopen = () => {
        console.log(`Data channel to ${device.name} opened`);
        this.syncRegistryWithDevice(device.id, dataChannel);
      };

      dataChannel.onmessage = (event) => {
        this.handleSyncMessage(device.id, event.data);
      };

      // Store the connection and channel
      this.peerConnections.set(device.id, peerConnection);
      this.dataChannels.set(device.id, dataChannel);

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer to device through signaling server
      // Implementation depends on your signaling mechanism
      await this.sendSignalingMessage(device.id, {
        type: 'offer',
        sdp: peerConnection.localDescription
      });

      return true;
    } catch (error) {
      console.error(`Failed to connect to device ${device.name}:`, error);
      return false;
    }
  }

  /**
   * Sync registry with a specific device
   */
  async syncRegistryWithDevice(deviceId, dataChannel) {
    const registry = await this.deviceRegistry.getRegistry();

    // Send the registry to the device
    dataChannel.send(JSON.stringify({
      type: 'registry-sync',
      registry
    }));
  }

  /**
   * Handle incoming sync messages
   */
  async handleSyncMessage(deviceId, message) {
    try {
      const data = JSON.parse(message);

      if (data.type === 'registry-sync') {
        // Get local registry
        const localRegistry = await this.deviceRegistry.getRegistry();

        // Merge with remote registry
        const mergedRegistry = this.mergeRegistries(localRegistry, data.registry);

        // Update local registry
        await this.deviceRegistry.updateRegistry(mergedRegistry);

        // Notify UI of changes
        this.notifyRegistryUpdated();
      }
    } catch (error) {
      console.error('Failed to handle sync message:', error);
    }
  }

  /**
   * Notify UI that registry has been updated
   */
  notifyRegistryUpdated() {
    // Dispatch a custom event
    window.dispatchEvent(new CustomEvent('registry-updated'));
  }
}
```

### Conflict Resolution

When multiple devices update the registry, conflicts may occur. Implement a conflict resolution strategy:

```javascript
function mergeRegistries(localRegistry, remoteRegistry) {
  // Use the registry with the higher version number
  if (remoteRegistry.version > localRegistry.version) {
    return remoteRegistry;
  }

  // If versions are equal, merge the device lists
  if (remoteRegistry.version === localRegistry.version) {
    const mergedDevices = [...localRegistry.devices];

    // Add devices from remote registry that don't exist locally
    for (const remoteDevice of remoteRegistry.devices) {
      const localDevice = mergedDevices.find(d => d.id === remoteDevice.id);

      if (!localDevice) {
        mergedDevices.push(remoteDevice);
      } else {
        // For existing devices, use the one with the most recent lastActive timestamp
        if (new Date(remoteDevice.lastActive) > new Date(localDevice.lastActive)) {
          Object.assign(localDevice, remoteDevice);
        }
      }
    }

    return {
      ...localRegistry,
      devices: mergedDevices,
      lastUpdated: new Date().toISOString()
    };
  }

  return localRegistry;
}
```

### Recovery Options

Implement recovery options for when the owner device is lost:

```javascript
async function transferOwnership(newOwnerDeviceId) {
  // Get the current device registry
  const registry = await deviceRegistry.getRegistry();

  // Verify that the current device is the owner
  const currentDevice = await deviceRegistry.getCurrentDevice();
  if (!currentDevice.isOwner) {
    throw new Error('Only the owner device can transfer ownership');
  }

  // Find the new owner device
  const newOwnerDevice = registry.devices.find(d => d.id === newOwnerDeviceId);
  if (!newOwnerDevice) {
    throw new Error('Device not found');
  }

  // Update the registry
  registry.ownerDeviceId = newOwnerDeviceId;

  // Update device metadata
  currentDevice.isOwner = false;
  newOwnerDevice.isOwner = true;

  // Update the registry
  await deviceRegistry.updateRegistry(registry);

  // Notify the new owner device
  await syncService.notifyDeviceOfOwnershipTransfer(newOwnerDeviceId);
}
```

## User Interface

### Device List

Provide a clear list of all paired devices with relevant information:

```html
<div class="device-list">
  <div class="device-card owner">
    <div class="device-icon">📱</div>
    <div class="device-info">
      <div class="device-name">iPhone 13 Pro</div>
      <div class="device-meta">
        <span class="device-type">Mobile</span>
        <span class="owner-badge">Owner</span>
      </div>
      <div class="device-status">
        <span class="status-indicator active"></span>
        <span>Active now</span>
      </div>
    </div>
    <div class="device-actions">
      <button class="action-button rename">Rename</button>
      <button class="action-button view-activity">Activity</button>
    </div>
  </div>

  <div class="device-card">
    <div class="device-icon">💻</div>
    <div class="device-info">
      <div class="device-name">MacBook Pro</div>
      <div class="device-meta">
        <span class="device-type">Desktop</span>
      </div>
      <div class="device-status">
        <span class="status-indicator inactive"></span>
        <span>Last active 2 days ago</span>
      </div>
    </div>
    <div class="device-actions">
      <button class="action-button rename">Rename</button>
      <button class="action-button view-activity">Activity</button>
      <button class="action-button revoke">Revoke Access</button>
    </div>
  </div>
</div>
```

### Pairing Flow

Implement a clear and secure pairing flow:

1. Owner device generates a temporary code
2. Owner device displays the code and instructions
3. New device enters the code
4. Both devices show pairing status
5. New device is added to the registry

## Security Considerations

### Secure Communication

All communication between devices must be encrypted:

1. Use end-to-end encryption for device-to-device communication
2. Implement perfect forward secrecy
3. Verify device identity cryptographically

### Authorization

Ensure that only authorized devices can access sensitive data:

1. Verify device tokens before granting access
2. Implement device-specific permissions
3. Regularly rotate encryption keys

### Revocation

Implement immediate and effective revocation:

1. Owner device can revoke access for any device
2. Revoked devices cannot access the application
3. Revocation is propagated to all devices in the group

## Next Steps

Now that you understand how to implement multi-device support, proceed to [Data Synchronization](./07-data-synchronization.md) to learn how to synchronize application data between devices.
