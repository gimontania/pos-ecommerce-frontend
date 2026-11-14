export interface Categoria {
  id: number;
  name: string;
}

export interface Producto {
  id: number;
  name: string;
  description: string | null;
  salePrice: string;
  stock: number;
  categoryId: number;
  category: Categoria;
}

export interface DatosProducto {
  name: string;
  description: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  categoryId: number;
}
