export interface Hero {
  id: number;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
}

export interface TeamHero extends Hero {
  isMyHero?: boolean;
}
