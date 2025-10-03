import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IconWrapper } from '../../utils/IconWrapper';
import { PaymentRecord } from '../../lib/supabase';
import './PaymentHistoryTable.css';

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
  onExport?: () => void;
}

const ITEMS_PER_PAGE = 10;

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ payments, onExport }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPayments = payments.slice(startIndex, endIndex);

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'processing': return 'badge-info';
      case 'pending': return 'badge-warning';
      case 'failed': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="payment-history-table">
      <div className="payment-history-table__header">
        <h3>Payment History</h3>
        {onExport && (
          <button className="payment-history-table__export" onClick={onExport}>
            <IconWrapper icon={FiDownload} size={16} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="payment-history-table__empty">
          <p>No payment records found</p>
        </div>
      ) : (
        <>
          <div className="payment-history-table__container">
            <table className="payment-history-table__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{format(new Date(payment.created_at), 'dd/MM/yyyy')}</td>
                    <td className="payment-history-table__amount">
                      £{payment.amount.toFixed(2)}
                    </td>
                    <td className="payment-history-table__method">
                      {payment.payment_method.replace('_', ' ')}
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(payment.payment_status)}`}>
                        {getStatusLabel(payment.payment_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="payment-history-table__pagination">
              <button
                className="payment-history-table__page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <IconWrapper icon={FiChevronLeft} size={18} />
              </button>
              <span className="payment-history-table__page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="payment-history-table__page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <IconWrapper icon={FiChevronRight} size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistoryTable;
