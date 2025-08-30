import React from 'react';

const AdminPanel = ({ bills, onStatusChange }) => {
  return (
    <div className="card">
      <h3>বিল ম্যানেজমেন্ট</h3>
      
      {bills.length === 0 ? (
        <div>
          <p>কোন বিল পাওয়া যায়নি</p>
          <p>বিল দেখতে হলে প্রথমে ব্যবহারকারীরা বিল সাবমিট করতে হবে।</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>বিল ID</th>
                <th>গ্রাহক</th>
                <th>ইমেইল</th>
                <th>ফোন</th>
                <th>মোট Amount</th>
                <th>জমাদানকারী</th>
                <th>তারিখ</th>
                <th>স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill._id}>
                  <td>{bill._id.substring(0, 8)}...</td>
                  <td>{bill.customerName}</td>
                  <td>{bill.customerEmail}</td>
                  <td>{bill.customerPhone}</td>
                  <td>{bill.grandTotal} টাকা</td>
                  <td>{bill.submittedBy?.name || 'Unknown'}</td>
                  <td>{new Date(bill.submissionDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      backgroundColor: 
                        bill.status === 'Approved' ? '#d4edda' : 
                        bill.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                      color: 
                        bill.status === 'Approved' ? '#155724' : 
                        bill.status === 'Rejected' ? '#721c24' : '#856404'
                    }}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={bill.status} 
                      onChange={(e) => onStatusChange(bill._id, e.target.value)}
                      style={{ padding: '5px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;