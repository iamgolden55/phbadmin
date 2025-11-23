import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class PharmacyAccessLogService {
  /**
   * Get all pharmacy access logs with optional filters
   */
  async getAccessLogs(filters = {}) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/pharmacy-access-logs/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacy access logs:', error);
      throw error;
    }
  }

  /**
   * Get a specific access log by ID
   */
  async getAccessLogById(logId) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/pharmacy-access-logs/${logId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching access log:', error);
      throw error;
    }
  }

  /**
   * Get access log statistics
   */
  async getAccessLogStats(dateFrom = null, dateTo = null) {
    try {
      const token = localStorage.getItem('adminToken');
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await axios.get(`${API_URL}/admin/pharmacy-access-logs/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching access log stats:', error);
      throw error;
    }
  }

  /**
   * Export access logs to CSV
   */
  async exportAccessLogs(filters = {}) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/pharmacy-access-logs/export/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: filters,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pharmacy_access_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      console.error('Error exporting access logs:', error);
      throw error;
    }
  }
}

export default new PharmacyAccessLogService();
