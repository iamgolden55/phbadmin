import React, { useEffect } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import StreamChatComponent from "../components/chat/StreamChat";

export default function Chat() {
  useEffect(() => {
    document.body.classList.add('page-app');
    return () => {
      document.body.classList.remove('page-app');
    };
  }, []);

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item">
                <a href="#" className="text-decoration-none">Hospital Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Secure Messaging</li>
            </ol>
            <h4 className="main-title mb-0">💬 Healthcare Communication Hub</h4>
            <p className="text-muted mb-0">HIPAA-compliant secure messaging for healthcare professionals</p>
          </div>
        </div>

        {/* Stream Chat Component */}
        <div className="chat-container">
          <StreamChatComponent />
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
}