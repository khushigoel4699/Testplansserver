# Product Requirements Document (PRD)
## Microsoft Playwright Testing Service

---

## 1. Overview

Microsoft Playwright Testing Service enables scalable, cloud-based browser testing for web applications using Playwright. The service provides workspace management, access control, token-based authentication, and detailed activity logs for test runs. This PRD focuses on the functional requirements and user flows for managing workspaces, access tokens, workspace access, and viewing activity logs.

---

## 2. Functional Requirements

### 2.1 Workspace Management

#### 2.1.1 Create Workspace
- **User Flow:**
  1. Sign in to the [Playwright portal](https://aka.ms/mpt/portal) with an Azure account.
  2. If no workspace exists, select "+ New workspace".
  3. Enter:
     - Workspace name (3-64 alphanumeric characters)
     - Azure subscription
     - Region (where test run data is stored)
  4. Click "Create workspace".
  5. A new resource group and Playwright Testing Azure resource are created in the selected subscription.
  6. User is redirected to the setup guide.

  *Image Reference:*
  ![Create Workspace](https://learn.microsoft.com/en-us/azure/playwright-testing/media/include-playwright-portal-create-workspace/playwright-testing-create-workspace.png)

#### 2.1.2 View List of Workspaces
- **User Flow:**
  1. In the Playwright portal, select the current workspace name at the top.
  2. Click "Manage all workspaces".
  3. View all accessible workspaces as cards, including free trial status.
  4. Select a workspace to view details and activity log.

  *Image Reference:*
  ![Manage All Workspaces](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-playwright-workspace/playwright-portal-manage-all-workspaces.png)
  ![Workspace List](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-playwright-workspace/playwright-portal-workspaces.png)

#### 2.1.3 Delete Workspace
- **User Flow:**
  1. In "Manage all workspaces", click the ellipsis (...) next to a workspace.
  2. Select "Delete workspace".
  3. Confirm deletion.
  4. Workspace and activity log are permanently deleted.

  *Image Reference:*
  ![Delete Workspace](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-playwright-workspace/playwright-portal-delete-workspace.png)

---

### 2.2 Access Token Management

#### 2.2.1 View Access Tokens
- **User Flow:**
  1. In the Playwright portal, select workspace settings.
  2. Go to "Access tokens" page.
  3. View list of tokens (name, status, expiration date).

  *Image Reference:*
  ![View Tokens](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-access-tokens/playwright-testing-view-tokens.png)

#### 2.2.2 Generate Access Token
- **User Flow:**
  1. In "Access tokens" page, click "Generate new token".
  2. Enter token details and expiration date.
  3. Click "Generate token".
  4. Copy the token value immediately (cannot be retrieved later).
  5. Use token in CI/CD secrets or environment variables.

  *Image Reference:*
  ![Generate Token](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-access-tokens/playwright-testing-generate-new-access-token.png)
  ![Copy Token](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-access-tokens/playwright-testing-copy-access-token.png)

#### 2.2.3 Delete Access Token
- **User Flow:**
  1. In "Access tokens" page, click "Delete" next to a token.
  2. Confirm deletion.
  3. Token is permanently deleted; scripts using it will fail.

  *Image Reference:*
  ![Delete Token](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-access-tokens/playwright-testing-delete-token.png)

---

### 2.3 Workspace Access Management

#### 2.3.1 Assign Roles
- **Roles:**
  - **Reader:** View-only access, cannot run tests or manage tokens.
  - **Contributor:** Manage workspace, create/delete own tokens, run tests.
  - **Owner:** Full access, including role assignments.

- **User Flow:**
  1. In Playwright portal, go to workspace settings > Users.
  2. Click "Manage users in Azure portal".
  3. In Azure portal, select workspace > Access Control (IAM).
  4. Click "Add role assignment".
  5. Select role, then select members (users/groups/service principals).
  6. Click "Review + assign".

  *Image Reference:*
  ![User Settings](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-workspace-access/playwright-testing-user-settings.png)
  ![Add Role Assignment](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-workspace-access/add-role-assignment.png)
  ![Select Role](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-workspace-access/add-role-assignment-select-role.png)
  ![Select Members](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-workspace-access/add-role-assignment-select-members.png)

#### 2.3.2 Revoke Access
- **User Flow:**
  1. In Azure portal, go to workspace > Access Control (IAM) > Role assignments.
  2. Select user and role to remove.
  3. Click "Remove" and confirm.

  *Image Reference:*
  ![Remove Role Assignment](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-workspace-access/remove-role-assignment.png)

#### 2.3.3 Use Security Groups (Optional)
- **User Flow:**
  1. Create a Microsoft Entra security group.
  2. Assign group an RBAC role on the workspace.
  3. Add group members.
  4. Group members inherit workspace access.

#### 2.3.4 Custom Roles for Restricted Tenants
- **User Flow:**
  1. Create a custom Azure RBAC role.
  2. Add Playwright permissions.
  3. Assign role to user.

  *Image Reference:*
  ![Custom Role Permissions](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-workspace-access/custom-role-permissions.png)

---

### 2.4 Activity Log

#### 2.4.1 View Activity Log
- **User Flow:**
  1. In Playwright portal, select workspace - https://playwright.microsoft.com/workspaces/westeurope_d8801a5e-dd7d-4fdf-9dd1-c478571b9cd5.
  2. View activity log on workspace home page.
  3. Log displays:
     - Total test duration
     - Max parallel browsers
     - Total time billed

  *Image Reference:*
  ![Activity Log](https://learn.microsoft.com/en-us/azure/playwright-testing/media/how-to-manage-playwright-workspace/playwright-testing-activity-log.png)

---

### 2.5 Test Execution and Results

#### 2.5.1 View Test Results
- **User Flow:**
  1. Open test report link in Playwright portal.
  2. View:
     - CI build details
     - Test run status
     - Commit ID
     - Error logs, steps, screenshots, videos
     - Trace Viewer for step-by-step analysis

  *Image Reference:*
  ![Test Run List](https://learn.microsoft.com/en-us/azure/playwright-testing/media/include-playwright-portal-view-test-results/playwright-testing-open-test-run.png)
  ![Test Preview](https://learn.microsoft.com/en-us/azure/playwright-testing/media/include-playwright-portal-view-test-results/playwright-testing-open-test.png)
  ![Trace Viewer](https://learn.microsoft.com/en-us/azure/playwright-testing/media/include-playwright-portal-view-test-results/playwright-testing-trace-viewer.png)

---

## 3. UX Scenarios

### Scenario 1: Creating and Managing a Workspace
- User signs in, creates a workspace, views all workspaces, and deletes a workspace if needed.

### Scenario 2: Managing Access Tokens
- User generates, copies, and deletes access tokens for secure test execution.

### Scenario 3: Assigning and Revoking Workspace Access
- Admin assigns roles to users/groups, revokes access, and optionally uses security groups for bulk management.

### Scenario 4: Viewing Activity Logs and Test Results
- User reviews activity logs for test runs and analyzes test results and traces for troubleshooting.

---

## 4. Notes

- **Images:** Images referenced above are essential for understanding the UI flow. Please review the provided links for visual details.
- **Non-Functional Requirements:** Omitted as per instructions.
- **Limitations:** Unable to parse image content directly; only image links and descriptions are provided.

---

## 5. References

- [Manage Playwright Workspace](https://learn.microsoft.com/en-us/azure/playwright-testing/how-to-manage-playwright-workspace?tabs=playwright)
- [Manage Access Tokens](https://learn.microsoft.com/en-us/azure/playwright-testing/how-to-manage-access-tokens)
- [Manage Workspace Access](https://learn.microsoft.com/en-us/azure/playwright-testing/how-to-manage-workspace-access)
- [Run End-to-End Tests & Activity Log](https://learn.microsoft.com/en-us/azure/playwright-testing/tutorial-run-end-to-end-tests)


