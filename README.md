# 🍔 FastOrder S.A. - Progressive Web App (PWA)

Aplicación Web Progresiva completa para **FastOrder S.A.** con separación de roles (**Portal Cliente** y **Portal Negocio / Restaurante**), páginas dedicadas de personalización, historial y modificación de comandas, modo offline con Service Worker y KDS en tiempo real.

---

## 🌟 Nuevas Funcionalidades y Mejoras Implementadas

### 1. 👤 Espacio del Cliente
- **📋 Menú Responsivo:** Vista con tarjetas de tamaño adecuado, buscador instantáneo y categorías fluidas.
- **🍔 Página Dedicada de Detalle de Producto (`/product/:id`):** Se eliminaron las islas flotantes. Ahora cada producto se abre en su propia página con personalización de tamaños, extras, ingredientes que se desean retirar, notas a cocina y contador de cantidad.
- **🛒 Carrito Desplegable (Drawer):** Despliegue lateral suave para revisar pedido, elegir modalidad (En Mesa o Para Llevar), ingresar datos y enviar a cocina.
- **📦 Seguimiento de Pedidos (`/my-orders`):** Stepper visual con barra de progreso en vivo (*Recibido ➡️ En Cocina 🔥 ➡️ Listo 🎉 ➡️ Entregado ✅*).
- **👤 Perfil del Cliente (`/profile`):** Gestión de datos personales, teléfono, mesa favorita, notas de alergias y resumen de pedidos.
- **⬅️ Botón Global de Retroceso:** Permite regresar fácilmente a la última página vista.

### 2. 🏢 Espacio del Negocio / Restaurante
- **👨‍🍳 Pantalla de Comandas de Cocina (KDS) (`/business/kitchen`):** Tablero en vivo con columnas *Por Preparar*, *En la Parrilla* y *Listos*.
- **📋 Historial Completo de Clientes y Comandas (`/business/history`):**
  - Registro de todas las órdenes realizadas.
  - Búsqueda por nombre de cliente, código de orden o mesa.
  - **Modificación de estado en tiempo real:** Los administradores pueden cambiar el estado de cualquier orden (*Recibido, En Preparación, Listo, Entregado, Cancelado*).
- **📈 Métricas del Negocio (`/business/metrics`):**
  - Ingresos totales acumulados.
  - Comandas totales y pedidos activos.
  - Tiempo promedio de preparación.
  - Ticket promedio por cliente.
  - Top de platos más vendidos.

### 3. 📱 Adaptabilidad y Espaciado Móvil vs Desktop
- **Escala de Escritorio Mejorada:** Tipografía, imágenes y contenedores ampliados para evitar que la vista web se vea pequeña.
- **Barra de Navegación Responsiva:** Barra superior fija con selector de modo (*Cliente / Negocio*), botón de retroceso y estado de red.
- **Barra Móvil Inferior (`MobileBottomNav`):** En dispositivos móviles, los accesos rápidos se sitúan ergonómicamente en la parte inferior evitando descuadres en el menú superior.

---

## 🚀 Comandos de Ejecución

### Modo Desarrollo (Hot Reload)
```bash
npm start
```
> Abre en `http://localhost:4200/`.

### Modo Producción PWA (Service Worker + Offline)
```bash
npm run build
npm run serve:pwa
```
> Abre en `http://localhost:8080/`.
