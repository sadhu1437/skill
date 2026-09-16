# GitHub Pull Request Review Workflow - 2 Approval Setup

**Objective:** Push SkillBloom changes to GitHub with PR review requiring 2 approvals before merge

---

## 📋 Step-by-Step Workflow

### Phase 1: Prepare Changes Locally

**Step 1: Check Current Branch**
```powershell
cd C:\Users\sande\Documents\SkillBloom
git status
git branch -a
```

**Expected Output:**
- Current branch: `main` or `develop`
- Should see remote branches like `origin/main`

**Step 2: Create Feature Branch** (if not already created)
```powershell
git checkout -b feature/adsense-integration-and-monetization
git branch -vv
```

**Purpose:** Keep changes separate from main branch for PR workflow

---

### Phase 2: Stage and Commit Changes

**Step 3: Stage All Changes**
```powershell
git add .
git status
```

**Expected:** All changed files shown in "Changes to be committed"

**Step 4: Commit Changes**
```powershell
git commit -m "feat: Complete AdSense monetization integration

- Add AdSense settings model to backend
- Integrate AdSlot component in ExplorePage and ArticleDetailPage
- Add admin panel monetization controls
- Implement cross-tab sync via localStorage
- Fix article deletion with cache busting
- Add TipTap rich editor with selection-based link insertion
- Add responsive ad slot styling
- Complete system verification and testing documentation

This PR integrates Google AdSense monetization into the Explore section,
allowing staff to configure ads directly from the admin panel. All changes
include proper authorization checks and cache management."
```

**Step 5: Verify Commit**
```powershell
git log --oneline -3
```

---

### Phase 3: Push to GitHub

**Step 6: Push Feature Branch**
```powershell
git push -u origin feature/adsense-integration-and-monetization
```

**Expected Output:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Delta compression using up to X threads
To https://github.com/sadhu1437/SkillBloom.git
 * [new branch]      feature/adsense-integration-and-monetization -> feature/adsense-integration-and-monetization
Branch 'feature/adsense-integration-and-monetization' set up to track 'origin/feature/adsense-integration-and-monetization'.
```

**Step 7: Verify Push**
```powershell
git branch -vv
```

Should show:
```
* feature/adsense-integration-and-monetization [origin/feature/adsense-integration-and-monetization] ...
```

---

### Phase 4: Create Pull Request on GitHub

**Step 8: Open GitHub in Browser**
1. Go to: https://github.com/sadhu1437/SkillBloom
2. You should see a banner: "Compare & pull request"
3. Click the green button

**OR if no banner:**
1. Go to: https://github.com/sadhu1437/SkillBloom/pulls
2. Click "New pull request"
3. Select:
   - **Base branch:** `main` (or your production branch)
   - **Compare branch:** `feature/adsense-integration-and-monetization`

**Step 9: Fill PR Details**

```
Title:
feat: Add Google AdSense monetization to Explore section

Description:
## Overview
This PR integrates Google AdSense monetization into the SkillBloom Explore 
section, enabling site-wide ad revenue generation with staff controls.

## Changes Made
- ✅ Backend: AdSenseSettings model with GET/PATCH endpoints
- ✅ Frontend: AdSlot component for ad rendering
- ✅ Admin: Monetization panel in Explore CMS
- ✅ Integration: AdSlots on Explore feed and article detail pages
- ✅ Authorization: Staff-only access to ad settings
- ✅ Sync: Cross-tab deletion via localStorage
- ✅ Docs: Complete system verification and testing guides

## Files Changed
- backend/apps/core/models.py (AdSenseSettings model)
- backend/apps/core/views.py (AdSenseSettingsView)
- backend/apps/core/urls.py (adsense/ endpoint)
- frontend/src/components/AdSlot.jsx (new component)
- frontend/src/pages/ExploreAdminPage.jsx (monetization form)
- frontend/src/pages/ExplorePage.jsx (AdSlot integration)
- frontend/src/pages/ArticleDetailPage.jsx (AdSlot integration)
- frontend/src/pages/explore-admin.css (ad slot styling)

## Testing
- ✅ All API endpoints tested
- ✅ Frontend builds successfully (570KB)
- ✅ Admin panel settings persist
- ✅ Cross-tab sync verified
- ✅ Authorization checks working
- See MANUAL_TESTING_GUIDE.md for detailed testing steps

## Related Issues
Closes #XX (if applicable)

## Types of Changes
- [x] New feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [x] Documentation (new or improved documentation)
```

**Step 10: Submit PR**
Click "Create pull request"

---

### Phase 5: Configure Branch Protection Rules

**IMPORTANT:** Set up 2-approval requirement BEFORE any merges

**Step 11: Go to Repository Settings**
1. Go to: https://github.com/sadhu1437/SkillBloom/settings
2. Click "Branches" in left sidebar
3. Under "Branch protection rules", click "Add rule"

**Step 12: Configure Protection Rule**

**Field 1: Pattern name**
```
main
```
(or whatever your main production branch is called)

**Field 2: Protect matching branches**
Check all applicable options:
- ✅ Require a pull request before merging
  - ✅ Require approvals: **2**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (if applicable)
- ✅ Require status checks to pass before merging
- ✅ Include administrators (enforces rules even for admins)

Click "Create" or "Save changes"

---

### Phase 6: Request Reviews on PR

**Step 13: Add Reviewers to Your PR**
1. Go to your PR: https://github.com/sadhu1437/SkillBloom/pull/XX
2. On right side, click "Reviewers"
3. Select 2 people to review:
   - Reviewer 1 (colleague/team member)
   - Reviewer 2 (another team member or tech lead)

**Step 14: Wait for Reviews**

Reviewers will see:
- ✅ PR title and description
- ✅ All changed files with diffs
- ✅ CI/CD checks (if configured)

Reviewers can:
- Comment on code
- Request changes
- Approve the PR

---

### Phase 7: Reviews & Approvals

**Step 15: Review Process**

Each reviewer will:
1. Click "Review changes" button
2. Add comments if needed
3. Select action:
   - **Approve** - "Looks good, ready to merge"
   - **Request changes** - "Need fixes before merge"
   - **Comment** - "Just feedback, doesn't block merge"

**After First Approval:**
- PR shows: "1 of 2 approvals"
- Second reviewer can still make changes

**After Second Approval:**
- PR shows: "Approved ✅"
- Merge button becomes active
- Only then can you merge

---

### Phase 8: Address Review Feedback (if needed)

**Step 16: If Changes Requested**

1. Make fixes locally
   ```powershell
   # Make your changes in the code
   git add .
   git commit -m "fix: Address review feedback

   - Fixed X issue mentioned in review
   - Improved Y based on feedback
   "
   ```

2. Push updated commit
   ```powershell
   git push origin feature/adsense-integration-and-monetization
   ```

3. PR automatically updates with new commits
4. Reviewers get notified to re-review

---

### Phase 9: Merge to Main Branch

**Step 17: Merge PR** (after 2 approvals received)

1. Go to your PR
2. Verify:
   - ✅ Status checks passed
   - ✅ 2 approvals received
   - ✅ No conflicts
   - ✅ Branch is up to date

3. Click "Merge pull request" button
4. Select merge strategy:
   - **Create a merge commit** (recommended - keeps history)
   - **Squash and merge** (clean single commit)
   - **Rebase and merge** (linear history)

5. Confirm merge
6. Delete branch (optional but recommended)

**Expected Output:**
```
✓ Pull request successfully merged and closed
```

---

### Phase 10: Cleanup

**Step 18: Clean Up Local Branch**

```powershell
# Switch to main branch
git checkout main

# Update main with merged changes
git pull origin main

# Delete local feature branch
git branch -d feature/adsense-integration-and-monetization

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/adsense-integration-and-monetization
```

**Step 19: Verify Merge**

```powershell
git log --oneline -5
```

You should see your merge commit at the top

---

## 🔒 GitHub Protection Rules Summary

After Step 12, your `main` branch will be protected with:

| Setting | Value |
|---------|-------|
| **Require PR** | Yes |
| **Required Approvals** | 2 |
| **Dismiss Stale Reviews** | Yes |
| **Require Status Checks** | Yes (if CI configured) |
| **Admin Enforcement** | Yes |

This ensures:
- ✅ No direct pushes to main
- ✅ All changes go through PR
- ✅ 2 people must review and approve
- ✅ No one can bypass protection rules
- ✅ Automatic deployment can wait for approved PRs

---

## 📊 Complete Workflow Summary

```
┌─────────────────────────────────────────────┐
│ 1. Create Feature Branch                    │
│    feature/adsense-integration              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. Make Changes & Commit                    │
│    git add . && git commit -m "..."          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. Push to GitHub                           │
│    git push -u origin feature/...            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. Create Pull Request                      │
│    - Base: main                              │
│    - Compare: feature/...                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 5. Add Reviewers (2 people)                │
│    - Reviewer 1 assigned                     │
│    - Reviewer 2 assigned                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 6. Review Process                          │
│    - Reviewer 1: Approve ✅                 │
│    - Reviewer 2: Approve ✅                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 7. Merge to Main                           │
│    All checks passed → Merge button active  │
│    PR merged and closed ✅                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 8. Cleanup                                  │
│    - Delete feature branch                  │
│    - Pull latest main                       │
│    - Complete! 🎉                           │
└─────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

Before you start:
- [ ] All changes committed locally
- [ ] No uncommitted changes: `git status` shows "working tree clean"
- [ ] You have GitHub account access to sadhu1437/SkillBloom

During PR creation:
- [ ] PR title is clear and descriptive
- [ ] PR description explains what changed and why
- [ ] All files shown in PR diff are intentional
- [ ] No sensitive files (passwords, keys) in PR

After creating PR:
- [ ] 2 reviewers assigned
- [ ] CI checks running (if configured)
- [ ] Ready for review

After approvals:
- [ ] 2 approvals received (both green checkmarks)
- [ ] All CI checks passed
- [ ] No merge conflicts
- [ ] Ready to merge

---

## 🆘 Troubleshooting

### Issue: "Branch is behind main"
**Solution:**
```powershell
git fetch origin
git rebase origin/main
git push --force-with-lease origin feature/...
```

### Issue: "Merge conflicts exist"
**Solution:**
1. Pull latest main locally
2. Resolve conflicts in your files
3. Commit and push
4. Conflicts auto-resolve in PR

### Issue: "Merge button is disabled"
**Check:**
- [ ] 2 approvals received? (not 1)
- [ ] CI checks passed?
- [ ] No conflicts?
- [ ] Branch protection rule active?

### Issue: "Can't push to main directly"
**This is correct!** 
- Branch protection preventing direct pushes
- Must use PR workflow
- Need 2 approvals first

---

## 📚 Additional Resources

- GitHub PR Documentation: https://docs.github.com/en/pull-requests
- Branch Protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- Required Reviews: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-required-reviews-for-pull-requests

---

## 🎯 Next Steps

1. **Now:** Follow Steps 1-7 above to create and push PR
2. **Add reviewers:** Step 13 to assign 2 reviewers
3. **Wait:** For approvals from both reviewers
4. **Merge:** Step 17 when ready
5. **Cleanup:** Step 18 to delete feature branch

---

**Status:** Ready to create PR ✅  
**Generated:** September 14, 2026  
**For:** SkillBloom GitHub Push & 2-Approval Review Workflow
