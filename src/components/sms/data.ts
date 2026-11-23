export type Provider = "CBE" | "Telebirr" | "Ethio Telecom";
export type TxType = "Received" | "Sent" | "Debit" | "Payment" | "Refund";

export interface Tx {
  id: string;
  type: TxType;
  counterparty: string;
  phone?: string;
  amount: number;
  fee?: number;
  vat?: number;
  balance?: number;
  provider: Provider;
  date: string;
  ref: string;
  status: "Parsed" | "Partial";
  sms: string;
}

export const transactions: Tx[] = [
  { id: "t1", type: "Received", counterparty: "Abebe Kebede", phone: "2519****4521", amount: 4500, balance: 18230.5, provider: "Telebirr", date: "Today, 09:42", ref: "CKN7H2LQ9P", status: "Parsed",
    sms: "Dear Customer, You have received ETB 4,500.00 from Abebe Kebede(2519****4521) on 23/11/2026 09:42:11. Your transaction number is CKN7H2LQ9P. Your current E-Money Account balance is ETB 18,230.50. Thank you for using telebirr Ethio telecom" },
  { id: "t2", type: "Sent", counterparty: "Selam Tesfaye", phone: "2519****7788", amount: 1200, fee: 5, vat: 0.75, balance: 13730.5, provider: "Telebirr", date: "Today, 08:15", ref: "CKN6Y1PL3A", status: "Parsed",
    sms: "Dear Customer, You have transferred ETB 1,200.00 to Selam Tesfaye (2519****7788) on 23/11/2026 08:15:02. Your transaction number is CKN6Y1PL3A. The service fee is ETB 5.00 and 15% VAT on the service fee is ETB 0.75. Your current E-Money Account balance is ETB 13,730.50." },
  { id: "t3", type: "Debit", counterparty: "Unknown counterparty", amount: 2350, fee: 2, vat: 0.3, balance: 42110.2, provider: "CBE", date: "Yesterday, 18:03", ref: "FT26327XK91B", status: "Partial",
    sms: "Dear Customer your Account 1****6789 has been debited with ETB 2,350.00. Service charge of ETB 2.00 and VAT(15%) of ETB 0.30. Your Current Balance is ETB 42,110.20. Thank you for Banking with CBE!" },
  { id: "t4", type: "Payment", counterparty: "Shoa Supermarket", amount: 865.4, balance: 44462.5, provider: "CBE", date: "Yesterday, 13:20", ref: "FT26327P0QZ4", status: "Parsed",
    sms: "Dear Customer, you have paid ETB 865.40 to Shoa Supermarket on 22/11/2026 13:20. Ref FT26327P0QZ4. Your Current Balance is ETB 44,462.50. Thank you for Banking with CBE!" },
  { id: "t5", type: "Received", counterparty: "Hanna Girma", amount: 12000, balance: 45327.9, provider: "CBE", date: "21 Nov, 10:05", ref: "FT26325MM2R7", status: "Parsed",
    sms: "Dear Customer your Account 1****6789 has been Credited with ETB 12,000.00 from Hanna Girma on 21/11/2026 10:05. Your Current Balance is ETB 45,327.90. Thank you for Banking with CBE!" },
  { id: "t6", type: "Refund", counterparty: "Ethio Telecom", amount: 50, provider: "Telebirr", date: "20 Nov, 16:44", ref: "CKJ2W8TT0E", status: "Parsed",
    sms: "Dear Customer, ETB 50.00 has been refunded to your telebirr account. Transaction number CKJ2W8TT0E." },
];

export type ResourceKind = "Internet" | "Voice" | "SMS" | "Night data";
export interface Resource {
  id: string;
  kind: ResourceKind;
  name: string;
  remaining: number;
  total: number;
  unit: string;
  expiry: string;
  expiresInDays: number;
  observed: string;
}

export const resources: Resource[] = [
  { id: "r1", kind: "Internet", name: "Monthly Internet 12GB", remaining: 3.4, total: 12, unit: "GB", expiry: "26 Nov 2026, 23:59", expiresInDays: 3, observed: "Today, 07:30" },
  { id: "r2", kind: "Voice", name: "Weekly Voice 150 min", remaining: 87, total: 150, unit: "min", expiry: "28 Nov 2026, 23:59", expiresInDays: 5, observed: "Today, 07:30" },
  { id: "r3", kind: "SMS", name: "SMS Bundle 200", remaining: 164, total: 200, unit: "SMS", expiry: "15 Dec 2026, 23:59", expiresInDays: 22, observed: "Yesterday, 21:10" },
  { id: "r4", kind: "Night data", name: "Night Bundle 2GB", remaining: 0.6, total: 2, unit: "GB", expiry: "24 Nov 2026, 06:00", expiresInDays: 1, observed: "Today, 05:58" },
];

export type Severity = "critical" | "warning" | "info";
export interface Alert {
  id: string;
  title: string;
  body: string;
  severity: Severity;
  time: string;
  read: boolean;
}

export const alerts: Alert[] = [
  { id: "a1", title: "Night bundle expires soon", body: "0.6 GB left · expires tomorrow 06:00", severity: "warning", time: "05:58", read: false },
  { id: "a2", title: "Security alert from CBE", body: "New device login detected on your account", severity: "critical", time: "Yesterday", read: false },
  { id: "a3", title: "Received ETB 4,500.00", body: "From Abebe Kebede via Telebirr", severity: "info", time: "09:42", read: true },
  { id: "a4", title: "Internet running low", body: "3.4 GB of 12 GB left · expires in 3 days", severity: "warning", time: "07:30", read: true },
];

export const messages = [
  { id: "m1", sender: "127", provider: "Telebirr", status: "Parsed", category: "Transaction", time: "09:42", preview: "Dear Customer, You have received ETB 4,500.00 from Abebe…" },
  { id: "m2", sender: "CBE", provider: "CBE", status: "Partial", category: "Transaction", time: "Yesterday", preview: "Dear Customer your Account 1****6789 has been debited…" },
  { id: "m3", sender: "251994", provider: "Ethio Telecom", status: "Parsed", category: "Package", time: "07:30", preview: "Your remaining balance: Internet 3.4GB expires 26/11…" },
  { id: "m4", sender: "8994", provider: "Unknown", status: "Unrecognized", category: "Other", time: "20 Nov", preview: "Win big with the lucky draw! Dial *8994# to join…" },
];

export const etb = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
