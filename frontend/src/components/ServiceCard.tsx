import { useId } from 'react';

import Button from './ui/Button';
import Card from './ui/Card';
import ServiceIcon from './icons/ServiceIcon';
import type { Service } from '../types/service';

type ServiceCardProps = {
  onBookService?: (service: Service) => void;
  service: Service;
};

function ServiceCard({ onBookService, service }: ServiceCardProps) {
  const componentId = useId();
  const titleId = `${componentId}-${service.id}-title`;

  function handleBookClick() {
    onBookService?.(service);
  }

  return (
    <Card
      aria-labelledby={titleId}
      className="qf-service-card"
      elevated
    >
      <div className="qf-service-card__icon-shell">
        <ServiceIcon iconKey={service.iconKey} />
      </div>

      <div className="qf-service-card__content">
        <h3 id={titleId}>{service.name}</h3>
        <p>{service.description}</p>
      </div>

      <div className="qf-service-card__footer">
        <p className="qf-service-card__price">{service.price}</p>
        <Button block onClick={handleBookClick}>
          Book {service.name}
        </Button>
      </div>
    </Card>
  );
}

export type { ServiceCardProps };
export default ServiceCard;
