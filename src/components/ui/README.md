# ArmoraCPO UI Components Library

**Status:** Production Ready ✅
**Components:** 18 total (17 components + 1 index)
**Tests:** 42 passing tests across 5 test suites
**TypeScript:** Fully typed with strict mode

## Quick Start

```tsx
import { Button, Card, StatusBadge, Modal, FormInput } from '@/components/ui';

function Dashboard() {
  return (
    <Card variant="elevated">
      <StatusBadge status="operational" />
      <FormInput label="Name" required />
      <Button variant="primary" size="lg">
        Accept Assignment
      </Button>
    </Card>
  );
}
```

## Component Categories

### 🎨 Layout
- **Card** - Flexible container with 5 variants (default, elevated, interactive, navy, gold)

### 🔘 Buttons
- **Button** - Primary action button with loading states and icons
- **IconButton** - Circular icon-only button with tooltip

### 🏷️ Status & Badges
- **StatusBadge** - CPO operational status (operational, busy, offline)
- **VerifiedBadge** - Gold verification checkmark
- **Badge** - Generic label badges (7 variants)

### ⏳ Loading States
- **LoadingSpinner** - Circular spinner (3 sizes, 3 colors)
- **Skeleton** - Loading placeholders (5 variants)
- **ProgressBar** - Horizontal progress with percentage

### 📭 Empty States
- **EmptyState** - No data state with icon, title, description, CTA

### 🪟 Overlays
- **Modal** - Full-featured dialog with backdrop blur
- **Toast** - Auto-dismiss notifications (4 types)

### 🔄 Navigation
- **Tabs** - Tabbed interface with animated indicator

### 📝 Forms
- **FormInput** - Text input with label and validation
- **FormSelect** - Custom dropdown with search
- **FormTextarea** - Multi-line input with auto-resize
- **FormFileUpload** - Drag-and-drop file upload

## Design Tokens

All components use CSS variables from `src/styles/global.css`:

```css
/* Brand Colors */
--armora-navy: #0A1F44;
--armora-gold: #D4AF37;

/* Status Colors */
--armora-status-operational: #10B981;
--armora-status-busy: #EF4444;
--armora-status-standdown: #6B7280;

/* Spacing (8px scale) */
--armora-space-xs: 0.25rem;
--armora-space-sm: 0.5rem;
--armora-space-md: 1rem;
--armora-space-lg: 1.5rem;

/* Typography */
--armora-font-display: 'Montserrat';
--armora-font-body: 'Inter';
```

## Accessibility

✅ ARIA attributes on all interactive components
✅ Keyboard navigation (Tab, Enter, Space, Escape)
✅ Focus-visible indicators
✅ Screen reader support
✅ 44px minimum touch targets

## Testing

```bash
# Run all UI component tests
npm test -- --testPathPattern='components/ui'

# Run specific test file
npm test -- Button.test.tsx

# Run with coverage
npm test -- --testPathPattern='components/ui' --coverage
```

**Test Results:** All 42 tests passing ✅

## File Structure

```
src/components/ui/
├── Badge.tsx + Badge.css
├── Button.tsx + Button.css
├── Card.tsx + Card.css
├── EmptyState.tsx + EmptyState.css
├── FormFileUpload.tsx + FormFileUpload.css
├── FormInput.tsx + FormInput.css
├── FormSelect.tsx + FormSelect.css
├── FormTextarea.tsx + FormTextarea.css
├── IconButton.tsx + IconButton.css
├── LoadingSpinner.tsx + LoadingSpinner.css
├── Modal.tsx + Modal.css
├── ProgressBar.tsx + ProgressBar.css
├── Skeleton.tsx + Skeleton.css
├── StatusBadge.tsx + StatusBadge.css
├── Tabs.tsx + Tabs.css
├── Toast.tsx + Toast.css
├── VerifiedBadge.tsx + VerifiedBadge.css
├── index.ts (barrel export)
└── __tests__/ (5 test files)
```

## Usage Examples

### Dashboard Stats Card
```tsx
<Card variant="elevated">
  <h3>Active Assignments</h3>
  <p className="text-3xl font-bold">12</p>
  <StatusBadge status="operational" />
</Card>
```

### Assignment Accept Button
```tsx
<Button
  variant="primary"
  size="lg"
  loading={isAccepting}
  onClick={handleAccept}
>
  Accept Assignment
</Button>
```

### Profile Form
```tsx
<FormInput
  label="Full Name"
  required
  error={errors.name?.message}
  {...register('name')}
/>

<FormSelect
  label="Specialization"
  options={specializationOptions}
  value={specialization}
  onChange={setSpecialization}
  searchable
/>

<FormTextarea
  label="Bio"
  maxLength={500}
  showCharCount
  autoResize
/>
```

### Empty State
```tsx
<EmptyState
  icon={FaBriefcase}
  title="No Active Assignments"
  description="Check the Jobs tab for available assignments."
  action="Browse Jobs"
  onAction={() => navigate('/jobs')}
/>
```

### Confirmation Modal
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="ghost" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Success Toast
```tsx
<Toast
  type="success"
  message="Assignment accepted successfully"
  isVisible={showToast}
  onClose={() => setShowToast(false)}
/>
```

## Browser Support

- Chrome/Edge (latest)
- Safari (iOS 14+, macOS)
- Firefox (latest)
- Chrome Android (latest)

## Dependencies

- `framer-motion` - Animations
- `react-icons` - Icon library
- `react-dropzone` - File upload

## Notes

- All components use BEM-like CSS naming: `.armora-component__element--modifier`
- Individual CSS files for tree-shaking optimization
- Ref forwarding on form components for react-hook-form compatibility
- Mobile-first responsive design
- PWA compatible

## Documentation

See `/workspaces/armoracpo/UI_COMPONENTS_LIBRARY.md` for complete documentation.

---

**Created:** 2025-10-02
**Agent:** 3 - UI Components Library Engineer
**Status:** Production Ready ✅
