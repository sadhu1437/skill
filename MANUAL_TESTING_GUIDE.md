# Manual Testing & Troubleshooting Guide

## Quick Start: Test Everything in 10 Steps

### Prerequisites
- Backend running on http://127.0.0.1:8000/
- Frontend running on http://localhost:5173/
- Admin credentials ready (username/password)

---

## 🧪 Step-by-Step Testing

### Test 1: Backend API Health (2 minutes)
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste and run:
   
   fetch('http://127.0.0.1:8000/api/')
     .then(r => r.json())
     .then(d => console.log('✅ Backend OK:', d))
     .catch(e => console.log('❌ Backend Error:', e))

Expected Output:
✅ Backend OK: {
  name: "SkillBloom API",
  status: "ok",
  endpoints: {...}
}

If error → Check if Django is running on port 8000
```

---

### Test 2: Frontend Build Verification (1 minute)
```
1. Open http://localhost:5173/
2. Page should load without errors
3. Open DevTools Console (F12)
4. Should show NO red error messages
5. Should see page elements (header, navbar, etc.)

If errors → Check Vite terminal for build issues
```

---

### Test 3: Admin Login (3 minutes)
```
1. Go to http://localhost:5173/login
2. Enter admin username
3. Enter admin password
4. Click Login
5. Should redirect to http://localhost:5173/admin-panel
6. Should see article list

Expected: Admin panel loads with:
- Article list on left
- Category management on right
- AdSense settings at top of sidebar

If fails → Check credentials, verify Django user exists
```

---

### Test 4: Article Creation Flow (5 minutes)
```
1. In Admin Panel, click "New Article"
2. Fill form:
   Title: "Test Article"
   Category: (select any)
   Short Description: "Test description"
   Content: "Type or paste test content"
3. In content editor, select text "Test Article"
4. Click "Link" button
5. Enter URL: "https://example.com"
6. Click "Apply"
7. Selected text should become link
8. Click "Save Article"
9. Success message should appear
10. Article should appear in list

Expected: Article visible in Explore page AND admin list
Test URL: http://localhost:5173/explore
```

---

### Test 5: Article Edit & Save (3 minutes)
```
1. From admin list, click any article
2. Change title to "Updated Title"
3. Change some content
4. Click "Update Article"
5. Success message appears
6. Go to Explore page (http://localhost:5173/explore)
7. Find updated article
8. Click to view detail
9. Verify title and content match

Expected: Changes instantly visible in frontend
```

---

### Test 6: Cross-Tab Sync (Article Deletion) (5 minutes)
```
SETUP:
- Tab A: http://localhost:5173/admin-panel (logged in)
- Tab B: http://localhost:5173/explore (article list)

STEPS:
1. In Tab A, click delete on any article
2. Confirm deletion
3. Article removed from Tab A list
4. **Watch Tab B** - Article should disappear automatically
5. If Tab B doesn't auto-update:
   - Manually refresh Tab B
   - Article should still be gone

Expected: Tab B reflects deletion within 2 seconds (localStorage event)
```

---

### Test 7: Category Management (3 minutes)
```
1. In Admin Panel, go to Categories section
2. Enter "TestCategory"
3. Enter description "Test category for testing"
4. Click "Add Category"
5. Category appears in list
6. Create new article with "TestCategory"
7. Go to Explore page
8. Use category filter dropdown
9. Select "TestCategory"
10. Should show only articles in that category
11. Delete "TestCategory" from admin
12. Category disappears from filter dropdown

Expected: All steps work without errors
```

---

### Test 8: AdSense Settings (5 minutes)
```
1. In Admin Panel, find "Monetization" section
2. Scroll to "AdSense" form
3. Check "Enabled" checkbox
4. Enter Publisher ID: "ca-pub-123456789" (test value)
5. Enter Content Slot: "1234567890" (test value)
6. Click "Save AdSense"
7. Should see "AdSense settings saved." message
8. Reload page (F5)
9. Values should still be there
10. Go to Explore page
11. Should see ad placeholder (or actual ad if real credentials)

Expected: 
- Admin shows saved values after reload
- Explore page shows ad slot
- No JavaScript errors
```

---

### Test 9: Editor Link Insertion (3 minutes)
```
1. Create new article
2. In content editor, type: "Click here to learn more"
3. Select only the word "here"
4. Click "Link" button
5. Cursor should be in URL input
6. Type: "https://github.com"
7. Press Enter (or click Apply)
8. Word "here" should now be a link
9. Save article
10. View article detail page
11. Right-click on "here" link → "Open link in new tab"
12. Should open GitHub

Expected: Link works and opens in new tab
```

---

### Test 10: Comprehensive UI Check (5 minutes)
```
1. Explore Page (http://localhost:5173/explore)
   ✅ Page loads
   ✅ Hero section visible
   ✅ Articles grid visible
   ✅ Category filter works
   ✅ Search bar present
   ✅ No console errors

2. Article Detail Page
   ✅ Article content displays
   ✅ Links are clickable
   ✅ Comments section visible
   ✅ Like/Bookmark buttons work
   ✅ Related articles show
   ✅ Ad slot visible

3. Admin Panel (http://localhost:5173/admin-panel)
   ✅ Article list loads
   ✅ Can edit articles
   ✅ Can delete articles
   ✅ Categories dropdown works
   ✅ AdSense form visible
   ✅ Analytics show data
   ✅ Success messages appear on save
```

---

## 🐛 Troubleshooting Guide

### Issue: Backend Not Responding (404/Connection Refused)

**Symptoms:**
- Frontend shows "Cannot connect to API"
- Network tab shows failed requests to http://127.0.0.1:8000/

**Solutions:**
1. Check if Django is running
   ```powershell
   Get-Process python | Where-Object {$_.ProcessName -match "python"}
   ```

2. Check if port 8000 is in use
   ```powershell
   Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
   ```

3. Start Django manually
   ```powershell
   cd C:\Users\sande\Documents\SkillBloom\backend
   python manage.py runserver 8000
   ```

4. Check terminal for error messages
   - Look for "System check" errors
   - Look for database connection errors

---

### Issue: Frontend Shows Blank Page

**Symptoms:**
- Page loads but shows nothing
- Console shows errors

**Solutions:**
1. Check if Vite is running
   ```powershell
   Get-Process node | Where-Object {$_.ProcessName -match "node"}
   ```

2. Check Vite terminal for build errors
   - Look for red error messages
   - Look for missing dependencies

3. Try rebuilding
   ```powershell
   cd C:\Users\sande\Documents\SkillBloom\frontend
   npm.cmd run build
   ```

4. Clear browser cache (Ctrl+Shift+Delete)

---

### Issue: Admin Login Doesn't Work

**Symptoms:**
- Login button doesn't respond
- Shows "Invalid credentials"
- Redirects to login page after login

**Solutions:**
1. Check if Django user exists
   ```powershell
   cd C:\Users\sande\Documents\SkillBloom\backend
   python manage.py shell
   # In shell:
   from django.contrib.auth.models import User
   User.objects.all()  # See all users
   ```

2. Create admin user if needed
   ```powershell
   python manage.py createsuperuser
   ```

3. Check token in browser DevTools
   - Open Console (F12)
   - Run: `localStorage.getItem('skillbloom_access_token')`
   - Should return a token string (not null)

4. Check backend logs for 401/403 errors
   - Look at Django terminal output
   - Should show authentication errors

---

### Issue: Articles Don't Appear in Explore Page

**Symptoms:**
- Admin shows articles in list
- Explore page shows "No articles"
- Category dropdown works

**Solutions:**
1. Check browser console for API errors
   ```
   Should show successful GET /api/explore/manage/
   Status: 200
   ```

2. Verify articles have status "published"
   ```
   In admin, check article status field
   Should be "published", not "draft"
   ```

3. Clear browser cache and refresh
   - Ctrl+Shift+Delete to open cache clearing dialog
   - Select "All time"
   - Click "Clear data"

4. Check if articles have a featured section assigned
   - Filter by featured
   - Check trending section separately

---

### Issue: AdSense Settings Not Saving

**Symptoms:**
- Click "Save AdSense" but no message appears
- Values disappear on reload
- Console shows error

**Solutions:**
1. Check authentication
   - Must be logged in as staff member
   - Token must be valid
   - DevTools → Application → localStorage → check access_token

2. Check admin status
   ```
   In Django shell:
   User.objects.get(username='admin').is_staff
   # Should return: True
   ```

3. Check PATCH request in Network tab
   - Should show status 200
   - Response should include saved settings
   - If 403: Not authorized (check is_staff)

4. Check backend logs for errors
   - Look for validation errors in Django terminal
   - Look for database errors

---

### Issue: Links Don't Work in Editor

**Symptoms:**
- Select text and click Link button
- Dialog opens
- Click Apply but text doesn't become link
- Or link doesn't open in article

**Solutions:**
1. Ensure text is properly selected
   - Selected text should be highlighted in blue
   - Message should disappear if text IS selected

2. Ensure URL is valid
   - Must start with http:// or https://
   - Cannot be empty

3. Check TipTap editor state
   - DevTools → Console
   - Look for "Link extension" errors

4. Save and refresh
   - Save article
   - Reload detail page
   - Link should work

---

### Issue: Deleted Articles Still Appear in Explore

**Symptoms:**
- Delete article in admin
- Article still shows in Explore page
- Even after refresh

**Solutions:**
1. Force browser cache clear
   - DevTools → Network tab → Check "Disable cache"
   - Refresh page (Ctrl+R)

2. Check if article was actually deleted
   - Reload admin panel
   - Article should not appear in admin list
   - If it does: Delete failed

3. Check database
   ```
   Django shell:
   from apps.articles.models import Article
   Article.objects.filter(title='Test Article')
   # Should return empty queryset
   ```

4. Manual page refresh
   - Sometimes localStorage event doesn't fire
   - Manual F5 refresh should show deletion

---

### Issue: Ad Slot Not Rendering on Pages

**Symptoms:**
- Explore page loads but no ad visible
- ArticleDetail page loads but no ad visible
- No errors in console

**Solutions:**
1. Check if AdSense is enabled
   - Go to admin → AdSense section
   - "Enabled" checkbox should be checked
   - If unchecked: Check it and save

2. Check Publisher ID and Slot ID
   - Both fields should have values
   - Not empty or "test"
   - Valid format: ca-pub-XXXXXXXXX

3. Verify AdSlot component received settings
   - DevTools → Console
   - Run: `fetch('http://127.0.0.1:8000/api/core/adsense/').then(r => r.json()).then(d => console.log(d))`
   - Should show: { enabled: true, publisher_id: "ca-pub-...", content_slot: "..." }

4. Check for Google AdSense script errors
   - DevTools → Network tab
   - Look for requests to pagead2.googlesyndication.com
   - Should show status 200

5. During development/testing
   - Real ads may not show if not production domain
   - Google shows ad placeholder instead
   - This is normal for localhost testing

---

## ✅ Success Criteria

After running all 10 tests, verify:

- ✅ Backend API responds to requests
- ✅ Frontend loads without errors
- ✅ Admin login works
- ✅ Can create articles with links
- ✅ Articles appear in Explore page
- ✅ Editing articles reflects changes
- ✅ Deleting articles auto-syncs across tabs
- ✅ Categories work (filter, create, delete)
- ✅ AdSense settings save and persist
- ✅ All pages load without JavaScript errors
- ✅ Links work in articles
- ✅ Ad components render (placeholder or real ads)

**If ALL pass: System is Production Ready ✅**

---

## 📞 Support

**Common Issues & Quick Fixes:**
1. Can't connect to backend → Django not running
2. Blank page → Vite build error → Check terminal
3. Login fails → Check Django user exists
4. Articles don't appear → Article status not "published"
5. Settings don't save → Check is_staff flag
6. Links don't work → Ensure text selection before linking
7. Deleted articles persist → Clear browser cache

**When stuck:**
1. Check DevTools Console (F12)
2. Check Network tab for API responses
3. Check backend terminal for errors
4. Restart services if needed
5. Clear browser cache completely

---

Generated: September 14, 2026  
For: SkillBloom Complete System Verification
