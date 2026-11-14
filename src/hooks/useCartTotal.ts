import { useMemo } from 'react';
import type { ItemCarrito } from '../services/cartService';

export function useCartTotal(items: ItemCarrito[]) {
  const total = useMemo(() => {
    return items.reduce(
      (acumulado, item) =>
        acumulado + Number(item.product.salePrice) * item.quantity,
      0,
    );
  }, [items]);

  return total;
}
