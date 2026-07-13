import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiZap, FiDownload, FiFileText, FiBarChart2, FiTruck, FiTrendingUp, FiX } from 'react-icons/fi';
import { useToast } from '../../context/ToastProvider';
import { useMutation } from '@apollo/client';
import reportMutations from '../../graphql/mutation/report';
import { DataTable } from '../../common/DataTable';
import { exportDynamicTableData } from '../../utils/ExcelGenerator';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';

export const AIAssistiveReportingScreen = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tableData, setTableData] = useState(null);
    const [columns, setColumns] = useState([]);
    const { addToast } = useToast();
    const { token } = useAuth();

    // Extract user ID from JWT token for session ID
    const getSessionId = () => {
        try {
            if (token) {
                const decoded = jwtDecode(token);
                const userId = decoded.hasura['x-hasura-user-id'];
                return userId.toString();
            }
            return null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const [chatAI] = useMutation(reportMutations.CHAT_AI_DASHBOARD, {
        onCompleted: (data) => {
            console.log('AI Chat Response:', data); // Debug log
            const response = data.chatAIDashboardChat;
            console.log('Response object:', response); // Debug log
            
            if (response.success) {
                // Check different possible response structures
                let rows = null;
                console.log('data: ', response.answer)
                
                // Parse response.answer as JSON if it's a string
                let parsedAnswer = null;
                if (response.answer) {
                    try {
                        parsedAnswer = typeof response.answer === 'string' 
                            ? JSON.parse(response.answer) 
                            : response.answer;
                        console.log('Parsed answer:', parsedAnswer);
                    } catch (error) {
                        console.error('Error parsing answer:', error);
                        addToast('Error parsing response data.', 'error');
                        setIsLoading(false);
                        return;
                    }
                }
                
                // Structure 1: parsedAnswer.rows (from JSON)
                if (parsedAnswer && parsedAnswer.rows) {
                    rows = parsedAnswer.rows;
                    console.log('Found rows in parsedAnswer.rows:', rows);
                }
                // Structure 2: response.rows (direct)
                else if (response.rows) {
                    rows = response.rows;
                    console.log('Found rows in response.rows:', rows);
                }
                // Structure 3: response.data.rows
                else if (response.data && response.data.rows) {
                    rows = response.data.rows;
                    console.log('Found rows in response.data.rows:', rows);
                }
                // Structure 4: parsedAnswer is directly the rows array
                else if (parsedAnswer && Array.isArray(parsedAnswer)) {
                    rows = parsedAnswer;
                    console.log('Found rows in parsedAnswer (direct array):', rows);
                }
                
                if (rows && rows.length > 0) {
                    console.log('First row structure:', rows[0]); // Debug log
                    // Generate columns from the first row
                    const tableColumns = Object.keys(rows[0]).map(key => ({
                        key: key,
                        header: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                        render: (item) => {
                            const value = item[key];
                            
                            // Show N/A for null, undefined, or empty values
                            if (value === null || value === undefined || value === '') {
                                return <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>;
                            }
                            
                            // Check if field is money-related and format with peso sign
                            const isMoneyField = key.toLowerCase().includes('amount') || 
                                               key.toLowerCase().includes('price') || 
                                               key.toLowerCase().includes('cost') || 
                                               key.toLowerCase().includes('fee') || 
                                               key.toLowerCase().includes('charge') || 
                                               key.toLowerCase().includes('total') || 
                                               key.toLowerCase().includes('revenue') || 
                                               key.toLowerCase().includes('income') || 
                                               key.toLowerCase().includes('sales') || 
                                               key.toLowerCase().includes('payment') || 
                                               key.toLowerCase().includes('balance') || 
                                               key.toLowerCase().includes('cash') || 
                                               key.toLowerCase().includes('money') ||
                                               key.toLowerCase().includes('vat') ||
                                               key.toLowerCase().includes('discount') ||
                                               key.toLowerCase().includes('credit') ||
                                               key.toLowerCase().includes('debit') ||
                                               key.toLowerCase().includes('withdrawal') ||
                                               key.toLowerCase().includes('deposit') ||
                                               key.toLowerCase().includes('refund') ||
                                               key.toLowerCase().includes('commission') ||
                                               key.toLowerCase().includes('bonus') ||
                                               key.toLowerCase().includes('salary') ||
                                               key.toLowerCase().includes('wage') ||
                                               key.toLowerCase().includes('tip') ||
                                               key.toLowerCase().includes('fare') ||
                                               key.toLowerCase().includes('ticket_price') ||
                                               key.toLowerCase().includes('card_balance') ||
                                               key.toLowerCase().includes('wallet_balance') ||
                                               key.toLowerCase().includes('account_balance') ||
                                               key.toLowerCase().includes('current_balance') ||
                                               key.toLowerCase().includes('available_balance') ||
                                               key.toLowerCase().includes('remaining_balance') ||
                                               key.toLowerCase().includes('topup_amount') ||
                                               key.toLowerCase().includes('top_up_amount') ||
                                               key.toLowerCase().includes('reload_amount') ||
                                               key.toLowerCase().includes('deduct_amount') ||
                                               key.toLowerCase().includes('transaction_amount') ||
                                               key.toLowerCase().includes('settlement_amount') ||
                                               key.toLowerCase().includes('gross_amount') ||
                                               key.toLowerCase().includes('net_amount') ||
                                               key.toLowerCase().includes('tax_amount') ||
                                               key.toLowerCase().includes('service_fee') ||
                                               key.toLowerCase().includes('processing_fee') ||
                                               key.toLowerCase().includes('convenience_fee');
                            
                            // Check for specific field types for color coding
                            const isVatField = key.toLowerCase().includes('vat');
                            const isDiscountField = key.toLowerCase().includes('discount');
                            const isGrossField = key.toLowerCase().includes('gross');
                            const isNetField = key.toLowerCase().includes('net');
                            const isStatusField = key.toLowerCase().includes('status') || key.toLowerCase().includes('state');
                            const isBooleanField = typeof value === 'boolean' || value === 'true' || value === 'false' || value === 'yes' || value === 'no';
                            const isIdField = key.toLowerCase().includes('id') || key.toLowerCase().includes('no') || key.toLowerCase().includes('number');
                            
                            // Format money fields with peso sign and colors
                            if (isMoneyField && !isNaN(Number(value))) {
                                const numValue = Number(value);
                                let colorClass = 'font-mono text-blue-700 dark:text-blue-300'; // Default blue for money
                                
                                // Color coding for different money field types
                                if (isVatField) {
                                    colorClass = 'font-mono text-orange-700 dark:text-orange-300';
                                } else if (isDiscountField) {
                                    colorClass = 'font-mono text-red-700 dark:text-red-300';
                                } else if (isGrossField) {
                                    colorClass = 'font-mono text-blue-700 dark:text-blue-300';
                                } else if (isNetField) {
                                    colorClass = 'font-mono font-semibold text-green-700 dark:text-green-300';
                                } else if (key.toLowerCase().includes('total')) {
                                    colorClass = 'font-mono font-bold text-gray-900 dark:text-gray-100';
                                }
                                
                                return <span className={colorClass}>₱{numValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
                            }
                            
                            // Format boolean/status fields with colored badges
                            if (isBooleanField || isStatusField) {
                                const boolValue = String(value).toLowerCase();
                                const isPositive = boolValue === 'true' || boolValue === 'yes' || boolValue === 'active' || boolValue === 'success' || boolValue === 'completed';
                                const isNegative = boolValue === 'false' || boolValue === 'no' || boolValue === 'inactive' || boolValue === 'failed' || boolValue === 'cancelled';
                                
                                if (isPositive || isNegative) {
                                    const colorClass = isPositive 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                                    
                                    return (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                                            {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                                        </span>
                                    );
                                }
                            }
                            
                            // Format ID fields with monospace font
                            if (isIdField) {
                                return <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{value}</span>;
                            }
                            
                            // Format dates based on field type
                            if (value && (key === 'created_at' || key === 'updated_at' || key === 'deleted_at')) {
                                // Format as MM/DD/YYYY Time AM/PM
                                try {
                                    const date = new Date(value);
                                    if (!isNaN(date.getTime())) {
                                        return <span className="text-purple-700 dark:text-purple-300 font-medium">
                                            {date.toLocaleString('en-US', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </span>;
                                    }
                                } catch (error) {
                                    console.warn('Error formatting date:', error);
                                }
                            } else if (value && (key.includes('date') || key.includes('_at'))) {
                                // Format other date fields as MM/DD/YYYY
                                try {
                                    const date = new Date(value);
                                    if (!isNaN(date.getTime())) {
                                        return <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                                            {date.toLocaleDateString('en-US', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </span>;
                                    }
                                } catch (error) {
                                    console.warn('Error formatting date:', error);
                                }
                            }
                            
                            // Return original value for non-special fields
                            return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
                        }
                    }));
                    
                    console.log('Generated columns:', tableColumns); // Debug log
                    setColumns(tableColumns);
                    setTableData(rows);
                    addToast('Data loaded successfully!', 'success');
                } else {
                    console.log('No rows found in response. Full response:', response);
                    addToast('No data found for your query.', 'info');
                }
            } else {
                console.log('Response structure issue:', {
                    success: response.success,
                    hasAnswer: !!response.answer,
                    hasRows: !!(response.answer && response.answer.rows),
                    message: response.message
                }); // Debug log
                addToast(response.message || 'Failed to get data from AI assistant.', 'error');
            }
            setIsLoading(false);
        },
        onError: (error) => {
            console.error('AI Chat Error:', error);
            addToast('Failed to communicate with AI assistant.', 'error');
            setIsLoading(false);
        }
    });

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const sessionId = getSessionId();
        if (!sessionId) {
            addToast('Unable to get user session. Please try logging in again.', 'error');
            return;
        }

        setIsLoading(true);
        setTableData(null);
        setColumns([]);

        try {
            await chatAI({
                variables: {
                    message: inputMessage,
                    sessionId: sessionId
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleExport = () => {
        if (tableData && tableData.length > 0) {
            const fileName = `ai_report_${new Date().toISOString().split('T')[0]}`;
            exportDynamicTableData(tableData, fileName, 'AI Report Data');
            addToast('Data exported successfully!', 'success');
        }
    };

    const clearData = () => {
        setTableData(null);
        setColumns([]);
        setInputMessage('');
    };

    const quickActions = [
        { icon: FiBarChart2, label: 'Revenue', query: 'Show me revenue data' },
        { icon: FiTruck, label: 'Buses', query: 'Show me bus data' },
        { icon: FiTrendingUp, label: 'Routes', query: 'Show me bus stop route data' },
        { icon: FiFileText, label: 'Reports', query: 'Show me available reports' }
    ];

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                            <FiZap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-medium text-gray-900 dark:text-white">AI Data Assistant</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ask questions and get data in table format</p>
                        </div>
                    </div>
                    {tableData && (
                        <button
                            onClick={clearData}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <FiX className="w-4 h-4" />
                            <span>Clear</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {!tableData ? (
                    /* Input Section when no data is shown */
                    <div className="h-full flex flex-col justify-center items-center px-6">
                        <div className="max-w-2xl w-full">
                            {/* Welcome Message */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiZap className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    AI Data Assistant
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Ask me about your transit data and I'll show you the results in a table format.
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInputMessage(action.query)}
                                        className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <action.icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                        <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="flex items-center space-x-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me about your transit data... (e.g., 'Show me bus stop routes', 'Get passenger data')"
                                        className="w-full h-12 px-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                                        rows="1"
                                        style={{ minHeight: '48px', maxHeight: '48px' }}
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="w-12 h-12 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center flex-shrink-0"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FiSend className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing your request...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Table Section when data is available */
                    <div className="h-full flex flex-col">
                        {/* Query Info */}
                        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                                        <FiZap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                            Query: <span className="font-semibold text-slate-900 dark:text-white italic">{inputMessage}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Found <span className="font-bold text-emerald-600 dark:text-emerald-400">{tableData.length}</span> records
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Minimal Data Table */}
                        <div className="flex-1 overflow-hidden p-4">
                            {/* Centered Table Container */}
                            <div className="max-w-7xl mx-auto h-full">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm h-full flex flex-col overflow-hidden">
                                    {/* Clean Minimal Header */}
                                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                                                    <FiZap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                                        Query Results
                                                    </h3>
                                                    <div className="flex items-center space-x-3 mt-0.5">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 uppercase tracking-wider">
                                                            {tableData.length} records
                                                        </span>
                                                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium italic max-w-md truncate">
                                                            "{inputMessage}"
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={handleExport}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-lg transition-all duration-200 text-sm font-bold shadow-md hover:shadow-xl transform hover:scale-105 uppercase tracking-wide"
                                                >
                                                    <FiDownload className="w-4 h-4" />
                                                    <span>Download</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Clean Table Container */}
                                    <div className="flex-1 p-4 overflow-hidden">
                                        <div className="h-full w-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300/60 dark:scrollbar-thumb-gray-600/60 scrollbar-track-transparent">
                                            <DataTable
                                                title=""
                                                columns={columns}
                                                data={tableData}
                                                showNoColumn={true}
                                                enablePagination={true}
                                                className="w-full"
                                                tableClassName="w-full border-collapse"
                                                headerClassName="sticky top-0 z-20"
                                                headerCellClassName="bg-slate-50/90 dark:bg-slate-700/90 backdrop-blur-sm border-b-2 border-slate-200 dark:border-slate-600 px-6 py-4 text-center text-sm font-black text-slate-800 dark:text-slate-100 tracking-wider uppercase"
                                                rowClassName="border-b border-slate-100 dark:border-slate-700/60"
                                                cellClassName="text-center border-b border-slate-100 dark:border-slate-700/60 px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-50"
                                                noDataClassName="text-center py-16 text-gray-500 dark:text-gray-400 text-base"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};