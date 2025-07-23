import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onUploadSuccess: (path: string) => void;
  tenantId: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess, tenantId }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Max file size is 5MB');
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:3005/api/upload', {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-API-Key': 'blackbox-api-key-2024',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Upload Successful', description: data.message });
        onUploadSuccess(data.path);
        setSelectedFile(null);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="btn-upload"
      >
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
};

