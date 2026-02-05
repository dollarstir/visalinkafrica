const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

// Website image upload (slider, blog featured images)
const websiteUploadsDir = path.join(__dirname, '..', 'uploads', 'website');
if (!fs.existsSync(websiteUploadsDir)) {
  fs.mkdirSync(websiteUploadsDir, { recursive: true });
}
const websiteStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, websiteUploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `website-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  }
});
const websiteUpload = multer({
  storage: websiteStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Resume upload for job applications (public apply)
const resumesDir = path.join(__dirname, '..', 'uploads', 'website', 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `resume-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  }
});
const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.mimetype) && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only PDF, Word or image files are allowed for resume'));
    }
    cb(null, true);
  }
});

// Admin: upload image for slider/blog (returns URL for use in content)
router.post('/upload', authenticateToken, requirePermission('website.update'), websiteUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/uploads/website/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error('Website upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Pages ----------
router.get('/pages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT slug, title, body, meta_description, updated_at FROM website_pages ORDER BY slug'
    );
    res.json({ pages: result.rows });
  } catch (error) {
    console.error('Get website pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT slug, title, body, meta_description, updated_at FROM website_pages WHERE slug = $1',
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ page: result.rows[0] });
  } catch (error) {
    console.error('Get website page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function upsertPage(slug, { title, body, meta_description }) {
  const updateResult = await pool.query(
    `UPDATE website_pages
     SET title = COALESCE($1, title), body = COALESCE($2, body), meta_description = COALESCE($3, meta_description), updated_at = CURRENT_TIMESTAMP
     WHERE slug = $4
     RETURNING slug, title, body, meta_description, updated_at`,
    [title || null, body !== undefined ? body : null, meta_description !== undefined ? meta_description : null, slug]
  );
  if (updateResult.rows.length > 0) {
    return { page: updateResult.rows[0], message: 'Page updated successfully' };
  }
  const insertResult = await pool.query(
    `INSERT INTO website_pages (slug, title, body, meta_description)
     VALUES ($1, $2, $3, $4)
     RETURNING slug, title, body, meta_description, updated_at`,
    [slug, title || slug, body !== undefined ? body : '', meta_description !== undefined ? meta_description : '']
  );
  return { page: insertResult.rows[0], message: 'Page created successfully' };
}

router.put('/pages/:slug', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await upsertPage(req.params.slug, req.body);
    res.json(result);
  } catch (error) {
    console.error('Update website page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/pages', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const slug = req.body.slug;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'slug is required in request body' });
    }
    const result = await upsertPage(slug.trim(), req.body);
    res.json(result);
  } catch (error) {
    console.error('Update website page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Page sections (builder) ----------
// Public: get active sections for a page
router.get('/pages/:slug/sections', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT id, page_slug, block_type, block_props, sort_order
       FROM website_page_sections
       WHERE page_slug = $1 AND is_active = true
       ORDER BY sort_order ASC, id ASC`,
      [slug]
    );
    res.json({ sections: result.rows });
  } catch (error) {
    console.error('Get page sections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: list sections (optional page_slug)
router.get('/sections', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { page_slug } = req.query;
    let query = 'SELECT * FROM website_page_sections WHERE 1=1';
    const params = [];
    if (page_slug) {
      params.push(page_slug);
      query += ` AND page_slug = $${params.length}`;
    }
    query += ' ORDER BY page_slug, sort_order ASC, id ASC';
    const result = await pool.query(query, params);
    res.json({ sections: result.rows });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sections', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { page_slug = 'home', block_type, block_props = {}, sort_order = 0, is_active = true } = req.body;
    if (!block_type) {
      return res.status(400).json({ error: 'block_type is required' });
    }
    const result = await pool.query(
      `INSERT INTO website_page_sections (page_slug, block_type, block_props, sort_order, is_active)
       VALUES ($1, $2, $3::jsonb, $4, $5)
       RETURNING *`,
      [page_slug, block_type, JSON.stringify(block_props), parseInt(sort_order, 10) || 0, !!is_active]
    );
    res.status(201).json({ section: result.rows[0], message: 'Section created' });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/sections/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { page_slug, block_type, block_props, sort_order, is_active } = req.body;
    const updates = [];
    const values = [];
    let n = 0;
    if (page_slug !== undefined) { n++; updates.push(`page_slug = $${n}`); values.push(page_slug); }
    if (block_type !== undefined) { n++; updates.push(`block_type = $${n}`); values.push(block_type); }
    if (block_props !== undefined) { n++; updates.push(`block_props = $${n}::jsonb`); values.push(JSON.stringify(block_props)); }
    if (sort_order !== undefined) { n++; updates.push(`sort_order = $${n}`); values.push(parseInt(sort_order, 10)); }
    if (is_active !== undefined) { n++; updates.push(`is_active = $${n}`); values.push(!!is_active); }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    n++; updates.push('updated_at = CURRENT_TIMESTAMP'); values.push(id);
    const result = await pool.query(
      `UPDATE website_page_sections SET ${updates.join(', ')} WHERE id = $${n} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Section not found' });
    res.json({ section: result.rows[0], message: 'Section updated' });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/sections/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM website_page_sections WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Section not found' });
    res.json({ message: 'Section deleted' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/sections/reorder', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { page_slug, section_ids } = req.body;
    if (!page_slug || !Array.isArray(section_ids) || section_ids.length === 0) {
      return res.status(400).json({ error: 'page_slug and section_ids (array) are required' });
    }
    for (let i = 0; i < section_ids.length; i++) {
      await pool.query(
        'UPDATE website_page_sections SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND page_slug = $3',
        [i, section_ids[i], page_slug]
      );
    }
    const result = await pool.query(
      'SELECT * FROM website_page_sections WHERE page_slug = $1 ORDER BY sort_order, id',
      [page_slug]
    );
    res.json({ sections: result.rows, message: 'Sections reordered' });
  } catch (error) {
    console.error('Reorder sections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Slider ----------
// Public: get active slides for a page (default home)
router.get('/slides', async (req, res) => {
  try {
    const pageSlug = req.query.page || 'home';
    const result = await pool.query(
      `SELECT id, page_slug, title, subtitle, image_url, link_url, sort_order
       FROM website_slides
       WHERE page_slug = $1 AND is_active = true
       ORDER BY sort_order ASC, id ASC`,
      [pageSlug]
    );
    res.json({ slides: result.rows });
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: get all slides
router.get('/slides/all', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM website_slides ORDER BY page_slug, sort_order, id'
    );
    res.json({ slides: result.rows });
  } catch (error) {
    console.error('Get all slides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/slides', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { page_slug = 'home', title, subtitle, image_url, link_url, sort_order = 0, is_active = true } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }
    const result = await pool.query(
      `INSERT INTO website_slides (page_slug, title, subtitle, image_url, link_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [page_slug, title || null, subtitle || null, image_url, link_url || null, parseInt(sort_order, 10) || 0, !!is_active]
    );
    res.status(201).json({ slide: result.rows[0], message: 'Slide created' });
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/slides/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { page_slug, title, subtitle, image_url, link_url, sort_order, is_active } = req.body;
    const result = await pool.query(
      `UPDATE website_slides SET
        page_slug = COALESCE($1, page_slug),
        title = COALESCE($2, title),
        subtitle = COALESCE($3, subtitle),
        image_url = COALESCE($4, image_url),
        link_url = COALESCE($5, link_url),
        sort_order = COALESCE($6, sort_order),
        is_active = COALESCE($7, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [page_slug, title, subtitle, image_url, link_url, sort_order, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    res.json({ slide: result.rows[0], message: 'Slide updated' });
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/slides/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM website_slides WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    res.json({ message: 'Slide deleted' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Blog ----------
// Public: list published posts
router.get('/blog', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const countResult = await pool.query(
      "SELECT COUNT(*)::int FROM blog_posts WHERE status = 'published'"
    );
    const total = countResult.rows[0]?.count || 0;
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, featured_image, published_at, created_at
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST, created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit, 10), offset]
    );
    res.json({
      posts: result.rows,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    console.error('Get blog list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: list all posts (including drafts)
router.get('/blog/all', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, featured_image, status, published_at, created_at, updated_at
       FROM blog_posts ORDER BY created_at DESC`
    );
    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get blog all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: get single post by slug (published only, unless auth)
router.get('/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, body, featured_image, status, published_at, created_at, updated_at, meta_description
       FROM blog_posts WHERE slug = $1`,
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const post = result.rows[0];
    if (post.status !== 'published' && !req.headers.authorization) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/blog', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { title, slug, excerpt, body, featured_image, status = 'draft', published_at, meta_description } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, body, featured_image, author_id, status, published_at, meta_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, finalSlug, excerpt || null, body || null, featured_image || null, req.user?.userId || null, status || 'draft', published_at || null, meta_description || null]
    );
    res.status(201).json({ post: result.rows[0], message: 'Post created' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/blog/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, body, featured_image, status, published_at, meta_description } = req.body;
    const result = await pool.query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        excerpt = COALESCE($3, excerpt),
        body = COALESCE($4, body),
        featured_image = COALESCE($5, featured_image),
        status = COALESCE($6, status),
        published_at = COALESCE($7, published_at),
        meta_description = COALESCE($8, meta_description),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [title, slug, excerpt, body, featured_image, status, published_at, meta_description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: result.rows[0], message: 'Post updated' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/blog/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Jobs ----------
// Public: list published jobs
router.get('/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const countResult = await pool.query(
      "SELECT COUNT(*)::int FROM job_posts WHERE status = 'published'"
    );
    const total = countResult.rows[0]?.count || 0;
    const result = await pool.query(
      `SELECT id, title, slug, department, location, employment_type, application_deadline, created_at
       FROM job_posts
       WHERE status = 'published'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit, 10), offset]
    );
    res.json({
      jobs: result.rows,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    console.error('Get jobs list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: list all jobs
router.get('/jobs/all', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM job_posts ORDER BY created_at DESC'
    );
    res.json({ jobs: result.rows });
  } catch (error) {
    console.error('Get jobs all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: submit job application (no auth)
router.post('/jobs/apply', resumeUpload.single('resume'), async (req, res) => {
  try {
    const { job_id, applicant_name, applicant_email, applicant_phone, cover_letter } = req.body || {};
    if (!job_id || !applicant_name || !applicant_email) {
      return res.status(400).json({ error: 'job_id, applicant_name and applicant_email are required' });
    }
    const jobRow = await pool.query(
      'SELECT id FROM job_posts WHERE id = $1 AND status = $2',
      [job_id, 'published']
    );
    if (jobRow.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or not accepting applications' });
    }
    const resumePath = req.file ? `/uploads/website/resumes/${req.file.filename}` : null;
    const result = await pool.query(
      `INSERT INTO job_applications (job_post_id, applicant_name, applicant_email, applicant_phone, cover_letter, resume_path, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'new')
       RETURNING id, job_post_id, applicant_name, applicant_email, status, created_at`,
      [job_id, applicant_name.trim(), applicant_email.trim(), (applicant_phone || '').trim() || null, (cover_letter || '').trim() || null, resumePath]
    );
    res.status(201).json({ application: result.rows[0], message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Job apply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: get single job by slug
router.get('/jobs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM job_posts WHERE slug = $1 AND status = $2',
      [slug, 'published']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ job: result.rows[0] });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/jobs', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { title, slug, department, location, employment_type, description, requirements, how_to_apply, application_deadline, status = 'draft' } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = await pool.query(
      `INSERT INTO job_posts (title, slug, department, location, employment_type, description, requirements, how_to_apply, application_deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, finalSlug, department || null, location || null, employment_type || null, description || null, requirements || null, how_to_apply || null, application_deadline || null, status || 'draft']
    );
    res.status(201).json({ job: result.rows[0], message: 'Job created' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/jobs/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, department, location, employment_type, description, requirements, how_to_apply, application_deadline, status } = req.body;
    const result = await pool.query(
      `UPDATE job_posts SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        department = COALESCE($3, department),
        location = COALESCE($4, location),
        employment_type = COALESCE($5, employment_type),
        description = COALESCE($6, description),
        requirements = COALESCE($7, requirements),
        how_to_apply = COALESCE($8, how_to_apply),
        application_deadline = COALESCE($9, application_deadline),
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title, slug, department, location, employment_type, description, requirements, how_to_apply, application_deadline, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: result.rows[0], message: 'Job updated' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/jobs/:id', authenticateToken, requirePermission('website.update'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM job_posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Job applications (admin) ----------
router.get('/job-applications', authenticateToken, requirePermission('job_applications.view'), async (req, res) => {
  try {
    const { page = 1, limit = 20, job_id, status } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    let where = 'WHERE 1=1';
    const params = [];
    let n = 0;
    if (job_id) {
      n++;
      where += ` AND ja.job_post_id = $${n}`;
      params.push(job_id);
    }
    if (status) {
      n++;
      where += ` AND ja.status = $${n}`;
      params.push(status);
    }
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM job_applications ja ${where}`,
      params
    );
    const total = countResult.rows[0]?.total || 0;
    params.push(parseInt(limit, 10), offset);
    const result = await pool.query(
      `SELECT ja.id, ja.job_post_id, ja.applicant_name, ja.applicant_email, ja.applicant_phone, ja.cover_letter, ja.resume_path, ja.status, ja.admin_notes, ja.created_at,
              jp.title AS job_title, jp.slug AS job_slug
       FROM job_applications ja
       JOIN job_posts jp ON jp.id = ja.job_post_id
       ${where}
       ORDER BY ja.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({
      applications: result.rows,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/job-applications/:id', authenticateToken, requirePermission('job_applications.view'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ja.*, jp.title AS job_title, jp.slug AS job_slug, jp.department, jp.location
       FROM job_applications ja
       JOIN job_posts jp ON jp.id = ja.job_post_id
       WHERE ja.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    res.json({ application: result.rows[0] });
  } catch (error) {
    console.error('Get job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/job-applications/:id', authenticateToken, requirePermission('job_applications.view'), async (req, res) => {
  try {
    const { status, admin_notes } = req.body || {};
    const result = await pool.query(
      `UPDATE job_applications SET
        status = COALESCE($1, status),
        admin_notes = COALESCE($2, admin_notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [status, admin_notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    res.json({ application: result.rows[0], message: 'Application updated' });
  } catch (error) {
    console.error('Update job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
