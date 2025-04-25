# Jcule Integration for Device Authentication

## Introduction

This document outlines how device-based authentication integrates with jcule, the WebAX logic controller ("muther-brane"). As the control unit for WebAX applications, jcule is responsible for discovering and managing device permissions, providing a uniform interface for authentication settings across applications.

## Architecture Overview

### Jcule as the Authentication Controller

In the WebAX ecosystem, jcule serves as the central controller for device authentication:

1. **Permission Management**: Jcule manages authentication permissions at a system level
2. **Settings Interface**: Provides a unified settings interface outside individual applications
3. **API Layer**: Offers an authentication API for applications to use
4. **Cross-App Authentication**: Enables single authentication for multiple applications

### Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      WebAX Platform                          │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
┌───────────────▼─────────────────┐ ┌─────────▼───────────────┐
│          Jcule Controller       │ │    WebAX Applications    │
│                                  │ │                         │
│  ┌──────────┐    ┌────────────┐ │ │  ┌──────────────────┐   │
│  │ Device   │    │ Permission │ │ │  │      App 1       │   │
│  │ Auth     │◄──►│ Manager    │ │ │  └────────┬─────────┘   │
│  └──────────┘    └────────────┘ │ │           │            │
│        │               │        │ │  ┌────────▼─────────┐   │
│        │               │        │ │  │      App 2       │   │
│  ┌──────────┐    ┌────────────┐ │ │  └────────┬─────────┘   │
│  │ Settings │    │   Auth     │ │ │           │            │
│  │ UI       │◄──►│   API      │◄─┼─┼──────────┘            │
│  └──────────┘    └────────────┘ │ │                         │
└──────────────────┬──────────────┘ └─────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                  Platform-Specific Layer                      │
│                                                               │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐ │
│  │  Biometric   │  │    Secure     │  │   Device-Specific  │ │
│  │    Auth      │  │    Storage    │  │      Features      │ │
│  └──────────────┘  └───────────────┘  └────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Jcule Device Authentication Module

### Core Components

1. **DeviceAuthController**: Central controller for device authentication
2. **PermissionManager**: Manages authentication permissions for applications
3. **AuthSettingsUI**: Provides a unified settings interface
4. **AuthAPI**: Exposes authentication services to applications

### Implementation

#### DeviceAuthController

The DeviceAuthController is the main entry point for device authentication in jcule:

```typescript
// In jcule/app/src/controllers/DeviceAuthController.ts

import { BiometricAuth } from '../platform/BiometricAuth';
import { SecureStorage } from '../platform/SecureStorage';
import { PermissionManager } from './PermissionManager';
import { DeviceRegistry } from '../models/DeviceRegistry';

export class DeviceAuthController {
  private biometricAuth: BiometricAuth;
  private secureStorage: SecureStorage;
  private permissionManager: PermissionManager;
  private deviceRegistry: DeviceRegistry;

  constructor() {
    // Initialize platform-specific implementations
    this.biometricAuth = new BiometricAuth();
    this.secureStorage = new SecureStorage();
    this.permissionManager = new PermissionManager();
    this.deviceRegistry = new DeviceRegistry(this.secureStorage);
  }

  /**
   * Initialize the device authentication system
   */
  async initialize(): Promise<void> {
    await this.secureStorage.initialize();
    await this.deviceRegistry.initialize();
    await this.permissionManager.initialize();

    // Check if device is already set up
    if (!await this.isDeviceSetup()) {
      // First-time setup will be triggered by UI
      console.log('Device not set up. Setup required.');
    }
  }

  /**
   * Check if the device is set up for authentication
   */
  async isDeviceSetup(): Promise<boolean> {
    return this.deviceRegistry.isDeviceRegistered();
  }

  /**
   * Set up the device for first-time use
   */
  async setupDevice(deviceName: string): Promise<boolean> {
    try {
      // Authenticate user with biometrics
      const authenticated = await this.biometricAuth.authenticate(
        'Authenticate to set up this device'
      );

      if (!authenticated) {
        return false;
      }

      // Register device
      await this.deviceRegistry.registerDevice(deviceName, true); // true = owner device

      return true;
    } catch (error) {
      console.error('Device setup failed:', error);
      return false;
    }
  }

  /**
   * Authenticate the user
   */
  async authenticateUser(appId?: string): Promise<boolean> {
    try {
      // Check if device is set up
      if (!await this.isDeviceSetup()) {
        return false;
      }

      // If appId is provided, check if app has permission
      if (appId && !await this.permissionManager.hasPermission(appId, 'authenticate')) {
        return false;
      }

      // Authenticate user with biometrics
      const authenticated = await this.biometricAuth.authenticate(
        'Verify your identity'
      );

      if (authenticated) {
        // Update last active timestamp
        await this.deviceRegistry.updateDeviceLastActive();

        // If appId is provided, log the authentication
        if (appId) {
          await this.deviceRegistry.logActivity(appId, 'authentication');
        }
      }

      return authenticated;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Get the current device information
   */
  async getCurrentDevice(): Promise<any> {
    return this.deviceRegistry.getCurrentDevice();
  }

  /**
   * Check if this is the owner device
   */
  async isOwnerDevice(): Promise<boolean> {
    const device = await this.deviceRegistry.getCurrentDevice();
    return device?.isOwner || false;
  }
}
```

#### PermissionManager

The PermissionManager handles authentication permissions for applications:

```typescript
// In jcule/app/src/controllers/PermissionManager.ts

import { SecureStorage } from '../platform/SecureStorage';

export class PermissionManager {
  private secureStorage: SecureStorage;
  private permissions: Map<string, Set<string>> = new Map();

  constructor() {
    this.secureStorage = new SecureStorage();
  }

  /**
   * Initialize the permission manager
   */
  async initialize(): Promise<void> {
    // Load permissions from secure storage
    const permissionsData = await this.secureStorage.get('app_permissions');

    if (permissionsData) {
      try {
        const parsedPermissions = JSON.parse(permissionsData);

        // Convert to Map and Sets
        Object.keys(parsedPermissions).forEach(appId => {
          this.permissions.set(appId, new Set(parsedPermissions[appId]));
        });
      } catch (error) {
        console.error('Failed to parse permissions:', error);
      }
    }
  }

  /**
   * Check if an app has a specific permission
   */
  async hasPermission(appId: string, permission: string): Promise<boolean> {
    const appPermissions = this.permissions.get(appId);
    return appPermissions?.has(permission) || false;
  }

  /**
   * Grant a permission to an app
   */
  async grantPermission(appId: string, permission: string): Promise<void> {
    let appPermissions = this.permissions.get(appId);

    if (!appPermissions) {
      appPermissions = new Set();
      this.permissions.set(appId, appPermissions);
    }

    appPermissions.add(permission);
    await this.savePermissions();
  }

  /**
   * Revoke a permission from an app
   */
  async revokePermission(appId: string, permission: string): Promise<void> {
    const appPermissions = this.permissions.get(appId);

    if (appPermissions) {
      appPermissions.delete(permission);
      await this.savePermissions();
    }
  }

  /**
   * Get all permissions for an app
   */
  getAppPermissions(appId: string): string[] {
    const appPermissions = this.permissions.get(appId);
    return appPermissions ? Array.from(appPermissions) : [];
  }

  /**
   * Save permissions to secure storage
   */
  private async savePermissions(): Promise<void> {
    // Convert Map and Sets to plain object for storage
    const permissionsObj: Record<string, string[]> = {};

    this.permissions.forEach((permissions, appId) => {
      permissionsObj[appId] = Array.from(permissions);
    });

    await this.secureStorage.set('app_permissions', JSON.stringify(permissionsObj));
  }
}
```

### Platform-Specific Implementations

Jcule provides platform-specific implementations for biometric authentication and secure storage:

```typescript
// In jcule/app/src/platform/BiometricAuth.ts

export class BiometricAuth {
  /**
   * Check if biometric authentication is available
   */
  async isAvailable(): Promise<boolean> {
    // Implementation depends on platform (web, iOS, Android)
    if (this.isWeb()) {
      return this.isWebAuthnAvailable();
    } else if (this.isIOS()) {
      return this.isIOSBiometricsAvailable();
    } else if (this.isAndroid()) {
      return this.isAndroidBiometricsAvailable();
    }

    return false;
  }

  /**
   * Authenticate the user with biometrics
   */
  async authenticate(reason: string): Promise<boolean> {
    // Implementation depends on platform
    if (this.isWeb()) {
      return this.authenticateWithWebAuthn(reason);
    } else if (this.isIOS()) {
      return this.authenticateWithIOSBiometrics(reason);
    } else if (this.isAndroid()) {
      return this.authenticateWithAndroidBiometrics(reason);
    }

    return false;
  }

  // Platform detection methods
  private isWeb(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && !this.isNative();
  }

  private isIOS(): boolean {
    return this.isNative() && typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return this.isNative() && typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  }

  private isNative(): boolean {
    return typeof window !== 'undefined' && 'webkit' in window && 'messageHandlers' in (window as any).webkit;
  }

  // Platform-specific implementations
  private async isWebAuthnAvailable(): Promise<boolean> {
    return typeof navigator.credentials !== 'undefined' &&
           typeof navigator.credentials.get === 'function' &&
           typeof PublicKeyCredential !== 'undefined' &&
           typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function' &&
           await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  private async isIOSBiometricsAvailable(): Promise<boolean> {
    // Call native bridge
    return new Promise<boolean>(resolve => {
      (window as any).webkit.messageHandlers.biometricAuth.postMessage({
        method: 'isAvailable',
        callback: (result: boolean) => resolve(result)
      });
    });
  }

  private async isAndroidBiometricsAvailable(): Promise<boolean> {
    // Call native bridge
    return new Promise<boolean>(resolve => {
      (window as any).BiometricAuth.isAvailable((result: boolean) => resolve(result));
    });
  }

  private async authenticateWithWebAuthn(reason: string): Promise<boolean> {
    try {
      // Create a challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Request biometric verification
      await navigator.credentials.get({
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
      console.error('WebAuthn authentication failed:', error);
      return false;
    }
  }

  private async authenticateWithIOSBiometrics(reason: string): Promise<boolean> {
    // Call native bridge
    return new Promise<boolean>(resolve => {
      (window as any).webkit.messageHandlers.biometricAuth.postMessage({
        method: 'authenticate',
        params: { reason },
        callback: (result: boolean) => resolve(result)
      });
    });
  }

  private async authenticateWithAndroidBiometrics(reason: string): Promise<boolean> {
    // Call native bridge
    return new Promise<boolean>(resolve => {
      (window as any).BiometricAuth.authenticate(reason, (result: boolean) => resolve(result));
    });
  }
}
```

```typescript
// In jcule/app/src/platform/SecureStorage.ts

export class SecureStorage {
  /**
   * Initialize secure storage
   */
  async initialize(): Promise<void> {
    // Implementation depends on platform
    if (this.isWeb()) {
      await this.initializeWebStorage();
    } else if (this.isNative()) {
      await this.initializeNativeStorage();
    }
  }

  /**
   * Store a value securely
   */
  async set(key: string, value: string): Promise<void> {
    // Implementation depends on platform
    if (this.isWeb()) {
      await this.setWebStorage(key, value);
    } else if (this.isNative()) {
      await this.setNativeStorage(key, value);
    }
  }

  /**
   * Retrieve a value from secure storage
   */
  async get(key: string): Promise<string | null> {
    // Implementation depends on platform
    if (this.isWeb()) {
      return this.getWebStorage(key);
    } else if (this.isNative()) {
      return this.getNativeStorage(key);
    }

    return null;
  }

  /**
   * Remove a value from secure storage
   */
  async remove(key: string): Promise<void> {
    // Implementation depends on platform
    if (this.isWeb()) {
      await this.removeWebStorage(key);
    } else if (this.isNative()) {
      await this.removeNativeStorage(key);
    }
  }

  // Platform detection methods
  private isWeb(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && !this.isNative();
  }

  private isNative(): boolean {
    return typeof window !== 'undefined' && 'webkit' in window && 'messageHandlers' in (window as any).webkit;
  }

  // Web implementation using IndexedDB and encryption
  private async initializeWebStorage(): Promise<void> {
    // Initialize IndexedDB
    // Implementation details omitted for brevity
  }

  private async setWebStorage(key: string, value: string): Promise<void> {
    // Encrypt and store in IndexedDB
    // Implementation details omitted for brevity
  }

  private async getWebStorage(key: string): Promise<string | null> {
    // Retrieve and decrypt from IndexedDB
    // Implementation details omitted for brevity
    return null;
  }

  private async removeWebStorage(key: string): Promise<void> {
    // Remove from IndexedDB
    // Implementation details omitted for brevity
  }

  // Native implementation using platform-specific secure storage
  private async initializeNativeStorage(): Promise<void> {
    // No initialization needed for native storage
  }

  private async setNativeStorage(key: string, value: string): Promise<void> {
    // Call native bridge
    return new Promise<void>(resolve => {
      (window as any).webkit.messageHandlers.secureStorage.postMessage({
        method: 'set',
        params: { key, value },
        callback: () => resolve()
      });
    });
  }

  private async getNativeStorage(key: string): Promise<string | null> {
    // Call native bridge
    return new Promise<string | null>(resolve => {
      (window as any).webkit.messageHandlers.secureStorage.postMessage({
        method: 'get',
        params: { key },
        callback: (result: string | null) => resolve(result)
      });
    });
  }

  private async removeNativeStorage(key: string): Promise<void> {
    // Call native bridge
    return new Promise<void>(resolve => {
      (window as any).webkit.messageHandlers.secureStorage.postMessage({
        method: 'remove',
        params: { key },
        callback: () => resolve()
      });
    });
  }
}
```

## Authentication API for Applications

Jcule exposes an authentication API for WebAX applications to use:

```typescript
// In jcule/app/src/api/AuthAPI.ts

import { DeviceAuthController } from '../controllers/DeviceAuthController';

export class AuthAPI {
  private authController: DeviceAuthController;

  constructor() {
    this.authController = new DeviceAuthController();
  }

  /**
   * Initialize the authentication API
   */
  async initialize(): Promise<void> {
    await this.authController.initialize();
  }

  /**
   * Register an application for authentication
   */
  async registerApp(appId: string, appName: string): Promise<boolean> {
    // Check if this is the owner device
    if (!await this.authController.isOwnerDevice()) {
      console.error('Only the owner device can register apps');
      return false;
    }

    // Register the app
    // Implementation details omitted for brevity
    return true;
  }

  /**
   * Authenticate the user for an application
   */
  async authenticateForApp(appId: string): Promise<boolean> {
    return this.authController.authenticateUser(appId);
  }

  /**
   * Check if the device is set up for authentication
   */
  async isDeviceSetup(): Promise<boolean> {
    return this.authController.isDeviceSetup();
  }

  /**
   * Get the current device information
   */
  async getCurrentDevice(): Promise<any> {
    return this.authController.getCurrentDevice();
  }
}
```

## Settings UI Integration

Jcule provides a unified settings interface for device authentication:

```typescript
// In jcule/app/src/ui/AuthSettingsUI.ts

import { DeviceAuthController } from '../controllers/DeviceAuthController';
import { PermissionManager } from '../controllers/PermissionManager';

export class AuthSettingsUI {
  private authController: DeviceAuthController;
  private permissionManager: PermissionManager;

  constructor() {
    this.authController = new DeviceAuthController();
    this.permissionManager = new PermissionManager();
  }

  /**
   * Initialize the settings UI
   */
  async initialize(): Promise<void> {
    await this.authController.initialize();
    await this.permissionManager.initialize();
  }

  /**
   * Render the authentication settings UI
   */
  async render(container: HTMLElement): Promise<void> {
    // Check if device is set up
    const isSetup = await this.authController.isDeviceSetup();

    if (!isSetup) {
      this.renderSetupUI(container);
    } else {
      this.renderSettingsUI(container);
    }
  }

  /**
   * Render the device setup UI
   */
  private async renderSetupUI(container: HTMLElement): Promise<void> {
    // Implementation details omitted for brevity
  }

  /**
   * Render the authentication settings UI
   */
  private async renderSettingsUI(container: HTMLElement): Promise<void> {
    // Get current device
    const device = await this.authController.getCurrentDevice();

    // Create settings UI
    const settingsElement = document.createElement('div');
    settingsElement.className = 'auth-settings';

    // Device information section
    const deviceSection = document.createElement('div');
    deviceSection.className = 'settings-section';

    const deviceTitle = document.createElement('h2');
    deviceTitle.textContent = 'Device Information';
    deviceSection.appendChild(deviceTitle);

    const deviceInfo = document.createElement('div');
    deviceInfo.className = 'device-info';
    deviceInfo.innerHTML = `
      <div class="info-item">
        <span class="label">Device Name:</span>
        <span class="value">${device.name}</span>
      </div>
      <div class="info-item">
        <span class="label">Device Type:</span>
        <span class="value">${device.type}</span>
      </div>
      <div class="info-item">
        <span class="label">Status:</span>
        <span class="value">${device.isOwner ? 'Owner Device' : 'Paired Device'}</span>
      </div>
      <div class="info-item">
        <span class="label">Last Active:</span>
        <span class="value">${new Date(device.lastActive).toLocaleString()}</span>
      </div>
    `;
    deviceSection.appendChild(deviceInfo);

    // App permissions section
    const appsSection = document.createElement('div');
    appsSection.className = 'settings-section';

    const appsTitle = document.createElement('h2');
    appsTitle.textContent = 'App Permissions';
    appsSection.appendChild(appsTitle);

    // Implementation details for app permissions UI omitted for brevity

    // Add sections to container
    settingsElement.appendChild(deviceSection);
    settingsElement.appendChild(appsSection);

    // Clear container and add settings
    container.innerHTML = '';
    container.appendChild(settingsElement);
  }
}
```

## Application Integration

WebAX applications integrate with jcule's authentication system through a client library:

```typescript
// In jcule/app/src/client/AuthClient.ts

export class AuthClient {
  private appId: string;
  private appName: string;

  constructor(appId: string, appName: string) {
    this.appId = appId;
    this.appName = appName;
  }

  /**
   * Initialize the authentication client
   */
  async initialize(): Promise<void> {
    // Register with jcule
    await this.callJculeAPI('registerApp', { appId: this.appId, appName: this.appName });
  }

  /**
   * Authenticate the user
   */
  async authenticate(): Promise<boolean> {
    try {
      const result = await this.callJculeAPI('authenticateForApp', { appId: this.appId });
      return result.success || false;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Check if the device is set up
   */
  async isDeviceSetup(): Promise<boolean> {
    try {
      const result = await this.callJculeAPI('isDeviceSetup', {});
      return result.isSetup || false;
    } catch (error) {
      console.error('Failed to check device setup:', error);
      return false;
    }
  }

  /**
   * Call the jcule API
   */
  private async callJculeAPI(method: string, params: any): Promise<any> {
    // In a real implementation, this would use a messaging system to communicate with jcule
    // For now, we'll simulate it with a direct call if jcule is available
    if (typeof (window as any).jcule !== 'undefined') {
      return (window as any).jcule.authAPI[method](params);
    }

    throw new Error('Jcule API not available');
  }
}
```

## Usage Example

Here's how a WebAX application would use jcule's authentication system:

```typescript
// In a WebAX application

import { AuthClient } from 'jcule-client';

class MyApp {
  private authClient: AuthClient;

  constructor() {
    // Initialize with app ID and name
    this.authClient = new AuthClient('com.example.myapp', 'My WebAX App');
  }

  async initialize() {
    // Initialize authentication client
    await this.authClient.initialize();

    // Check if device is set up
    const isDeviceSetup = await this.authClient.isDeviceSetup();

    if (!isDeviceSetup) {
      // Redirect to jcule settings for device setup
      this.redirectToJculeSettings();
      return;
    }

    // Authenticate user
    const authenticated = await this.authClient.authenticate();

    if (authenticated) {
      // User authenticated, proceed with app
      this.showMainApp();
    } else {
      // Authentication failed, show error
      this.showAuthError();
    }
  }

  private redirectToJculeSettings() {
    // Implementation details omitted for brevity
  }

  private showMainApp() {
    // Implementation details omitted for brevity
  }

  private showAuthError() {
    // Implementation details omitted for brevity
  }
}

// Initialize the app
const app = new MyApp();
app.initialize();
```

## Implementation Plan

To implement this integration, follow these steps:

1. **Create Core Components in Jcule**:
   - Implement DeviceAuthController
   - Implement PermissionManager
   - Implement platform-specific BiometricAuth and SecureStorage

2. **Develop the Authentication API**:
   - Create the AuthAPI class
   - Implement the messaging system for app communication

3. **Build the Settings UI**:
   - Implement AuthSettingsUI
   - Integrate with jcule's settings system

4. **Create the Client Library**:
   - Implement AuthClient
   - Package for use by WebAX applications

5. **Test and Document**:
   - Test on different platforms (web, iOS, Android)
   - Document the API and integration process

## Security Considerations

1. **Permission Enforcement**: Jcule must strictly enforce authentication permissions
2. **Secure Communication**: Communication between apps and jcule must be secure
3. **Isolation**: Each app's data must be isolated from other apps
4. **Audit Logging**: Authentication attempts should be logged for security monitoring
5. **Revocation**: Jcule must support revoking app permissions

## Next Steps

The next section, [Browser-Centric Implementation](./06-browser-implementation.md), will cover the detailed implementation of device-based authentication using a browser-centric approach that works consistently across all platforms.
