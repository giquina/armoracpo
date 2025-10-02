import React, { useEffect, useState } from 'react';
import { supabase, PaymentRecord } from '../../lib/supabase';
import { format } from 'date-fns';
import '../../styles/global.css';

interface EarningsData {
  totalEarnings: number;
  pendingPayments: number;
  completedPayments: number;
  payments: PaymentRecord[];
}

const Earnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0,
    payments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get CPO profile
      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cpoData) return;

      // Get all payments
      const { data: paymentsData } = await supabase
        .from('payment_records')
        .select('*')
        .eq('cpo_id', cpoData.id)
        .order('created_at', { ascending: false });

      if (paymentsData) {
        const totalEarnings = paymentsData
          .filter(p => p.payment_status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);

        const pendingPayments = paymentsData
          .filter(p => p.payment_status === 'pending' || p.payment_status === 'processing')
          .reduce((sum, p) => sum + p.amount, 0);

        const completedPayments = paymentsData
          .filter(p => p.payment_status === 'completed')
          .length;

        setEarnings({
          totalEarnings,
          pendingPayments,
          completedPayments,
          payments: paymentsData
        });
      }
    } catch (err) {
      console.error('Error loading earnings:', err);
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

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Earnings</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginTop: 'var(--spacing-xs)' }}>
          Track your payments and income
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
        {/* Earnings Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--color-success)', color: 'white' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-xs)' }}>
              Total Earnings
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
              £{earnings.totalEarnings.toFixed(2)}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--color-warning)', color: 'white' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-xs)' }}>
              Pending
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
              £{earnings.pendingPayments.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Completed Payments
              </p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                {earnings.completedPayments}
              </p>
            </div>
            <div style={{ fontSize: '48px' }}>💰</div>
          </div>
        </div>

        {/* Payment History */}
        <h3 style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xs)' }}>
          Payment History
        </h3>

        {earnings.payments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>💳</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Payments Yet</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Complete assignments to start earning
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {earnings.payments.map((payment) => (
              <div key={payment.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xs)' }}>
                      £{payment.amount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {format(new Date(payment.created_at), 'PPP')}
                    </p>
                  </div>
                  <span className={`badge badge-${
                    payment.payment_status === 'completed' ? 'success' :
                    payment.payment_status === 'processing' ? 'info' :
                    payment.payment_status === 'pending' ? 'warning' :
                    'danger'
                  }`}>
                    {payment.payment_status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Payment Method</p>
                    <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {payment.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Currency</p>
                    <p style={{ fontWeight: 600 }}>{payment.currency.toUpperCase()}</p>
                  </div>
                </div>

                {payment.paid_at && (
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Paid On</p>
                    <p style={{ fontWeight: 600 }}>{format(new Date(payment.paid_at), 'PPp')}</p>
                  </div>
                )}

                {payment.stripe_payment_intent_id && (
                  <div style={{ marginTop: 'var(--spacing-sm)' }}>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Transaction ID: {payment.stripe_payment_intent_id.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bank Account Info */}
        <div className="card" style={{ marginTop: 'var(--spacing-lg)', backgroundColor: '#dbeafe' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>💡 Payment Information</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Payments are processed within 3-5 business days after assignment completion.
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Make sure your bank account details are up to date in Settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
