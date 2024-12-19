export enum OwnershipType {
  CINEMA = 'CINEMA',
  CINEMA_PROVIDER = 'CINEMA_PROVIDER',
  CINEMA_LAYOUT = 'CINEMA_LAYOUT',
  CINEMA_LAYOUT_GROUP = 'CINEMA_LAYOUT_GROUP',
}

export type TOwnerships = {
  cinema_provider_id?: Uint8Array;
  cinema_id?: Uint8Array;
};

export const PERMISSION_NAMESPACES = [
  'cinema_provider',
  'cinema_provider.cinema',
  'cinema_provider.cinema_layout',
  'cinema_provider.cinema_layout.cinema_layout_group',
  'cinema_provider.cinema_layout.cinema_layout_seat',
  'cinema_provider.cinema.cinema_room',
  'cinema_provider.cinema.cinema_room.perform',
  'cinema_provider.film',
  'cinema_provider.item',
] as const;
