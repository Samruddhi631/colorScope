# Migration TODO — Function ➜ File Map (React + TypeScript)

This document maps each top-level function/DOM behavior in `script.js` to a target TypeScript React file with implementation TODOs, testing guidance, and priority. Use this as the granular migration checklist (one function per target file/component/hook where practical).

---

## Conventions
- `src/` root for React app
- `components/` reusable UI
- `pages/` route pages
- `hooks/` custom hooks
- `services/` external API or Firebase wrappers
- `utils/` pure functions
- `contexts/` React contexts/providers
- Tests: `vitest` + `@testing-library/react`

---

## NAVIGATION / HEADER

### NavigationController (init, caching, updateUser)
- Origin: NavigationController (init, _init)
- Target: `src/contexts/NavContext.tsx`, `src/components/Header/NavBar.tsx`
- Responsibilities: provide dropdown open state, profile info (initial), update user function
- TODO: Implement `NavProvider` exposing `isToolsOpen, toggleTools, currentUser, updateUser`.
- Tests: provider state changes, profile initial rendering, toggle aria attributes.
- Priority: High

### bindNavigationEvents (toolsBtn, ESC, outside click)
- Origin: bindNavigationEvents
- Target: `src/components/Header/ToolsDropdown.tsx` + `useOnClickOutside.ts` hook
- Responsibilities: toggle open state, aria-expanded, ESC handler, outside click
- TODO: Use `useEffect` to add/remove handlers; attach `ref` and `useOnClickOutside(ref, close)`.
- Tests: keyboard (ESC), click outside closes dropdown, aria attribute updates.
- Priority: High

### normalize image srcs + error fallback
- Origin: runtime normalization in dropdown
- Target: `src/components/Header/ToolItem.tsx` (image or inline SVG component)
- Responsibilities: handle src fallback (onError -> show `assets/logo.png`) and logging
- TODO: Use `<img onError={...}>` or prefer SVGR inline SVG import; implement fallback logic.
- Tests: simulate image error event and assert fallback used.
- Priority: Medium

---

## AUTH

### AuthController.bindAuthEvents
- Origin: AuthController.bindAuthEvents
- Target: `src/contexts/AuthContext.tsx` + `src/components/Auth/AuthModal.tsx`
- Responsibilities: modal open/close, profile menu mouse events, signOut click
- TODO: Implement `AuthProvider` that calls Firebase functions; create `AuthModal` with view states.
- Tests: modal open/close, signOut triggers provider signOut, profile menu visibility.
- Priority: High

### openAuthModal / closeAuthModal / view functions
- Origin: openAuthModal, closeAuthModal, showSignUpForm, showSignInForm, showInitialView
- Target: `src/components/Auth/AuthModal.tsx` and its subcomponents (SignInForm, SignUpForm)
- Responsibilities: view switching, animations (scale/opacity), close on backdrop or ESC
- TODO: controlled modal component with animation classes; coverage for `Escape` key.
- Tests: view switching, form reset on close, animation class presence.
- Priority: High

### togglePassword
- Origin: togglePassword
- Target: `src/components/Auth/PasswordToggle.tsx` or inline logic in forms
- Responsibilities: toggle input type and icon
- TODO: Implement controlled input and toggle state using local state; use `react-feather` icons.
- Tests: toggling switches type and icon.
- Priority: Medium

### handleSignUp / handleSignIn / signOut
- Origin: handleSignUp, handleSignIn, signOut
- Target: `src/contexts/AuthContext.tsx` (API functions), SignUpForm/SignInForm call these
- Responsibilities: communicate with Firebase, write users to Firestore, error handling via Toast
- TODO: Move Firebase calls to `src/services/firebase.ts` and use them in AuthContext.
- Tests: mock firebase responses, assert provider state and toast calls.
- Priority: High

### resetForms
- Origin: resetForms
- Target: `src/components/Auth/helpers.ts` or form components (local reset)
- Responsibilities: reset form fields and error UI
- TODO: Use controlled state; on close reset local state.
- Tests: closing modal resets fields.
- Priority: Medium

---

## VALIDATION

### FormValidator
- Origin: FormValidator (validateEmail, validateSignUpForm, validateSignInForm)
- Target: `src/utils/formValidators.ts`
- Responsibilities: validation rules return typed errors
- TODO: Export validators; use them in SignIn/SignUp forms to show inline messages
- Tests: test invalid/valid cases
- Priority: High

---

## NOTIFICATIONS

### NotificationManager.show
- Origin: NotificationManager
- Target: `src/contexts/ToastContext.tsx` + `src/components/ToastContainer.tsx`
- Responsibilities: show toast with type and auto dismiss
- TODO: Implement provider and use `useToast()` hook in pieces of UI
- Tests: toast appears and auto-dismisses
- Priority: High

---

## PALETTE GENERATOR MODULE

All algorithms → `src/utils/colorUtils.ts` (pure functions), controller state → `src/hooks/usePalette.ts`, UI → `src/pages/PaletteGenerator/Page.tsx` + components.

### init / bindPaletteEvents
- Origin: PaletteGenerator.init & bindPaletteEvents
- Target: `src/pages/PaletteGenerator/Page.tsx` + `src/components/Palette/PaletteControls.tsx`
- Responsibilities: attach clicks for undo/redo/controls, keyboard shortcuts, dropdowns, modals
- TODO: Use `useEffect` for global keydown listeners, handlers bound to hooks/state.
- Tests: keyboard handlers, undo/redo enabling
- Priority: High

### loadInitialPalette / generateNewPalette
- Origin: loadInitialPalette, generateNewPalette
- Target: `src/hooks/usePalette.ts` (expose `generateNewPalette(forceHarmony?, forceBaseHue?)`)
- Responsibilities: seed palettes, set generating flag, add to history
- TODO: move random fern to hook; ensure deterministic tests by injecting RNG seed or mocking Math.random.
- Tests: calling `generateNewPalette` produces palette, sets `isGenerating` correctly.
- Priority: High

### Algorithms (hslToHex, hexToHsl, getContrastRatio, getOptimalTextColor, random)
- Origin: many utility functions in PaletteGenerator
- Target: `src/utils/colorUtils.ts`
- Responsibilities: color conversions, contrast calculations
- TODO: Implement and export each function; add unit tests for conversions and edge cases.
- Tests: round-trip hex ↔ hsl, contrast thresholds
- Priority: High

### generateUIDesignPalette / generateBrandIdentityPalette / generateIllustrationPalette / generateAccessibilityPalette
- Origin: corresponding functions
- Target: `src/utils/colorUtils.ts` (named exports for each generator)
- Responsibilities: produce palette object with metadata
- TODO: Move logic to utilities and call from `usePalette`; add deterministic test approach
- Tests: verify output shape and constraints (count, color formats)
- Priority: High

### renderPalette / createColorBox / copyToClipboard
- Origin: renderPalette, createColorBox, copyToClipboard
- Target: `src/components/Palette/PaletteCanvas.tsx`, `src/components/Palette/ColorBox.tsx`, `src/hooks/useClipboard.ts`
- Responsibilities: render grid of clickable ColorBox; copy action; notification on copy
- TODO: `ColorBox` is a pure component, onClick triggers `useClipboard.copy()`; apply responsive classes.
- Tests: clicking copies color, Notification called, ColorBox styling based on props
- Priority: High

### updatePaletteInfo / analyzePalette / getHarmonyScore
- Origin: respective functions
- Target: `src/hooks/usePalette.ts` (or `src/utils/analysisUtils.ts`)
- Responsibilities: compute analytics and update UI
- TODO: Export analysis functions from utils; call from hook to populate UI fields
- Tests: harmonic score logic, average contrast
- Priority: Medium

### History: addToHistory, undo, redo, saveToLocalStorage
- Origin: addToHistory, undo, redo, saveToLocalStorage
- Target: `src/hooks/usePalette.ts` (internal history state + localStorage persistence via `useLocalStorage` hook)
- Responsibilities: maintain stack of palettes, persist
- TODO: Implement as a hook with bounded history. Add `save` & `load` functions.
- Tests: undo/redo boundaries, localStorage persistence
- Priority: High

### Export functions (showExportModal, exportPalette, generateCSSExport, generateJSONExport, generateAdobeExport, generateURLExport, downloadFile)
- Origin: Export and download functions
- Target: `src/components/Palette/ExportModal.tsx`, `src/utils/exportUtils.ts`
- Responsibilities: prepare file content and trigger download or clipboard copy
- TODO: Use `downloadFile` util that uses Blob; URL export should use router or shareable route.
- Tests: verify generated contents and trigger of download (mock anchor click), Clipboard write
- Priority: Medium

### Share functionality (showShareModal, shareCurrentPalette, fallbackShare, shareToTwitter, shareCopyColors, shareCopyLink)
- Origin: share functions
- Target: `src/components/Palette/ShareModal.tsx` + `useShare` helper
- Responsibilities: Web Share API usage & fallback, build share text
- TODO: Respect native share availability and fallback to clipboard; add tests for fallback path.
- Priority: Medium

### UI Updates (updateUI) & savePalette
- Origin: updateUI, savePalette
- Target: `usePalette` for state and `PaletteControls` for UI
- Responsibilities: disabling undo/redo buttons, saving to localStorage
- TODO: reflect `canUndo`/`canRedo` in props; save function uses `savedPalettesService`
- Tests: button disabling behavior, saved item inserted into localStorage
- Priority: Medium

---

## PALETTE EXPLORER

### init / cacheElements / bindEvents
- Origin: PaletteExplorer.init
- Target: `src/pages/ExplorePalette/Page.tsx` + `usePaletteExplorer` hook
- Responsibilities: infinite scroll, search input debounce, dropdown behavior
- TODO: Use IntersectionObserver, debounced input hook, and modular fetch service
- Tests: search debounce updates queries and triggers fetch
- Priority: Medium

### fetchPalette
- Origin: fetchPalette
- Target: `src/services/colorApi.ts` with `fetchPalette(seed)`
- Responsibilities: call external color API and normalize response
- TODO: Wrap in try/catch and return normalized palette structure
- Tests: mock fetch and assert mapping
- Priority: Medium

### renderPalette / createColorElement / createLikeSection
- Origin: rendering functions
- Target: `src/components/Explore/PaletteCard.tsx` + `PaletteGrid.tsx`
- Responsibilities: render card UI, copy on click, like button toggle
- TODO: Convert DOM creation to JSX components
- Tests: card render, like toggle, copy action
- Priority: Medium

---

## IMAGE PALETTE GENERATOR

### rgbToHex / loadImageToCanvas / extractColorsFromImage
- Origin: ImagePaletteGenerator utilities and image processing
- Target: `src/hooks/useImagePalette.ts` and `src/utils/imageUtils.ts`
- Responsibilities: canvas image sampling and color clustering
- TODO: Keep performance considerations and allow unit tests with synthetic canvas
- Tests: feed mock canvas ImageData and assert extracted colors
- Priority: High

### generateRandomPalette / renderPalette / getPickerPosition / renderPickers
- Origin: rendering & generation functions
- Target: `src/components/ImagePicker/PreviewCanvas.tsx`, `PickerMarker.tsx`
- Responsibilities: render draggable pickers, palette list
- TODO: Use refs for canvas and transform pickers with inline styles
- Tests: rendering markers, position calculations
- Priority: High

### handleMouseMove / handleMouseUp / sampleColorAtPosition / handleImageLoad / handleFileUpload
- Origin: event handlers
- Target: `useImagePalette` hook (supports pointer events), File input handled in component
- Responsibilities: pointer capture behavior, file reading, image load
- TODO: Use `pointerdown`/`pointermove`/`pointerup` or mouse equivalents; add throttling if needed
- Tests: simulate drag events, file read flow (FileReader mocking)
- Priority: High

---

## CONTRAST CHECKER

### hexToRgb / luminance / contrast / setStars / updateContrast / syncInput
- Origin: ContrastChecker module
- Target: `src/hooks/useContrast.ts` + `src/pages/ContrastChecker/Page.tsx` + small components `StarRating.tsx`
- Responsibilities: compute contrast, update result UI and stars, sync color inputs
- TODO: Controlled inputs, update on change and reflect preview panel
- Tests: formula correctness, UI labels (Excellent/Fail), star counts
- Priority: Medium

---

## GRADIENT GENERATOR

### updateGradient / handleCopyCss / randomGradient / init
- Origin: GradientGenerator
- Target: `src/pages/GradientGenerator/Page.tsx` + `src/hooks/useGradient.ts`
- Responsibilities: compute CSS gradient string, update preview, copy CSS
- TODO: Use computed style inline; test random generation ranges and copy
- Tests: gradient CSS string format and copy-to-clipboard
- Priority: Medium

---

## APP INITIALIZATION

### DOMContentLoaded and auth.onAuthStateChanged
- Origin: bottom of `script.js` (DOMContentLoaded init + auth.onAuthStateChanged)
- Target: `src/main.tsx`, `src/contexts/AuthContext.tsx` (effect to fetch Firestore user doc)
- Responsibilities: initialize providers, respond to auth state changes
- TODO: Use `useEffect` in `AuthProvider` to call `onAuthStateChanged` and fetch profile doc
- Tests: mock auth state change and assert `AuthContext` value updated
- Priority: High

---

## Firebase service
- New file: `src/services/firebase.ts`
- Responsibilities: configure Firebase from env, export `auth`, `db` and helpers
- Tests: use a mock adapter for unit tests
- Priority: High

---

## Utilities & hooks to create (priority order)
1. `useLocalStorage` (High)
2. `useClipboard` (High)
3. `useOnClickOutside` (High)
4. `useDebounce` (Medium)
5. `useKeybind` (Medium)
6. `useIntersectionObserver` (Medium)

---

## Test strategy
- Unit tests for `utils/*` and hooks.
- Component tests for interactive elements (modals, dropdowns, color boxes).
- Integration tests for page flows (palette generate, save, export) using RTL.

---

## How to use this file
- Use it as the canonical guide when creating files in `migrate/react-ts` branch.
- Add `// TODO (migrate):` comments in each new file referencing the origin function name and this document line.

---

If you want, I can now scaffold the initial TypeScript + Vite project and add this file to a new branch `migrate/react-ts` with TODO stubs for each target file.
