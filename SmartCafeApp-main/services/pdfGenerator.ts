import { Order, MenuItem, Analytics } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ReportData {
  startDate: Date;
  endDate: Date;
  orders: Order[];
  menuItems: MenuItem[];
  analytics: Analytics;
}

export const generateSalesReport = async (data: ReportData): Promise<string> => {
  const { startDate, endDate, orders, analytics } = data;

  // Calculate report metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by payment method
  const paymentBreakdown = orders.reduce(
    (acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.finalAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Revenue by category
  const categoryRevenue = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      const category = item.menuItem.category;
      const revenue = item.price * item.quantity;
      acc[category] = (acc[category] || 0) + revenue;
    });
    return acc;
  }, {} as Record<string, number>);

  // Top items
  const itemCounts = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      acc[item.menuItem.name] = (acc[item.menuItem.name] || 0) + item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Café Sales Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 40px;
      background: #fff;
      color: #1E1E1E;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #FF7A00;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #6F4E37;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 18px;
      color: #999;
    }
    .period {
      font-size: 16px;
      color: #FF7A00;
      margin-top: 10px;
      font-weight: 600;
    }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      flex: 1;
      background: #FFF8F0;
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #EAEAEA;
    }
    .summary-card h3 {
      font-size: 14px;
      color: #999;
      margin-bottom: 8px;
    }
    .summary-card .value {
      font-size: 28px;
      font-weight: bold;
      color: #FF7A00;
    }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      font-size: 22px;
      color: #6F4E37;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #EAEAEA;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #6F4E37;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #EAEAEA;
    }
    tr:nth-child(even) {
      background: #FFF8F0;
    }
    .chart-bar {
      height: 30px;
      background: linear-gradient(90deg, #FF7A00, #6F4E37);
      border-radius: 4px;
      margin-top: 4px;
    }
    .footer {
      margin-top: 60px;
      text-align: center;
      color: #999;
      font-size: 14px;
      padding-top: 20px;
      border-top: 1px solid #EAEAEA;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">☕ Smart Café</div>
    <div class="subtitle">Sales Performance Report</div>
    <div class="period">
      ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>Total Revenue</h3>
      <div class="value">₹${totalRevenue.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <h3>Total Orders</h3>
      <div class="value">${totalOrders}</div>
    </div>
    <div class="summary-card">
      <h3>Avg Order Value</h3>
      <div class="value">₹${Math.round(avgOrderValue)}</div>
    </div>
  </div>

  <div class="section">
    <h2>Revenue by Payment Method</h2>
    <table>
      <thead>
        <tr>
          <th>Payment Method</th>
          <th>Amount</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(paymentBreakdown)
          .map(
            ([method, amount]) => `
          <tr>
            <td>${method}</td>
            <td>₹${amount.toLocaleString()}</td>
            <td>${((amount / totalRevenue) * 100).toFixed(1)}%</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Revenue by Category</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Revenue</th>
          <th>Chart</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(categoryRevenue)
          .sort((a, b) => b[1] - a[1])
          .map(([category, revenue]) => {
            const percentage = (revenue / totalRevenue) * 100;
            return `
          <tr>
            <td>${category}</td>
            <td>₹${revenue.toLocaleString()}</td>
            <td>
              <div class="chart-bar" style="width: ${percentage}%"></div>
            </td>
          </tr>
        `;
          })
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Top 10 Bestselling Items</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Item Name</th>
          <th>Quantity Sold</th>
        </tr>
      </thead>
      <tbody>
        ${topItems
          .map(
            ([name, count], index) => `
          <tr>
            <td><strong>#${index + 1}</strong></td>
            <td>${name}</td>
            <td>${count}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Customer Order Statistics</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Unique Customers</td>
          <td>${new Set(orders.map((o) => o.userId)).size}</td>
        </tr>
        <tr>
          <td>Average Items per Order</td>
          <td>${(
            orders.reduce((sum, o) => sum + o.items.length, 0) / totalOrders
          ).toFixed(1)}</td>
        </tr>
        <tr>
          <td>Peak Hour</td>
          <td>${analytics.peakHours[0]?.hour || 'N/A'}:00 - ${
    (analytics.peakHours[0]?.hour || 0) + 1
  }:00</td>
        </tr>
        <tr>
          <td>Most Popular Day</td>
          <td>${analytics.revenueByDay.sort((a, b) => b.revenue - a.revenue)[0]?.date || 'N/A'}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated on ${new Date().toLocaleString()}<br>
    Smart Café - AI-Powered Food Ordering System<br>
    © ${new Date().getFullYear()} All Rights Reserved
  </div>
</body>
</html>
  `;

  // Save HTML to file
  const fileName = `sales_report_${Date.now()}.html`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(filePath, html, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return filePath;
};

export const sharePDFReport = async (filePath: string) => {
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/html',
      dialogTitle: 'Share Sales Report',
      UTI: 'public.html',
    });
  }
};

export const generateCSVReport = async (data: ReportData): Promise<string> => {
  const { orders } = data;

  const csvRows = [
    [
      'Order ID',
      'Date',
      'Customer',
      'Items',
      'Total Amount',
      'Payment Method',
      'Status',
      'Table',
    ].join(','),
  ];

  orders.forEach((order) => {
    const items = order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join('; ');
    csvRows.push(
      [
        order.id,
        new Date(order.createdAt).toLocaleString(),
        order.userName,
        `"${items}"`,
        order.finalAmount,
        order.paymentMethod,
        order.status,
        order.tableNumber || 'N/A',
      ].join(',')
    );
  });

  const csv = csvRows.join('\n');
  const fileName = `orders_export_${Date.now()}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(filePath, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return filePath;
};
