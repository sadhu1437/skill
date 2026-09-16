# SkillBloom Comprehensive Testing Checklist

## ✅ Server Status
- Backend: http://127.0.0.1:8000/ (Django Running)
- Frontend: http://localhost:5173/ (Vite Running)

---

## 🧪 Testing Plan

### Phase 1: API & Backend Endpoints
- [ ] GET /api/ - Root API endpoint
- [ ] GET /api/auth/login/ - Authentication endpoint
- [ ] GET /explore/categories/ - Fetch categories
- [ ] GET /explore/manage/ - Admin article management
- [ ] GET /explore/featured/ - Featured articles
- [ ] GET /explore/trending/ - Trending articles
- [ ] GET /core/adsense/ - AdSense settings (PUBLIC)
- [ ] PATCH /core/adsense/ - Update AdSense (STAFF ONLY)
- [ ] POST /explore/manage/ - Create article
- [ ] PATCH /explore/manage/{slug}/ - Update article
- [ ] DELETE /explore/manage/{slug}/ - Delete article

### Phase 2: Frontend Page Load
- [ ] Homepage loads without errors
- [ ] Explore page loads (category list visible)
- [ ] Article detail page loads
- [ ] Admin panel login loads
- [ ] Admin explore CMS loads
- [ ] No console errors on any page

### Phase 3: Authentication Flow
- [ ] Admin login with credentials
- [ ] Session persists
- [ ] Logout clears session
- [ ] Unauthorized access redirected to login

### Phase 4: Article CRUD in Admin Panel
- [ ] Create new article (title, content, category)
- [ ] Article appears in admin list
- [ ] Article appears in Explore page
- [ ] Edit article content
- [ ] Changes reflect immediately
- [ ] Delete article from admin
- [ ] Article removed from Explore page

### Phase 5: AdSense Integration
- [ ] Admin panel loads monetization settings
- [ ] Can enter Publisher ID
- [ ] Can enter Content Slot ID
- [ ] Toggle Enable/Disable works
- [ ] Save AdSense button submits correctly
- [ ] Settings fetch from /core/adsense/
- [ ] Saved settings appear in admin on reload
- [ ] AdSlot components render on Explore page
- [ ] AdSlot components render on Article detail page

### Phase 6: Content Sync (Cross-Tab)
- [ ] Delete article in admin
- [ ] Open Explore in different tab
- [ ] Explore tab auto-refreshes and article disappears
- [ ] localStorage('skillbloom_explore_revision') broadcasts

### Phase 7: Editor Functionality
- [ ] Copy/paste text into editor
- [ ] Text persists while editing
- [ ] Selection-based link insertion (select text → Link button → enter URL)
- [ ] Links apply correctly to selected text
- [ ] Save article with link content
- [ ] Links render in article detail page

### Phase 8: Category Management
- [ ] Create new category
- [ ] Category appears in dropdown
- [ ] Assign category to article
- [ ] Filter articles by category
- [ ] Delete category
- [ ] Articles reassigned appropriately

### Phase 9: Error Handling
- [ ] Network error displays gracefully
- [ ] Validation errors shown in form
- [ ] Authorization errors (403) redirect
- [ ] 404 errors handled
- [ ] Duplicate category name shows error

### Phase 10: Performance & Build
- [ ] Frontend build successful (no errors)
- [ ] Frontend bundle size < 600KB
- [ ] No console errors or warnings
- [ ] No network failures
- [ ] Page load time < 3 seconds

---

## 🔍 Detailed Test Procedures

### Test 1: Backend API Health
```
GET http://127.0.0.1:8000/api/
Expected: JSON with endpoints list
```

### Test 2: Admin Login Flow
```
1. Go to http://localhost:5173/login
2. Username: admin
3. Password: (check .env or Django superuser)
4. Should redirect to admin panel
5. Check localStorage for auth token
```

### Test 3: Create Article with Links
```
1. Go to Explore CMS Admin
2. Click "New Article"
3. Title: "Test Article"
4. Category: Select any
5. Content: Type "Click here" → Select text → Click Link button → Enter URL → Apply
6. Save Article
7. Verify article appears in Explore page
8. Verify link is clickable and opens in new tab
```

### Test 4: AdSense Settings Persistence
```
1. Go to Explore CMS Admin → Monetization section
2. Enable: ✓
3. Publisher ID: ca-pub-TEST123456
4. Content Slot ID: 1234567890
5. Click "Save AdSense"
6. Should show success message
7. Reload page
8. Values should still be there
9. Visit Explore page
10. AdSlot should render (or show ad sandbox if testing)
11. Visit article detail page
12. AdSlot should render there too
```

### Test 5: Article Deletion Sync
```
1. Open Explore page in Tab A
2. Open Admin panel in Tab B
3. In Tab B: Create article "Sync Test"
4. In Tab A: Article should appear immediately
5. In Tab B: Delete "Sync Test" article
6. In Tab A: Article should disappear automatically (localStorage event listener)
7. Reload Tab A manually
8. Article should still be gone
```

### Test 6: Category Management
```
1. Go to Categories section
2. Create: "TestCat"
3. Create article with "TestCat"
4. In Explore page, filter by "TestCat"
5. Should show article
6. Delete "TestCat"
7. Article should still exist but category field empty
8. Category dropdown should not show "TestCat"
```

---

## Status Tracking

**Backend Services:**
- [ ] Django running on port 8000
- [ ] Database connections working
- [ ] No startup errors

**Frontend Services:**
- [ ] Vite dev server running on port 5173
- [ ] Hot reload working
- [ ] No build errors

**Integration:**
- [ ] Frontend can reach backend API
- [ ] CORS configured correctly
- [ ] Authentication tokens working

---

## Notes for Testing
1. Keep browser DevTools console open (F12) to catch errors
2. Check Network tab to see API calls
3. After each change, refresh or use browser back/forward
4. Test on latest Chrome/Firefox
5. Test on mobile viewport (375px width) for responsive design

---

Generated: 2026-09-14
Status: Ready for Full System Testing
