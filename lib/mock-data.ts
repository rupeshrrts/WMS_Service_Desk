export type TicketStatus =
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Testing'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'
  | 'Escalated';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory =
  | 'Inventory'
  | 'Inbound'
  | 'Outbound'
  | 'Hardware'
  | 'Integration'
  | 'Shipping'
  | 'System';

export interface Attachment {
  name: string;
  size: string;
  url: string;
}

export interface Message {
  id: string;
  author: string;
  avatar?: string;
  role: 'customer' | 'engineer';
  content: string;
  timestamp: string;
  isInternal?: boolean;
  attachments?: Attachment[];
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  customerName: string;
  company: string;
  email: string;
  plant: string;
  warehouse: string;
  module: string;
  priority: TicketPriority;
  category: TicketCategory;
  status: TicketStatus;
  assignedEngineer?: string;
  createdDate: string;
  updatedDate: string;
  slaDeadline?: string;
  messages: Message[];
  activities: ActivityLog[];
  attachments?: Attachment[];
}

export interface KBArticle {
  id: string;
  title: string;
  category: TicketCategory;
  summary: string;
  content: string;
  views: number;
  likes: number;
  lastUpdated: string;
  tags: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  ticketId?: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'System' | 'Maintenance' | 'Update';
  important?: boolean;
}

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'WMS Core System Upgrade (v12.4.0)',
    content: 'Scheduled maintenance this Saturday, August 1st, from 02:00 to 06:00 UTC. ERP interface sync and pick confirmations may experience brief latencies during the database migration.',
    date: '2026-07-26T10:00:00Z',
    category: 'Maintenance',
    important: true,
  },
  {
    id: 'ann-2',
    title: 'New RF Scanner Driver Pack Released',
    content: 'A new driver patch (v2.11) is available for Zebra TC57/TC77 scanners, addressing the intermittent Wi-Fi disconnection bug during roaming across multi-access-point zones.',
    date: '2026-07-24T08:30:00Z',
    category: 'Update',
    important: false,
  },
  {
    id: 'ann-3',
    title: 'Peak Season Preparedness Guidelines',
    content: 'To prevent inventory sync bottle-necks during the upcoming peak volume season, please ensure all cycle counts are completed by the end of this month.',
    date: '2026-07-20T14:00:00Z',
    category: 'System',
    important: false,
  }
];

export const INITIAL_KB_ARTICLES: KBArticle[] = [
  {
    id: 'kb-1',
    title: 'Resolving Zebra Scanner Roaming Disconnections',
    category: 'Hardware',
    summary: 'Step-by-step troubleshooting guide for RF scanners losing server connection when crossing wireless access points in large layouts.',
    content: `
# Resolving Zebra Scanner Roaming Disconnections

If warehouse operators report that Zebra RF scanners (TC52/TC57/MC3300) lose connection to the WMS web terminal while walking between aisles, follow these steps to optimize wireless roaming parameters:

## 1. Network Profile Adjustments
Ensure your WLAN controller is configured for fast roaming (802.11r) and that the following profiles are enabled:
* **802.11k (Neighbor Reports)**: Helps the scanner pre-identify adjacent access points.
* **802.11v (BSS Transition Management)**: Guides the scanner to roam before signal drops.

## 2. On-Device Scanner Configuration
Open the **WLAN Settings** on the Android Zebra device:
1. Navigate to *Settings > Network & Internet > Wi-Fi > Wi-Fi Preferences*.
2. Tap on *Advanced* and find **Roaming Threshold**.
3. Set the Roaming Threshold to **-70 dBm** (default is often -75 dBm, which makes devices hold onto weak APs too long).
4. Select **Aggressive** roaming behavior if available in your Android build.

## 3. Disabling Battery Optimization
Android battery-saving features can put the Wi-Fi chip to sleep if the screen is idle for over 60 seconds:
1. Go to *Settings > Apps & Notifications > Special App Access > Battery Optimization*.
2. Find the WMS Client Application and set it to **Don't Optimize**.

*Contact the Network Infrastructure team if signal coverage in Aisle 14-22 remains below -75 dBm.*
    `,
    views: 342,
    likes: 48,
    lastUpdated: '2026-07-15T09:00:00Z',
    tags: ['Zebra', 'RF Scanner', 'Wi-Fi', 'Roaming', 'Hardware']
  },
  {
    id: 'kb-2',
    title: 'Troubleshooting ERP Sync Failure (Error: SAP_LOCKED_PART)',
    category: 'Integration',
    summary: 'Explains how to resolve inventory lock errors preventing transfer order sync between WMS and SAP ERP.',
    content: `
# Troubleshooting ERP Sync Failure (Error: SAP_LOCKED_PART)

This error occurs when the SAP ERP system tries to update a material master record or document that is currently locked by a background process, or when an operator is editing the material in SAP transaction \`MM02\`.

## Standard Resolution Protocol

1. **Verify the Material Lock in SAP**:
   * Log into your SAP GUI and open transaction \`SM12\`.
   * Enter the username of the WMS interface user (typically \`WMS_INT_USER\`) or search for locks on the specific Material Number.
   * If an active lock exists and has been held for over 30 minutes, coordinate with the SAP basis team to release it.

2. **Republishing the IDoc**:
   * Once locks are cleared, locate the failed transfer message in the WMS Integration Monitor.
   * Check the transaction payload. If correct, click **Re-queue / Reprocess**.
   * The WMS will re-send the confirmation IDoc (\`WMTORD\`).

3. **Verify Inventory Alignments**:
   * Navigate to the WMS Inventory screen and verify that the quantity in bin matches the quantity reported in SAP transaction \`LX02\`.
   * If there is a discrepancy, perform an inventory alignment transaction (\`LI21\` equivalent in WMS).
    `,
    views: 215,
    likes: 31,
    lastUpdated: '2026-07-18T16:45:00Z',
    tags: ['SAP', 'ERP', 'Sync', 'IDoc', 'Locks']
  },
  {
    id: 'kb-3',
    title: 'Outbound Picking Bottlenecks: Dynamic Slotting Recommendations',
    category: 'Outbound',
    summary: 'A strategic guide to re-slotting fast-moving stock to optimize pick paths and minimize worker travel times.',
    content: `
# Outbound Picking Bottlenecks: Dynamic Slotting Recommendations

When pick velocity drops during high-volume periods, it is often due to poor slotting layout where high-velocity items are located in high-reach zones or far-off aisles.

## Slotting Velocity Category Setup (ABC Analysis)
* **A-Items (Fast Movers)**: Top 10% of items representing 70-80% of pick volume. Slot these in the "Golden Zone" (chest height, aisle fronts close to shipping docks).
* **B-Items (Medium Movers)**: Next 20% of items. Slot on middle shelves and mid-aisle locations.
* **C-Items (Slow Movers)**: Remaining 70% of items. Slot on top levels, back corners, or narrow-aisle zones.

## Implementing Dynamic Re-Slotting
1. Go to *WMS Admin > Warehouse Optimization > Slotting Recommender*.
2. Generate the **Aisle Workload Balance report** to check for congestion (multiple pickers assigned to the same aisle simultaneously).
3. Schedule a slotting replenishment order during the third shift to move high-priority items to lower-tier bins.
    `,
    views: 189,
    likes: 24,
    lastUpdated: '2026-07-22T11:20:00Z',
    tags: ['Outbound', 'Picking', 'Slotting', 'Optimization', 'ABC Analysis']
  },
  {
    id: 'kb-4',
    title: 'Managing Location Capacity and Putaway Blockages',
    category: 'Inventory',
    summary: 'How to release bin locks and adjust volumetric tolerances when receiving items exceed standard bin dimensions.',
    content: `
# Managing Location Capacity and Putaway Blockages

When the WMS reports "No suitable storage bin found" during receiving, but operators see physical space in the warehouse, the system capacity rules are blocking the allocation.

## Troubleshooting Steps
1. **Volumetric Verification**:
   * Check the material master record dimensions (Length, Width, Height, Weight). An incorrect decimal place (e.g. 10m instead of 10cm) will block putaway.
   * Verify bin capacity settings under *WMS Config > Master Data > Storage Bins*.
2. **Override Allocation**:
   * If the physical bin can accommodate the load, supervisors can perform a **Manual Bin Allocation Override** in the receiving screen.
   * Check if the destination bin is marked as *Blocked for Inbound* (maintenance or clean-up flags).
    `,
    views: 145,
    likes: 19,
    lastUpdated: '2026-06-30T10:00:00Z',
    tags: ['Putaway', 'Capacity', 'Bin Setup', 'Inbound']
  },
  {
    id: 'kb-5',
    title: 'Setting Up Custom Shipping Carrier Labels',
    category: 'Shipping',
    summary: 'How to configure label printers, adjust DPI settings, and map shipping templates for UPS, FedEx, and DHL APIs.',
    content: `
# Setting Up Custom Shipping Carrier Labels

This guide outlines configuring WMS printing nodes to interface with Zebra thermal printers for carrier labels (4x6 inches).

## Step-by-step Printer Mapping
1. Navigate to *Settings > Carrier Integration > Shipping Profiles*.
2. Select your printer model and ensure the **DPI matches exactly** (203 DPI vs 300 DPI profiles).
3. If labels print offset or truncated, adjust the horizontal/vertical printer calibrations inside the WMS Local Print Queue Utility (WMSPrint).
4. Run a test print directly from the carrier configuration screen.
    `,
    views: 110,
    likes: 12,
    lastUpdated: '2026-07-02T15:30:00Z',
    tags: ['Shipping', 'Labels', 'Printers', 'Zebra', 'UPS']
  },
  {
    id: 'kb-6',
    title: 'Database Re-indexing & System Performance Tuning',
    category: 'System',
    summary: 'Instructions for administering off-peak database index rebuilds to resolve slow search speeds in transaction history query screens.',
    content: `
# Database Re-indexing & System Performance Tuning

Slow response times on the WMS inventory search screen (>5 seconds) are often due to fragmented indexes in the \`INVENTORY_TX\` tables.

## Maintenance Checklist
1. Re-indexing tasks are scheduled automatically every Sunday at 01:00 UTC.
2. In emergency cases where transactions are severely delayed, WMS Administrators can trigger a manual index rebuild for specific tables during shift changes.
3. Ensure no concurrent bulk loads (such as ERP stock synchronization) are active during indexing, as this will trigger severe table locks.
    `,
    views: 98,
    likes: 15,
    lastUpdated: '2026-07-10T14:15:00Z',
    tags: ['System', 'Database', 'Performance', 'Admin']
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'WMS-1042',
    subject: 'Outbound picking stuck in PENDING status in Aisle 8',
    description: 'We have 4 urgent customer orders that need to ship by 16:00. However, the picking tickets are stuck in "PENDING" status and cannot be released to operators. The location looks free and stock is present in WH-East-1. Please assist.',
    customerName: 'Marcus Aurelius',
    company: 'Apex Logistics LLC',
    email: 'm.aurelius@apexlogistics.com',
    plant: 'Plant A (Chicago)',
    warehouse: 'WH-East-1',
    module: 'Picking',
    priority: 'Critical',
    category: 'Outbound',
    status: 'In Progress',
    assignedEngineer: 'Sarah Jenkins (Senior Support)',
    createdDate: '2026-07-26T08:15:00Z',
    updatedDate: '2026-07-26T11:45:00Z',
    slaDeadline: '2026-07-26T12:15:00Z', // 4hr SLA for Critical
    attachments: [
      { name: 'screen_stuck_orders.png', size: '1.2 MB', url: '#' },
      { name: 'bin_aisle_8_report.pdf', size: '420 KB', url: '#' }
    ],
    messages: [
      {
        id: 'msg-1-1',
        author: 'Marcus Aurelius',
        avatar: '',
        role: 'customer',
        content: `Hi Support, we have 4 critical orders that need to ship today. They are stuck in 'Pending' pick allocation. Standard pick lists cannot be generated. 
I have attached the screenshot of the orders showing the lock symbols and our aisle inventory report confirming stock is physically located in bin A-08-12.`,
        timestamp: '2026-07-26T08:15:00Z',
        attachments: [
          { name: 'screen_stuck_orders.png', size: '1.2 MB', url: '#' },
          { name: 'bin_aisle_8_report.pdf', size: '420 KB', url: '#' }
        ]
      },
      {
        id: 'msg-1-2',
        author: 'Sarah Jenkins (Senior Support)',
        avatar: '',
        role: 'engineer',
        content: 'Investigated the order locks. It seems the ERP system locked the inventory during a cycle count synchronization block. Working to clear the SAP interface flag.',
        timestamp: '2026-07-26T09:30:00Z'
      },
      {
        id: 'msg-1-3',
        author: 'Sarah Jenkins (Senior Support)',
        avatar: '',
        role: 'engineer',
        content: 'SYSTEM LOCK DETAIL: Table `INV_LOCKS` has a stale record for SKU-99321. I am going to run the release script to free up these allocated bins.',
        timestamp: '2026-07-26T09:32:00Z',
        isInternal: true
      },
      {
        id: 'msg-1-4',
        author: 'Sarah Jenkins (Senior Support)',
        avatar: '',
        role: 'engineer',
        content: 'Hi Marcus, I have released the ERP-WMS inventory lock on SKU-99321. Could you please check the Picking Monitor in the next 5 minutes and see if you can manually release the orders now?',
        timestamp: '2026-07-26T10:45:00Z'
      },
      {
        id: 'msg-1-5',
        author: 'Marcus Aurelius',
        avatar: '',
        role: 'customer',
        content: 'Thanks Sarah, 2 of the orders have released successfully! However, orders #48821 and #48825 are still showing as pending allocation. It looks like they might be waiting for stock allocation in another aisle.',
        timestamp: '2026-07-26T11:45:00Z'
      }
    ],
    activities: [
      { id: 'act-1-1', actor: 'Marcus Aurelius', action: 'Created ticket', timestamp: '2026-07-26T08:15:00Z' },
      { id: 'act-1-2', actor: 'System Routing', action: 'Assigned to Sarah Jenkins', timestamp: '2026-07-26T08:17:00Z' },
      { id: 'act-1-3', actor: 'Sarah Jenkins', action: 'Changed status to In Progress', timestamp: '2026-07-26T09:30:00Z' }
    ]
  },
  {
    id: 'WMS-1043',
    subject: 'RF Scanner MC9300 cannot read Location barcode labels in Plant B',
    description: 'We recently installed new high-density storage racks in Plant B (Rotterdam) and put up custom barcode location tags. Our Zebra MC9300 scanners fail to read the barcodes, returning a decoding error on the terminal screen.',
    customerName: 'Jan de Vries',
    company: 'EuroCargo NV',
    email: 'j.devries@eurocargo.nl',
    plant: 'Plant B (Rotterdam)',
    warehouse: 'WH-West-2',
    module: 'RF Scanning',
    priority: 'High',
    category: 'Hardware',
    status: 'Waiting for Customer',
    assignedEngineer: 'Carlos Martinez (Hardware Specialist)',
    createdDate: '2026-07-25T11:00:00Z',
    updatedDate: '2026-07-26T14:30:00Z',
    slaDeadline: '2026-07-26T23:00:00Z',
    messages: [
      {
        id: 'msg-2-1',
        author: 'Jan de Vries',
        avatar: '',
        role: 'customer',
        content: 'Hi, we cannot read the new rack labels with our MC9300 devices. The green laser flashes but nothing registers, or it flashes a red decode failure.',
        timestamp: '2026-07-25T11:00:00Z'
      },
      {
        id: 'msg-2-2',
        author: 'Carlos Martinez (Hardware Specialist)',
        avatar: '',
        role: 'engineer',
        content: 'What is the barcode symbology? Are they Code 128, Datamatrix, or PDF417? Sometimes the scanner profiles inside Zebra DataWedge have specific symbologies disabled to speed up scans.',
        timestamp: '2026-07-25T15:20:00Z'
      },
      {
        id: 'msg-2-3',
        author: 'Carlos Martinez (Hardware Specialist)',
        avatar: '',
        role: 'engineer',
        content: 'NOTE: Checking if their label sheets are printed at 203 DPI. Lower DPI thermal prints sometimes cause alignment errors on long barcode profiles.',
        timestamp: '2026-07-25T15:22:00Z',
        isInternal: true
      },
      {
        id: 'msg-2-4',
        author: 'Jan de Vries',
        avatar: '',
        role: 'customer',
        content: 'We checked and the labels are 2D QR codes with embedded Location IDs (e.g. WH-W2-A05-L02-S12). They are printed at 300 DPI.',
        timestamp: '2026-07-26T09:15:00Z'
      },
      {
        id: 'msg-2-5',
        author: 'Carlos Martinez (Hardware Specialist)',
        avatar: '',
        role: 'engineer',
        content: `Ah, that explains it. In the Zebra MC9300 default WMS profile, 2D QR scanning is disabled by default to prevent pickers from scanning surrounding QR placards.
Please refer to our Knowledge Base article [Resolving Zebra Scanner Roaming Disconnections](file:///kb) or check our WMS-DataWedge-QR setup guidelines. I have attached the configuration profile. You can load this directly into your DataWedge app.`,
        timestamp: '2026-07-26T14:30:00Z',
        attachments: [
          { name: 'dw_profile_wms_qr.db', size: '24 KB', url: '#' }
        ]
      }
    ],
    activities: [
      { id: 'act-2-1', actor: 'Jan de Vries', action: 'Created ticket', timestamp: '2026-07-25T11:00:00Z' },
      { id: 'act-2-2', actor: 'System Routing', action: 'Assigned to Carlos Martinez', timestamp: '2026-07-25T11:05:00Z' },
      { id: 'act-2-3', actor: 'Carlos Martinez', action: 'Changed status to In Progress', timestamp: '2026-07-25T15:20:00Z' },
      { id: 'act-2-4', actor: 'Carlos Martinez', action: 'Changed status to Waiting for Customer', timestamp: '2026-07-26T14:30:00Z' }
    ]
  },
  {
    id: 'WMS-1044',
    subject: 'SAP Integration failing: IDoc BAPI_GOODSMVT_CREATE rejected',
    description: 'We are receiving goods at Plant C (Singapore) outbound receiving, but the stock receipt confirmations are failing to sync back to our central SAP ERP system. SAP is rejecting the IDoc with message "Plant C storage location not found in material master".',
    customerName: 'Lee Wei',
    company: 'Global Chip logistics Ltd',
    email: 'wei.lee@globalchiplog.sg',
    plant: 'Plant C (Singapore)',
    warehouse: 'WH-Singapore-3',
    module: 'ERP Interface',
    priority: 'Critical',
    category: 'Integration',
    status: 'New',
    createdDate: '2026-07-26T10:45:00Z',
    updatedDate: '2026-07-26T10:45:00Z',
    slaDeadline: '2026-07-26T14:45:00Z',
    messages: [
      {
        id: 'msg-3-1',
        author: 'Lee Wei',
        avatar: '',
        role: 'customer',
        content: `We received 10,000 units of SKU-CHIP-452. Physically the inventory is in the warehouse. However, SAP is showing 0 stock. 
Our WMS outbound monitor reports a failed sync with the following log:
IDoc: WMTORD_023910
Error: SAP_RCV_FAIL - BAPI_GOODSMVT_CREATE: Storage location 1001 not defined in SAP Material Master for SKU-CHIP-452.
Please assist urgently as production is waiting.`,
        timestamp: '2026-07-26T10:45:00Z'
      }
    ],
    activities: [
      { id: 'act-3-1', actor: 'Lee Wei', action: 'Created ticket', timestamp: '2026-07-26T10:45:00Z' }
    ]
  },
  {
    id: 'WMS-1045',
    subject: 'Conveyor sorter routing conveyor jams at diverting lane 3',
    description: 'In Plant D (Houston), the sortation lane 3 is jamming because the WMS conveyor interface (MHA PLC controller) is routing outbound boxes to lane 3 even though lane 3 is at maximum capacity. Sensor telemetry shows lane full, but WMS continues PLC releases.',
    customerName: 'Sarah Connor',
    company: 'Titan Manufacturing Corp',
    email: 's.connor@titanmfg.com',
    plant: 'Plant D (Houston)',
    warehouse: 'WH-South-4',
    module: 'Conveyor Routing',
    priority: 'High',
    category: 'Hardware',
    status: 'In Progress',
    assignedEngineer: 'David Kim (Integration Expert)',
    createdDate: '2026-07-26T06:00:00Z',
    updatedDate: '2026-07-26T09:00:00Z',
    slaDeadline: '2026-07-26T18:00:00Z',
    messages: [
      {
        id: 'msg-4-1',
        author: 'Sarah Connor',
        avatar: '',
        role: 'customer',
        content: `Hi, the sortation loop is backing up. The PLC is flashing 'Diverting Lane 3 Full', but the WMS supervisor system keeps releasing boxes from the packing line. 
This is creating physical box blockages. We had to shut down the conveyor system temporarily.`,
        timestamp: '2026-07-26T06:00:00Z'
      },
      {
        id: 'msg-4-2',
        author: 'David Kim (Integration Expert)',
        avatar: '',
        role: 'engineer',
        content: 'Hi Sarah, checking the PLC log. It seems that the WMS PLC polling cycle is set to 2000ms instead of 200ms. So WMS receives the "Lane Full" signal with a 2-second delay, which is too slow to stop releases. I am checking the config file on the server.',
        timestamp: '2026-07-26T09:00:00Z'
      },
      {
        id: 'msg-4-3',
        author: 'David Kim (Integration Expert)',
        avatar: '',
        role: 'engineer',
        content: 'INTERNAL CONFIG REVIEW: Re-polling frequency for Allen Bradley PLCs is defined in `/etc/wms/mha-ab.conf`. Modifying it requires restarting the WMS-MHA-Service wrapper. Will do this during break.',
        timestamp: '2026-07-26T09:02:00Z',
        isInternal: true
      }
    ],
    activities: [
      { id: 'act-4-1', actor: 'Sarah Connor', action: 'Created ticket', timestamp: '2026-07-26T06:00:00Z' },
      { id: 'act-4-2', actor: 'System Routing', action: 'Assigned to David Kim', timestamp: '2026-07-26T06:05:00Z' },
      { id: 'act-4-3', actor: 'David Kim', action: 'Changed status to In Progress', timestamp: '2026-07-26T09:00:00Z' }
    ]
  },
  {
    id: 'WMS-1046',
    subject: 'Cycle count batch creation errors in main inventory screen',
    description: 'When trying to create a cyclic counting sheet for WH-East-1 Zone B, the WMS returns a generic database error "ORA-00001: unique constraint violated". No sheet is generated.',
    customerName: 'Robert Vance',
    company: 'Vance Refrigeration Inc',
    email: 'r.vance@vancerefrig.com',
    plant: 'Plant A (Chicago)',
    warehouse: 'WH-East-1',
    module: 'Receiving',
    priority: 'Medium',
    category: 'Inventory',
    status: 'Testing',
    assignedEngineer: 'Sarah Jenkins (Senior Support)',
    createdDate: '2026-07-25T08:00:00Z',
    updatedDate: '2026-07-26T16:00:00Z',
    slaDeadline: '2026-07-28T08:00:00Z',
    messages: [
      {
        id: 'msg-5-1',
        author: 'Robert Vance',
        avatar: '',
        role: 'customer',
        content: 'Hi, we cannot start our weekly cycle count. The counting sheets crash with a database unique key error.',
        timestamp: '2026-07-25T08:00:00Z'
      },
      {
        id: 'msg-5-2',
        author: 'Sarah Jenkins (Senior Support)',
        avatar: '',
        role: 'engineer',
        content: 'Hi Robert, this error is caused because the cycle count sequence generator has lagged behind the actual rows. I have updated the sequence counter in the database. Could you test now?',
        timestamp: '2026-07-26T15:30:00Z'
      },
      {
        id: 'msg-5-3',
        author: 'Robert Vance',
        avatar: '',
        role: 'customer',
        content: 'We just generated a test count sheet (#CC-2026-90412) and it succeeded! The operators are currently scanning bin rows. If this finishes without error, we can close the ticket.',
        timestamp: '2026-07-26T16:00:00Z'
      }
    ],
    activities: [
      { id: 'act-5-1', actor: 'Robert Vance', action: 'Created ticket', timestamp: '2026-07-25T08:00:00Z' },
      { id: 'act-5-2', actor: 'System Routing', action: 'Assigned to Sarah Jenkins', timestamp: '2026-07-25T08:05:00Z' },
      { id: 'act-5-3', actor: 'Sarah Jenkins', action: 'Changed status to Testing', timestamp: '2026-07-26T15:30:00Z' }
    ]
  },
  {
    id: 'WMS-1047',
    subject: 'FedEx Shipping Labels printing with blurry barcodes',
    description: 'All FedEx labels printed from our pack stations in Rotterdam are coming out blurry. The barcode scanners at the sorting center are rejecting them, requiring manual key-in.',
    customerName: 'Jan de Vries',
    company: 'EuroCargo NV',
    email: 'j.devries@eurocargo.nl',
    plant: 'Plant B (Rotterdam)',
    warehouse: 'WH-West-2',
    module: 'ERP Interface',
    priority: 'Medium',
    category: 'Shipping',
    status: 'Resolved',
    assignedEngineer: 'Carlos Martinez (Hardware Specialist)',
    createdDate: '2026-07-24T10:00:00Z',
    updatedDate: '2026-07-25T14:00:00Z',
    slaDeadline: '2026-07-27T10:00:00Z',
    messages: [
      {
        id: 'msg-6-1',
        author: 'Jan de Vries',
        avatar: '',
        role: 'customer',
        content: 'FedEx labels look extremely blurry. It seems the scale of the image is stretched. Zebra GK420d printers.',
        timestamp: '2026-07-24T10:00:00Z'
      },
      {
        id: 'msg-6-2',
        author: 'Carlos Martinez (Hardware Specialist)',
        avatar: '',
        role: 'engineer',
        content: 'Hi Jan, I adjusted the shipping configuration for Plant B. The label output was set to 150 DPI while your thermal printers are 203 DPI. I have updated the printer server configuration to output raw ZPL code instead of rendering a PNG image. Please reprint a label to test.',
        timestamp: '2026-07-25T11:00:00Z'
      },
      {
        id: 'msg-6-3',
        author: 'Jan de Vries',
        avatar: '',
        role: 'customer',
        content: 'The new test print is crisp! No more blurring, the barcodes are sharp. We can resolve this ticket. Thank you!',
        timestamp: '2026-07-25T13:45:00Z'
      },
      {
        id: 'msg-6-4',
        author: 'Carlos Martinez (Hardware Specialist)',
        avatar: '',
        role: 'engineer',
        content: 'Glad to hear. Marking this ticket as resolved. Have a great day!',
        timestamp: '2026-07-25T14:00:00Z'
      }
    ],
    activities: [
      { id: 'act-6-1', actor: 'Jan de Vries', action: 'Created ticket', timestamp: '2026-07-24T10:00:00Z' },
      { id: 'act-6-2', actor: 'Carlos Martinez', action: 'Assigned and started work', timestamp: '2026-07-24T10:30:00Z' },
      { id: 'act-6-3', actor: 'Carlos Martinez', action: 'Changed status to Resolved', timestamp: '2026-07-25T14:00:00Z' }
    ]
  },
  {
    id: 'WMS-1048',
    subject: 'Incorrect batch details on packing list reports',
    description: 'For Outbound orders, the packing lists display batch number as "DEFAULT_BATCH" instead of the physical batch allocated during picking. This is causing compliance issues with food items.',
    customerName: 'Marcus Aurelius',
    company: 'Apex Logistics LLC',
    email: 'm.aurelius@apexlogistics.com',
    plant: 'Plant A (Chicago)',
    warehouse: 'WH-East-1',
    module: 'Picking',
    priority: 'High',
    category: 'Outbound',
    status: 'Escalated',
    assignedEngineer: 'Aisha Rahman (WMS Lead)',
    createdDate: '2026-07-24T09:00:00Z',
    updatedDate: '2026-07-26T15:00:00Z',
    slaDeadline: '2026-07-25T09:00:00Z',
    messages: [
      {
        id: 'msg-7-1',
        author: 'Marcus Aurelius',
        avatar: '',
        role: 'customer',
        content: 'Hi, the printed packing list slips are showing batch numbers as DEFAULT_BATCH instead of the allocated lot. We cannot ship edible inventory under this condition.',
        timestamp: '2026-07-24T09:00:00Z'
      },
      {
        id: 'msg-7-2',
        author: 'Aisha Rahman (WMS Lead)',
        avatar: '',
        role: 'engineer',
        content: 'Escalating this ticket to tier-3 product dev. The picking allocation logic holds the batch properly in the SQL table, but the report layout template triggers a fallback to default string if batch expiration date is null. This needs a minor code patch.',
        timestamp: '2026-07-25T10:00:00Z'
      },
      {
        id: 'msg-7-3',
        author: 'Aisha Rahman (WMS Lead)',
        avatar: '',
        role: 'engineer',
        content: 'DEVELOPMENT REPORT: Applied hotfix for report layout `PACK_SLIP_v4.rpt` to bind inventory batch reference explicitly.',
        timestamp: '2026-07-26T15:00:00Z',
        isInternal: true
      }
    ],
    activities: [
      { id: 'act-7-1', actor: 'Marcus Aurelius', action: 'Created ticket', timestamp: '2026-07-24T09:00:00Z' },
      { id: 'act-7-2', actor: 'Sarah Jenkins', action: 'Assigned and escalated', timestamp: '2026-07-24T14:00:00Z' },
      { id: 'act-7-3', actor: 'Aisha Rahman', action: 'Assigned to Aisha Rahman', timestamp: '2026-07-25T10:00:00Z' },
      { id: 'act-7-4', actor: 'Aisha Rahman', action: 'Marked as Escalated', timestamp: '2026-07-25T10:05:00Z' }
    ]
  },
  {
    id: 'WMS-1049',
    subject: 'Cannot login to RF scanner web terminal - LDAP connection error',
    description: 'None of our floor operators in Houston can log in to their RF scanner devices today. The screen displays "LDAP Connection Refused". Active Directory seems online for corporate email.',
    customerName: 'Sarah Connor',
    company: 'Titan Manufacturing Corp',
    email: 's.connor@titanmfg.com',
    plant: 'Plant D (Houston)',
    warehouse: 'WH-South-4',
    module: 'RF Scanning',
    priority: 'Critical',
    category: 'System',
    status: 'Closed',
    assignedEngineer: 'David Kim (Integration Expert)',
    createdDate: '2026-07-23T07:00:00Z',
    updatedDate: '2026-07-23T11:00:00Z',
    slaDeadline: '2026-07-23T11:00:00Z',
    messages: [
      {
        id: 'msg-8-1',
        author: 'Sarah Connor',
        avatar: '',
        role: 'customer',
        content: 'Urgent. No picker can login. Production line is halted. "LDAP Connection Refused".',
        timestamp: '2026-07-23T07:00:00Z'
      },
      {
        id: 'msg-8-2',
        author: 'David Kim (Integration Expert)',
        avatar: '',
        role: 'engineer',
        content: 'Investigation shows that the primary AD domain controller was updated last night, disabling unencrypted LDAP (port 389) in favor of LDAPS (port 636). I will update the WMS configuration utility to use SSL for LDAP bindings.',
        timestamp: '2026-07-23T08:15:00Z'
      },
      {
        id: 'msg-8-3',
        author: 'David Kim (Integration Expert)',
        avatar: '',
        role: 'engineer',
        content: 'WMS config updated on primary and secondary nodes. Tested credentials against LDAPS and connection succeeds.',
        timestamp: '2026-07-23T09:45:00Z',
        isInternal: true
      },
      {
        id: 'msg-8-4',
        author: 'David Kim (Integration Expert)',
        avatar: '',
        role: 'engineer',
        content: 'Hi Sarah, LDAP bindings have been updated to LDAPS. Floor operators should now be able to log in. Please confirm.',
        timestamp: '2026-07-23T10:00:00Z'
      },
      {
        id: 'msg-8-5',
        author: 'Sarah Connor',
        avatar: '',
        role: 'customer',
        content: 'Yes! Floor is running again, picking has resumed. Thanks for the quick turn-around. Please close this ticket.',
        timestamp: '2026-07-23T10:45:00Z'
      },
      {
        id: 'msg-8-6',
        author: 'David Kim (Integration Expert)',
        avatar: '',
        role: 'engineer',
        content: 'Closing ticket. Glad it was resolved quickly.',
        timestamp: '2026-07-23T11:00:00Z'
      }
    ],
    activities: [
      { id: 'act-8-1', actor: 'Sarah Connor', action: 'Created ticket', timestamp: '2026-07-23T07:00:00Z' },
      { id: 'act-8-2', actor: 'David Kim', action: 'Assigned and in progress', timestamp: '2026-07-23T07:15:00Z' },
      { id: 'act-8-3', actor: 'David Kim', action: 'Changed status to Resolved', timestamp: '2026-07-23T10:00:00Z' },
      { id: 'act-8-4', actor: 'System', action: 'Changed status to Closed', timestamp: '2026-07-23T11:00:00Z' }
    ]
  },
  {
    id: 'WMS-1050',
    subject: 'Inventory discrepancy during inbound receipt',
    description: 'We received shipment ID #SH-9021 in Chicago containing 500 cases of material SKU-90123. The WMS outbound sync processed only 450 cases. The physical count is indeed 500 cases.',
    customerName: 'Marcus Aurelius',
    company: 'Apex Logistics LLC',
    email: 'm.aurelius@apexlogistics.com',
    plant: 'Plant A (Chicago)',
    warehouse: 'WH-East-1',
    module: 'Receiving',
    priority: 'Medium',
    category: 'Inventory',
    status: 'Assigned',
    assignedEngineer: 'Sarah Jenkins (Senior Support)',
    createdDate: '2026-07-26T02:00:00Z',
    updatedDate: '2026-07-26T04:00:00Z',
    slaDeadline: '2026-07-28T02:00:00Z',
    messages: [
      {
        id: 'msg-9-1',
        author: 'Marcus Aurelius',
        avatar: '',
        role: 'customer',
        content: 'Hi, we have 50 missing cases on the WMS system record for SH-9021. The supervisor counts match 500 cases on physical tally.',
        timestamp: '2026-07-26T02:00:00Z'
      },
      {
        id: 'msg-9-2',
        author: 'Sarah Jenkins (Senior Support)',
        avatar: '',
        role: 'engineer',
        content: 'Checking the transaction journal. I see that operator WH_USER_09 received 450 cases initially and then created a supplemental receipt transaction of 50 cases 10 minutes later. The second transaction is stuck in the ERP outbound queue. I will review.',
        timestamp: '2026-07-26T04:00:00Z'
      }
    ],
    activities: [
      { id: 'act-9-1', actor: 'Marcus Aurelius', action: 'Created ticket', timestamp: '2026-07-26T02:00:00Z' },
      { id: 'act-9-2', actor: 'System Routing', action: 'Assigned to Sarah Jenkins', timestamp: '2026-07-26T02:05:00Z' }
    ]
  },
  {
    id: 'WMS-1051',
    subject: 'Conveyor sorter divert fails to report weight tolerances',
    description: 'Conveyor scale fails to send weight records back to WMS for validation, causing outbound labels to hold without scale confirmation. This delays conveyor routing in Chicago.',
    customerName: 'Marcus Aurelius',
    company: 'Apex Logistics LLC',
    email: 'm.aurelius@apexlogistics.com',
    plant: 'Plant A (Chicago)',
    warehouse: 'WH-East-1',
    module: 'Conveyor Routing',
    priority: 'Low',
    category: 'Hardware',
    status: 'New',
    createdDate: '2026-07-26T11:00:00Z',
    updatedDate: '2026-07-26T11:00:00Z',
    slaDeadline: '2026-07-29T11:00:00Z',
    messages: [
      {
        id: 'msg-10-1',
        author: 'Marcus Aurelius',
        avatar: '',
        role: 'customer',
        content: 'Hi, scale #4 at Pack Station 2 is not updating weights in the WMS UI. We have to bypass manually. Please investigate serial connection driver.',
        timestamp: '2026-07-26T11:00:00Z'
      }
    ],
    activities: [
      { id: 'act-10-1', actor: 'Marcus Aurelius', action: 'Created ticket', timestamp: '2026-07-26T11:00:00Z' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'New Support Ticket Created',
    message: 'Ticket WMS-1044 (SAP Integration failing) has been raised by Lee Wei for Plant C.',
    timestamp: '2026-07-26T10:45:00Z',
    read: false,
    ticketId: 'WMS-1044',
    type: 'danger'
  },
  {
    id: 'notif-2',
    title: 'Customer Replied to WMS-1042',
    message: 'Marcus Aurelius replied: "Thanks Sarah, 2 of the orders have released..."',
    timestamp: '2026-07-26T11:45:00Z',
    read: false,
    ticketId: 'WMS-1042',
    type: 'info'
  },
  {
    id: 'notif-3',
    title: 'Ticket WMS-1048 Escalated',
    message: 'Ticket WMS-1048 has been escalated to Tier-3 Support (WMS Lead).',
    timestamp: '2026-07-25T10:05:00Z',
    read: true,
    ticketId: 'WMS-1048',
    type: 'warning'
  },
  {
    id: 'notif-4',
    title: 'Zebra MC9300 Scanners Configuration uploaded',
    message: 'Carlos Martinez attached a configuration database profile in WMS-1043.',
    timestamp: '2026-07-26T14:30:00Z',
    read: false,
    ticketId: 'WMS-1043',
    type: 'success'
  },
  {
    id: 'notif-5',
    title: 'System Maintenance Scheduled',
    message: 'Core Upgrade v12.4.0 is scheduled for this coming Saturday.',
    timestamp: '2026-07-26T10:00:00Z',
    read: false,
    type: 'warning'
  }
];

export const SUPPORT_CONTACTS = [
  { name: 'US WMS Hotline', phone: '+1 (800) 555-0199', hours: '24/7 (Critical Only)' },
  { name: 'Europe Support Desk', phone: '+31 (20) 555-4022', hours: '08:00 - 18:00 CET' },
  { name: 'APAC Support Desk', phone: '+65 6555-1100', hours: '08:00 - 18:00 SGT' },
  { name: 'Global Email Support', phone: 'wms.support@enterprise-logistics.com', hours: 'Response within 4 hours' }
];
