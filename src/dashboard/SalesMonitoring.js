import React, { useState, useEffect } from "react";
import { Card, Col, Nav, OverlayTrigger, Row, Table, Tooltip, Spinner, Alert, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import Avatar from "../components/Avatar";
import ReactApexChart from "react-apexcharts";
import { Bar } from 'react-chartjs-2';
import appointmentService from "../services/appointmentService";

export default function AppointmentAnalytics() {
  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load appointment analytics data
  useEffect(() => {
    loadAppointmentData();
  }, []);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAppointmentAnalytics();
      setAppointmentData(data);
      console.log('📊 Appointment analytics loaded:', data);
      console.log('🔍 Monthly growth from insights:', data?.insights?.monthlyGrowth);
    } catch (err) {
      setError(err.message);
      console.error('❌ Failed to load appointment analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvDownload = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/platform/export/appointments-csv/`;
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'appointment_analytics.csv';
      
      // Add authorization header by fetching the file first
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        throw new Error('Failed to download CSV file');
      }
    } catch (error) {
      console.error('❌ CSV download failed:', error);
      alert('Failed to download CSV file. Please try again.');
    }
  };

  // Monthly appointment trends series
  const getMonthlyTrendsSeries = () => {
    if (!appointmentData?.monthlyTrends) return [];
    return appointmentData.monthlyTrends.series;
  };

  const optionOne = {
    chart: {
      type: 'area',
      parentHeightOffset: 0,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    colors: ['#5575dc', '#81adee', '#ccd1ed'],
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20
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
      type: 'gradient',
      opacity: 0.8,
      gradient: {
        type: 'vertical',
        shade: 'light',
        opacityFrom: 0.35,
        opacityTo: 0.65,
        stops: [0, 100]
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      enabled: false
    },
    yaxis: {
      show: false
    },
    xaxis: {
      type: 'category',
      categories: appointmentData?.monthlyTrends?.categories || [],
      labels: {
        style: {
          colors: '#6e7985',
          fontSize: '11px'
        }
      }
    }
  };

  // Appointment status distribution series
  const getStatusDistributionSeries = () => {
    if (!appointmentData?.statusDistribution?.data) return [{ data: [] }, { data: [] }];
    
    const statusData = appointmentData.statusDistribution.data;
    const pendingCount = statusData.find(s => s.status === 'Pending')?.count || 0;
    const completedCount = statusData.find(s => s.status === 'Completed')?.count || 0;
    
    return [{
      data: [pendingCount, completedCount, statusData.find(s => s.status === 'Confirmed')?.count || 0, 
             statusData.find(s => s.status === 'Cancelled')?.count || 0, statusData.find(s => s.status === 'No Show')?.count || 0,
             statusData.find(s => s.status === 'In Progress')?.count || 0]
    }, {
      data: [-Math.floor(pendingCount * 0.1), -Math.floor(completedCount * 0.1), -1, -1, -1, -1]
    }];
  };

  const optionTwo = {
    chart: {
      height: 180,
      parentHeightOffset: 0,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    colors: ['#506fd9', '#85b6ff'],
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    yaxis: {
      show: false
    },
    xaxis: {
      type: 'category',
      categories: ['Pending', 'Completed', 'Confirmed', 'Cancelled', 'No Show', 'In Progress'],
      labels: {
        style: {
          colors: '#6e7985',
          fontSize: '10px'
        }
      }
    },
    fill: {
      opacity: 1
    },
    legend: {
      show: false
    },
    tooltip: {
      enabled: false
    }
  };

  // Daily appointment patterns chart data
  const getDailyPatternsData = () => {
    if (!appointmentData?.dailyPatterns) {
      return {
        labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#506fd9', barPercentage: 0.5 }]
      };
    }
    
    return {
      labels: appointmentData.dailyPatterns.hours,
      datasets: [{
        data: appointmentData.dailyPatterns.bookings,
        backgroundColor: '#506fd9',
        barPercentage: 0.5
      }]
    };
  };

  const chartOption = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          borderColor: '#000',
          color: '#f3f5f9'
        },
        ticks: {
          color: '#212830',
          font: {
            size: 10,
            weight: '500'
          }
        }
      },
      y: {
        grid: {
          borderWidth: 0,
          color: '#f3f5f9'
        },
        ticks: {
          color: '#212830',
          font: {
            size: 12
          }
        }
      }
    }
  };

  const regStyle = {
    selected: {
      fill: "#506fd9"
    },
    initial: {
      fill: "#d9dde7"
    }
  };

  const currentSkin = (localStorage.getItem('skin-mode'))? 'dark' : '';
  const [skin, setSkin] = useState(currentSkin);

  if(skin === 'dark') {
    chartOption.scales['x'].grid.color = '#222b41';
    chartOption.scales['x'].ticks.color = 'rgba(255,255,255,.65)';
    chartOption.scales['x'].grid.borderColor = '#222b41';
    chartOption.scales['y'].grid.color = '#222b41';
    chartOption.scales['y'].ticks.color = 'rgba(255,255,255,.65)';
  } else {
    chartOption.scales['x'].grid.color = '#edeff6';
    chartOption.scales['x'].ticks.color = '#42484e';
    chartOption.scales['x'].grid.borderColor = '#edeff6';
    chartOption.scales['y'].grid.color = '#edeff6';
    chartOption.scales['y'].ticks.color = '#42484e';
  }

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="#">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Appointment Analytics</li>
            </ol>
            <h4 className="main-title mb-0">Appointment Analytics Dashboard</h4>
          </div>

          <Nav as="nav" className="nav-icon nav-icon-lg">
            <OverlayTrigger overlay={<Tooltip>Share</Tooltip>}>
              <Nav.Link href=""><i className="ri-share-line"></i></Nav.Link>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Print</Tooltip>}>
              <Nav.Link href=""><i className="ri-printer-line"></i></Nav.Link>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Report</Tooltip>}>
              <Nav.Link href=""><i className="ri-bar-chart-2-line"></i></Nav.Link>
            </OverlayTrigger>
          </Nav>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading appointment analytics...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error Loading Data</Alert.Heading>
            <p>{error}</p>
            <div className="d-flex justify-content-end">
              <button className="btn btn-outline-danger" onClick={loadAppointmentData}>
                Try Again
              </button>
            </div>
          </Alert>
        ) : (
          <>
          <Row className="g-3 mb-4">
            {[
              {
                "label": "Total Appointments",
                "icon": "ri-calendar-check-line",
                "value": appointmentData?.topMetrics?.totalAppointments?.value?.toLocaleString() || "0",
                "percent": appointmentData?.topMetrics?.totalAppointments?.change?.toFixed(1) || "0",
                "status": appointmentData?.topMetrics?.totalAppointments?.trend || "neutral"
              }, {
                "label": "Completion Rate",
                "icon": "ri-checkbox-circle-line",
                "value": (appointmentData?.topMetrics?.completionRate?.value?.toFixed(1) || "0") + "%",
                "percent": appointmentData?.topMetrics?.completionRate?.change?.toFixed(1) || "0",
                "status": appointmentData?.topMetrics?.completionRate?.trend || "neutral"
              }, {
                "label": "Avg Wait Time",
                "icon": "ri-time-line",
                "value": (appointmentData?.topMetrics?.avgWaitTime?.value?.toFixed(1) || "0") + " days",
                "percent": Math.abs(appointmentData?.topMetrics?.avgWaitTime?.change || 0).toFixed(1),
                "status": appointmentData?.topMetrics?.avgWaitTime?.trend || "neutral"
              }, {
                "label": "No-Show Rate",
                "icon": "ri-user-unfollow-line",
                "value": (appointmentData?.topMetrics?.noShowRate?.value?.toFixed(1) || "0") + "%",
                "percent": Math.abs(appointmentData?.topMetrics?.noShowRate?.change || 0).toFixed(1),
                "status": appointmentData?.topMetrics?.noShowRate?.trend || "neutral"
              }
            ].map((card, index) => {
              const getStatusColor = (status) => {
                switch(status) {
                  case 'up': return 'success';
                  case 'down': return card.label.includes('Wait Time') || card.label.includes('No-Show') ? 'success' : 'danger';
                  default: return 'muted';
                }
              };
              
              return (
                <Col sm="6" lg="3" key={index}>
                  <Card className="card-one">
                    <Card.Body>
                      <Card.Title as="label" className="fs-sm fw-medium mb-1">{card.label}</Card.Title>
                      <h3 className="card-value mb-1"><i className={card.icon}></i> {card.value}</h3>
                      {card.status !== 'neutral' && (
                        <small>
                          <span className={"d-inline-flex text-" + getStatusColor(card.status)}>
                            {card.percent}% 
                            <i className={"ri-arrow-" + (card.status === "up" ? "up" : "down") + "-line"}></i>
                          </span> than last month
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
          </>
        )}
        
        <Row className="g-3">
          <Col xl="7">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Monthly Appointment Trends</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body>
                <ul className="legend mb-3">
                  <li>New Appointments</li>
                  <li>Completed</li>
                  <li>Cancelled</li>
                </ul>
                <ReactApexChart series={getMonthlyTrendsSeries()} options={optionOne} type="area" height={300} className="apex-chart-one mb-4" />
                <div className="p-2">
                  <Row className="g-3">
                    <Col sm="6">
                      <h3 className="card-value mb-2">{appointmentData?.monthlyTrends?.summary?.monthlyTotal || 0}</h3>
                      <label className="card-title fw-semibold text-dark mb-2">Monthly Appointments</label>
                      <p className="mb-0 fs-xs text-secondary">Total appointments booked this month across all departments.</p>
                    </Col>
                    <Col sm="6">
                      <h3 className="card-value mb-2">{(appointmentData?.monthlyTrends?.summary?.monthlyCompletion || 0).toFixed(1)}%</h3>
                      <label className="card-title fw-semibold text-dark mb-2">Monthly Completion Rate</label>
                      <p className="mb-0 fs-xs text-secondary">Percentage of appointments completed successfully this month.</p>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" xl="5">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Appointment Status Distribution</Card.Title>
                <Nav as="nav" className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body>
                <ReactApexChart series={getStatusDistributionSeries()} options={optionTwo} type="bar" height={180} className="apex-chart-one mb-3" />
                <p className="mb-3 fs-xs">Breakdown of appointment statuses across the platform.</p>

                <Card className="p-3 d-flex flex-row mb-2">
                  <div className="card-icon bg-success"><i className="ri-checkbox-circle-line"></i></div>
                  <div className="ms-3">
                    <h4 className="card-value mb-1">{appointmentData?.statusDistribution?.data?.find(s => s.status === 'Completed')?.count || 0}</h4>
                    <label className="card-title fw-medium text-dark mb-1">Completed Appointments</label>
                    <p className="fs-xs text-secondary mb-0 lh-4">Appointments that were successfully completed with patients.</p>
                  </div>
                </Card>
                <Card className="p-3 d-flex flex-row">
                  <div className="card-icon bg-warning"><i className="ri-close-circle-line"></i></div>
                  <div className="ms-3">
                    <h4 className="card-value mb-1">{(appointmentData?.statusDistribution?.data?.find(s => s.status === 'Cancelled')?.count || 0) + (appointmentData?.statusDistribution?.data?.find(s => s.status === 'No Show')?.count || 0)}</h4>
                    <label className="card-title fw-medium text-dark mb-1">Cancelled/No Shows</label>
                    <p className="fs-xs text-secondary mb-0 lh-4">Appointments that were cancelled or patients didn't show up.</p>
                  </div>
                </Card>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Daily Appointment Patterns</Card.Title>
                <Nav as="nav" className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body>
                <div className="chart-bar-one">
                  <Bar data={getDailyPatternsData()} options={chartOption} className="h-100" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Top Performing Doctors</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href="" className="nav-link"><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href="" className="nav-link"><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-0">
                <ul className="people-group">
                  {(appointmentData?.topDoctors || []).slice(0, 5).map((doctor, index) => (
                    <li className="people-item" key={index}>
                      <div className="avatar">
                        <span className="avatar-initial bg-primary">
                          <i className="ri-user-line"></i>
                        </span>
                      </div>
                      <div className="people-body">
                        <h6><Link to="">{doctor.name}</Link></h6>
                        <span>{doctor.specialization} • {doctor.appointments} appointments</span>
                      </div>
                      <div className="text-end">
                        <div className="fs-sm fw-medium text-success">{doctor.completionRate}%</div>
                        <span className="d-block fs-xs text-muted">Completion</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-center">
                <Link href="" className="fs-sm">View All Doctors</Link>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="6" xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Recent Appointment Activity</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-0">
                <ul className="people-group">
                  {(appointmentData?.recentActivity || []).slice(0, 5).map((appointment, index) => {
                    const getStatusBg = (status) => {
                      switch(status.toLowerCase()) {
                        case 'completed': return 'success';
                        case 'pending': return 'primary';
                        case 'confirmed': return 'info';
                        case 'cancelled': return 'danger';
                        case 'in progress': return 'warning';
                        default: return 'secondary';
                      }
                    };
                    
                    const getStatusIcon = (status) => {
                      switch(status.toLowerCase()) {
                        case 'completed': return 'ri-checkbox-circle-line';
                        case 'pending': return 'ri-time-line';
                        case 'confirmed': return 'ri-calendar-check-line';
                        case 'cancelled': return 'ri-close-circle-line';
                        case 'in progress': return 'ri-play-circle-line';
                        default: return 'ri-calendar-line';
                      }
                    };
                    
                    return (
                      <li className="people-item" key={index}>
                        <div className="avatar">
                          <span className={"avatar-initial fs-20 bg-" + getStatusBg(appointment.status)}>
                            <i className={getStatusIcon(appointment.status)}></i>
                          </span>
                        </div>
                        <div className="people-body">
                          <h6><Link to="">{appointment.id}</Link></h6>
                          <span className="d-block fs-xs">{appointment.doctor}</span>
                          <span className="fs-xs text-muted">{appointment.time}</span>
                        </div>
                        <div className="text-end">
                          <div className="fs-sm">{appointment.patient}</div>
                          <span className={"d-block fs-xs text-" + appointment.statusColor}>{appointment.status}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-center">
                <Link to="" className="fs-sm">View All Appointments</Link>
              </Card.Footer>
            </Card>
          </Col>
          <Col xl="5">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Department Performance</Card.Title>
                <Nav as="nav" className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3 p-xl-4">
                <div className="mb-4">
                  <Row className="g-3">
                    <Col sm="4">
                      <div className="text-center">
                        <h5 className="text-primary mb-1">{appointmentData?.departmentPerformance?.length || 0}</h5>
                        <label className="fs-sm text-muted">Active Departments</label>
                      </div>
                    </Col>
                    <Col sm="4">
                      <div className="text-center">
                        <h5 className="text-success mb-1">{appointmentData?.insights?.peakBookingHour || 'N/A'}</h5>
                        <label className="fs-sm text-muted">Peak Booking Hour</label>
                      </div>
                    </Col>
                    <Col sm="4">
                      <div className="text-center">
                        <h5 className="text-info mb-1">{appointmentData?.insights?.avgDuration || 0} min</h5>
                        <label className="fs-sm text-muted">Avg Duration</label>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Table className="table-one">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Appointments</th>
                      <th>Completion Rate</th>
                      <th>Avg Wait Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(appointmentData?.departmentPerformance || []).map((dept, index) => {
                      const colors = ['twitter', 'primary', 'teal', 'info', 'pink'];
                      // Cap completion rate at 100% on frontend as well
                      const completionRate = Math.min(dept.completionRate || 0, 100);
                      return (
                        <tr key={`dept-${dept.department}-${index}`}>
                          <td className="fw-medium">
                            <span className={"badge-dot me-2 bg-" + (colors[index % colors.length])}></span> {dept.department}
                          </td>
                          <td>{dept.totalAppointments}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{completionRate}%</span>
                              <ProgressBar 
                                now={completionRate} 
                                className="flex-1" 
                                style={{ height: '6px', width: '60px' }}
                                variant={completionRate >= 90 ? 'success' : completionRate >= 75 ? 'warning' : 'danger'}
                              />
                            </div>
                          </td>
                          <td>{dept.avgWaitTime} days</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col xl="7">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Appointment Insights & Analytics</Card.Title>
                <Nav as="nav" className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3 p-xl-4">
                <Row className="g-3 mb-4">
                  {[
                    {
                      "bg": "primary",
                      "icon": "ri-calendar-2-line",
                      "value": Math.min(appointmentData?.insights?.monthlyGrowth || 0, 100).toFixed(1),
                      "label": "Monthly Growth %",
                      "prefix": ""
                    }, {
                      "bg": "twitter",
                      "icon": "ri-user-heart-line",
                      "value": appointmentData?.insights?.patientReturnRate || "0",
                      "label": "Patient Return Rate",
                      "prefix": ""
                    }, {
                      "bg": "success",
                      "icon": "ri-time-line",
                      "value": appointmentData?.insights?.avgDuration || "0",
                      "label": "Avg Duration (min)",
                      "prefix": ""
                    }
                  ].map((item, index) => (
                    <Col key={index}>
                      <div className="earning-item">
                        <div className={"earning-icon bg-" + item.bg}>
                          <i className={item.icon}></i>
                        </div>
                        <h4><span>{item.prefix}</span>{item.value}{item.label.includes('%') ? '%' : ''}</h4>
                        <label>{item.label}</label>
                      </div>
                    </Col>
                  ))}
                </Row>

                <Table className="table-two mb-4" responsive>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Appointments</th>
                      <th>Completed</th>
                      <th>Cancelled</th>
                      <th>Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentData?.monthlyStatistics && appointmentData.monthlyStatistics.length > 0 ? 
                      appointmentData.monthlyStatistics.map((item, index) => (
                        <tr key={index}>
                          <td>{item.month}</td>
                          <td>{item.total}</td>
                          <td className="text-success">+ {item.completed}</td>
                          <td className="text-danger">- {item.cancelled}</td>
                          <td>{item.rate}%</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No monthly data available yet
                          </td>
                        </tr>
                      )
                    }
                  </tbody>
                </Table>

                <h6 className="fw-semibold mb-1">
                  <a href="#" onClick={handleCsvDownload}>Download appointment analytics in CSV format.</a>
                </h6>
                <p className="fs-sm text-secondary mb-0">
                  Export comprehensive appointment data including patient demographics, completion rates, department performance, and scheduling patterns for detailed analysis.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Footer />
      </div>
    </React.Fragment>
  )
}