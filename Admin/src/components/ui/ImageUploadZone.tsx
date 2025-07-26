import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { useToast } from '../../hooks/use-toast';
import { Progress } from './progress';

interface ImageUploadZoneProps {
  onImageUpload: (path: string) => void;
  tenantId: string;
  currentImage?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onImageUpload,
  tenantId,
  currentImage,
  maxSize = 5,
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg'],
  className = '',
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} not supported. Please use PNG, JPEG, or JPG`;
    }
    return null;
  };

  const uploadImage = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('http://localhost:3005/api/upload', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (data.success) {
        setPreviewUrl(data.path);
        onImageUpload(data.path);
        toast({
          title: 'Image Uploaded Successfully',
          description: 'Product image has been uploaded and saved.',
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to upload image');
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadImage(files[0]);
    }
  }, [tenantId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3005${imagePath}`;
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className={`border-2 border-dashed transition-colors ${
        isDragging 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-white/20 bg-black'
      } ${error ? 'border-red-400' : ''}`}>
        <CardContent className="p-6">
          {previewUrl ? (
            // Image Preview
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={getImageUrl(previewUrl)}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-lg border border-white/20"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/70">Current product image</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-black text-white border-white/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            // Upload Zone
            <div
              className="text-center py-8"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">Uploading image...</p>
                    <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    <p className="text-xs text-white/50">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/70" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-white">Upload Product Image</p>
                    <p className="text-sm text-white/70">
                      Drag and drop an image here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-xs text-white/50">
                      PNG, JPG, JPEG up to {maxSize}MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-black text-white border-white/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};
