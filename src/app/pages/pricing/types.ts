export interface Pricing {
  id?: number;
  deviceType: string;
  brand: string;
  model: string;
  issue: string;
  price: number;
  originalPrice: number | null;
}