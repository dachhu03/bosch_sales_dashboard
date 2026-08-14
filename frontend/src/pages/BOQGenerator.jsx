import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, 
  Send,
  FileDown, 
  FileSpreadsheet,
  Plus, 
  Trash2, 
  Layers, 
  Search,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  FileText,
  Info,
  X,
  FolderOpen,
  RefreshCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../App.jsx';

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
};

export default function BOQGenerator() {
  const location = useLocation();
  const { user, isViewer, hasPermission } = useAuth();
  const canWriteBOQ = (user?.is_superuser === 1 || user?.role === 'super_admin' || (hasPermission && hasPermission('boq:write'))) && !(isViewer ? isViewer() : user?.role === 'viewer');
  const isReadOnly = !canWriteBOQ;

  // Metadata
  const [currentBoqId, setCurrentBoqId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [solutionTitle, setSolutionTitle] = useState('');
  const [approach, setApproach] = useState('si');
  const [budget, setBudget] = useState('standard');
  const [gatesCount, setGatesCount] = useState('');

  // Lists of Items
  const [hardware, setHardware] = useState([]);
  const [software, setSoftware] = useState([]);
  const [services, setServices] = useState([]);

  // AMC
  const [amcPlan, setAmcPlan] = useState('standard');
  const [amcDuration, setAmcDuration] = useState(1);
  const [amcPercentage, setAmcPercentage] = useState(10);
  const [amcNotes, setAmcNotes] = useState('');

  // Global settings overrides
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalMargin, setGlobalMargin] = useState(20);

  // States
  const [savedBoqList, setSavedBoqList] = useState([]);
  const [selectedBoqDropdown, setSelectedBoqDropdown] = useState('');
  const [showSavedBoqDropdown, setShowSavedBoqDropdown] = useState(false);
  const [savedBoqFilter, setSavedBoqFilter] = useState('');
  const [selectedSpecModalItem, setSelectedSpecModalItem] = useState(null);
  const [selectedMakeModelModalItem, setSelectedMakeModelModalItem] = useState(null);
  
  // Saving BOQ UX States
  const [isSavingBOQ, setIsSavingBOQ] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentReviewStatus, setCurrentReviewStatus] = useState('DRAFT');
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedQuoteSummary, setSavedQuoteSummary] = useState(null);
  
  // Search autocompletes
  const [searchQueries, setSearchQueries] = useState({ hardware: '', software: '', service: '' });
  const [searchResults, setSearchResults] = useState({ hardware: [], software: [], service: [] });
  const [activeSearchCategory, setActiveSearchCategory] = useState('');

  // Notifications
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load BOQ list & auto-load state from Reports navigation on mount
  useEffect(() => {
    fetchBoqList();
    if (location.state && location.state.loadBoqId) {
      handleLoadSavedBOQ(location.state.loadBoqId);
    }
  }, [location.state]);

  const fetchBoqList = async () => {
    try {
      const response = await axios.get('/boq/list');
      if (response.data.status === 'success') {
        setSavedBoqList(response.data.data.boqs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Search items from database
  const searchInventory = async (query, category) => {
    setSearchQueries(prev => ({ ...prev, [category]: query }));
    if (!query) {
      setSearchResults(prev => ({ ...prev, [category]: [] }));
      return;
    }

    try {
      const response = await axios.get('/products/search-boq', {
        params: { q: query, category }
      });
      if (response.data.status === 'success') {
        setSearchResults(prev => ({ ...prev, [category]: response.data.results }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Item Calculations
  const calculateItemTotals = (item) => {
    const listPrice = parseFloat(item.listPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const buyPrice = parseFloat(item.buyingPrice) || 0;
    const quantity = parseInt(item.quantity) || 0;

    const salesPrice = Math.max(listPrice - (listPrice * discount / 100), 0);
    const totalBuy = buyPrice * quantity;
    const totalSales = salesPrice * quantity;

    return {
      ...item,
      salesPrice,
      totalBuy,
      totalSales
    };
  };

  // Append product from search result
  const handleAddProductFromSearch = (product, category) => {
    const defaultItem = {
      productId: product.id,
      productName: product.productName,
      category: product.category,
      make: product.make,
      model: product.model,
      specification: product.specification,
      uom: product.uom || 'Nos',
      buyingPrice: product.buyingPrice,
      listPrice: product.listPrice,
      discount: product.discount || 0,
      salesMargin: product.salesMargin || 20,
      quantity: 1
    };

    const enriched = calculateItemTotals(defaultItem);

    if (category === 'hardware') setHardware(prev => [...prev, enriched]);
    if (category === 'software') setSoftware(prev => [...prev, enriched]);
    if (category === 'service') setServices(prev => [...prev, enriched]);

    // Clear search box
    setSearchQueries(prev => ({ ...prev, [category]: '' }));
    setSearchResults(prev => ({ ...prev, [category]: [] }));
    showNotification(`Added "${product.productName}".`);
  };

  // Add custom manual empty row
  const handleAddManualRow = (category) => {
    const manualItem = {
      productName: '',
      category,
      make: '',
      model: '',
      specification: '',
      uom: 'Nos',
      buyingPrice: 0,
      listPrice: 0,
      discount: 0,
      salesMargin: 20,
      quantity: 1
    };

    const enriched = calculateItemTotals(manualItem);

    if (category === 'hardware') setHardware(prev => [...prev, enriched]);
    if (category === 'software') setSoftware(prev => [...prev, enriched]);
    if (category === 'service') setServices(prev => [...prev, enriched]);
  };

  // Update field value on an item in local array
  const handleUpdateItemValue = (index, field, value, category) => {
    const listSetter = (prev) => {
      return prev.map((item, idx) => {
        if (idx === index) {
          let updated = { ...item, [field]: value };
          
          // Automatic margin and pricing calculation like Total Solution table
          if (field === 'buyingPrice' || field === 'listPrice' || field === 'discount') {
            const buyPrice = parseFloat(updated.buyingPrice) || 0;
            let listPrice = parseFloat(updated.listPrice) || 0;
            if (listPrice === 0 && buyPrice > 0) {
              listPrice = buyPrice;
              updated.listPrice = listPrice;
            }
            const discount = parseFloat(updated.discount) || 0;
            const quantity = parseInt(updated.quantity) || 1;

            const salesPrice = Math.max(listPrice - (listPrice * discount / 100), 0);
            const salesMargin = salesPrice > 0 ? Math.round(((salesPrice - buyPrice) / salesPrice) * 100) : 0;
            const totalBuy = buyPrice * quantity;
            const totalSales = salesPrice * quantity;

            return {
              ...updated,
              salesPrice,
              salesMargin,
              totalBuy,
              totalSales
            };
          }
          
          if (field === 'salesMargin') {
            const margin = parseFloat(value) || 0;
            const buyPrice = parseFloat(item.buyingPrice) || 0;
            let listPrice = parseFloat(item.listPrice) || 0;
            const quantity = parseInt(item.quantity) || 1;

            const salesPrice = buyPrice > 0 ? buyPrice * (1 + margin / 100) : listPrice;
            if (listPrice === 0) {
              listPrice = salesPrice;
              updated.listPrice = listPrice;
            }
            const discount = listPrice > 0 ? Math.max(Math.round(((listPrice - salesPrice) / listPrice) * 100), 0) : 0;
            const totalBuy = buyPrice * quantity;
            const totalSales = salesPrice * quantity;

            return {
              ...updated,
              salesPrice,
              discount,
              totalBuy,
              totalSales
            };
          }

          if (field === 'quantity') {
            const qty = parseInt(value) || 1;
            updated.totalBuy = (parseFloat(item.buyingPrice) || 0) * qty;
            updated.totalSales = (parseFloat(item.salesPrice) || 0) * qty;
          }

          return updated;
        }
        return item;
      });
    };

    if (category === 'hardware') setHardware(listSetter);
    if (category === 'software') setSoftware(listSetter);
    if (category === 'service') setServices(listSetter);
  };

  // Remove row item from list
  const handleRemoveRow = (index, category) => {
    if (category === 'hardware') setHardware(prev => prev.filter((_, idx) => idx !== index));
    if (category === 'software') setSoftware(prev => prev.filter((_, idx) => idx !== index));
    if (category === 'service') setServices(prev => prev.filter((_, idx) => idx !== index));
  };

  // Apply global discount & recalculate sales margins automatically for all items
  const handleApplyGlobalDiscount = (discountInput) => {
    const discountVal = Math.min(Math.max(parseInt(discountInput) || 0, 0), 100);
    setGlobalDiscount(discountVal);

    const applyRules = (list) => {
      return list.map(item => {
        const buyPrice = parseFloat(item.buyingPrice) || 0;
        let listPrice = parseFloat(item.listPrice) || 0;
        if (listPrice === 0 && buyPrice > 0) {
          listPrice = buyPrice;
        }
        const quantity = parseInt(item.quantity) || 1;

        const salesPrice = Math.max(listPrice - (listPrice * discountVal / 100), 0.0);
        const salesMargin = salesPrice > 0 ? Math.round(((salesPrice - buyPrice) / salesPrice) * 100) : 0;
        const totalBuy = buyPrice * quantity;
        const totalSales = salesPrice * quantity;

        return {
          ...item,
          listPrice,
          discount: discountVal,
          salesPrice,
          salesMargin,
          totalBuy,
          totalSales
        };
      });
    };

    setHardware(prev => applyRules(prev));
    setSoftware(prev => applyRules(prev));
    setServices(prev => applyRules(prev));
  };

  // Apply global margin & recalculate sales prices & discounts automatically for all items
  const handleApplyGlobalMargin = (marginInput) => {
    const marginVal = Math.min(Math.max(parseInt(marginInput) || 0, 0), 100);
    setGlobalMargin(marginVal);

    const applyMarginRules = (list) => {
      return list.map(item => {
        const buyPrice = parseFloat(item.buyingPrice) || 0;
        let listPrice = parseFloat(item.listPrice) || 0;
        const quantity = parseInt(item.quantity) || 1;

        const salesPrice = buyPrice > 0 ? buyPrice * (1 + marginVal / 100) : listPrice;
        if (listPrice === 0) listPrice = salesPrice;

        const discount = listPrice > 0 ? Math.max(Math.round(((listPrice - salesPrice) / listPrice) * 100), 0) : 0;
        const totalBuy = buyPrice * quantity;
        const totalSales = salesPrice * quantity;

        return {
          ...item,
          listPrice,
          discount,
          salesPrice,
          salesMargin: marginVal,
          totalBuy,
          totalSales
        };
      });
    };

    setHardware(prev => applyMarginRules(prev));
    setSoftware(prev => applyMarginRules(prev));
    setServices(prev => applyMarginRules(prev));
  };

  // Group Sums Math
  const getGroupSum = (list, field) => {
    return list.reduce((acc, curr) => acc + (curr[field] || 0), 0);
  };

  const hardwareBuyTotal = getGroupSum(hardware, 'totalBuy');
  const hardwareSalesTotal = getGroupSum(hardware, 'totalSales');
  const hardwareDiscountAmount = hardware.reduce((acc, curr) => {
    const listTotal = (parseFloat(curr.listPrice) || 0) * (parseInt(curr.quantity) || 0);
    return acc + (listTotal - curr.totalSales);
  }, 0);

  const softwareBuyTotal = getGroupSum(software, 'totalBuy');
  const softwareSalesTotal = getGroupSum(software, 'totalSales');
  const softwareDiscountAmount = software.reduce((acc, curr) => {
    const listTotal = (parseFloat(curr.listPrice) || 0) * (parseInt(curr.quantity) || 0);
    return acc + (listTotal - curr.totalSales);
  }, 0);

  const serviceBuyTotal = getGroupSum(services, 'totalBuy');
  const serviceSalesTotal = getGroupSum(services, 'totalSales');
  const serviceDiscountAmount = services.reduce((acc, curr) => {
    const listTotal = (parseFloat(curr.listPrice) || 0) * (parseInt(curr.quantity) || 0);
    return acc + (listTotal - curr.totalSales);
  }, 0);

  // AMC calculation
  const amcTotal = hardwareSalesTotal * (amcPercentage / 100) * amcDuration;

  // Grand totals
  const grandTotalBuy = hardwareBuyTotal + softwareBuyTotal + serviceBuyTotal;
  const grandTotalSales = hardwareSalesTotal + softwareSalesTotal + serviceSalesTotal + amcTotal;
  const totalProfit = grandTotalSales - grandTotalBuy;
  const totalDiscountGiven = hardwareDiscountAmount + softwareDiscountAmount + serviceDiscountAmount;
  const overallMargin = grandTotalSales > 0 ? Math.round((totalProfit / grandTotalSales) * 100) : 0;

  // Auto-sync overall margin to global margin state
  useEffect(() => {
    setGlobalMargin(overallMargin);
  }, [overallMargin]);

  // Save BOQ to DB (Supports silent Save Draft vs explicit Submit for Review with email trigger)
  const handleSaveBOQ = async ({ submitForReview = false } = {}) => {
    if (!projectName) {
      showNotification('Project Name is required before saving.', 'error');
      return;
    }

    if (submitForReview) {
      setIsSubmittingReview(true);
    } else {
      setIsSavingBOQ(true);
    }

    const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const targetReviewStatus = submitForReview ? 'PENDING_REVIEW' : (currentReviewStatus || 'DRAFT');

    const payload = {
      id: currentBoqId || undefined,
      project_name: projectName,
      project_location: projectLocation,
      quotation_number: quotationNumber,
      approach,
      budget,
      solution_title: solutionTitle,
      hardware,
      software,
      services,
      amc: {
        plan: amcPlan,
        duration: amcDuration,
        percentage: amcPercentage,
        notes: amcNotes
      },
      totals: {
        hardwareBuyTotal,
        hardwareSalesTotal,
        softwareBuyTotal,
        softwareSalesTotal,
        serviceBuyTotal,
        serviceSalesTotal,
        amcTotal,
        grandTotalBuy,
        grandTotalSales,
        totalProfit,
        reviewStatus: targetReviewStatus
      },
      send_notification: submitForReview,
      submit_for_review: submitForReview,
      event_id: eventId
    };

    try {
      const response = await axios.post('/boq/save', payload);
      if (response.data.status === 'success') {
        const savedId = response.data.data.id;
        const returnedReviewStatus = response.data.data.reviewStatus || targetReviewStatus;
        setCurrentBoqId(savedId);
        setCurrentReviewStatus(returnedReviewStatus);
        fetchBoqList();

        setSavedQuoteSummary({
          id: savedId,
          projectName,
          quotationNumber: quotationNumber || 'Generated Quotation',
          projectLocation: projectLocation || 'N/A',
          grandTotalSales,
          itemCount: (hardware?.length || 0) + (software?.length || 0) + (services?.length || 0),
          isSubmitted: submitForReview,
          reviewStatus: returnedReviewStatus
        });

        setShowSaveSuccessModal(true);
        if (submitForReview) {
          showNotification('BOQ Quote submitted for review & email notification sent to Super Admin.');
        } else {
          showNotification('BOQ Quote draft saved successfully to database.');
        }
      }
    } catch (err) {
      console.error('Error saving BOQ quotation:', err);
      if (err.response?.status === 401) {
        showNotification('Authentication session expired or missing token. Please log in again to save.', 'error');
      } else {
        const errorMsg = err.response?.data?.message || 'Error saving BOQ quotation.';
        showNotification(errorMsg, 'error');
      }
    } finally {
      setIsSavingBOQ(false);
      setIsSubmittingReview(false);
    }
  };

  // Load BOQ details from dropdown selection
  const handleLoadSavedBOQ = async (id) => {
    if (!id) {
      // Clear fields
      setCurrentBoqId('');
      setCurrentReviewStatus('DRAFT');
      setProjectName('');
      setProjectLocation('');
      setQuotationNumber('');
      setSolutionTitle('');
      setHardware([]);
      setSoftware([]);
      setServices([]);
      return;
    }

    try {
      const response = await axios.get(`/boq/${id}`);
      if (response.data.status === 'success') {
        const boq = response.data.data.boq;
        
        setCurrentBoqId(boq.id);
        setCurrentReviewStatus(boq.reviewStatus || 'DRAFT');
        setProjectName(boq.projectName || '');
        setProjectLocation(boq.projectLocation || '');
        setQuotationNumber(boq.quotationNumber || '');
        setApproach(boq.approach || 'si');
        setBudget(boq.budget || 'standard');
        setSolutionTitle(boq.solutionTitle || '');
        
        // Parse json elements safely
        const hw = typeof boq.hardware === 'string' ? JSON.parse(boq.hardware) : boq.hardware;
        const sw = typeof boq.software === 'string' ? JSON.parse(boq.software) : boq.software;
        const svc = typeof boq.services === 'string' ? JSON.parse(boq.services) : boq.services;
        const amcData = typeof boq.amc === 'string' ? JSON.parse(boq.amc) : boq.amc;

        setHardware(hw || []);
        setSoftware(sw || []);
        setServices(svc || []);

        if (amcData) {
          setAmcPlan(amcData.plan || 'standard');
          setAmcDuration(amcData.duration || 1);
          setAmcPercentage(amcData.percentage || 10);
          setAmcNotes(amcData.notes || '');
        }

        setSelectedBoqDropdown(id);
        showNotification('Quotation loaded successfully.');
      }
    } catch (err) {
      showNotification('Failed to retrieve quote details.', 'error');
    }
  };

  // Client-ready Excel spreadsheet exporter via ExcelJS (with SheetJS fallback)
  const handleDownloadCSV = async () => {
    try {
      showNotification('Preparing client-ready Excel spreadsheet...');

      // Load ExcelJS dynamically if not available
      if (!window.ExcelJS) {
        await loadScript('https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js');
      }

      if (window.ExcelJS) {
        const workbook = new window.ExcelJS.Workbook();
        workbook.creator = 'Bosch Building Technologies';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('BOQ Quotation', {
          views: [{ showGridLines: true }]
        });

        // Color Palette
        const HEADER_YELLOW = 'FFFFC000'; // Modern client-ready Yellow header background
        const BRAND_BLUE = 'FF005691';    // Bosch Corporate Blue
        const SLATE_DARK = 'FF0F172A';
        const LIGHT_SECTION = 'FFF1F5F9';

        // 1. Title Banner
        sheet.mergeCells('A1:L1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'BOSCH BUILDING TECHNOLOGIES — COMMERCIAL BOQ QUOTATION';
        titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        sheet.getRow(1).height = 34;

        // Sub-banner
        sheet.mergeCells('A2:L2');
        const subCell = sheet.getCell('A2');
        subCell.value = `Pre-Sales Commercial Proposal  |  Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
        subCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FFE2E8F0' } };
        subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
        subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        sheet.getRow(2).height = 18;

        sheet.getRow(3).height = 10; // spacing

        // 2. Project Information Card
        const projectInfoFields = [
          ['Project Name:', projectName || 'N/A', 'Quotation #:', quotationNumber || 'N/A'],
          ['Location:', projectLocation || 'N/A', 'Date:', new Date().toLocaleDateString('en-IN')],
          ['Solution Title:', solutionTitle || 'N/A', 'Approach Mode:', `${approach.toUpperCase()} (${budget.toUpperCase()})`]
        ];

        projectInfoFields.forEach((infoRow, idx) => {
          const rNum = 4 + idx;
          sheet.getRow(rNum).height = 20;

          // Label 1
          const cLabel1 = sheet.getCell(`A${rNum}`);
          cLabel1.value = infoRow[0];
          cLabel1.font = { name: 'Calibri', size: 10, bold: true, color: { argb: SLATE_DARK } };

          // Value 1
          sheet.mergeCells(`B${rNum}:E${rNum}`);
          const cVal1 = sheet.getCell(`B${rNum}`);
          cVal1.value = infoRow[1];
          cVal1.font = { name: 'Calibri', size: 10, color: { argb: SLATE_DARK } };

          // Label 2
          const cLabel2 = sheet.getCell(`G${rNum}`);
          cLabel2.value = infoRow[2];
          cLabel2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: SLATE_DARK } };

          // Value 2
          sheet.mergeCells(`H${rNum}:L${rNum}`);
          const cVal2 = sheet.getCell(`H${rNum}`);
          cVal2.value = infoRow[3];
          cVal2.font = { name: 'Calibri', size: 10, color: { argb: SLATE_DARK } };
        });

        sheet.getRow(7).height = 12; // spacing

        let currRow = 8;
        const tableHeaders = ['S.No', 'Item Description', 'Make', 'Model / Version', 'Technical Specification', 'UOM', 'Qty', 'Buy Price (₹)', 'List Price (₹)', 'Discount (%)', 'Sales Cost (₹)', 'Total Cost (₹)'];

        const renderSection = (sectionTitle, items) => {
          if (!items || items.length === 0) return;

          // Section Header Row
          sheet.mergeCells(`A${currRow}:L${currRow}`);
          const secCell = sheet.getCell(`A${currRow}`);
          secCell.value = sectionTitle.toUpperCase();
          secCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BRAND_BLUE } };
          secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_SECTION } };
          secCell.alignment = { vertical: 'middle', indent: 1 };
          sheet.getRow(currRow).height = 24;
          currRow++;

          // Yellow Table Header Row
          const headerRow = sheet.getRow(currRow);
          headerRow.height = 26;
          tableHeaders.forEach((th, idx) => {
            const cell = headerRow.getCell(idx + 1);
            cell.value = th;
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_YELLOW } };
            cell.alignment = { 
              vertical: 'middle', 
              horizontal: idx === 0 || idx === 5 || idx === 6 || idx === 9 ? 'center' : (idx >= 7 ? 'right' : 'left'),
              wrapText: true 
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFB8860B' } },
              bottom: { style: 'medium', color: { argb: 'FFB8860B' } },
              left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          });
          currRow++;

          // Items Data Rows
          let sectionTotalCost = 0;
          items.forEach((item, itemIdx) => {
            const dataRow = sheet.getRow(currRow);
            dataRow.height = 22;

            const salesPrice = Number(item.salesPrice || 0);
            const totalSales = Number(item.totalSales || 0);
            sectionTotalCost += totalSales;

            const rowData = [
              itemIdx + 1,
              item.productName || 'Custom Item',
              item.make || '',
              item.model || '',
              item.specification || '',
              item.uom || 'Nos',
              Number(item.quantity || 1),
              Number(item.buyingPrice || 0),
              Number(item.listPrice || 0),
              Number(item.discount || 0) / 100, // percentage decimal format
              salesPrice,
              totalSales
            ];

            rowData.forEach((val, idx) => {
              const cell = dataRow.getCell(idx + 1);
              cell.value = val;
              cell.font = { name: 'Calibri', size: 9.5, color: { argb: SLATE_DARK } };

              // Formatting & Alignment
              if (idx === 0 || idx === 5) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
              } else if (idx === 6) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.numFmt = '#,##0';
              } else if (idx === 9) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.numFmt = '0%';
              } else if (idx === 7 || idx === 8 || idx === 10 || idx === 11) {
                cell.alignment = { vertical: 'middle', horizontal: 'right' };
                cell.numFmt = '₹#,##0.00';
              } else {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
              }

              cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFF1F5F9' } },
                right: { style: 'thin', color: { argb: 'FFF1F5F9' } }
              };
            });

            currRow++;
          });

          // Section Subtotal Row
          const subtotalRow = sheet.getRow(currRow);
          subtotalRow.height = 24;
          sheet.mergeCells(`A${currRow}:K${currRow}`);
          const labelCell = sheet.getCell(`A${currRow}`);
          labelCell.value = `${sectionTitle} Subtotal:`;
          labelCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BRAND_BLUE } };
          labelCell.alignment = { vertical: 'middle', horizontal: 'right' };

          const valCell = subtotalRow.getCell(12);
          valCell.value = sectionTotalCost;
          valCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BRAND_BLUE } };
          valCell.numFmt = '₹#,##0.00';
          valCell.alignment = { vertical: 'middle', horizontal: 'right' };
          valCell.border = {
            top: { style: 'thin', color: { argb: BRAND_BLUE } },
            bottom: { style: 'double', color: { argb: BRAND_BLUE } }
          };

          currRow += 2; // Spacer
        };

        renderSection('1. Hardware Components', hardware);
        renderSection('2. Software Licenses & Modules', software);
        renderSection('3. Deployment & Installation Services', services);

        // 4. Commercial Summary Box
        sheet.mergeCells(`A${currRow}:L${currRow}`);
        const sumHeader = sheet.getCell(`A${currRow}`);
        sumHeader.value = 'COMMERCIAL SUMMARY BREAKDOWN';
        sumHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_BLUE } };
        sumHeader.alignment = { vertical: 'middle', indent: 1 };
        sheet.getRow(currRow).height = 24;
        currRow++;

        const summaryItems = [
          ['Hardware Components Total Cost:', hardwareSalesTotal],
          ['Software Licenses Total Cost:', softwareSalesTotal],
          ['Deployment & Services Total Cost:', serviceSalesTotal],
          [`AMC Plan Total (${amcPlan.toUpperCase()} - ${amcDuration} Yrs @ ${amcPercentage}%):`, amcTotal],
          ['Total Discount Savings Provided:', totalDiscountGiven],
          ['GRAND TOTAL QUOTATION:', grandTotalSales]
        ];

        summaryItems.forEach((sItem, idx) => {
          const isGrand = idx === summaryItems.length - 1;
          const sRow = sheet.getRow(currRow);
          sRow.height = isGrand ? 26 : 22;

          sheet.mergeCells(`A${currRow}:J${currRow}`);
          const lbl = sheet.getCell(`A${currRow}`);
          lbl.value = sItem[0];

          lbl.font = {
            name: 'Calibri',
            size: isGrand ? 11 : 10,
            bold: isGrand || idx === 3,
            color: { argb: isGrand ? 'FF000000' : (idx === 4 ? 'FFE11D48' : SLATE_DARK) }
          };
          lbl.alignment = { vertical: 'middle', horizontal: 'right' };

          sheet.mergeCells(`K${currRow}:L${currRow}`);
          const val = sheet.getCell(`K${currRow}`);
          val.value = Number(sItem[1] || 0);
          val.numFmt = '₹#,##0.00';
          val.font = {
            name: 'Calibri',
            size: isGrand ? 12 : 10,
            bold: isGrand || idx === 3,
            color: { argb: isGrand ? 'FF000000' : (idx === 4 ? 'FFE11D48' : SLATE_DARK) }
          };
          val.alignment = { vertical: 'middle', horizontal: 'right' };

          if (isGrand) {
            lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_YELLOW } };
            val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_YELLOW } };
            lbl.border = { top: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'double', color: { argb: 'FF000000' } } };
            val.border = { top: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'double', color: { argb: 'FF000000' } } };
          }

          currRow++;
        });

        // 5. Auto Column Width Sizing
        const minWidths = [8, 32, 18, 20, 36, 10, 10, 16, 16, 14, 16, 18];
        sheet.columns.forEach((column, colIdx) => {
          let maxLen = minWidths[colIdx] || 12;
          sheet.eachRow({ includeEmpty: false }, (row, rNum) => {
            if (rNum > 3) {
              const val = row.getCell(colIdx + 1).value;
              if (val) {
                const str = val.toString();
                if (str.length > maxLen && str.length < 50) {
                  maxLen = str.length;
                }
              }
            }
          });
          column.width = Math.min(maxLen + 3, 50);
        });

        // Generate file buffer and trigger download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '_') || 'Quotation'}_Commercial_BOQ.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showNotification('Client-ready Excel spreadsheet downloaded successfully!');
        return;
      }

      // Fallback: SheetJS if ExcelJS is unavailable
      if (!window.XLSX) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      }
      if (window.XLSX) {
        const wb = window.XLSX.utils.book_new();
        const flattenGroup = (list, title) => list.map(item => ({
          'Section': title,
          'Product/Service': item.productName || 'Custom',
          'Make': item.make || '',
          'Model/Version': item.model || '',
          'UOM': item.uom || '',
          'Quantity': item.quantity,
          'Unit Buy (₹)': item.buyingPrice,
          'Unit List (₹)': item.listPrice,
          'Discount (%)': item.discount,
          'Unit Sales Cost (₹)': item.salesPrice,
          'Total Buy (₹)': item.totalBuy,
          'Total Cost (₹)': item.totalSales
        }));
        const combined = [...flattenGroup(hardware, 'Hardware'), ...flattenGroup(software, 'Software'), ...flattenGroup(services, 'Services')];
        const ws = window.XLSX.utils.json_to_sheet(combined);
        window.XLSX.utils.book_append_sheet(wb, ws, "BOQ Quotation");
        window.XLSX.writeFile(wb, `${projectName.replace(/\s+/g, '_') || 'Quotation'}_BOQ.xlsx`);
        showNotification('Spreadsheet downloaded.');
      }
    } catch (err) {
      showNotification('Failed to download Excel sheet: ' + err.message, 'error');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!window.jspdf) {
        showNotification('Loading PDF exporter...');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }
      if (!window.jspdf?.jsPDF?.API?.autoTable) {
        showNotification('Initializing table engines...');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js');
      }

      const jspdfModule = window.jspdf;
      if (!jspdfModule) {
        showNotification('PDF Exporter utility not loaded.', 'error');
        return;
      }

      const doc = new jspdfModule.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const formatINR = (val) => 'Rs. ' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // 1. Bosch Brand Supergraphic Header Generator
      const renderBoschHeader = (pageNumber) => {
        // Supergraphic 7-Color Spectrum Bar (Bosch Red, Magenta, Violet, Deep Blue, Cyan, Green, Yellow)
        const supergraphicColors = [
          [226, 0, 21],   // Bosch Red
          [185, 0, 102],  // Bosch Magenta
          [118, 36, 108], // Bosch Violet
          [0, 86, 145],   // Bosch Deep Blue
          [0, 142, 207],  // Bosch Cyan
          [0, 150, 64],   // Bosch Green
          [255, 204, 0]   // Bosch Yellow
        ];
        const segWidth = pageWidth / supergraphicColors.length;
        supergraphicColors.forEach((color, idx) => {
          doc.setFillColor(color[0], color[1], color[2]);
          doc.rect(idx * segWidth, 0, segWidth + 0.5, 3.5, 'F');
        });

        // Dark Slate Header Banner Body
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 3.5, pageWidth, 26.5, 'F');

        // Bottom Bosch Red Accent Line
        doc.setFillColor(226, 0, 21);
        doc.rect(0, 30, pageWidth, 1.5, 'F');

        // Header Text - Left Branding
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.text("BOSCH", 14, 15);

        doc.setFontSize(8.5);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text("Bosch Building Technologies  |  Pre-sales CRM", 14, 23);

        // Header Text - Right Document Info
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text("COMMERCIAL QUOTATION", pageWidth - 14, 15, { align: "right" });
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225);
        doc.text(`Ref: ${quotationNumber || 'BOSCH/QUO/' + new Date().getFullYear()}`, pageWidth - 14, 23, { align: "right" });
      };

      // Draw initial page header
      renderBoschHeader(1);

      let currentY = 36;

      // 2. Project Metadata Card Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(14, currentY, pageWidth - 28, 30, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(14, currentY, pageWidth - 28, 30, 'D');

      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(71, 85, 105); // slate-600

      doc.text("PROJECT INFORMATION", 18, currentY + 6);
      doc.text("QUOTATION DETAILS", 115, currentY + 6);

      doc.setDrawColor(203, 213, 225);
      doc.line(18, currentY + 8, 95, currentY + 8);
      doc.line(115, currentY + 8, 192, currentY + 8);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(30, 41, 59); // slate-800

      doc.text(`Project Name: ${projectName || 'N/A'}`, 18, currentY + 14);
      doc.text(`Location: ${projectLocation || 'N/A'}`, 18, currentY + 19);
      doc.text(`Solution Title: ${solutionTitle || 'N/A'}`, 18, currentY + 24);

      doc.text(`Quotation #: ${quotationNumber || 'N/A'}`, 115, currentY + 14);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 115, currentY + 19);
      doc.text(`Approach / Model: ${approach.toUpperCase()} (${budget.toUpperCase()})`, 115, currentY + 24);

      currentY += 36;

      // 3. Section Tables
      const drawSectionTable = (title, list, includeSpec = true) => {
        if (!list || list.length === 0) return;

        // Orphan Header Prevention: Move to next page if remaining space is insufficient for header + product rows
        if (currentY > pageHeight - 45) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 86, 145);
        doc.text(title, 14, currentY);
        currentY += 4;

        const tableHead = includeSpec 
          ? [['SL NO', 'Item Description', 'Make / Model', 'Technical Specification', 'UOM', 'Qty', 'Sales Cost', 'Total Cost']]
          : [['SL NO', 'Item Description', 'Make / Model', 'UOM', 'Qty', 'Sales Cost', 'Total Cost']];

        const tableBody = list.map((item, idx) => {
          const makeModel = `${item.make || ''} ${item.model || ''}`.trim() || 'N/A';
          if (includeSpec) {
            return [
              idx + 1,
              item.productName || 'Custom Item',
              makeModel,
              item.specification || 'N/A',
              item.uom || 'Nos',
              item.quantity || 1,
              formatINR(item.salesPrice),
              formatINR(item.totalSales)
            ];
          } else {
            return [
              idx + 1,
              item.productName || 'Custom Item',
              makeModel,
              item.uom || 'Nos',
              item.quantity || 1,
              formatINR(item.salesPrice),
              formatINR(item.totalSales)
            ];
          }
        });

        const columnStyles = includeSpec ? {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 36, halign: 'left' },
          2: { cellWidth: 26, halign: 'left' },
          3: { cellWidth: 36, halign: 'left' },
          4: { cellWidth: 10, halign: 'center' },
          5: { cellWidth: 10, halign: 'center' },
          6: { cellWidth: 24, halign: 'right' },
          7: { cellWidth: 28, halign: 'right' }
        } : {
          0: { cellWidth: 14, halign: 'center' },
          1: { cellWidth: 52, halign: 'left' },
          2: { cellWidth: 36, halign: 'left' },
          3: { cellWidth: 14, halign: 'center' },
          4: { cellWidth: 14, halign: 'center' },
          5: { cellWidth: 24, halign: 'right' },
          6: { cellWidth: 28, halign: 'right' }
        };

        doc.autoTable({
          startY: currentY,
          head: tableHead,
          body: tableBody,
          theme: 'grid',
          showHead: 'firstPage',
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
          columnStyles,
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            currentY = data.cursor.y;
          }
        });

        currentY = doc.lastAutoTable.finalY + 8;
      };

      drawSectionTable('1. HARDWARE COMPONENTS', hardware, true);
      drawSectionTable('2. SOFTWARE LICENSES & MODULES', software, true);
      drawSectionTable('3. INSTALLATION & DEPLOYMENT SERVICES', services, false);

      // 4. Commercial Summary Box
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, 40, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, currentY, pageWidth - 28, 40, 'D');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "bold");
      doc.text("COMMERCIAL SUMMARY BREAKDOWN", 18, currentY + 7);

      doc.setFontSize(8.5);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(51, 65, 85);

      doc.text(`Hardware Components Total:`, 18, currentY + 16);
      doc.text(formatINR(hardwareSalesTotal), 90, currentY + 16, { align: 'right' });

      doc.text(`Software Licenses Total:`, 18, currentY + 22);
      doc.text(formatINR(softwareSalesTotal), 90, currentY + 22, { align: 'right' });

      doc.text(`Deployment & Services Total:`, 18, currentY + 28);
      doc.text(formatINR(serviceSalesTotal), 90, currentY + 28, { align: 'right' });

      doc.text(`AMC Plan (${amcPlan.toUpperCase()} - ${amcDuration} Yrs):`, 105, currentY + 16);
      doc.text(formatINR(amcTotal), 188, currentY + 16, { align: 'right' });

      doc.text(`Discount Savings Provided:`, 105, currentY + 22);
      doc.text(formatINR(totalDiscountGiven), 188, currentY + 22, { align: 'right' });

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(0, 86, 145);
      doc.setFontSize(10);
      doc.text(`GRAND TOTAL QUOTATION:`, 105, currentY + 32);
      doc.text(formatINR(grandTotalSales), 188, currentY + 32, { align: 'right' });

      currentY += 46;

      // 5. Terms & Signature Block
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("TERMS & CONDITIONS", 14, currentY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("1. Validity: This quotation is valid for 30 calendar days from the date of issuance.", 14, currentY + 5);
      doc.text("2. Taxes: GST and applicable statutory duties extra as per government regulations.", 14, currentY + 10);
      doc.text("3. Payment Terms: 50% advance along with Purchase Order, balance prior to shipment.", 14, currentY + 15);

      // Signature lines
      doc.setDrawColor(203, 213, 225);
      doc.line(140, currentY + 25, 192, currentY + 25);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text("Authorized Signatory & Seal", 140, currentY + 30);
      doc.setFont("Helvetica", "normal");
      doc.text("Bosch Building Technologies", 140, currentY + 34);

      // 6. Multi-page Footer & Running Header Loop
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Minimal subtle running header for pages 2 and beyond
        if (i > 1) {
          doc.setFontSize(7.5);
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text("Bosch Building Technologies  |  Commercial Quotation", 14, 10);
          doc.setDrawColor(226, 232, 240);
          doc.line(14, 12, pageWidth - 14, 12);
        }

        // Footer across all pages
        doc.setFontSize(7.5);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(148, 163, 184); // slate-400

        doc.text("Confidential — Bosch Building Technologies — Official Pre-sales Commercial Proposal", 14, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: "right" });
      }

      doc.save(`${projectName.replace(/\s+/g, '_') || 'Quote'}_Bosch_Commercial_BOQ.pdf`);
      showNotification('Official Client PDF downloaded successfully.');
    } catch (err) {
      showNotification('Failed to generate PDF: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-bosch-blue" />
            BOQ Generator
          </h2>
          <p className="text-sm text-slate-400">Generate pricing sheets, manage discounts, and export quotes.</p>
        </div>

        {/* Custom Saved BOQs Loader Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setShowSavedBoqDropdown(prev => !prev)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-xl focus:outline-none text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 shadow-sm min-w-[210px] justify-between transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <FolderOpen className="w-4 h-4 text-bosch-blue dark:text-bosch-accent flex-shrink-0" />
              <span className="truncate">
                {currentBoqId ? (projectName || 'Active BOQ Quote') : 'Select Saved Quote'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </motion.button>

          {showSavedBoqDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-3 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Search saved quotes..."
                  value={savedBoqFilter}
                  onChange={e => setSavedBoqFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-bosch-blue focus:outline-none"
                />
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleLoadSavedBOQ('');
                    setShowSavedBoqDropdown(false);
                    setSavedBoqFilter('');
                  }}
                  className="w-full p-2.5 text-left text-xs font-bold text-bosch-blue hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Start New Blank BOQ's
                </button>

                {savedBoqList
                  .filter(b => (b.projectName || '').toLowerCase().includes(savedBoqFilter.toLowerCase()) || (b.quotationNumber || '').toLowerCase().includes(savedBoqFilter.toLowerCase()))
                  .map(boq => (
                    <div
                      key={boq.id}
                      onClick={() => {
                        handleLoadSavedBOQ(boq.id);
                        setShowSavedBoqDropdown(false);
                        setSavedBoqFilter('');
                      }}
                      className={`p-2.5 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors ${currentBoqId === boq.id ? 'bg-bosch-blue/5 border-l-2 border-bosch-blue' : ''}`}
                    >
                      <p className="text-xs font-bold text-slate-800 truncate">{boq.projectName || 'Untitled Quote'}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{boq.quotationNumber || 'No Quote #'}</span>
                        <span className="font-semibold text-slate-500">{boq.projectLocation || ''}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-xs font-medium">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl text-xs font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quote Metadata Cards */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Project Name</label>
            <input type="text" disabled={isReadOnly} value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Bangalore smart park" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Project Location</label>
            <input type="text" disabled={isReadOnly} value={projectLocation} onChange={e => setProjectLocation(e.target.value)} placeholder="e.g. Karnataka, India" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Quotation Number</label>
            <input type="text" disabled={isReadOnly} value={quotationNumber} onChange={e => setQuotationNumber(e.target.value)} placeholder="e.g. BOSCH/2026/089" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Solution Title</label>
            <input type="text" disabled={isReadOnly} value={solutionTitle} onChange={e => setSolutionTitle(e.target.value)} placeholder="e.g. PMS smart gate automation" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Approach Model</label>
            <select disabled={isReadOnly} value={approach} onChange={e => setApproach(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold text-slate-600 disabled:opacity-75 disabled:cursor-not-allowed">
              <option value="si">System Integrator (SI)</option>
              <option value="direct">Direct Purchase</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Budget Category</label>
            <select disabled={isReadOnly} value={budget} onChange={e => setBudget(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold text-slate-600 disabled:opacity-75 disabled:cursor-not-allowed">
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        {/* Global override bar */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <span className="w-1.5 h-4 bg-bosch-blue rounded-full" />
            Global Discount & Margin:
          </div>

          <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Global Discount:</span>
              <input 
                type="number" 
                min="0" 
                max="100" 
                disabled={isReadOnly}
                value={globalDiscount} 
                onChange={e => handleApplyGlobalDiscount(e.target.value)} 
                className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-center focus:border-bosch-blue focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed" 
              />
              <span className="text-xs font-semibold text-slate-400">%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Global Margin:</span>
              <input 
                type="number" 
                min="0" 
                max="100" 
                disabled={isReadOnly}
                value={globalMargin} 
                onChange={e => handleApplyGlobalMargin(e.target.value)} 
                className="w-16 px-2 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold text-center focus:border-emerald-500 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed" 
              />
              <span className="text-xs font-semibold text-slate-400">%</span>
            </div>
            {canWriteBOQ && (
              <button 
                type="button" 
                onClick={() => { handleApplyGlobalDiscount(globalDiscount); showNotification('Applied global settings across all items.'); }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all"
              >
                Apply to All Items
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main product lists */}
      {['hardware', 'software', 'service'].map((cat) => (
        <div key={cat} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800 tracking-tight capitalize">{cat} List</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded capitalize">{cat}</span>
          </div>

          {/* Autocomplete Search input */}
          {canWriteBOQ && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${cat} database...`}
                value={searchQueries[cat]}
                onChange={(e) => searchInventory(e.target.value, cat)}
                onFocus={() => setActiveSearchCategory(cat)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-xs font-semibold"
              />

              {/* Results popup */}
              {activeSearchCategory === cat && searchResults[cat].length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {searchResults[cat].map(prod => (
                    <div 
                      key={prod.id}
                      onClick={() => handleAddProductFromSearch(prod, cat)}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs font-medium"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{prod.productName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Make: {prod.make || 'NAN'} | Model: {prod.model || 'NAN'}</p>
                      </div>
                      <span className="text-bosch-blue font-bold">₹{prod.listPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items lists Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-medium text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-3 py-2">Item Description</th>
                  <th className="px-3 py-2">Make</th>
                  <th className="px-3 py-2">Model</th>
                  {cat !== 'service' && <th className="px-3 py-2">Specification</th>}
                  <th className="px-3 py-2">UOM</th>
                  <th className="px-3 py-2 w-20">Qty</th>
                  <th className="px-3 py-2 w-28">Buy Price</th>
                  <th className="px-3 py-2 w-28">List Price</th>
                  <th className="px-3 py-2 w-16">Discount</th>
                  <th className="px-3 py-2 w-28">Sales Cost</th>
                  <th className="px-3 py-2 w-16">Margin</th>
                  <th className="px-3 py-2 w-28">Total Cost</th>
                  <th className="px-3 py-2 text-center w-10">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {((cat === 'hardware' ? hardware : cat === 'software' ? software : services) || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40">
                    <td className="px-3 py-2 font-semibold text-slate-900 min-w-[140px]">
                      <input type="text" disabled={isReadOnly} value={item.productName} onChange={e => handleUpdateItemValue(idx, 'productName', e.target.value, cat)} className="w-full bg-transparent border-0 border-b border-transparent focus:border-slate-300 focus:outline-none font-semibold text-slate-900 disabled:cursor-default" />
                    </td>
                    <td className="px-3 py-2 cursor-pointer hover:bg-slate-100/60 transition-colors" title="Click to view Make details" onClick={() => setSelectedMakeModelModalItem({ ...item, itemIdx: idx, itemCat: cat })}>
                      <span className="font-semibold text-slate-800 hover:text-bosch-blue">{item.make || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2 cursor-pointer hover:bg-slate-100/60 transition-colors" title="Click to view Model details" onClick={() => setSelectedMakeModelModalItem({ ...item, itemIdx: idx, itemCat: cat })}>
                      <span className="font-semibold text-slate-800 hover:text-bosch-blue">{item.model || 'N/A'}</span>
                    </td>
                    {cat !== 'service' && (
                      <td className="px-3 py-2 cursor-pointer hover:bg-slate-100/60 transition-colors max-w-[180px]" title="Click cell to view & edit specification details" onClick={() => setSelectedSpecModalItem({ ...item, itemIdx: idx, itemCat: cat })}>
                        <div className="truncate text-slate-600 font-medium hover:text-bosch-blue">
                          {item.specification || <span className="text-slate-300 italic">Click to view/add spec</span>}
                        </div>
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <input type="text" disabled={isReadOnly} value={item.uom} onChange={e => handleUpdateItemValue(idx, 'uom', e.target.value, cat)} className="w-full bg-transparent border-0 border-b border-transparent focus:border-slate-300 focus:outline-none w-12 disabled:cursor-default" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="1" disabled={isReadOnly} value={item.quantity} onChange={e => handleUpdateItemValue(idx, 'quantity', parseInt(e.target.value) || 1, cat)} className="w-16 px-1.5 py-1 border border-slate-200 rounded-lg text-center disabled:opacity-75 disabled:cursor-default" />
                    </td>
                    <td className="px-3 py-2 font-mono">
                      <input type="number" step="0.01" min="0" disabled={isReadOnly} value={item.buyingPrice} onChange={e => handleUpdateItemValue(idx, 'buyingPrice', parseFloat(e.target.value) || 0, cat)} className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-right disabled:opacity-75 disabled:cursor-default" />
                    </td>
                    <td className="px-3 py-2 font-mono">
                      <input type="number" step="0.01" min="0" disabled={isReadOnly} value={item.listPrice} onChange={e => handleUpdateItemValue(idx, 'listPrice', parseFloat(e.target.value) || 0, cat)} className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-right disabled:opacity-75 disabled:cursor-default" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" max="100" disabled={isReadOnly} value={item.discount} onChange={e => handleUpdateItemValue(idx, 'discount', parseInt(e.target.value) || 0, cat)} className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-center font-bold text-slate-800 disabled:opacity-75 disabled:cursor-default" />
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-800 font-mono">
                      ₹{item.salesPrice?.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" max="100" disabled={isReadOnly} value={item.salesMargin} onChange={e => handleUpdateItemValue(idx, 'salesMargin', parseInt(e.target.value) || 0, cat)} className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-center font-semibold text-emerald-600 disabled:opacity-75 disabled:cursor-default" />
                    </td>
                    <td className="px-3 py-2 font-bold text-bosch-blue font-mono">
                      ₹{item.totalSales?.toFixed(2)}
                    </td>
                    {canWriteBOQ && (
                      <td className="px-3 py-2 text-center">
                        <button 
                          onClick={() => handleRemoveRow(idx, cat)}
                          className="p-1 hover:text-rose-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canWriteBOQ && (
            <button 
              type="button" 
              onClick={() => handleAddManualRow(cat)}
              className="px-4 py-2 border border-dashed border-slate-200 hover:border-bosch-blue hover:text-bosch-blue rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add custom {cat} item
            </button>
          )}
        </div>
      ))}

      {/* AMC Configuration */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium space-y-4">
        <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2 border-b pb-3 mb-4">
          <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          Annual Maintenance Contract (AMC)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">AMC Tier Plan</label>
            <select disabled={isReadOnly} value={amcPlan} onChange={e => setAmcPlan(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold text-slate-600 disabled:opacity-75 disabled:cursor-not-allowed">
              <option value="standard">Standard Support (8x5)</option>
              <option value="enhanced">Enhanced Support (12x6)</option>
              <option value="premium">Premium Support (24x7)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Duration (Years)</label>
            <input type="number" min="1" max="5" disabled={isReadOnly} value={amcDuration} onChange={e => setAmcDuration(parseInt(e.target.value) || 1)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">AMC Cost Percentage (% of Hardware Sales)</label>
            <input type="number" min="0" max="100" disabled={isReadOnly} value={amcPercentage} onChange={e => setAmcPercentage(parseInt(e.target.value) || 0)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">AMC Service Notes</label>
          <textarea rows="2.5" disabled={isReadOnly} value={amcNotes} onChange={e => setAmcNotes(e.target.value)} placeholder="Type specific details, SLAs, or service exceptions..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-bosch-blue focus:bg-white focus:outline-none text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed" />
        </div>
      </div>

      {/* Cost Summary & Exports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sum details column */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium lg:col-span-2 space-y-3">
          <h4 className="font-bold text-slate-800 tracking-tight border-b pb-2 mb-4">Pricing Totals summary</h4>
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
            <p>Hardware Cost (Sales):</p>
            <p className="text-right font-bold text-slate-800">₹{hardwareSalesTotal.toFixed(2)}</p>

            <p>Software Cost (Sales):</p>
            <p className="text-right font-bold text-slate-800">₹{softwareSalesTotal.toFixed(2)}</p>

            <p>Services Cost (Sales):</p>
            <p className="text-right font-bold text-slate-800">₹{serviceSalesTotal.toFixed(2)}</p>

            <p className="border-t pt-2">AMC Cost (Sales):</p>
            <p className="border-t pt-2 text-right font-bold text-slate-800">₹{amcTotal.toFixed(2)}</p>

            <p className="border-t pt-2 text-rose-500 font-semibold">Total Discount Given:</p>
            <p className="border-t pt-2 text-right font-bold text-rose-500">₹{totalDiscountGiven.toFixed(2)}</p>

            <p className="border-t pt-2 text-emerald-600 font-semibold">Overall Margin:</p>
            <p className="border-t pt-2 text-right font-bold text-emerald-600">{overallMargin}%</p>
          </div>
        </div>

        {/* Grand Total & Action Box */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-white flex flex-col justify-between shadow-xl space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quotation Grand Total</h4>
              {currentReviewStatus && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentReviewStatus === 'APPROVED' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : currentReviewStatus === 'REJECTED' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : currentReviewStatus === 'IN_REVIEW' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : currentReviewStatus === 'PENDING_REVIEW' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-700/60 text-slate-300 border border-slate-600/40'
                }`}>
                  {currentReviewStatus === 'DRAFT' ? 'Draft' : currentReviewStatus}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-extrabold text-bosch-accent font-mono mt-2">
              ₹{grandTotalSales.toFixed(2)}
            </h3>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span>Total Buy cost:</span>
                <span className="font-bold">₹{grandTotalBuy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Profit:</span>
                <span className="font-bold text-emerald-400">₹{totalProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Primary Workflow Buttons: Save Draft (silent) and Submit for Review (email trigger) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                onClick={() => handleSaveBOQ({ submitForReview: false })}
                disabled={isSavingBOQ || isSubmittingReview || !canWriteBOQ}
                title={!canWriteBOQ ? "Quote saving requires BOQ Write permissions" : "Save quotation draft to database without sending email notifications"}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/60 disabled:cursor-not-allowed text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                {isSavingBOQ ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-slate-300" />
                    <span>{canWriteBOQ ? 'Save Draft' : 'Save (Read Only)'}</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => handleSaveBOQ({ submitForReview: true })}
                disabled={isSavingBOQ || isSubmittingReview || !canWriteBOQ}
                title={!canWriteBOQ ? "Quote submission requires BOQ Write permissions" : "Save quotation and send email notification to Super Admin for approval"}
                className="py-2.5 px-3 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue hover:from-blue-700 hover:to-sky-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-bosch-blue/20 active:scale-95"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Review</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleDownloadPDF}
                className="py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-transparent font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-500" /> Export PDF
              </button>
              <button 
                onClick={handleDownloadCSV}
                className="py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-transparent font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal: View & Edit Specification Details */}
      {selectedSpecModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative border border-slate-200">
            <button 
              onClick={() => setSelectedSpecModalItem(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-bosch-blue/10 text-bosch-blue font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Item Specification</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1 pr-6">{selectedSpecModalItem.productName || 'Custom Item'}</h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">
              Make: <span className="text-slate-700">{selectedSpecModalItem.make || 'N/A'}</span> | Model: <span className="text-slate-700">{selectedSpecModalItem.model || 'N/A'}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Specification Details</label>
              <textarea 
                rows="6"
                value={selectedSpecModalItem.specification || ''}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedSpecModalItem(prev => ({ ...prev, specification: val }));
                  if (selectedSpecModalItem.itemIdx !== undefined) {
                    handleUpdateItemValue(selectedSpecModalItem.itemIdx, 'specification', val, selectedSpecModalItem.itemCat);
                  }
                }}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:border-bosch-blue focus:bg-white focus:outline-none leading-relaxed shadow-inner"
                placeholder="Type or paste full technical specification details here..."
              />
            </div>
            
            <div className="flex justify-end pt-3 border-t">
              <button 
                onClick={() => setSelectedSpecModalItem(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View & Edit Make and Model Details */}
      {selectedMakeModelModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-slate-200">
            <button 
              onClick={() => setSelectedMakeModelModalItem(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Make & Model Details</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-4 pr-6">{selectedMakeModelModalItem.productName || 'Custom Item'}</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Manufacturer / Make</label>
                <input 
                  type="text"
                  value={selectedMakeModelModalItem.make || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedMakeModelModalItem(prev => ({ ...prev, make: val }));
                    if (selectedMakeModelModalItem.itemIdx !== undefined) {
                      handleUpdateItemValue(selectedMakeModelModalItem.itemIdx, 'make', val, selectedMakeModelModalItem.itemCat);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-bosch-blue focus:outline-none"
                  placeholder="e.g. Bosch Security Systems"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Product Model / Version</label>
                <input 
                  type="text"
                  value={selectedMakeModelModalItem.model || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedMakeModelModalItem(prev => ({ ...prev, model: val }));
                    if (selectedMakeModelModalItem.itemIdx !== undefined) {
                      handleUpdateItemValue(selectedMakeModelModalItem.itemIdx, 'model', val, selectedMakeModelModalItem.itemCat);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-bosch-blue focus:outline-none"
                  placeholder="e.g. FLEXIDOME IP 5000i"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-3 border-t">
              <button 
                onClick={() => setSelectedMakeModelModalItem(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay when Saving BOQ or Submitting Review */}
      {(isSavingBOQ || isSubmittingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3 border border-slate-100 max-w-xs text-center">
            <div className="w-12 h-12 rounded-2xl bg-bosch-blue/10 text-bosch-blue flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-bosch-blue" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {isSubmittingReview ? 'Submitting BOQ for Review' : 'Saving BOQ Draft'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isSubmittingReview 
                  ? 'Saving quotation and notifying Super Admin via email...' 
                  : 'Committing quote draft to pre-sales CRM database...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Save / Submit Success Modal */}
      {showSaveSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-slate-100 text-slate-800"
          >
            <button 
              onClick={() => setShowSaveSuccessModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Icon Badge */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg mb-3 ${
                savedQuoteSummary?.isSubmitted
                  ? 'bg-blue-50 text-bosch-blue border-blue-100 shadow-blue-500/10'
                  : 'bg-emerald-50 text-emerald-500 border-emerald-100 shadow-emerald-500/10'
              }`}>
                {savedQuoteSummary?.isSubmitted ? (
                  <Send className="w-8 h-8 text-bosch-blue" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                )}
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1 ${
                savedQuoteSummary?.isSubmitted
                  ? 'bg-blue-500/10 text-bosch-blue'
                  : 'bg-emerald-500/10 text-emerald-600'
              }`}>
                {savedQuoteSummary?.isSubmitted ? 'Submitted for Super Admin Review' : 'Draft Saved (Database Confirmed)'}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {savedQuoteSummary?.isSubmitted ? 'Quotation Submitted!' : 'Draft Saved!'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {savedQuoteSummary?.isSubmitted 
                  ? 'Quote saved and review email notification dispatched to Super Admin.' 
                  : 'Your pre-sales quote draft has been stored safely without email notifications.'}
              </p>
            </div>

            {/* Quote Summary Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 mb-6 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Project Name</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{savedQuoteSummary?.projectName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Quotation Ref</span>
                <span className="font-semibold text-slate-700 font-mono">{savedQuoteSummary?.quotationNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Review Status</span>
                <span className="font-bold text-slate-700 uppercase">{savedQuoteSummary?.reviewStatus || 'DRAFT'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Line Items Count</span>
                <span className="font-semibold text-slate-700">{savedQuoteSummary?.itemCount || 0} Items</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-bold">Total Quote Value</span>
                <span className="font-extrabold text-emerald-600 text-sm font-mono">
                  ₹{savedQuoteSummary?.grandTotalSales?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              {!savedQuoteSummary?.isSubmitted && canWriteBOQ && (
                <button
                  onClick={() => {
                    setShowSaveSuccessModal(false);
                    handleSaveBOQ({ submitForReview: true });
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 mb-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit for Review Now & Notify Super Admin</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowSaveSuccessModal(false);
                    handleDownloadPDF();
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileDown className="w-4 h-4 text-rose-500" /> Export PDF
                </button>
                <button
                  onClick={() => {
                    setShowSaveSuccessModal(false);
                    handleDownloadCSV();
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Excel
                </button>
              </div>

              <button
                onClick={() => setShowSaveSuccessModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Done / Continue Editing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
