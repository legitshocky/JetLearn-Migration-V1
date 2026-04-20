# JetLearn Migration Security Notes

Last updated: 2026-04-20

## Current breach-sensitive findings

- Treat `google-service-account.json` as a high-risk credential if it has ever been committed, copied, or shared outside approved secret storage.
- The previous login screen hardcoded username-to-email mappings in the client. That creates maintenance drift and exposes internal account structure in shipped frontend code.
- The previous auth context auto-created active user profiles for any Firebase-authenticated account. That could grant unintended access if an unapproved Firebase user existed in the project.
- Several dashboard and migration views included mock or padded values. For operational tooling, misleading numbers are a control risk during incident response.

## Remediation applied in this migration target

- Replaced hardcoded client login mapping with server lookup against migrated user profiles.
- Blocked automatic profile creation for unknown users.
- Added email-based profile lookup so migrated users align with Firebase email authentication.
- Added basic API hardening headers and a lightweight auth lookup rate limit.
- Removed padded migration stats from the learner migration dashboard.

## Required follow-up after any suspected credential exposure

1. Rotate the Google service account key immediately.
2. Audit the service account permissions and reduce them to the minimum required scopes and roles.
3. Verify the key is no longer present in repository history, deployment artifacts, shared drives, or chat attachments.
4. Enable repository secret scanning and push protection.
5. Review recent authentication, Sheets, Firebase, and HubSpot access logs for unusual activity.
6. Re-run the user migration so every Firestore user document includes `emailLower` for stable auth mapping.

## Recent breach guidance used for this note

- Google Cloud recommends avoiding service account keys where possible and treating exposed keys as compromised:
  [Best practices for using service accounts securely](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts)
- Google Cloud recommends rotation and exposure response for leaked service account keys:
  [Best practices for managing service account keys](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)
- GitHub recommends rotating secrets first and then deciding whether history rewrite is needed:
  [Removing sensitive data from a repository](https://docs.github.com/articles/remove-sensitive-data)
- GitHub secret scanning can help detect exposed credentials in history and future pushes:
  [About secret scanning](https://docs.github.com/code-security/secret-scanning/about-secret-scanning)
