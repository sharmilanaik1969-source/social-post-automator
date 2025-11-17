import React, { useState, useCallback } from 'react';
import UrlInput from './components/UrlInput';
import LoadingSpinner from './components/LoadingSpinner';
import PostCard from './components/PostCard';
import ContentTypeSelector from './components/ContentTypeSelector';
import ViewModeSwitcher from './components/ViewModeSwitcher';
import CalendarView from './components/CalendarView';
import InfoModal from './components/InfoModal';
import PricingModal from './components/PricingModal';
import ContactModal from './components/ContactModal';
import SettingsModal from './components/SettingsModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import { DownloadIcon, GeneticsIcon, CampaignIcon, SparklesIcon } from './components/IconComponents';
import { AboutUsContent, TermsContent, LegalContent } from './components/content/InfoContent';
import AdBanner from './components/AdBanner';
import PricingSection from './components/PricingSection';

import { generateContentPlan, regenerateImage, generateVideo, getVideoOperationStatus } from './services/geminiService';
import { uploadMedia } from './services/mediaService';
import type { SocialPost, ContentType, ViewMode, ModalType } from './types';


const FeatureStep: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-6 bg-gray-800/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl flex-1 min-w-[250px] shadow-lg">
        <div className="mb-4 text-indigo-400">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

const Arrow: React.FC = () => (
    <svg className="w-8 h-8 text-gray-600 self-center rotate-90 lg:rotate-0 my-4 lg:my-0 lg:mx-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);


const BusinessDnaFeature: React.FC = () => {
  return (
    <section className="my-16 px-4">
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6 lg:gap-0">
        <FeatureStep
          icon={<GeneticsIcon className="w-12 h-12" />}
          title="Generate Business DNA"
          description="Enter your website and we'll analyze your brand and business."
        />
        <Arrow />
        <FeatureStep
          icon={<CampaignIcon className="w-12 h-12" />}
          title="Get campaign ideas"
          description="We'll use your Business DNA to create tailored marketing ideas."
        />
        <Arrow />
        <FeatureStep
          icon={<SparklesIcon className="w-12 h-12" />}
          title="Generate creatives"
          description="We'll generate high quality, on brand creatives that are ready to share."
        />
      </div>
    </section>
  );
};

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-700 py-4">
            <button
                className="w-full flex justify-between items-center text-left text-lg font-semibold"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="mt-3 text-gray-400 prose prose-invert max-w-none">{children}</div>}
        </div>
    );
};

const LandingPage: React.FC<{ onLaunch: () => void; onContact: () => void }> = ({ onLaunch, onContact }) => (
    <>
       

        <BusinessDnaFeature />
        <PricingSection onLaunch={onLaunch} onContact={onContact} />

        <section className="my-20 max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <FaqItem question="What kind of content does it generate?">
                <p>It creates a 7-day plan with captions, hashtags, detailed prompts for AI images/videos, and trending music suggestions tailored to your website's content and your chosen format (Standard Posts, Instagram Reels, or YouTube Shorts).</p>
            </FaqItem>
            <FaqItem question="Do I need my own AI API key?">
                <p>For text and standard image generation, no key is needed to get started. For premium features like high-quality images and video generation (which use advanced models), you'll be prompted to use your own Google API key. This gives you control and direct access to cutting-edge AI capabilities.</p>
            </FaqItem>
            <FaqItem question="Can I edit the generated content?">
                <p>Absolutely! You have full control to edit messages, captions, and image prompts before you generate the final assets. Our goal is to give you a powerful starting point, which you can then refine to perfectly match your brand's voice.</p>
            </FaqItem>
            <FaqItem question="What's the difference between the plans?">
                <p>The **Free** plan is ad-supported and has limits on usage, perfect for trying out the tool. **Paid plans** offer unlimited content generation, higher quality media, video creation, no watermarks, and other professional features designed for serious creators and businesses.</p>
            </FaqItem>
        </section>
    </>
);


const Tool: React.FC<{
    url: string;
    setUrl: (url: string) => void;
    posts: SocialPost[];
    isLoading: boolean;
    error: string | null;
    contentType: ContentType;
    setContentType: (contentType: ContentType) => void;
    viewMode: ViewMode;
    setViewMode: (viewMode: ViewMode) => void;
    regeneratingDays: Set<number>;
    linkingDays: Set<number>;
    isDownloading: boolean;
    handleGeneratePlan: () => void;
    handleUpdatePost: (updatedPostData: Omit<SocialPost, 'imageUrl' | 'musicSuggestion'>) => Promise<void>;
    handleGenerateVideo: (day: number, prompt: string) => Promise<void>;
    handleRegenerateImage: (day: number, prompt: string) => Promise<void>;
    handleSchedulePost: (day: number, scheduledAt: string | null) => void;
    handleGeneratePermanentUrl: (day: number) => Promise<void>;
    handleDownloadAllAsCSV: () => Promise<void>;
}> = (props) => {
    const { url, setUrl, posts, isLoading, error, contentType, setContentType, viewMode, setViewMode, regeneratingDays, linkingDays, isDownloading, handleGeneratePlan, handleUpdatePost, handleGenerateVideo, handleRegenerateImage, handleSchedulePost, handleGeneratePermanentUrl, handleDownloadAllAsCSV } = props;
    return (
        <>
                        {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-red-400 bg-red-900/50 border border-red-700 p-3 rounded-lg max-w-2xl mx-auto">{error}</p>}
            
            {posts.length > 0 && !isLoading && (
                <div className="animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                        <ViewModeSwitcher currentView={viewMode} onViewChange={setViewMode} />
                        <button 
                            onClick={handleDownloadAllAsCSV}
                            disabled={isDownloading}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700/80 text-white font-semibold rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-200 text-sm border border-gray-600 disabled:bg-gray-600 disabled:cursor-wait"
                            title="Download all post data as a CSV file"
                        >
                            <DownloadIcon className="h-5 w-5" />
                            <span>{isDownloading ? 'Preparing Download...' : 'Download All (.csv)'}</span>
                        </button>
                    </div>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map(post => (
                                <PostCard 
                                    key={post.day}
                                    post={post}
                                    onUpdatePost={handleUpdatePost}
                                    onGenerateVideo={handleGenerateVideo}
                                    onRegenerateImage={handleRegenerateImage}
                                    onSchedulePost={handleSchedulePost}
                                    onGeneratePermanentUrl={handleGeneratePermanentUrl}
                                    isRegeneratingImage={regeneratingDays.has(post.day)}
                                    isLinking={linkingDays.has(post.day)}
                                    contentType={contentType}
                                />
                            ))}
                        </div>
                    ) : (
                        <CalendarView 
                            posts={posts}
                            onUpdatePost={handleUpdatePost}
                            onGenerateVideo={handleGenerateVideo}
                            onRegenerateImage={handleRegenerateImage}
                            onSchedulePost={handleSchedulePost}
                            onGeneratePermanentUrl={handleGeneratePermanentUrl}
                            regeneratingDays={regeneratingDays}
                            linkingDays={linkingDays}
                            contentType={contentType}
                        />
                    )}
                </div>
            )}
        </>
    );
};


const App: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [contentType, setContentType] = useState<ContentType>('posts');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [regeneratingDays, setRegeneratingDays] = useState<Set<number>>(new Set());
    const [linkingDays, setLinkingDays] = useState<Set<number>>(new Set());
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    
    const [showTool, setShowTool] = useState<boolean>(false);

    const handleGeneratePlan = useCallback(async () => {
        if (!url.trim()) {
            setError('Please enter a valid URL.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPosts([]);

        try {
            const plan = await generateContentPlan(url, contentType);
            const postsWithImages = await Promise.all(
                plan.map(async (post) => {
                    try {
                        const imageUrl = await regenerateImage(post.imageDescription, contentType);
                        return { ...post, imageUrl };
                    } catch (imageError) {
                        console.error(`Failed to generate image for day ${post.day}`, imageError);
                        return { ...post, imageUrl: undefined };
                    }
                })
            );
            setPosts(postsWithImages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [url, contentType]);
    
    const handleRegenerateImage = useCallback(async (day: number, prompt: string) => {
        setRegeneratingDays(prev => new Set(prev).add(day));
        try {
            const imageUrl = await regenerateImage(prompt, contentType);
            setPosts(prevPosts =>
                prevPosts.map(p => (p.day === day ? { ...p, imageUrl, imageUrlPermanent: undefined } : p))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to regenerate image.');
        } finally {
            setRegeneratingDays(prev => {
                const newSet = new Set(prev);
                newSet.delete(day);
                return newSet;
            });
        }
    }, [contentType]);

    const handleUpdatePost = useCallback(async (updatedPostData: Omit<SocialPost, 'imageUrl' | 'musicSuggestion'>) => {
        const { day, message, imageDescription } = updatedPostData;
        
        setPosts(prevPosts => 
            prevPosts.map(p => p.day === day ? {...p, message, imageDescription} : p)
        );
        
        await handleRegenerateImage(day, imageDescription);

    }, [handleRegenerateImage]);

    const handleSchedulePost = useCallback((day: number, scheduledAt: string | null) => {
        setPosts(prevPosts =>
            prevPosts.map(p => (p.day === day ? { ...p, scheduledAt: scheduledAt ?? undefined } : p))
        );
    }, []);
    
    const handleGenerateVideo = useCallback(async (day: number, prompt: string) => {
        const post = posts.find(p => p.day === day);
        if (!post || !post.imageUrl) {
            setError("Source image is not available for video generation.");
            return;
        }

        setPosts(prev => prev.map(p => p.day === day ? { ...p, isVideoGenerating: true, videoUrl: undefined, videoUrlPermanent: undefined } : p));
        
        try {
            let operation = await generateVideo(prompt, post.imageUrl, contentType);
            
            while (operation && !operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await getVideoOperationStatus(operation);
            }

            if (operation?.response) {
                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                const apiKey = process.env.API_KEY;
                if(downloadLink && apiKey) {
                    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
                    const blob = await videoResponse.blob();
                    const videoUrl = URL.createObjectURL(blob);
                    setPosts(prev => prev.map(p => p.day === day ? { ...p, isVideoGenerating: false, videoUrl } : p));
                } else {
                     throw new Error("Video generated, but download link was not found.");
                }
            } else {
                throw new Error("Video generation operation did not complete successfully.");
            }

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during video generation.');
            setPosts(prev => prev.map(p => p.day === day ? { ...p, isVideoGenerating: false } : p));
        }
    }, [posts, contentType]);

    const handleGeneratePermanentUrl = useCallback(async (day: number) => {
        const post = posts.find(p => p.day === day);
        if (!post) return;
    
        setLinkingDays(prev => new Set(prev).add(day));
        try {
            const updates: Partial<SocialPost> = {};
            if (post.imageUrl && !post.imageUrlPermanent) {
                updates.imageUrlPermanent = await uploadMedia(post.imageUrl, 'image/png', post.day);
            }
            if (post.videoUrl && !post.videoUrlPermanent) {
                updates.videoUrlPermanent = await uploadMedia('simulated-video-data', 'video/mp4', post.day);
            }
            
            setPosts(prev => prev.map(p => p.day === day ? { ...p, ...updates } : p));
    
        } catch (err) {
            setError("Failed to generate shareable links. This is a simulated feature.");
        } finally {
            setLinkingDays(prev => {
                const newSet = new Set(prev);
                newSet.delete(day);
                return newSet;
            });
        }
    }, [posts]);

    const handleDownloadAllAsCSV = useCallback(async () => {
        if (posts.length === 0 || isDownloading) return;
    
        setIsDownloading(true);
        setError(null);

        try {
            const postsWithGeneratedLinks = await Promise.all(
                posts.map(async (post) => {
                    const newPost = { ...post };
                    if (post.imageUrl && !post.imageUrlPermanent) {
                        newPost.imageUrlPermanent = await uploadMedia(post.imageUrl, 'image/png', post.day);
                    }
                    if (post.videoUrl && !post.videoUrlPermanent) {
                        newPost.videoUrlPermanent = await uploadMedia('simulated-video-data', 'video/mp4', post.day);
                    }
                    return newPost;
                })
            );

            setPosts(postsWithGeneratedLinks);

            const escapeCSV = (field: any): string => {
                if (field === null || typeof field === 'undefined') {
                    return '';
                }
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
        
                        ];
        
            const rows = postsWithGeneratedLinks.map(p => [
                p.day,
                escapeCSV(p.message),
                p.imageUrlPermanent || 'Not generated',
                p.videoUrlPermanent || 'Not generated',
                escapeCSV(p.musicSuggestion),
                p.scheduledAt ? new Date(p.scheduledAt).toLocaleString() : 'Not scheduled',
                `https://www.facebook.com`,
                `https://www.instagram.com`,
                `https://www.youtube.com/upload`
            ]);
        
           
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `social-media-plan-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            setError("Failed to generate links for CSV download. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    
    }, [posts, isDownloading]);

    const handleAdminLoginSuccess = () => {
        setIsAdmin(true);
        setActiveModal(null);
        setShowAdminPanel(true);
    };

    const handleAdminLogout = () => {
        setIsAdmin(false);
        setShowAdminPanel(false);
    };
    
    const renderModalContent = () => {
        switch(activeModal) {
            case 'about': return <AboutUsContent />;
            case 'terms': return <TermsContent />;
            case 'legal': return <LegalContent />;
            default: return null;
        }
    };

    const getModalTitle = () => {
         switch(activeModal) {
            case 'about': return "About Us";
            case 'terms': return "Terms of Use";
            case 'legal': return "Legal Disclaimer";
            default: return "";
        }
    }

    const toolProps = { url, setUrl, posts, isLoading, error, contentType, setContentType, viewMode, setViewMode, regeneratingDays, linkingDays, isDownloading, handleGeneratePlan, handleUpdatePost, handleGenerateVideo, handleRegenerateImage, handleSchedulePost, handleGeneratePermanentUrl, handleDownloadAllAsCSV };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans antialiased bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3371,transparent)]"></div>
            </div>
            
             <AdBanner slotId="ad-slot-top" />
            
            <main className="container mx-auto px-4 py-8 relative z-10 flex-grow">
               { !showTool ? (
                   <LandingPage onLaunch={() => setShowTool(true)} onContact={() => setActiveModal('contact')} />
               ) : (
                   <Tool {...toolProps} />
               )}
            </main>

            <footer className="text-center p-6 text-gray-500 text-sm border-t border-gray-800 mt-12">
                <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-2 flex-wrap">
                    <button onClick={() => setActiveModal('about')} className="hover:text-indigo-400 transition-colors">About Us</button>
                    <span className="hidden sm:inline">&middot;</span>
                    <button onClick={() => setActiveModal('terms')} className="hover:text-indigo-400 transition-colors">Terms</button>
                    <span className="hidden sm:inline">&middot;</span>
                    <button onClick={() => setActiveModal('legal')} className="hover:text-indigo-400 transition-colors">Legal</button>
                    <span className="hidden sm:inline">&middot;</span>
                    <button onClick={() => setActiveModal('pricing')} className="hover:text-indigo-400 transition-colors">Pricing</button>
                    <span className="hidden sm:inline">&middot;</span>
                    <button onClick={() => setActiveModal('settings')} className="hover:text-indigo-400 transition-colors">Settings</button>
                     <span className="hidden sm:inline">&middot;</span>
                    <button onClick={() => isAdmin ? setShowAdminPanel(true) : setActiveModal('adminLogin')} className="hover:text-indigo-400 transition-colors">Admin Login</button>
                </div>
                <p>&copy; {new Date().getFullYear()} Quest Digital. All rights reserved. v1.5.0</p>
            </footer>
            
            <AdBanner slotId="ad-slot-bottom" />

            {(activeModal === 'about' || activeModal === 'terms' || activeModal === 'legal') && (
                <InfoModal title={getModalTitle()} onClose={() => setActiveModal(null)}>
                    {renderModalContent()}
                </InfoModal>
            )}
            {activeModal === 'pricing' && <PricingModal onClose={() => setActiveModal(null)} onContact={() => setActiveModal('contact')} />}
            {activeModal === 'contact' && <ContactModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'adminLogin' && <AdminLoginModal isOpen={true} onClose={() => setActiveModal(null)} onLoginSuccess={handleAdminLoginSuccess} />}
            {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} onLogout={handleAdminLogout} />}
        </div>
    );
};

export default App;
