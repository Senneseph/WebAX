# iOS Implementation Guide

## Introduction

This guide provides a practical implementation of device-based authentication for iOS applications. The approach uses Touch ID/Face ID for authentication and securely stores device tokens in the iOS Keychain.

## Core Functionality

The implementation focuses on two key scenarios:

1. **First-time setup**: When a user installs the app, we authenticate them using biometrics and set up their device
2. **Regular authentication**: When a user launches the app or returns to it, we verify their identity using biometrics

## Implementation

### Prerequisites

- iOS 13.0 or later
- Swift 5.0 or later
- Xcode 12.0 or later

### Required Frameworks

```swift
import LocalAuthentication
import Security
```

### Biometric Authentication

First, let's implement the biometric authentication functionality:

```swift
class BiometricAuthenticator {
    enum BiometricType {
        case none
        case touchID
        case faceID
    }
    
    enum AuthenticationError: Error {
        case notAvailable
        case notEnrolled
        case cancelled
        case failed
        case denied
    }
    
    // Check what type of biometric authentication is available
    static func biometricType() -> BiometricType {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return .none
        }
        
        if #available(iOS 11.0, *) {
            switch context.biometryType {
            case .touchID:
                return .touchID
            case .faceID:
                return .faceID
            default:
                return .none
            }
        } else {
            return .touchID // Prior to iOS 11, only Touch ID is available
        }
    }
    
    // Authenticate the user with biometrics
    static func authenticate(reason: String = "Verify your identity") async throws -> Bool {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            if let error = error as? LAError {
                switch error.code {
                case .biometryNotAvailable:
                    throw AuthenticationError.notAvailable
                case .biometryNotEnrolled:
                    throw AuthenticationError.notEnrolled
                default:
                    throw AuthenticationError.failed
                }
            }
            throw AuthenticationError.failed
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
                if success {
                    continuation.resume(returning: true)
                } else if let error = error as? LAError {
                    switch error.code {
                    case .userCancel:
                        continuation.resume(throwing: AuthenticationError.cancelled)
                    case .userFallback:
                        continuation.resume(throwing: AuthenticationError.denied)
                    case .authenticationFailed:
                        continuation.resume(throwing: AuthenticationError.failed)
                    default:
                        continuation.resume(throwing: AuthenticationError.failed)
                    }
                } else {
                    continuation.resume(throwing: AuthenticationError.failed)
                }
            }
        }
    }
    
    // Fallback to device passcode if biometrics are not available
    static func authenticateWithPasscode(reason: String = "Verify your identity") async throws -> Bool {
        let context = LAContext()
        
        return try await withCheckedThrowingContinuation { continuation in
            context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { success, error in
                if success {
                    continuation.resume(returning: true)
                } else if let error = error as? LAError {
                    switch error.code {
                    case .userCancel:
                        continuation.resume(throwing: AuthenticationError.cancelled)
                    case .userFallback:
                        continuation.resume(throwing: AuthenticationError.denied)
                    case .authenticationFailed:
                        continuation.resume(throwing: AuthenticationError.failed)
                    default:
                        continuation.resume(throwing: AuthenticationError.failed)
                    }
                } else {
                    continuation.resume(throwing: AuthenticationError.failed)
                }
            }
        }
    }
}
```

### Secure Storage

Next, let's implement secure storage for device tokens using the iOS Keychain:

```swift
class SecureStorage {
    enum StorageError: Error {
        case saveFailed
        case loadFailed
        case deleteFailed
        case itemNotFound
    }
    
    // Save data to the keychain
    static func save(key: String, data: Data) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        // Delete any existing item
        SecItemDelete(query as CFDictionary)
        
        // Add the new item
        let status = SecItemAdd(query as CFDictionary, nil)
        
        guard status == errSecSuccess else {
            throw StorageError.saveFailed
        }
    }
    
    // Load data from the keychain
    static func load(key: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw StorageError.itemNotFound
            }
            throw StorageError.loadFailed
        }
        
        guard let data = result as? Data else {
            throw StorageError.loadFailed
        }
        
        return data
    }
    
    // Delete data from the keychain
    static func delete(key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw StorageError.deleteFailed
        }
    }
    
    // Check if an item exists in the keychain
    static func exists(key: String) -> Bool {
        do {
            _ = try load(key: key)
            return true
        } catch {
            return false
        }
    }
}
```

### Device Authentication Manager

Now, let's create a manager class that combines biometric authentication and secure storage:

```swift
class DeviceAuthManager {
    enum AuthStatus {
        case notSetup
        case authenticated
        case failed
    }
    
    private static let deviceTokenKey = "device_token"
    private static let deviceMetadataKey = "device_metadata"
    private static let isOwnerKey = "is_owner_device"
    
    // Check if the device is set up
    static func isDeviceSetup() -> Bool {
        return SecureStorage.exists(key: deviceTokenKey)
    }
    
    // Set up the device (first-time use)
    static func setupDevice(deviceName: String) async throws {
        // Authenticate the user
        do {
            let authenticated = try await BiometricAuthenticator.authenticate(
                reason: "Authenticate to set up this device"
            )
            
            guard authenticated else {
                throw BiometricAuthenticator.AuthenticationError.failed
            }
            
            // Generate a device token
            let deviceToken = generateDeviceToken()
            
            // Create device metadata
            let metadata = DeviceMetadata(
                id: UUID().uuidString,
                name: deviceName,
                type: UIDevice.current.userInterfaceIdiom == .phone ? "iPhone" : "iPad",
                createdAt: Date(),
                isOwner: true,
                lastActive: Date()
            )
            
            // Save to secure storage
            try SecureStorage.save(key: deviceTokenKey, data: deviceToken)
            try SecureStorage.save(key: deviceMetadataKey, data: try JSONEncoder().encode(metadata))
            try SecureStorage.save(key: isOwnerKey, data: Data("true".utf8))
            
        } catch {
            // If biometrics fail, try device passcode
            if let authError = error as? BiometricAuthenticator.AuthenticationError {
                if authError == .notAvailable || authError == .notEnrolled {
                    let authenticated = try await BiometricAuthenticator.authenticateWithPasscode(
                        reason: "Authenticate to set up this device"
                    )
                    
                    guard authenticated else {
                        throw BiometricAuthenticator.AuthenticationError.failed
                    }
                    
                    // Generate a device token
                    let deviceToken = generateDeviceToken()
                    
                    // Create device metadata
                    let metadata = DeviceMetadata(
                        id: UUID().uuidString,
                        name: deviceName,
                        type: UIDevice.current.userInterfaceIdiom == .phone ? "iPhone" : "iPad",
                        createdAt: Date(),
                        isOwner: true,
                        lastActive: Date()
                    )
                    
                    // Save to secure storage
                    try SecureStorage.save(key: deviceTokenKey, data: deviceToken)
                    try SecureStorage.save(key: deviceMetadataKey, data: try JSONEncoder().encode(metadata))
                    try SecureStorage.save(key: isOwnerKey, data: Data("true".utf8))
                } else {
                    throw error
                }
            } else {
                throw error
            }
        }
    }
    
    // Authenticate the user (regular use)
    static func authenticateUser() async -> AuthStatus {
        // Check if device is set up
        guard isDeviceSetup() else {
            return .notSetup
        }
        
        do {
            // Try biometric authentication
            let authenticated = try await BiometricAuthenticator.authenticate(
                reason: "Verify your identity to access the app"
            )
            
            if authenticated {
                // Update last active timestamp
                if var metadata = try getDeviceMetadata() {
                    metadata.lastActive = Date()
                    try SecureStorage.save(key: deviceMetadataKey, data: try JSONEncoder().encode(metadata))
                }
                
                return .authenticated
            } else {
                return .failed
            }
        } catch {
            // If biometrics fail, try device passcode
            if let authError = error as? BiometricAuthenticator.AuthenticationError {
                if authError == .notAvailable || authError == .notEnrolled {
                    do {
                        let authenticated = try await BiometricAuthenticator.authenticateWithPasscode(
                            reason: "Verify your identity to access the app"
                        )
                        
                        if authenticated {
                            // Update last active timestamp
                            if var metadata = try getDeviceMetadata() {
                                metadata.lastActive = Date()
                                try SecureStorage.save(key: deviceMetadataKey, data: try JSONEncoder().encode(metadata))
                            }
                            
                            return .authenticated
                        } else {
                            return .failed
                        }
                    } catch {
                        return .failed
                    }
                }
            }
            
            return .failed
        }
    }
    
    // Generate a secure device token
    private static func generateDeviceToken() -> Data {
        var tokenData = Data(count: 32) // 256 bits
        _ = tokenData.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!) }
        return tokenData
    }
    
    // Get device metadata
    static func getDeviceMetadata() throws -> DeviceMetadata? {
        guard let data = try? SecureStorage.load(key: deviceMetadataKey) else {
            return nil
        }
        
        return try JSONDecoder().decode(DeviceMetadata.self, from: data)
    }
    
    // Check if this is the owner device
    static func isOwnerDevice() -> Bool {
        guard let data = try? SecureStorage.load(key: isOwnerKey),
              let isOwner = String(data: data, encoding: .utf8) else {
            return false
        }
        
        return isOwner == "true"
    }
}

// Device metadata structure
struct DeviceMetadata: Codable {
    var id: String
    var name: String
    var type: String
    var createdAt: Date
    var isOwner: Bool
    var lastActive: Date
}
```

### Usage in App Delegate

Here's how to use the authentication manager in your app:

```swift
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Set up the window
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // Check if device is set up
        if DeviceAuthManager.isDeviceSetup() {
            // Show authentication screen
            let authViewController = AuthenticationViewController()
            window?.rootViewController = authViewController
        } else {
            // Show setup screen
            let setupViewController = DeviceSetupViewController()
            window?.rootViewController = setupViewController
        }
        
        window?.makeKeyAndVisible()
        
        return true
    }
}
```

### Authentication View Controller

```swift
import UIKit

class AuthenticationViewController: UIViewController {
    private let activityIndicator = UIActivityIndicatorView(style: .large)
    private let statusLabel = UILabel()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .systemBackground
        
        // Set up UI
        setupUI()
        
        // Authenticate when view appears
        authenticateUser()
    }
    
    private func setupUI() {
        // Status label
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        statusLabel.textAlignment = .center
        statusLabel.font = UIFont.systemFont(ofSize: 18)
        statusLabel.text = "Verifying your identity..."
        view.addSubview(statusLabel)
        
        // Activity indicator
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)
        
        // Layout constraints
        NSLayoutConstraint.activate([
            statusLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            statusLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -40),
            statusLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            statusLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 20)
        ])
    }
    
    private func authenticateUser() {
        activityIndicator.startAnimating()
        
        Task {
            let authStatus = await DeviceAuthManager.authenticateUser()
            
            DispatchQueue.main.async {
                self.activityIndicator.stopAnimating()
                
                switch authStatus {
                case .authenticated:
                    // Authentication successful, show main app
                    self.showMainApp()
                case .notSetup:
                    // Device not set up, show setup screen
                    self.showSetupScreen()
                case .failed:
                    // Authentication failed, show error
                    self.statusLabel.text = "Authentication failed. Please try again."
                    self.showRetryButton()
                }
            }
        }
    }
    
    private func showRetryButton() {
        let retryButton = UIButton(type: .system)
        retryButton.translatesAutoresizingMaskIntoConstraints = false
        retryButton.setTitle("Retry", for: .normal)
        retryButton.addTarget(self, action: #selector(retryAuthentication), for: .touchUpInside)
        view.addSubview(retryButton)
        
        NSLayoutConstraint.activate([
            retryButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            retryButton.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 20)
        ])
    }
    
    @objc private func retryAuthentication() {
        // Remove retry button
        for subview in view.subviews {
            if let button = subview as? UIButton, button.title(for: .normal) == "Retry" {
                button.removeFromSuperview()
            }
        }
        
        // Reset status label
        statusLabel.text = "Verifying your identity..."
        
        // Try authentication again
        authenticateUser()
    }
    
    private func showMainApp() {
        // Replace with your main app view controller
        let mainViewController = MainViewController()
        UIApplication.shared.windows.first?.rootViewController = mainViewController
        UIApplication.shared.windows.first?.makeKeyAndVisible()
    }
    
    private func showSetupScreen() {
        // Show device setup screen
        let setupViewController = DeviceSetupViewController()
        UIApplication.shared.windows.first?.rootViewController = setupViewController
        UIApplication.shared.windows.first?.makeKeyAndVisible()
    }
}
```

### Device Setup View Controller

```swift
import UIKit

class DeviceSetupViewController: UIViewController {
    private let titleLabel = UILabel()
    private let descriptionLabel = UILabel()
    private let deviceNameTextField = UITextField()
    private let setupButton = UIButton(type: .system)
    private let activityIndicator = UIActivityIndicatorView(style: .medium)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .systemBackground
        
        // Set up UI
        setupUI()
    }
    
    private func setupUI() {
        // Title label
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.text = "Set Up Your Device"
        titleLabel.font = UIFont.boldSystemFont(ofSize: 24)
        titleLabel.textAlignment = .center
        view.addSubview(titleLabel)
        
        // Description label
        descriptionLabel.translatesAutoresizingMaskIntoConstraints = false
        descriptionLabel.text = "This app uses your device's biometric authentication for a secure and seamless experience. No passwords needed!"
        descriptionLabel.font = UIFont.systemFont(ofSize: 16)
        descriptionLabel.textAlignment = .center
        descriptionLabel.numberOfLines = 0
        view.addSubview(descriptionLabel)
        
        // Device name text field
        deviceNameTextField.translatesAutoresizingMaskIntoConstraints = false
        deviceNameTextField.placeholder = "Device Name (e.g., My iPhone)"
        deviceNameTextField.borderStyle = .roundedRect
        deviceNameTextField.autocapitalizationType = .words
        deviceNameTextField.clearButtonMode = .whileEditing
        view.addSubview(deviceNameTextField)
        
        // Set default device name
        let deviceName = UIDevice.current.name
        deviceNameTextField.text = deviceName
        
        // Setup button
        setupButton.translatesAutoresizingMaskIntoConstraints = false
        setupButton.setTitle("Set Up Device", for: .normal)
        setupButton.addTarget(self, action: #selector(setupButtonTapped), for: .touchUpInside)
        view.addSubview(setupButton)
        
        // Activity indicator
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        activityIndicator.hidesWhenStopped = true
        setupButton.addSubview(activityIndicator)
        
        // Layout constraints
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 40),
            titleLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            descriptionLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            descriptionLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            descriptionLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            deviceNameTextField.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 40),
            deviceNameTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            deviceNameTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            deviceNameTextField.heightAnchor.constraint(equalToConstant: 44),
            
            setupButton.topAnchor.constraint(equalTo: deviceNameTextField.bottomAnchor, constant: 30),
            setupButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            setupButton.widthAnchor.constraint(equalToConstant: 200),
            setupButton.heightAnchor.constraint(equalToConstant: 44),
            
            activityIndicator.centerYAnchor.constraint(equalTo: setupButton.centerYAnchor),
            activityIndicator.trailingAnchor.constraint(equalTo: setupButton.trailingAnchor, constant: -10)
        ])
        
        // Add tap gesture to dismiss keyboard
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tapGesture)
    }
    
    @objc private func dismissKeyboard() {
        view.endEditing(true)
    }
    
    @objc private func setupButtonTapped() {
        // Validate device name
        guard let deviceName = deviceNameTextField.text, !deviceName.isEmpty else {
            showAlert(title: "Error", message: "Please enter a device name")
            return
        }
        
        // Disable button and show activity indicator
        setupButton.isEnabled = false
        activityIndicator.startAnimating()
        
        // Set up device
        Task {
            do {
                try await DeviceAuthManager.setupDevice(deviceName: deviceName)
                
                DispatchQueue.main.async {
                    self.activityIndicator.stopAnimating()
                    self.setupButton.isEnabled = true
                    
                    // Show success and proceed to main app
                    self.showSetupSuccess()
                }
            } catch {
                DispatchQueue.main.async {
                    self.activityIndicator.stopAnimating()
                    self.setupButton.isEnabled = true
                    
                    // Show error
                    self.showAlert(title: "Setup Failed", message: "Could not set up device: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func showSetupSuccess() {
        let alert = UIAlertController(
            title: "Setup Complete",
            message: "Your device has been successfully set up. You can now use the app!",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Continue", style: .default) { _ in
            // Show main app
            let mainViewController = MainViewController()
            UIApplication.shared.windows.first?.rootViewController = mainViewController
            UIApplication.shared.windows.first?.makeKeyAndVisible()
        })
        
        present(alert, animated: true)
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(
            title: title,
            message: message,
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        
        present(alert, animated: true)
    }
}
```

## App Configuration

### Info.plist Settings

Add the following entries to your Info.plist file to request biometric authentication permissions:

```xml
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID to securely authenticate you without passwords.</string>
```

### Entitlements

Make sure your app has the Keychain Sharing entitlement enabled if you plan to share keychain items between your apps.

## Testing

To test the implementation:

1. Run the app on a device with biometric capabilities (Touch ID or Face ID)
2. Go through the setup process
3. Close the app completely
4. Relaunch the app and verify that biometric authentication is requested
5. Test the fallback to device passcode by canceling biometric authentication

## Security Considerations

1. **Secure Storage**: Device tokens are stored in the Keychain with the `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` attribute, ensuring they can only be accessed when the device is unlocked and cannot be migrated to other devices.

2. **Biometric Authentication**: The implementation uses the LocalAuthentication framework, which leverages the Secure Enclave for biometric processing.

3. **Fallback Mechanism**: If biometric authentication is not available, the implementation falls back to device passcode, which is still secure.

4. **No Sensitive Data in Memory**: The implementation minimizes keeping sensitive data in memory.

## Next Steps

This implementation covers the basic device authentication flow. To extend it:

1. **Multi-Device Support**: Implement device pairing functionality
2. **Data Synchronization**: Add secure data synchronization between paired devices
3. **Recovery Options**: Implement recovery mechanisms for lost devices
4. **Activity Monitoring**: Add device activity tracking for security monitoring

By following this implementation guide, you can create a secure, password-less authentication system for your iOS app that leverages the device's built-in biometric capabilities.
