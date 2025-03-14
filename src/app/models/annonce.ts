


export interface AnnonceFilters {
  searchTerm?: string;
   city?: string;
  type?: string;
  priceRange?: string;
}

export interface City{
  id: string,
  name: string
}

export interface Type{
   id: string,
  name: string
}

export interface Category{
  id: string,
  name: string
}


export interface Caracteristiques {
  id: string;
  etage: number;
   surface: number;
  assenceur: boolean;
  balcon: boolean;
  terrasse: boolean;
  piscine: boolean;
   jardin: boolean;
  parking: boolean;
  numberRooms: number;
  numberSale: number;
  numberSalleBain: number;
}
export interface Image {
  id: string;
  imageURL: string;
}
export interface Annonce {
  id: string;
  title: string;
  description: string;
   createdAt: Date;
  status: boolean;
  adress: string;
  monthPrice: number;
  weekPrice: number;
    dayPrice: number;
  phone: string;
  email: string;
  caracteristiques: Caracteristiques;
  images: Image[];
  user: User;
   city: City;
  category: Category;
  type: Type;
}

export interface Caracteristiques {
  id: string;
  etage: number;
  surface: number;
   assenceur: boolean;
  balcon: boolean;
  terrasse: boolean;
  piscine: boolean;
  jardin: boolean;
   parking: boolean;
  numberRooms: number;
  numberSale: number;
  numberSalleBain: number;
}



export interface User {
  id: string;
   firstName: string;
  lastName: string;
   email: string;
  phone: string;
  profile: string;
}

