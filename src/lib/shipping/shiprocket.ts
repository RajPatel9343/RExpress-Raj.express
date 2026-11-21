export interface ShippingRateResult {
  courierName: string;
  rate: number;
  estimatedDays: number;
  isServiceable: boolean;
}

export function isShippingConfigured(): boolean {
  return Boolean(process.env.SHIPROCKET_API_USER && process.env.SHIPROCKET_API_PASSWORD);
}

/**
 * Checks pincode serviceability and estimated delivery window
 */
export async function checkPincodeServiceability(pincode: string): Promise<{
  isServiceable: boolean;
  city: string;
  state: string;
  estimatedDays: number;
  codAvailable: boolean;
}> {
  // Common valid Indian postal codes simulation or integration
  const cleanPin = pincode.trim();
  if (cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
    return {
      isServiceable: false,
      city: '',
      state: '',
      estimatedDays: 0,
      codAvailable: false,
    };
  }

  // Metro detection
  const firstDigit = cleanPin.charAt(0);
  let city = 'Metro Region';
  let state = 'India';
  let estimatedDays = 3;

  if (firstDigit === '4') {
    city = 'Mumbai / Western Region';
    state = 'Maharashtra';
    estimatedDays = 2;
  } else if (firstDigit === '5') {
    city = 'Bengaluru / Hyderabad';
    state = 'Karnataka / Telangana';
    estimatedDays = 2;
  } else if (firstDigit === '1') {
    city = 'Delhi NCR';
    state = 'Delhi';
    estimatedDays = 2;
  } else if (firstDigit === '6') {
    city = 'Chennai / Kochi';
    state = 'Tamil Nadu / Kerala';
    estimatedDays = 3;
  } else if (firstDigit === '7') {
    city = 'Kolkata / Eastern Region';
    state = 'West Bengal';
    estimatedDays = 3;
  }

  return {
    isServiceable: true,
    city,
    state,
    estimatedDays,
    codAvailable: true,
  };
}

/**
 * Generates tracking timeline events based on order status
 */
export function getTrackingTimeline(order: {
  status: string;
  createdAt: Date | string;
  deliveredAt?: Date | string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
}) {
  const createdDate = new Date(order.createdAt);
  const steps = [
    {
      title: 'Order Placed',
      description: 'Your order has been confirmed and registered in our system.',
      time: createdDate.toLocaleString('en-IN'),
      completed: true,
      current: order.status === 'PENDING' || order.status === 'CONFIRMED',
    },
    {
      title: 'Order Processing',
      description: 'Warehouse is picking, verifying and securely packaging your items.',
      time: new Date(createdDate.getTime() + 1000 * 60 * 60 * 4).toLocaleString('en-IN'),
      completed: ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
      current: order.status === 'PROCESSING' || order.status === 'PACKED',
    },
    {
      title: 'Handed Over to Courier',
      description: `Carrier: ${order.courierName || 'Delhivery Express'} (AWB: ${order.trackingNumber || 'Pending'})`,
      time: new Date(createdDate.getTime() + 1000 * 60 * 60 * 18).toLocaleString('en-IN'),
      completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
      current: order.status === 'SHIPPED',
    },
    {
      title: 'Out for Delivery',
      description: 'Delivery associate is en route to your shipping address.',
      time: new Date(createdDate.getTime() + 1000 * 60 * 60 * 36).toLocaleString('en-IN'),
      completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
      current: order.status === 'OUT_FOR_DELIVERY',
    },
    {
      title: 'Delivered',
      description: 'Package delivered to recipient. Return window open for 7 days.',
      time: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('en-IN') : 'Estimated within 2-3 business days',
      completed: order.status === 'DELIVERED',
      current: false,
    },
  ];

  return steps;
}
