// Picture component for Reactive-Resume templates
import React from 'react';
import { useArtboardStore } from '../store/artboard-store';

export const Picture: React.FC = () => {
  const picture = useArtboardStore((state) => state.resume?.basics?.picture);
  const name = useArtboardStore((state) => state.resume?.basics?.name);

  // If picture is hidden, don't render anything
  if (picture?.effects?.hidden) {
    return null;
  }

  // Get first letter of name for fallback avatar
  const getInitial = () => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  // Common styles for both photo and fallback
  const commonStyles = {
    width: `${picture?.size || 120}px`,
    height: `${picture?.size || 120}px`,
    aspectRatio: picture?.aspectRatio || 1,
    borderRadius: picture?.borderRadius ? `${picture.borderRadius}px` : '50%',
    border: picture?.effects?.border ? '2px solid #e5e7eb' : 'none',
  };

  return (
    <div className="flex justify-center mb-4">
      {picture?.url ? (
        <img
          src={picture.url}
          alt="Profile"
          className="object-cover"
          style={{
            ...commonStyles,
            filter: picture.effects?.grayscale ? 'grayscale(100%)' : 'none',
          }}
        />
      ) : (
        <div
          className="bg-slate-200 flex items-center justify-center text-slate-600 font-medium"
          style={{
            ...commonStyles,
            fontSize: `${(picture?.size || 120) * 0.4}px`,
          }}
        >
          {getInitial()}
        </div>
      )}
    </div>
  );
};

export default Picture;