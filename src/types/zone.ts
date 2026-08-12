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

export interface IZoneMember {
  id: string;
  status: ZoneMemberStatus;
  store_id?: string;
  store?: {
    id: string;
    store_name: string;
    slug: string;
    logo?: string;
    rating_average?: string;
  };
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  department?: string;
  course?: string;
  student_id_number?: string;
  rejection_reason?: string;
  created_at?: string;
}

export interface IMyMembership {
  id: string;
  zone: ISchoolZone;
  status: ZoneMemberStatus;
  department?: string;
  course?: string;
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
