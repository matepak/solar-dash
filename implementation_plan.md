# Aurora Image Viewer Implementation

## Summary

The user requested a way to view images in `AuroraImages.tsx` larger. I found an existing `AuroraImageViewer.tsx` component that was unused. I integrated it into the `AuroraImages` page, enabling users to click on an image to view it in a full-screen modal.

## Changes

### 1. `src/hooks/useAuroraImages.tsx`

- **Exported `AuroraImage` interface**: This allows the type to be used in other components, improving type safety.

### 2. `src/pages/AuroraImages.tsx`

- **Imported `AuroraImageViewer`**: Uncommented the import and ensured it points to the correct path.
- **Added `selectedImage` state**: Used `useState` to track which image is currently being viewed.
- **Implemented generic `open` handler**: Added `handleImageClick` to set the selected image.
- **Implemented generic `close` handler**: Added `handleCloseViewer` to clear the selected image.
- **Updated Rendering**:
  - Added an `onClick` handler to the `CardActionArea` to trigger the viewer.
  - Rendered `AuroraImageViewer` conditionally based on `selectedImage`.

## Next Steps

- Verify the build passes.
- Test the functionality in the browser (if possible).
