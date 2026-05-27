import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiTrash2 } from 'react-icons/fi';

const LogoUploader = ({ logos, updateLogos }) => {
  const appLogoInputRef = useRef(null);
  const quotationLogoInputRef = useRef(null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Limit file size (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result;
      if (type === 'app') {
        updateLogos(dataUri, undefined);
        toast.success('App logo updated');
      } else {
        updateLogos(undefined, dataUri);
        toast.success('Quotation logo updated');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (type) => {
    if (type === 'app') {
      updateLogos(null, undefined);
      if (appLogoInputRef.current) appLogoInputRef.current.value = '';
      toast.success('App logo removed');
    } else {
      updateLogos(undefined, null);
      if (quotationLogoInputRef.current) quotationLogoInputRef.current.value = '';
      toast.success('Quotation logo removed');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* App Logo Section */}
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center">
          <h4 className="text-sm font-medium text-gray-700 mb-2">App Logo</h4>
          <p className="text-xs text-gray-500 mb-4">Recommended size: 200x200px</p>
          
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 overflow-hidden bg-gray-50 relative">
            {logos.appLogo ? (
              <img src={logos.appLogo} alt="App Logo" className="object-contain w-full h-full" />
            ) : (
              <span className="text-gray-400 text-sm">No logo</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => appLogoInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <FiUploadCloud />
              Upload
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={appLogoInputRef}
              onChange={(e) => handleFileUpload(e, 'app')}
            />
            {logos.appLogo && (
              <button
                onClick={() => handleRemoveLogo('app')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              >
                <FiTrash2 />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Quotation Logo Section */}
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quotation Header Logo</h4>
          <p className="text-xs text-gray-500 mb-4">Recommended size: 300x80px</p>
          
          <div className="w-48 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 overflow-hidden bg-gray-50 relative">
            {logos.quotationLogo ? (
              <img src={logos.quotationLogo} alt="Quotation Logo" className="object-contain w-full h-full" />
            ) : (
              <span className="text-gray-400 text-sm">No logo</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => quotationLogoInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <FiUploadCloud />
              Upload
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={quotationLogoInputRef}
              onChange={(e) => handleFileUpload(e, 'quotation')}
            />
            {logos.quotationLogo && (
              <button
                onClick={() => handleRemoveLogo('quotation')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              >
                <FiTrash2 />
                Remove
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogoUploader;
