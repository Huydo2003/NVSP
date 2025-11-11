import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { formatDate, formatDateTime } from '../utils/config';

/**
 * Dashboard.jsx - Tổng quan hệ thống
 * 
 * Chức năng:
 * - Hiển thị thống kê tổng quát
 * - Biểu đồ và số liệu
 * - Trạng thái hoạt động
 */

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    completedEvents: 0
  });

  const { state } = useApp();
  const { data, config } = state;

  useEffect(() => {
    // Calculate stats from data
    const events = data.filter(item => item.type === 'event');
    const registrations = data.filter(item => item.type === 'registration');
    
    setStats({
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'open').length,
      totalParticipants: registrations.length,
      completedEvents: events.filter(e => e.status === 'completed').length
    });
  }, [data]);

  const StatCard = ({ title, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 card-hover">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white text-2xl mr-4`}>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold" style={{ color: config.text_color }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>
          Tổng quan hệ thống
        </h1>
        <div className="text-sm text-gray-500">
          Chào mừng, {user.roleName || 'Người dùng'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng số sự kiện"
          value={stats.totalEvents}
          color="bg-blue-500"
        />
        <StatCard
          title="Sự kiện đang mở"
          value={stats.activeEvents}
          color="bg-green-500"
        />
        <StatCard
          title="Tổng thí sinh"
          value={stats.totalParticipants}
          color="bg-purple-500"
        />
        <StatCard
          title="Sự kiện hoàn thành"
          value={stats.completedEvents}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: config.text_color }}>
            Sự kiện gần đây
          </h3>
          <div className="space-y-3">
            {data
              .filter(item => item.type === 'event')
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(event.startDate)}</p>
                  </div>
                  <span className={`status-badge status-${event.status}`}>
                    {event.status === 'draft' && 'Nháp'}
                    {event.status === 'open' && 'Mở đăng ký'}
                    {event.status === 'closed' && 'Đóng đăng ký'}
                    {event.status === 'completed' && 'Hoàn thành'}
                  </span>
                </div>
              ))}
            {data.filter(item => item.type === 'event').length === 0 && (
              <p className="text-gray-500 text-center py-4">Chưa có sự kiện nào</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: config.text_color }}>
            Hoạt động hệ thống
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded">
              <div>
                <p className="font-medium">Hệ thống hoạt động bình thường</p>
                <p className="text-sm text-gray-500">Cập nhật lúc {formatDateTime(new Date())}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded">
              <div>
                <p className="font-medium">Đồng bộ dữ liệu thành công</p>
                <p className="text-sm text-gray-500">5 phút trước</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded">
              <div>
                <p className="font-medium">Có {stats.activeEvents} sự kiện cần theo dõi</p>
                <p className="text-sm text-gray-500">Kiểm tra thường xuyên</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}