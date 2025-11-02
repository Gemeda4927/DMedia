'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiFileText } from 'react-icons/fi';
import { newsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useNotifications } from '@/lib/notifications';

export default function CreateNewsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'politics',
    featuredImage: '',
    tags: [] as string[],
    isBreaking: false,
    isFeatured: false,
    status: 'draft',
  });
  const [tagInput, setTagInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const sampleData = {
    title: 'Breaking: Major Development in Regional Politics',
    excerpt: 'A significant political development has emerged today that could reshape the regional landscape. Experts are analyzing the implications of this major announcement.',
    content: `In a landmark announcement today, regional leaders have come together to address critical issues facing the community. The development marks a turning point in regional governance and policy-making.

The announcement was made during a high-profile gathering that included key stakeholders from various sectors. Observers note that this represents one of the most significant political movements in recent history.

Key points of the announcement include:
- Major policy reforms
- Infrastructure development plans
- Economic revitalization initiatives
- Social welfare programs

Community members have expressed mixed reactions to the news, with some welcoming the changes while others remain cautious about the implementation timeline.

"This is a momentous occasion," said a local official. "We are committed to transparency and working closely with all community members to ensure successful implementation."

The next steps involve detailed planning sessions and consultations with various interest groups to ensure broad-based support for the initiatives.`,
    category: 'politics',
    featuredImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
    tags: ['politics', 'regional', 'breaking', 'government'],
    isBreaking: true,
    isFeatured: false,
    status: 'review',
  };

  const loadSampleData = () => {
    setFormData(sampleData);
    setFieldErrors({});
    showSuccess('Sample data loaded. You can edit it before submitting.', 'Sample Data Loaded');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    try {
      await newsApi.create(formData);
      showSuccess(
        formData.status === 'review' 
          ? 'News article submitted for review successfully!' 
          : 'News article saved as draft successfully!',
        'Success'
      );
      
      // Wait a moment to show the success notification before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      const errorData = err.response?.data;
      
      // Handle validation errors from express-validator
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errors: Record<string, string> = {};
        const errorMessages: string[] = [];
        
        errorData.errors.forEach((error: any) => {
          // express-validator uses 'param' for the field name
          // Sometimes it might be nested like 'param.field' or just 'field'
          let field = error.param || error.path || error.field;
          const message = error.msg || error.message || String(error);
          
          // Extract field name if it's in format like 'param.field'
          if (field && field.includes('.')) {
            field = field.split('.').pop() || field;
          }
          
          if (field) {
            errors[field] = message;
          }
          
          // Only add message if we have a valid one
          if (message && typeof message === 'string') {
            errorMessages.push(message);
          }
        });
        
        setFieldErrors(errors);
        
        // Show notification with all error messages
        const errorMessage = errorMessages.length > 0 
          ? errorMessages.join('. ') 
          : 'Please check the form and fix the errors.';
        
        showError(errorMessage, 'Validation Failed', 7000);
      } else {
        // Handle other errors (mongoose validation or server errors)
        const errorMessage = errorData?.message || err.message || 'Failed to create news article';
        showError(errorMessage, 'Error', 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Create News Article</h1>
            <div className="flex gap-2">
              <button
                onClick={loadSampleData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2"
              >
                <FiFileText className="w-5 h-5" />
                Load Sample Data
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <FiX className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
                  }}
                  className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none ${
                    fieldErrors.title 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-600 focus:border-primary-500'
                  }`}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: '' });
                  }}
                  className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none ${
                    fieldErrors.category 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-600 focus:border-primary-500'
                  }`}
                >
                  <option value="politics">Politics</option>
                  <option value="culture">Culture</option>
                  <option value="sports">Sports</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="economy">Economy</option>
                  <option value="technology">Technology</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                </select>
                {fieldErrors.category && (
                  <p className="mt-1 text-sm text-red-400">{fieldErrors.category}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Excerpt *</label>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={formData.excerpt}
                onChange={(e) => {
                  setFormData({ ...formData, excerpt: e.target.value });
                  if (fieldErrors.excerpt) setFieldErrors({ ...fieldErrors, excerpt: '' });
                }}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none ${
                  fieldErrors.excerpt 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-primary-500'
                }`}
                placeholder="Short summary of the article..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">{formData.excerpt.length}/500</p>
                {fieldErrors.excerpt && (
                  <p className="text-sm text-red-400">{fieldErrors.excerpt}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                required
                rows={12}
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  if (fieldErrors.content) setFieldErrors({ ...fieldErrors, content: '' });
                }}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none font-mono text-sm ${
                  fieldErrors.content 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-primary-500'
                }`}
              />
              {fieldErrors.content && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.content}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Featured Image URL *</label>
              <input
                type="url"
                required
                value={formData.featuredImage}
                onChange={(e) => {
                  setFormData({ ...formData, featuredImage: e.target.value });
                  if (fieldErrors.featuredImage) setFieldErrors({ ...fieldErrors, featuredImage: '' });
                }}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none ${
                  fieldErrors.featuredImage 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-primary-500'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {fieldErrors.featuredImage && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.featuredImage}</p>
              )}
              {formData.featuredImage && !fieldErrors.featuredImage && (
                <div className="mt-2">
                  <img 
                    src={formData.featuredImage} 
                    alt="Featured preview" 
                    className="max-w-xs rounded-lg border border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-lg text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-300"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isBreaking"
                  checked={formData.isBreaking}
                  onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isBreaking" className="text-sm">
                  Breaking News
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isFeatured" className="text-sm">
                  Featured
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="review">Submit for Review</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {formData.status === 'review' ? 'Submitting...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    {formData.status === 'review' ? 'Submit for Review' : 'Save as Draft'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

