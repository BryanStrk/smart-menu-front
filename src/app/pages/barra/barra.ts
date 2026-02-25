import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../api/pedido-service';
import { PedidoStore } from '../../state/pedido.store';

/**
 * Estructura visual de un pedido para la interfaz de barra.
 */
type PedidoVM = {
  id: string;
  estadoPedido: string;
  nota: string;
  items: any[];
  total: number;
  fechaCreacion: string;
  mesa: string;
};

@Component({
  selector: 'app-barra',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra.html',
  styleUrl: './barra.css',
})
export class Barra implements OnInit {
  pedidos: PedidoVM[] = [];
  cargando = false;
  error = '';
  estadoSeleccionado: string = 'NUEVO';
  mensajeAccion = '';

  constructor(
    private pedidoService: PedidoService,
    private pedidoStore: PedidoStore,
  ) {}

  ngOnInit() {
    console.log('barra iniciando');
    this.cargarPedidos();
  }

  /**
   * Normaliza los IDs de MongoDB (_id o id) a string.
   */
  private normalizarId(raw: any): string {
    if (!raw) return '';

    // 1. Si ya es un string, lo devolvemos
    if (typeof raw === 'string') return raw;

    // 2. Si es el formato estándar de MongoDB serializado por Jackson ($oid)
    if (raw.$oid) return raw.$oid;

    // 3. Si es el objeto ObjectId de Java (trae hexString o es un objeto complejo)
    if (raw.hexString) return raw.hexString;

    // 4. SEGURIDAD EXTREMA: Si es un objeto y nada de lo anterior funcionó,
    // intentamos buscar una propiedad id interna o lo forzamos a string.
    if (typeof raw === 'object') {
      return raw.id || raw._id || (raw.toString() !== '[object Object]' ? raw.toString() : '');
    }

    return String(raw);
  }

  /**
   * Carga real desde el Backend.
   */
  cargarPedidos() {
    this.cargando = true;
    this.error = '';

    this.pedidoService.obtenerPedidos().subscribe({
      next: (resp: any[]) => {
        this.pedidos = resp.map((p: any) => {
          // Intentamos capturar el ID de todas las formas posibles antes de mapear
          const idFinal = this.normalizarId(p.id) || this.normalizarId(p._id);

          return {
            id: idFinal, // <--- Aquí ya no será [object Object]
            estadoPedido: (p.estadoPedido || 'NUEVO').toUpperCase(),
            nota: p.nota ?? '',
            items: p.items ?? [],
            total: Number(p.total ?? 0),
            fechaCreacion: p.fechaCreacion ?? '',
            mesa: p.mesa ?? 'S/M',
          };
        });
        this.cargando = false;
      },
    });
  }

  /**
   * Actualiza el estado en el Backend y refresca la vista.
   */
  actualizarEstado(p: PedidoVM, nuevoEstado: string) {
    this.mensajeAccion = `Actualizando pedido ${p.id}...`;

    this.pedidoService.actualizarEstadoPedido(p.id, nuevoEstado).subscribe({
      next: () => {
        p.estadoPedido = nuevoEstado;
        this.mensajeAccion = `✅ Pedido de la ${p.mesa} marcado como ${this.textoEstadoBonito(nuevoEstado)}`;

        // Sincronización local opcional para compatibilidad con la vigilancia del cliente
        localStorage.setItem('ultimo_estado_pedido', nuevoEstado);

        setTimeout(() => (this.mensajeAccion = ''), 3000);
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.mensajeAccion = '❌ No se pudo actualizar el estado en el servidor.';
      },
    });
  }

  /**
   * Lógica de filtrado y visualización
   */
  pedidosFiltrados(): PedidoVM[] {
    return this.pedidos.filter((p) => p.estadoPedido === this.estadoSeleccionado);
  }

  getMesasEnEstado(estado: string): string[] {
    const mesas = this.pedidos.filter((p) => p.estadoPedido === estado).map((p) => p.mesa);
    return [...new Set(mesas)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  getPedidosDeMesaEnEstado(mesa: string, estado: string): PedidoVM[] {
    return this.pedidos.filter((p) => p.mesa === mesa && p.estadoPedido === estado);
  }

  actualizarEstadoMesaCompleta(mesa: string, nuevoEstado: string) {
    // Buscamos los pedidos de esa mesa que NO están en el nuevo estado todavía
    const pedidosMesa = this.pedidos.filter(
      (p) => p.mesa === mesa && p.estadoPedido !== nuevoEstado,
    );
    pedidosMesa.forEach((p) => this.actualizarEstado(p, nuevoEstado));
  }

  cambiarEstadoFiltro(estado: string) {
    this.estadoSeleccionado = estado;
  }

  textoEstadoBonito(estado: string): string {
    const mapa: Record<string, string> = {
      NUEVO: 'Nuevo',
      EN_PREPARACION: 'En preparación',
      LISTO: 'Listo para servir',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return mapa[estado] || estado;
  }

  // Validadores de botones
  puedePasarAEnPreparacion(p: PedidoVM) {
    return p.estadoPedido === 'NUEVO';
  }
  puedePasarAListo(p: PedidoVM) {
    return p.estadoPedido === 'EN_PREPARACION';
  }
  puedePasarAEntregado(p: PedidoVM) {
    return p.estadoPedido === 'LISTO';
  }
  puedeCancelar(p: PedidoVM) {
    return ['NUEVO', 'EN_PREPARACION'].includes(p.estadoPedido);
  }
}
