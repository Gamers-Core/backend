export interface BostaLocation {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
}

export interface BostaPickupLocation {
  _id: string;
  address: {
    country: {
      _id: string;
      name: 'Egypt';
      code: 'EG';
    };
    city: {
      _id: string;
      name: string;
      sector: number;
      nameAr: string;
    };
    zone: {
      _id: string;
      name: string;
      nameAr: string;
    };
    district: {
      _id: string;
      name: string;
      nameAr: string;
      fmCode: string;
    };
    firstLine: string;
    buildingNumber: string;
    floor: string;
    apartment: string;
    geoLocation: [number, number];
    isGeoLocationAddressVerified: boolean;
  };
  contactPerson: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  locationName: string;
  isNewZoning: boolean;
  isDefault: boolean;
}
