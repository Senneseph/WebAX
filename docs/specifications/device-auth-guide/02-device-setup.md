# Device Setup Process

## Initial Device Registration

The device setup process is the entry point for device-based authentication. It handles the initial registration of a device, which becomes either the owner device (first device) or a paired device (subsequent devices).

### Owner Device Setup Flow

1. **Application Installation**: User installs the application on their first device
2. **Introduction**: Application explains the device-based authentication approach
3. **Device Verification**: User verifies their identity using biometrics or device passcode
4. **Device Naming**: User provides a name for the device (e.g., "My iPhone", "Work Laptop")
5. **Token Generation**: Application generates a secure device token
6. **Secure Storage**: Token and device information are stored securely
7. **Owner Designation**: Device is designated as the owner device
8. **Setup Completion**: User is informed that setup is complete

### Key Implementation Considerations

- **First-Time Detection**: The application must determine if this is the first device being set up
- **Clear Explanation**: Users may be unfamiliar with device-based authentication, so clear explanations are essential
- **Fallback Mechanisms**: Not all devices support biometrics, so fallback to device passcode should be available
- **Secure Token Generation**: Device tokens must be cryptographically secure and have sufficient entropy
- **Platform-Specific Storage**: Use the most secure storage mechanism available on each platform

## Biometric and Passcode Integration

Biometric authentication adds an additional layer of security by verifying the user's physical presence. Different platforms offer different biometric capabilities.

### Platform-Specific Integration

#### Web Platform

For web applications, the Web Authentication API (WebAuthn) provides a standardized way to use biometric authentication:

```javascript
async function requestBiometricVerification() {
  try {
    // Create a challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    // Request biometric verification
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000 // 1 minute
      }
    });
    
    // If we get here, verification was successful
    return true;
  } catch (error) {
    console.error('Biometric verification failed:', error);
    return false;
  }
}
```

#### Mobile Platforms

For mobile applications, use platform-native APIs:

- **iOS**: Use LocalAuthentication framework with TouchID/FaceID
- **Android**: Use BiometricPrompt API

### Fallback to Device Passcode

Always implement a fallback to device passcode for devices without biometric capabilities:

```javascript
async function requestUserVerification() {
  // Check if biometric authentication is available
  if (await isBiometricAvailable()) {
    return requestBiometricVerification();
  } else {
    // Fall back to device passcode
    return requestPasscodeVerification();
  }
}
```

## Secure Token Generation

Device tokens are the cornerstone of device-based authentication. They serve as the persistent identity of the device and must be generated and stored securely.

### Token Requirements

A device token should be:

1. **Cryptographically Strong**: Use a cryptographically secure random number generator
2. **Sufficient Length**: At least 256 bits (32 bytes) of entropy
3. **Unique**: Extremely low probability of collision with other device tokens
4. **Non-Guessable**: Impossible to predict or brute-force

### Implementation Example

```javascript
function generateDeviceToken() {
  // Create a buffer with 32 random bytes (256 bits)
  const tokenBuffer = new Uint8Array(32);
  
  // Fill with cryptographically secure random values
  window.crypto.getRandomValues(tokenBuffer);
  
  // Convert to Base64 string for storage
  return btoa(String.fromCharCode.apply(null, Array.from(tokenBuffer)));
}
```

### Device Metadata

Along with the token, store metadata about the device:

```javascript
function createDeviceMetadata(name, isOwner) {
  return {
    id: generateUUID(),  // Generate a UUID for the device
    name: name,          // User-provided name
    type: detectDeviceType(),  // Mobile, tablet, desktop, etc.
    createdAt: new Date().toISOString(),
    isOwner: isOwner,    // Whether this is the owner device
    lastActive: new Date().toISOString()
  };
}
```

## Owner Device Designation

The first device registered becomes the owner device, which has special privileges:

1. **Pairing Authority**: Only the owner device can authorize new devices
2. **Revocation Rights**: The owner can revoke access for any paired device
3. **Configuration Control**: The owner controls application-wide settings
4. **Recovery Capabilities**: The owner can initiate recovery procedures

### Implementation Example

```javascript
async function setupOwnerDevice(deviceName) {
  // Generate device token
  const token = generateDeviceToken();
  
  // Create device metadata
  const metadata = createDeviceMetadata(deviceName, true);
  
  // Store in secure storage
  await secureStorage.set('device_token', token);
  await secureStorage.set('device_metadata', JSON.stringify(metadata));
  
  // Initialize device registry with this device
  const registry = {
    devices: [metadata],
    lastUpdated: new Date().toISOString()
  };
  await secureStorage.set('device_registry', JSON.stringify(registry));
  
  // Generate encryption keys for data synchronization
  await generateSyncKeys();
  
  return {
    token,
    metadata
  };
}
```

## Secure Storage Implementation

Device tokens must be stored securely to prevent unauthorized access. Different platforms offer different secure storage mechanisms.

### Platform-Specific Storage

#### Web Browsers

For web applications, options include:

1. **IndexedDB with Encryption**:
   - Store encrypted data in IndexedDB
   - Use WebCrypto API for encryption/decryption
   - Derive encryption key from device-specific information

2. **Secure Context Features**:
   - Only available in HTTPS contexts
   - Use credential management API where available

#### Mobile and Desktop

For native or hybrid applications:

1. **iOS**: Use Keychain with appropriate access controls
2. **Android**: Use Keystore with hardware-backed security if available
3. **Desktop**: Use system keyring or encrypted local storage

### Cross-Platform Abstraction

Create an abstract interface for secure storage that can be implemented for each platform:

```javascript
class SecureStorage {
  async initialize() {
    // Platform-specific initialization
  }
  
  async set(key, value) {
    // Store value securely
  }
  
  async get(key) {
    // Retrieve value securely
  }
  
  async remove(key) {
    // Remove value securely
  }
}
```

## User Interface Considerations

The device setup process should provide a clear and intuitive user experience:

1. **Clear Explanation**: Explain the device-based authentication concept
2. **Progress Indication**: Show clear steps in the setup process
3. **Verification Prompts**: Make biometric/passcode prompts clear and non-threatening
4. **Error Handling**: Provide clear error messages and recovery paths
5. **Confirmation**: Confirm successful setup with clear messaging

### Example Setup Flow UI

1. **Introduction Screen**:
   - Explain device-based authentication
   - Highlight benefits (no passwords, seamless experience)
   - Provide "Start Setup" button

2. **Verification Screen**:
   - Explain the need for biometric/passcode verification
   - Trigger platform-specific verification prompt
   - Show loading indicator during verification

3. **Device Naming Screen**:
   - Provide field for device name with default suggestion
   - Explain importance of recognizable name
   - Include "Continue" button

4. **Processing Screen**:
   - Show progress during token generation and storage
   - Display animated indicator

5. **Completion Screen**:
   - Confirm successful setup
   - Explain that this is now the owner device
   - Provide "Enter App" button

## Next Steps

In this section, we've covered the implementation of the device setup process, including:

1. Initial device registration
2. Biometric and passcode integration
3. Secure token generation
4. Owner device designation
5. Secure storage implementation
6. User interface considerations

The next section, [Device Pairing](./03-device-pairing.md), will cover how to pair additional devices with the owner device, allowing users to access their data from multiple devices securely.
