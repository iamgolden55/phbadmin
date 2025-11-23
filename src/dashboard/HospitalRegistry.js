import React, { useState, useEffect } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { 
  Button, 
  Card, 
  Col, 
  Row, 
  Form, 
  Nav, 
  Spinner, 
  Alert, 
  Badge,
  InputGroup,
  ProgressBar
} from "react-bootstrap";
import hospitalService from "../services/hospitalService";

export default function HospitalRegistry() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formProgress, setFormProgress] = useState(20);
  const [registeredHospital, setRegisteredHospital] = useState(null);

  // Hospital Form Data State
  const [hospitalData, setHospitalData] = useState({
    // Basic Information
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    city: "",
    state: "",
    country: "Nigeria",
    postal_code: "",
    latitude: "",
    longitude: "",
    registration_number: "",
    hospital_type: "private",
    bed_capacity: 0,
    emergency_unit: true,
    icu_unit: true,
    emergency_contact: "",
    
    // Government Licenses
    government_licenses: [],
    
    // Quality Certifications
    quality_certifications: [],
    
    // Insurance Relationships
    insurance_relationships: [],
    
    // Staff Requirements
    medical_director: {
      name: "",
      license_number: "",
      specialization: "",
      years_experience: 0
    },
    minimum_doctors: 10,
    minimum_nurses: 25,
    
    // Operational Requirements
    operating_hours: "24/7",
    ambulance_services: true,
    laboratory_services: true,
    pharmacy_services: true,
    imaging_services: ["X-ray", "CT", "MRI", "Ultrasound"],
    specialized_units: ["ICU", "CCU", "NICU", "Emergency"],
    languages_supported: ["English"],
    accessibility_features: ["wheelchair_access"],
    
    // Financial Information
    registration_fees_paid: {
      government_licenses: 0,
      certification_applications: 0,
      total_paid: 0,
      currency: "NGN"
    },
    
    // Contact Information
    primary_contact: {
      name: "",
      title: "",
      phone: "",
      email: ""
    },
    administrative_contact: {
      name: "",
      title: "",
      phone: "",
      email: ""
    },
    
    // Digital Capabilities
    has_hospital_information_system: false,
    electronic_medical_records: false,
    telemedicine_capabilities: false,
    online_appointment_booking: false,
    patient_portal: false,
    mobile_app: false,
    api_integration_ready: false
  });

  // Available options for form dropdowns
  const hospitalTypes = [
    { value: "public", label: "Public Hospital" },
    { value: "private", label: "Private Hospital" },
    { value: "specialist", label: "Specialist Hospital" },
    { value: "teaching", label: "Teaching Hospital" },
    { value: "clinic", label: "Clinic" },
    { value: "research", label: "Research Hospital" }
  ];

  const imagingServices = [
    "X-ray", "CT", "MRI", "Ultrasound", "Mammography", 
    "Nuclear Medicine", "PET Scan", "Angiography"
  ];

  const specializedUnits = [
    "ICU", "CCU", "NICU", "PICU", "Emergency", "Surgery", 
    "Dialysis", "Oncology", "Radiology", "Laboratory"
  ];

  const languages = [
    "English", "Yoruba", "Igbo", "Hausa", "Fulani", 
    "Kanuri", "Tiv", "Ijaw", "Efik", "French"
  ];

  const accessibilityFeatures = [
    "wheelchair_access", "hearing_assistance", "visual_assistance",
    "braille_signage", "elevator_access", "accessible_parking"
  ];

  // Form validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return hospitalData.name && hospitalData.address && hospitalData.phone && hospitalData.email;
      case 2:
        return hospitalData.bed_capacity > 0;
      case 3:
        return hospitalData.medical_director.name && hospitalData.medical_director.license_number;
      case 4:
        return hospitalData.primary_contact.name && hospitalData.primary_contact.email;
      default:
        return true;
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setHospitalData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setHospitalData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle array field changes (checkboxes)
  const handleArrayChange = (field, value, checked) => {
    setHospitalData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  // Generate registration number
  const generateRegistrationNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HOSP-NG-${year}-${randomNum}`;
  };

  // Reset form to initial state
  const resetForm = () => {
    setCurrentStep(1);
    setFormProgress(20);
    setError(null);
    setSuccess(null);
    setRegisteredHospital(null);
    setHospitalData({
      // Basic Information
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      city: "",
      state: "",
      country: "Nigeria",
      postal_code: "",
      latitude: "",
      longitude: "",
      registration_number: "",
      hospital_type: "private",
      bed_capacity: 0,
      emergency_unit: true,
      icu_unit: true,
      emergency_contact: "",
      
      // Government Licenses
      government_licenses: [],
      
      // Quality Certifications
      quality_certifications: [],
      
      // Insurance Relationships
      insurance_relationships: [],
      
      // Staff Requirements
      medical_director: {
        name: "",
        license_number: "",
        specialization: "",
        years_experience: 0
      },
      minimum_doctors: 10,
      minimum_nurses: 25,
      
      // Operational Requirements
      operating_hours: "24/7",
      ambulance_services: true,
      laboratory_services: true,
      pharmacy_services: true,
      imaging_services: ["X-ray", "CT", "MRI", "Ultrasound"],
      specialized_units: ["ICU", "CCU", "NICU", "Emergency"],
      languages_supported: ["English"],
      accessibility_features: ["wheelchair_access"],
      
      // Financial Information
      registration_fees_paid: {
        government_licenses: 0,
        certification_applications: 0,
        total_paid: 0,
        currency: "NGN"
      },
      
      // Contact Information
      primary_contact: {
        name: "",
        title: "",
        phone: "",
        email: ""
      },
      administrative_contact: {
        name: "",
        title: "",
        phone: "",
        email: ""
      },
      
      // Digital Capabilities
      has_hospital_information_system: false,
      electronic_medical_records: false,
      telemedicine_capabilities: false,
      online_appointment_booking: false,
      patient_portal: false,
      mobile_app: false,
      api_integration_ready: false
    });
  };

  // Print hospital registration document
  const printRegistration = (hospitalDetails = null) => {
    const hospital = hospitalDetails || registeredHospital || hospitalData;
    
    if (!hospital.name) {
      alert("No hospital data available to print.");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate HTML content for printing
    const printContent = generatePrintableContent(hospital);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Generate printable HTML content
  const generatePrintableContent = (hospital) => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hospital Registration Certificate - ${hospital.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          @page { margin: 15mm; size: A4; }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.5;
          color: #1a1a1a;
          background: #ffffff;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          position: relative;
        }
        
        /* PHB Watermark */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(112, 128, 144, 0.08);
          font-weight: 700;
          letter-spacing: 8px;
          z-index: 0;
          user-select: none;
          pointer-events: none;
        }
        
        .content {
          position: relative;
          z-index: 1;
          background: white;
        }
        
        /* Header Section */
        .header {
          background: #4a6741;
          color: white;
          padding: 25px 30px;
          margin: -20px -20px 40px -20px;
          position: relative;
        }
        
        .header .logo-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .header .logo-left {
          display: flex;
          align-items: center;
        }
        
        .header .logo-text {
          font-size: 28px;
          font-weight: 700;
          color: white;
          letter-spacing: 1px;
          margin-right: 15px;
        }
        
        .header .subtitle {
          font-size: 16px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .header .doc-type {
          font-size: 20px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .header .contact-info {
          font-size: 12px;
          color: white;
          text-align: right;
          line-height: 1.4;
        }
        
        /* Hospital Title Section */
        .hospital-title {
          background: #4a6741;
          color: white;
          padding: 15px 20px;
          margin-bottom: 25px;
          border-radius: 0;
        }
        
        .hospital-title h2 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .title-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .title-meta-item {
          background: rgba(255, 255, 255, 0.15);
          padding: 12px 16px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        
        .meta-label {
          font-size: 12px;
          opacity: 0.9;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .meta-value {
          font-size: 16px;
          font-weight: 600;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-verified {
          background: #d4edda;
          color: #155724;
        }
        
        .status-pending {
          background: #fff3cd;
          color: #856404;
        }
        
        /* Information Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 30px;
        }
        
        .info-section {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 25px;
        }
        
        .info-section h3 {
          background: #4a6741;
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin: -25px -25px 20px -25px;
          padding: 12px 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          padding: 8px 0;
        }
        
        .info-row:not(:last-child) {
          border-bottom: 1px solid #e9ecef;
        }
        
        .info-label {
          font-weight: 500;
          color: #495057;
          min-width: 40%;
          font-size: 14px;
        }
        
        .info-value {
          color: #1a1a1a;
          font-weight: 400;
          text-align: right;
          font-size: 14px;
          max-width: 55%;
          word-wrap: break-word;
        }
        
        /* Full Width Sections */
        .full-width-section {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
        }
        
        .full-width-section h3 {
          background: #4a6741;
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin: -25px -25px 20px -25px;
          padding: 12px 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .service-category h4 {
          font-size: 14px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 10px;
        }
        
        .service-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .service-item {
          background: #4a6741;
          color: white;
          padding: 4px 10px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .capability-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }
        
        .capability-item {
          display: flex;
          align-items: center;
          font-size: 13px;
          padding: 6px 0;
        }
        
        .capability-status {
          margin-right: 8px;
          font-weight: 600;
        }
        
        .available { color: #28a745; }
        .unavailable { color: #dc3545; }
        
        /* Signature Section */
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          margin: 40px 0;
          padding-top: 30px;
          border-top: 1px solid #e9ecef;
        }
        
        .signature-box {
          text-align: center;
          padding: 20px;
        }
        
        .signature-box h4 {
          font-size: 14px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 30px;
        }
        
        .signature-line {
          border-top: 1px solid #495057;
          margin: 20px 0 10px 0;
          padding-top: 5px;
        }
        
        .signature-label {
          font-size: 12px;
          color: #6c757d;
        }
        
        /* Footer */
        .footer {
          background: #4a6741;
          color: white;
          margin: 40px -20px -20px -20px;
          padding: 25px 30px;
          text-align: center;
          font-size: 12px;
        }
        
        .footer-main {
          margin-bottom: 15px;
        }
        
        .footer-contact {
          margin-bottom: 20px;
        }
        
        .document-id {
          font-size: 10px;
          color: #adb5bd;
          font-family: 'Courier New', monospace;
        }
      </style>
    </head>
    <body>
      <div class="watermark">PUBLIC HEALTH BUREAU</div>
      
      <div class="content">
        <!-- Header -->
        <div class="header">
          <div class="logo-section">
            <div class="logo-left">
              <div class="logo-text">PHB</div>
              <div class="subtitle">Public Health Bureau</div>
            </div>
            <div class="contact-info">
              <div>📞 +234-700-PHB-HELP</div>
              <div>📧 support@phb.gov.ng</div>
              <div>🌐 www.phb.gov.ng</div>
              <div>📍 Federal Capital Territory, Abuja</div>
            </div>
          </div>
          <div class="doc-type">HOSPITAL REGISTRATION CERTIFICATE</div>
        </div>

        <!-- Hospital Title Section -->
        <div class="hospital-title">
          <strong>HOSPITAL: ${hospital.name.toUpperCase()}</strong>
        </div>
        
        <!-- Key Information -->
        <div class="info-grid" style="margin-bottom: 20px;">
          <div style="display: flex; gap: 30px; padding: 15px; background: #f5f5f5; border: 1px solid #ddd;">
            <div><strong>Registration Number:</strong> ${hospital.registration_number || 'Pending Assignment'}</div>
            <div><strong>Hospital Type:</strong> <span style="text-transform: capitalize;">${hospital.hospital_type}</span></div>
            <div><strong>Status:</strong> 
              <span class="status-badge ${hospital.is_verified ? 'status-verified' : 'status-pending'}">
                ${hospital.is_verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <!-- Basic Information Grid -->
        <div class="info-grid">
          <div class="info-section">
            <h3>CONTACT INFORMATION</h3>
            <div class="info-row">
              <span class="info-label">Address</span>
              <span class="info-value">${hospital.address}</span>
            </div>
            <div class="info-row">
              <span class="info-label">City</span>
              <span class="info-value">${hospital.city || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">State</span>
              <span class="info-value">${hospital.state || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Country</span>
              <span class="info-value">${hospital.country}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">${hospital.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${hospital.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Website</span>
              <span class="info-value">${hospital.website || 'Not provided'}</span>
            </div>
          </div>

          <div class="info-section">
            <h3>OPERATIONAL DETAILS</h3>
            <div class="info-row">
              <span class="info-label">Bed Capacity</span>
              <span class="info-value">${hospital.bed_capacity} beds</span>
            </div>
            <div class="info-row">
              <span class="info-label">Emergency Unit</span>
              <span class="info-value">
                <span class="capability-status ${hospital.emergency_unit ? 'available' : 'unavailable'}">
                  ${hospital.emergency_unit ? '●' : '○'}
                </span>
                ${hospital.emergency_unit ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">ICU Unit</span>
              <span class="info-value">
                <span class="capability-status ${hospital.icu_unit ? 'available' : 'unavailable'}">
                  ${hospital.icu_unit ? '●' : '○'}
                </span>
                ${hospital.icu_unit ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Emergency Contact</span>
              <span class="info-value">${hospital.emergency_contact || 'Same as main'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Operating Hours</span>
              <span class="info-value">${hospital.operating_hours || '24/7'}</span>
            </div>
          </div>
        </div>

        <!-- Staff Information Grid -->
        <div class="info-grid">
          <div class="info-section">
            <h3>MEDICAL DIRECTOR</h3>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">${hospital.medical_director?.name || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">License Number</span>
              <span class="info-value">${hospital.medical_director?.license_number || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Specialization</span>
              <span class="info-value">${hospital.medical_director?.specialization || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Experience</span>
              <span class="info-value">${hospital.medical_director?.years_experience || 0} years</span>
            </div>
          </div>

          <div class="info-section">
            <h3>PRIMARY CONTACT</h3>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">${hospital.primary_contact?.name || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Title</span>
              <span class="info-value">${hospital.primary_contact?.title || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">${hospital.primary_contact?.phone || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${hospital.primary_contact?.email || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <!-- Services & Capabilities -->
        <div class="full-width-section">
          <h3>SERVICES & CAPABILITIES</h3>
          <div class="services-grid">
            <div class="service-category">
              <h4>Imaging Services</h4>
              <div class="service-list">
                ${(hospital.imaging_services || []).map(service => `<span class="service-item">${service}</span>`).join('')}
              </div>
            </div>
            <div class="service-category">
              <h4>Specialized Units</h4>
              <div class="service-list">
                ${(hospital.specialized_units || []).map(unit => `<span class="service-item">${unit}</span>`).join('')}
              </div>
            </div>
            <div class="service-category">
              <h4>Languages Supported</h4>
              <div class="service-list">
                ${(hospital.languages_supported || []).map(lang => `<span class="service-item">${lang}</span>`).join('')}
              </div>
            </div>
          </div>
          
          <h4>Digital Infrastructure</h4>
          <div class="capability-list">
            <div class="capability-item">
              <span class="capability-status ${hospital.has_hospital_information_system ? 'available' : 'unavailable'}">
                ${hospital.has_hospital_information_system ? '●' : '○'}
              </span>
              Hospital Information System
            </div>
            <div class="capability-item">
              <span class="capability-status ${hospital.electronic_medical_records ? 'available' : 'unavailable'}">
                ${hospital.electronic_medical_records ? '●' : '○'}
              </span>
              Electronic Medical Records
            </div>
            <div class="capability-item">
              <span class="capability-status ${hospital.telemedicine_capabilities ? 'available' : 'unavailable'}">
                ${hospital.telemedicine_capabilities ? '●' : '○'}
              </span>
              Telemedicine Capabilities
            </div>
            <div class="capability-item">
              <span class="capability-status ${hospital.online_appointment_booking ? 'available' : 'unavailable'}">
                ${hospital.online_appointment_booking ? '●' : '○'}
              </span>
              Online Appointment Booking
            </div>
            <div class="capability-item">
              <span class="capability-status ${hospital.patient_portal ? 'available' : 'unavailable'}">
                ${hospital.patient_portal ? '●' : '○'}
              </span>
              Patient Portal
            </div>
            <div class="capability-item">
              <span class="capability-status ${hospital.api_integration_ready ? 'available' : 'unavailable'}">
                ${hospital.api_integration_ready ? '●' : '○'}
              </span>
              API Integration Ready
            </div>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-box">
            <h4>Hospital Administrator</h4>
            <div class="signature-line"></div>
            <div class="signature-label">Signature & Date</div>
          </div>
          <div class="signature-box">
            <h4>PHB Authorized Officer</h4>
            <div class="signature-line"></div>
            <div class="signature-label">Signature & Date</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-main">
            <strong>Document Generated:</strong> ${currentDate} at ${currentTime}
          </div>
          <div class="footer-contact">
            This certificate serves as official confirmation of hospital registration with the Public Health Bureau.<br>
            For verification and inquiries: <strong>support@phb.gov.ng</strong> | <strong>+234-700-PHB-HELP</strong>
          </div>
          <div class="document-id">
            Document ID: PHB-REG-${hospital.registration_number || 'PENDING'}-${Date.now().toString().slice(-8)}
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  // Auto-generate registration number when hospital name is entered
  useEffect(() => {
    if (hospitalData.name && !hospitalData.registration_number) {
      setHospitalData(prev => ({
        ...prev,
        registration_number: generateRegistrationNumber()
      }));
    }
  }, [hospitalData.name]);

  // Update progress based on current step
  useEffect(() => {
    setFormProgress((currentStep / 5) * 100);
  }, [currentStep]);

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setError(null);
    } else {
      setError("Please fill in all required fields before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  // Submit hospital registration
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format data for API submission
      const submissionData = {
        ...hospitalData,
        created_by: "system_administrator",
        creation_date: new Date().toISOString().split('T')[0],
        status: "pending_approval"
      };

      console.log('🏥 Submitting hospital registration:', submissionData);
      
      // Call API to create hospital
      const response = await hospitalService.createHospital(submissionData);
      
      // Store the registered hospital data for printing
      setRegisteredHospital({
        ...submissionData,
        id: response.hospital?.id || response.id,
        registration_number: response.hospital?.registration_number || submissionData.registration_number,
        created_at: response.hospital?.created_at || new Date().toISOString()
      });
      
      setSuccess(`Hospital "${hospitalData.name}" has been successfully registered! Registration ID: ${response.hospital?.id || response.id}`);
      setLoading(false);
      
      // Reset form after successful submission
      setTimeout(() => {
        setCurrentStep(1);
        setFormProgress(20);
        setHospitalData({
          // Reset to initial state
          name: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          city: "",
          state: "",
          country: "Nigeria",
          postal_code: "",
          latitude: "",
          longitude: "",
          registration_number: "",
          hospital_type: "private",
          bed_capacity: 0,
          emergency_unit: true,
          icu_unit: true,
          emergency_contact: "",
          government_licenses: [],
          quality_certifications: [],
          insurance_relationships: [],
          medical_director: {
            name: "",
            license_number: "",
            specialization: "",
            years_experience: 0
          },
          minimum_doctors: 10,
          minimum_nurses: 25,
          operating_hours: "24/7",
          ambulance_services: true,
          laboratory_services: true,
          pharmacy_services: true,
          imaging_services: ["X-ray", "CT", "MRI", "Ultrasound"],
          specialized_units: ["ICU", "CCU", "NICU", "Emergency"],
          languages_supported: ["English"],
          accessibility_features: ["wheelchair_access"],
          registration_fees_paid: {
            government_licenses: 0,
            certification_applications: 0,
            total_paid: 0,
            currency: "NGN"
          },
          primary_contact: {
            name: "",
            title: "",
            phone: "",
            email: ""
          },
          administrative_contact: {
            name: "",
            title: "",
            phone: "",
            email: ""
          },
          has_hospital_information_system: false,
          electronic_medical_records: false,
          telemedicine_capabilities: false,
          online_appointment_booking: false,
          patient_portal: false,
          mobile_app: false,
          api_integration_ready: false
        });
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Failed to create hospital:', error);
      setError(`Failed to register hospital: ${error.message}`);
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="mb-4">
                <h5 className="fw-semibold mb-2">
                  <i className="ri-building-line me-2 text-primary"></i>
                  Basic Hospital Information
                </h5>
                <p className="text-muted">Enter the fundamental details about the hospital</p>
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hospital Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter hospital name"
                      value={hospitalData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Registration Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Auto-generated"
                      value={hospitalData.registration_number}
                      onChange={(e) => handleInputChange('registration_number', e.target.value)}
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Automatically generated when hospital name is entered
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Full Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter complete hospital address"
                  value={hospitalData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter city"
                      value={hospitalData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter state"
                      value={hospitalData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter postal code"
                      value={hospitalData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="+234-xxx-xxx-xxxx"
                      value={hospitalData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="admin@hospital.com"
                      value={hospitalData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://www.hospital.com"
                      value={hospitalData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hospital Type</Form.Label>
                    <Form.Select
                      value={hospitalData.hospital_type}
                      onChange={(e) => handleInputChange('hospital_type', e.target.value)}
                    >
                      {hospitalTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 2:
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="mb-4">
                <h5 className="fw-semibold mb-2">
                  <i className="ri-service-line me-2 text-primary"></i>
                  Operational Information
                </h5>
                <p className="text-muted">Configure hospital capacity and services</p>
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Total Bed Capacity <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter total number of beds"
                      value={hospitalData.bed_capacity}
                      onChange={(e) => handleInputChange('bed_capacity', parseInt(e.target.value) || 0)}
                      required
                      min="1"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Emergency Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Emergency hotline number"
                      value={hospitalData.emergency_contact}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Emergency Unit</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        id="emergency-yes"
                        label="Available"
                        name="emergency_unit"
                        checked={hospitalData.emergency_unit === true}
                        onChange={() => handleInputChange('emergency_unit', true)}
                      />
                      <Form.Check
                        type="radio"
                        id="emergency-no"
                        label="Not Available"
                        name="emergency_unit"
                        checked={hospitalData.emergency_unit === false}
                        onChange={() => handleInputChange('emergency_unit', false)}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ICU Unit</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        id="icu-yes"
                        label="Available"
                        name="icu_unit"
                        checked={hospitalData.icu_unit === true}
                        onChange={() => handleInputChange('icu_unit', true)}
                      />
                      <Form.Check
                        type="radio"
                        id="icu-no"
                        label="Not Available"
                        name="icu_unit"
                        checked={hospitalData.icu_unit === false}
                        onChange={() => handleInputChange('icu_unit', false)}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Imaging Services</Form.Label>
                <div className="border rounded p-3">
                  <Row>
                    {imagingServices.map(service => (
                      <Col md={4} key={service}>
                        <Form.Check
                          type="checkbox"
                          id={`imaging-${service}`}
                          label={service}
                          checked={hospitalData.imaging_services.includes(service)}
                          onChange={(e) => handleArrayChange('imaging_services', service, e.target.checked)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Specialized Units</Form.Label>
                <div className="border rounded p-3">
                  <Row>
                    {specializedUnits.map(unit => (
                      <Col md={4} key={unit}>
                        <Form.Check
                          type="checkbox"
                          id={`unit-${unit}`}
                          label={unit}
                          checked={hospitalData.specialized_units.includes(unit)}
                          onChange={(e) => handleArrayChange('specialized_units', unit, e.target.checked)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="ambulance"
                      label="Ambulance Services"
                      checked={hospitalData.ambulance_services}
                      onChange={(e) => handleInputChange('ambulance_services', e.target.checked)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="laboratory"
                      label="Laboratory Services"
                      checked={hospitalData.laboratory_services}
                      onChange={(e) => handleInputChange('laboratory_services', e.target.checked)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="pharmacy"
                      label="Pharmacy Services"
                      checked={hospitalData.pharmacy_services}
                      onChange={(e) => handleInputChange('pharmacy_services', e.target.checked)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 3:
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="mb-4">
                <h5 className="fw-semibold mb-2">
                  <i className="ri-team-line me-2 text-primary"></i>
                  Staff Requirements
                </h5>
                <p className="text-muted">Configure medical staff requirements and leadership</p>
              </div>

              <Card className="border-start border-4 border-primary mb-4">
                <Card.Body>
                  <h6 className="fw-semibold mb-3">Medical Director <span className="text-danger">*</span></h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Dr. John Doe"
                          value={hospitalData.medical_director.name}
                          onChange={(e) => handleInputChange('name', e.target.value, 'medical_director')}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>License Number</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="MDCN-XXXXX"
                          value={hospitalData.medical_director.license_number}
                          onChange={(e) => handleInputChange('license_number', e.target.value, 'medical_director')}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Specialization</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Internal Medicine"
                          value={hospitalData.medical_director.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value, 'medical_director')}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Years of Experience</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="15"
                          value={hospitalData.medical_director.years_experience}
                          onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0, 'medical_director')}
                          min="0"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Doctors Required</Form.Label>
                    <Form.Control
                      type="number"
                      value={hospitalData.minimum_doctors}
                      onChange={(e) => handleInputChange('minimum_doctors', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                    <Form.Text className="text-muted">
                      Recommended: At least 1 doctor per 20 beds
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Nurses Required</Form.Label>
                    <Form.Control
                      type="number"
                      value={hospitalData.minimum_nurses}
                      onChange={(e) => handleInputChange('minimum_nurses', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                    <Form.Text className="text-muted">
                      Recommended: At least 2 nurses per 10 beds
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Operating Hours</Form.Label>
                <Form.Select
                  value={hospitalData.operating_hours}
                  onChange={(e) => handleInputChange('operating_hours', e.target.value)}
                >
                  <option value="24/7">24/7 Operations</option>
                  <option value="business_hours">Business Hours Only</option>
                  <option value="extended_hours">Extended Hours (6 AM - 10 PM)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Languages Supported</Form.Label>
                <div className="border rounded p-3">
                  <Row>
                    {languages.map(language => (
                      <Col md={4} key={language}>
                        <Form.Check
                          type="checkbox"
                          id={`lang-${language}`}
                          label={language}
                          checked={hospitalData.languages_supported.includes(language)}
                          onChange={(e) => handleArrayChange('languages_supported', language, e.target.checked)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Accessibility Features</Form.Label>
                <div className="border rounded p-3">
                  <Row>
                    {accessibilityFeatures.map(feature => (
                      <Col md={6} key={feature}>
                        <Form.Check
                          type="checkbox"
                          id={`access-${feature}`}
                          label={feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          checked={hospitalData.accessibility_features.includes(feature)}
                          onChange={(e) => handleArrayChange('accessibility_features', feature, e.target.checked)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        );

      case 4:
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="mb-4">
                <h5 className="fw-semibold mb-2">
                  <i className="ri-contacts-line me-2 text-primary"></i>
                  Contact Information
                </h5>
                <p className="text-muted">Provide key contact details for hospital management</p>
              </div>

              <Card className="border-start border-4 border-primary mb-4">
                <Card.Body>
                  <h6 className="fw-semibold mb-3">Primary Contact <span className="text-danger">*</span></h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Dr. Jane Doe"
                          value={hospitalData.primary_contact.name}
                          onChange={(e) => handleInputChange('name', e.target.value, 'primary_contact')}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Medical Director"
                          value={hospitalData.primary_contact.title}
                          onChange={(e) => handleInputChange('title', e.target.value, 'primary_contact')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="+234-xxx-xxx-xxxx"
                          value={hospitalData.primary_contact.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value, 'primary_contact')}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="director@hospital.com"
                          value={hospitalData.primary_contact.email}
                          onChange={(e) => handleInputChange('email', e.target.value, 'primary_contact')}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-start border-4 border-secondary mb-4">
                <Card.Body>
                  <h6 className="fw-semibold mb-3">Administrative Contact</h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Mrs. Admin Name"
                          value={hospitalData.administrative_contact.name}
                          onChange={(e) => handleInputChange('name', e.target.value, 'administrative_contact')}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Hospital Administrator"
                          value={hospitalData.administrative_contact.title}
                          onChange={(e) => handleInputChange('title', e.target.value, 'administrative_contact')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="+234-xxx-xxx-xxxx"
                          value={hospitalData.administrative_contact.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value, 'administrative_contact')}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="admin@hospital.com"
                          value={hospitalData.administrative_contact.email}
                          onChange={(e) => handleInputChange('email', e.target.value, 'administrative_contact')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-start border-4 border-info">
                <Card.Body>
                  <h6 className="fw-semibold mb-3">Financial Information</h6>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Government License Fees (NGN)</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="700000"
                          value={hospitalData.registration_fees_paid.government_licenses}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const updated = {
                              ...hospitalData.registration_fees_paid,
                              government_licenses: value,
                              total_paid: value + hospitalData.registration_fees_paid.certification_applications
                            };
                            handleInputChange('registration_fees_paid', updated);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Certification Fees (NGN)</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="75000"
                          value={hospitalData.registration_fees_paid.certification_applications}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const updated = {
                              ...hospitalData.registration_fees_paid,
                              certification_applications: value,
                              total_paid: value + hospitalData.registration_fees_paid.government_licenses
                            };
                            handleInputChange('registration_fees_paid', updated);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Total Paid (NGN)</Form.Label>
                        <Form.Control
                          type="text"
                          value={hospitalData.registration_fees_paid.total_paid.toLocaleString()}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        );

      case 5:
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="mb-4">
                <h5 className="fw-semibold mb-2">
                  <i className="ri-computer-line me-2 text-primary"></i>
                  Digital Capabilities
                </h5>
                <p className="text-muted">Configure digital infrastructure and technology features</p>
              </div>

              <Card className="border-start border-4 border-success mb-4">
                <Card.Body>
                  <h6 className="fw-semibold mb-3">Digital Infrastructure</h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="his"
                          label="Hospital Information System (HIS)"
                          checked={hospitalData.has_hospital_information_system}
                          onChange={(e) => handleInputChange('has_hospital_information_system', e.target.checked)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="emr"
                          label="Electronic Medical Records (EMR)"
                          checked={hospitalData.electronic_medical_records}
                          onChange={(e) => handleInputChange('electronic_medical_records', e.target.checked)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="telemedicine"
                          label="Telemedicine Capabilities"
                          checked={hospitalData.telemedicine_capabilities}
                          onChange={(e) => handleInputChange('telemedicine_capabilities', e.target.checked)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="appointment_booking"
                          label="Online Appointment Booking"
                          checked={hospitalData.online_appointment_booking}
                          onChange={(e) => handleInputChange('online_appointment_booking', e.target.checked)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="patient_portal"
                          label="Patient Portal"
                          checked={hospitalData.patient_portal}
                          onChange={(e) => handleInputChange('patient_portal', e.target.checked)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="mobile_app"
                          label="Mobile Application"
                          checked={hospitalData.mobile_app}
                          onChange={(e) => handleInputChange('mobile_app', e.target.checked)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="api_ready"
                      label="API Integration Ready"
                      checked={hospitalData.api_integration_ready}
                      onChange={(e) => handleInputChange('api_integration_ready', e.target.checked)}
                    />
                    <Form.Text className="text-muted">
                      Ready to integrate with external healthcare systems and platforms
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="border-start border-4 border-warning">
                <Card.Body>
                  <h6 className="fw-semibold mb-3">Registration Summary</h6>
                  <Row>
                    <Col md={6}>
                      <div className="mb-2">
                        <small className="text-secondary">Hospital Name</small>
                        <div className="fw-medium">{hospitalData.name || 'Not specified'}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Hospital Type</small>
                        <div className="fw-medium text-capitalize">{hospitalData.hospital_type}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Total Bed Capacity</small>
                        <div className="fw-medium">{hospitalData.bed_capacity} beds</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-2">
                        <small className="text-secondary">Emergency Unit</small>
                        <div className="fw-medium">
                          {hospitalData.emergency_unit ? (
                            <Badge bg="success">Available</Badge>
                          ) : (
                            <Badge bg="danger">Not Available</Badge>
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">ICU Unit</small>
                        <div className="fw-medium">
                          {hospitalData.icu_unit ? (
                            <Badge bg="success">Available</Badge>
                          ) : (
                            <Badge bg="danger">Not Available</Badge>
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-secondary">Total Registration Fees</small>
                        <div className="fw-medium">₦{hospitalData.registration_fees_paid.total_paid.toLocaleString()}</div>
                      </div>
                    </Col>
                  </Row>
                  
                  <div className="border-top pt-3 mt-3">
                    <small className="text-secondary">Medical Director</small>
                    <div className="fw-medium">
                      {hospitalData.medical_director.name || 'Not specified'}
                      {hospitalData.medical_director.license_number && (
                        <span className="text-muted"> ({hospitalData.medical_director.license_number})</span>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
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
  }, [skin]);

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item">
                <a href="#" className="text-decoration-none">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Hospital Registry</li>
            </ol>
            <h4 className="main-title mb-0">Hospital Registration System</h4>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={resetForm}
              disabled={loading}
            >
              <i className="ri-refresh-line me-1"></i>Reset Form
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => printRegistration()}
              disabled={!hospitalData.name && !registeredHospital}
              title={!hospitalData.name && !registeredHospital ? "Fill in hospital information to enable printing" : "Print registration document"}
            >
              <i className="ri-printer-line me-1"></i>Print
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium">Registration Progress</span>
              <span className="fw-medium">{Math.round(formProgress)}%</span>
            </div>
            <ProgressBar 
              now={formProgress} 
              variant={formProgress < 40 ? 'warning' : formProgress < 80 ? 'info' : 'success'}
              style={{ height: '8px' }}
            />
            <div className="mt-2">
              <small className="text-muted">
                Step {currentStep} of 5: {
                  currentStep === 1 ? 'Basic Information' :
                  currentStep === 2 ? 'Operational Details' :
                  currentStep === 3 ? 'Staff Requirements' :
                  currentStep === 4 ? 'Contact Information' :
                  'Digital Capabilities & Review'
                }
              </small>
            </div>
          </Card.Body>
        </Card>

        {/* Step Navigation */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="p-3">
            <Nav variant="pills" className="justify-content-center">
              {[1, 2, 3, 4, 5].map(step => (
                <Nav.Item key={step}>
                  <Nav.Link 
                    active={currentStep === step}
                    disabled={step > currentStep}
                    onClick={() => step <= currentStep && setCurrentStep(step)}
                    className={`${step < currentStep ? 'text-success' : ''}`}
                  >
                    {step < currentStep && <i className="ri-check-line me-1"></i>}
                    {step === 1 ? 'Basic Info' :
                     step === 2 ? 'Operations' :
                     step === 3 ? 'Staff' :
                     step === 4 ? 'Contacts' :
                     'Review'}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Card.Body>
        </Card>

        {/* Success Alert */}
        {success && (
          <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess(null)}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <i className="ri-check-circle-line me-2"></i>
                {success}
              </div>
              {registeredHospital && (
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => printRegistration(registeredHospital)}
                  className="ms-3"
                >
                  <i className="ri-printer-line me-1"></i>Print Certificate
                </Button>
              )}
            </div>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
            <i className="ri-error-warning-line me-2"></i>
            {error}
          </Alert>
        )}

        {/* Form Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary" 
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
              >
                <i className="ri-arrow-left-line me-1"></i>Previous
              </Button>
              
              <div className="d-flex gap-2">
                {currentStep < 5 ? (
                  <Button 
                    variant="primary" 
                    onClick={nextStep}
                    disabled={loading || !validateStep(currentStep)}
                  >
                    Next<i className="ri-arrow-right-line ms-1"></i>
                  </Button>
                ) : (
                  <Button 
                    variant="success" 
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Registering Hospital...
                      </>
                    ) : (
                      <>
                        <i className="ri-check-line me-1"></i>Complete Registration
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}