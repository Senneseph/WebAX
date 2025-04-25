# Device Pairing

## Introduction

Device pairing is the process that allows users to add additional devices to their device group. This enables them to access their application data from multiple devices without traditional login credentials. The pairing process must be secure, user-friendly, and resilient against various attack vectors.

## Pairing Code Generation

The pairing process begins with the owner device generating a temporary pairing code that the new device will use to establish trust.

### Requirements for Pairing Codes

1. **Temporality**: Codes should be valid for a limited time (typically 5-10 minutes)
2. **Uniqueness**: Each code should be unique and used only once
3. **Complexity**: Codes should be complex enough to prevent guessing
4. **Usability**: Codes should be easy for users to enter manually if needed

### Implementation Example

```javascript
function generatePairingCode() {
  // Generate a 6-digit numeric code
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  
  // Use cryptographically secure random number generation
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  
  // Scale to our range
  const code = min + (array[0] % (max - min + 1));
  
  // Store the code with expiration time (10 minutes from now)
  const pairingData = {
    code: code.toString(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    used: false
  };
  
  // Store in secure storage
  storePairingData(pairingData);
  
  return code.toString();
}
```

## QR Code Implementation

For a more seamless experience, the owner device can display a QR code that the new device can scan.

### QR Code Content

The QR code should contain:

1. **Pairing Code**: The generated pairing code
2. **Application Identifier**: To ensure the QR code is scanned by the correct application
3. **Owner Device ID**: A unique identifier for the owner device
4. **Timestamp**: When the code was generated
5. **Expiration Time**: When the code expires

### Implementation Example

```javascript
function generatePairingQRCode() {
  // Generate pairing code
  const pairingCode = generatePairingCode();
  
  // Create data object
  const qrData = {
    type: 'webax-device-pairing',
    appId: 'net.webax.myapp',
    code: pairingCode,
    deviceId: getDeviceId(),
    timestamp: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  
  // Convert to JSON string
  const qrContent = JSON.stringify(qrData);
  
  // Generate QR code (using a QR code library)
  return generateQRCode(qrContent);
}
```

## Secure Channel Establishment

Once the new device has the pairing code, it needs to establish a secure communication channel with the owner device.

### Channel Establishment Process

1. **Discovery**: The new device discovers the owner device
2. **Connection**: The devices establish a connection
3. **Authentication**: The new device authenticates using the pairing code
4. **Key Exchange**: The devices exchange cryptographic keys
5. **Channel Security**: The channel is secured for further communication

### WebRTC Implementation

WebRTC provides a secure peer-to-peer communication channel that can be used for device pairing:

```javascript
async function establishSecureChannel(pairingCode, ownerDeviceId) {
  // Create WebRTC connection
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.webax.net' }]
  });
  
  // Create data channel
  const dataChannel = peerConnection.createDataChannel('pairing-channel');
  
  // Set up event handlers
  dataChannel.onopen = () => {
    // Send authentication message
    dataChannel.send(JSON.stringify({
      type: 'auth',
      code: pairingCode,
      deviceId: getDeviceId(),
      deviceName: getDeviceName()
    }));
  };
  
  dataChannel.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'auth-result' && message.success) {
      // Authentication successful, proceed with key exchange
      exchangeKeys(dataChannel);
    }
  };
  
  // Connect to signaling server to find owner device
  const signalingChannel = connectToSignalingServer();
  
  // Signal the owner device
  signalingChannel.send({
    type: 'pairing-request',
    targetDeviceId: ownerDeviceId,
    pairingCode: pairingCode
  });
  
  // Handle signaling messages
  signalingChannel.onmessage = async (message) => {
    if (message.type === 'offer') {
      await peerConnection.setRemoteDescription(message.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      signalingChannel.send({
        type: 'answer',
        answer: answer
      });
    } else if (message.type === 'ice-candidate') {
      await peerConnection.addIceCandidate(message.candidate);
    }
  };
  
  return new Promise((resolve) => {
    // Resolve when key exchange is complete
    const checkInterval = setInterval(() => {
      if (keyExchangeComplete) {
        clearInterval(checkInterval);
        resolve(dataChannel);
      }
    }, 100);
  });
}
```

## Device Authorization

The owner device must verify and authorize the new device before granting it access to the application.

### Authorization Process

1. **Verification**: The owner device verifies the pairing code
2. **User Confirmation**: The owner device asks the user to confirm the pairing
3. **Device Registration**: The new device is added to the device registry
4. **Key Sharing**: Encryption keys are shared with the new device
5. **Confirmation**: The new device is informed of successful pairing

### Implementation Example

```javascript
async function authorizeNewDevice(pairingRequest, dataChannel) {
  // Verify pairing code
  const storedPairingData = await getPairingData(pairingRequest.code);
  
  if (!storedPairingData || storedPairingData.used || new Date() > new Date(storedPairingData.expiresAt)) {
    // Invalid or expired code
    dataChannel.send(JSON.stringify({
      type: 'auth-result',
      success: false,
      reason: 'Invalid or expired pairing code'
    }));
    return false;
  }
  
  // Ask user to confirm pairing
  const userConfirmed = await showPairingConfirmation(pairingRequest.deviceName);
  
  if (!userConfirmed) {
    // User rejected pairing
    dataChannel.send(JSON.stringify({
      type: 'auth-result',
      success: false,
      reason: 'Pairing rejected by user'
    }));
    return false;
  }
  
  // Mark pairing code as used
  storedPairingData.used = true;
  await updatePairingData(storedPairingData);
  
  // Add device to registry
  const deviceRegistry = await getDeviceRegistry();
  const newDevice = {
    id: pairingRequest.deviceId,
    name: pairingRequest.deviceName,
    type: pairingRequest.deviceType,
    createdAt: new Date().toISOString(),
    isOwner: false,
    lastActive: new Date().toISOString()
  };
  
  deviceRegistry.devices.push(newDevice);
  deviceRegistry.lastUpdated = new Date().toISOString();
  await updateDeviceRegistry(deviceRegistry);
  
  // Share encryption keys
  const syncKey = await getSyncKey();
  dataChannel.send(JSON.stringify({
    type: 'auth-result',
    success: true,
    syncKey: syncKey,
    deviceRegistry: deviceRegistry
  }));
  
  return true;
}
```

## Handling Pairing Errors and Timeouts

The pairing process can fail for various reasons, and the application must handle these failures gracefully.

### Common Failure Scenarios

1. **Code Expiration**: The pairing code expires before the process completes
2. **Network Issues**: The devices cannot establish a connection
3. **User Rejection**: The owner device user rejects the pairing request
4. **Security Violations**: The pairing process detects potential security issues

### Error Handling Implementation

```javascript
function handlePairingError(error, context) {
  // Log the error
  console.error('Pairing error:', error, context);
  
  // Determine error type and message
  let userMessage = 'An error occurred during device pairing.';
  let retryPossible = true;
  
  if (error.code === 'expired') {
    userMessage = 'The pairing code has expired. Please generate a new code and try again.';
  } else if (error.code === 'network') {
    userMessage = 'Could not connect to the other device. Please check your network connection and try again.';
  } else if (error.code === 'rejected') {
    userMessage = 'The pairing request was rejected by the owner device.';
    retryPossible = false;
  } else if (error.code === 'security') {
    userMessage = 'A security issue was detected during pairing. Please try again.';
  }
  
  // Show error to user
  showErrorMessage(userMessage, retryPossible);
  
  // Clean up resources
  if (context.dataChannel) {
    context.dataChannel.close();
  }
  
  if (context.peerConnection) {
    context.peerConnection.close();
  }
  
  // Reset pairing state
  resetPairingState();
}
```

## User Experience Considerations

The pairing process should be designed with user experience in mind:

1. **Clear Instructions**: Provide clear instructions for both devices
2. **Progress Indication**: Show the current step in the pairing process
3. **Error Recovery**: Make it easy to recover from errors
4. **Confirmation**: Confirm successful pairing on both devices
5. **Security Awareness**: Educate users about the security implications

## Next Steps

In this section, we've covered the implementation of the device pairing process, including:

1. Pairing code generation
2. QR code implementation
3. Secure channel establishment
4. Device authorization
5. Error handling

The next section, [Device Management](./04-device-management.md), will cover how to manage paired devices, including listing, monitoring, and revoking access.
