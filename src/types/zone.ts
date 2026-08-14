export type SchoolZoneStatus = 'pending' | 'active' | 'rejected' | 'restricted' | 'banned';
export type ZoneMemberStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export interface ISchoolZone {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  tagline?: string;
  description?: string;
  logo?: string;
  cover_image?: string;
  state?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: SchoolZoneStatus;
  member_count?: number;
  created_at?: string;
}

export interface ISchoolZoneDetail extends ISchoolZone {
  department?: string;
  course?: string;
  student_id_number?: string;
  school_id_image?: string;
  delivery_fee?: number;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  products_count?: number;
  stores_count?: number;
}

/** Flat member row — store fields are top-level, not nested objects. */
export interface IZoneMember {
  id: string;
  store_id: string;
  user_id: string | null;
  store_name: string;
  store_slug: string;
  store_logo: string | null;
  store_status: string;
  status: ZoneMemberStatus;
  department?: string;
  course?: string;
  student_id_number?: string;
  school_id_image?: string;
  delivery_fee: number | null;
  rejection_reason?: string;
  requested_at?: string;
  approved_at?: string;
}

export interface IMyMembership {
  id: string;
  school_zone_id: string;
  status: ZoneMemberStatus;
  department?: string;
  course?: string;
  student_id_number?: string;
  delivery_fee: number | null;
  rejection_reason?: string;
  requested_at?: string;
  zone: {
    id: string;
    name: string;
    slug: string;
    subdomain?: string;
    logo?: string;
    cover_image?: string;
    state?: string;
    location?: string;
    status?: SchoolZoneStatus;
  } | null;
}

/** Zone stores endpoint returns STORE items with an `address` object. */
export interface IZoneStore {
  id: string;
  store_name: string;
  slug: string;
  subdomain?: string;
  category?: string;
  description?: string;
  logo?: string;
  cover_image?: string;
  rating_average?: string;
  address: {
    city: string | null;
    state: string | null;
    country: string | null;
  };
  total_products: number;
}

export interface IZoneApplicationPayload {
  department?: string;
  course?: string;
  student_id_number?: string;
  school_id_image?: string;
  delivery_fee?: number;
}

export interface IZoneCreationPayload extends IZoneApplicationPayload {
  name: string;
  tagline?: string;
  description?: string;
  state?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  subdomain?: string;
}
