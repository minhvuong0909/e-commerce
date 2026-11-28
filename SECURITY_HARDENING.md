# Security hardening — 2026-10-15

## Patched boundaries

- Registration explicitly constructs a User: server-generated ID/token, User role, Unverified status. Extra request fields are not persisted.
- Catalog mutations require a verified Admin; blocked accounts cannot pass role guards. Uploads require a verified Admin/Staff and are rate limited before parsing files.
- Payment creation requires the authenticated order owner and the matching payment method; cancelled/refunded orders are rejected. Guest online payments fail closed; guest checkout uses COD.
- MoMo webhook is registered before the dynamic payment route. Mock-success is disabled unless explicitly enabled, non-production and sandbox; only a verified Admin owning the order may use it.
- PayOS return must match the stored Payment/orderCode/order/amount, consult the provider and confirm sufficient paid amount. Webhook requires the signed provider data and sufficient amount.
- Gateway confirmations update Payment and Order in a single transaction, rechecking cancellation/refund state at commit. Gateway IDs are kept mapped to the original payment request.
- Orders normalize duplicate product IDs, strictly validate integer quantities and reserve stock conditionally. Order, lines, stock, voucher use and authenticated cart consumption share one transaction.
- Cancellation/restocking are transactional. Paid orders must use the refund workflow rather than customer cancellation.
- Unsupported automatic refunds are rejected without falsely marking them refunded. PayOS refunds use an atomic processing claim, a stable reference and verified successful payout state; incomplete/uncertain payouts stay locked for manual reconciliation.
- Registration, guest orders, uploads, shipping lookups and AI have request limits. Public guest shipping endpoints validate coordinates and address size; they never expose order/account details. AI message size is bounded and search text is escaped before regex construction.

## Behavior changes

- Guest/buy-now checkout: COD only. Authenticated cart checkout retains configured online payment flows. No anonymous payment-link endpoint was introduced.
- Catalog management: Admin only, matching the frontend authorization model. Staff can upload media but cannot mutate catalog records.
- Guest result page is public but does not expose private order data or grant access to order-detail APIs. Its URL/display is not a payment receipt or authority to fulfill an order; fulfillment must use backend order/payment records.
- `ENABLE_PAYMENT_MOCK` is opt-in and never permitted in production. Do not enable it on a publicly accessible environment.

## Verification

- Backend unit/regression suite after cleanup: 84 tests passed, including 45 security checks and 3 ordered-startup checks. All database, email and payment-provider interactions in new tests are mocked.
- Frontend and backend TypeScript checks passed.
- Frontend production build passed.
- No live order, payment, refund, upload or external credential operation was performed.
- Real concurrent transactions, rollback/failover behavior and payment-provider sandbox callbacks still need staging integration tests. Unit mocks do not prove MongoDB transactional behavior in deployment.

## Deployment checklist — required before real sales

1. Run MongoDB as a replica set or supported sharded deployment with transaction permissions. The application intentionally does not fall back to non-atomic writes on standalone MongoDB.
2. Rotate previously disclosed Telegram/OpenAI and other compromised credentials at their providers, then update private server environment variables. This patch does not revoke exposed credentials.
3. Audit existing Admin/Staff accounts and verification records for unauthorized changes; fixing registration does not remove accounts created before the patch. Revoke affected sessions after account remediation.
4. Reconcile any previously misconfirmed payments/refunds against provider records. Do not blindly trust historical `COMPLETED`/`REFUNDED` flags.
5. A refund with `refund_state=processing` must be reconciled against the stable `REFUND-<orderId>` reference before retrying. Do not clear the lock without checking whether money was transferred. A payout failure/timeout is deliberately not treated as proof that no money moved.
6. At multiple API replicas, use shared rate-limit storage and edge limits. Current in-memory limits are per process; configure Express proxy trust only for known deployment proxy hops, never arbitrary forwarded headers.
7. Verify auth roles, ownership, guest COD, online cart checkout, valid/invalid signed callbacks, simultaneous last-stock/last-voucher orders, cancellation and refund reconciliation in staging.

## Separate known issue

The pre-existing Dashboard effect lint issue has been removed by adopting the project's React Query data-fetching pattern. Dashboard analytics accuracy (pagination, revenue and fixed growth labels) remains a separate task, not part of this structural cleanup.
