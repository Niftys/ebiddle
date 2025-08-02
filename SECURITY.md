# Security Guide

This document outlines the security measures and requirements for the eBay Price Guesser project.

## 🔒 Security Checklist

Before uploading to GitHub, ensure you have completed all of the following:

### ✅ Environment Variables
- [ ] All API keys and tokens are stored in environment variables
- [ ] No hardcoded credentials in source code
- [ ] `.env` file is in `.gitignore`
- [ ] `env.example` file shows required variables without real values

### ✅ Firebase Security
- [ ] Firebase service account keys are NOT committed to version control
- [ ] Firebase service account keys are in `.gitignore`
- [ ] Firebase project uses proper security rules
- [ ] Environment variables are set in Firebase Functions

### ✅ API Security
- [ ] eBay API credentials are environment variables
- [ ] Authentication tokens are environment variables
- [ ] No API keys logged to console
- [ ] Sensitive data is masked in debug output

### ✅ Code Security
- [ ] No hardcoded passwords or tokens
- [ ] No sensitive data in comments
- [ ] Proper error handling without exposing internals
- [ ] Input validation on all user inputs

## 🚨 Critical Security Issues Fixed

1. **Removed Firebase Service Account Key**: The file `scripts/ebiddlegame-firebase-adminsdk-fbsvc-d39c66ed63.json` has been deleted
2. **Removed Hardcoded Tokens**: All hardcoded authentication tokens have been removed
3. **Enhanced .gitignore**: Added comprehensive security exclusions
4. **Environment Variable Validation**: Added proper validation for required environment variables

## 🔧 Required Environment Variables

Create a `.env` file with these variables:

```bash
# eBay API Credentials
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id

# Cache Reset Token
CACHE_RESET_TOKEN=your_secure_token_here

# Firebase Configuration (if using Firebase)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 🛡️ Security Best Practices

1. **Never commit sensitive files**: Use `.gitignore` to exclude them
2. **Use environment variables**: Store all secrets in environment variables
3. **Validate inputs**: Always validate and sanitize user inputs
4. **Use HTTPS**: Always use HTTPS in production
5. **Regular updates**: Keep dependencies updated
6. **Monitor logs**: Check for suspicious activity
7. **Backup securely**: Store backups with proper encryption

## 🔍 Security Testing

Before deployment, test:
- [ ] Environment variables are properly loaded
- [ ] No sensitive data in build artifacts
- [ ] API endpoints are properly secured
- [ ] Error messages don't expose sensitive information

## 📞 Security Contact

If you discover any security vulnerabilities, please:
1. Do not create a public issue
2. Contact the maintainer privately
3. Provide detailed information about the vulnerability 