export type Member = {
  id: number;
  name: string;
  role: string;
  team: string;
  photoUrl?: string | null;
  email?: string | null;
  linkedin?: string | null;
  birthDate?: string | null;
  active?: boolean;
};