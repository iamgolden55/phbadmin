/**
 * Hospital Management Service
 * Handles all API calls for hospital data, analytics, and management
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class HospitalService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authorization headers with JWT token
   */
  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic API request handler
   */
  async apiRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getAuthHeaders(),
        ...options,
      };

      console.log(`🔗 API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;

    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all hospitals in the network (using your actual backend endpoint)
   */
  async getHospitals() {
    try {
      // Using your actual hospital-list endpoint
      const response = await this.apiRequest('/hospitals/');
      // Your API returns { hospitals: [...] } not a direct array
      return response.hospitals || [];
    } catch (error) {
      console.error('❌ Failed to fetch hospitals:', error);
      // Fallback: Return empty array to prevent crashes
      return [];
    }
  }

  /**
   * Get real-time hospital occupancy data
   */
  async getHospitalOccupancy() {
    try {
      const response = await this.apiRequest('/hospitals/occupancy/');
      console.log('✅ Got real occupancy data:', response);
      return response.hospitals || [];
    } catch (error) {
      console.error('❌ Failed to fetch hospital occupancy:', error);
      return [];
    }
  }

  /**
   * Get hospital license data
   */
  async getHospitalLicenses() {
    try {
      const response = await this.apiRequest('/hospitals/licenses/');
      console.log('✅ Got real license data:', response);
      return response.hospitals || [];
    } catch (error) {
      console.error('❌ Failed to fetch hospital licenses:', error);
      return [];
    }
  }

  /**
   * Add a new license to a hospital
   * @param {number} hospitalId - Hospital ID
   * @param {FormData} licenseData - License data (supports file upload)
   */
  async addHospitalLicense(hospitalId, licenseData) {
    try {
      const token = localStorage.getItem('access_token');
      const url = `${this.baseURL}/hospitals/${hospitalId}/licenses/add/`;

      // For FormData, don't set Content-Type (browser sets it with boundary)
      // But we still need Authorization header
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it automatically for FormData
        },
        body: licenseData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ License added successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to add hospital license:', error);
      throw error;
    }
  }

  /**
   * Update an existing hospital license
   * @param {number} hospitalId - Hospital ID
   * @param {number} licenseId - License ID
   * @param {FormData} licenseData - Updated license data
   */
  async updateHospitalLicense(hospitalId, licenseId, licenseData) {
    try {
      const token = localStorage.getItem('access_token');
      const url = `${this.baseURL}/hospitals/${hospitalId}/licenses/${licenseId}/update/`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: licenseData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ License updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update hospital license:', error);
      throw error;
    }
  }

  /**
   * Delete a hospital license
   * @param {number} hospitalId - Hospital ID
   * @param {number} licenseId - License ID
   */
  async deleteHospitalLicense(hospitalId, licenseId) {
    try {
      const token = localStorage.getItem('access_token');
      const url = `${this.baseURL}/hospitals/${hospitalId}/licenses/${licenseId}/delete/`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ License deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to delete hospital license:', error);
      throw error;
    }
  }

  /**
   * Get hospital analytics dashboard data
   */
  async getHospitalAnalytics() {
    try {
      // Get analytics from dedicated endpoint with real data
      const analytics = await this.apiRequest('/hospitals/analytics/');
      console.log('✅ Got real analytics from backend:', analytics);
      return analytics;
    } catch (error) {
      // Fallback: aggregate data from multiple endpoints
      console.log('📊 Falling back to aggregated analytics...');
      return await this.getAggregatedAnalytics();
    }
  }

  /**
   * Aggregate analytics from multiple endpoints
   */
  async getAggregatedAnalytics() {
    try {
      const [hospitals, appointments] = await Promise.all([
        this.getHospitals(),
        this.getAppointments().catch(() => []), // Graceful fallback
      ]);

      // Ensure hospitals is an array
      const hospitalsArray = Array.isArray(hospitals) ? hospitals : [];
      const appointmentsArray = Array.isArray(appointments) ? appointments : [];

      // Calculate analytics from available data
      const verifiedHospitals = hospitalsArray.filter(h => h.is_verified).length;
      const totalBedCapacity = hospitalsArray.reduce((sum, h) => sum + (h.bed_capacity || 0), 0);
      // Get real bed utilization and active patients from backend
      let bedUtilization = 0;
      let activePatients = 0;
      try {
        const analyticsResponse = await this.apiRequest('/hospitals/analytics/');
        bedUtilization = analyticsResponse.bed_utilization || 0;
        activePatients = analyticsResponse.active_patients || 0;
      } catch (error) {
        // Fallback: show empty data if analytics fails
        bedUtilization = 0;
        activePatients = 0;
      }
      
      // Try to get medical staff count from a dedicated endpoint, fallback to estimate
      let medicalStaffCount = 0;
      try {
        const staffResponse = await this.apiRequest('/hospitals/analytics/');
        medicalStaffCount = staffResponse.medical_staff || 0;
      } catch (error) {
        // Fallback: show 0 if we can't get real data
        medicalStaffCount = 0;
      }
      
      // Calculate realistic appointments based on current hospital capacity
      const appointmentsToday = appointmentsArray.filter(a => 
        new Date(a.appointment_date).toDateString() === new Date().toDateString()
      ).length || 0; // Fallback: show 0 if no appointments data

      return {
        verified_hospitals: verifiedHospitals,
        total_hospitals: hospitalsArray.length,
        active_patients: activePatients,
        medical_staff: medicalStaffCount,
        appointments_today: appointmentsToday,
        total_bed_capacity: totalBedCapacity,
        bed_utilization: bedUtilization,
        growth_metrics: {
          hospitals: 0.0, // Will be overridden by real data from analytics endpoint
          patients: 0.0,
          staff: 0.0,
          appointments: 0.0
        }
      };
    } catch (error) {
      console.error('❌ Failed to aggregate analytics:', error);
      // Return fallback data
      return await this.getFallbackAnalytics();
    }
  }

  /**
   * Get appointments data (using your actual backend endpoint)
   */
  async getAppointments() {
    try {
      return await this.apiRequest('/appointments/');
    } catch (error) {
      console.error('❌ Failed to fetch appointments:', error);
      return [];
    }
  }

  /**
   * Get hospital departments (using your actual backend endpoint)
   */
  async getDepartments(hospitalId = null) {
    try {
      // Using your actual department endpoints
      const endpoint = hospitalId 
        ? `/departments/${hospitalId}/`
        : '/departments/';
      return await this.apiRequest(endpoint);
    } catch (error) {
      console.error('❌ Failed to fetch departments:', error);
      return [];
    }
  }

  /**
   * Get bed utilization data
   */
  async getBedUtilization(hospitalId = null) {
    try {
      const endpoint = hospitalId 
        ? `/hospitals/${hospitalId}/bed-utilization/`
        : '/hospitals/bed-utilization/';
      return await this.apiRequest(endpoint);
    } catch (error) {
      // Generate realistic bed utilization data
      return this.generateBedUtilizationData();
    }
  }

  /**
   * Generate realistic bed utilization data for charts
   */
  generateBedUtilizationData() {
    // Return empty data instead of fake data
    return {
      occupied_beds: [],
      available_beds: [],
      emergency_reserve: [],
      total_capacity: 0,
      current_occupancy: 0
    };
  }

  /**
   * Get patient admission trends
   */
  async getPatientAdmissions() {
    try {
      return await this.apiRequest('/hospitals/admissions/');
    } catch (error) {
      // Generate admission trend data
      return this.generateAdmissionData();
    }
  }

  /**
   * Generate admission trend data
   */
  generateAdmissionData() {
    // Return empty data instead of fake data
    return {
      daily_admissions: [],
      total_this_week: 0,
      growth_rate: 0
    };
  }

  /**
   * Get staff performance metrics
   */
  async getStaffPerformance() {
    try {
      return await this.apiRequest('/hospitals/staff-performance/');
    } catch (error) {
      return {
        efficiency_rate: 0,
        growth_rate: 0,
        trend_data: []
      };
    }
  }

  /**
   * Get emergency response metrics
   */
  async getEmergencyMetrics() {
    try {
      return await this.apiRequest('/hospitals/emergency-metrics/');
    } catch (error) {
      return {
        average_response_time: 0,
        improvement: 0,
        trend_data: []
      };
    }
  }

  /**
   * Get department utilization
   */
  async getDepartmentUtilization() {
    try {
      return await this.apiRequest('/hospitals/department-utilization/');
    } catch (error) {
      return []; // Return empty array instead of fake data
    }
  }

  /**
   * Get patient flow trends
   */
  async getPatientFlow() {
    try {
      return await this.apiRequest('/hospitals/patient-flow/');
    } catch (error) {
      // Return empty data instead of fake data
      return {
        outpatients: [],
        inpatients: [],
        total_patients: 0,
        growth_rate: 0
      };
    }
  }

  /**
   * Create new hospital
   */
  async createHospital(hospitalData) {
    return await this.apiRequest('/hospitals/create/', {
      method: 'POST',
      body: JSON.stringify(hospitalData),
    });
  }

  /**
   * Update hospital
   */
  async updateHospital(hospitalId, hospitalData) {
    return await this.apiRequest(`/hospitals/${hospitalId}/`, {
      method: 'PUT',
      body: JSON.stringify(hospitalData),
    });
  }

  /**
   * Delete/suspend hospital
   */
  async suspendHospital(hospitalId) {
    return await this.apiRequest(`/hospitals/${hospitalId}/suspend/`, {
      method: 'POST',
    });
  }

  /**
   * Get fallback analytics when API fails - tries to get basic real data
   */
  async getFallbackAnalytics() {
    try {
      // Try to get at least hospitals data
      const hospitals = await this.getHospitals();
      const hospitalsArray = Array.isArray(hospitals) ? hospitals : [];
      
      const verifiedHospitals = hospitalsArray.filter(h => h.is_verified).length;
      const totalBedCapacity = hospitalsArray.reduce((sum, h) => sum + (h.bed_capacity || 0), 0);
      
      return {
        verified_hospitals: verifiedHospitals,
        total_hospitals: hospitalsArray.length,
        active_patients: 0, // Will show 0 if we can't get real data
        medical_staff: 0,   // Will show 0 if we can't get real data
        appointments_today: 0, // Will show 0 if we can't get real data
        total_bed_capacity: totalBedCapacity,
        bed_utilization: 0, // Will show 0 if we can't get real data
        growth_metrics: {
          hospitals: 0.0,
          patients: 0.0,
          staff: 0.0,
          appointments: 0.0
        }
      };
    } catch (error) {
      console.error('❌ Even fallback analytics failed:', error);
      // Last resort - return zeros instead of fake data
      return {
        verified_hospitals: 0,
        total_hospitals: 0,
        active_patients: 0,
        medical_staff: 0,
        appointments_today: 0,
        total_bed_capacity: 0,
        bed_utilization: 0,
        growth_metrics: {
          hospitals: 0.0,
          patients: 0.0,
          staff: 0.0,
          appointments: 0.0
        }
      };
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData() {
    try {
      console.log('🏥 Fetching hospital dashboard data...');
      
      const [
        analytics,
        hospitals,
        bedUtilization,
        admissions,
        staffPerformance,
        emergencyMetrics,
        departmentUtilization,
        patientFlow
      ] = await Promise.allSettled([
        this.getHospitalAnalytics(),
        this.getHospitals(),
        this.getBedUtilization(),
        this.getPatientAdmissions(),
        this.getStaffPerformance(),
        this.getEmergencyMetrics(),
        this.getDepartmentUtilization(),
        this.getPatientFlow()
      ]);

      return {
        analytics: analytics.status === 'fulfilled' ? analytics.value : await this.getFallbackAnalytics(),
        hospitals: hospitals.status === 'fulfilled' ? hospitals.value : [],
        bedUtilization: bedUtilization.status === 'fulfilled' ? bedUtilization.value : this.generateBedUtilizationData(),
        admissions: admissions.status === 'fulfilled' ? admissions.value : this.generateAdmissionData(),
        staffPerformance: staffPerformance.status === 'fulfilled' ? staffPerformance.value : { efficiency_rate: 0, growth_rate: 0 },
        emergencyMetrics: emergencyMetrics.status === 'fulfilled' ? emergencyMetrics.value : { average_response_time: 0, improvement: 0 },
        departmentUtilization: departmentUtilization.status === 'fulfilled' ? departmentUtilization.value : [],
        patientFlow: patientFlow.status === 'fulfilled' ? patientFlow.value : { total_patients: 0, growth_rate: 0 }
      };

    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get pharmacies affiliated with a hospital
   * @param {number} hospitalId - Hospital ID
   */
  async getHospitalPharmacies(hospitalId) {
    try {
      const response = await this.apiRequest(`/hospitals/${hospitalId}/pharmacies/`);
      console.log('✅ Got hospital pharmacies:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch pharmacies for hospital ${hospitalId}:`, error);
      return { success: false, pharmacies: [] };
    }
  }

  /**
   * Create a new pharmacy (optionally affiliated with a hospital)
   * @param {Object} pharmacyData - Pharmacy data
   */
  async createPharmacy(pharmacyData) {
    try {
      const response = await this.apiRequest('/pharmacies/create/', {
        method: 'POST',
        body: JSON.stringify(pharmacyData),
      });
      console.log('✅ Pharmacy created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create pharmacy:', error);
      throw error;
    }
  }

  /**
   * Update an existing pharmacy
   * @param {number} pharmacyId - Pharmacy ID
   * @param {Object} pharmacyData - Updated pharmacy data
   */
  async updatePharmacy(pharmacyId, pharmacyData) {
    try {
      const response = await this.apiRequest(`/pharmacies/${pharmacyId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(pharmacyData),
      });
      console.log('✅ Pharmacy updated:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to update pharmacy ${pharmacyId}:`, error);
      throw error;
    }
  }

  /**
   * Delete (deactivate) a pharmacy
   * @param {number} pharmacyId - Pharmacy ID
   */
  async deletePharmacy(pharmacyId) {
    try {
      const response = await this.apiRequest(`/pharmacies/${pharmacyId}/delete/`, {
        method: 'DELETE',
      });
      console.log('✅ Pharmacy deleted:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to delete pharmacy ${pharmacyId}:`, error);
      throw error;
    }
  }

  /**
   * Verify a hospital (approve for PHB platform)
   * @param {number} hospitalId - Hospital ID
   */
  async verifyHospital(hospitalId) {
    try {
      const response = await this.apiRequest('/admin/platform/hospitals/', {
        method: 'PATCH',
        body: JSON.stringify({
          hospital_id: hospitalId,
          action: 'verify'
        }),
      });
      console.log('✅ Hospital verified:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to verify hospital ${hospitalId}:`, error);
      throw error;
    }
  }

  /**
   * Unverify/reject a hospital
   * @param {number} hospitalId - Hospital ID
   */
  async unverifyHospital(hospitalId) {
    try {
      const response = await this.apiRequest('/admin/platform/hospitals/', {
        method: 'PATCH',
        body: JSON.stringify({
          hospital_id: hospitalId,
          action: 'unverify'
        }),
      });
      console.log('✅ Hospital unverified:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to unverify hospital ${hospitalId}:`, error);
      throw error;
    }
  }

  /**
   * Approve an individual hospital license
   * @param {number} licenseId - License ID
   */
  async approveLicense(licenseId) {
    try {
      const response = await this.apiRequest('/admin/platform/hospital-licenses/', {
        method: 'PATCH',
        body: JSON.stringify({
          license_id: licenseId,
          action: 'approve'
        }),
      });
      console.log('✅ License approved:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to approve license ${licenseId}:`, error);
      throw error;
    }
  }

  /**
   * Reject an individual hospital license
   * @param {number} licenseId - License ID
   * @param {string} rejectionReason - Optional reason for rejection
   */
  async rejectLicense(licenseId, rejectionReason = '') {
    try {
      const response = await this.apiRequest('/admin/platform/hospital-licenses/', {
        method: 'PATCH',
        body: JSON.stringify({
          license_id: licenseId,
          action: 'reject',
          rejection_reason: rejectionReason
        }),
      });
      console.log('✅ License rejected:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to reject license ${licenseId}:`, error);
      throw error;
    }
  }

  /**
   * Get hospital staff (doctors, nurses, etc.)
   * @param {number} hospitalId - Hospital ID
   */
  async getHospitalStaff(hospitalId) {
    try {
      const response = await this.apiRequest(`/admin/platform/hospital-staff/?hospital_id=${hospitalId}`, {
        method: 'GET',
      });
      console.log('✅ Hospital staff loaded:', response);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch hospital staff for ${hospitalId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const hospitalService = new HospitalService();

export default hospitalService;