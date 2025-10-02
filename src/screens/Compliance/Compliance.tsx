import React, { useEffect, useState } from 'react';
import { supabase, ProtectionOfficer } from '../../lib/supabase';
import { format, differenceInDays } from 'date-fns';
import '../../styles/global.css';

const Compliance: React.FC = () => {
  const [cpo, setCpo] = useState<ProtectionOfficer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('protection_officers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setCpo(data);
    } catch (err) {
      console.error('Error loading compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!cpo) return null;

  const siaExpiryDate = new Date(cpo.sia_license_expiry);
  const daysUntilExpiry = differenceInDays(siaExpiryDate, new Date());
  const isSiaExpired = daysUntilExpiry < 0;
  const isSiaExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Compliance Center</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginTop: 'var(--spacing-xs)' }}>
          Manage your certifications and documents
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Overall Compliance Status */}
        <div className="card" style={{
          marginBottom: 'var(--spacing-md)',
          backgroundColor: isSiaExpired ? '#fee2e2' : isSiaExpiringSoon ? '#fef3c7' : '#d1fae5',
          border: `2px solid ${isSiaExpired ? 'var(--color-danger)' : isSiaExpiringSoon ? 'var(--color-warning)' : 'var(--color-success)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {isSiaExpired ? '⚠️ Compliance Issue' : isSiaExpiringSoon ? '⚠️ Action Required' : '✅ Fully Compliant'}
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {isSiaExpired
                  ? 'Your SIA license has expired'
                  : isSiaExpiringSoon
                  ? 'Your SIA license expires soon'
                  : 'All documents are valid'}
              </p>
            </div>
          </div>
        </div>

        {/* SIA License */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
            <h3>🛡️ SIA License</h3>
            <span className={`badge badge-${isSiaExpired ? 'danger' : isSiaExpiringSoon ? 'warning' : 'success'}`}>
              {isSiaExpired ? 'EXPIRED' : isSiaExpiringSoon ? 'EXPIRING SOON' : 'VALID'}
            </span>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>License Number</p>
            <p style={{ fontWeight: 600 }}>{cpo.sia_license_number}</p>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>License Type</p>
            <p style={{ fontWeight: 600, textTransform: 'uppercase' }}>{cpo.sia_license_type}</p>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Expiry Date</p>
            <p style={{ fontWeight: 600 }}>
              {format(siaExpiryDate, 'PPP')}
            </p>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              marginTop: 'var(--spacing-xs)',
              color: isSiaExpired ? 'var(--color-danger)' : isSiaExpiringSoon ? 'var(--color-warning)' : 'var(--color-success)'
            }}>
              {isSiaExpired
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                : `${daysUntilExpiry} days remaining`}
            </p>
          </div>

          {(isSiaExpired || isSiaExpiringSoon) && (
            <button className="btn btn-danger btn-full">
              Renew SIA License
            </button>
          )}
        </div>

        {/* Right to Work */}
        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
            <h3>📋 Right to Work</h3>
            <span className="badge badge-success">VERIFIED</span>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Status</p>
            <p style={{ fontWeight: 600, textTransform: 'uppercase' }}>{cpo.right_to_work_status}</p>
          </div>

          {cpo.right_to_work_document_url && (
            <a
              href={cpo.right_to_work_document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-full"
            >
              View Document
            </a>
          )}
        </div>

        {/* National Insurance */}
        {cpo.national_insurance_number && (
          <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
              <h3>💼 National Insurance</h3>
              <span className="badge badge-success">ON FILE</span>
            </div>

            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>NI Number</p>
              <p style={{ fontWeight: 600 }}>{cpo.national_insurance_number}</p>
            </div>
          </div>
        )}

        {/* Bank Details */}
        {cpo.bank_account_number && (
          <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
              <h3>🏦 Payment Details</h3>
              <span className="badge badge-success">VERIFIED</span>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Account Name</p>
              <p style={{ fontWeight: 600 }}>{cpo.bank_account_name}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Sort Code</p>
                <p style={{ fontWeight: 600 }}>{cpo.bank_sort_code}</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Account Number</p>
                <p style={{ fontWeight: 600 }}>****{cpo.bank_account_number?.slice(-4)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Reminders */}
        <div className="card" style={{ backgroundColor: '#dbeafe' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>💡 Compliance Reminders</h3>
          <ul style={{ paddingLeft: 'var(--spacing-lg)', margin: 0 }}>
            <li style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
              SIA licenses must be renewed before expiry to continue working
            </li>
            <li style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
              Keep your Right to Work documents up to date
            </li>
            <li style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
              Notify us immediately if your circumstances change
            </li>
            <li style={{ fontSize: 'var(--font-size-sm)' }}>
              All CPOs must maintain professional insurance
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="card" style={{ marginTop: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>📞 Need Help?</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            If you have questions about compliance or need to update your documents, contact our support team.
          </p>
          <button className="btn btn-primary btn-full">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
