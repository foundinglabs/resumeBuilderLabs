import { cn, isUrl } from '../utils/reactive-resume-utils';
import { useArtboardStore } from '../store/artboard-store';

type PictureProps = {
  className?: string;
};

export const Picture = ({ className }: PictureProps) => {
  const picture = useArtboardStore((state: any) => state.resume?.basics?.picture);
  const fontSize = useArtboardStore((state: any) => state.resume?.metadata?.typography?.font?.size);

  if (!picture?.url || !isUrl(picture.url) || picture.effects?.hidden) return null;

  return (
    <img
      src={picture.url}
      alt="Profile"
      className={cn(
        "relative z-20 object-cover",
        picture.effects?.border && "border-primary",
        picture.effects?.grayscale && "grayscale",
        className,
      )}
      style={{
        maxWidth: `${picture.size || 100}px`,
        aspectRatio: `${picture.aspectRatio || 1}`,
        borderRadius: `${picture.borderRadius || 0}px`,
        borderWidth: `${picture.effects?.border ? (fontSize || 16) / 3 : 0}px`,
      }}
    />
  );
};