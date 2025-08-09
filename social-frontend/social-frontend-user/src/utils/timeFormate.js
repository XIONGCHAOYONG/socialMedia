function formatDate(timestamp, format = 'date') {
  if (!timestamp) return '';

  const date = new Date(timestamp);

  switch (format) {
    case 'time':
      // 只显示时分秒
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    case 'datetime':
      // 显示年月日时分
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'date':
    default:
      // 只显示年月日
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
  }
};

export default formatDate;