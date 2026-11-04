# SkillBloom AdSense Configuration and Placement

## Shared configuration

Both existing admin panels edit the same Django `AdSenseSettings` record through `PATCH /api/core/adsense/`. The public `GET` response contains only ad-serving configuration; changing settings remains staff-only. The Main Admin form manages Home, Jobs, and Interview placements; the Explore Admin form manages Explore placements. Dynamic placement PATCHes merge submitted IDs with the current registry, and deletion uses explicit `remove_placement_ids`, so submitting one panel's subset does not clear the other panel's placements.

Each placement stores only an internal ID, display name, allowlisted public page surface, approved position, numeric slot ID, and supported unit type. Publisher ID and the enable switch are global. No scripts, HTML, or arbitrary route patterns are accepted.

| Page surface | Eligible route | Allowed positions |
|---|---|---|
| Home page | `/` | After page introduction; after page content |
| Jobs listing | `/jobs` | After page introduction; after page content |
| Job article | `/jobs/:slug` | Between qualifying article paragraphs; responsive Display after job content |
| Explore listing | `/explore` | After page introduction; after page content |
| Explore article | `/explore/:slug` | Between qualifying article paragraphs |
| Interview questions index | `/interview` | After page introduction; after page content |
| Interview answer | `/interview/:topicSlug/:questionSlug` | Between qualifying answer paragraphs |

These are supported insertion targets, not arbitrary URL matching. Job article supports In-article only between qualifying paragraphs and Display after the job content. A new placement can be added without source changes when it uses one of these existing page surfaces and positions. Supporting a new route family or a new insertion position requires a code change so the route and safe rendering location can be explicitly allowlisted.

Publisher IDs must be `ca-pub-` followed by 16 digits. Slot IDs must be numeric. The server validates the unit type (`display` or `in_article`), position/surface combination, unique placement IDs, and no duplicate position on the same surface. It caps the registry at 30 placements. The old fixed slot columns are migrated into the placement registry without losing IDs, and the API continues accepting/returning the legacy fixed fields for compatibility.

The async AdSense loader is included once in the shared public HTML head for `ca-pub-8687126461256058`. It supports Auto Ads independently of manual placement configuration. Manual unit initialization does not add another loader; it queues a unit once through the head-loaded `adsbygoogle` script and only when its placement is eligible, enabled, and valid. The configured Publisher ID must match the Publisher ID in the HTML head. If the Publisher ID changes, update the head script as well. Placement renderers are selected from a dedicated allowlisted renderer map; Display emits `data-ad-format="auto"` and `data-full-width-responsive="true"`, while In-article emits `data-ad-layout="in-article"` and `data-ad-format="fluid"`. Adding a future AdSense format requires an explicit validated backend type and a dedicated renderer; it cannot be enabled by entering markup or a script.

Display units use the responsive AdSense markup (`data-ad-format="auto"` and `data-full-width-responsive="true"`). In-article units use `data-ad-layout="in-article"` and `data-ad-format="fluid"`. The implementation does not set fixed ad dimensions or create slot IDs.

## Route and content eligibility

Eligibility is an allowlist in `frontend/src/utils/adEligibility.js`, not a denylist. It maps each page surface to its designated public route and strips query strings/fragments before exact matching. Admin panels (including descendants), admin sign-in, user authentication/account pages, PDFs, informational/legal pages, search/filter result states, unknown routes, and error/empty content cannot render a React manual ad. This route check does not depend on CSS. The shared HTML head loader still loads on every route; exclusions for Auto Ads must be set in the AdSense account, and a separate server-rendered HTML shell is required if the loader request itself must be blocked on private routes.

The Jobs and Explore in-article renderer sanitizes rich HTML/Markdown before calculating placements. The article page must be published (Jobs `is_published`, Explore `status === "published"`, Interview `is_published`) before ad insertion is considered. It inserts at most one unit after a complete paragraph boundary, never inside a heading, paragraph, list, blockquote, link, or interactive element. It requires at least 700 words overall, 350 paragraph words before the placement, 250 paragraph words after it, and at least five substantial paragraphs. Short, empty, unpublished, loading, and error content gets no In-article unit. A configured Job article Display placement appears after each published job's overview content. The interview answer renderer uses the same content and placement safeguards. Stored API/database content is not changed.

The “Advertisements” label is intentionally used to clearly distinguish ads from editorial content. Ads must not be placed next to apply/download/navigation controls or otherwise invite accidental clicks. Do not click live ads for testing.

## Google account setup and Auto Ads exclusions

The React route allowlist prevents manual units in excluded sections, but it cannot control Auto Ads. Because the same `frontend/index.html` shell serves public and client-side routes, its head script is fetched on admin/private routes too; React route checks cannot prevent a static head script from loading. In the AdSense account, add Page Exclusions using the exact routes/prefixes supported by the account UI so Auto Ads do not serve on excluded pages:

- `/admin-panel` and every nested admin route, including `/admin-panel/explore`.
- `/login`, `/register`, and `/account` (include descendants if the account UI supports prefix exclusions).
- `/pdfs` and its descendants.
- Informational/private pages without sufficient original content: `/about`, `/ai-tech`, `/contact`, `/privacy-policy`, and `/disclaimer`.

The script being present does not itself create manual ad units on these routes. If the requirement changes to prevent the AdSense script request itself on admin/private routes, the server must serve a distinct HTML shell without the loader for those routes; a client-side route check cannot provide that guarantee.

Do not exclude `/`, `/jobs`, `/jobs/:slug`, `/explore`, `/explore/:slug`, or the eligible interview routes if you intend to use their configured manual units. Review Auto Ads placements on those pages to avoid excessive density or overlap. If Auto Ads conflict with manually placed units, use the account’s page exclusions for the affected public URL; React will continue to render the configured manual placement. Keep account-wide Auto Ads formats and page exclusions consistent with current Google controls.

The legacy static HTML files under `frontend/public/source-site` were restored unchanged and are outside the React route gate. They may retain their original ad markup; inspect those pages and exclude their path from Auto Ads if they are not eligible or if ads should not appear there. This implementation does not edit those HTML files.

## Validation and release checks

Run the backend tests from `backend` and frontend checks from `frontend`:

```text
python manage.py test apps.core.test_adsense
npm test -- adEligibility.test.js
npm run build
```

In a non-production/test setup, verify:

1. Save a Publisher ID, enable switch, and multiple placements in either admin panel. Confirm the shared placement list appears in the other panel.
2. Add placements only to available public page/position choices; verify invalid slot IDs, types, routes, duplicate positions, and arbitrary HTML/script fields are rejected.
3. Confirm IDs, names, targets, positions, types, and the migrated legacy slot data persist after refresh.
4. Confirm configured units render only at the routes listed above. Empty, loading, error, short, or non-qualifying article content must not create an in-article request.
5. Confirm disabled or unconfigured placements add no manual ad unit. The global library remains in the shared HTML head for Auto Ads. When enabled with a valid configuration, there must be only one AdSense script and each actual manual unit element must be initialized at most once. A successful `adsbygoogle.push({})` only queues/requests initialization; it does not prove Google served an ad or produced an impression.
6. Test at mobile and desktop widths; verify units remain responsive, stay within content width, and do not overlap content, navigation, or interactive controls.
7. Confirm `/admin-panel`, `/admin-panel/explore`, `/login`, `/register`, and `/account` render no manual ad and are excluded from Auto Ads in the AdSense account.

## Policy and approval limits

The placement approach is intended to follow Google's published [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en), [ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en), [Publisher Policies](https://support.google.com/publisherpolicies/answer/10502938?hl=en), [Publisher Restrictions](https://support.google.com/publisherpolicies/answer/10437795?hl=en), and [Auto ads guidance](https://support.google.com/adsense/answer/9261805?hl=en). Re-check the current Google guidance and account UI before deployment.

Technical controls do not establish policy approval. The publisher remains responsible for current account settings, page exclusions, consent and privacy obligations, traffic quality, content originality/value, placement review, and all other Google policies and restrictions. No AdSense approval or continued ad serving is guaranteed.
