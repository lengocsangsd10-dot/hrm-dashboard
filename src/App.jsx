import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://script.google.com/macros/s/AKfycbyPG8ic0ij6Tkzuxdq7KufYH6gwXkQqbYttAd_Cr5peHyyZxiDHQ_J0_ksUim7hi7kyig/exec';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nhanSuList, setNhanSuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNhanSu, setSelectedNhanSu] = useState(null);
  const [formData, setFormData] = useState({
    maNS: '',
    hoTen: '',
    ngaySinh: '',
    tuoi: '',
    chucVu: '',
    phongBan: '',
    congTrinh: '',
    ngayVao: '',
    luong: '',
  });
  const [documentResult, setDocumentResult] = useState(null);
  const [documentType, setDocumentType] = useState('hdld');

  // Load danh sách nhân sự
  useEffect(() => {
    loadNhanSuList();
  }, []);

  const loadNhanSuList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=getAllNhanSu`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setNhanSuList(data);
      }
    } catch (error) {
      console.error('Lỗi load dữ liệu:', error);
    }
    setLoading(false);
  };

  const handleCreateDocument = async () => {
    if (!selectedNhanSu) {
      alert('Vui lòng chọn nhân sự');
      return;
    }

    setLoading(true);
    try {
      let action = 'generateHDLD';
      let data = {};

      switch (documentType) {
        case 'hdld':
          action = 'generateHDLD';
          break;
        case 'nghiphep':
          action = 'generateGiayXinNghiPhep';
          data = {
            ngayBatDau: '01/06/2026',
            ngayKetThuc: '10/06/2026',
            soNgayNghi: 10,
            lyDo: 'Nghỉ phép năm'
          };
          break;
        case 'dieuDong':
          action = 'generateQDDieuDong';
          data = {
            congTrinhMoi: 'Công trình mới',
            ngayHieuLuc: '15/05/2026'
          };
          break;
        case 'chamDut':
          action = 'generateQDChamDut';
          data = {
            lyDo: 'Xin thôi việc',
            ngayHieuLuc: '31/05/2026'
          };
          break;
        default:
          break;
      }

      const response = await fetch(`${API_URL}?action=${action}`, {
        method: 'POST',
        body: JSON.stringify({
          maNS: selectedNhanSu.maNS,
          ...data
        })
      });

      const result = await response.json();
      console.log('📋 API Response:', result);
      console.log('docUrl value:', result.docUrl);
      setDocumentResult(result);

      if (result.success || result.docUrl) {
        alert(`Tạo ${getDocumentTypeName(documentType)} thành công!\nLink: ${result.docUrl}`);
        // Mở link trong tab mới
        window.open(result.docUrl, '_blank');
      } else {
        alert('Lỗi: ' + (result.error || 'Không rõ'));
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
    setLoading(false);
  };

  const getDocumentTypeName = (type) => {
    const names = {
      hdld: 'Hợp Đồng Lao Động',
      nghiphep: 'Giấy Xin Nghỉ Phép',
      dieuDong: 'Quyết Định Điều Động',
      chamDut: 'Quyết Định Chấm Dứt'
    };
    return names[type] || 'Document';
  };

  const handleAddNhanSu = async (e) => {
    e.preventDefault();
    if (!formData.maNS || !formData.hoTen) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=addNhanSu`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        alert('Thêm nhân sự thành công!');
        setFormData({
          maNS: '',
          hoTen: '',
          ngaySinh: '',
          tuoi: '',
          chucVu: '',
          phongBan: '',
          congTrinh: '',
          ngayVao: '',
          luong: '',
        });
        loadNhanSuList();
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>📊 HRM Dashboard - Xí Nghiệp Sông Đà 10.2</h1>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'nhansu' ? 'active' : ''}`}
          onClick={() => setActiveTab('nhansu')}
        >
          👥 Quản Lý Nhân Sự
        </button>
        <button
          className={`nav-btn ${activeTab === 'giayto' ? 'active' : ''}`}
          onClick={() => setActiveTab('giayto')}
        >
          📄 Tạo Giấy Tờ
        </button>
      </nav>

      {/* Content */}
      <main className="app-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Tổng Nhân Sự</div>
                <div className="stat-value">{nhanSuList.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Đang Làm Việc</div>
                <div className="stat-value">{nhanSuList.filter(ns => ns.trangThai === 'Đang làm').length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Các Công Trình</div>
                <div className="stat-value">{new Set(nhanSuList.map(ns => ns.congTrinh)).size}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Documents Tạo</div>
                <div className="stat-value">4</div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Hành Động Nhanh</h3>
              <button className="action-btn" onClick={() => setActiveTab('nhansu')}>
                ➕ Thêm Nhân Sự
              </button>
              <button className="action-btn" onClick={() => setActiveTab('giayto')}>
                📝 Tạo Giấy Tờ
              </button>
            </div>
          </div>
        )}

        {/* Quản Lý Nhân Sự Tab */}
        {activeTab === 'nhansu' && (
          <div className="tab-content">
            <h2>Quản Lý Nhân Sự</h2>

            {/* Form Thêm Nhân Sự */}
            <div className="form-section">
              <h3>Thêm Nhân Sự Mới</h3>
              <form onSubmit={handleAddNhanSu} className="input-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Mã NS (VD: NS100)"
                    value={formData.maNS}
                    onChange={(e) => setFormData({...formData, maNS: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Họ tên"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({...formData, hoTen: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="date"
                    placeholder="Ngày sinh"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData({...formData, ngaySinh: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Chức vụ"
                    value={formData.chucVu}
                    onChange={(e) => setFormData({...formData, chucVu: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Phòng ban"
                    value={formData.phongBan}
                    onChange={(e) => setFormData({...formData, phongBan: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Công trình"
                    value={formData.congTrinh}
                    onChange={(e) => setFormData({...formData, congTrinh: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="date"
                    placeholder="Ngày vào"
                    value={formData.ngayVao}
                    onChange={(e) => setFormData({...formData, ngayVao: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Lương"
                    value={formData.luong}
                    onChange={(e) => setFormData({...formData, luong: e.target.value})}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Đang xử lý...' : '✅ Thêm Nhân Sự'}
                </button>
              </form>
            </div>

            {/* Danh Sách Nhân Sự */}
            <div className="list-section">
              <h3>Danh Sách Nhân Sự ({nhanSuList.length})</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã NS</th>
                      <th>Họ Tên</th>
                      <th>Chức Vụ</th>
                      <th>Công Trình</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nhanSuList.slice(0, 10).map((ns, idx) => (
                      <tr key={idx}>
                        <td>{ns.maNS}</td>
                        <td>{ns.hoTen}</td>
                        <td>{ns.chucVu}</td>
                        <td>{ns.congTrinh}</td>
                        <td>
                          <span className={`status ${ns.trangThai === 'Đang làm' ? 'active' : 'inactive'}`}>
                            {ns.trangThai}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {nhanSuList.length > 10 && <p className="more-data">... và {nhanSuList.length - 10} người khác</p>}
            </div>
          </div>
        )}

        {/* Tạo Giấy Tờ Tab */}
        {activeTab === 'giayto' && (
          <div className="tab-content">
            <h2>Tạo Giấy Tờ</h2>

            <div className="document-section">
              <div className="document-selector">
                <h3>Chọn Loại Giấy Tờ</h3>
                <div className="document-buttons">
                  <button
                    className={`doc-btn ${documentType === 'hdld' ? 'selected' : ''}`}
                    onClick={() => setDocumentType('hdld')}
                  >
                    📋 Hợp Đồng Lao Động
                  </button>
                  <button
                    className={`doc-btn ${documentType === 'nghiphep' ? 'selected' : ''}`}
                    onClick={() => setDocumentType('nghiphep')}
                  >
                    📅 Giấy Xin Nghỉ Phép
                  </button>
                  <button
                    className={`doc-btn ${documentType === 'dieuDong' ? 'selected' : ''}`}
                    onClick={() => setDocumentType('dieuDong')}
                  >
                    📤 Quyết Định Điều Động
                  </button>
                  <button
                    className={`doc-btn ${documentType === 'chamDut' ? 'selected' : ''}`}
                    onClick={() => setDocumentType('chamDut')}
                  >
                    ❌ Quyết Định Chấm Dứt
                  </button>
                </div>
              </div>

              <div className="nhansu-selector">
                <h3>Chọn Nhân Sự</h3>
                <select
                  value={selectedNhanSu?.maNS || ''}
                  onChange={(e) => {
                    const ns = nhanSuList.find(n => n.maNS === e.target.value);
                    setSelectedNhanSu(ns);
                  }}
                  className="select-input"
                >
                  <option value="">-- Chọn Nhân Sự --</option>
                  {nhanSuList.map((ns, idx) => (
                    <option key={idx} value={ns.maNS}>
                      {ns.maNS} - {ns.hoTen}
                    </option>
                  ))}
                </select>
              </div>

              {selectedNhanSu && (
                <div className="nhansu-info">
                  <h3>Thông Tin Nhân Sự</h3>
                  <div className="info-grid">
                    <div><strong>Mã NS:</strong> {selectedNhanSu.maNS}</div>
                    <div><strong>Họ Tên:</strong> {selectedNhanSu.hoTen}</div>
                    <div><strong>Chức Vụ:</strong> {selectedNhanSu.chucVu}</div>
                    <div><strong>Công Trình:</strong> {selectedNhanSu.congTrinh}</div>
                    <div><strong>Phòng Ban:</strong> {selectedNhanSu.phongBan}</div>
                    <div><strong>Lương:</strong> {selectedNhanSu.luong?.toLocaleString()} VNĐ</div>
                  </div>
                </div>
              )}

              <button
                className="create-btn"
                onClick={handleCreateDocument}
                disabled={!selectedNhanSu || loading}
              >
                {loading ? '⏳ Đang tạo...' : `✅ Tạo ${getDocumentTypeName(documentType)}`}
              </button>

              {documentResult && documentResult.docUrl && (
                <div className="success-message">
                  <p>✅ {documentResult.message}</p>
                  <a href={documentResult.docUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                    🔗 Mở Document
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 HRM System - Xí Nghiệp Sông Đà 10.2</p>
      </footer>
    </div>
  );
}

export default App;
