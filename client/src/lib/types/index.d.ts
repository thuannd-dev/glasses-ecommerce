type Activity = {
  id: string;
  title: string;
  date: Date;
  description: string;
  category: string;
  isCancelled: boolean;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  attendees: Profile[];
  //check current user is attendees of an activity
  isGoing: boolean;
  isHost: boolean;
  hostId: string;
  hostDisplayName: string;
};

type Profile = {
  id: string;
  displayName: string;
  bio?: string;
  imageUrl?: string;
};

type User = {
  id: string;
  email: string;
  displayName: string;
  imageUrl?: string;
  roles?: string[];
};

type LocationIQSuggestion = {
  place_id: string;
  osm_id: string;
  osm_type: string;
  licence: string;
  lat: string;
  lon: string;
  boundingbox: string[];
  class: string;
  type: string;
  display_name: string;
  display_place: string;
  display_address: string;
  address: LocationIQAddress;
};

type LocationIQAddress = {
  name: string;
  house_number: string;
  road: string;
  suburb?: string;
  town?: string;
  village?: string;
  city?: string;
  county: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
  neighbourhood?: string;
};

/** Query params for GET /api/products */
type ProductsQueryParams = {
  /** Default: 1 */
  pageNumber?: number;
  /** Default: 10 */
  pageSize?: number;
  categoryIds?: string[] | null;
  brand?: string | null;
  status?: string | null;
  type?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string | null;
  /** Default: 0 */
  sortBy?: number;
  /** Default: 1 */
  sortOrder?: number;
};
