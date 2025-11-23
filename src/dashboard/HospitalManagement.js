import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Button, Card, Col, Nav, ProgressBar, Row, Table, Badge, Dropdown, Spinner, Alert, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import hospitalService from "../services/hospitalService";

export default function HospitalManagement() {
  const [hospitalData, setHospitalData] = useState({
    loading: true,
    error: null,
    analytics: {},
    hospitals: [],
    bedUtilization: {},
    admissions: {},
    staffPerformance: {},
    emergencyMetrics: {},
    departmentUtilization: [],
    patientFlow: {}
  });

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLicensesModal, setShowLicensesModal] = useState(false);
  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [contactsData, setContactsData] = useState({
    primaryContacts: {},
    hospitalAdmins: [],
    registeredUsers: [],
    loading: false,
    error: null
  });

  // License form state
  const [licenseFormData, setLicenseFormData] = useState({
    license_number: '',
    license_type: 'operating',
    license_name: '',
    license_category: '',
    license_status: 'active',
    issue_date: '',
    effective_date: '',
    expiration_date: '',
    healthcare_authority_id: 1, // Default to first authority
    conditions: '',
    limitations: '',
    notes: '',
    license_certificate: null
  });
  const [licenseSubmitting, setLicenseSubmitting] = useState(false);

  // Preserve the original chart states and animations
  const states = {
    hover: {
      filter: {
        type: 'none'
      }
    },
    active: {
      filter: {
        type: 'none'
      }
    }
  };

  // Hospital Bed Utilization Chart (using real API data)
  const getBedUtilizationSeries = () => {
    if (hospitalData.bedUtilization && hospitalData.bedUtilization.occupied_beds) {
      return [{
        name: 'Occupied Beds',
        data: hospitalData.bedUtilization.occupied_beds
      }, {
        name: 'Available Beds',
        data: hospitalData.bedUtilization.available_beds
      }, {
        name: 'Emergency Reserve',
        data: hospitalData.bedUtilization.emergency_reserve
      }];
    }
    // Fallback data while loading
    return [{
      name: 'Occupied Beds',
      data: [[0, 120], [1, 95], [2, 80], [3, 110], [4, 105], [5, 130], [6, 125], [7, 140], [8, 135], [9, 150], [10, 145], [11, 160], [12, 155], [13, 140], [14, 150], [15, 145], [16, 135], [17, 120], [18, 130], [19, 115], [20, 100], [21, 85], [22, 95], [23, 110], [24, 105], [25, 120], [26, 135], [27, 140], [28, 130], [29, 125], [30, 115]]
    }, {
      name: 'Available Beds',
      data: [[0, 50], [1, 75], [2, 90], [3, 60], [4, 65], [5, 40], [6, 45], [7, 30], [8, 35], [9, 20], [10, 25], [11, 10], [12, 15], [13, 30], [14, 20], [15, 25], [16, 35], [17, 50], [18, 40], [19, 55], [20, 70], [21, 85], [22, 75], [23, 60], [24, 65], [25, 50], [26, 35], [27, 30], [28, 40], [29, 45], [30, 55]]
    }, {
      name: 'Emergency Reserve',
      data: [[0, 30], [1, 30], [2, 30], [3, 30], [4, 30], [5, 30], [6, 30], [7, 30], [8, 30], [9, 30], [10, 30], [11, 30], [12, 30], [13, 30], [14, 30], [15, 30], [16, 30], [17, 30], [18, 30], [19, 30], [20, 30], [21, 30], [22, 30], [23, 30], [24, 30], [25, 30], [26, 30], [27, 30], [28, 30], [29, 30], [30, 30]]
    }];
  };

  const bedUtilizationOptions = {
    chart: {
      parentHeightOffset: 0,
      stacked: true,
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20,
        left: 5
      }
    },
    states: states,
    colors: ['#506fd9', '#85b6ff', '#e8f0ff'],
    plotOptions: {
      bar: {
        columnWidth: '35%'
      },
    },
    stroke: {
      curve: 'straight',
      lineCap: 'square',
      width: 0
    },
    tooltip: { 
      enabled: true,
      y: {
        formatter: function(val) {
          return val + " beds"
        }
      }
    },
    fill: { opacity: 1 },
    legend: { show: false },
    xaxis: {
      type: 'numeric',
      tickAmount: 11,
      decimalsInFloat: 0,
      labels: {
        style: {
          fontSize: '11px'
        }
      }
    },
    yaxis: {
      max: 250,
      tickAmount: 8,
      labels: {
        style: {
          colors: ['#a2abb5'],
          fontSize: '11px'
        }
      }
    }
  };

  // Patient Admissions Chart
  const admissionsSeries = [{
    data: [[9, 25], [10, 18]]
  }, {
    data: [[0, 12], [1, 8], [2, 6], [3, 5], [4, 8], [5, 7], [6, 10], [7, 12], [8, 11], [9, 0], [10, 0], [11, 20], [12, 14], [13, 18], [14, 12], [15, 16], [16, 15], [17, 12], [18, 14], [19, 10]]
  }];

  const admissionsOptions = {
    chart: {
      parentHeightOffset: 0,
      stacked: true,
      toolbar: { show: false }
    },
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20,
        left: 0,
        right: 0,
        bottom: -2
      },
      yaxis: {
        lines: { show: false }
      }
    },
    colors: ['#506fd9', '#d9dde7'],
    plotOptions: {
      bar: { columnWidth: '45%' }
    },
    stroke: {
      curve: 'straight',
      lineCap: 'square',
      width: 0
    },
    xaxis: {
      min: 0,
      type: 'numeric',
      tickAmount: 9,
      decimalsInFloat: 0,
      labels: {
        style: {
          fontSize: '10px',
          fontClor: '#ccc'
        }
      }
    },
    yaxis: {
      show: false,
      max: 38
    },
    states: states,
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    fill: { opacity: 1 },
    legend: { show: false }
  };

  // Staff Performance Chart
  const staffSeries = [{
    data: [[9, 28]]
  }, {
    data: [[0, 8], [1, 10], [2, 15], [3, 12], [4, 16], [5, 20], [6, 18], [7, 22], [8, 24], [9, 0], [10, 22], [11, 25], [12, 16], [13, 22], [14, 15], [15, 19], [16, 18], [17, 15], [18, 16], [19, 12]]
  }];

  const staffOptions = {
    chart: {
      parentHeightOffset: 0,
      stacked: true,
      toolbar: { show: false }
    },
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20,
        left: 0,
        right: 0,
        bottom: -2
      },
      yaxis: {
        lines: { show: false }
      }
    },
    colors: ['#4c5366', '#d9dde7'],
    plotOptions: {
      bar: { columnWidth: '45%' }
    },
    stroke: {
      curve: 'straight',
      lineCap: 'square',
      width: 0
    },
    xaxis: {
      min: 0,
      type: 'numeric',
      tickAmount: 9,
      decimalsInFloat: 0,
      labels: {
        style: {
          fontSize: '10px',
          fontClor: '#ccc'
        }
      }
    },
    yaxis: {
      show: false,
      max: 38
    },
    states: states,
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    fill: { opacity: 1 },
    legend: { show: false }
  };

  // Emergency Response Chart
  const emergencySeries = [{
    data: [[9, 22], [10, 12]]
  }, {
    data: [[0, 4], [1, 3], [2, 4], [3, 5], [4, 7], [5, 6], [6, 9], [7, 18], [8, 20], [9, 0], [10, 0], [11, 18], [12, 14], [13, 12], [14, 9], [15, 10], [16, 8], [17, 6], [18, 4], [19, 5]]
  }];

  const emergencyOptions = {
    chart: {
      parentHeightOffset: 0,
      stacked: true,
      toolbar: { show: false }
    },
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20,
        left: 0,
        right: 0,
        bottom: -2
      },
      yaxis: {
        lines: { show: false }
      }
    },
    colors: ['#ff6b6b', '#d9dde7'],
    plotOptions: {
      bar: { columnWidth: '45%' }
    },
    stroke: {
      curve: 'straight',
      lineCap: 'square',
      width: 0
    },
    xaxis: {
      min: 0,
      type: 'numeric',
      tickAmount: 9,
      decimalsInFloat: 0,
      labels: {
        style: {
          fontSize: '10px',
          fontClor: '#ccc'
        }
      }
    },
    yaxis: {
      show: false,
      max: 38
    },
    states: states,
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    fill: { opacity: 1 },
    legend: { show: false }
  };

  // Patient Flow Trends Chart
  const patientFlowSeries = [{
    name: 'Outpatients',
    data: [
      [0, 35], [1, 42], [2, 38], [3, 45], [4, 32], [5, 35], [6, 40], [7, 55], [8, 65], [9, 68],
      [10, 72], [11, 85], [12, 78], [13, 65], [14, 78], [15, 82], [16, 88], [17, 95], [18, 105], [19, 85],
      [20, 92], [21, 108], [22, 115], [23, 102], [24, 125], [25, 140], [26, 148], [27, 165], [28, 98], [29, 75],
      [30, 55], [31, 58], [32, 68], [33, 78], [34, 88], [35, 105], [36, 118], [37, 115], [38, 125], [39, 132],
      [40, 148], [41, 155], [42, 148], [43, 165], [44, 158], [45, 155], [46, 175]
    ]
  }, {
    name: 'Inpatients',
    data: [
      [0, 65], [1, 58], [2, 68], [3, 62], [4, 72], [5, 75], [6, 68], [7, 78], [8, 68], [9, 78],
      [10, 72], [11, 82], [12, 78], [13, 72], [14, 92], [15, 105], [16, 108], [17, 118], [18, 128], [19, 122],
      [20, 142], [21, 152], [22, 175], [23, 168], [24, 132], [25, 122], [26, 152], [27, 162], [28, 182], [29, 168],
      [30, 175], [31, 172], [32, 122], [33, 152], [34, 152], [35, 128], [36, 118], [37, 122], [38, 112], [39, 122],
      [40, 152], [41, 142], [42, 152], [43, 162], [44, 192], [45, 202], [46, 232]
    ]
  }];

  const patientFlowOptions = {
    chart: {
      parentHeightOffset: 0,
      stacked: false,
      toolbar: { show: false }
    },
    colors: ['#4c5366', '#506fd9'],
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20,
        bottom: 0,
        left: 20
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 1.5
    },
    fill: {
      colors: ['#fff', '#81adee'],
      type: ['solid', 'gradient'],
      opacity: 1,
      gradient: {
        opacityFrom: 0.35,
        opacityTo: 0.65,
      }
    },
    legend: { show: false },
    tooltip: { enabled: false },
    yaxis: {
      max: 300,
      tickAmount: 6,
      show: false
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 11,
      labels: {
        style: {
          colors: '#6e7985',
          fontSize: '11px'
        }
      },
      axisBorder: { show: false }
    }
  };

  // Hospital metrics using real API data
  const getHospitalMetrics = () => {
    const analytics = hospitalData.analytics;
    if (!analytics || Object.keys(analytics).length === 0) {
      // Loading or fallback state
      return [
        {
          "icon": "ri-hospital-line",
          "percent": { "color": "secondary", "amount": "..." },
          "value": "...",
          "label": "Verified Hospitals",
          "last": { "color": "secondary", "amount": "..." }
        },
        {
          "icon": "ri-user-heart-line", 
          "percent": { "color": "secondary", "amount": "..." },
          "value": "...",
          "label": "Active Patients",
          "last": { "color": "secondary", "amount": "..." }
        },
        {
          "icon": "ri-stethoscope-line",
          "percent": { "color": "secondary", "amount": "..." },
          "value": "...",
          "label": "Medical Staff", 
          "last": { "color": "secondary", "amount": "..." }
        },
        {
          "icon": "ri-calendar-check-line",
          "percent": { "color": "secondary", "amount": "..." },
          "value": "...",
          "label": "Appointments Today",
          "last": { "color": "secondary", "amount": "..." }
        }
      ];
    }

    const growth = analytics.growth_metrics || {};
    
    return [
      {
        "icon": "ri-hospital-line",
        "percent": {
          "color": growth.hospitals >= 0 ? "success" : "danger",
          "amount": `${growth.hospitals >= 0 ? '+' : ''}${growth.hospitals}%`
        },
        "value": analytics.verified_hospitals || "0",
        "label": "Verified Hospitals",
        "last": {
          "color": growth.hospitals >= 0 ? "success" : "danger",
          "amount": `${Math.abs(growth.hospitals)}%`
        }
      },
      {
        "icon": "ri-user-heart-line",
        "percent": {
          "color": growth.patients >= 0 ? "success" : "danger", 
          "amount": `${growth.patients >= 0 ? '+' : ''}${growth.patients}%`
        },
        "value": analytics.active_patients ? analytics.active_patients.toLocaleString() : "0",
        "label": "Active Patients",
        "last": {
          "color": growth.patients >= 0 ? "success" : "danger",
          "amount": `${Math.abs(growth.patients)}%`
        }
      },
      {
        "icon": "ri-stethoscope-line",
        "percent": {
          "color": growth.staff >= 0 ? "success" : "danger",
          "amount": `${growth.staff >= 0 ? '+' : ''}${growth.staff}%`
        },
        "value": analytics.medical_staff || "0",
        "label": "Medical Staff",
        "last": {
          "color": growth.staff >= 0 ? "success" : "danger", 
          "amount": `${Math.abs(growth.staff)}%`
        }
      },
      {
        "icon": "ri-calendar-check-line",
        "percent": {
          "color": growth.appointments >= 0 ? "success" : "danger",
          "amount": `${growth.appointments >= 0 ? '+' : ''}${growth.appointments}%`
        },
        "value": analytics.appointments_today || "0",
        "label": "Appointments Today",
        "last": {
          "color": growth.appointments >= 0 ? "success" : "danger",
          "amount": `${Math.abs(growth.appointments)}%`
        }
      }
    ];
  };

  // Transform API hospital data for display
  const getHospitalNetworkData = () => {
    if (!hospitalData.hospitals || !Array.isArray(hospitalData.hospitals) || hospitalData.hospitals.length === 0) {
      // Fallback data while loading
      return [
        {
          "name": "Loading hospitals...",
          "location": "...",
          "type": "...",
          "verification": "...",
          "bedCapacity": "...",
          "currentOccupancy": "...",
          "status": "...",
          "licenses": "..."
        }
      ];
    }

    return hospitalData.hospitals.map(hospital => ({
      "id": hospital.id,
      "name": hospital.name,
      "location": `${hospital.city || ''}, ${hospital.state || ''}`.trim().replace(/^,\s*/, ''),
      "type": hospital.hospital_type,
      "verification": hospital.is_verified ? "verified" : "pending",
      "bedCapacity": hospital.bed_capacity ? hospital.bed_capacity.toString() : "0",
      "currentOccupancy": hospital.currentOccupancy || "0%", // Real occupancy data from API
      "status": hospital.is_verified ? "active" : "pending",
      "licenses": hospital.licensesSummary || "No licenses", // Real license data from API
      "emergencyUnit": hospital.emergency_unit,
      "icuUnit": hospital.icu_unit,
      "phone": hospital.phone,
      "email": hospital.email,
      "website": hospital.website,
      "registrationNumber": hospital.registration_number
    }));
  };

  // Department utilization using real API data
  const getDepartmentMetrics = () => {
    if (!hospitalData.departmentUtilization || !Array.isArray(hospitalData.departmentUtilization) || hospitalData.departmentUtilization.length === 0) {
      // Loading or fallback state - show realistic department data
      return [
        { "name": "Emergency Department", "patients": "45 active", "color": "danger", "percent": "92.5%", "progress": 93 },
        { "name": "Cardiology", "patients": "28 active", "color": "success", "percent": "76.8%", "progress": 77 },
        { "name": "Surgery", "patients": "18 active", "color": "success", "percent": "84.2%", "progress": 84 },
        { "name": "Maternity", "patients": "12 active", "color": "warning", "percent": "58.5%", "progress": 59 },
        { "name": "Pediatrics", "patients": "22 active", "color": "success", "percent": "71.2%", "progress": 71 }
      ];
    }

    return hospitalData.departmentUtilization.map(dept => ({
      "name": dept.name,
      "patients": `${dept.active_patients} active`,
      "color": dept.trend || "success",
      "percent": `${dept.utilization_rate}%`,
      "progress": Math.floor(dept.utilization_rate)
    }));
  };

  // Skin Switch - preserve original functionality
  const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
  const [skin, setSkin] = useState(currentSkin);

  const switchSkin = (skin) => {
    if (skin === 'dark') {
      const btnWhite = document.getElementsByClassName('btn-white');

      for (const btn of btnWhite) {
        btn.classList.add('btn-outline-primary');
        btn.classList.remove('btn-white');
      }
    } else {
      const btnOutlinePrimary = document.getElementsByClassName('btn-outline-primary');

      for (const btn of btnOutlinePrimary) {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-white');
      }
    }
  }

  switchSkin(skin);

  useEffect(() => {
    switchSkin(skin);
    loadHospitalData();
  }, [skin]);

  // Fetch administrative contacts when staff tab is selected
  useEffect(() => {
    if (activeTab === 'staff' && selectedHospital?.id) {
      console.log('🔄 Staff tab selected, fetching contacts for hospital:', selectedHospital.name);
      fetchHospitalContacts(selectedHospital.id);
    }
  }, [activeTab, selectedHospital?.id]);

  // Load hospital data from API
  const loadHospitalData = async () => {
    try {
      setHospitalData(prev => ({ ...prev, loading: true, error: null }));

      console.log('🏥 Loading hospital dashboard data...');
      const [dashboardData, occupancyData, licenseData] = await Promise.all([
        hospitalService.getDashboardData(),
        hospitalService.getHospitalOccupancy(),
        hospitalService.getHospitalLicenses()
      ]);

      console.log('✅ Hospital data loaded:', dashboardData);
      console.log('✅ Occupancy data loaded:', occupancyData);
      console.log('✅ License data loaded:', licenseData);

      // Merge occupancy and license data with hospital data
      const hospitalsWithCompleteData = dashboardData.hospitals.map(hospital => {
        const occupancyInfo = occupancyData.find(occ => occ.hospital_id === hospital.id);
        const licenseInfo = licenseData.find(lic => lic.hospital_id === hospital.id);
        return {
          ...hospital,
          currentOccupancy: occupancyInfo ? occupancyInfo.occupancy_percentage : '0%',
          currentAdmissions: occupancyInfo ? occupancyInfo.current_admissions : 0,
          licensesSummary: licenseInfo ? licenseInfo.license_summary : 'No licenses',
          licensesDetails: licenseInfo ? licenseInfo.license_details : []
        };
      });

      // Update state with real data
      setHospitalData(prev => ({
        ...prev,
        loading: false,
        analytics: dashboardData.analytics,
        hospitals: hospitalsWithCompleteData,
        bedUtilization: dashboardData.bedUtilization,
        admissions: dashboardData.admissions,
        staffPerformance: dashboardData.staffPerformance,
        emergencyMetrics: dashboardData.emergencyMetrics,
        departmentUtilization: dashboardData.departmentUtilization,
        patientFlow: dashboardData.patientFlow
      }));

      // Return the hospitals data so it can be used immediately
      return hospitalsWithCompleteData;

    } catch (error) {
      console.error('❌ Failed to load hospital data:', error);
      setHospitalData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load hospital data. Please check your connection and try again.'
      }));
      return [];
    }
  };

  // Helper functions for UI elements
  const getVerificationBadge = (verification) => {
    const variants = {
      'verified': 'success',
      'pending': 'warning', 
      'expired': 'danger'
    };
    return <Badge bg={variants[verification] || 'secondary'}>{verification}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'pending': 'warning',
      'suspended': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getOccupancyColor = (occupancy) => {
    const rate = parseInt(occupancy);
    if (rate >= 90) return 'danger';
    if (rate >= 75) return 'warning'; 
    return 'success';
  };

  // Hospital action handlers
  const handleViewDetails = (hospital) => {
    console.log('👁️ Viewing details for:', hospital.name);

    // Get the freshest hospital data from the state to ensure licenses are up-to-date
    const freshHospital = hospitalData.hospitals.find(h => h.id === hospital.id);
    const hospitalToUse = freshHospital || hospital;

    console.log('👁️ Hospital details with licenses:', hospitalToUse.licensesDetails);
    setSelectedHospital(hospitalToUse);
    setShowDetailsModal(true);
  };

  const handleEditHospital = (hospital) => {
    console.log('✏️ Editing hospital:', hospital.name);
    setSelectedHospital(hospital);
    setShowEditModal(true);
  };

  const handleViewLicenses = (hospital) => {
    console.log('📄 Viewing licenses for:', hospital.name);

    // Get the freshest hospital data from the state to ensure licenses are up-to-date
    const freshHospital = hospitalData.hospitals.find(h => h.id === hospital.id);
    const hospitalToUse = freshHospital || hospital;

    console.log('📄 License details:', hospitalToUse.licensesDetails);
    setSelectedHospital(hospitalToUse);
    setShowLicensesModal(true);
  };

  const handleSuspendHospital = (hospital) => {
    console.log('❌ Suspending hospital:', hospital.name);
    setSelectedHospital(hospital);
    setShowSuspendModal(true);
  };

  const confirmSuspendHospital = async () => {
    if (selectedHospital) {
      try {
        // Here you would call the API to suspend the hospital
        // await hospitalService.suspendHospital(selectedHospital.id);
        console.log(`Hospital "${selectedHospital.name}" suspended`);
        setShowSuspendModal(false);
        setSelectedHospital(null);
        // loadHospitalData(); // Refresh the data
      } catch (error) {
        console.error('Failed to suspend hospital:', error);
      }
    }
  };

  // Verification handlers
  const handleVerifyHospital = async (hospital) => {
    console.log('✅ Verifying hospital:', hospital.name);
    try {
      // Show loading state
      setHospitalData(prev => ({ ...prev, loading: true }));

      // Call API to verify hospital
      await hospitalService.verifyHospital(hospital.id);
      console.log(`✅ Hospital "${hospital.name}" verified successfully`);

      // Reload data to show updated verification status
      await loadHospitalData();
    } catch (error) {
      console.error('❌ Failed to verify hospital:', error);
      setHospitalData(prev => ({
        ...prev,
        loading: false,
        error: `Failed to verify hospital: ${error.message}`
      }));
    }
  };

  const handleUnverifyHospital = async (hospital) => {
    console.log('❌ Unverifying hospital:', hospital.name);
    try {
      // Show loading state
      setHospitalData(prev => ({ ...prev, loading: true }));

      // Call API to unverify hospital
      await hospitalService.unverifyHospital(hospital.id);
      console.log(`❌ Hospital "${hospital.name}" unverified successfully`);

      // Reload data to show updated verification status
      await loadHospitalData();
    } catch (error) {
      console.error('❌ Failed to unverify hospital:', error);
      setHospitalData(prev => ({
        ...prev,
        loading: false,
        error: `Failed to unverify hospital: ${error.message}`
      }));
    }
  };

  // License approval handlers
  const handleApproveLicense = async (license) => {
    console.log('✅ Approving license:', license.license_name);
    try {
      setHospitalData(prev => ({ ...prev, loading: true }));

      await hospitalService.approveLicense(license.id);
      console.log(`✅ License "${license.license_name}" approved successfully`);

      // Reload all hospital data to get updated license status
      const updatedHospitals = await loadHospitalData();

      // Refresh the selected hospital with new data
      if (selectedHospital && updatedHospitals) {
        const updatedHospital = updatedHospitals.find(h => h.id === selectedHospital.id);
        if (updatedHospital) {
          console.log('✅ Refreshing selected hospital with updated licenses');
          setSelectedHospital(updatedHospital);
        }
      }
    } catch (error) {
      console.error('❌ Failed to approve license:', error);
      setHospitalData(prev => ({
        ...prev,
        loading: false,
        error: `Failed to approve license: ${error.message}`
      }));
    }
  };

  const handleRejectLicense = async (license) => {
    const rejectionReason = window.prompt(
      `Why are you rejecting the license "${license.license_name}"?\n\n(e.g., "Certificate is not clearly visible", "Document appears to be fake", "Expired license")`
    );

    if (rejectionReason === null) {
      // User cancelled
      return;
    }

    console.log('❌ Rejecting license:', license.license_name);
    try {
      setHospitalData(prev => ({ ...prev, loading: true }));

      await hospitalService.rejectLicense(license.id, rejectionReason);
      console.log(`❌ License "${license.license_name}" rejected successfully`);

      // Reload all hospital data to get updated license status
      const updatedHospitals = await loadHospitalData();

      // Refresh the selected hospital with new data
      if (selectedHospital && updatedHospitals) {
        const updatedHospital = updatedHospitals.find(h => h.id === selectedHospital.id);
        if (updatedHospital) {
          console.log('✅ Refreshing selected hospital with updated licenses');
          setSelectedHospital(updatedHospital);
        }
      }
    } catch (error) {
      console.error('❌ Failed to reject license:', error);
      setHospitalData(prev => ({
        ...prev,
        loading: false,
        error: `Failed to reject license: ${error.message}`
      }));
    }
  };

  // Fetch administrative contacts for a hospital
  const fetchHospitalContacts = async (hospitalId) => {
    console.log('📞 Fetching administrative contacts for hospital ID:', hospitalId);
    try {
      setContactsData(prev => ({ ...prev, loading: true, error: null }));

      const response = await hospitalService.getHospitalStaff(hospitalId);

      console.log('✅ Contact data received:', response);
      setContactsData({
        primaryContacts: response.contacts?.primary_contacts || {},
        hospitalAdmins: response.contacts?.hospital_admins || [],
        registeredUsers: response.contacts?.registered_users || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Failed to fetch hospital contacts:', error);
      setContactsData({
        primaryContacts: {},
        hospitalAdmins: [],
        registeredUsers: [],
        loading: false,
        error: `Failed to load contacts: ${error.message}`
      });
    }
  };

  // License handlers
  const handleAddLicense = () => {
    console.log('➕ Opening Add License form for:', selectedHospital?.name);
    setShowAddLicenseModal(true);
  };

  const handleLicenseFormChange = (e) => {
    const { name, value } = e.target;
    setLicenseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLicenseFileChange = (e) => {
    const file = e.target.files[0];
    setLicenseFormData(prev => ({
      ...prev,
      license_certificate: file
    }));
  };

  const handleSubmitLicense = async (e) => {
    e.preventDefault();

    if (!selectedHospital) {
      console.error('No hospital selected');
      return;
    }

    setLicenseSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Append all form fields
      Object.keys(licenseFormData).forEach(key => {
        if (licenseFormData[key] !== null && licenseFormData[key] !== '') {
          formData.append(key, licenseFormData[key]);
        }
      });

      // Call API to add license
      const response = await hospitalService.addHospitalLicense(
        selectedHospital.id,
        formData
      );

      console.log('✅ License added successfully:', response);

      // Close modal and reset form
      setShowAddLicenseModal(false);
      setLicenseFormData({
        license_number: '',
        license_type: 'operating',
        license_name: '',
        license_category: '',
        license_status: 'active',
        issue_date: '',
        effective_date: '',
        expiration_date: '',
        healthcare_authority_id: 1,
        conditions: '',
        limitations: '',
        notes: '',
        license_certificate: null
      });

      // Refresh hospital data to show new license
      const updatedHospitals = await loadHospitalData();

      // Find and update the selected hospital with fresh data
      const updatedHospital = updatedHospitals.find(h => h.id === selectedHospital.id);
      if (updatedHospital) {
        console.log('📄 Updated hospital license details:', updatedHospital.licensesDetails);
        setSelectedHospital(updatedHospital);
        // Switch to licenses tab to show the newly added license
        setActiveTab('licenses');
      }

      // Show success message (you can add a toast notification here)
      alert('License added successfully! The licenses tab has been updated.');

    } catch (error) {
      console.error('❌ Failed to add license:', error);
      alert('Failed to add license. Please try again.');
    } finally {
      setLicenseSubmitting(false);
    }
  };

  // Loading state
  if (hospitalData.loading) {
    return (
      <React.Fragment>
        <Header onSkin={setSkin} />
        <div className="main main-app p-3 p-lg-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <h5 className="mt-3">Loading Hospital Data...</h5>
              <p className="text-muted">Fetching real-time hospital analytics</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  // Error state
  if (hospitalData.error) {
    return (
      <React.Fragment>
        <Header onSkin={setSkin} />
        <div className="main main-app p-3 p-lg-4">
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>⚠️ Error Loading Hospital Data</Alert.Heading>
            <p>{hospitalData.error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={loadHospitalData} variant="outline-danger">
                <i className="ri-refresh-line me-2"></i>Retry
              </Button>
            </div>
          </Alert>
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="#">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Hospital Management</li>
            </ol>
            <h4 className="main-title mb-0">Hospital Network Overview</h4>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <Button 
              variant="white" 
              className="btn-icon" 
              onClick={loadHospitalData}
              title="Refresh Data"
            >
              <i className="ri-refresh-line fs-18 lh-1"></i>
            </Button>
            <Button variant="white" className="btn-icon"><i className="ri-printer-line fs-18 lh-1"></i></Button>
            <Button 
              as={Link} 
              to="/dashboard/hospital-registry"
              variant="primary" 
              className="d-flex align-items-center gap-2"
            >
              <i className="ri-hospital-line fs-18 lh-1"></i>Hospital<span className="d-none d-sm-inline"> Registry</span>
            </Button>
          </div>
        </div>

        <Row className="g-3">
          <Col xl="5">
            <Row className="g-3">
              {getHospitalMetrics().map((item, index) => (
                <Col xs="6" md="3" xl="6" key={index}>
                  <Card className="card-one card-product">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center justify-content-between mb-5">
                        <div className="card-icon"><i className={item.icon}></i></div>
                        <h6 className={"fw-normal ff-numerals mb-0 text-" + item.percent.color}>{item.percent.amount}</h6>
                      </div>
                      <h2 className="card-value ls--1">{item.value}</h2>
                      <label className="card-label fw-medium text-dark">{item.label}</label>
                      <span className="d-flex gap-1 fs-xs">
                        <span className={"d-flex align-items-center text-" + item.last.color}>
                          <span className="ff-numerals">{item.last.amount}</span><i className={(item.last.color === 'success') ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
                        </span>
                        <span className="text-secondary">than last week</span>
                      </span>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          <Col xl="7">
            <Card className="card-one card-product-inventory">
              <Card.Header>
                <Card.Title as="h6">Hospital Bed Utilization</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <ul className="legend mb-3 position-absolute">
                  <li>Occupied Beds</li>
                  <li>Available Beds</li>
                  <li>Emergency Reserve</li>
                </ul>
                <ReactApexChart 
                  series={getBedUtilizationSeries()} 
                  options={bedUtilizationOptions} 
                  type="bar" 
                  height={310} 
                  className="apex-chart-twelve mt-4 pt-3" 
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl="8">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Hospital Network Registry</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                {getHospitalNetworkData().map((hospital, index) => (
                  <div className="product-wrapper" key={index}>
                    <Table>
                      <tbody>
                        <tr>
                          <td>
                            <div className="hospital-info">
                              <div className="hospital-icon bg-primary-subtle text-primary rounded p-2 mb-2">
                                <i className="ri-hospital-line fs-20"></i>
                              </div>
                            </div>
                          </td>
                          <td>
                            <h6 className="mb-1">
                              <Link to="">{hospital.name}</Link>
                            </h6>
                            <span className="fs-sm text-secondary">{hospital.location}</span>
                            <div className="mt-1">
                              <Badge bg="outline-secondary" className="me-1">{hospital.type}</Badge>
                              {getVerificationBadge(hospital.verification)}
                            </div>
                          </td>
                          <td>
                            <label className="d-block text-secondary fs-sm mb-1">Bed Capacity</label>
                            <span className="d-block fw-medium text-dark ff-numerals">{hospital.bedCapacity}</span>
                          </td>
                          <td>
                            <label className="d-block text-secondary fs-sm mb-1">Occupancy</label>
                            <span className={`d-block fw-medium ff-numerals text-${getOccupancyColor(hospital.currentOccupancy)}`}>
                              {hospital.currentOccupancy}
                            </span>
                          </td>
                          <td>
                            <label className="d-block text-secondary fs-sm mb-1">Licenses</label>
                            <span className="d-block fw-medium text-dark ff-numerals">{hospital.licenses}</span>
                          </td>
                          <td>
                            <label className="d-block text-secondary fs-sm mb-1">Status</label>
                            {getStatusBadge(hospital.status)}
                          </td>
                          <td>
                            <Dropdown align="end">
                              <Dropdown.Toggle variant="link" className="btn-icon">
                                <i className="ri-more-2-fill"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleViewDetails(hospital)}
                                >
                                  <i className="ri-eye-line me-2"></i>View Details
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleEditHospital(hospital)}
                                >
                                  <i className="ri-edit-line me-2"></i>Edit Hospital
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleViewLicenses(hospital)}
                                >
                                  <i className="ri-file-list-line me-2"></i>View Licenses
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {/* Verification controls based on current status */}
                                {hospital.verification === 'pending' ? (
                                  <Dropdown.Item
                                    className="text-success"
                                    onClick={() => handleVerifyHospital(hospital)}
                                  >
                                    <i className="ri-checkbox-circle-line me-2"></i>Approve & Verify
                                  </Dropdown.Item>
                                ) : (
                                  <Dropdown.Item
                                    className="text-warning"
                                    onClick={() => handleUnverifyHospital(hospital)}
                                  >
                                    <i className="ri-close-circle-line me-2"></i>Revoke Verification
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() => handleSuspendHospital(hospital)}
                                >
                                  <i className="ri-delete-bin-line me-2"></i>Suspend
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Department Utilization</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                {getDepartmentMetrics().map((dept, index) => (
                  <div className="revenue-item" key={index}>
                    <div className="revenue-item-body">
                      <span>{dept.name}</span>
                      <span>{dept.patients}</span>
                      <span className={"text-" + dept.color}>{dept.percent}</span>
                    </div>
                    <ProgressBar now={dept.progress} />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col md="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Patient Admissions</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="position-absolute">
                  <h2 className="card-value mb-1 ls--1">156</h2>
                  <small><span className="d-inline-flex text-success">12.4% <i className="ri-arrow-up-line"></i></span> than last week</small>
                </div>
                <ReactApexChart series={admissionsSeries} options={admissionsOptions} type="bar" height={180} />
              </Card.Body>
            </Card>
          </Col>
          <Col sm="6" md="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Staff Performance</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="position-absolute">
                  <h2 className="card-value mb-1 ls--1">94.2%</h2>
                  <small><span className="d-inline-flex text-success">2.8% <i className="ri-arrow-up-line"></i></span> efficiency</small>
                </div>
                <ReactApexChart series={staffSeries} options={staffOptions} type="bar" height={180} />
              </Card.Body>
            </Card>
          </Col>
          <Col sm="6" md="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Emergency Response</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="position-absolute">
                  <h2 className="card-value mb-1 ls--1">8.5min</h2>
                  <small><span className="d-inline-flex text-success">1.2min <i className="ri-arrow-down-line"></i></span> avg response</small>
                </div>
                <ReactApexChart series={emergencySeries} options={emergencyOptions} type="bar" height={180} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col md="8">
            <Card className="card-one overflow-hidden">
              <Card.Body className="px-0 pb-3">
                <div className="total-sales-body">
                  <h2 className="card-value mb-2 ls--1">1,247</h2>
                  <label className="d-block mb-0"><span className="fw-semibold text-dark">Total Patient Flow</span> <span className="ff-numerals">(Last 30 Days)</span></label>
                  <small><span className="d-inline-flex text-success">15.8% <i className="ri-arrow-up-line"></i></span> than last month</small>
                  <p className="w-50 fs-xs text-secondary mt-2 mb-0 d-none d-lg-block">Patient flow analytics showing outpatient visits and inpatient admissions across the hospital network...</p>
                </div>
                <ReactApexChart series={patientFlowSeries} options={patientFlowOptions} type="area" height={328} />
              </Card.Body>
            </Card>
          </Col>
          <Col md="4">
            <Card className="card-one mb-3">
              <Card.Body className="p-3">
                <div className="text-center p-3 bg-primary-subtle rounded mb-3">
                  <i className="ri-heart-pulse-line fs-48 text-primary"></i>
                </div>
                <h6 className="fw-semibold text-dark lh-4">Emergency Alert System</h6>
                <p className="mb-3 fs-sm text-secondary">Real-time emergency response coordination across all network hospitals...</p>
                <div className="d-grid">
                  <Button variant="danger" className="btn-sm">
                    <i className="ri-alarm-line me-1"></i>View Alerts
                  </Button>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="card-one">
              <Card.Body className="p-3">
                <div className="text-center p-3 bg-success-subtle rounded mb-3">
                  <i className="ri-shield-check-line fs-48 text-success"></i>
                </div>
                <h6 className="fw-semibold text-dark lh-4">Compliance Dashboard</h6>
                <p className="mb-3 fs-sm text-secondary">Monitor regulatory compliance and license renewals...</p>
                <div className="d-grid">
                  <Button variant="success" className="btn-sm">
                    <i className="ri-file-shield-line me-1"></i>View Compliance
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Footer />
      </div>

      {/* Hospital Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-hospital-line me-2"></i>
            {selectedHospital?.name} - Comprehensive Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedHospital && (
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'basic'} 
                  onClick={() => setActiveTab('basic')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ri-information-line me-1"></i>Basic Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'licenses'}
                  onClick={() => setActiveTab('licenses')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ri-file-shield-line me-1"></i>Licenses & Compliance
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'pharmacies'}
                  onClick={() => setActiveTab('pharmacies')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ri-medicine-bottle-line me-1"></i>Pharmacies
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'staff'}
                  onClick={() => setActiveTab('staff')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ri-team-line me-1"></i>Staff & Operations
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'certifications'}
                  onClick={() => setActiveTab('certifications')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ri-shield-check-line me-1"></i>Certifications
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'administration'}
                  onClick={() => setActiveTab('administration')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ri-admin-line me-1"></i>Administration
                </Nav.Link>
              </Nav.Item>
            </Nav>
          )}

          {selectedHospital && (
            <div>
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
              <div>
                {/* Basic Information Section */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body>
                      <h6 className="fw-semibold mb-3">
                        <i className="ri-building-line me-2 text-primary"></i>
                        Hospital Information
                      </h6>
                      <div className="mb-2">
                        <small className="text-secondary">Hospital ID</small>
                        <div className="fw-medium">{selectedHospital.id}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Registration Number</small>
                        <div className="fw-medium">{selectedHospital.registration_number || 'HOSP-NG-2024-' + selectedHospital.id}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Hospital Type</small>
                        <div className="fw-medium text-capitalize">{selectedHospital.hospital_type || selectedHospital.type}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Verification Status</small>
                        <div className="fw-medium">
                          {selectedHospital.is_verified ? (
                            <Badge bg="success"><i className="ri-verified-badge-line me-1"></i>Verified</Badge>
                          ) : (
                            <Badge bg="warning"><i className="ri-time-line me-1"></i>Pending Verification</Badge>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body>
                      <h6 className="fw-semibold mb-3">
                        <i className="ri-map-pin-line me-2 text-primary"></i>
                        Location & Contact
                      </h6>
                      <div className="mb-2">
                        <small className="text-secondary">Full Address</small>
                        <div className="fw-medium">{selectedHospital.address || selectedHospital.location || 'Not provided'}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Phone Number</small>
                        <div className="fw-medium">
                          <a href={`tel:${selectedHospital.phone}`} className="text-decoration-none">
                            <i className="ri-phone-line me-1"></i>{selectedHospital.phone || 'Not provided'}
                          </a>
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Email Address</small>
                        <div className="fw-medium">
                          <a href={`mailto:${selectedHospital.email}`} className="text-decoration-none">
                            <i className="ri-mail-line me-1"></i>{selectedHospital.email || 'Not provided'}
                          </a>
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Website</small>
                        <div className="fw-medium">
                          {selectedHospital.website ? (
                            <a href={selectedHospital.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                              <i className="ri-global-line me-1"></i>{selectedHospital.website}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Emergency Contact</small>
                        <div className="fw-medium">
                          <i className="ri-phone-fill me-1 text-danger"></i>
                          {selectedHospital.emergency_contact || selectedHospital.emergencyContact || 'Not provided'}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Postal Code</small>
                        <div className="fw-medium">
                          {selectedHospital.postal_code || selectedHospital.postalCode || 'Not provided'}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Additional Information */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body>
                      <h6 className="fw-semibold mb-3">
                        <i className="ri-shield-check-line me-2 text-primary"></i>
                        Accreditation & Verification
                      </h6>
                      <div className="mb-2">
                        <small className="text-secondary">Verification Status</small>
                        <div className="fw-medium">
                          {selectedHospital.is_verified ? (
                            <span className="text-success"><i className="ri-checkbox-circle-fill me-1"></i>Verified</span>
                          ) : (
                            <span className="text-warning"><i className="ri-time-line me-1"></i>Pending Verification</span>
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Verification Date</small>
                        <div className="fw-medium">
                          {selectedHospital.verification_date || selectedHospital.verificationDate ? (
                            new Date(selectedHospital.verification_date || selectedHospital.verificationDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          ) : selectedHospital.is_verified ? (
                            <span className="text-muted">Date not recorded</span>
                          ) : (
                            <span className="text-muted">Not verified</span>
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Accreditation Status</small>
                        <div className="fw-medium">
                          {selectedHospital.accreditation_status || selectedHospital.accreditationStatus ? (
                            <span className="text-success"><i className="ri-award-fill me-1"></i>Accredited</span>
                          ) : (
                            <span className="text-muted">Not accredited</span>
                          )}
                        </div>
                      </div>
                      {(selectedHospital.accreditation_expiry || selectedHospital.accreditationExpiry) && (
                        <div className="mb-2">
                          <small className="text-secondary">Accreditation Expiry</small>
                          <div className="fw-medium">
                            {new Date(selectedHospital.accreditation_expiry || selectedHospital.accreditationExpiry).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body>
                      <h6 className="fw-semibold mb-3">
                        <i className="ri-map-2-line me-2 text-primary"></i>
                        Geographic Information
                      </h6>
                      <div className="mb-2">
                        <small className="text-secondary">Country</small>
                        <div className="fw-medium">{selectedHospital.country || 'Nigeria'}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">State</small>
                        <div className="fw-medium">{selectedHospital.state || 'Not specified'}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">City</small>
                        <div className="fw-medium">{selectedHospital.city || 'Not specified'}</div>
                      </div>
                      {(selectedHospital.latitude || selectedHospital.longitude) && (
                        <div className="mb-2">
                          <small className="text-secondary">Coordinates</small>
                          <div className="fw-medium">
                            <i className="ri-map-pin-line me-1"></i>
                            {selectedHospital.latitude}, {selectedHospital.longitude}
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Operational Information */}
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="border-0 bg-success-subtle h-100">
                    <Card.Body className="text-center">
                      <i className="ri-hotel-bed-line fs-48 text-success mb-2"></i>
                      <h5 className="fw-bold">{selectedHospital.bed_capacity || selectedHospital.bedCapacity || 0}</h5>
                      <small className="text-secondary">Total Bed Capacity</small>
                      <div className="mt-2">
                        <small className="fw-medium">Current Occupancy: {selectedHospital.currentOccupancy || '0%'}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 bg-primary-subtle h-100">
                    <Card.Body className="text-center">
                      <i className="ri-file-list-line fs-48 text-primary mb-2"></i>
                      <h6 className="fw-bold">{selectedHospital.licenses}</h6>
                      <small className="text-secondary">License Status</small>
                      <div className="mt-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewLicenses(selectedHospital)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 bg-warning-subtle h-100">
                    <Card.Body className="text-center">
                      <i className="ri-shield-check-line fs-48 text-warning mb-2"></i>
                      <h6 className="fw-bold">
                        {selectedHospital.is_verified ? 'Active' : 'Pending'}
                      </h6>
                      <small className="text-secondary">Operational Status</small>
                      <div className="mt-2">
                        <Badge bg={selectedHospital.is_verified ? 'success' : 'warning'}>
                          {selectedHospital.is_verified ? 'Operational' : 'Under Review'}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Services & Facilities */}
              <Row className="mb-4">
                <Col md={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="fw-semibold mb-3">
                        <i className="ri-service-line me-2 text-primary"></i>
                        Services & Facilities
                      </h6>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="fw-medium mb-2">Emergency Services</h6>
                            <div className="d-flex align-items-center">
                              {(selectedHospital.emergencyUnit || selectedHospital.emergency_unit) ? (
                                <>
                                  <i className="ri-checkbox-circle-fill text-success me-2"></i>
                                  <span className="text-success">24/7 Emergency Unit Available</span>
                                </>
                              ) : (
                                <>
                                  <i className="ri-close-circle-fill text-danger me-2"></i>
                                  <span className="text-danger">No Emergency Unit</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mb-3">
                            <h6 className="fw-medium mb-2">Intensive Care Unit</h6>
                            <div className="d-flex align-items-center">
                              {(selectedHospital.icuUnit || selectedHospital.icu_unit) ? (
                                <>
                                  <i className="ri-checkbox-circle-fill text-success me-2"></i>
                                  <span className="text-success">ICU Available</span>
                                </>
                              ) : (
                                <>
                                  <i className="ri-close-circle-fill text-danger me-2"></i>
                                  <span className="text-danger">No ICU Unit</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="fw-medium mb-2">Specialized Services</h6>
                            <div className="mb-1">
                              <Badge bg="info" className="me-1 mb-1">General Medicine</Badge>
                              <Badge bg="info" className="me-1 mb-1">Surgery</Badge>
                              <Badge bg="info" className="me-1 mb-1">Pediatrics</Badge>
                            </div>
                            <div>
                              <Badge bg="info" className="me-1 mb-1">Maternity</Badge>
                              <Badge bg="info" className="me-1 mb-1">Cardiology</Badge>
                              <Badge bg="info" className="me-1 mb-1">Diagnostics</Badge>
                            </div>
                          </div>
                          <div className="mb-3">
                            <h6 className="fw-medium mb-2">Operating Hours</h6>
                            <span className="text-success">
                              <i className="ri-time-line me-1"></i>24/7 Operations
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              </div>
              )}

              {/* Licenses & Compliance Tab */}
              {activeTab === 'licenses' && (
              <div>
                <Row className="mb-4">
                  <Col md={12}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="fw-semibold mb-3">
                          <i className="ri-file-shield-line me-2 text-primary"></i>
                          Government Licenses
                        </h6>
                        {selectedHospital.licensesDetails && selectedHospital.licensesDetails.length > 0 ? (
                          <Row>
                            {selectedHospital.licensesDetails.map((license, index) => (
                              <Col md={6} key={index} className="mb-3">
                                <Card className="border-start border-4 border-primary h-100">
                                  <Card.Body>
                                    <h6 className="fw-semibold mb-2">{license.license_name}</h6>
                                    <div className="mb-2">
                                      <small className="text-secondary">License Number</small>
                                      <div className="fw-medium">{license.license_number}</div>
                                    </div>
                                    <div className="mb-2">
                                      <small className="text-secondary">Type</small>
                                      <div className="fw-medium text-capitalize">{license.license_type}</div>
                                    </div>
                                    <div className="mb-2">
                                      <small className="text-secondary">Status</small>
                                      <div>
                                        <Badge bg={license.status === 'active' ? 'success' : 'warning'}>
                                          {license.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                      {license.issue_date && (
                                        <div>
                                          <small className="text-secondary">Issue Date</small>
                                          <div className="fw-medium">{new Date(license.issue_date).toLocaleDateString()}</div>
                                        </div>
                                      )}
                                      {license.expiration_date && (
                                        <div>
                                          <small className="text-secondary">Expires</small>
                                          <div className="fw-medium">{new Date(license.expiration_date).toLocaleDateString()}</div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Admin Actions */}
                                    <div className="mt-3 pt-3 border-top">
                                      {license.license_certificate && (
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="me-2"
                                          onClick={() => window.open(license.license_certificate, '_blank')}
                                        >
                                          <i className="ri-file-text-line me-1"></i>
                                          View Certificate
                                        </Button>
                                      )}

                                      {/* Show Approve button for pending/revoked licenses */}
                                      {license.status !== 'active' && (
                                        <Button
                                          variant="outline-success"
                                          size="sm"
                                          className="me-2"
                                          onClick={() => handleApproveLicense(license)}
                                        >
                                          <i className="ri-checkbox-circle-line me-1"></i>
                                          Approve
                                        </Button>
                                      )}

                                      {/* Show Reject/Revoke button for pending/active licenses */}
                                      {(license.status === 'pending' || license.status === 'active' || license.status === 'under_review') && (
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => handleRejectLicense(license)}
                                        >
                                          <i className="ri-close-circle-line me-1"></i>
                                          {license.status === 'active' ? 'Revoke' : 'Reject'}
                                        </Button>
                                      )}
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        ) : (
                          <div className="text-center p-4">
                            <i className="ri-file-warning-line fs-48 text-warning mb-3"></i>
                            <h6>No License Records</h6>
                            <p className="text-secondary">This hospital has no license records in the system.</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Next Steps for Hospital Verification */}
                <Row className="mt-4">
                  <Col md={12}>
                    <Card className="border-0 bg-success bg-opacity-10 border-success">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            <i className="ri-checkbox-circle-line fs-48 text-success"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-semibold text-success mb-2">
                              ✓ All Required Licenses Approved!
                            </h6>
                            <p className="text-secondary mb-0">
                              {selectedHospital.is_verified ? (
                                <>This hospital is verified and can now operate on the PHB platform.</>
                              ) : (
                                <>This hospital has met all license requirements. You can now verify this hospital to allow them to operate on the platform.</>
                              )}
                            </p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
              )}

              {/* Pharmacies Tab */}
              {activeTab === 'pharmacies' && (
              <div>
                <Row className="mb-3">
                  <Col>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="fw-semibold mb-0">
                        <i className="ri-medicine-bottle-line me-2 text-primary"></i>
                        Hospital Pharmacies
                      </h6>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          // TODO: Open Add Pharmacy Modal
                          alert('Add Pharmacy feature coming soon!');
                        }}
                      >
                        <i className="ri-add-line me-1"></i>Add Pharmacy
                      </Button>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <p className="text-center text-secondary mb-0">
                          <i className="ri-medicine-bottle-line fs-48 mb-3 d-block"></i>
                          Pharmacy management feature will be available here.
                          <br />
                          <small>Create and manage hospital-affiliated pharmacies for prescription services.</small>
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={4}>
                    <Card className="border-0 bg-light text-center">
                      <Card.Body>
                        <i className="ri-store-line fs-48 text-info mb-2 d-block"></i>
                        <h6 className="fw-bold">0</h6>
                        <small className="text-secondary">Total Pharmacies</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 bg-light text-center">
                      <Card.Body>
                        <i className="ri-checkbox-circle-line fs-48 text-success mb-2 d-block"></i>
                        <h6 className="fw-bold">0</h6>
                        <small className="text-secondary">Active Pharmacies</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 bg-light text-center">
                      <Card.Body>
                        <i className="ri-file-list-line fs-48 text-warning mb-2 d-block"></i>
                        <h6 className="fw-bold">0</h6>
                        <small className="text-secondary">Pending Verification</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
              )}

              {/* Staff & Operations Tab */}
              {activeTab === 'staff' && (
              <div>
                {contactsData.loading && (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading contact data...</span>
                    </div>
                    <p className="mt-2 text-secondary">Loading administrative contacts...</p>
                  </div>
                )}

                {contactsData.error && (
                  <Card className="border-0 bg-danger-subtle">
                    <Card.Body className="text-center p-4">
                      <i className="ri-error-warning-line fs-48 text-danger mb-3 d-block"></i>
                      <h6 className="fw-semibold text-danger mb-2">Error Loading Contacts</h6>
                      <p className="text-danger mb-0">{contactsData.error}</p>
                    </Card.Body>
                  </Card>
                )}

                {!contactsData.loading && !contactsData.error && (
                  <>
                    {/* Primary Contact Information */}
                    <Card className="border-0 mb-4">
                      <Card.Header className="bg-white">
                        <h6 className="fw-semibold mb-0">
                          <i className="ri-contacts-line me-2 text-primary"></i>
                          Primary Contact Information
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-secondary small">Email Address</label>
                              <div className="d-flex align-items-center">
                                <i className="ri-mail-line me-2 text-primary"></i>
                                <span className="fw-medium">
                                  {contactsData.primaryContacts.email || '—'}
                                </span>
                              </div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-secondary small">Phone Number</label>
                              <div className="d-flex align-items-center">
                                <i className="ri-phone-line me-2 text-primary"></i>
                                <span className="fw-medium">
                                  {contactsData.primaryContacts.phone || '—'}
                                </span>
                              </div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-secondary small">Emergency Contact</label>
                              <div className="d-flex align-items-center">
                                <i className="ri-alarm-warning-line me-2 text-danger"></i>
                                <span className="fw-medium">
                                  {contactsData.primaryContacts.emergency_contact || '—'}
                                </span>
                              </div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="text-secondary small">Website</label>
                              <div className="d-flex align-items-center">
                                <i className="ri-global-line me-2 text-info"></i>
                                {contactsData.primaryContacts.website ? (
                                  <a href={contactsData.primaryContacts.website} target="_blank" rel="noopener noreferrer" className="fw-medium">
                                    {contactsData.primaryContacts.website}
                                  </a>
                                ) : (
                                  <span className="fw-medium">—</span>
                                )}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* Hospital Administrators */}
                    <Card className="border-0 mb-4">
                      <Card.Header className="bg-white">
                        <h6 className="fw-semibold mb-0">
                          <i className="ri-admin-line me-2 text-warning"></i>
                          Hospital Administrators ({contactsData.hospitalAdmins.length})
                        </h6>
                      </Card.Header>
                      <Card.Body className="p-0">
                        {contactsData.hospitalAdmins.length === 0 ? (
                          <div className="text-center p-5">
                            <i className="ri-user-settings-line fs-48 text-secondary mb-3 d-block"></i>
                            <h6 className="fw-semibold mb-2 text-secondary">No Administrators</h6>
                            <p className="text-secondary mb-0">
                              No hospital administrators have been assigned yet.
                            </p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover mb-0">
                              <thead className="bg-light">
                                <tr>
                                  <th className="fw-semibold">Name</th>
                                  <th className="fw-semibold">Position</th>
                                  <th className="fw-semibold">Email</th>
                                  <th className="fw-semibold">Contact Email</th>
                                  <th className="fw-semibold">Phone</th>
                                </tr>
                              </thead>
                              <tbody>
                                {contactsData.hospitalAdmins.map((admin) => (
                                  <tr key={admin.id}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="avatar avatar-sm bg-warning-subtle text-warning me-2">
                                          <i className="ri-shield-user-line"></i>
                                        </div>
                                        <div>
                                          <div className="fw-medium">{admin.name}</div>
                                          {admin.user && (
                                            <small className="text-secondary">
                                              {admin.user.first_name} {admin.user.last_name}
                                            </small>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <Badge bg="warning-subtle" className="text-warning">
                                        {admin.position}
                                      </Badge>
                                    </td>
                                    <td>
                                      <div>
                                        <i className="ri-mail-line me-1 text-secondary"></i>
                                        {admin.email}
                                      </div>
                                    </td>
                                    <td>
                                      {admin.contact_email ? (
                                        <div>
                                          <i className="ri-mail-send-line me-1 text-secondary"></i>
                                          {admin.contact_email}
                                        </div>
                                      ) : (
                                        <span className="text-secondary">—</span>
                                      )}
                                    </td>
                                    <td>
                                      {admin.user?.phone ? (
                                        <div>
                                          <i className="ri-phone-line me-1 text-secondary"></i>
                                          {admin.user.phone}
                                        </div>
                                      ) : (
                                        <span className="text-secondary">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </Card.Body>
                    </Card>

                    {/* Registered Users */}
                    {contactsData.registeredUsers.length > 0 && (
                      <Card className="border-0">
                        <Card.Header className="bg-white">
                          <h6 className="fw-semibold mb-0">
                            <i className="ri-user-add-line me-2 text-success"></i>
                            Registered Users ({contactsData.registeredUsers.length})
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                          <div className="table-responsive">
                            <table className="table table-hover mb-0">
                              <thead className="bg-light">
                                <tr>
                                  <th className="fw-semibold">Name</th>
                                  <th className="fw-semibold">Email</th>
                                  <th className="fw-semibold">Phone</th>
                                  <th className="fw-semibold">Role</th>
                                  <th className="fw-semibold">Registered Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {contactsData.registeredUsers.map((user) => (
                                  <tr key={user.id}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="avatar avatar-sm bg-success-subtle text-success me-2">
                                          <i className="ri-user-line"></i>
                                        </div>
                                        <div className="fw-medium">{user.name}</div>
                                      </div>
                                    </td>
                                    <td>
                                      <i className="ri-mail-line me-1 text-secondary"></i>
                                      {user.email}
                                    </td>
                                    <td>
                                      {user.phone ? (
                                        <div>
                                          <i className="ri-phone-line me-1 text-secondary"></i>
                                          {user.phone}
                                        </div>
                                      ) : (
                                        <span className="text-secondary">—</span>
                                      )}
                                    </td>
                                    <td>
                                      <Badge bg="info-subtle" className="text-info">
                                        {user.role || 'user'}
                                      </Badge>
                                    </td>
                                    <td>
                                      <small className="text-secondary">
                                        {user.registered_at ? new Date(user.registered_at).toLocaleDateString() : '—'}
                                      </small>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </>
                )}
              </div>
              )}

              {/* Certifications Tab */}
              {activeTab === 'certifications' && (
              <div>
                {/* Accreditation Status */}
                <Card className="border-0 mb-4">
                  <Card.Header className="bg-white">
                    <h6 className="fw-semibold mb-0">
                      <i className="ri-shield-check-line me-2 text-primary"></i>
                      Hospital Accreditation Status
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">Accreditation Status</label>
                          <div className="d-flex align-items-center mt-1">
                            {selectedHospital?.is_verified ? (
                              <>
                                <Badge bg="success" className="me-2">
                                  <i className="ri-checkbox-circle-line me-1"></i>
                                  Accredited
                                </Badge>
                                <span className="text-success small">Hospital is accredited and verified</span>
                              </>
                            ) : (
                              <>
                                <Badge bg="secondary" className="me-2">
                                  <i className="ri-close-circle-line me-1"></i>
                                  Not Accredited
                                </Badge>
                                <span className="text-secondary small">Pending accreditation review</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">Hospital Type</label>
                          <div className="mt-1">
                            <Badge bg="info-subtle" className="text-info">
                              {selectedHospital?.hospital_type || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Quality Certifications */}
                <Card className="border-0">
                  <Card.Header className="bg-white">
                    <h6 className="fw-semibold mb-0">
                      <i className="ri-award-line me-2 text-warning"></i>
                      Quality Certifications & Awards
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center p-5">
                      <i className="ri-medal-line fs-48 text-secondary mb-3 d-block"></i>
                      <h6 className="fw-semibold mb-2 text-secondary">No Certifications Added</h6>
                      <p className="text-secondary mb-3">
                        This hospital has not added any quality certifications or awards yet.
                      </p>
                      <p className="text-secondary small mb-0">
                        <i className="ri-information-line me-1"></i>
                        Hospitals can add certifications such as JCI, ISO 9001, NABH, or regional health authority certifications.
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
              )}

              {/* Administration Tab */}
              {activeTab === 'administration' && (
              <div>
                {/* Medical Director Section */}
                <Card className="border-0 mb-4">
                  <Card.Header className="bg-white">
                    <h6 className="fw-semibold mb-0">
                      <i className="ri-user-star-line me-2 text-primary"></i>
                      Medical Director
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">Name</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.medical_director_name || 'Not specified'}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">License Number</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.medical_director_license || 'Not specified'}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">Specialization</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.medical_director_specialization || 'Not specified'}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">Years of Experience</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.medical_director_years_experience || '0'} years
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Primary & Administrative Contacts */}
                <Row className="mb-4">
                  <Col md={6}>
                    <Card className="border-0 h-100">
                      <Card.Header className="bg-white">
                        <h6 className="fw-semibold mb-0">
                          <i className="ri-user-line me-2 text-primary"></i>
                          Primary Contact
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <label className="text-secondary small">Name</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.primary_contact_name || 'Not specified'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-secondary small">Title</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.primary_contact_title || 'Not specified'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-secondary small">Phone</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.primary_contact_phone ? (
                              <a href={`tel:${selectedHospital.primary_contact_phone}`} className="text-decoration-none">
                                <i className="ri-phone-line me-1"></i>{selectedHospital.primary_contact_phone}
                              </a>
                            ) : 'Not specified'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-secondary small">Email</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.primary_contact_email ? (
                              <a href={`mailto:${selectedHospital.primary_contact_email}`} className="text-decoration-none">
                                <i className="ri-mail-line me-1"></i>{selectedHospital.primary_contact_email}
                              </a>
                            ) : 'Not specified'}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 h-100">
                      <Card.Header className="bg-white">
                        <h6 className="fw-semibold mb-0">
                          <i className="ri-user-settings-line me-2 text-primary"></i>
                          Administrative Contact
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <label className="text-secondary small">Name</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.administrative_contact_name || 'Not specified'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-secondary small">Title</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.administrative_contact_title || 'Not specified'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-secondary small">Phone</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.administrative_contact_phone ? (
                              <a href={`tel:${selectedHospital.administrative_contact_phone}`} className="text-decoration-none">
                                <i className="ri-phone-line me-1"></i>{selectedHospital.administrative_contact_phone}
                              </a>
                            ) : 'Not specified'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-secondary small">Email</label>
                          <div className="fw-medium mt-1">
                            {selectedHospital?.administrative_contact_email ? (
                              <a href={`mailto:${selectedHospital.administrative_contact_email}`} className="text-decoration-none">
                                <i className="ri-mail-line me-1"></i>{selectedHospital.administrative_contact_email}
                              </a>
                            ) : 'Not specified'}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Financial Information */}
                <Card className="border-0 mb-4">
                  <Card.Header className="bg-white">
                    <h6 className="fw-semibold mb-0">
                      <i className="ri-money-dollar-circle-line me-2 text-success"></i>
                      Financial Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <div className="mb-3">
                          <label className="text-secondary small">Government License Fees</label>
                          <div className="fw-medium mt-1 text-success">
                            ₦{(selectedHospital?.government_license_fees || 0).toLocaleString()}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-3">
                          <label className="text-secondary small">Certification Fees</label>
                          <div className="fw-medium mt-1 text-success">
                            ₦{(selectedHospital?.certification_fees || 0).toLocaleString()}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-3">
                          <label className="text-secondary small">Total Registration Fees</label>
                          <div className="fw-bold mt-1 text-primary fs-5">
                            ₦{(selectedHospital?.total_registration_fees || 0).toLocaleString()}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Staffing Requirements */}
                <Card className="border-0 mb-4">
                  <Card.Header className="bg-white">
                    <h6 className="fw-semibold mb-0">
                      <i className="ri-team-line me-2 text-primary"></i>
                      Staffing Requirements
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">Minimum Doctors Required</label>
                          <div className="fw-medium mt-1">
                            <i className="ri-stethoscope-line me-1 text-primary"></i>
                            {selectedHospital?.minimum_doctors_required || 10} doctors
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="text-secondary small">Minimum Nurses Required</label>
                          <div className="fw-medium mt-1">
                            <i className="ri-nurse-line me-1 text-primary"></i>
                            {selectedHospital?.minimum_nurses_required || 25} nurses
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Digital Infrastructure */}
                <Card className="border-0">
                  <Card.Header className="bg-white">
                    <h6 className="fw-semibold mb-0">
                      <i className="ri-cloud-line me-2 text-info"></i>
                      Digital Infrastructure & Capabilities
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {selectedHospital?.has_hospital_information_system ? (
                              <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                            ) : (
                              <i className="ri-close-circle-fill text-secondary fs-5"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">Hospital Information System (HIS)</div>
                            <small className="text-secondary">Core hospital management software</small>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {selectedHospital?.has_electronic_medical_records ? (
                              <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                            ) : (
                              <i className="ri-close-circle-fill text-secondary fs-5"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">Electronic Medical Records (EMR)</div>
                            <small className="text-secondary">Digital patient records system</small>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {selectedHospital?.has_telemedicine_capabilities ? (
                              <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                            ) : (
                              <i className="ri-close-circle-fill text-secondary fs-5"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">Telemedicine Capabilities</div>
                            <small className="text-secondary">Remote consultation services</small>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {selectedHospital?.has_online_appointment_booking ? (
                              <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                            ) : (
                              <i className="ri-close-circle-fill text-secondary fs-5"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">Online Appointment Booking</div>
                            <small className="text-secondary">Web-based appointment system</small>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {selectedHospital?.has_patient_portal ? (
                              <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                            ) : (
                              <i className="ri-close-circle-fill text-secondary fs-5"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">Patient Portal</div>
                            <small className="text-secondary">Patient self-service portal</small>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {selectedHospital?.has_mobile_application ? (
                              <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                            ) : (
                              <i className="ri-close-circle-fill text-secondary fs-5"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">Mobile Application</div>
                            <small className="text-secondary">iOS/Android mobile app</small>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {selectedHospital?.has_api_integration ? (
                              <i className="ri-checkbox-circle-fill text-success fs-5"></i>
                            ) : (
                              <i className="ri-close-circle-fill text-secondary fs-5"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">API Integration</div>
                            <small className="text-secondary">Integration with external systems</small>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={() => handleViewLicenses(selectedHospital)}>
            <i className="ri-file-list-line me-1"></i>View Licenses
          </Button>
          <Button variant="primary" onClick={() => handleEditHospital(selectedHospital)}>
            <i className="ri-edit-line me-1"></i>Edit Hospital
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Hospital Licenses Modal */}
      <Modal show={showLicensesModal} onHide={() => setShowLicensesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-file-list-line me-2"></i>
            {selectedHospital?.name} - Licenses
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHospital && (
            <>
              {selectedHospital.licensesDetails && selectedHospital.licensesDetails.length > 0 ? (
                <div>
                  <div className="mb-3">
                    <h6 className="fw-semibold">License Summary: {selectedHospital.licenses}</h6>
                  </div>
                  {selectedHospital.licensesDetails.map((license, index) => (
                    <Card key={index} className="mb-3 border-start border-4 border-primary">
                      <Card.Body>
                        <Row>
                          <Col md={8}>
                            <h6 className="fw-semibold mb-1">{license.license_name}</h6>
                            <div className="mb-2">
                              <small className="text-secondary">License Number</small>
                              <div className="fw-medium">{license.license_number}</div>
                            </div>
                            <div className="mb-2">
                              <small className="text-secondary">Type</small>
                              <div className="fw-medium text-capitalize">{license.license_type}</div>
                            </div>
                          </Col>
                          <Col md={4} className="text-end">
                            <div className="mb-2">
                              <small className="text-secondary">Status</small>
                              <div>
                                <Badge bg={license.status === 'active' ? 'success' : 'warning'}>
                                  {license.status}
                                </Badge>
                              </div>
                            </div>
                            {license.issue_date && (
                              <div className="mb-2">
                                <small className="text-secondary">Issue Date</small>
                                <div className="fw-medium">{new Date(license.issue_date).toLocaleDateString()}</div>
                              </div>
                            )}
                            {license.expiration_date && (
                              <div>
                                <small className="text-secondary">Expires</small>
                                <div className="fw-medium">{new Date(license.expiration_date).toLocaleDateString()}</div>
                              </div>
                            )}
                          </Col>
                        </Row>

                        {/* Admin Actions */}
                        <div className="mt-3 pt-3 border-top">
                          {license.license_certificate && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => window.open(license.license_certificate, '_blank')}
                            >
                              <i className="ri-file-text-line me-1"></i>
                              View Certificate
                            </Button>
                          )}

                          {/* Show Approve button for pending/revoked licenses */}
                          {license.status !== 'active' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleApproveLicense(license)}
                            >
                              <i className="ri-checkbox-circle-line me-1"></i>
                              Approve
                            </Button>
                          )}

                          {/* Show Reject/Revoke button for pending/active licenses */}
                          {(license.status === 'pending' || license.status === 'active' || license.status === 'under_review') && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRejectLicense(license)}
                            >
                              <i className="ri-close-circle-line me-1"></i>
                              {license.status === 'active' ? 'Revoke' : 'Reject'}
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <i className="ri-file-warning-line fs-48 text-warning mb-3"></i>
                  <h6>No License Records</h6>
                  <p className="text-secondary">{selectedHospital.name} has no license records in the system.</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLicensesModal(false)}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={handleAddLicense}>
            <i className="ri-add-line me-1"></i>Add License
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add License Modal */}
      <Modal show={showAddLicenseModal} onHide={() => setShowAddLicenseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-add-line me-2"></i>
            Add License for {selectedHospital?.name}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitLicense}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="license_number"
                    value={licenseFormData.license_number}
                    onChange={handleLicenseFormChange}
                    placeholder="e.g., NG-HOS-2025-001"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="license_type"
                    value={licenseFormData.license_type}
                    onChange={handleLicenseFormChange}
                    required
                  >
                    <option value="operating">Operating License</option>
                    <option value="emergency">Emergency Services</option>
                    <option value="surgical">Surgical Services</option>
                    <option value="maternity">Maternity Services</option>
                    <option value="icu">ICU/Critical Care</option>
                    <option value="psychiatric">Psychiatric Services</option>
                    <option value="pediatric">Pediatric Services</option>
                    <option value="radiology">Radiology/Imaging</option>
                    <option value="laboratory">Laboratory Services</option>
                    <option value="pharmacy">Hospital Pharmacy</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>License Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="license_name"
                value={licenseFormData.license_name}
                onChange={handleLicenseFormChange}
                placeholder="e.g., Hospital Operating License"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>License Category</Form.Label>
              <Form.Control
                type="text"
                name="license_category"
                value={licenseFormData.license_category}
                onChange={handleLicenseFormChange}
                placeholder="e.g., General Medical Services"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Issue Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="issue_date"
                    value={licenseFormData.issue_date}
                    onChange={handleLicenseFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Effective Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="effective_date"
                    value={licenseFormData.effective_date}
                    onChange={handleLicenseFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiration Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expiration_date"
                    value={licenseFormData.expiration_date}
                    onChange={handleLicenseFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>License Certificate (PDF/Image)</Form.Label>
              <Form.Control
                type="file"
                name="license_certificate"
                onChange={handleLicenseFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Form.Text className="text-muted">
                Upload scanned copy of the license certificate
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="conditions"
                value={licenseFormData.conditions}
                onChange={handleLicenseFormChange}
                placeholder="Any conditions or restrictions on the license"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Limitations</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="limitations"
                value={licenseFormData.limitations}
                onChange={handleLicenseFormChange}
                placeholder="Any limitations specified in the license"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={licenseFormData.notes}
                onChange={handleLicenseFormChange}
                placeholder="Additional notes about the license"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAddLicenseModal(false)}
              disabled={licenseSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={licenseSubmitting}
            >
              {licenseSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Adding License...
                </>
              ) : (
                <>
                  <i className="ri-save-line me-1"></i>Add License
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Hospital Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-edit-line me-2"></i>
            Edit {selectedHospital?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center p-4">
            <i className="ri-tools-line fs-48 text-primary mb-3"></i>
            <h6>Edit Hospital Form</h6>
            <p className="text-secondary">
              This would open a comprehensive form to edit:
              <br />• Basic Information & Contact Details
              <br />• Capacity Settings & Operational Hours
              <br />• License Management & Compliance
              <br />• Staff Assignments & Departments
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            <i className="ri-save-line me-1"></i>Open Edit Form
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Suspend Hospital Modal */}
      <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <i className="ri-error-warning-line me-2"></i>
            Suspend Hospital
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHospital && (
            <div>
              <Alert variant="warning" className="mb-3">
                <Alert.Heading className="h6">⚠️ Warning</Alert.Heading>
                You are about to suspend <strong>{selectedHospital.name}</strong>
              </Alert>
              
              <h6 className="fw-semibold mb-2">This action will:</h6>
              <ul className="mb-3">
                <li>Disable new appointment bookings</li>
                <li>Notify all existing patients</li>
                <li>Mark all pending appointments for review</li>
                <li>Require administrator approval to reactivate</li>
                <li>Log this incident for compliance review</li>
              </ul>
              
              <p className="text-secondary">
                <strong>Note:</strong> Existing patients with scheduled appointments will be contacted 
                to arrange alternative arrangements. Emergency services will not be affected.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmSuspendHospital}>
            <i className="ri-error-warning-line me-1"></i>Confirm Suspension
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  )
}