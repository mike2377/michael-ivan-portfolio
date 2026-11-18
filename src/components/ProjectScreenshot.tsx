interface ProjectScreenshotProps {
  src?: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fit?: 'cover' | 'contain';
}

export default function ProjectScreenshot({ src, srcSet, sizes, alt, width, height, className = '', loading = 'lazy', fit = 'cover' }: ProjectScreenshotProps) {
  if (src && alt) {
    return <img src={src} srcSet={srcSet} sizes={sizes} width={width} height={height} alt={alt} loading={loading} decoding="async" className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`} />;
  }

  return <div aria-hidden="true" className={`h-full w-full bg-[linear-gradient(135deg,rgb(17_24_39)_0%,rgb(13_20_35)_100%)] ${className}`} />;
}
