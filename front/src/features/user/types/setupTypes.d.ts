export interface SetupOption {
  id: number;
  name: string;
}

export interface SetupState {
  interests: SetupOption[];
  languages: SetupOption[];
  genders: SetupOption[];
  loading: boolean;
  error: string | null;
}
