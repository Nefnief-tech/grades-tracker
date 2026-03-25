# Guide: Adding and Managing Grades

This walkthrough shows how to track your academic performance from the moment you open the app to viewing your trend charts.

---

## Step 1 — Open the Dashboard

Navigate to [http://localhost:3000](http://localhost:3000) (or your deployed URL). You will see the **Dashboard** with a list of your subjects (empty on first use).

---

## Step 2 — Create a Subject

1. In the **"Add New Subject"** form at the top of the dashboard, type a subject name (e.g., `Mathematics`).
2. Optionally choose a colour to distinguish this subject visually.
3. Click **"Add Subject"**.

The subject card now appears in the subject list with a default average of `—`.

!!! tip
    You can reorder subjects by dragging their cards with the drag handle on the left.

---

## Step 3 — Open the Subject Detail Page

Click on the subject card. You will be taken to the **Subject Detail** page, which shows:

- The subject name and current average grade
- A grade history chart (empty initially)
- The grade entry form

---

## Step 4 — Add a Grade

In the **"Add New Grade"** form:

| Field | Description |
|---|---|
| **Grade** | Numeric value from 1 (best) to 6 (worst) |
| **Type** | Test, Oral Exam, Homework, or Project |
| **Date** | Date the grade was received |

Fill in the fields and click **"Add Grade"**.

The grade appears in the list below and the average updates immediately.

---

## Step 5 — Understanding the Weight System

Grades are averaged using weights:

- **Test / Oral Exam** → weight `2.0`
- **Homework / Project** → weight `1.0`

**Example:**

| Grade | Type | Weight | Contribution |
|---|---|---|---|
| 2 | Test | 2.0 | 4 |
| 4 | Homework | 1.0 | 4 |
| 3 | Test | 2.0 | 6 |
| **Average** | | **5.0** | **14 / 5 = 2.8** |

---

## Step 6 — View the Grade History Chart

Scroll down on the Subject Detail page to see the **Grade History Chart**. It plots your grade values over time, making it easy to see whether your performance is improving or declining.

---

## Step 7 — Delete or Edit a Grade

- Click the **edit icon** next to a grade to change its value, type, or date.
- Click the **trash icon** to delete a grade (with confirmation).

!!! warning
    Deleted grades cannot be recovered. If cloud sync is enabled, the deletion is propagated to all devices.

---

## Step 8 — View Overall Analytics

Navigate to **Analytics** in the top navigation. This page shows:

- Subject-by-subject comparison bar chart
- Overall average across all subjects
- Performance trend over the last 30/60/90 days

---

## Next Steps

- [Set up cloud sync](../getting-started.md#docker-deployment) to access grades on multiple devices.
- [Export your grades](../api/export.md) as CSV or PDF.
- [Configure 2FA](./setting-up-2fa.md) to secure your cloud account.
