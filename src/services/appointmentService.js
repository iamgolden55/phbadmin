/**
 * Appointment Analytics Service
 * Handles all API calls for appointment data, analytics, and metrics
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class AppointmentService {
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
      // Add cache-busting parameter
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `${this.baseURL}${endpoint}${separator}_t=${Date.now()}`;
      const config = {
        headers: this.getAuthHeaders(),
        ...options,
      };

      console.log(`📅 Appointment API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Appointment API Response:`, data);
      return data;

    } catch (error) {
      console.error(`❌ Appointment API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive appointment analytics
   */
  async getAppointmentAnalytics() {
    try {
      // Get platform stats which includes appointment data
      const platformStats = await this.apiRequest('/admin/platform/stats/');
      
      // Transform the data for appointment analytics
      const appointmentData = this.transformAppointmentData(platformStats);
      
      return appointmentData;
    } catch (error) {
      console.error('❌ Failed to fetch appointment analytics:', error);
      return this.getFallbackAppointmentData();
    }
  }

  /**
   * Transform platform stats into appointment analytics format
   */
  transformAppointmentData(platformStats) {
    const appointments = platformStats.appointments || {};
    
    // Calculate derived metrics
    const totalAppointments = appointments.total || 0;
    const completedAppointments = appointments.completed || 0;
    const completionRate = appointments.completion_rate || 0;
    const monthlyAppointments = appointments.this_month || 0;
    
    // Calculate actual metrics from backend data
    const pendingAppointments = appointments.pending || 0;
    const cancelledAppointments = appointments.cancelled || 0;
    const noShowAppointments = appointments.no_show || 0;
    
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;
    const avgWaitTime = appointments.average_wait_time || 0;
    
    return {
      // Top KPI Cards
      topMetrics: {
        totalAppointments: {
          value: totalAppointments,
          change: monthlyAppointments > 0 && totalAppointments > monthlyAppointments ? 
            Math.min(((monthlyAppointments / (totalAppointments - monthlyAppointments)) * 100), 100) : 0,
          trend: 'up'
        },
        completionRate: {
          value: completionRate,
          change: appointments.completion_rate_change || 0,
          trend: (appointments.completion_rate_change || 0) >= 0 ? 'up' : 'down'
        },
        avgWaitTime: {
          value: avgWaitTime,
          change: appointments.wait_time_change || 0,
          trend: (appointments.wait_time_change || 0) <= 0 ? 'down' : 'up' // Lower wait time is better
        },
        noShowRate: {
          value: noShowRate,
          change: appointments.no_show_rate_change || 0,
          trend: (appointments.no_show_rate_change || 0) <= 0 ? 'down' : 'up' // Lower no-show rate is better
        }
      },

      // Monthly appointment trends from backend data
      monthlyTrends: {
        categories: appointments.monthly_categories || ['Current Month'],
        series: appointments.monthly_series || [
          {
            name: 'New Appointments',
            data: [monthlyAppointments]
          },
          {
            name: 'Completed',
            data: [completedAppointments]
          },
          {
            name: 'Cancelled',
            data: [cancelledAppointments]
          }
        ],
        summary: {
          monthlyTotal: monthlyAppointments,
          monthlyCompletion: completionRate
        }
      },

      // Appointment status distribution from real data
      statusDistribution: {
        data: appointments.status_breakdown || [
          {
            status: 'Pending',
            count: pendingAppointments,
            percentage: totalAppointments > 0 ? (pendingAppointments / totalAppointments) * 100 : 0
          },
          {
            status: 'Completed', 
            count: completedAppointments,
            percentage: completionRate
          },
          {
            status: 'Confirmed',
            count: appointments.confirmed || 0,
            percentage: totalAppointments > 0 ? ((appointments.confirmed || 0) / totalAppointments) * 100 : 0
          },
          {
            status: 'Cancelled',
            count: cancelledAppointments,
            percentage: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0
          },
          {
            status: 'No Show',
            count: noShowAppointments,
            percentage: noShowRate
          },
          {
            status: 'In Progress',
            count: appointments.in_progress || 0,
            percentage: totalAppointments > 0 ? ((appointments.in_progress || 0) / totalAppointments) * 100 : 0
          }
        ]
      },

      // Daily appointment patterns from backend
      dailyPatterns: appointments.daily_patterns || {
        hours: ['Morning', 'Afternoon', 'Evening'],
        bookings: [totalAppointments * 0.4, totalAppointments * 0.5, totalAppointments * 0.1]
      },

      // Top performing doctors from backend
      topDoctors: appointments.top_doctors || [],

      // Recent appointment activity from backend
      recentActivity: appointments.recent_activity || [],

      // Department performance from backend
      departmentPerformance: appointments.department_performance || [],

      // Monthly statistics for table from backend
      monthlyStatistics: appointments.monthly_statistics || [],

      // Appointment insights from backend
      insights: appointments.insights || {
        peakBookingHour: 'N/A',
        mostRequestedType: 'Consultation',
        avgDuration: appointments.average_duration || 30,
        monthlyGrowth: appointments.monthly_growth_rate !== undefined ? appointments.monthly_growth_rate : 0,
        patientReturnRate: appointments.patient_return_rate || 0
      }
    };
  }

  /**
   * Fallback appointment data when API fails
   */
  getFallbackAppointmentData() {
    return {
      topMetrics: {
        totalAppointments: { value: 0, change: 0, trend: 'neutral' },
        completionRate: { value: 0, change: 0, trend: 'neutral' },
        avgWaitTime: { value: 0, change: 0, trend: 'neutral' },
        noShowRate: { value: 0, change: 0, trend: 'neutral' }
      },
      monthlyTrends: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          { name: 'New Appointments', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: 'Completed', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: 'Cancelled', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
        ],
        summary: { monthlyTotal: 0, monthlyCompletion: 0 }
      },
      statusDistribution: { data: [] },
      dailyPatterns: { hours: [], bookings: [] },
      topDoctors: [],
      recentActivity: [],
      departmentPerformance: [],
      insights: {
        peakBookingHour: 'N/A',
        mostRequestedType: 'N/A',
        avgDuration: 0,
        monthlyGrowth: 0,
        patientReturnRate: 0
      }
    };
  }
}

// Create singleton instance
const appointmentService = new AppointmentService();

export default appointmentService;