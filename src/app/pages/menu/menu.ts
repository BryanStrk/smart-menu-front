import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuService } from '../../api/menu-service';
import { AuthService } from '../../api/auth-service';
import { PedidoStore } from '../../state/pedido.store';

type ProductoVM = {
  id: string;
  nombre: string;
  descripcion: string;
  precioConIva: number;
  imagen?: string;
  categoria?: string;
  qty: number;
  kcal?: number;
  proteinas?: number;
  grasas?: number;
  carbohidratos?: number;
};

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
})
export class Menu implements OnInit {
  loading = true;
  modo: 'ver' | 'armar' = 'ver';
  search = '';
  categorias: string[] = ['Entrantes', 'Principales', 'Postres', 'Bebidas'];
  catActiva: string | null = null;
  productos: ProductoVM[] = [];
  mesaId: string | null = null;
  idsRecomendados: string[] = [];
  kcalObjetivoIA: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    public auth: AuthService,
    private pedidoStore: PedidoStore,
  ) {}

  get totalItems() {
    return this.pedidoStore.totalItems();
  }

  get totalEuros() {
    return this.pedidoStore.totalEuros();
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      const m = q.get('modo');
      this.modo = m === 'ver' ? 'ver' : 'armar';
      this.mesaId = q.get('mesa');

      const rec = q.get('recomendados');
      const kcal = q.get('kcal');

      this.kcalObjetivoIA = kcal ? Number(kcal) : null;

      this.idsRecomendados = rec
        ? rec
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0)
        : [];

      console.log('Query params menú:', {
        modo: this.modo,
        mesa: this.mesaId,
        recomendados: this.idsRecomendados,
        kcal: this.kcalObjetivoIA,
      });

      this.cargarMenuYSincronizar();
    });
  }

  private categoriaDesdeTags(tags: any): string {
    const t = (Array.isArray(tags) ? tags : []).map((x: any) =>
      String(x).toUpperCase(),
    );

    if (t.includes('ENTRANTE')) return 'Entrantes';
    if (t.includes('PRINCIPAL')) return 'Principales';
    if (t.includes('POSTRE')) return 'Postres';
    if (t.includes('BEBIDA')) return 'Bebidas';
    return 'Otros';
  }

  private extraerIdProducto(p: any): string {
    const rawId =
      p?.id?.$oid ||
      p?._id?.$oid ||
      p?._id?.hexString ||
      p?.id?.hexString ||
      (typeof p?.id === 'string' ? p.id : null) ||
      (typeof p?._id === 'string' ? p._id : null) ||
      null;

    return rawId ? String(rawId).trim() : '';
  }

  private cargarMenuYSincronizar() {
    this.loading = true;

    this.menuService.getMenu().subscribe({
      next: (resp: any) => {
        console.log('API RESPONSE /producto:', resp);

        const lista = Array.isArray(resp) ? resp : resp?.productos || [];
        const itemsEnCarrito = this.pedidoStore.obtenerItems() || [];

        this.productos = lista
      .map((p: any) => {
        const idLimpio = this.extraerIdProducto(p);

        const coincidencia = itemsEnCarrito.find(
          (i) =>
            String(i.productoId).toLowerCase() === idLimpio.toLowerCase() &&
            !i.enviado,
        );

        return {
          id: idLimpio,
          nombre: p.nombre || 'Sin nombre',
          descripcion: p.descripcion || '',
          precioConIva: Number(p.precioConIva ?? p.precio ?? 0),
          imagen: p.imagen,
          categoria: p.categoria || this.categoriaDesdeTags(p.tags),
          kcal: Number(p.kcal ?? 0),
          qty: coincidencia ? Number(coincidencia.cantidad) : 0,
          proteinas: Number(p.proteinas ?? 0),
          grasas: Number(p.grasas ?? 0),
          carbohidratos: Number(p.carbohidratos ?? 0),
        } as ProductoVM;
      })
      .filter((p: ProductoVM) => p.id.length > 0);

        console.log('PRODUCTOS PROCESADOS:', this.productos);
        console.log('IDs IA sincronizados contra menú:', this.idsRecomendados);

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando menú:', err);
        this.loading = false;
      },
    });
  }

  private actualizarStore() {
    const itemsExistentes = this.pedidoStore.obtenerItems();
    const enviados = itemsExistentes.filter((i) => i.enviado);

    const nuevos = this.productos
      .filter((p) => p.qty > 0)
      .map((p) => ({
        productoId: p.id,
        nombreActual: p.nombre,
        precioActual: p.precioConIva,
        cantidad: p.qty,
        enviado: false,
        nota:
          itemsExistentes.find((i) => i.productoId === p.id && !i.enviado)
            ?.nota || '',
      }));

    this.pedidoStore.guardarItems([...enviados, ...nuevos]);
  }

  inc(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    p.qty++;
    this.actualizarStore();
  }

  dec(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    if (p.qty > 0) {
      p.qty--;
      this.actualizarStore();
    }
  }

  productosFiltrados(): ProductoVM[] {
    const term = this.search.trim().toLowerCase();

    return this.productos.filter((p) => {
      const cumpleIA =
        this.idsRecomendados.length === 0 ||
        this.idsRecomendados.includes(p.id);

      const okCat =
        !this.catActiva ||
        p.categoria?.toLowerCase() === this.catActiva.toLowerCase();

      const okSearch =
        !term || `${p.nombre} ${p.descripcion}`.toLowerCase().includes(term);

      return cumpleIA && okCat && okSearch;
    });
  }

  setCat(c: string | null) {
    this.catActiva = c;
  }

  getQty(p: ProductoVM) {
    return p.qty || 0;
  }

  irAPedir() {
    this.router.navigate(['/pedir']);
  }

  limpiarFiltroIA() {
    this.idsRecomendados = [];
    this.router.navigate([], {
      queryParams: { recomendados: null, kcal: null },
      queryParamsHandling: 'merge',
    });
  }

  logout() {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }

  trackById(index: number, item: ProductoVM) {
    return item.id;
  }
}