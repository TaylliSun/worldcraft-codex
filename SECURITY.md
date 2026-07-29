# Security Policy

## Supported release

Security fixes target the newest published Windows x64 release. Prerelease candidates are evaluation builds and may be replaced without long-term support.

## Reporting

Use the HTTPS support/security page embedded in the signed public build and linked from its release notes. Do not attach project files, `.wcodex` packages, AI credentials, signing material, or personal data to an initial report. Include the application version, Windows version, reproduction steps, expected behavior, and the smallest non-sensitive evidence needed to reproduce the issue.

This repository currently contains only an unsigned candidate configuration and does not claim an active public disclosure endpoint. Public distribution is blocked until the actual publisher configures and verifies `WORLDCRAFT_SUPPORT_URL`.

Do not publish a suspected vulnerability before the publisher has had a reasonable opportunity to investigate. No response-time or bounty commitment is implied by this candidate policy.

## Security boundaries

- Project data is local-first and is not telemetry.
- Third-party AI requests occur only after the author configures and invokes a provider.
- Installed updates must come from the configured HTTPS channel and pass the updater's package verification.
- Public Windows builds must pass code-signing, dependency, secret, license, SBOM and checksum gates.
- Community, plugins, cloud accounts and remote collaboration are outside the current product boundary.
