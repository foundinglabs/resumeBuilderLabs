import React from 'react';
import { cn } from '@/utils/reactive-resume-utils';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  username: string;
  icon: string;
  visible: boolean;
}

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
}

const getIconClass = (icon: string) => {
  const iconMap: Record<string, string> = {
    github: 'ph ph-bold ph-github',
    linkedin: 'ph ph-bold ph-linkedin-logo',
    leetcode: 'ph ph-bold ph-code',
    portfolio: 'ph ph-bold ph-globe',
    twitter: 'ph ph-bold ph-twitter-logo',
    medium: 'ph ph-bold ph-medium-logo',
    devto: 'ph ph-bold ph-dev-to-logo',
    stackoverflow: 'ph ph-bold ph-stack-overflow-logo',
    youtube: 'ph ph-bold ph-youtube-logo',
    instagram: 'ph ph-bold ph-instagram-logo',
    facebook: 'ph ph-bold ph-facebook-logo',
    website: 'ph ph-bold ph-globe',
    blog: 'ph ph-bold ph-article',
    email: 'ph ph-bold ph-envelope',
    phone: 'ph ph-bold ph-phone',
    location: 'ph ph-bold ph-map-pin',
  };
  
  return iconMap[icon] || 'ph ph-bold ph-link';
};

export const SocialLinks: React.FC<SocialLinksProps> = ({ links, className }) => {
  const visibleLinks = links.filter(link => link.visible && link.url);

  if (visibleLinks.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {visibleLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer noopener nofollow"
          className="flex items-center gap-x-1.5 text-sm hover:text-primary transition-colors"
          title={`${link.platform}: ${link.username || link.url}`}
        >
          <i className={cn(getIconClass(link.icon), "text-primary")} />
          <span className="hidden sm:inline">
            {link.username || link.platform}
          </span>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks; 