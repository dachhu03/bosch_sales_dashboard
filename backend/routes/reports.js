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

// Status Normalization Helper: Maps raw/legacy status strings to Closed, In Review, Rejected
export function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'In Review';
  const statusLower = String(rawStatus).trim().toLowerCase();
  if (statusLower === 'approved' || statusLower === 'closed') {
    return 'Closed';
  }
  if (statusLower === 'rejected') {
    return 'Rejected';
  }
  if (statusLower === 'pending' || statusLower === 'in review' || statusLower === 'in_review') {
    return 'In Review';
  }
  return 'In Review';
}

// Row Mapper for Reports Projection (excluding heavy line items like hardware, software, services, amc)
export function mapRowToSummaryProjection(row) {
  if (!row) return null;
  const totals = parseJsonSafe(row.totals) || {};
  const sales = parseFloat(totals.grandTotalSales || totals.grand_sales_total) || 0;
  const buy = parseFloat(totals.grandTotalBuy || totals.grand_buy_total) || 0;
  const profit = totals.total_profit !== undefined ? parseFloat(totals.total_profit) : (sales - buy);
  const margin = sales > 0 ? parseFloat(((profit / sales) * 100).toFixed(1)) : 0;
  const rawStatus = totals.approvalStatus || row.approval_status || 'In Review';
  const status = normalizeStatus(rawStatus);
  const remarks = totals.reviewRemarks || totals.remarks || totals.notes || '';

  return {
    id: row.id,
    projectName: row.project_name || 'Untitled Project',
    projectLocation: row.project_location || '',
    quotationNumber: row.quotation_number || '',
    approach: row.approach || 'si',
    solutionTitle: row.solution_title || '',
    preparedBy: row.prepared_by || row.preparedby || totals.preparedBy || 'Sales Member',
    status: status,
    rawStatus: rawStatus,
    remarks: remarks,
    salesTotal: sales,
    buyTotal: buy,
    profitTotal: profit,
    marginPercentage: margin,
    createdAt: row.created_at
  };
}

/**
 * GET /api/reports/summary
 * Optimized endpoint returning streamlined quotation projections and pre-aggregated dashboard metrics
 * Excludes heavy line-item arrays (hardware, software, services, amc)
 */
router.get('/summary', verifyToken, requirePermission('reports:read'), async (req, res) => {
  try {
    // Explicit column selection for performance optimization
    const { data: rows, error } = await supabase
      .from('exapp_boq')
      .select('id, project_name, project_location, quotation_number, approach, solution_title, prepared_by, totals, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch reports summary error:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve reports data.' });
    }

    const quotations = (rows || []).map(row => mapRowToSummaryProjection(row));

    // Summary Metrics
    const totalQuotesCount = quotations.length;
    const totalQuotedSales = quotations.reduce((acc, q) => acc + q.salesTotal, 0);
    const totalProfit = quotations.reduce((acc, q) => acc + q.profitTotal, 0);
    const overallMarginPercent = totalQuotedSales > 0 
      ? parseFloat(((totalProfit / totalQuotedSales) * 100).toFixed(1)) 
      : 0;

    const statusCounts = {
      closed: quotations.filter(q => q.status === 'Closed').length,
      inReview: quotations.filter(q => q.status === 'In Review').length,
      rejected: quotations.filter(q => q.status === 'Rejected').length
    };

    return res.json({
      status: 'success',
      data: {
        summaryMetrics: {
          totalQuotesCount,
          totalQuotedSales,
          totalProfit,
          overallMarginPercent,
          statusCounts
        },
        quotations
      }
    });
  } catch (error) {
    console.error('Fetch reports summary exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve reports data.' });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Update quotation status with RBAC permission validation (requires boq:write or super_admin)
 */
router.patch('/:id/status', verifyToken, requirePermission('boq:write'), async (req, res) => {
  const { id } = req.params;
  const { status, approval_status } = req.body;
  const rawTargetStatus = status || approval_status;

  if (!rawTargetStatus) {
    return res.status(400).json({ status: 'error', message: 'Status is required.' });
  }

  const targetStatus = normalizeStatus(rawTargetStatus);

  try {
    const { data: rows, error: fetchErr } = await supabase
      .from('exapp_boq')
      .select('totals')
      .eq('id', parseInt(id));

    if (fetchErr || !rows || !rows.length) {
      return res.status(404).json({ status: 'error', message: 'Quotation not found.' });
    }

    const currentTotals = parseJsonSafe(rows[0].totals) || {};
    const updatedTotals = { 
      ...currentTotals, 
      approvalStatus: targetStatus 
    };

    const { error: updateErr } = await supabase
      .from('exapp_boq')
      .update({ totals: updatedTotals })
      .eq('id', parseInt(id));

    if (updateErr) {
      console.error('Update quotation status error:', updateErr);
      return res.status(500).json({ status: 'error', message: 'Failed to update quotation status.' });
    }

    return res.json({
      status: 'success',
      message: 'Quotation status updated successfully.',
      data: { id: parseInt(id), status: targetStatus }
    });
  } catch (error) {
    console.error('Update quotation status exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update quotation status.' });
  }
});

/**
 * PATCH /api/reports/:id/remarks
 * Update quotation follow-up / rejection notes with RBAC permission validation (requires boq:write or super_admin)
 */
router.patch('/:id/remarks', verifyToken, requirePermission('boq:write'), async (req, res) => {
  const { id } = req.params;
  const { remarks, notes } = req.body;
  const targetRemarks = remarks !== undefined ? remarks : notes;

  if (targetRemarks === undefined) {
    return res.status(400).json({ status: 'error', message: 'Remarks text is required.' });
  }

  try {
    const { data: rows, error: fetchErr } = await supabase
      .from('exapp_boq')
      .select('totals')
      .eq('id', parseInt(id));

    if (fetchErr || !rows || !rows.length) {
      return res.status(404).json({ status: 'error', message: 'Quotation not found.' });
    }

    const currentTotals = parseJsonSafe(rows[0].totals) || {};
    const updatedTotals = { 
      ...currentTotals, 
      remarks: String(targetRemarks).trim() 
    };

    const { error: updateErr } = await supabase
      .from('exapp_boq')
      .update({ totals: updatedTotals })
      .eq('id', parseInt(id));

    if (updateErr) {
      console.error('Update quotation remarks error:', updateErr);
      return res.status(500).json({ status: 'error', message: 'Failed to update quotation remarks.' });
    }

    return res.json({
      status: 'success',
      message: 'Quotation remarks updated successfully.',
      data: { id: parseInt(id), remarks: String(targetRemarks).trim() }
    });
  } catch (error) {
    console.error('Update quotation remarks exception:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update quotation remarks.' });
  }
});

export default router;
