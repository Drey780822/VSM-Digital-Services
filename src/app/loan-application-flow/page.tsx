import LoanFlowLayout from './components/LoanFlowLayout';
import LoanWizard from './components/LoanWizard';

export default function LoanApplicationFlowPage() {
  return (
    <LoanFlowLayout>
      <LoanWizard />
    </LoanFlowLayout>
  );
}