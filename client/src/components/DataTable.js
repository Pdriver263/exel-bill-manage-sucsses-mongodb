import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DataTable = ({ items: initialItems, grandTotal: initialGrandTotal }) => {
  const [items, setItems] = useState(initialItems || []);
  const [grandTotal, setGrandTotal] = useState(initialGrandTotal || 0);
  const [submittingSingle, setSubmittingSingle] = useState({});
  const { user } = useAuth();

  const handleDiscountChange = (index, discount) => {
    const newItems = [...items];
    newItems[index].discount = Math.max(0, Math.min(100, discount));
    newItems[index].total = newItems[index].price * newItems[index].quantity * (1 - newItems[index].discount / 100);
    
    setItems(newItems);
    setGrandTotal(newItems.reduce((sum, item) => sum + item.total, 0));
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, parseInt(quantity) || 1);
    newItems[index].total = newItems[index].price * newItems[index].quantity * (1 - newItems[index].discount / 100);
    
    setItems(newItems);
    setGrandTotal(newItems.reduce((sum, item) => sum + item.total, 0));
  };

  // একটি মাত্র বিল সাবমিট - Real Database Submission
  const handleSubmitSingle = async (item, index) => {
    console.log('Submitting single bill:', item);
    
    if (!user) {
      alert('দয়া করে প্রথমে লগইন করুন');
      return;
    }

    setSubmittingSingle(prev => ({ ...prev, [index]: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/submit-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName: item.customerName,
          customerEmail: `${item.customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          customerPhone: item.phone,
          items: [{
            product: item.product,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount,
            total: item.total
          }],
          grandTotal: item.total
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`${item.customerName}-এর বিল সফলভাবে জমা দেওয়া হয়েছে!`);
        
        // সাবমিট করা item remove করুন
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        setGrandTotal(newItems.reduce((sum, item) => sum + item.total, 0));
      } else {
        alert(data.message || 'বিল জমা দেওয়া ব্যর্থ হয়েছে');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('বিল জমা দেওয়া ব্যর্থ হয়েছে: ' + error.message);
    } finally {
      setSubmittingSingle(prev => ({ ...prev, [index]: false }));
    }
  };

  // সম্পূর্ণ বিল সাবমিট
  const handleSubmitAll = async () => {
    if (items.length === 0) {
      alert('কোনো ডেটা পাওয়া যায়নি');
      return;
    }

    if (!user) {
      alert('দয়া করে প্রথমে লগইন করুন');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/submit-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName: "বহু গ্রাহক",
          customerEmail: "multiple@example.com",
          customerPhone: "0000000000",
          items: items,
          grandTotal: grandTotal
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('সমস্ত বিল সফলভাবে জমা দেওয়া হয়েছে!');
        setItems([]);
        setGrandTotal(0);
      } else {
        alert(data.message || 'বিল জমা দেওয়া ব্যর্থ হয়েছে');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('বিল জমা দেওয়া ব্যর্থ হয়েছে: ' + error.message);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="card">
        <h3>বিল ডেটা</h3>
        <p>কোন ডেটা পাওয়া যায়নি। দয়া করে একটি এক্সেল ফাইল আপলোড করুন।</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>বিল ডেটা - আলাদা আলাদা সাবমিট</h3>
      
      <table>
        <thead>
          <tr>
            <th>ক্র. নং</th>
            <th>গ্রাহকের নাম</th>
            <th>ফোন</th>
            <th>পণ্য</th>
            <th>মূল্য</th>
            <th>পরিমাণ</th>
            <th>ডিসকাউন্ট (%)</th>
            <th>মোট</th>
            <th>অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.customerName}</td>
              <td>{item.phone}</td>
              <td>{item.product}</td>
              <td>{item.price} টাকা</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                  style={{ width: '60px' }}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.discount}
                  onChange={(e) => handleDiscountChange(index, parseInt(e.target.value))}
                  style={{ width: '60px' }}
                />
              </td>
              <td>{item.total.toFixed(2)} টাকা</td>
              <td>
                <button 
                  className="btn btn-success" 
                  onClick={() => handleSubmitSingle(item, index)}
                  disabled={submittingSingle[index] || !user}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '12px',
                    minWidth: '80px'
                  }}
                >
                  {submittingSingle[index] ? 'জমা হচ্ছে...' : 'সাবমিট'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>মোট:</td>
            <td style={{ fontWeight: 'bold' }}>{grandTotal.toFixed(2)} টাকা</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmitAll}
          disabled={!user}
        >
          সব বিল একসাথে সাবমিট করুন
        </button>
        
        {!user && (
          <p style={{ color: 'red' }}>বিল জমা দিতে লগইন প্রয়োজন</p>
        )}
      </div>
    </div>
  );
};

export default DataTable;