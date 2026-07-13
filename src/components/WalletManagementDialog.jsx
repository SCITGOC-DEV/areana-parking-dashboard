import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL Mutation
const UPDATE_WALLET_AMOUNT = gql`
  mutation UpdateWalletAmount(
    $amount: String!,
    $note: String!,
    $passengerPhoneNo: String!,
    $transactionType: String!
  ) {
    walletUpdateWalletAmount(
      amount: $amount, 
      note: $note, 
      passengerPhoneNo: $passengerPhoneNo,
      role: "admin",
      transactionType: $transactionType
    ) {
      error
      message
    }
  }
`;

const WalletModalComponent = ({
                                  passenger,
                                  visible,
                                  onClose,
                                  onSuccess,
                                  onError,
                                  initialTab = 'topUp'
                              }) => {
    // State
    const [activeTab, setActiveTab] = useState(initialTab);
    const [form, setForm] = useState({ amount: '', note: '', transactionType: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setActiveTab(initialTab);
            resetForm();
        }
    }, [visible, initialTab]);

    const [updateWallet] = useMutation(UPDATE_WALLET_AMOUNT, {
        onCompleted: (data) => {
            const { error, message } = data.walletUpdateWalletAmount;
            error ? onError?.(message) : onSuccess?.(message);
            if (!error) handleClose();
        },
        onError: (error) => onError?.(error.message),
    });

    // Helper functions
    const resetForm = () => setForm({ amount: '', note: '', transactionType: '' });
    const handleClose = () => onClose?.();
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!form.amount || !passenger) return;
        if (activeTab === 'update' && !form.transactionType) return;

        setLoading(true);
        try {
            await updateWallet({
                variables: {
                    amount: form.amount,
                    note: form.note || '',
                    passengerPhoneNo: passenger.phone_number,
                    transactionType: activeTab === 'topUp' ? 'credit' : form.transactionType,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-overlay" onClick={handleClose}></div>
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{passenger ? `${passenger.name}'s Wallet` : 'Wallet Management'}</h3>
                    <button onClick={handleClose} className="close-btn">&times;</button>
                </div>

                {/* Tabs */}
                <div className="modal-tabs">
                    {['topUp', 'update'].map((tab) => (
                        <button
                            key={tab}
                            className={`tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'topUp' ? 'Top Up' : 'Update Wallet'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="modal-content">
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="Enter amount"
                        />
                    </div>

                    {activeTab === 'update' && (
                        <div className="form-group">
                            <label>Transaction Type</label>
                            <select name="transactionType" value={form.transactionType} onChange={handleChange}>
                                <option value="">Select type</option>
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Note</label>
                        <textarea
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Enter note (optional)"
                        ></textarea>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !form.amount || (activeTab === 'update' && !form.transactionType)}
                        className="submit-btn"
                    >
                        {loading ? 'Processing...' : activeTab === 'topUp' ? 'Top Up' : 'Update Wallet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletModalComponent;