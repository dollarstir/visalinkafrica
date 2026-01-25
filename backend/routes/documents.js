const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Get all documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Documents GET request received');
    const { page = 1, limit = 50, search = '', category = 'all', status = 'all' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        d.id,
        d.name,
        d.file_name,
        d.file_path,
        d.file_type,
        d.file_size,
        d.category,
        d.description,
        d.application_id,
        d.customer_id,
        d.uploaded_by,
        d.status,
        d.created_at,
        d.updated_at,
        u.name as uploaded_by_name,
        c.first_name || ' ' || c.last_name as customer_name,
        a.id as application_ref
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN applications a ON d.application_id = a.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (d.name ILIKE $${paramCount} OR d.description ILIKE $${paramCount} OR d.file_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (category !== 'all') {
      paramCount++;
      query += ` AND d.category = $${paramCount}`;
      queryParams.push(category);
    }

    if (status !== 'all') {
      paramCount++;
      query += ` AND d.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limitNum, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM documents d WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (d.name ILIKE $${paramCount} OR d.description ILIKE $${paramCount} OR d.file_name ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    if (category !== 'all') {
      paramCount++;
      countQuery += ` AND d.category = $${paramCount}`;
      countParams.push(category);
    }

    if (status !== 'all') {
      paramCount++;
      countQuery += ` AND d.status = $${paramCount}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Transform data for frontend
    const documents = result.rows.map(doc => {
      // Determine file type from extension
      let fileType = 'file';
      if (doc.file_name) {
        const ext = path.extname(doc.file_name).toLowerCase();
        if (['.pdf'].includes(ext)) fileType = 'pdf';
        else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) fileType = 'image';
        else if (['.doc', '.docx', '.txt'].includes(ext)) fileType = 'document';
      }

      // Format file size
      let formattedSize = '0 KB';
      if (doc.file_size) {
        const sizeInMB = (doc.file_size / (1024 * 1024)).toFixed(2);
        formattedSize = sizeInMB >= 1 ? `${sizeInMB} MB` : `${(doc.file_size / 1024).toFixed(0)} KB`;
      }

      return {
        id: `DOC-${String(doc.id || 0).padStart(3, '0')}`,
        name: doc.name || 'Untitled',
        fileName: doc.file_name || '',
        filePath: doc.file_path || '',
        type: fileType,
        size: formattedSize,
        category: doc.category || 'Uncategorized',
        uploadedBy: doc.uploaded_by_name || 'Unknown',
        uploadedAt: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        applicationId: doc.application_id ? `APP-${String(doc.application_id).padStart(3, '0')}` : null,
        customerId: doc.customer_id ? `CUST-${String(doc.customer_id).padStart(3, '0')}` : null,
        status: doc.status || 'active',
        description: doc.description || '',
        rawId: doc.id
      };
    });

    res.json({
      documents: documents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id.replace('DOC-', ''));

    const result = await pool.query(
      `SELECT d.*, u.name as uploaded_by_name,
              c.first_name || ' ' || c.last_name as customer_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       LEFT JOIN customers c ON d.customer_id = c.id
       WHERE d.id = $1`,
      [numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = result.rows[0];
    const ext = path.extname(doc.file_name).toLowerCase();
    let fileType = 'file';
    if (['.pdf'].includes(ext)) fileType = 'pdf';
    else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) fileType = 'image';
    else if (['.doc', '.docx', '.txt'].includes(ext)) fileType = 'document';

    const sizeInMB = (doc.file_size / (1024 * 1024)).toFixed(2);
    const formattedSize = sizeInMB >= 1 ? `${sizeInMB} MB` : `${(doc.file_size / 1024).toFixed(0)} KB`;

    res.json({
      document: {
        id: `DOC-${String(doc.id).padStart(3, '0')}`,
        name: doc.name,
        fileName: doc.file_name,
        filePath: doc.file_path,
        type: fileType,
        size: formattedSize,
        category: doc.category || 'Uncategorized',
        uploadedBy: doc.uploaded_by_name || 'Unknown',
        uploadedAt: new Date(doc.created_at).toLocaleDateString(),
        applicationId: doc.application_id ? `APP-${String(doc.application_id).padStart(3, '0')}` : null,
        customerId: doc.customer_id ? `CUST-${String(doc.customer_id).padStart(3, '0')}` : null,
        status: doc.status || 'active',
        description: doc.description || '',
        rawId: doc.id
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload document
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      name,
      category,
      description,
      application_id,
      customer_id
    } = req.body;

    const userId = req.user.userId; // From authenticateToken middleware

    const result = await pool.query(
      `INSERT INTO documents (
        name, file_name, file_path, file_type, file_size,
        category, description, application_id, customer_id, uploaded_by, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
      RETURNING *`,
      [
        name || req.file.originalname,
        req.file.filename,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        category || null,
        description || null,
        application_id ? parseInt(application_id) : null,
        customer_id ? parseInt(customer_id) : null,
        userId
      ]
    );

    const doc = result.rows[0];
    const ext = path.extname(doc.file_name).toLowerCase();
    let fileType = 'file';
    if (['.pdf'].includes(ext)) fileType = 'pdf';
    else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) fileType = 'image';
    else if (['.doc', '.docx', '.txt'].includes(ext)) fileType = 'document';

    const sizeInMB = (doc.file_size / (1024 * 1024)).toFixed(2);
    const formattedSize = sizeInMB >= 1 ? `${sizeInMB} MB` : `${(doc.file_size / 1024).toFixed(0)} KB`;

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: `DOC-${String(doc.id).padStart(3, '0')}`,
        name: doc.name,
        fileName: doc.file_name,
        filePath: doc.file_path,
        type: fileType,
        size: formattedSize,
        category: doc.category || 'Uncategorized',
        status: doc.status || 'active',
        description: doc.description || '',
        rawId: doc.id
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    // Delete uploaded file if database insert fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id.replace('DOC-', ''));
    const {
      name,
      category,
      description,
      status,
      application_id,
      customer_id
    } = req.body;

    const result = await pool.query(
      `UPDATE documents SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        application_id = COALESCE($5, application_id),
        customer_id = COALESCE($6, customer_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [
        name || null,
        category || null,
        description || null,
        status || null,
        application_id ? parseInt(application_id) : null,
        customer_id ? parseInt(customer_id) : null,
        numericId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      message: 'Document updated successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id.replace('DOC-', ''));

    // Get file path before deleting
    const docResult = await pool.query(
      'SELECT file_path FROM documents WHERE id = $1',
      [numericId]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = docResult.rows[0].file_path;

    // Delete from database
    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING id',
      [numericId]
    );

    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View document (opens in browser/popup) - accepts token in query or header for iframe/image requests
router.get('/:id/view', async (req, res) => {
  try {
    // Check for token in query parameter (for iframe/image) or header
    const token = req.query.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { id } = req.params;
    const numericId = parseInt(id.replace('DOC-', ''));

    const result = await pool.query(
      'SELECT file_path, file_name, file_type FROM documents WHERE id = $1',
      [numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = result.rows[0];
    const filePath = doc.file_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Determine correct Content-Type based on file extension
    const ext = path.extname(doc.file_name).toLowerCase();
    let contentType = doc.file_type || 'application/octet-stream';
    
    // Override Content-Type for better browser compatibility
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (['.txt', '.text'].includes(ext)) {
      contentType = 'text/plain';
    } else if (ext === '.html' || ext === '.htm') {
      contentType = 'text/html';
    } else if (['.doc', '.docx'].includes(ext)) {
      contentType = 'application/msword';
    }

    // Set appropriate headers for viewing (not downloading)
    // Allow CORS for images and iframes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send the file
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error('View error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error viewing file' });
        }
      }
    });
  } catch (error) {
    console.error('View document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id.replace('DOC-', ''));

    const result = await pool.query(
      'SELECT file_path, file_name, name FROM documents WHERE id = $1',
      [numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = result.rows[0];
    const filePath = doc.file_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, doc.file_name, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get document categories (for dropdown)
router.get('/meta/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM document_categories ORDER BY name'
    );

    res.json({
      categories: result.rows
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create document category
router.post('/meta/categories', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(
      'INSERT INTO document_categories (name, description) VALUES ($1, $2) RETURNING *',
      [name.trim(), description || null]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document category
router.put('/meta/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(
      'UPDATE document_categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name.trim(), description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document category
router.delete('/meta/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is being used by any documents
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM documents WHERE category = (SELECT name FROM document_categories WHERE id = $1)',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category. It is being used by existing documents.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM document_categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

