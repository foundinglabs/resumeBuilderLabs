// Brand Icon component for Reactive-Resume templates
import React from 'react';
import { 
  FaGithub, 
  FaLinkedin, 
  FaStackOverflow, 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaGlobe, 
  FaBriefcase, 
  FaAt, 
  FaPhone, 
  FaMapPin, 
  FaLink 
} from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

interface BrandIconProps {
  slug: string;
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ slug, className = "" }) => {
  const slugLower = slug.toLowerCase();
  
  // Use React Icons for specific platforms
  if (slugLower === 'github') {
    return <FaGithub className={className} />;
  }
  
  if (slugLower === 'linkedin') {
    return <FaLinkedin className={className} />;
  }
  
  if (slugLower === 'leetcode') {
    return <SiLeetcode className={className} />;
  }
  
  if (slugLower === 'stackoverflow') {
    return <FaStackOverflow className={className} />;
  }

  if (slugLower === 'twitter') {
    return <FaTwitter className={className} />;
  }

  if (slugLower === 'facebook') {
    return <FaFacebook className={className} />;
  }

  if (slugLower === 'instagram') {
    return <FaInstagram className={className} />;
  }

  if (slugLower === 'youtube') {
    return <FaYoutube className={className} />;
  }

  if (slugLower === 'globe' || slugLower === 'website') {
    return <FaGlobe className={className} />;
  }

  if (slugLower === 'portfolio' || slugLower === 'briefcase') {
    return <FaBriefcase className={className} />;
  }

  if (slugLower === 'email' || slugLower === 'at') {
    return <FaAt className={className} />;
  }

  if (slugLower === 'phone') {
    return <FaPhone className={className} />;
  }

  if (slugLower === 'location' || slugLower === 'map-pin') {
    return <FaMapPin className={className} />;
  }

  if (slugLower === 'link') {
    return <FaLink className={className} />;
  }

  // Fallback to Phosphor icons for other platforms
  const iconMap: Record<string, string> = {
    // Social Media
    snapchat: "ph ph-bold ph-snapchat-logo",
    tiktok: "ph ph-bold ph-tiktok-logo",
    discord: "ph ph-bold ph-discord-logo",
    reddit: "ph ph-bold ph-reddit-logo",
    pinterest: "ph ph-bold ph-pinterest-logo",
    tumblr: "ph ph-bold ph-tumblr-logo",
    
    // Professional Networks
    xing: "ph ph-bold ph-xing-logo",
    viadeo: "ph ph-bold ph-viadeo-logo",
    
    // Development Platforms
    gitlab: "ph ph-bold ph-gitlab-logo",
    bitbucket: "ph ph-bold ph-bitbucket-logo",
    codepen: "ph ph-bold ph-codepen-logo",
    jsfiddle: "ph ph-bold ph-jsfiddle-logo",
    repl: "ph ph-bold ph-replit-logo",
    
    // Content Platforms
    medium: "ph ph-bold ph-medium-logo",
    dev: "ph ph-bold ph-dev-logo",
    hashnode: "ph ph-bold ph-hashnode-logo",
    substack: "ph ph-bold ph-substack-logo",
    
    // Video Platforms
    twitch: "ph ph-bold ph-twitch-logo",
    vimeo: "ph ph-bold ph-vimeo-logo",
    dailymotion: "ph ph-bold ph-dailymotion-logo",
    
    // Other Platforms
    telegram: "ph ph-bold ph-telegram-logo",
    whatsapp: "ph ph-bold ph-whatsapp-logo",
    signal: "ph ph-bold ph-signal-logo",
    slack: "ph ph-bold ph-slack-logo",
    teams: "ph ph-bold ph-teams-logo",
    zoom: "ph ph-bold ph-zoom-logo",
    
    // E-commerce
    shopify: "ph ph-bold ph-shopify-logo",
    etsy: "ph ph-bold ph-etsy-logo",
    
    // Design Platforms
    behance: "ph ph-bold ph-behance-logo",
    dribbble: "ph ph-bold ph-dribbble-logo",
    figma: "ph ph-bold ph-figma-logo",
    sketch: "ph ph-bold ph-sketch-logo",
    canva: "ph ph-bold ph-canva-logo",
    
    // Cloud Platforms
    aws: "ph ph-bold ph-aws-logo",
    azure: "ph ph-bold ph-azure-logo",
    gcp: "ph ph-bold ph-gcp-logo",
    heroku: "ph ph-bold ph-heroku-logo",
    vercel: "ph ph-bold ph-vercel-logo",
    netlify: "ph ph-bold ph-netlify-logo",
    
    // Development Tools
    docker: "ph ph-bold ph-docker-logo",
    kubernetes: "ph ph-bold ph-kubernetes-logo",
    jenkins: "ph ph-bold ph-jenkins-logo",
    travis: "ph ph-bold ph-travis-logo",
    circleci: "ph ph-bold ph-circleci-logo",
    
    // Databases
    mongodb: "ph ph-bold ph-mongodb-logo",
    postgresql: "ph ph-bold ph-postgresql-logo",
    mysql: "ph ph-bold ph-mysql-logo",
    redis: "ph ph-bold ph-redis-logo",
    
    // Frameworks
    react: "ph ph-bold ph-react-logo",
    vue: "ph ph-bold ph-vue-logo",
    angular: "ph ph-bold ph-angular-logo",
    svelte: "ph ph-bold ph-svelte-logo",
    nextjs: "ph ph-bold ph-nextjs-logo",
    nuxt: "ph ph-bold ph-nuxt-logo",
    
    // Languages
    javascript: "ph ph-bold ph-javascript-logo",
    typescript: "ph ph-bold ph-typescript-logo",
    python: "ph ph-bold ph-python-logo",
    java: "ph ph-bold ph-java-logo",
    csharp: "ph ph-bold ph-csharp-logo",
    php: "ph ph-bold ph-php-logo",
    go: "ph ph-bold ph-go-logo",
    rust: "ph ph-bold ph-rust-logo",
    swift: "ph ph-bold ph-swift-logo",
    kotlin: "ph ph-bold ph-kotlin-logo",
    
    // Default fallback
    default: "ph ph-bold ph-link"
  };

  const iconClass = iconMap[slugLower] || iconMap.default;

  return <i className={`${iconClass} ${className}`} />;
};

export default BrandIcon;