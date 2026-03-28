import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoStore, ItemCarrito } from '../../state/pedido.store';
import { PedidoService, NuevoPedido } from '../../api/pedido-service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-pedir',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedir.html',
  styleUrls: ['./pedir.css'],
})
export class Pedir implements OnInit, OnDestroy {
  items: ItemCarrito[] = [];
  totalEuros = 0;
  totalNuevaRonda = 0;
  nota = '';
  mesa = '';
  enviando = false;
  mensajeError = '';
  mensajeOk = '';
  pedidoConfirmado = false;
  estadoActual = 'RECIBIDO';
  private vigilanciaSub?: Subscription;

  constructor(
    private pedidoStore: PedidoStore,
    private pedidoService: PedidoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.items = this.pedidoStore.obtenerItems();
    this.mesa = this.pedidoStore.obtenerMesa() || 'Mesa 1';
    this.recalcularTotales();

    const estadoGuardado = localStorage.getItem('ultimo_estado_pedido');

    if (estadoGuardado && this.tieneItemsEnviados()) {
      this.pedidoConfirmado = true;
      this.estadoActual = estadoGuardado;
      this.iniciarVigilanciaEstado();

      if (estadoGuardado === 'ENTREGADO') {
        setTimeout(() => {
          this.pedidoConfirmado = false;
        }, 10000);
      }
    } else {
      this.pedidoConfirmado = false;
    }
  }

  private recalcularTotales() {
    this.totalEuros = this.items.reduce(
      (s, i) => s + (i.cantidad || 0) * (i.precioActual || 0),
      0,
    );

    this.totalNuevaRonda = this.items
      .filter((i) => !i.enviado)
      .reduce((s, i) => s + (i.cantidad || 0) * (i.precioActual || 0), 0);
  }

  seguirPidiendo() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  iniciarVigilanciaEstado() {
    this.vigilanciaSub = interval(2000).subscribe(() => {
      const estadoEnStorage = localStorage.getItem('ultimo_estado_pedido');
      if (estadoEnStorage && estadoEnStorage !== this.estadoActual) {
        this.estadoActual = estadoEnStorage;

        if (this.estadoActual === 'ENTREGADO') {
          setTimeout(() => {
            this.pedidoConfirmado = false;
            localStorage.removeItem('ultimo_estado_pedido');
            this.vigilanciaSub?.unsubscribe();
          }, 10000);
        }
      }
    });
  }

  ngOnDestroy() {
    this.vigilanciaSub?.unsubscribe();
  }

  cambiarCantidad(item: ItemCarrito, delta: number) {
    if (item.enviado) return;

    const nuevaCantidad = (item.cantidad || 0) + delta;

    if (nuevaCantidad <= 0) {
      this.items = this.items.filter((i) => i !== item);
    } else {
      item.cantidad = nuevaCantidad;
    }

    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotales();
  }

  cambiarNota(item: ItemCarrito, nota: string) {
    if (item.enviado) return;
    item.nota = nota;
    this.pedidoStore.guardarItems(this.items);
  }

  vaciarCarrito() {
    this.items = this.items.filter((i) => i.enviado === true);
    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotales();
  }

  volverAlMenu() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  confirmarPedido() {
    this.mensajeError = '';
    this.mensajeOk = '';

    const productosNuevos = this.itemsNuevos();

    if (productosNuevos.length === 0) {
      this.mensajeError = 'No hay productos nuevos para enviar.';
      return;
    }

    this.enviando = true;

    const idComanda = 'cmd-' + Date.now();

    const cuerpo: NuevoPedido = {
      mesaId: this.mesa,
      nota: this.nota || '',
      lineasPedido: productosNuevos.map((i) => ({
        productoId: i.productoId || '',
        nombreActual: i.nombreActual,
        precioActual: i.precioActual,
        cantidad: i.cantidad,
        nota: i.nota || '',
      })),
      totalPedido: productosNuevos.reduce((s, i) => s + i.cantidad * i.precioActual, 0),
      fechaCreacion: new Date().toISOString(),
    };

    const finalizarEnvioLocal = () => {
      this.pedidoStore.agregarAlHistorial({ ...cuerpo, id: idComanda });

      this.items.forEach((item) => {
        if (!item.enviado) item.enviado = true;
      });

      this.pedidoStore.guardarItems(this.items);
      this.recalcularTotales();

      this.mensajeOk = '¡Ronda enviada con éxito!';

      setTimeout(() => {
        this.mensajeOk = '';
        this.pedidoConfirmado = true;
        this.estadoActual = 'RECIBIDO';
        localStorage.setItem('ultimo_estado_pedido', 'RECIBIDO');
        this.enviando = false;
        this.iniciarVigilanciaEstado();
      }, 2000);
    };

    this.pedidoService.crearPedido(cuerpo).subscribe({
      next: () => finalizarEnvioLocal(),
      error: () => {
        console.warn('Usando modo local por falta de conexión.');
        finalizarEnvioLocal();
      },
    });
  }

  getProgresoPorcentaje(): number {
    const mapa: Record<string, number> = {
      RECIBIDO: 20,
      PREPARANDO: 60,
      LISTO: 90,
      ENTREGADO: 100,
      CANCELADO: 0,
    };
    return mapa[this.estadoActual] || 0;
  }

  textoEstadoBonito(estado: string): string {
    const nombres: Record<string, string> = {
      RECIBIDO: 'Recibido en cocina',
      PREPARANDO: 'En preparación...',
      LISTO: '¡Listo! 🍽️',
      ENTREGADO: '¡Buen provecho!',
      CANCELADO: 'Cancelado',
    };
    return nombres[estado] || estado;
  }

  finalizarCicloPedido() {
    localStorage.removeItem('ultimo_estado_pedido');
    this.pedidoConfirmado = false;
    this.estadoActual = 'RECIBIDO';
  }

  itemsEnviados() {
    return this.items.filter((i) => i.enviado === true);
  }

  itemsNuevos() {
    return this.items.filter((i) => !i.enviado);
  }

  tieneItemsEnviados() {
    return this.itemsEnviados().length > 0;
  }

  tieneItemsNuevos() {
    return this.itemsNuevos().length > 0;
  }

  identificadorItem(index: number, item: ItemCarrito) {
    return `${item.productoId}-${item.enviado}-${index}`;
  }
}