import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';

const FileUpload = ({ onDataProcessed }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const processExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Manually extract data from specific cells
          const items = [];
          let row = 1; // Data শুরু হয় কোন row থেকে (0-based)
          
          while (true) {
            // আপনার Excel structure অনুযায়ী cell addresses adjust করুন
            const nameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Column A
            const phoneCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })]; // Column B
            const productCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 2 })]; // Column C
            const amountCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 3 })]; // Column D
            
            // যদি কোন cell না থাকে, তাহলে break করুন
            if (!nameCell && !phoneCell && !productCell && !amountCell) break;
            
            // Data extract করুন
            const customerName = nameCell ? nameCell.v : '';
            const phone = phoneCell ? phoneCell.v.toString() : '';
            const product = productCell ? productCell.v : '';
            
            // Amount handle করুন
            let amount = 0;
            if (amountCell) {
              if (typeof amountCell.v === 'string') {
                amount = parseFloat(amountCell.v.replace(/[^\d.]/g, '')) || 0;
              } else {
                amount = parseFloat(amountCell.v) || 0;
              }
            }
            
            // যদি valid data থাকে, তাহলে items array তে add করুন
            if (customerName && customerName !== '학년' && amount > 0) {
              items.push({
                id: row + 1,
                customerName: customerName.toString().trim(),
                phone: phone.toString().trim(),
                product: product.toString().trim(),
                price: amount,
                quantity: 1,
                discount: 0,
                total: amount
              });
            }
            
            row++;
          }
          
          console.log('Manually Extracted Items:', items);
          
          if (items.length === 0) {
            throw new Error('ফাইলে কোনো valid ডেটা পাওয়া যায়নি। দয়া করে ফাইল format চেক করুন।');
          }

          const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
          
          resolve({ items, grandTotal });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('দয়া করে একটি ফাইল নির্বাচন করুন');
      return;
    }

    setUploading(true);
    
    try {
      const result = await processExcelFile(selectedFile);
      
      if (result.items.length === 0) {
        alert('ফাইলে কোনো valid ডেটা পাওয়া যায়নি। দয়া করে ফাইল format চেক করুন।');
        return;
      }
      
      onDataProcessed(result.items, result.grandTotal);
      alert('ফাইল সফলভাবে প্রসেস করা হয়েছে! ' + result.items.length + 'টি আইটেম পাওয়া গেছে।');
    } catch (error) {
      console.error('File processing error:', error);
      alert('ফাইল প্রসেসিং ব্যর্থ হয়েছে: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3>এক্সেল ফাইল আপলোড</h3>
      <div className="form-group">
        <label>এক্সেল ফাইল নির্বাচন করুন (.xlsx, .xls, .csv):</label>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileChange}
        />
      </div>
      {selectedFile && (
        <div>
          <p>নির্বাচিত ফাইল: {selectedFile.name}</p>
          <p>ফাইলের সাইজ: {(selectedFile.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
      <button 
        className="btn btn-primary" 
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'প্রসেস হচ্ছে...' : 'ফাইল প্রসেস করুন'}
      </button>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h4>ফাইল format নির্দেশিকা:</h4>
        <ul>
          <li>কলাম 1: গ্রাহকের নাম (নাম, 학년)</li>
          <li>কলাম 2: ফোন নম্বর (ফোন, 학년명)</li>
          <li>কলাম 3: পণ্যের নাম (পণ্য, 학회관리자)</li>
          <li>কলাম 4: Amount (পরিমাণ, 응답 과제공항)</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;