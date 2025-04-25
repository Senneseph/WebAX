# Browser-Centric Implementation

## Introduction

This section provides a detailed implementation guide for device-based authentication using a browser-centric approach. Rather than creating separate implementations for different platforms (iOS, Android, Desktop), WebAX applications use a unified browser-based approach that leverages modern web standards to provide a consistent experience across all devices.

## Browser-Centric Philosophy

WebAX applications follow a browser-centric philosophy:

1. **Uniform Experience**: Users get the same experience regardless of device
2. **Single Codebase**: One implementation works across all platforms
3. **Web Standards**: Leverage modern web standards and APIs
4. **Progressive Enhancement**: Gracefully handle different browser capabilities

## Key Web Technologies

The browser-centric implementation relies on several key web technologies:

### 1. WebAuthn/FIDO2 for Authentication

[WebAuthn](https://www.w3.org/TR/webauthn-2/) (Web Authentication) is a web standard for passwordless authentication:

- Uses platform biometrics (fingerprint, face recognition) or security keys
- Provides strong, phishing-resistant authentication
- Supported by all major browsers (Chrome, Firefox, Safari, Edge)

### 2. IndexedDB for Secure Storage

[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) combined with the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) provides secure client-side storage:

- Stores encrypted device tokens and keys
- Persists data between sessions
- Supports large data sets and complex data structures

### 3. WebRTC for Device Communication

[WebRTC](https://webrtc.org/) (Web Real-Time Communication) enables direct device-to-device communication:

- Establishes secure peer-to-peer connections
- Supports encrypted data channels
- Works across different networks and NATs

### 4. Service Workers for Offline Support

[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) enable offline functionality:

- Cache authentication data and application resources
- Process authentication requests offline
- Sync changes when connectivity is restored

## Implementation Guide

### Authentication Implementation

```javascript
class BiometricAuthenticator {
  /**
   * Check if WebAuthn is available in this browser
   */
  static async isAvailable() {
    return typeof window.PublicKeyCredential !== 'undefined' &&
           typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function' &&
           await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  /**
   * Authenticate the user with WebAuthn
   */
  static async authenticate(reason = 'Verify your identity') {
    try {
      // Check if WebAuthn is available
      if (!await this.isAvailable()) {
        throw new Error('WebAuthn is not available in this browser');
      }

      // Create a challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Request authentication
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000 // 1 minute
        }
      });

      // If we get here, authentication was successful
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Register a new device with WebAuthn
   */
  static async registerDevice(username, displayName) {
    try {
      // Check if WebAuthn is available
      if (!await this.isAvailable()) {
        throw new Error('WebAuthn is not available in this browser');
      }

      // Create a new user ID
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      // Create a challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential options
      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'WebAX Application',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: username,
          displayName: displayName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: true
        },
        timeout: 60000, // 1 minute
        attestation: 'none'
      };

      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // Return the credential ID and public key
      return {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
        }
      };
    } catch (error) {
      console.error('Device registration failed:', error);
      throw error;
    }
  }
}
```

### Secure Storage Implementation

```javascript
class SecureStorage {
  /**
   * Initialize the secure storage
   */
  static async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WebAXSecureStorage', 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('secureData', { keyPath: 'key' });
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(new Error('Failed to initialize secure storage'));
      };
    });
  }

  /**
   * Encrypt data before storing
   */
  static async encrypt(data) {
    // Get or generate encryption key
    const key = await this.getEncryptionKey();

    // Convert data to string if it's not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);

    // Convert to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);

    // Generate IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    );

    // Return encrypted data with IV
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedBuffer))
    };
  }

  /**
   * Decrypt stored data
   */
  static async decrypt(encryptedData) {
    // Get encryption key
    const key = await this.getEncryptionKey();

    // Convert arrays back to Uint8Arrays
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );

    // Convert back to string
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);

    // Parse JSON if possible
    try {
      return JSON.parse(decryptedString);
    } catch (e) {
      return decryptedString;
    }
  }

  /**
   * Get or generate the encryption key
   */
  static async getEncryptionKey() {
    // Try to get existing key
    const keyData = localStorage.getItem('webax_key_reference');

    if (keyData) {
      // Key exists, retrieve from IndexedDB
      const db = await this.initialize();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['secureData'], 'readonly');
        const store = transaction.objectStore('secureData');
        const request = store.get('encryptionKey');

        request.onsuccess = (event) => {
          if (event.target.result) {
            resolve(event.target.result.value);
          } else {
            // Key reference exists but key doesn't - generate new one
            this.generateEncryptionKey().then(resolve).catch(reject);
          }
        };

        request.onerror = () => reject(new Error('Failed to retrieve encryption key'));
      });
    } else {
      // No key exists, generate new one
      return this.generateEncryptionKey();
    }
  }

  /**
   * Generate a new encryption key
   */
  static async generateEncryptionKey() {
    // Generate a new key
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    // Store key in IndexedDB
    const db = await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['secureData'], 'readwrite');
      const store = transaction.objectStore('secureData');
      const request = store.put({ key: 'encryptionKey', value: key });

      request.onsuccess = () => {
        // Store reference in localStorage
        localStorage.setItem('webax_key_reference', 'true');
        resolve(key);
      };

      request.onerror = () => reject(new Error('Failed to store encryption key'));
    });
  }

  /**
   * Save data securely
   */
  static async save(key, value) {
    // Encrypt the data
    const encryptedData = await this.encrypt(value);

    // Store in IndexedDB
    const db = await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['secureData'], 'readwrite');
      const store = transaction.objectStore('secureData');
      const request = store.put({ key, value: encryptedData });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to save data for key: ${key}`));
    });
  }

  /**
   * Load data securely
   */
  static async load(key) {
    // Get from IndexedDB
    const db = await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['secureData'], 'readonly');
      const store = transaction.objectStore('secureData');
      const request = store.get(key);

      request.onsuccess = async (event) => {
        if (event.target.result) {
          // Decrypt the data
          const decryptedData = await this.decrypt(event.target.result.value);
          resolve(decryptedData);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error(`Failed to load data for key: ${key}`));
    });
  }

  /**
   * Delete data
   */
  static async delete(key) {
    const db = await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['secureData'], 'readwrite');
      const store = transaction.objectStore('secureData');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete data for key: ${key}`));
    });
  }
}
```

## Handling Browser Differences

While the browser-centric approach aims for uniformity, there are still differences between browsers that need to be handled:

### Feature Detection

Always use feature detection rather than browser detection:

```javascript
// Bad: Browser detection
if (navigator.userAgent.includes('Chrome')) {
  // Chrome-specific code
}

// Good: Feature detection
if (typeof window.PublicKeyCredential !== 'undefined') {
  // WebAuthn is supported
}
```

### Graceful Degradation

Provide fallbacks for browsers that don't support certain features:

```javascript
class DeviceAuthenticator {
  async authenticate() {
    // Try WebAuthn first
    if (await BiometricAuthenticator.isAvailable()) {
      return BiometricAuthenticator.authenticate();
    }

    // Fall back to a password-based approach
    return this.passwordAuthenticate();
  }

  async passwordAuthenticate() {
    // Implement password-based authentication as fallback
  }
}
```

### Browser Support Table

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebAuthn | 67+ | 60+ | 13+ | 18+ |
| IndexedDB | 24+ | 16+ | 10+ | 12+ |
| Web Crypto | 37+ | 34+ | 11+ | 12+ |
| WebRTC | 23+ | 22+ | 11+ | 12+ |
| Service Workers | 40+ | 44+ | 11.1+ | 17+ |

## Next Steps

Now that you understand the browser-centric implementation approach, continue to [Multi-Device Support](./07-multi-device-support.md) to learn about managing multiple devices and synchronizing data between them using WebRTC and other web standards.
