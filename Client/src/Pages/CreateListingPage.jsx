import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('details'); // details, media, settings, review
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    startingPrice: '',
    priceFloor: '',
    auctionType: 'ENGLISH',
    endTime: '',
  });

  const categories = [
    'Electronics',
    'Art',
    'Vehicles',
    'Fashion',
    'Furniture',
    'Collectibles',
    'Jewellery',
    'Books',
    'Sports',
    'Other',
  ];

  const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
  const auctionTypes = ['ENGLISH', 'DUTCH', 'BLIND'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      images.forEach((image) => {
        data.append('photos', image);
      });

      await sellerAPI.createListing(data);
      toast.success('Listing created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  const stepContent = {
    details: (
      <div className="space-y-6">
        <h2 className="text-headline-lg mb-4">Item Details</h2>

        <div>
          <label className="text-primary-label">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter item title"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="text-primary-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your item in detail"
            className="input-field h-32 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-primary-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-primary-label">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Condition</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-primary-label">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City/Region"
            className="input-field"
            required
          />
        </div>
      </div>
    ),

    media: (
      <div className="space-y-6">
        <h2 className="text-headline-lg mb-4">Upload Images</h2>

        <div className="card border-2 border-dashed border-primary p-8 text-center cursor-pointer hover:bg-primary-fixed/10 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="file-input"
            disabled={images.length >= 5}
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <span className="material-symbols-outlined text-6xl text-primary block mb-2">
              cloud_upload
            </span>
            <p className="font-body-lg text-primary mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-body-md text-on-surface-variant">
              PNG, JPG up to 10MB. Maximum 5 images.
            </p>
          </label>
        </div>

        {images.length > 0 && (
          <div>
            <p className="font-body-md font-bold text-primary mb-3">
              {images.length}/5 Images
            </p>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-error text-on-error rounded-full p-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),

    settings: (
      <div className="space-y-6">
        <h2 className="text-headline-lg mb-4">Auction Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-primary-label">Starting Price (₹)</label>
            <input
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              placeholder="1000"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="text-primary-label">Reserve Price (₹)</label>
            <input
              type="number"
              name="priceFloor"
              value={formData.priceFloor}
              onChange={handleChange}
              placeholder="5000"
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-primary-label">Auction Type</label>
            <select
              name="auctionType"
              value={formData.auctionType}
              onChange={handleChange}
              className="input-field"
            >
              {auctionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-primary-label">End Date & Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>
      </div>
    ),

    review: (
      <div className="space-y-6">
        <h2 className="text-headline-lg mb-4">Review Your Listing</h2>

        <div className="card bg-primary text-on-primary">
          <h3 className="font-headline-lg text-on-primary mb-4">{formData.title}</h3>
          <div className="space-y-2 text-on-primary/90">
            <p>
              <span className="font-bold">Category:</span> {formData.category}
            </p>
            <p>
              <span className="font-bold">Condition:</span> {formData.condition}
            </p>
            <p>
              <span className="font-bold">Starting Price:</span> ₹
              {parseFloat(formData.startingPrice).toLocaleString()}
            </p>
            <p>
              <span className="font-bold">Reserve Price:</span> ₹
              {parseFloat(formData.priceFloor).toLocaleString()}
            </p>
            <p>
              <span className="font-bold">Auction Type:</span> {formData.auctionType}
            </p>
            <p>
              <span className="font-bold">Images:</span> {images.length}/5
            </p>
          </div>
        </div>

        <div className="card">
          <p className="text-body-md text-on-surface-variant">
            {formData.description}
          </p>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container-main py-8 max-w-2xl">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            {['details', 'media', 'settings', 'review'].map((s, idx) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    ['details', 'media', 'settings', 'review'].indexOf(step) >= idx
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      ['details', 'media', 'settings', 'review'].indexOf(step) > idx
                        ? 'bg-primary'
                        : 'bg-surface-container'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="card">
          {stepContent[step]}

          {/* Actions */}
          <div className="flex gap-4 justify-between mt-8 pt-6 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => {
                const steps = ['details', 'media', 'settings', 'review'];
                const currentIdx = steps.indexOf(step);
                if (currentIdx > 0) setStep(steps[currentIdx - 1]);
              }}
              className={step === 'details' ? 'btn-secondary opacity-50' : 'btn-secondary'}
              disabled={step === 'details'}
            >
              Back
            </button>

            {step === 'review' ? (
              <button
                type="submit"
                disabled={isLoading}
                className="btn-bid"
              >
                {isLoading ? 'Publishing...' : 'Publish Listing'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const steps = ['details', 'media', 'settings', 'review'];
                  const currentIdx = steps.indexOf(step);
                  if (currentIdx < steps.length - 1) setStep(steps[currentIdx + 1]);
                }}
                className="btn-bid"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
