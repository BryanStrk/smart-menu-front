import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { ItemCarrito } from '../state/pedido.store';
import { endpoints } from '../config/endpoints';

/**
 * Interfaz que define la estructura para registrar una nueva comanda.
 * Se utiliza exclusivamente en el proceso de creación desde la mesa.
 */
export interface NuevoPedido {
  /** Estado inicial del pedido */
  estadoPedido: string;
  /** Comentarios adicionales del cliente */
  nota: string;
  /** Listado de productos extraídos del {@link PedidoStore} */
  items: ItemCarrito[];
  /** Importe total de la transacción */
  total: number;
  /** TImestamp de la operación */
  fechaCreacion: string;
  /** Identificador de la mesa física */
  mesa: string;
}

/** Estructura de datos de un pedido retornado por la base de datos.
 * Soporta identificadores tanto de SQL (id) como de NoSQL(_id).
 */
export interface PedidoBackend {
  id?: string;
  _id?: string;
  estadoPedido: string;
  nota: string;
  items: any[];
  total: number;
  fechaCreacion: string;
  mesa: string;
}

/**
 * Servicio de gestión de pedidos
 * Este servicio está orientado al panel de administración y barra.
 * Se encarga de la visualización global y el control de estados
 * de los pedidos.
 */

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private api: ApiClient) {}

  crearPedido(pedido: NuevoPedido): Observable<any> {
    // Asegúrate de que endpoints.orders.create sea igual a lo que espera Java
    return this.api.post(endpoints.orders.create, pedido);
  }

  obtenerPedidos(): Observable<PedidoBackend[]> {
    return this.api.get<PedidoBackend[]>(endpoints.orders.list);
  }

  actualizarEstadoPedido(id: string, nuevoEstado: string): Observable<any> {
    const cleanId = typeof id === 'object' ? (id as any).id || (id as any)._id : id;

    const url = `${endpoints.orders.list}/${cleanId}/estado`;
    const body = { estado: nuevoEstado };
    return this.api.patch(url, body);
  }

  obtenerSugerenciasInteligentes(): Observable<string[]> {
    return this.api.get<string[]>(`${endpoints.orders.list}/recomendaciones`);
  }
}
