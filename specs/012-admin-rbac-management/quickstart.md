# Quickstart Validation Guide: Admin Management & RBAC

**Feature**: Admin Management & Role-Based Access Control (RBAC)  
**Feature Directory**: `specs/012-admin-rbac-management`  

---

## Validation Scenarios

### Scenario 1: Super Admin Navigation & User Creation
1. Log in as a user with the `Super Admin` role (or `is_superuser = 1`).
2. Verify that the **Admin** item appears in the left sidebar with a shield icon.
3. Click **Admin** to navigate to `/admin`.
4. Click **Add New User**. Fill in username (`test_viewer`), email (`viewer@bosch.com`), password, and select role `Viewer`.
5. Click **Create User**. Confirm `test_viewer` appears in the user list table with a blue `Viewer` role badge and green `Active` status badge.

---

### Scenario 2: Viewer Read-Only Enforcement Test
1. Log out of Super Admin session.
2. Log in as `test_viewer`.
3. Verify that the **Admin** option is **NOT** present in the sidebar.
4. Try typing `http://localhost:5173/admin` in the browser address bar. Confirm redirection to `/` with an authorization warning toast.
5. Navigate to `/ratecard`. Confirm that "Add Item", "Upload Sheet", and "Wipe Catalog" buttons are hidden/disabled, and clicking table cells does not open edit inputs.
6. Navigate to `/boq`. Confirm that "Save BOQ Quote" button is disabled/hidden or prompts a read-only warning.

---

### Scenario 3: User Deactivation Test
1. Log in back as Super Admin and open `/admin`.
2. Find `test_viewer` in the user list.
3. Click the status toggle switch to set status to **Inactive**.
4. Log out and attempt to log in as `test_viewer`.
5. Confirm authentication is rejected with the message: `"Account is deactivated. Contact system administrator."`

---

### Scenario 4: Price Admin Access Boundaries
1. Log in as a `Price Admin` user.
2. Navigate to `/ratecard`. Confirm ability to edit product buying prices and list prices.
3. Confirm that the **Admin** option is hidden from the sidebar.
