import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, X, RotateCcw, Square, Circle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useArtboardStore } from '@/store/artboard-store';
import { useTheme } from '@/hooks/useTheme';

interface PhotoUploadProps {
  className?: string;
  userName?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ className, userName = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  
  const resume = useArtboardStore((state) => state.resume);
  const setResume = useArtboardStore((state) => state.setResume);
  
  const picture = resume?.basics?.picture || {
    url: '',
    size: 120,
    aspectRatio: 1,
    borderRadius: 50,
    effects: {
      hidden: false,
      border: false,
      grayscale: false,
    }
  };

  // Get first letter of name for fallback avatar
  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return resume?.basics?.name?.charAt(0)?.toUpperCase() || 'U';
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Update the resume picture data
        const updatedResume = {
          ...resume,
          basics: {
            ...resume?.basics,
            picture: {
              ...picture,
              url: dataUrl,
            }
          }
        };
        
        setResume(updatedResume);
        
        toast({
          title: "Photo uploaded successfully",
          description: "Your profile photo has been added to your resume",
        });
        
        setIsUploading(false);
        setIsExpanded(true); // Expand to show settings
      };
      
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to process the image file",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your photo",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removePhoto = () => {
    const updatedResume = {
      ...resume,
      basics: {
        ...resume?.basics,
        picture: {
          ...picture,
          url: '',
          effects: {
            ...picture.effects,
            hidden: true, // Hide the photo completely
          }
        }
      }
    };
    
    setResume(updatedResume);
    setIsExpanded(false);
    
    toast({
      title: "Photo removed",
      description: "Profile photo has been removed from your resume",
    });
  };

  const updatePictureSettings = (updates: Partial<typeof picture>) => {
    const updatedResume = {
      ...resume,
      basics: {
        ...resume?.basics,
        picture: {
          ...picture,
          ...updates,
        }
      }
    };
    
    setResume(updatedResume);
  };

  return (
    <Card className={`${className} transition-all duration-200 ${
      isDarkMode 
        ? 'bg-[#1E293B] border-white/10' 
        : 'bg-white border-gray-200'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Small preview or fallback */}
              <div className="relative">
                {picture.url && !picture.effects?.hidden ? (
                  <img
                    src={picture.url}
                    alt="Profile preview"
                    className={`w-12 h-12 rounded-full object-cover border-2 ${
                      isDarkMode ? 'border-white/20' : 'border-gray-200'
                    }`}
                    style={{
                      filter: picture.effects?.grayscale ? 'grayscale(100%)' : 'none',
                    }}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-[#334155] border-white/20' 
                      : 'bg-gray-100 border-gray-300'
                  }`}>
                    <span className={`font-medium text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-600'
                    }`}>{getInitial()}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-[#1E293B]'
                }`}>Profile Photo</h3>
                <p className={`text-xs ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-gray-500'
                }`}>
                  {picture.url ? 'Photo uploaded' : 'Optional - adds personal touch'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              {/* Remove button - always show (can remove default photo too) */}
              <Button
                onClick={removePhoto}
                variant="ghost"
                size="sm"
                className={`${
                  isDarkMode 
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' 
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                }`}
              >
                <X className="h-3 w-3" />
              </Button>
              
              {/* Edit button - only show if user has uploaded a photo */}
              {picture.url && (
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="ghost"
                  size="sm"
                  className={`${
                    isDarkMode 
                      ? 'text-[#CBD5E1] hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {isExpanded ? 'Less' : 'Edit'}
                </Button>
              )}
              
              {/* Add Photo button - always show */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode 
                    ? 'text-[#3B82F6] border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]/50' 
                    : 'text-[#14B8A6] border-[#14B8A6]/30 hover:bg-[#14B8A6]/10 hover:border-[#14B8A6]/50'
                }`}
              >
                <Camera className="h-3 w-3 mr-1" />
                {isUploading ? 'Uploading...' : 'Add Photo'}
              </Button>
            </div>
          </div>

          {/* Upload area - only show when no photo */}
          {!picture.url && (
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                isDragging
                  ? isDarkMode 
                    ? 'border-[#3B82F6] bg-[#3B82F6]/10' 
                    : 'border-[#14B8A6] bg-[#14B8A6]/10'
                  : isDarkMode 
                    ? 'border-white/20 hover:border-white/40' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={`h-6 w-6 mx-auto mb-2 ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-gray-400'
              }`} />
              <p className={`text-xs ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-gray-600'
              }`}>
                Drag & drop or click to upload
              </p>
              <p className={`text-xs ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-gray-400'
              }`}>
                JPG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>
          )}

          {/* Settings - only show when expanded */}
          {picture.url && isExpanded && (
            <div className={`space-y-3 pt-2 border-t ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              {/* Size */}
              <div>
                <Label className={`text-xs font-medium ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-gray-700'
                }`}>
                  Size: {picture.size || 120}px
                </Label>
                <Slider
                  value={[picture.size || 120]}
                  onValueChange={([value]) => updatePictureSettings({ size: value })}
                  min={80}
                  max={200}
                  step={10}
                  className="mt-1"
                />
              </div>

              {/* Shape */}
              <div>
                <Label className={`text-xs font-medium mb-2 block ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-gray-700'
                }`}>Shape</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePictureSettings({ borderRadius: 0 })}
                    className={`text-xs ${
                      picture.borderRadius === 0 
                        ? isDarkMode 
                          ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]' 
                          : 'bg-[#14B8A6]/20 border-[#14B8A6] text-[#14B8A6]'
                        : isDarkMode 
                          ? 'border-white/20 text-[#CBD5E1] hover:bg-white/10' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Square
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePictureSettings({ borderRadius: 50 })}
                    className={`text-xs ${
                      picture.borderRadius === 50 
                        ? isDarkMode 
                          ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]' 
                          : 'bg-[#14B8A6]/20 border-[#14B8A6] text-[#14B8A6]'
                        : isDarkMode 
                          ? 'border-white/20 text-[#CBD5E1] hover:bg-white/10' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Circle className="h-3 w-3 mr-1" />
                    Circle
                  </Button>
                </div>
              </div>

              {/* Effects */}
              <div className="space-y-2">
                <Label className={`text-xs font-medium ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-gray-700'
                }`}>Effects</Label>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-gray-600'
                  }`}>Add border</span>
                  <Switch
                    checked={picture.effects?.border || false}
                    onCheckedChange={(checked) => 
                      updatePictureSettings({ 
                        effects: { ...picture.effects, border: checked } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-gray-600'
                  }`}>Grayscale</span>
                  <Switch
                    checked={picture.effects?.grayscale || false}
                    onCheckedChange={(checked) => 
                      updatePictureSettings({ 
                        effects: { ...picture.effects, grayscale: checked } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-gray-600'
                  }`}>Hide photo</span>
                  <Switch
                    checked={picture.effects?.hidden || false}
                    onCheckedChange={(checked) => 
                      updatePictureSettings({ 
                        effects: { ...picture.effects, hidden: checked } 
                      })
                    }
                  />
                </div>
              </div>

              {/* Replace Photo */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className={`w-full text-xs ${
                  isDarkMode 
                    ? 'text-[#3B82F6] border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]/50' 
                    : 'text-[#14B8A6] border-[#14B8A6]/30 hover:bg-[#14B8A6]/10 hover:border-[#14B8A6]/50'
                }`}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Replace Photo
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;