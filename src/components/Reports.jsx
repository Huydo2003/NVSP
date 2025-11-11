import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';

export default function Reports({ user }) {
  const [statistics, setStatistics] = useState({
    events: {
      total: 0,
      upcoming: 0,
      ongoing: 0,
      completed: 0
    },
    attendances: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    certificates: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    competitions: {
      total: 0,
      active: 0,
      completed: 0
    },
    registrations: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    }
  });

  const { state } = useApp();
  const { data, config } = state;

  useEffect(() => {
    // Calculate statistics from data
    const stats = {
      events: {
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0
      },
      attendances: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      certificates: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      competitions: {
        total: 0,
        active: 0,
        completed: 0
      },
      registrations: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };

    data.forEach(item => {
      switch (item.type) {
        case 'event':
          stats.events.total++;
          if (item.status === 'upcoming') stats.events.upcoming++;
          if (item.status === 'ongoing') stats.events.ongoing++;
          if (item.status === 'completed') stats.events.completed++;
          break;
        case 'attendance':
          stats.attendances.total++;
          if (item.status === 'pending') stats.attendances.pending++;
          if (item.status === 'approved') stats.attendances.approved++;
          if (item.status === 'rejected') stats.attendances.rejected++;
          break;
        case 'certificate':
          stats.certificates.total++;
          if (item.status === 'pending') stats.certificates.pending++;
          if (item.status === 'approved') stats.certificates.approved++;
          if (item.status === 'rejected') stats.certificates.rejected++;
          break;
        case 'competition':
          stats.competitions.total++;
          if (item.status === 'active') stats.competitions.active++;
          if (item.status === 'completed') stats.competitions.completed++;
          break;
        case 'registration':
          stats.registrations.total++;
          if (item.status === 'pending') stats.registrations.pending++;
          if (item.status === 'approved') stats.registrations.approved++;
          if (item.status === 'rejected') stats.registrations.rejected++;
          break;
      }
    });

    setStatistics(stats);
  }, [data]);

  const renderStatCard = (title, stats, icon) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {icon ? <span className="text-2xl">{icon}</span> : null}
      </div>
      <div className="space-y-3">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-600 capitalize">
              {key === 'total' ? 'Tổng số' : key}:
            </span>
            <span className={`font-semibold ${
              key === 'pending' ? 'text-yellow-600' :
              key === 'approved' || key === 'active' || key === 'ongoing' ? 'text-green-600' :
              key === 'rejected' ? 'text-red-600' :
              key === 'completed' ? 'text-blue-600' :
              'text-gray-900'
            }`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const generateReport = async () => {
    const now = new Date();
    const fileName = `bao-cao-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.csv`;
    
    let csvContent = 'Loại,Tổng số,Đang chờ,Đã duyệt,Đã từ chối\n';
    
    // Add data rows
    csvContent += `Sự kiện,${statistics.events.total},${statistics.events.upcoming},${statistics.events.ongoing},${statistics.events.completed}\n`;
    csvContent += `Điểm danh,${statistics.attendances.total},${statistics.attendances.pending},${statistics.attendances.approved},${statistics.attendances.rejected}\n`;
    csvContent += `Chứng nhận,${statistics.certificates.total},${statistics.certificates.pending},${statistics.certificates.approved},${statistics.certificates.rejected}\n`;
    csvContent += `Cuộc thi,${statistics.competitions.total},${statistics.competitions.active},${statistics.competitions.completed},0\n`;
    csvContent += `Đăng ký,${statistics.registrations.total},${statistics.registrations.pending},${statistics.registrations.approved},${statistics.registrations.rejected}\n`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>
          Báo cáo thống kê
        </h1>
        {(user.role === 'btc' || user.role === 'admin') && (
          <button
            onClick={generateReport}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.accent_color }}
          >
            Xuất báo cáo CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {renderStatCard('Sự kiện', statistics.events)}
  {renderStatCard('Điểm danh', statistics.attendances)}
  {renderStatCard('Chứng nhận', statistics.certificates)}
  {renderStatCard('Cuộc thi', statistics.competitions)}
  {renderStatCard('Đăng ký', statistics.registrations)}
      </div>

      {(user.role === 'btc' || user.role === 'admin') && (
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Ghi chú</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Số liệu được cập nhật theo thời gian thực</li>
            <li>• Báo cáo CSV bao gồm đầy đủ các chỉ số thống kê</li>
            <li>• Sử dụng báo cáo để theo dõi và đánh giá hoạt động</li>
            <li>• Liên hệ BTC nếu cần thêm thông tin chi tiết</li>
          </ul>
        </div>
      )}
    </div>
  );
}