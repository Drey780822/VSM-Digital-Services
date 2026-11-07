import LoanFlowLayout from './components/LoanFlowLayout';
import LoanWizard from './components/LoanWizard';

interface Props {
  searchParams: Promise<{
    package?: string;
    amount?: string;
    term?: string;
    bookingId?: string;
    bookingRef?: string;
    name?: string;
    email?: string;
    phone?: string;
    idNumber?: string;
    type?: string;
  }>;
}

export default async function LoanApplicationFlowPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <LoanFlowLayout>
      <LoanWizard initialParams={params} />
    </LoanFlowLayout>
  );
}