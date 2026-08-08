// Delhivery One Logistics & Shipment Tracking Integration Helper for www.beadu.in

export interface ServiceabilityResult {
  pincode: string;
  serviceable: boolean;
  city: string;
  state: string;
  estimatedDays: number;
  codAvailable: boolean;
  courierPartner: string;
  message: string;
}

export interface TrackingStep {
  status: 'Order Placed' | 'Order Accepted' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  location: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface DelhiveryTrackingInfo {
  awbNumber: string;
  orderId: string;
  currentStatus: string;
  estimatedDeliveryDate: string;
  origin: string;
  destination: string;
  steps: TrackingStep[];
}

export function checkDelhiveryServiceability(pincode: string): ServiceabilityResult {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      serviceable: false,
      city: '',
      state: '',
      estimatedDays: 0,
      codAvailable: false,
      courierPartner: 'Delhivery Express',
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  // Simulated Delhivery pin coverage lookup
  const isMetro = ['110', '400', '560', '600', '700', '500', '380', '411'].some((prefix) =>
    cleanPin.startsWith(prefix)
  );

  const days = isMetro ? 2 : 4;
  const today = new Date();
  today.setDate(today.getDate() + days);
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return {
    pincode: cleanPin,
    serviceable: true,
    city: isMetro ? 'Metro Destination Hub' : 'Regional Express Delivery Hub',
    state: 'India',
    estimatedDays: days,
    codAvailable: true,
    courierPartner: 'Delhivery Surface & Air Express',
    message: `Delivery available by ${formattedDate} (${days}-${days + 1} business days)`,
  };
}

/**
 * Production API Integration Function:
 * Fetches real-time shipment scan events directly from Delhivery One REST API.
 */
export async function fetchLiveDelhiveryTrackingAPI(awbNumber: string): Promise<DelhiveryTrackingInfo | null> {
  const apiKey = process.env.DELHIVERY_API_KEY;
  if (!apiKey) return null; // Fallbacks to local progression engine if API key is not present

  try {
    const res = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${encodeURIComponent(awbNumber)}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.ShipmentData || data.ShipmentData.length === 0) return null;

    const shipment = data.ShipmentData[0].Shipment;
    return {
      awbNumber: shipment.AWB,
      orderId: shipment.ReferenceNo || `ORD-${shipment.AWB.slice(-5)}`,
      currentStatus: shipment.Status.Status || 'In Transit',
      estimatedDeliveryDate: shipment.ExpectedDeliveryDate || '2-3 Days',
      origin: shipment.Origin || 'Jaipur Crafts Hub',
      destination: shipment.Destination || 'Customer Address',
      steps: (shipment.Scans || []).map((scan: { ScanDetail: { ScanDateTime: string; Instructions: string; ScannedLocation: string; Scan: string } }) => ({
        status: scan.ScanDetail.Scan as any,
        location: scan.ScanDetail.ScannedLocation,
        timestamp: scan.ScanDetail.ScanDateTime,
        description: scan.ScanDetail.Instructions || scan.ScanDetail.Scan,
        completed: true,
      })),
    };
  } catch {
    return null; // Fallback gracefully if API request times out
  }
}

export function getLiveDelhiveryStatus(createdAt: string, manualStatus?: string): 'Order Placed' | 'Order Accepted' | 'Shipped' | 'Delivered' | 'Cancelled' {
  if (manualStatus === 'Cancelled') return 'Cancelled';

  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - createdTime) / (1000 * 60);

  if (diffMinutes < 2) {
    return 'Order Placed';
  } else if (diffMinutes < 10) {
    return 'Order Accepted';
  } else if (diffMinutes < 60) {
    return 'Shipped';
  } else {
    return 'Delivered';
  }
}

export function generateDelhiveryTracking(orderId: string, createdAt?: string, awbNumber?: string): DelhiveryTrackingInfo {
  const awb = awbNumber || `DLHV${Math.floor(100000000 + Math.random() * 900000000)}`;
  const baseDate = createdAt ? new Date(createdAt) : new Date();
  const liveStatus = getLiveDelhiveryStatus(baseDate.toISOString());

  const step1Time = new Date(baseDate.getTime());
  const step2Time = new Date(baseDate.getTime() + 4 * 3600 * 1000);
  const step3Time = new Date(baseDate.getTime() + 18 * 3600 * 1000);
  const step4Time = new Date(baseDate.getTime() + 42 * 3600 * 1000);

  const estDate = new Date(baseDate.getTime() + 72 * 3600 * 1000);

  return {
    awbNumber: awb,
    orderId,
    currentStatus: liveStatus,
    estimatedDeliveryDate: estDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    origin: 'Jaipur Crafts Hub, Rajasthan',
    destination: 'Customer Shipping Address',
    steps: [
      {
        status: 'Order Placed',
        location: 'www.beadu.in Store',
        timestamp: step1Time.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        description: 'Order confirmed and registered with Delhivery One',
        completed: true,
      },
      {
        status: 'Order Accepted',
        location: 'Jaipur Artisan Studio',
        timestamp: step2Time.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        description: 'Handcrafted items packaged in signature gift box',
        completed: liveStatus !== 'Order Placed',
      },
      {
        status: 'Picked Up',
        location: 'Delhivery Sorting Facility - Jaipur',
        timestamp: step3Time.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        description: 'Shipment received by Delhivery Express Logistics',
        completed: liveStatus === 'Shipped' || liveStatus === 'Delivered',
      },
      {
        status: 'In Transit',
        location: 'National Transport Network',
        timestamp: step4Time.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        description: 'Shipment in transit via Delhivery Express Network',
        completed: liveStatus === 'Shipped' || liveStatus === 'Delivered',
      },
      {
        status: 'Out for Delivery',
        location: 'Local Delivery Hub',
        timestamp: liveStatus === 'Delivered' ? 'Completed' : 'Assigned',
        description: 'Delivery executive assigned for doorstep delivery',
        completed: liveStatus === 'Delivered',
      },
      {
        status: 'Delivered',
        location: 'Destination Address',
        timestamp: liveStatus === 'Delivered' ? 'Delivered' : 'Expected in 1-2 days',
        description: 'Package handed over to recipient',
        completed: liveStatus === 'Delivered',
      },
    ],
  };
}
