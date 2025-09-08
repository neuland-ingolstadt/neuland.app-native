# Security Policy

## Supported Versions

Due to the nature of mobile app update cycles and automatic updates via app stores, **only the latest released version** of Neuland Next is actively supported with security updates.

| Version     | Supported          |
|-------------|--------------------|
| Latest      | ✅ Yes              |
| Older       | ❌ No               |

## Reporting a Vulnerability

If you discover a security vulnerability, we encourage responsible disclosure. Please avoid public disclosure until we’ve had a chance to investigate and issue a fix.

### How to Report

- Email: [security@neuland-ingolstadt.de](mailto:security@neuland-ingolstadt.de)
- GitHub: [Report a vulnerability](https://github.com/neuland-ingolstadt/neuland.app-native/security/advisories)

### What to Expect

- Acknowledgment within **3 business days**
- Updates on investigation and remediation progress
- Notification when a fix has been released or the issue is closed

## Security Practices

We apply industry best practices to ensure a secure and privacy-focused experience:

- 🔒 No personal data is stored on our servers
- 🗝️ Credentials are securely stored using iOS Keychain / Android Keystore
- 📡 All communication is encrypted and happens directly between your device and the university servers
- 🛠️ The app is regularly scanned for vulnerabilities using GitHub CodeQL and automated CI workflows
- 🔍 The source code is fully open and available for independent review

## Disclosure Policy

We kindly ask:

- Do not publicly disclose vulnerabilities before we've resolved them
- Provide clear steps to reproduce any issue
- Do not perform tests on production systems without permission

Thank you for helping us keep Neuland Next safe for everyone!
