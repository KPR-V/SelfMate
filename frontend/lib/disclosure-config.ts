
import { countries } from "@selfxyz/qrcode";

export const VERIFICATION_CONFIG = {
  minimumAge: 18,
  excludedCountries: [countries.PAKISTAN, countries.AZERBAIJAN, countries.KAZAKHSTAN],
  ofac: true,
};

export const DISCLOSURE_REQUESTS = {
  nationality: true,
  gender: true,
  name: false,
  date_of_birth: false, 
  passport_number: false, 
  expiry_date: false,
  issuing_state: false,
};


export const SELF_DISCLOSURES = {
  ...VERIFICATION_CONFIG,
  ...DISCLOSURE_REQUESTS,
};


export const SELF_APP_CONFIG = {
  version: 2,
  appName: "Nomad Dating",
  scope: "nomad-dating",
  logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
  endpointType: "staging_celo" as const,
  userIdType: "hex" as const,
  userDefinedData: "nomad-dating-verification",
};


export const CONTRACT_ADDRESS = "0xd5e4a7b1f649603fb87e5635b168c003e4face83";


export const EXCLUDED_COUNTRY_NAMES = {
  PAK: "Pakistan",
  AZE: "Azerbaijan", 
  KAZ: "Kazakhstan"
};