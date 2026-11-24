import { services as defaultServices } from '../data/services';
import type { Service } from '../types/service';
import ServiceCard from './ServiceCard';

type ServiceGridProps = {
  ariaLabel?: string;
  onBookService?: (service: Service) => void;
  services?: readonly Service[];
};

function ServiceGrid({
  ariaLabel = 'Available services',
  onBookService,
  services = defaultServices,
}: ServiceGridProps) {
  return (
    <div className="qf-service-grid" role="list" aria-label={ariaLabel}>
      {services.map((service) => (
        <div className="qf-service-grid__item" key={service.id} role="listitem">
          <ServiceCard service={service} onBookService={onBookService} />
        </div>
      ))}
    </div>
  );
}

export type { ServiceGridProps };
export default ServiceGrid;
