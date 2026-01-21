'use client';

import { useState } from 'react';
import { Calculator, ArrowRightLeft, Info } from 'lucide-react';

const gstRates = [0, 5, 12, 18, 28];

interface CalculationResult {
    baseAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    gstAmount: number;
}

export default function GSTCalculatorPage() {
    const [amount, setAmount] = useState('');
    const [gstRate, setGstRate] = useState(18);
    const [calculationType, setCalculationType] = useState<'exclusive' | 'inclusive'>('exclusive');
    const [taxType, setTaxType] = useState<'intra' | 'inter'>('intra');
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [history, setHistory] = useState<Array<CalculationResult & { type: string; rate: number }>>([]);

    const calculate = () => {
        const inputAmount = parseFloat(amount);
        if (isNaN(inputAmount) || inputAmount <= 0) return;

        let baseAmount: number;
        let gstAmount: number;

        if (calculationType === 'exclusive') {
            // GST is added to the amount
            baseAmount = inputAmount;
            gstAmount = (inputAmount * gstRate) / 100;
        } else {
            // GST is included in the amount
            baseAmount = (inputAmount * 100) / (100 + gstRate);
            gstAmount = inputAmount - baseAmount;
        }

        const halfGst = gstAmount / 2;

        const newResult: CalculationResult = {
            baseAmount: Math.round(baseAmount * 100) / 100,
            cgst: taxType === 'intra' ? Math.round(halfGst * 100) / 100 : 0,
            sgst: taxType === 'intra' ? Math.round(halfGst * 100) / 100 : 0,
            igst: taxType === 'inter' ? Math.round(gstAmount * 100) / 100 : 0,
            totalAmount: Math.round((baseAmount + gstAmount) * 100) / 100,
            gstAmount: Math.round(gstAmount * 100) / 100
        };

        setResult(newResult);
        setHistory([{ ...newResult, type: calculationType, rate: gstRate }, ...history.slice(0, 9)]);
    };

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const clearAll = () => {
        setAmount('');
        setResult(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">GST Calculator</h1>
                <p className="text-muted-foreground">Calculate GST for Indian goods and services</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calculator */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                        {/* Calculation Type Toggle */}
                        <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                            <button
                                onClick={() => setCalculationType('exclusive')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${calculationType === 'exclusive'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                GST Exclusive
                            </button>
                            <button
                                onClick={() => setCalculationType('inclusive')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${calculationType === 'inclusive'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                GST Inclusive
                            </button>
                        </div>

                        {/* Tax Type */}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="taxType"
                                    checked={taxType === 'intra'}
                                    onChange={() => setTaxType('intra')}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm text-foreground">Intra-state (CGST + SGST)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="taxType"
                                    checked={taxType === 'inter'}
                                    onChange={() => setTaxType('inter')}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm text-foreground">Inter-state (IGST)</span>
                            </label>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {calculationType === 'exclusive' ? 'Amount (Before GST)' : 'Amount (Including GST)'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 text-lg rounded-lg border border-input bg-background text-foreground"
                                    placeholder="Enter amount"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* GST Rate Selection */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">GST Rate</label>
                            <div className="flex gap-2">
                                {gstRates.map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => setGstRate(rate)}
                                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${gstRate === rate
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {rate}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <div className="flex gap-3">
                            <button
                                onClick={calculate}
                                disabled={!amount}
                                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Calculator className="w-5 h-5" />
                                Calculate GST
                            </button>
                            <button
                                onClick={clearAll}
                                className="px-6 py-3 bg-secondary text-muted-foreground rounded-lg font-medium hover:text-foreground transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Results */}
                        {result && (
                            <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                                    Calculation Result
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-border">
                                        <span className="text-muted-foreground">Base Amount</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.baseAmount)}</span>
                                    </div>

                                    {taxType === 'intra' ? (
                                        <>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">CGST ({gstRate / 2}%)</span>
                                                <span className="font-medium text-foreground">{formatCurrency(result.cgst)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">SGST ({gstRate / 2}%)</span>
                                                <span className="font-medium text-foreground">{formatCurrency(result.sgst)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between py-2 border-b border-border">
                                            <span className="text-muted-foreground">IGST ({gstRate}%)</span>
                                            <span className="font-medium text-foreground">{formatCurrency(result.igst)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between py-2 border-b border-border">
                                        <span className="text-muted-foreground">Total GST</span>
                                        <span className="font-medium text-primary">{formatCurrency(result.gstAmount)}</span>
                                    </div>

                                    <div className="flex justify-between py-3 bg-primary/10 rounded-lg px-3 -mx-3">
                                        <span className="font-semibold text-foreground">Total Amount</span>
                                        <span className="text-xl font-bold text-primary">{formatCurrency(result.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* GST Info */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500" />
                            GST Rates Guide
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">0%</span>
                                <span className="text-foreground">Essential items, exports</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">5%</span>
                                <span className="text-foreground">Basic necessities</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">12%</span>
                                <span className="text-foreground">Standard goods</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">18%</span>
                                <span className="text-foreground">Most services, IT</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">28%</span>
                                <span className="text-foreground">Luxury items, cars</span>
                            </div>
                        </div>
                    </div>

                    {/* Calculation History */}
                    {history.length > 0 && (
                        <div className="bg-card rounded-xl border border-border p-6">
                            <h3 className="font-semibold text-foreground mb-4">Recent Calculations</h3>
                            <div className="space-y-3">
                                {history.map((item, index) => (
                                    <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Base: {formatCurrency(item.baseAmount)}</span>
                                            <span className="text-primary font-medium">{item.rate}%</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(item.totalAmount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
