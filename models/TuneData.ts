export interface Profile {
  description: string;
  videoHeight: string;
  videoBitrate: string;
  videoKbitSec: number;
  videoBufsize: string;
  videoPreset: string;
  audioBitrate: string;
  audioKbitSec: number;
  audioProfile: string;
}

export interface TuneData {
  channel: string;
  profile: Profile | null;
}
