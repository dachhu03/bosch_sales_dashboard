import { Router } from 'express';
import supabase from '../utils/supabase.js';
import { verifyToken } from './auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';

const router = Router();

function parseJsonSafe(val) {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return val;
}

// Row Mapper Helpers between Frontend CamelCase and DB SnakeCase
function mapRowToCamel(row) {
  if (!row) return null;
  const totals = parseJsonSafe(row.totals) || {};
  return {
    id: row.id,
    projectName: row.project_name,
    projectLocation: row.project_location,
    quotationNumber: row.quotation_number,
    approach: row.approach || 'si',
    budget: row.budget,
    solutionTitle: row.solution_title,
    preparedBy: row.prepared_by || row.preparedby || totals.preparedBy || 'Sales Member',
    approvalStatus: totals.approvalStatus || row.approval_status || 'Pending',
    hardware: parseJsonSafe(row.hardware),
    software: parseJsonSafe(row.software),
    services: parseJsonSafe(row.services),
    amc: parseJsonSafe(row.amc),
    totals: totals,
    createdAt: row.created_at
  };
}

function mapDataToSnake(data) {
  if (!data) return null;
  const row = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.projectName !== undefined) row.project_name = data.projectName;
  if (data.projectLocation !== undefined) row.project_location = data.projectLocation;
  if (data.quotationNumber !== undefined) row.quotation_number = data.quotationNumber;
  if (data.approach !== undefined) row.approach = data.approach;
  if (data.budget !== undefined) row.budget = data.budget;
  if (data.solutionTitle !== undefined) row.solution_title = data.solutionTitle;
  if (data.hardware !== undefined) row.hardware = data.hardware;
  if (data.software !== undefined) row.software = data.software;
  if (data.services !== undefined) row.services = data.services;
  if (data.amc !== undefined) row.amc = data.amc;
  if (data.totals !== undefined) row.totals = data.totals;
  if (data.createdAt !== undefined) row.created_at = data.createdAt;
  return row;
}

// GET list of all BOQs with metadata
router.get('/list', verifyToken, requirePermission('boq:read'), async (req, res) => {
  try {
    const { data: boqs, error } = await supabase
      .from('exapp_boq')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch BOQ list error:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve BOQs list.' });
    }

    const camelBoqs = (boqs || []).map(b => mapRowToCamel(b));

    return res.json({
      status: 'success',
      data: { boqs: camelBoqs }
    });
  } catch (error) {
    console.error('Fetch BOQ list exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve BOQs list.' });
  }
});

// GET detailed BOQ by ID
router.get('/:id', verifyToken, requirePermission('boq:read'), async (req, res) => {
  const { id } = req.params;

  try {
    const { data: rows, error } = await supabase
      .from('exapp_boq')
      .select('*')
      .eq('id', parseInt(id));

    const boq = rows && rows[0];

    if (error || !boq) {
      return res.status(404).json({ status: 'error', message: 'BOQ quote not found.' });
    }

    return res.json({
      status: 'success',
      data: { boq: mapRowToCamel(boq) }
    });
  } catch (error) {
    console.error('Fetch BOQ details exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch BOQ details.' });
  }
});

// POST save or update BOQ
router.post('/save', verifyToken, requirePermission('boq:write'), async (req, res) => {
  const {
    id,
    project_name,
    project_location,
    quotation_number,
    approach,
    budget,
    solution_title,
    hardware,
    software,
    services,
    amc,
    totals
  } = req.body;

  if (!project_name) {
    return res.status(400).json({ status: 'error', message: 'Project name is required.' });
  }

  try {
    let savedBoq;

    const mergedTotals = {
      ...(totals || {}),
      preparedBy: req.user?.username || 'Sales Member'
    };

    const boqData = mapDataToSnake({
      projectName: project_name,
      projectLocation: project_location || '',
      quotationNumber: quotation_number || '',
      approach: approach || 'si',
      budget: budget || 'standard',
      solutionTitle: solution_title || '',
      hardware: hardware || [],
      software: software || [],
      services: services || [],
      amc: amc || {},
      totals: mergedTotals,
      createdAt: new Date().toISOString()
    });

    if (id) {
      // Update existing BOQ
      const { data: items } = await supabase
        .from('exapp_boq')
        .select('*')
        .eq('id', parseInt(id));

      const exists = items && items[0];
      if (!exists) {
        return res.status(404).json({ status: 'error', message: 'BOQ quote not found for updates.' });
      }

      // Avoid updating created_at on update
      delete boqData.created_at;

      const { data: updatedRows, error: updateErr } = await supabase
        .from('exapp_boq')
        .update(boqData)
        .eq('id', parseInt(id))
        .select();

      if (updateErr) {
        console.error('Update BOQ error:', updateErr);
        return res.status(500).json({ status: 'error', message: 'Failed to update BOQ.' });
      }

      savedBoq = mapRowToCamel(updatedRows[0]);
    } else {
      // Create new BOQ
      const { data: createdRows, error: createErr } = await supabase
        .from('exapp_boq')
        .insert([boqData])
        .select();

      if (createErr) {
        console.error('Create BOQ error:', createErr);
        return res.status(500).json({ status: 'error', message: 'Failed to create BOQ.' });
      }

      savedBoq = mapRowToCamel(createdRows[0]);
    }

    return res.json({
      status: 'success',
      message: 'BOQ saved successfully.',
      data: { id: savedBoq.id }
    });
  } catch (error) {
    console.error('Save BOQ exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to save BOQ quotation.' });
  }
});

// DELETE BOQ quote/solution
router.delete('/:id', verifyToken, requirePermission('boq:write'), async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('exapp_boq')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Delete BOQ error:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to delete BOQ solution.' });
    }

    return res.json({
      status: 'success',
      message: 'BOQ solution deleted successfully.',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Delete BOQ exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete BOQ solution.' });
  }
});

// PATCH update BOQ approval status safely in totals JSONB (Super Admin only)
router.patch('/:id/status', verifyToken, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  const { approval_status } = req.body;

  if (!approval_status) {
    return res.status(400).json({ status: 'error', message: 'Approval status is required.' });
  }

  try {
    const { data: rows, error: fetchErr } = await supabase
      .from('exapp_boq')
      .select('totals')
      .eq('id', parseInt(id));

    if (fetchErr || !rows || !rows.length) {
      return res.status(404).json({ status: 'error', message: 'BOQ solution quote not found.' });
    }

    const currentTotals = parseJsonSafe(rows[0].totals) || {};
    const updatedTotals = { ...currentTotals, approvalStatus: approval_status };

    const { error: updateErr } = await supabase
      .from('exapp_boq')
      .update({ totals: updatedTotals })
      .eq('id', parseInt(id));

    if (updateErr) {
      console.error('Update status error:', updateErr);
      return res.status(500).json({ status: 'error', message: 'Failed to update status.' });
    }

    return res.json({
      status: 'success',
      message: 'Status updated successfully.',
      data: { id: parseInt(id), approvalStatus: approval_status }
    });
  } catch (error) {
    console.error('Update status exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update status.' });
  }
});

export default router;

