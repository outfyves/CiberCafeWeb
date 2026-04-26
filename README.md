# 🖥️ CiberCafe Management System
## Evidencia de Desempeño: GA7-220501096-AA3-EV01

Este repositorio contiene la codificación del módulo central (**Core**) de un sistema de gestión para un Cibercafé, desarrollado utilizando el framework **Spring Boot**. Esta entrega cumple con los requerimientos de la fase de codificación, aplicando arquitecturas modernas y estándares de la industria solicitados en el programa de formación.

---

## 🚀 Funcionalidades Principales (Entrega AA3-EV01)
El sistema integra los siguientes módulos funcionales operando sobre una API REST robusta:

### 1. Gestión Administrativa y Operativa
*   **Módulo de Equipos:** Inventario dinámico de PCs con control de estados (Disponible, Ocupado, Mantenimiento) y tarifas configuradas en la base de datos.
*   **Control de Sesiones:** Sistema integrado de tiempo y cobro. Permite gestionar sesiones de Clientes Registrados y Clientes Generales con soporte para tiempo libre y prepago.
*   **Gestión de Clientes:** CRUD completo con persistencia en MySQL, control de estados (Activo, Inactivo, Moroso) y registro automático de actividad.

### 2. Punto de Venta (POS) e Inventario
*   Venta de snacks, bebidas y servicios técnicos.
*   **Sincronización Automática:** Descuento inmediato de Stock en la base de datos al procesar cada venta.
*   Alertas visuales de stock bajo.

### 3. Reportes y Analítica
*   Dashboard con estadísticas visuales en tiempo real.
*   Historial de transacciones unificado (Sesiones + Ventas).
*   Gráficos dinámicos mediante **Chart.js** para ingresos y estados de hardware.

### 4. Experiencia de Usuario (UI/UX)
*   **Modo Oscuro:** Implementación nativa con persistencia de preferencia del usuario.
*   **Interfaz Responsiva:** Optimizado para pantallas de escritorio y dispositivos móviles.
*   **Notificaciones:** Sistema de alertas globales para mantenimiento y bajo stock.

---

## 📂 Documentación y Artefactos
Se ha incluido la carpeta `/docs` con los artefactos del ciclo de vida del software realizados previamente:
*   Diagramas de Clases y Casos de Uso.
*   Diseños y prototipos técnicos.

---

## 🛠️ Tecnologías y Estándares
*   **Backend:** Java 17, Spring Boot 3.2.0, Maven, JPA / Hibernate.
*   **Base de Datos:** MySQL 8.0.
*   **Frontend:** HTML5, CSS3 (Modern Grid & Variables), JavaScript Vanilla (ES6+), FontAwesome.
*   **Arquitectura:** MVC (Model-View-Controller) con servicios desacoplados.

---

## 💻 Instrucciones de Ejecución

### Requisitos
*   Java JDK 17 o superior.
*   Maven instalado.
*   MySQL Server (Base de datos: `cibercafe_db`).

### Pasos (Linux/Windows)
1.  Importar el script SQL `cibercafe_db.sql` en su servidor MySQL.
2.  Ejecutar el comando en la raíz del proyecto:
    ```bash
    mvn spring-boot:run
    ```
3.  Acceder a: `http://localhost:8080`

---

## 📦 Datos del Aprendiz
*   **Nombre:** JESUS MORALES
*   **Ficha:** 2721406
*   **Programa:** Análisis y Desarrollo de Software (SENA)
*   **Repositorio Oficial:** [https://github.com/outfyves/CiberCafeWeb](https://github.com/outfyves/CiberCafeWeb)
