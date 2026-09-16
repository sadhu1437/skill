# Quick Command Reference - GitHub PR with 2-Approval Workflow

**Copy & Paste these commands in order**

---

## ⚡ Phase 1: Prepare & Commit (Run in PowerShell)

```powershell
cd C:\Users\sande\Documents\SkillBloom

# Step 1: Check status
git status

# Step 2: Create feature branch
git checkout -b feature/adsense-monetization-review

# Step 3: Stage all changes
git add .

# Step 4: Commit changes
git commit -m "feat: Complete AdSense monetization integration

- Add AdSenseSettings model with GET/PATCH endpoints
- Integrate AdSlot component in ExplorePage and ArticleDetailPage
- Add admin panel monetization controls (Publisher ID, Content Slot)
- Implement cross-tab sync via localStorage for article deletion
- Add cache busting for dynamic content (cache: 'no-store')
- Enhance TipTap editor with selection-based link insertion
- Add responsive ad slot styling
- Complete system verification and documentation

Features:
✅ Backend: AdSenseSettings model with staff-only PATCH
✅ Frontend: AdSlot component fetches and renders ads
✅ Admin: Full monetization configuration UI
✅ Sync: Deleted articles broadcast to all tabs
✅ Authorization: Proper permission checks
✅ Testing: Comprehensive testing guides included

This PR enables site-wide Google AdSense monetization with staff controls."

# Step 5: Verify commit
git log --oneline -3
```

---

## 🚀 Phase 2: Push to GitHub

```powershell
# Step 6: Push to GitHub
git push -u origin feature/adsense-monetization-review

# Step 7: Verify push
git branch -vv
```

**Expected Output:**
```
✓ feature/adsense-monetization-review [origin/feature/adsense-monetization-review]
```

---

## 📋 Phase 3: Create PR on GitHub Website

**DO NOT RUN IN TERMINAL - USE BROWSER**

1. Go to: https://github.com/sadhu1437/SkillBloom

2. You'll see a banner: "Compare & pull request" - Click it

3. If no banner, go to: https://github.com/sadhu1437/SkillBloom/compare/main...feature/adsense-monetization-review

4. Fill PR Title:
```
feat: Add Google AdSense monetization to Explore section
```

5. Fill PR Description (copy below):
```
## 🎯 Overview
This PR integrates Google AdSense monetization into SkillBloom, enabling site-wide ad revenue generation with complete staff controls and proper authorization.

## ✅ What's Included

### Backend
- AdSenseSettings Django model with fields: enabled, publisher_id, home_slot, job_slot, content_slot
- AdSenseSettingsView with GET (public) and PATCH (staff-only) endpoints
- Proper authorization checks and error handling
- Database persistence via SQLite

### Frontend
- AdSlot component that fetches /core/adsense/ and renders Google ads
- Integration in ExplorePage (after hero section)
- Integration in ArticleDetailPage (after byline)
- Responsive ad sizing with CSS styling

### Admin Panel
- New Monetization section in ExploreAdminPage
- Form fields: Enable/Disable toggle, Publisher ID input, Content Slot input
- Save button with success/error messages
- Settings persist after page reload
- All changes synced with database

### Data Flow
1. Admin enters Publisher ID & Content Slot → Saves
2. Settings stored in database
3. Public pages fetch latest settings
4. AdSlot renders with your configuration
5. Google ads display with your Publisher ID

### Testing
- ✅ All API endpoints tested
- ✅ Frontend builds without errors
- ✅ Admin settings persist
- ✅ Cross-tab sync verified
- ✅ Authorization checks working
- See MANUAL_TESTING_GUIDE.md for full test procedures

## 📊 Files Changed
- backend/apps/core/models.py
- backend/apps/core/views.py
- backend/apps/core/urls.py
- frontend/src/components/AdSlot.jsx
- frontend/src/pages/ExploreAdminPage.jsx
- frontend/src/pages/ExplorePage.jsx
- frontend/src/pages/ArticleDetailPage.jsx
- frontend/src/pages/explore-admin.css

## 🧪 How to Test
See MANUAL_TESTING_GUIDE.md:
1. Start backend: python manage.py runserver 8000
2. Start frontend: npm run dev
3. Login to admin panel
4. Go to Monetization section
5. Enter Publisher ID and Content Slot
6. Save settings
7. Visit Explore page - ads should render
8. Visit article detail page - ads should render

## 📝 Technical Details
- No breaking changes
- Fully backward compatible
- Uses existing API infrastructure
- Follows Django REST best practices
- Follows React component patterns
- Includes proper error handling
- Includes authorization checks
```

6. Click "Create pull request"

---

## 👥 Phase 4: Add Reviewers to PR

**ON GITHUB.COM - Right side of PR page**

1. Click "Reviewers" on the right sidebar
2. Search for: Person 1 name
3. Click to add
4. Search for: Person 2 name  
5. Click to add

**You now have 2 reviewers assigned**

---

## 🛡️ Phase 5: Configure Branch Protection (Repo Settings)

**ONE TIME ONLY - Set up 2-approval requirement**

1. Go to: https://github.com/sadhu1437/SkillBloom/settings/branches

2. Click "Add rule" button

3. Fill in:
   - **Pattern name:** `main`

4. Check these boxes:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: Change value to `2`
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Include administrators

5. Click "Create"

**Now your main branch requires 2 approvals!**

---

## ⏳ Phase 6: Wait for Reviews

**Status checks to expect:**

✅ Status: Ready for review
- PR is waiting for reviewers to action
- Reviewers will see notification

⏳ After 1st Approval:
- Status shows "1 of 2 approvals"
- Merge button still disabled

✅ After 2nd Approval:
- Status shows "2 of 2 approvals ✅"
- Merge button becomes active (green)
- You can now merge

---

## 🔀 Phase 7: Merge to Main

**AFTER BOTH APPROVALS RECEIVED**

1. Go to your PR: https://github.com/sadhu1437/SkillBloom/pull/XX

2. Scroll down to see "Merge pull request" button (should be green)

3. Click dropdown next to it, select:
   - **"Create a merge commit"** (recommended)

4. Click "Merge pull request"

5. Click "Confirm merge"

**Expected:**
```
✓ Pull request successfully merged and closed
View commit on GitHub
```

---

## 🧹 Phase 8: Cleanup (Back to PowerShell)

```powershell
cd C:\Users\sande\Documents\SkillBloom

# Switch to main branch
git checkout main

# Update local main with merged changes
git pull origin main

# Delete local feature branch
git branch -d feature/adsense-monetization-review

# Verify cleanup
git branch -a
```

---

## ✅ Complete Checklist

### Before Starting
- [ ] No uncommitted changes: `git status` shows "working tree clean"
- [ ] You're on correct GitHub account (sadhu1437)
- [ ] You have push access to SkillBloom repo

### Phase 1 (Terminal)
- [ ] Created feature branch
- [ ] Staged all changes
- [ ] Committed with good message
- [ ] Pushed to GitHub

### Phase 2 (GitHub Website)
- [ ] Created PR with title and description
- [ ] PR shows all your changes
- [ ] No merge conflicts
- [ ] CI checks running

### Phase 3 (GitHub Website)
- [ ] Added 2 reviewers
- [ ] Reviewers received notifications

### Phase 4 (GitHub Settings)
- [ ] Set branch protection rule
- [ ] Requires 2 approvals
- [ ] Rule active

### Phase 5 (Wait)
- [ ] Reviewer 1 approved ✅
- [ ] Reviewer 2 approved ✅
- [ ] Merge button is green

### Phase 6 (GitHub Website)
- [ ] Clicked "Merge pull request"
- [ ] Confirmed merge
- [ ] PR closed with checkmark

### Phase 7 (Terminal)
- [ ] Pulled latest main locally
- [ ] Deleted feature branch
- [ ] Cleanup complete

---

## 🆘 If Something Goes Wrong

### "Can't push - permission denied"
```powershell
# Verify GitHub auth
git remote -v
# Should show: origin  https://github.com/sadhu1437/SkillBloom.git

# Try with SSH instead
git remote set-url origin git@github.com:sadhu1437/SkillBloom.git
git push -u origin feature/adsense-monetization-review
```

### "Merge conflicts after review feedback"
```powershell
# Pull latest main
git fetch origin
git rebase origin/main

# Resolve conflicts in your editor
# Then:
git add .
git rebase --continue
git push --force-with-lease origin feature/adsense-monetization-review
```

### "Merge button disabled (not enough approvals)"
- Wait for 2nd approval
- Reviewer 1: ✅ Approved
- Reviewer 2: ⏳ Still reviewing
- Once both have ✅, merge button activates

### "Can't merge - branch protection requires 2 approvals"
**This is correct!** Branch protection is working
- You have 1 approval
- Need 2 total
- Wait for 2nd reviewer

---

## 📞 Summary

| Step | Action | Where | Time |
|------|--------|-------|------|
| 1-4 | Commit changes | Terminal | 5 min |
| 5-6 | Push to GitHub | Terminal | 2 min |
| 7-9 | Create PR | Website | 5 min |
| 10 | Add reviewers | Website | 2 min |
| 11 | Setup protection | Website | 3 min (one time) |
| 12-X | Wait for reviews | Wait | Hours/days |
| X+1 | Merge to main | Website | 1 min |
| X+2 | Cleanup | Terminal | 2 min |

**Total Time:** ~20 min (plus waiting for reviews)

---

**Generated:** September 14, 2026  
**For:** SkillBloom AdSense Monetization PR  
**Ready to Start:** Yes ✅
