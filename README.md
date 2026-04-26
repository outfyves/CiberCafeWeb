# 🖥️ CiberCafe Management System
## Evidencias Integradas: GA7-220501096 (AA2-EV02, AA3-EV01)

Este repositorio contiene la evolución del sistema de gestión para un Cibercafé, desde su fase inicial en Servlets hasta la implementación actual utilizando **Spring Boot Framework**.

---

## 🚀 Funcionalidades Principales (Avances AA3-EV01)
En la última actualización se ha migrado el core del sistema a Spring Boot, integrando los siguientes módulos funcionales:

### 1. Gestión Administrativa y Operativa
*   **Módulo de Equipos:** Inventario de PCs con control de estados (Disponible, Ocupado, Mantenimiento) y tarifas dinámicas.
*   **Control de Sesiones:** Sistema integrado de tiempo y cobro con soporte para Clientes Registrados y Cliente General. Incluye convertidor de minutos y previsualización de costos.
*   **Gestión de Clientes:** Base de datos completa con estados y registro automático de fecha.

### 2. Punto de Venta (POS) e Inventario
*   Venta de snacks, bebidas y servicios (impresiones, escaneos).
*   **Descuento automático de Stock:** Sincronización en tiempo real con la base de datos MySQL al finalizar cada venta.
*   Categorización de productos y alertas de stock bajo.

### 3. Reportes y Dashboard
*   Dashboard con estadísticas visuales y contadores en tiempo real.
*   Historial de sesiones recientes (Activas y Finalizadas).
*   Reportes de ingresos y distribución de equipos mediante **Chart.js**.

### 4. Experiencia de Usuario (UI/UX)
*   **Modo Oscuro:** Soporte nativo para tema oscuro con persistencia.
*   **Interfaz Responsiva:** Diseño adaptable a diferentes tamaños de pantalla.
*   **Notificaciones Globales:** Sistema de alertas para mantenimiento y bajo stock visible en todas las páginas.

---

## 🛠️ Tecnologías y Estándares
*   **Backend:** Java 17, Spring Boot 3.2.0, Maven.
*   **Persistencia:** JPA / Hibernate, MySQL.
*   **Frontend:** HTML5, CSS3 (Variables & Grid), JavaScript Vanilla (ES6+), FontAwesome.
*   **Estándares:** Arquitectura MVC, API RESTful, Inyección de Dependencias, Comentarios Técnicos en Código.

---

## 💻 Instrucciones de Ejecución

### Requisitos
*   Java JDK 17+
*   Maven
*   MySQL Server (Base de datos: `cibercafe_db`)

### Ejecución (Linux/Windows)
1.  Clonar el repositorio.
2.  Importar la base de datos desde el archivo `cibercafe_db.sql`.
3.  Ejecutar el comando en la raíz del proyecto:
    ```bash
    mvn spring-boot:run
    ```
4.  Acceder a: `http://localhost:8080`

---

## 📦 Datos del Aprendiz
*   **Nombre:** JESUS MORALES
*   **Programa:** Análisis y Desarrollo de Software (SENA)
*   **Ficha:** 2721406
