import { Router } from 'express';
import supabase from '../utils/supabase.js';
import { verifyToken } from './auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';
import { sendBoqSaveNotification } from '../services/notificationService.js';

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
    reviewStatus: totals.reviewStatus || 'PENDING_REVIEW',
    reviewRemarks: totals.reviewRemarks || '',
    hardware: parseJsonSafe(row.hardware),
    software: parseJsonSafe(row.software),
    services: parseJsonSafe(row.services),
    amc: parseJsonSafe(row.amc),
    totals: totals,
    createdAt: row.created_at,
    updatedAt: totals.updatedAt || row.created_at
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
    event_id,
    eventId,
    send_notification,
    sendNotification,
    submit_for_review,
    submitForReview,
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

  const targetEventId = event_id || eventId;
  const shouldNotify = Boolean(send_notification || sendNotification || submit_for_review || submitForReview);

  if (!project_name) {
    return res.status(400).json({ status: 'error', message: 'Project name is required.' });
  }

  try {
    let savedBoq;
    const isNew = !id;

    // Determine reviewStatus:
    // If explicitly submitted for review -> 'PENDING_REVIEW'
    // Else if caller provided totals.reviewStatus -> use it
    // Else if updating existing quote -> preserve existing reviewStatus or default to 'DRAFT'
    // Else if new quote -> 'DRAFT'
    let targetReviewStatus = (totals && totals.reviewStatus);
    if (shouldNotify) {
      targetReviewStatus = 'PENDING_REVIEW';
    } else if (!targetReviewStatus) {
      targetReviewStatus = isNew ? 'DRAFT' : undefined;
    }

    let existingRow = null;
    if (id) {
      // Check existing BOQ
      const { data: items } = await supabase
        .from('exapp_boq')
        .select('*')
        .eq('id', parseInt(id));

      existingRow = items && items[0];
      if (!existingRow) {
        return res.status(404).json({ status: 'error', message: 'BOQ quote not found for updates.' });
      }

      if (!targetReviewStatus) {
        const existingTotals = parseJsonSafe(existingRow.totals) || {};
        targetReviewStatus = existingTotals.reviewStatus || 'DRAFT';
      }
    } else {
      if (!targetReviewStatus) {
        targetReviewStatus = 'DRAFT';
      }
    }

    const mergedTotals = {
      ...(totals || {}),
      preparedBy: req.user?.username || (totals && totals.preparedBy) || 'Sales Member',
      reviewStatus: targetReviewStatus,
      updatedAt: new Date().toISOString()
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
      delete boqData.created_at;

      const { data: updatedRows, error: updateErr } = await supabase
        .from('exapp_boq')
        .update(boqData)
        .eq('id', parseInt(id))
        .select();

      if (updateErr) {
        console.error('Update BOQ error:', updateErr);
        return res.status(500).json({ status: 'error', message: `Failed to update BOQ: ${updateErr.message}` });
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
        return res.status(500).json({ status: 'error', message: `Failed to create BOQ: ${createErr.message}` });
      }

      savedBoq = mapRowToCamel(createdRows[0]);
    }

    // Trigger non-blocking Super Admin email notification ONLY if requested
    if (shouldNotify) {
      sendBoqSaveNotification({
        boqId: savedBoq.id,
        boqData: savedBoq,
        isNew: isNew,
        actorName: req.user?.username || 'Sales Member',
        eventId: targetEventId
      }).catch(notifErr => {
        console.warn('[BOQ Route Warning] Non-blocking notification dispatch error:', notifErr?.message || notifErr);
      });
    }

    return res.json({
      status: 'success',
      message: shouldNotify 
        ? 'BOQ quotation saved and submitted for Super Admin review.' 
        : 'BOQ quotation draft saved successfully.',
      data: { 
        id: savedBoq.id,
        event_id: targetEventId || null,
        reviewStatus: savedBoq.reviewStatus,
        notificationSent: shouldNotify
      }
    });
  } catch (error) {
    console.error('Save BOQ exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to save BOQ quotation.' });
  }
});

// POST /boq/:id/submit-review (Explicitly submit an existing BOQ for Super Admin review & trigger email)
router.post('/:id/submit-review', verifyToken, requirePermission('boq:write'), async (req, res) => {
  const { id } = req.params;
  const { event_id, eventId } = req.body || {};
  const targetEventId = event_id || eventId;

  try {
    const { data: rows, error: fetchErr } = await supabase
      .from('exapp_boq')
      .select('*')
      .eq('id', parseInt(id));

    const boq = rows && rows[0];
    if (fetchErr || !boq) {
      return res.status(404).json({ status: 'error', message: 'BOQ quote not found.' });
    }

    const currentTotals = parseJsonSafe(boq.totals) || {};
    const updatedTotals = {
      ...currentTotals,
      reviewStatus: 'PENDING_REVIEW',
      updatedAt: new Date().toISOString()
    };

    const { data: updatedRows, error: updateErr } = await supabase
      .from('exapp_boq')
      .update({ totals: updatedTotals })
      .eq('id', parseInt(id))
      .select();

    if (updateErr) {
      console.error('Submit BOQ review error:', updateErr);
      return res.status(500).json({ status: 'error', message: 'Failed to update BOQ review status.' });
    }

    const updatedBoq = mapRowToCamel(updatedRows[0]);

    // Dispatch notification
    sendBoqSaveNotification({
      boqId: updatedBoq.id,
      boqData: updatedBoq,
      isNew: false,
      actorName: req.user?.username || 'Sales Member',
      eventId: targetEventId
    }).catch(notifErr => {
      console.warn('[BOQ Route Warning] Notification dispatch error:', notifErr?.message || notifErr);
    });

    return res.json({
      status: 'success',
      message: 'BOQ quotation successfully submitted for Super Admin review.',
      data: {
        id: updatedBoq.id,
        reviewStatus: 'PENDING_REVIEW',
        notificationSent: true
      }
    });
  } catch (error) {
    console.error('Submit review exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to submit BOQ for review.' });
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

