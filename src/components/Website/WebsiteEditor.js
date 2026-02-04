import React, { useState, useEffect } from 'react';
import { FileText, Save, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';

const WEBSITE_SLUGS = [
  { slug: 'home', label: 'Home' },
  { slug: 'about', label: 'About' },
  { slug: 'services', label: 'Services' },
  { slug: 'contact', label: 'Contact' },
];

const WebsiteEditor = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '', meta_description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getWebsitePages();
      setPages(data.pages || []);
    } catch (err) {
      setError(err.message || 'Failed to load pages');
      showError('Failed to load website pages');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (page) => {
    setEditingSlug(page.slug);
    setFormData({
      title: page.title || '',
      body: page.body || '',
      meta_description: page.meta_description || '',
    });
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setFormData({ title: '', body: '', meta_description: '' });
  };

  const handleSave = async () => {
    if (!editingSlug) return;
    try {
      setSaving(true);
      await apiService.updateWebsitePage(editingSlug, {
        title: formData.title,
        body: formData.body,
        meta_description: formData.meta_description,
      });
      showSuccess('Page updated successfully');
      setEditingSlug(null);
      loadPages();
    } catch (err) {
      showError(err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission(user, 'settings.update') && user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading website pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website content</h1>
        <p className="text-gray-600 dark:text-gray-400">Edit the content of your corporate site (home, about, services, contact).</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {(pages.length ? pages : WEBSITE_SLUGS.map(({ slug, label }) => ({ slug, title: label, body: '', meta_description: '' }))).map((page) => (
          <div key={page.slug} className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{page.slug}</h2>
              </div>
              {editingSlug !== page.slug ? (
                <button type="button" onClick={() => startEdit(page)} className="btn-outline text-sm">
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={cancelEdit} className="btn-outline text-sm" disabled={saving}>
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editingSlug === page.slug && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Page title"
                  />
                </div>
                <div>
                  <label className="label">Content (HTML)</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData((p) => ({ ...p, body: e.target.value }))}
                    className="input-field font-mono text-sm min-h-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="<p>Your content here...</p>"
                  />
                </div>
                <div>
                  <label className="label">Meta description (optional)</label>
                  <input
                    type="text"
                    value={formData.meta_description}
                    onChange={(e) => setFormData((p) => ({ ...p, meta_description: e.target.value }))}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Short description for search engines"
                  />
                </div>
              </div>
            )}

            {editingSlug !== page.slug && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-700 dark:text-gray-300">{page.title}</p>
                <p className="mt-1 line-clamp-2">{((page.body || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 150)) || 'No content'}{(page.body || '').length > 150 ? '...' : ''}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebsiteEditor;
