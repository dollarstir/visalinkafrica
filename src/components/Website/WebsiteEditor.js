import React, { useState, useEffect } from 'react';
import { FileText, Save, AlertCircle, Image, BookOpen, Briefcase, Plus, Edit, Trash2, X } from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';

const WEBSITE_SLUGS = [
  { slug: 'home', label: 'Home' },
  { slug: 'about', label: 'About' },
  { slug: 'services', label: 'Services' },
  { slug: 'contact', label: 'Contact' },
];

const TABS = [
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'slider', label: 'Slider', icon: Image },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
];

const WebsiteEditor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pages');
  const [pages, setPages] = useState([]);
  const [slides, setSlides] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '', meta_description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Slider form
  const [slideForm, setSlideForm] = useState({ page_slug: 'home', title: '', subtitle: '', image_url: '', link_url: '', sort_order: 0, is_active: true });
  const [editingSlideId, setEditingSlideId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Blog form/modal
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: '', slug: '', excerpt: '', body: '', featured_image: '', status: 'draft', published_at: '', meta_description: '' });

  // Job form/modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', slug: '', department: '', location: '', employment_type: '', description: '', requirements: '', how_to_apply: '', application_deadline: '', status: 'draft' });

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (activeTab === 'slider') loadSlides();
    if (activeTab === 'blog') loadBlogPosts();
    if (activeTab === 'jobs') loadJobs();
  }, [activeTab]);

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

  const loadSlides = async () => {
    try {
      const data = await apiService.getWebsiteSlidesAll();
      setSlides(data.slides || []);
    } catch (err) {
      showError(err.message || 'Failed to load slides');
    }
  };

  const loadBlogPosts = async () => {
    try {
      const data = await apiService.getBlogPostsAll();
      setBlogPosts(data.posts || []);
    } catch (err) {
      showError(err.message || 'Failed to load blog posts');
    }
  };

  const loadJobs = async () => {
    try {
      const data = await apiService.getJobPostsAll();
      setJobs(data.jobs || []);
    } catch (err) {
      showError(err.message || 'Failed to load jobs');
    }
  };

  const startEdit = (page) => {
    setEditingSlug(page.slug);
    setFormData({ title: page.title || '', body: page.body || '', meta_description: page.meta_description || '' });
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setFormData({ title: '', body: '', meta_description: '' });
  };

  const handleSavePage = async () => {
    if (!editingSlug) return;
    try {
      setSaving(true);
      await apiService.updateWebsitePage(editingSlug, formData);
      showSuccess('Page updated successfully');
      setEditingSlug(null);
      loadPages();
    } catch (err) {
      showError(err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const getBaseUrl = () => {
    try { return new URL(apiService.baseURL).origin; } catch { return window.location.origin; }
  };

  const handleSlideImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const { url } = await apiService.uploadWebsiteImage(file);
      setSlideForm((p) => ({ ...p, image_url: url }));
    } catch (err) {
      showError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveSlide = async () => {
    if (!slideForm.image_url) {
      showError('Please add an image');
      return;
    }
    try {
      if (editingSlideId) {
        await apiService.updateWebsiteSlide(editingSlideId, slideForm);
        showSuccess('Slide updated');
      } else {
        await apiService.createWebsiteSlide(slideForm);
        showSuccess('Slide added');
      }
      setEditingSlideId(null);
      setSlideForm({ page_slug: 'home', title: '', subtitle: '', image_url: '', link_url: '', sort_order: slides.length, is_active: true });
      loadSlides();
    } catch (err) {
      showError(err.message || 'Failed to save slide');
    }
  };

  const handleDeleteSlide = async (slide) => {
    const ok = await showDeleteConfirm('Delete slide', `Remove "${slide.title || 'this slide'}"?`);
    if (!ok) return;
    try {
      await apiService.deleteWebsiteSlide(slide.id);
      showSuccess('Slide deleted');
      loadSlides();
    } catch (err) {
      showError(err.message || 'Failed to delete');
    }
  };

  const openBlogModal = (post = null) => {
    if (post) {
      setEditingBlogId(post.id);
      setBlogForm({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        body: post.body || '',
        featured_image: post.featured_image || '',
        status: post.status || 'draft',
        published_at: post.published_at ? post.published_at.slice(0, 16) : '',
        meta_description: post.meta_description || '',
      });
    } else {
      setEditingBlogId(null);
      setBlogForm({ title: '', slug: '', excerpt: '', body: '', featured_image: '', status: 'draft', published_at: '', meta_description: '' });
    }
    setShowBlogModal(true);
  };

  const handleSaveBlog = async () => {
    if (!blogForm.title?.trim()) {
      showError('Title is required');
      return;
    }
    try {
      const payload = { ...blogForm, slug: blogForm.slug || blogForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
      if (editingBlogId) {
        await apiService.updateBlogPost(editingBlogId, payload);
        showSuccess('Post updated');
      } else {
        await apiService.createBlogPost(payload);
        showSuccess('Post created');
      }
      setShowBlogModal(false);
      loadBlogPosts();
    } catch (err) {
      showError(err.message || 'Failed to save post');
    }
  };

  const handleBlogImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await apiService.uploadWebsiteImage(file);
      setBlogForm((p) => ({ ...p, featured_image: url }));
    } catch (err) {
      showError(err.message || 'Upload failed');
    }
  };

  const openJobModal = (job = null) => {
    if (job) {
      setEditingJobId(job.id);
      setJobForm({
        title: job.title || '',
        slug: job.slug || '',
        department: job.department || '',
        location: job.location || '',
        employment_type: job.employment_type || '',
        description: job.description || '',
        requirements: job.requirements || '',
        how_to_apply: job.how_to_apply || '',
        application_deadline: job.application_deadline ? job.application_deadline.slice(0, 10) : '',
        status: job.status || 'draft',
      });
    } else {
      setEditingJobId(null);
      setJobForm({ title: '', slug: '', department: '', location: '', employment_type: '', description: '', requirements: '', how_to_apply: '', application_deadline: '', status: 'draft' });
    }
    setShowJobModal(true);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title?.trim()) {
      showError('Title is required');
      return;
    }
    try {
      const payload = { ...jobForm, slug: jobForm.slug || jobForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
      if (editingJobId) {
        await apiService.updateJobPost(editingJobId, payload);
        showSuccess('Job updated');
      } else {
        await apiService.createJobPost(payload);
        showSuccess('Job created');
      }
      setShowJobModal(false);
      loadJobs();
    } catch (err) {
      showError(err.message || 'Failed to save job');
    }
  };

  if (!hasPermission(user, 'settings.update') && user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  if (loading && activeTab === 'pages') {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading website...</p>
        </div>
      </div>
    );
  }

  const displayPages = pages.length ? pages : WEBSITE_SLUGS.map(({ slug, label }) => ({ slug, title: label, body: '', meta_description: '' }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website management</h1>
        <p className="text-gray-600 dark:text-gray-400">Edit pages (WYSIWYG), slider, blog, and job posts.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Pages tab */}
      {activeTab === 'pages' && (
        <div className="grid gap-6">
          {displayPages.map((page) => (
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
                    <button type="button" onClick={handleSavePage} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
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
                      className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Page title"
                    />
                  </div>
                  <div>
                    <label className="label">Content (what you see is what you get)</label>
                    <RichTextEditor
                      value={formData.body}
                      onChange={(v) => setFormData((p) => ({ ...p, body: v }))}
                      minHeight={280}
                    />
                  </div>
                  <div>
                    <label className="label">Meta description (optional)</label>
                    <input
                      type="text"
                      value={formData.meta_description}
                      onChange={(e) => setFormData((p) => ({ ...p, meta_description: e.target.value }))}
                      className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
      )}

      {/* Slider tab */}
      {activeTab === 'slider' && (
        <div className="space-y-6">
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add or edit slide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Image *</label>
                <input type="file" accept="image/*" onChange={handleSlideImageChange} disabled={uploadingImage} className="input-field w-full" />
                {slideForm.image_url && (
                  <img src={slideForm.image_url.startsWith('http') ? slideForm.image_url : getBaseUrl() + slideForm.image_url} alt="Slide" className="mt-2 h-32 object-cover rounded border border-gray-200 dark:border-gray-600" />
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={slideForm.title}
                    onChange={(e) => setSlideForm((p) => ({ ...p, title: e.target.value }))}
                    className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Slide title"
                  />
                </div>
                <div>
                  <label className="label">Subtitle</label>
                  <input
                    type="text"
                    value={slideForm.subtitle}
                    onChange={(e) => setSlideForm((p) => ({ ...p, subtitle: e.target.value }))}
                    className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Optional subtitle"
                  />
                </div>
                <div>
                  <label className="label">Link URL (optional)</label>
                  <input
                    type="text"
                    value={slideForm.link_url}
                    onChange={(e) => setSlideForm((p) => ({ ...p, link_url: e.target.value }))}
                    className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="label">Order</label>
                  <input
                    type="number"
                    value={slideForm.sort_order}
                    onChange={(e) => setSlideForm((p) => ({ ...p, sort_order: parseInt(e.target.value, 10) || 0 }))}
                    className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="slide-active"
                    checked={slideForm.is_active}
                    onChange={(e) => setSlideForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="slide-active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                </div>
                <button type="button" onClick={handleSaveSlide} disabled={uploadingImage || !slideForm.image_url} className="btn-primary">
                  {editingSlideId ? 'Update slide' : 'Add slide'}
                </button>
              </div>
            </div>
          </div>
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current slides (homepage)</h3>
            {slides.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No slides yet. Add one above.</p>
            ) : (
              <ul className="space-y-3">
                {slides.filter((s) => s.page_slug === 'home').map((slide) => (
                  <li key={slide.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={slide.image_url?.startsWith('http') ? slide.image_url : (getBaseUrl() + (slide.image_url || ''))} alt="" className="h-14 w-24 object-cover rounded shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white truncate">{slide.title || 'Untitled'}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => { setSlideForm({ ...slide, sort_order: slide.sort_order ?? 0 }); setEditingSlideId(slide.id); }} className="btn-outline text-sm">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDeleteSlide(slide)} className="btn-outline text-sm text-red-600 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Blog tab */}
      {activeTab === 'blog' && (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blog posts</h3>
            <button type="button" onClick={() => openBlogModal()} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add post
            </button>
          </div>
          {blogPosts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Published</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {blogPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{post.title}</td>
                      <td className="px-4 py-2 text-sm">{post.status}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <button type="button" onClick={() => openBlogModal(post)} className="btn-outline text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Jobs tab */}
      {activeTab === 'jobs' && (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job posts</h3>
            <button type="button" onClick={() => openJobModal()} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add job
            </button>
          </div>
          {jobs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No jobs yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department / Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{job.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{[job.department, job.location].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="px-4 py-2 text-sm">{job.status}</td>
                      <td className="px-4 py-2 text-right">
                        <button type="button" onClick={() => openJobModal(job)} className="btn-outline text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Blog modal */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowBlogModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingBlogId ? 'Edit post' : 'New post'}</h3>
                <button type="button" onClick={() => setShowBlogModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Title *</label>
                    <input type="text" value={blogForm.title} onChange={(e) => setBlogForm((p) => ({ ...p, title: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Post title" />
                  </div>
                  <div>
                    <label className="label">Slug (URL)</label>
                    <input type="text" value={blogForm.slug} onChange={(e) => setBlogForm((p) => ({ ...p, slug: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="url-slug" />
                  </div>
                </div>
                <div>
                  <label className="label">Excerpt</label>
                  <textarea value={blogForm.excerpt} onChange={(e) => setBlogForm((p) => ({ ...p, excerpt: e.target.value }))} rows={2} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Short summary" />
                </div>
                <div>
                  <label className="label">Featured image URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={blogForm.featured_image} onChange={(e) => setBlogForm((p) => ({ ...p, featured_image: e.target.value }))} className="input-field flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Or upload below" />
                    <input type="file" accept="image/*" onChange={handleBlogImageUpload} className="input-field w-40" />
                  </div>
                </div>
                <div>
                  <label className="label">Content</label>
                  <RichTextEditor value={blogForm.body} onChange={(v) => setBlogForm((p) => ({ ...p, body: v }))} minHeight={220} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Status</label>
                    <select value={blogForm.status} onChange={(e) => setBlogForm((p) => ({ ...p, status: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Published at (optional)</label>
                    <input type="datetime-local" value={blogForm.published_at} onChange={(e) => setBlogForm((p) => ({ ...p, published_at: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setShowBlogModal(false)} className="btn-outline">Cancel</button>
                  <button type="button" onClick={handleSaveBlog} className="btn-primary">Save post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowJobModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingJobId ? 'Edit job' : 'New job'}</h3>
                <button type="button" onClick={() => setShowJobModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Title *</label>
                    <input type="text" value={jobForm.title} onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Job title" />
                  </div>
                  <div>
                    <label className="label">Slug (URL)</label>
                    <input type="text" value={jobForm.slug} onChange={(e) => setJobForm((p) => ({ ...p, slug: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="url-slug" />
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <input type="text" value={jobForm.department} onChange={(e) => setJobForm((p) => ({ ...p, department: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input type="text" value={jobForm.location} onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="label">Employment type</label>
                    <input type="text" value={jobForm.employment_type} onChange={(e) => setJobForm((p) => ({ ...p, employment_type: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. Full-time" />
                  </div>
                  <div>
                    <label className="label">Application deadline</label>
                    <input type="date" value={jobForm.application_deadline} onChange={(e) => setJobForm((p) => ({ ...p, application_deadline: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <RichTextEditor value={jobForm.description} onChange={(v) => setJobForm((p) => ({ ...p, description: v }))} minHeight={180} />
                </div>
                <div>
                  <label className="label">Requirements</label>
                  <textarea value={jobForm.requirements} onChange={(e) => setJobForm((p) => ({ ...p, requirements: e.target.value }))} rows={3} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="One per line or paragraph" />
                </div>
                <div>
                  <label className="label">How to apply</label>
                  <textarea value={jobForm.how_to_apply} onChange={(e) => setJobForm((p) => ({ ...p, how_to_apply: e.target.value }))} rows={2} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Email or link" />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select value={jobForm.status} onChange={(e) => setJobForm((p) => ({ ...p, status: e.target.value }))} className="input-field w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setShowJobModal(false)} className="btn-outline">Cancel</button>
                  <button type="button" onClick={handleSaveJob} className="btn-primary">Save job</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteEditor;
