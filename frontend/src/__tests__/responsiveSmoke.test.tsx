import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import App from '../App';
import { QUICKFIX_BOOKINGS_STORAGE_KEY } from '../storage/localStorageAdapter';
import type { Booking } from '../types/booking';
import '../styles/tokens.css';
import '../styles/global.css';
import '../styles/app.css';

type ViewportSize = {
  width: number;
  height: number;
};

const desktopViewport: ViewportSize = {
  width: 1280,
  height: 900,
};

const mobileViewport: ViewportSize = {
  width: 390,
  height: 844,
};

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-responsive-test-id',
    customerId: 'customer-alex-rivera',
    serviceId: 'plumbing',
    serviceName: 'Plumbing',
    customerName: 'Alex Rivera',
    phone: '+1 555-010-0142',
    address: '214 North Loop Avenue',
    appointmentDate: '2099-04-10',
    appointmentTime: '09:30',
    description: 'Kitchen sink drain is running slowly.',
    status: 'Pending',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

function storeBookings(bookings: Booking[]) {
  window.localStorage.setItem(
    QUICKFIX_BOOKINGS_STORAGE_KEY,
    JSON.stringify({ bookings }),
  );
}

function setViewport({ width, height }: ViewportSize) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: width,
  });

  window.dispatchEvent(new Event('resize'));
}

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function selectMode(mode: 'customer' | 'admin') {
  fireEvent.change(screen.getByLabelText('Mode'), {
    target: { value: mode },
  });
}

async function expectCustomerShell() {
  expect(
    await screen.findByRole('navigation', { name: 'Primary navigation' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Book' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'My Bookings' })).toBeInTheDocument();
}

function expectNoHorizontalOverflowExceptAdminTable() {
  const overflowingElements = Array.from(
    document.body.querySelectorAll<HTMLElement>('*'),
  ).filter((element) => {
    const className = typeof element.className === 'string'
      ? element.className
      : '';
    const isAdminTable = className.includes('admin-bookings__table');
    const allowsHorizontalScroll = getComputedStyle(element).overflowX === 'auto';

    return !isAdminTable
      && !allowsHorizontalScroll
      && element.scrollWidth > window.innerWidth;
  });

  expect(overflowingElements).toEqual([]);
}

function getInjectedCssText() {
  return Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');
}

describe('responsive smoke coverage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders customer layouts at mobile and desktop widths without horizontal overflow', async () => {
    const viewports = [mobileViewport, desktopViewport];

    for (const viewport of viewports) {
      cleanup();
      window.localStorage.clear();
      storeBookings([
        createBooking({
          id: `booking-responsive-customer-${viewport.width}`,
          status: 'Confirmed',
        }),
      ]);
      setViewport(viewport);
      renderApp('/');
      selectMode('customer');

      await expectCustomerShell();
      expect(
        screen.getByRole('heading', {
          name: 'Book trusted home help without calling support.',
        }),
      ).toBeInTheDocument();
      expectNoHorizontalOverflowExceptAdminTable();

      fireEvent.click(screen.getByRole('link', { name: 'Book' }));

      expect(
        await screen.findByRole('heading', { name: 'Schedule an appointment' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Service')).toBeInTheDocument();
      expectNoHorizontalOverflowExceptAdminTable();

      fireEvent.click(screen.getByRole('link', { name: 'My Bookings' }));

      expect(
        await screen.findByRole('heading', { name: 'My bookings' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Kitchen sink drain is running slowly.'),
      ).toBeInTheDocument();
      expectNoHorizontalOverflowExceptAdminTable();
    }
  });

  it('renders admin layouts and keeps only the desktop table as a scroll container', async () => {
    storeBookings([
      createBooking({
        id: 'booking-responsive-admin',
        status: 'Pending',
      }),
    ]);

    setViewport(desktopViewport);
    renderApp('/');
    selectMode('admin');

    expect(
      await screen.findByRole('heading', { name: 'Admin Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    const tableWrap = document.querySelector('.admin-bookings__table-wrap');

    expect(tableWrap).toBeInstanceOf(HTMLElement);
    expectNoHorizontalOverflowExceptAdminTable();

    cleanup();
    storeBookings([createBooking({ id: 'booking-responsive-admin-mobile' })]);
    setViewport(mobileViewport);
    renderApp('/');
    selectMode('admin');

    expect(
      await screen.findByRole('heading', { name: 'Admin Dashboard' }),
    ).toBeInTheDocument();
    expectNoHorizontalOverflowExceptAdminTable();

    const cssText = getInjectedCssText();

    expect(cssText).toContain('.admin-bookings__table-wrap');
    expect(cssText).toContain('overflow-x: auto');
    expect(cssText).toContain('@media (max-width: 760px)');
    expect(cssText).toContain('overflow: visible');
  });

  it('keeps responsive CSS contracts for major customer and admin grids', () => {
    setViewport(mobileViewport);
    renderApp('/');

    const cssText = getInjectedCssText();

    expect(cssText).toContain('.home-page__service-grid');
    expect(cssText).toContain('.booking-form__grid');
    expect(cssText).toContain('.my-bookings-page__grid');
    expect(cssText).toContain('.qf-admin-stats__grid');
    expect(cssText).toContain('grid-template-columns: 1fr');
    expect(cssText).toContain(
      'grid-template-columns: repeat(2, minmax(0, 1fr))',
    );
  });
});
