import ModernCVIntelligence from '../components/common/ModernCVIntelligence';
import ClientOnly from '../components/shared/ClientOnly';

export default function CVIntelligence() {
  return (
    <ClientOnly>
      <ModernCVIntelligence />
    </ClientOnly>
  );
}
