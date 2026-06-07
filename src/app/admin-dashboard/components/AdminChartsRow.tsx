'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const BookingsTrendChart = dynamic(() => import('./BookingsTrendChart'), { ssr: false });
const LoanDisbursementChart = dynamic(() => import('./LoanDisbursementChart'), { ssr: false });
const RepaymentRadialChart = dynamic(() => import('./RepaymentRadialChart'), { ssr: false });

export default function AdminChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <BookingsTrendChart />
      </div>
      <div className="grid grid-rows-2 gap-6">
        <LoanDisbursementChart />
        <RepaymentRadialChart />
      </div>
    </div>
  );
}