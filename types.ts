export interface SocialPost {
  day: number;
  message: string;
  imageDescription: string;
  musicSuggestion: string;
  imageUrl?: string;
  isVideoGenerating?: boolean;
  videoUrl?: string;
  scheduledAt?: string;
  imageUrlPermanent?: string;
  videoUrlPermanent?: string;
}

export type ContentType = 'posts' | 'reels' | 'shorts';
export type ViewMode = 'grid' | 'calendar';
export type ModalType = 'about' | 'terms' | 'legal' | 'pricing' | 'contact' | 'settings' | 'adminLogin' | null;