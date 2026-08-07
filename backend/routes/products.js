import { Router } from 'express';
import multer from 'multer';
import exceljs from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import supabase from '../utils/supabase.js';
import { verifyToken } from './auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer disk storage config for product images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../media/product_images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadImage = multer({ storage: imageStorage });

// Multer memory storage config for Excel/CSV spreadsheet uploads
const uploadExcel = multer({ storage: multer.memoryStorage() });

// Row Mapper Helpers (Adapter Pattern between Frontend CamelCase and DB SnakeCase)
function mapRowToCamel(row) {
  if (!row) return null;
  return {
    id: row.id,
    application: row.application,
    category: row.category,
    productName: row.product_name,
    productImage: row.product_image 
      ? (row.product_image.startsWith('/media/') 
        ? row.product_image 
        : (row.product_image.startsWith('/') 
          ? `/media${row.product_image}` 
          : `/media/${row.product_image}`)) 
      : null,
    make: row.make,
    model: row.model,
    specification: row.specification,
    uom: row.uom,
    buyingPrice: row.buying_price,
    vendor: row.vendor,
    quotationReceivedMonth: row.quotation_received_month,
    leadTime: row.lead_time,
    remarks: row.remarks,
    listPrice: row.list_price,
    discount: row.discount,
    salesPrice: row.sales_price,
    salesMargin: row.sales_margin,
    buyingPriceUpdatedAt: row.buying_price_updated_at
  };
}

function parseDateString(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') return null;
  const cleaned = dateStr.trim();
  if (cleaned === '' || cleaned.toUpperCase() === 'NAN' || cleaned.toUpperCase() === 'NULL' || cleaned === 'null') {
    return null;
  }

  // Check if it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Try parsing with Date.parse
  const timestamp = Date.parse(cleaned);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    return d.toISOString().split('T')[0];
  }

  // Hand-rolled parsing for formats like "Mar 2025", "March 2025", "03/2025", "3/2025", "2025/03", etc.
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const longMonthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  
  const parts = cleaned.toLowerCase().split(/[\s,/\-]+/);
  
  let year = null;
  let month = null; // 1-indexed

  for (const part of parts) {
    if (/^\d{4}$/.test(part)) {
      year = parseInt(part, 10);
    } else if (/^\d{1,2}$/.test(part)) {
      const val = parseInt(part, 10);
      if (val >= 1 && val <= 12) {
        if (month === null) month = val;
      }
    } else {
      const idx = monthNames.indexOf(part.substring(0, 3));
      if (idx !== -1) {
        month = idx + 1;
      } else {
        const longIdx = longMonthNames.indexOf(part);
        if (longIdx !== -1) {
          month = longIdx + 1;
        }
      }
    }
  }

  if (year && month) {
    const padMonth = month.toString().padStart(2, '0');
    return `${year}-${padMonth}-01`;
  }

  // If it's a 2 digit month and 4 digit year like "03/2025"
  const slashMatch = cleaned.match(/^(\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const m = parseInt(slashMatch[1], 10);
    const y = parseInt(slashMatch[2], 10);
    if (m >= 1 && m <= 12) {
      return `${y}-${m.toString().padStart(2, '0')}-01`;
    }
  }

  // If it's a 4 digit year and 2 digit month like "2025/03"
  const revSlashMatch = cleaned.match(/^(\d{4})[/-](\d{1,2})$/);
  if (revSlashMatch) {
    const y = parseInt(revSlashMatch[1], 10);
    const m = parseInt(revSlashMatch[2], 10);
    if (m >= 1 && m <= 12) {
      return `${y}-${m.toString().padStart(2, '0')}-01`;
    }
  }

  return null;
}

function mapDataToSnake(data) {
  if (!data) return null;
  const row = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.application !== undefined) row.application = data.application;
  if (data.category !== undefined) row.category = data.category;
  if (data.productName !== undefined) row.product_name = data.productName;
  if (data.productImage !== undefined) row.product_image = data.productImage;
  if (data.make !== undefined) row.make = data.make;
  if (data.model !== undefined) row.model = data.model;
  if (data.specification !== undefined) row.specification = data.specification;
  if (data.uom !== undefined) row.uom = data.uom;
  if (data.buyingPrice !== undefined) row.buying_price = data.buyingPrice;
  if (data.vendor !== undefined) row.vendor = data.vendor;
  if (data.quotationReceivedMonth !== undefined) {
    row.quotation_received_month = parseDateString(data.quotationReceivedMonth);
  }
  if (data.leadTime !== undefined) row.lead_time = data.leadTime;
  if (data.remarks !== undefined) row.remarks = data.remarks;
  if (data.listPrice !== undefined) row.list_price = data.listPrice;
  if (data.discount !== undefined) row.discount = data.discount;
  if (data.salesPrice !== undefined) row.sales_price = data.salesPrice;
  if (data.salesMargin !== undefined) row.sales_margin = data.salesMargin;
  if (data.buyingPriceUpdatedAt !== undefined) row.buying_price_updated_at = data.buyingPriceUpdatedAt;
  return row;
}

// Calculate selling margin and selling price dynamically
function calculateMarginsAndPricing(updatedFields, currentItem = null) {
  const listPrice = parseFloat(updatedFields.listPrice !== undefined ? updatedFields.listPrice : (currentItem?.listPrice || 0));
  const discount = parseFloat(updatedFields.discount !== undefined ? updatedFields.discount : (currentItem?.discount || 0));
  const buyingPrice = parseFloat(updatedFields.buyingPrice !== undefined ? updatedFields.buyingPrice : (currentItem?.buyingPrice || 0));

  const salesPrice = Math.max(listPrice - (listPrice * discount / 100), 0.0);
  const salesMargin = salesPrice > 0 ? Math.round(((salesPrice - buyingPrice) / salesPrice) * 100) : 0;

  let buyingPriceUpdatedAt = currentItem?.buyingPriceUpdatedAt || null;
  if (updatedFields.buyingPrice !== undefined) {
    if (!currentItem || currentItem.buyingPrice !== parseFloat(updatedFields.buyingPrice)) {
      buyingPriceUpdatedAt = new Date().toISOString();
    }
  } else if (!currentItem && buyingPrice > 0) {
    buyingPriceUpdatedAt = new Date().toISOString();
  }

  return {
    salesPrice,
    salesMargin,
    buyingPriceUpdatedAt
  };
}

// Age check for color formatting (<=30 green, <=60 yellow, >60 red)
function getBuyingPriceColor(updatedAt) {
  if (!updatedAt) return 'red';
  const daysDiff = Math.floor((new Date() - new Date(updatedAt)) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 30) return 'green';
  if (daysDiff <= 60) return 'yellow';
  return 'red';
}

// GET all items (Ratecards) with filters
router.get('/', verifyToken, requirePermission('ratecard:read'), async (req, res) => {
  const { search = '', category = 'all' } = req.query;

  try {
    let query = supabase.from('exapp_totalsolutions').select('*');

    if (search) {
      query = query.ilike('product_name', `%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category.toLowerCase());
    }

    const { data: items, error } = await query.order('id', { ascending: true });

    if (error) {
      console.error('Fetch ratecard error:', error);
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to retrieve products list.' });
    }

    const enrichedItems = (items || []).map(item => {
      const camel = mapRowToCamel(item);
      return {
        ...camel,
        buyingPriceColor: getBuyingPriceColor(camel.buyingPriceUpdatedAt)
      };
    });

    return res.json({ status: 'success', products: enrichedItems });
  } catch (error) {
    console.error('Fetch ratecard exception:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
});

// GET query products for autocomplete (in BOQ searches)
router.get('/search-boq', verifyToken, requirePermission('ratecard:read'), async (req, res) => {
  const { q = '', category = '' } = req.query;

  try {
    let query = supabase
      .from('exapp_totalsolutions')
      .select('id, product_name, category, make, model, specification, list_price, buying_price, discount, sales_price, sales_margin')
      .ilike('product_name', `%${q}%`);

    if (category) {
      query = query.eq('category', category.toLowerCase());
    }

    const { data: results, error } = await query.limit(20);

    if (error) {
      console.error('BOQ search error:', error);
      return res.status(500).json({ status: 'error', message: error.message || 'Search query failed.' });
    }

    const camelResults = (results || []).map(item => mapRowToCamel(item));

    return res.json({ status: 'success', results: camelResults });
  } catch (error) {
    console.error('BOQ search exception:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
});

// POST add manual item
router.post('/add', verifyToken, requirePermission('ratecard:write'), uploadImage.single('product_image'), async (req, res) => {
  try {
    const data = { ...req.body };
    const application = (data.application || 'General').trim();
    const category = (data.category || 'hardware').trim().toLowerCase();
    const productName = (data.productName || 'New Product').trim();
    const make = (data.make || '').trim();
    const model = (data.model || '').trim();

    // Check if an item with matching Application, Category, Product Name, Make, and Model already exists
    let query = supabase
      .from('exapp_totalsolutions')
      .select('id')
      .ilike('application', application)
      .ilike('category', category)
      .ilike('product_name', productName);

    if (make) {
      query = query.ilike('make', make);
    } else {
      query = query.or('make.is.null,make.eq.');
    }

    if (model) {
      query = query.ilike('model', model);
    } else {
      query = query.or('model.is.null,model.eq.');
    }

    const { data: duplicates, error: dupErr } = await query.limit(1);

    if (!dupErr && duplicates && duplicates.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'This item already exists in the catalog.'
      });
    }

    const buyingPrice = parseFloat(data.buyingPrice || 0);
    const listPrice = parseFloat(data.listPrice || 0);
    const discount = parseInt(data.discount || 0);

    const calculations = calculateMarginsAndPricing({ buyingPrice, listPrice, discount });

    const imageUrl = req.file ? `/media/product_images/${req.file.filename}` : null;

    const dbPayload = mapDataToSnake({
      application,
      category,
      productName,
      make,
      model,
      specification: data.specification || '',
      uom: data.uom || 'Pcs',
      vendor: data.vendor || '',
      quotationReceivedMonth: data.quotationReceivedMonth ? parseDateString(data.quotationReceivedMonth) : null,
      leadTime: data.leadTime || '',
      remarks: data.remarks || '',
      buyingPrice,
      listPrice,
      discount,
      salesPrice: calculations.salesPrice,
      salesMargin: calculations.salesMargin,
      buyingPriceUpdatedAt: calculations.buyingPriceUpdatedAt,
      productImage: imageUrl
    });

    const { data: createdRows, error } = await supabase
      .from('exapp_totalsolutions')
      .insert([dbPayload])
      .select();

    if (error) {
      console.error('Create item error:', error);
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to save item.' });
    }

    return res.json({ status: 'success', message: 'Item created successfully.', product: mapRowToCamel(createdRows[0]) });
  } catch (error) {
    console.error('Create item exception:', error);
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to save item.' });
  }
});

// PUT edit item
router.put('/edit/:id', verifyToken, requirePermission('ratecard:write'), async (req, res) => {
  const { id } = req.params;

  try {
    const { data: items, error: fetchErr } = await supabase
      .from('exapp_totalsolutions')
      .select('*')
      .eq('id', parseInt(id));

    const currentItemRow = items && items[0];
    if (fetchErr || !currentItemRow) {
      return res.status(404).json({ status: 'error', message: 'Product not found.' });
    }

    const currentItem = mapRowToCamel(currentItemRow);
    const data = req.body;
    const buyingPrice = data.buyingPrice !== undefined ? parseFloat(data.buyingPrice) : currentItem.buyingPrice;
    const listPrice = data.listPrice !== undefined ? parseFloat(data.listPrice) : currentItem.listPrice;
    const discount = data.discount !== undefined ? parseInt(data.discount) : currentItem.discount;

    const calculations = calculateMarginsAndPricing({ buyingPrice, listPrice, discount }, currentItem);

    const updateData = mapDataToSnake({
      application: data.application !== undefined ? data.application : currentItem.application,
      category: data.category !== undefined ? data.category.toLowerCase() : currentItem.category,
      productName: data.productName !== undefined ? data.productName : currentItem.productName,
      make: data.make !== undefined ? data.make : currentItem.make,
      model: data.model !== undefined ? data.model : currentItem.model,
      specification: data.specification !== undefined ? data.specification : currentItem.specification,
      uom: data.uom !== undefined ? data.uom : currentItem.uom,
      vendor: data.vendor !== undefined ? data.vendor : currentItem.vendor,
      quotationReceivedMonth: data.quotationReceivedMonth !== undefined ? parseDateString(data.quotationReceivedMonth) : currentItem.quotationReceivedMonth,
      leadTime: data.leadTime !== undefined ? data.leadTime : currentItem.leadTime,
      remarks: data.remarks !== undefined ? data.remarks : currentItem.remarks,
      buyingPrice,
      listPrice,
      discount,
      salesPrice: calculations.salesPrice,
      salesMargin: calculations.salesMargin,
      buyingPriceUpdatedAt: calculations.buyingPriceUpdatedAt
    });

    const { data: updatedRows, error: updateErr } = await supabase
      .from('exapp_totalsolutions')
      .update(updateData)
      .eq('id', parseInt(id))
      .select();

    if (updateErr) {
      console.error('Update product error:', updateErr);
      return res.status(500).json({ status: 'error', message: updateErr.message || 'Failed to update product.' });
    }

    return res.json({ status: 'success', message: 'Product updated.', product: mapRowToCamel(updatedRows[0]) });
  } catch (error) {
    console.error('Update product exception:', error);
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to update product.' });
  }
});

// POST update-field batch inline grid edits (Single or Batch Row Edits)
router.post('/update-field', verifyToken, async (req, res) => {
  const userRole = req.user?.role;
  const userPerms = req.user?.permissions || [];
  const canWrite = req.user?.is_superuser === 1 || userRole === 'super_admin' || userPerms.includes('*') || userPerms.includes('ratecard:write') || userPerms.includes('ratecard:price_write');
  if (!canWrite) {
    return res.status(403).json({ status: 'error', message: 'Access denied. Required permission: ratecard:write or ratecard:price_write' });
  }

  const { updates } = req.body;

  if (!updates) {
    return res.status(400).json({ status: 'error', message: 'No updates object provided.' });
  }

  try {
    const updatedValues = {};

    for (const [rowId, fields] of Object.entries(updates)) {
      const { data: items } = await supabase
        .from('exapp_totalsolutions')
        .select('*')
        .eq('id', parseInt(rowId));

      const currentItemRow = items && items[0];
      if (!currentItemRow) continue;

      const currentItem = mapRowToCamel(currentItemRow);
      const dataToUpdate = {};
      
      for (const [key, value] of Object.entries(fields)) {
        if (key === 'discount') {
          dataToUpdate.discount = Math.min(Math.max(parseInt(value.toString().replace('%', '')) || 0, 0), 100);
        } else if (key === 'buyingPrice' || key === 'listPrice') {
          dataToUpdate[key] = parseFloat(value) || 0;
        } else {
          dataToUpdate[key] = value;
        }
      }

      const calculations = calculateMarginsAndPricing(dataToUpdate, currentItem);
      
      const dbPayload = mapDataToSnake({
        ...dataToUpdate,
        salesPrice: calculations.salesPrice,
        salesMargin: calculations.salesMargin,
        buyingPriceUpdatedAt: calculations.buyingPriceUpdatedAt
      });

      const { data: updatedRows } = await supabase
        .from('exapp_totalsolutions')
        .update(dbPayload)
        .eq('id', parseInt(rowId))
        .select();

      const updated = mapRowToCamel(updatedRows && updatedRows[0]);
      if (!updated) continue;

      updatedValues[rowId] = {
        discount: updated.discount.toString(),
        salesPrice: updated.salesPrice.toString(),
        salesMargin: updated.salesMargin.toString(),
        buyingPrice: updated.buyingPrice.toString(),
        buyingPriceColor: getBuyingPriceColor(updated.buyingPriceUpdatedAt)
      };
    }

    return res.json({ status: 'success', message: 'Fields saved successfully.', updatedValues });
  } catch (error) {
    console.error('Batch update error:', error);
    return res.status(500).json({ status: 'error', message: 'Batch update failure.' });
  }
});

// POST apply global discount across all products (Dedicated Ultra-Fast Endpoint)
router.post('/apply-global-discount', verifyToken, requirePermission('ratecard:price_write'), async (req, res) => {
  const { discount: discountVal, category: categoryFilter = 'all' } = req.body;
  const discount = Math.min(Math.max(parseInt(discountVal) || 0, 0), 100);

  try {
    // 1. Try PostgreSQL RPC function if created
    const { error: rpcErr } = await supabase.rpc('apply_global_discount', {
      p_discount: discount,
      p_category: categoryFilter || 'all'
    });

    if (rpcErr) {
      // 2. Fallback: Fast single-query bulk update across matching rows
      let query = supabase.from('exapp_totalsolutions').update({ discount });
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter.toLowerCase());
      } else {
        query = query.gt('id', 0);
      }
      await query;
    }

    return res.json({
      status: 'success',
      message: `Applied ${discount}% global discount across products successfully.`,
      discount
    });
  } catch (error) {
    console.error('Bulk discount error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to apply global discount.' });
  }
});

// DELETE single item
router.delete('/delete/:id', verifyToken, requirePermission('ratecard:write'), async (req, res) => {
  const { id } = req.params;

  try {
    const { data: items } = await supabase
      .from('exapp_totalsolutions')
      .select('*')
      .eq('id', parseInt(id));

    const item = items && items[0];
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Item not found.' });
    }

    // Clean up local image from disk if exists
    if (item.product_image) {
      const imgPath = path.join(__dirname, '..', item.product_image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await supabase.from('exapp_totalsolutions').delete().eq('id', parseInt(id));
    return res.json({ status: 'success', message: `Deleted product "${item.product_name}".` });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete item.' });
  }
});

// POST delete-all
router.post('/delete-all', verifyToken, requirePermission('ratecard:write'), async (req, res) => {
  try {
    // 1. Light query selecting only product_image column for media cleanup
    const { data: items } = await supabase
      .from('exapp_totalsolutions')
      .select('product_image')
      .not('product_image', 'is', null);
    
    // Clean up local media files
    if (items && items.length > 0) {
      items.forEach(item => {
        if (item.product_image) {
          const imgPath = path.join(__dirname, '..', item.product_image);
          if (fs.existsSync(imgPath)) {
            try {
              fs.unlinkSync(imgPath);
            } catch (e) {}
          }
        }
      });
    }

    // 2. Fast database deletion
    const { error: delErr } = await supabase.from('exapp_totalsolutions').delete().gt('id', 0);
    if (delErr) {
      console.error('Delete all DB error:', delErr);
      return res.status(500).json({ status: 'error', message: 'Failed to wipe catalog database.' });
    }
    
    return res.json({ status: 'success', message: 'All catalog items deleted successfully.' });
  } catch (error) {
    console.error('Delete all exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to wipe catalog.' });
  }
});

// POST upload Excel/CSV sheet
router.post('/upload', verifyToken, requirePermission('ratecard:write'), uploadExcel.single('file'), async (req, res) => {
  const { category: categoryFilter = 'all' } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No upload spreadsheet file provided.' });
  }

  try {
    const workbook = new exceljs.Workbook();

    if (req.file.originalname.endsWith('.csv')) {
      const csvString = req.file.buffer.toString('utf-8');
      const csvStream = Readable.from(csvString);
      await workbook.csv.read(csvStream);
    } else {
      await workbook.xlsx.load(req.file.buffer);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ status: 'error', message: 'Spreadsheet has no worksheets.' });
    }

    const headers = [];
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value ? cell.value.toString().trim().toLowerCase() : '';
    });

    const requiredHeaders = [
      'application', 'category', 'product_name', 'make', 'model', 'specification',
      'uom', 'buying_price', 'vendor', 'quotation_received_month',
      'lead_time', 'remarks', 'list_price', 'discount'
    ];

    const headerIndexMap = {};
    requiredHeaders.forEach(reqH => {
      const colIdx = headers.indexOf(reqH);
      if (colIdx !== -1) {
        headerIndexMap[reqH] = colIdx;
      }
    });

    const missingHeaders = requiredHeaders.filter(h => !headerIndexMap[h]);
    if (missingHeaders.length > 0) {
      return res.status(400).json({ status: 'error', message: `Missing required columns: ${missingHeaders.join(', ')}` });
    }

    let savedEntries = 0;
    let skippedDuplicates = 0;

    // 1. High-Performance Pre-fetch: Fetch existing product composite keys in ONE single database query
    const { data: existingRows } = await supabase
      .from('exapp_totalsolutions')
      .select('application, category, product_name, make, model');

    // Build fast O(1) lookup Set of existing product keys
    const existingSet = new Set();
    if (existingRows) {
      existingRows.forEach(item => {
        const app = (item.application || '').toString().trim().toLowerCase();
        const cat = (item.category || '').toString().trim().toLowerCase();
        const name = (item.product_name || '').toString().trim().toLowerCase();
        const make = (item.make || '').toString().trim().toLowerCase();
        const model = (item.model || '').toString().trim().toLowerCase();
        const key = `${app}|${cat}|${name}|${make}|${model}`;
        existingSet.add(key);
      });
    }

    const rowsToInsert = [];

    // 2. Parse worksheet rows in-memory
    for (let r = 2; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      if (!row || !row.values || row.values.length === 0) continue;

      const getVal = (field) => {
        const idx = headerIndexMap[field];
        if (!idx) return '';
        const cell = row.getCell(idx);
        return cell.value !== null && cell.value !== undefined ? cell.value : '';
      };

      const application = getVal('application').toString().trim() || 'General';
      const category = getVal('category').toString().trim().toLowerCase() || 'hardware';
      const productName = getVal('product_name').toString().trim();
      const make = getVal('make').toString().trim();
      const model = getVal('model').toString().trim();

      if (!productName || !category) continue;

      if (categoryFilter !== 'all' && category !== categoryFilter.toLowerCase()) {
        continue;
      }

      // Check duplicates using (Application, Category, Product Name, Make, Model)
      const duplicateKey = `${application.toLowerCase()}|${category.toLowerCase()}|${productName.toLowerCase()}|${make.toLowerCase()}|${model.toLowerCase()}`;

      if (existingSet.has(duplicateKey)) {
        skippedDuplicates++;
        continue;
      }

      // Add to set to prevent duplicate rows within the same uploaded Excel file
      existingSet.add(duplicateKey);

      const buyingPrice = parseFloat(getVal('buying_price')) || 0.0;
      const listPrice = parseFloat(getVal('list_price')) || 0.0;
      const discount = parseInt(getVal('discount')) || 0;

      const calculations = calculateMarginsAndPricing({ buyingPrice, listPrice, discount });

      const dbPayload = mapDataToSnake({
        application,
        category,
        productName,
        make,
        model,
        specification: getVal('specification').toString().trim(),
        uom: getVal('uom').toString().trim() || 'Pcs',
        vendor: getVal('vendor').toString().trim(),
        quotationReceivedMonth: parseDateString(getVal('quotation_received_month').toString()),
        leadTime: getVal('lead_time').toString().trim(),
        remarks: getVal('remarks').toString().trim(),
        buyingPrice,
        listPrice,
        discount,
        salesPrice: calculations.salesPrice,
        salesMargin: calculations.salesMargin,
        buyingPriceUpdatedAt: calculations.buyingPriceUpdatedAt
      });

      rowsToInsert.push(dbPayload);
    }

    // 3. High-Performance Chunked Batch Insert (100 rows per batch)
    const BATCH_SIZE = 100;
    for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
      const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
      const { error: batchErr } = await supabase.from('exapp_totalsolutions').insert(batch);
      
      if (batchErr) {
        console.error('Batch insert error:', batchErr);
      } else {
        savedEntries += batch.length;
      }
    }

    return res.json({
      status: 'success',
      message: `File processed successfully! Added ${savedEntries} new items. Skipped ${skippedDuplicates} duplicate items.`,
      stats: {
        processed: rowsToInsert.length + skippedDuplicates,
        saved: savedEntries,
        skipped: skippedDuplicates
      }
    });
  } catch (error) {
    console.error('File upload parsing error:', error);
    return res.status(500).json({ status: 'error', message: `Failed to process upload sheet: ${error.message}` });
  }
});

// POST upload product image directly
router.post('/upload-image/:id', verifyToken, requirePermission('ratecard:write'), uploadImage.single('product_image'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file selected.' });
  }

  try {
    const { data: items } = await supabase
      .from('exapp_totalsolutions')
      .select('*')
      .eq('id', parseInt(id));

    const item = items && items[0];
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Item not found.' });
    }

    // Clean old image from disk
    if (item.product_image) {
      const oldPath = path.join(__dirname, '..', item.product_image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const imageUrl = `/media/product_images/${req.file.filename}`;

    const { data: updatedRows } = await supabase
      .from('exapp_totalsolutions')
      .update({ product_image: imageUrl })
      .eq('id', parseInt(id))
      .select();

    const updated = mapRowToCamel(updatedRows[0]);

    return res.json({
      status: 'success',
      message: 'Product image updated successfully.',
      imageUrl: updated.productImage
    });
  } catch (error) {
    console.error('Upload product image error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to upload product image.' });
  }
});

export default router;
