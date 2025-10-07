import React, { useEffect, useState } from 'react';
import { supabase, PaymentRecord } from '../../lib/supabase';
import { format } from 'date-fns';
import '../../styles/global.css';
import DevPanel from '../../components/dev/DevPanel';

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
        <div className="spinner"><DevPanel />
</div>
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--armora-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--armora-navy)', color: 'white', padding: 'var(--armora-space-lg)' }}>
        <h1 style={{ fontSize: 'var(--armora-text-2xl)' }}>Earnings</h1>
        <p style={{ fontSize: 'var(--armora-text-sm)', opacity: 0.9, marginTop: 'var(--armora-space-xs)' }}>
          Track your payments and income
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--armora-space-lg)' }}>
        {/* Earnings Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-md)', marginBottom: 'var(--armora-space-md)' }}>
          <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--armora-success)', color: 'white' }}>
            <p style={{ fontSize: 'var(--armora-text-sm)', opacity: 0.9, marginBottom: 'var(--armora-space-xs)' }}>
              Total Earnings
            </p>
            <p style={{ fontSize: 'var(--armora-text-2xl)', fontWeight: 700 }}>
              £{earnings.totalEarnings.toFixed(2)}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--armora-warning)', color: 'white' }}>
            <p style={{ fontSize: 'var(--armora-text-sm)', opacity: 0.9, marginBottom: 'var(--armora-space-xs)' }}>
              Pending
            </p>
            <p style={{ fontSize: 'var(--armora-text-2xl)', fontWeight: 700 }}>
              £{earnings.pendingPayments.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--armora-space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
                Completed Payments
              </p>
              <p style={{ fontSize: 'var(--armora-text-2xl)', fontWeight: 700 }}>
                {earnings.completedPayments}
              </p>
            </div>
            <div style={{ fontSize: '48px' }}>💰</div>
          </div>
        </div>

        {/* Payment History */}
        <h3 style={{ marginBottom: 'var(--armora-space-md)', paddingLeft: 'var(--armora-space-xs)' }}>
          Payment History
        </h3>

        {earnings.payments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--armora-space-xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--armora-space-md)' }}>💳</div>
            <h3 style={{ marginBottom: 'var(--armora-space-sm)' }}>No Payments Yet</h3>
            <p style={{ color: 'var(--armora-text-secondary)' }}>
              Complete assignments to start earning
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-md)' }}>
            {earnings.payments.map((payment) => (
              <div key={payment.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--armora-space-md)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--armora-text-lg)', marginBottom: 'var(--armora-space-xs)' }}>
                      £{payment.amount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-md)', marginBottom: 'var(--armora-space-md)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Payment Method</p>
                    <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {payment.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Currency</p>
                    <p style={{ fontWeight: 600 }}>{payment.currency.toUpperCase()}</p>
                  </div>
                </div>

                {payment.paid_at && (
                  <div>
                    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>Paid On</p>
                    <p style={{ fontWeight: 600 }}>{format(new Date(payment.paid_at), 'PPp')}</p>
                  </div>
                )}

                {payment.stripe_payment_intent_id && (
                  <div style={{ marginTop: 'var(--armora-space-sm)' }}>
                    <p style={{ fontSize: 'var(--armora-text-xs)', color: 'var(--armora-text-secondary)' }}>
                      Transaction ID: {payment.stripe_payment_intent_id.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bank Account Info */}
        <div className="card" style={{ marginTop: 'var(--armora-space-lg)', backgroundColor: '#dbeafe' }}>
          <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>💡 Payment Information</h3>
          <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-sm)' }}>
            Payments are processed within 3-5 business days after assignment completion.
          </p>
          <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
            Make sure your bank account details are up to date in Settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
