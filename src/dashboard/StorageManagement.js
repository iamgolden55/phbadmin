import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Button, Card, Col, ProgressBar, Row, Nav, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { Doughnut, Line, PolarArea, Radar } from 'react-chartjs-2';
import systemPerformanceService from "../services/systemPerformanceService";

export default function StorageManagement() {
  // Real data state management
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load real healthcare platform performance data
  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemPerformanceService.getSystemPerformanceAnalytics();
      setPerformanceData(data);
      console.log('🚀 System performance analytics loaded:', data);
    } catch (err) {
      setError(err.message);
      console.error('❌ Failed to load system performance analytics:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Dynamic series data from real performance metrics
  const getSeriesOne = () => {
    if (performanceData?.chartSeries?.seriesOne) {
      return performanceData.chartSeries.seriesOne;
    }
    // Fallback to original hardcoded data if no real data available
    return [{
      data: [[13, 1400], [14, 1800], [15, 1500]]
    }, {
      data: [[0, 800], [1, 600], [2, 500], [3, 400], [4, 600], [5, 500], [6, 800], [7, 1000], [8, 900], [9, 1100], [10, 1500], [11, 1200], [12, 1000], [13, 0], [14, 0], [15, 0], [16, 1200], [17, 1000], [18, 1100], [19, 800], [20, 500], [21, 300], [22, 500], [23, 600], [24, 500], [25, 600], [26, 800], [27, 1000], [28, 900], [29, 800], [30, 500]]
    }];
  };

  const optionOne = {
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
        bottom: 0
      },
      yaxis: {
        lines: { show: false }
      }
    },
    colors: ['#506fd9', '#c8ccd4'],
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
      tickAmount: 6,
      decimalsInFloat: 0,
      labels: {
        style: { fontSize: '11px' }
      }
    },
    yaxis: {
      show: false,
      max: 2000
    },
    states: states,
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    fill: { opacity: 1 },
    legend: { show: false }
  };

  const getSeriesTwo = () => {
    if (performanceData?.chartSeries?.seriesTwo) {
      return performanceData.chartSeries.seriesTwo;
    }
    // Fallback to original data
    return [{
      data: [
        [0, 50], [1, 50], [2, 60], [3, 50], [4, 45], [5, 55], [6, 55], [7, 45], [8, 60], [9, 25],
        [10, 55], [11, 60], [12, 55], [13, 55], [14, 55], [15, 55], [16, 65], [17, 55], [18, 75], [19, 35],
        [20, 50], [21, 65], [22, 35], [23, 45], [24, 45], [25, 45], [26, 55], [27, 50], [28, 55], [29, 55],
        [30, 55], [31, 65], [32, 45], [33, 40], [34, 45], [35, 45], [36, 55], [37, 75], [38, 65], [39, 65],
        [40, 70]
      ]
    }, {
      data: [
        [0, 50], [1, 50], [2, 60], [3, 50], [4, 45], [5, 55], [6, 55], [7, 45], [8, 60], [9, 25],
        [10, 55], [11, 60], [12, 55], [13, 55], [14, 55], [15, 55], [16, 65], [17, 55], [18, 75], [19, 35],
        [20, 50], [21, 65], [22, 35], [23, 45], [24, 45]
      ]
    }];
  };

  const optionTwo = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    grid: {
      borderColor: 'rgba(72,94,144, 0.07)',
      padding: {
        top: -20,
        left: 0,
        right: 0,
        bottom: 0
      },
      yaxis: {
        lines: { show: false }
      }
    },
    colors: ['#c8ccd4', '#506fd9'],
    stroke: {
      curve: 'straight',
      lineCap: 'square',
      width: 1.5
    },
    xaxis: {
      min: 0,
      max: 40,
      type: 'numeric',
      tickAmount: 6,
      decimalsInFloat: 0,
      labels: {
        style: { fontSize: '11px' }
      }
    },
    yaxis: {
      show: false,
      min: 0,
      max: 140
    },
    states: states,
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    fill: { opacity: 1 },
    legend: { show: false }
  };

  const getDataDonut = () => {
    if (performanceData?.chartData?.donut) {
      return performanceData.chartData.donut;
    }
    // Fallback to original data
    return {
      labels: ['Used Space', 'System Space', 'Available Space'],
      datasets: [{
        data: [45, 55],
        backgroundColor: ['#506fd9', '#d3dbf6']
      }, {
        data: [40, 60],
        backgroundColor: ['#6e7985', '#dbdde1']
      }]
    };
  };

  const optionDonut = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const getDataPolar = () => {
    if (performanceData?.chartData?.polar) {
      return performanceData.chartData.polar;
    }
    // Fallback to original data
    return {
      datasets: [{
        data: [50, 25, 60, 80, 20],
        backgroundColor: ['#506fd9', '#85b6ff', '#d3dbf6', '#6e7985', '#dbdde1']
      }]
    };
  };

  const optionPolar = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const getDataRadar = () => {
    if (performanceData?.chartData?.radar) {
      return performanceData.chartData.radar;
    }
    // Fallback to original data
    return {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        data: [65, 59, 90, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(80, 111, 217, 0.2)',
        borderColor: '#506fd9',
        borderWidth: 1.5,
        pointBackgroundColor: '#506fd9',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#506fd9'
      }, {
        data: [28, 48, 40, 19, 96, 27, 100],
        fill: true,
        backgroundColor: 'rgba(133, 182, 255, 0.2)',
        borderColor: '#85b6ff',
        borderWidth: 1.5,
        pointBackgroundColor: '#85b6ff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#85b6ff'
      }]
    };
  };

  const optionRadar = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const getDataLine = () => {
    if (performanceData?.chartData?.line) {
      return performanceData.chartData.line;
    }
    // Fallback to original data
    return {
      labels: ['1H', '12H', '24H', '1W', '1M', '1Y'],
      datasets: [{
        data: [50, 25, 60, 80, 20, 30],
        borderColor: '#506fd9',
        borderWidth: 1.5,
        stepped: true
      }]
    };
  };

  const optionLine = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#a1aab3',
          font: {
            size: 10
          }
        },
        grid: {
          borderColor: '#e2e5ec',
          borderWidth: 1.5,
          color: 'rgba(65,80,95,.08)'
        }
      },
      x: {
        grid: {
          color: 'rgba(65,80,95,.08)'
        },
        ticks: {
          color: '#6e7985',
          font: {
            size: 10,
            weight: '500'
          }
        }
      }
    }
  };

  const getSeriesThree = () => {
    if (performanceData?.chartSeries?.seriesThree) {
      return performanceData.chartSeries.seriesThree;
    }
    // Fallback to original data
    return [{
      type: 'area',
      data: [
        [0,45000],[1,45000],[2,55000],[3,45000],[4,40000],[5,50000],[6,50000],[7,40000],[8,45000],[9,20000],
        [10,40000],[11,55000],[12,50000],[13,50000],[14,50000],[15,50000],[16,60000],[17,35000],[18,50000],[19,20000],
        [20,40000],[21,55000],[22,20000],[23,40000],[24,40000],[25,40000],[26,45000],[27,45000],[28,50000],[29,40000],
        [30,50000],[31,55000],[32,40000],[33,35000],[34,40000],[35,40000],[36,50000],[37,60000],[38,55000],[39,60000],
        [40,60000],[41,50000],[42,45000],[43,40000],[44,45000],[45,40000],[46,42000],[47,30000],[48,40000],[49,40000],
        [50,45000],[51,45000],[52,45000],[53,40000],[54,50000],[55,50000]
      ]
    }, {
      type: 'column',
      data: [
        [0,10000],[1,8000],[2,20000],[3,10000],[4,15000],[5,5000],[6,12000],[7,5000],[8,10000],[9,5000],
        [10,15000],[11,10000],[12,5000],[13,7000],[14,5000],[15,15000],[16,20000],[17,15000],[18,10000],[19,5000],
        [20,5000],[21,15000],[22,10000],[23,5000],[24,10000],[25,5000],[26,5000],[27,2000],[28,3000],[29,10000],
        [30,5000],[31,2000],[32,2000],[33,5000],[34,8000],[35,10000],[36,10000],[37,12000],[38,10000],[39,15000],
        [40,5000],[41,25000],[42,12000],[43,5000],[44,10000],[45,15000],[46,10000],[47,20000],[48,10000],[49,8000],
        [50,5000],[51,5000],[52,2000],[53,10000],[54,3000],[55,1000]
      ]
    }];
  };

  const optionThree = {
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
        bottom: 0
      },
      yaxis: {
        lines: { show: false }
      }
    },
    colors: ['#85b6ff','#506fd9'],
    plotOptions: {
      bar: { columnWidth: '50%' }
    },
    stroke: {
      curve: 'straight',
      lineCap: 'square',
      width: [2,0]
    },
    xaxis: {
      overwriteCategories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      tickAmount: 11,
      decimalsInFloat: 0,
      labels: {
        style: { fontSize: '11px' }
      }
    },
    fill: {
      opacity: [0.2, 1, 1],
      gradient: {
        inverseColors: false,
        shade: 'light',
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0
      }
    },
    states: states,
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    legend: { show: false }
  };

  ///// Skin Switch /////
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
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="#">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">System Performance</li>
            </ol>
            <h4 className="main-title mb-0">System Performance Analytics</h4>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <Button variant="white" className="btn-icon"><i className="ri-share-line fs-18 lh-1"></i></Button>
            <Button variant="white" className="btn-icon"><i className="ri-printer-line fs-18 lh-1"></i></Button>
            <Button variant="primary" className="d-flex align-items-center gap-2">
              <i className="ri-bar-chart-2-line fs-18 lh-1"></i>Generate<span className="d-none d-sm-inline"> Report</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading system performance analytics...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error Loading Performance Data</Alert.Heading>
            <p>{error}</p>
            <div className="d-flex justify-content-end">
              <button className="btn btn-outline-danger" onClick={loadPerformanceData}>
                Try Again
              </button>
            </div>
          </Alert>
        ) : (
          <>
          <Row className="g-3">
            {(performanceData?.storageCards || [
              {
                label: "Applications",
                icon: "ri-rocket-line",
                files: 0,
                size: "0 GB",
                maxSize: "50 GB", 
                progress: 0,
                variant: "primary"
              },
              {
                label: "Documents",
                icon: "ri-file-text-line",
                files: 0,
                size: "0 GB",
                maxSize: "20 GB",
                progress: 0,
                variant: "primary"
              },
              {
                label: "Media",
                icon: "ri-gallery-line",
                files: 0,
                size: "0 GB",
                maxSize: "40 GB",
                progress: 0,
                variant: "warning"
              },
              {
                label: "Archives",
                icon: "ri-folder-zip-line",
                files: 0,
                size: "0 GB",
                maxSize: "30 GB",
                progress: 0,
                variant: "danger"
              },
              {
                label: "Others",
                icon: "ri-folder-2-line",
                files: 0,
                size: "0 GB",
                maxSize: "10 GB",
                progress: 0,
                variant: "primary"
              }
            ]).map((card, index) => (
              <Col xs={index === 0 ? "12" : "6"} sm="6" xl key={index}>
                <Card className="card-one">
                  <Card.Body className="p-3">
                    <div className="mb-1 text-primary ti--3"><i className={card.icon + " fs-48 lh-1"}></i></div>
                    <h6 className="fw-semibold text-dark mb-1">{card.label}</h6>
                    <p className="fs-xs text-secondary"><span className="ff-numerals">{card.files.toLocaleString()}</span> Files</p>
                    <ProgressBar now={card.progress} variant={card.variant} className="ht-3 mb-1" />
                    <div className="d-flex justify-content-between ff-numerals fs-xs fw-medium">
                      <span>{card.size}</span>
                      <span>{card.maxSize}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          </>
        )}
        
        <Row className="g-3">
          <Col xl="8">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Data Analytics</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <Row className="g-3">
                  <Col sm="4" md="3">
                    <Row className="g-3">
                      <Col xs="4" sm="12">
                        <h2 className="card-value ls--1 mb-1">{performanceData?.performanceMetrics?.totalStorage || "0TB"}</h2>
                        <label className="card-label fw-medium text-secondary fs-sm fs-sm-normal">Total Storage</label>
                      </Col>
                      <Col xs="4" sm="12">
                        <h2 className="card-value ls--1 mb-1">{performanceData?.performanceMetrics?.objectCount || "0K"}</h2>
                        <label className="card-label fw-medium text-secondary fs-sm fs-sm-normal">Object Count</label>
                      </Col>
                      <Col xs="4" sm="12">
                        <h2 className="card-value ls--1 mb-1">{performanceData?.performanceMetrics?.avgObjectSize || "0MB"}</h2>
                        <label className="card-label fw-medium text-secondary fs-sm fs-sm-normal">Avg. Object Size</label>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm="8" md="9">
                    <ReactApexChart series={getSeriesOne()} options={optionOne} type="bar" height={200} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" xl="4">
            <Card className="card-one card-daily-trends">
              <Card.Body className="p-3">
                <h6 className="card-title fw-semibold text-dark fs-15 mb-1">Daily Trends</h6>
                <p className="text-secondary">CPU Power - <span className="ff-numerals">{new Date().toLocaleDateString()}</span></p>
                <h1 className="card-value">{performanceData?.performanceMetrics?.cpuPowerKhz || 2836} <span>KHz</span></h1>
              </Card.Body>
              <ReactApexChart series={getSeriesTwo()} options={optionTwo} type="area" height={'100%'} className="mt-5 mt-md-0" />
            </Card>
          </Col>
          <Col md="6" xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Manage Storage</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <label className="d-block fs-sm mb-2">
                  <span className="ff-numerals">{performanceData?.storageManagement?.availableGb || 25.93}</span> GB available of <span className="ff-numerals">{performanceData?.storageManagement?.totalCapacityGb || 127.18}</span> GB
                </label>
                <ProgressBar className="ht-15 mb-4">
                  <ProgressBar now={20} />
                  <ProgressBar now={15} variant="ui-02" />
                  <ProgressBar now={25} variant="ui-03" />
                </ProgressBar>

                {(performanceData?.storageManagement?.usageBreakdown || [
                  {
                    "icon": "ri-rocket-line",
                    "name": "Applications",
                    "size": "0 GB",
                    "progress": 0,
                    "files": "0",
                    "percent": "0%"
                  }, {
                    "icon": "ri-file-text-line",
                    "name": "Documents",
                    "size": "0 GB",
                    "progress": 0,
                    "files": "0",
                    "percent": "0%"
                  }, {
                    "icon": "ri-gallery-line",
                    "name": "Media",
                    "size": "0 GB",
                    "progress": 0,
                    "files": "0",
                    "percent": "0%"
                  }
                ]).map((item, index) => (
                  <div className="storage-item" key={index}>
                    <div className="storage-icon">
                      <i className={item.icon}></i>
                    </div>
                    <div className="flex-fill">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-medium">{item.name}</span>
                        <span className="ff-numerals">{item.size}</span>
                      </div>
                      <ProgressBar now={item.progress} className="ht-5 mb-1" />
                      <div className="d-flex justify-content-between ff-numerals fs-xs text-secondary">
                        <span>{item.files} Files</span>
                        <span>{item.percent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md="7" lg="6" xl="4">
            <Card className="card-one">
              <Card.Body className="p-4">
                <div className="chart-donut-three mb-4">
                  <Doughnut data={getDataDonut()} options={optionDonut} />
                </div>
                <Row className="g-3">
                  <Col xs="6">
                    <label className="d-block mb-1">Total Space</label>
                    <h2 className="card-value ls--1 mb-0">{performanceData?.storageManagement?.totalSpace || "0GB"}</h2>
                  </Col>
                  <Col xs="6">
                    <label className="d-block mb-1">Used Space</label>
                    <h2 className="card-value ls--1 mb-0">{performanceData?.storageManagement?.usedSpace || "0GB"}</h2>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md="5" lg="6" xl="4">
            <Card className="card-one card-article">
              <Card.Body>
                <div className="mb-3">
                  <span className="badge bg-ui-02 fs-xs">Latest Article</span>
                </div>
                <h4 className="card-title mb-3">Overhaul Cloud-based Storage Analytics and Monitoring Suite</h4>
                <p className="text-secondary mb-4">Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est similique sunt in culpa qui officia deserunt mollitia animi.</p>
                <Button as="a" variant="primary">Learn more</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Network In/Out</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="ht-250">
                  <PolarArea data={getDataPolar()} options={optionPolar} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Volume Read/Write Ops</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="ht-250">
                  <Radar data={getDataRadar()} options={optionRadar} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">CPU Utilization</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="ht-250">
                  <Line data={getDataLine()} options={optionLine} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs="12">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Storage Distribution</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href=""><i className="ri-refresh-line"></i></Nav.Link>
                  <Nav.Link href=""><i className="ri-more-2-fill"></i></Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body className="p-3 p-xl-4">
                <Row className="g-4">
                  <Col xl="8">
                    <ReactApexChart series={getSeriesThree()} options={optionThree} height={'100%'} className="apex-chart-eleven" />
                  </Col>
                  <Col xl>
                    {[
                      {
                        "icon": "ri-hospital-line",
                        "name": "Medical Records",
                        "text": "Secure storage for patient medical records, prescriptions, lab results, and healthcare documentation with HIPAA compliance."
                      }, {
                        "icon": "ri-image-line",
                        "name": "Medical Imaging",
                        "text": "High-resolution storage for X-rays, ultrasounds, MRI scans, and other medical images with instant access for healthcare providers."
                      }, {
                        "icon": "ri-shield-check-line",
                        "name": "Secure Vault",
                        "text": "Encrypted storage system for sensitive healthcare data with access logs, audit trails, and comprehensive security monitoring."
                      }
                    ].map((item, index) => (
                      <div className={"d-flex" + ((index > 0)? " mt-3" : "")} key={index}>
                        <i className={item.icon + " fs-48 lh-1 me-3 text-primary"}></i>
                        <div>
                          <h6 className="fw-semibold text-dark mb-1">{item.name}</h6>
                          <p className="fs-sm text-secondary mb-0">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Footer />
      </div>
    </React.Fragment>
  )
};