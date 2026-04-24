# 🖥️ Sistema de Gestión CiberCafe - CyberManager

## 📝 Descripción del Proyecto
Este proyecto es una aplicación web integral diseñada para la gestión de un cibercafé, desarrollada como parte de la formación académica del SENA. La aplicación unifica el control de **inventario, ventas, gestión de clientes y monitoreo de equipos** en una sola plataforma robusta y moderna.

El sistema utiliza una arquitectura **Full-Stack**, empleando **Spring Boot** para el backend y una interfaz dinámica basada en **HTML5, CSS3 y JavaScript** para el frontend.

---

## 🚀 Características Principales (Módulos)

*   **👥 Gestión de Clientes:** Registro de clientes en base de datos MySQL con soporte para identificación (Cédula), correo y teléfono.
*   **💻 Control de Equipos:** Monitoreo en tiempo real del estado de las computadoras (Disponible, Ocupado, Mantenimiento) y gestión de tarifas por hora.
*   **🛒 Punto de Venta (POS):** Carrito de compras integrado para la venta de snacks y bebidas con actualización automática de stock.
*   **📦 Inventario:** Gestión centralizada de productos con alertas visuales de stock bajo.
*   **📊 Arquitectura Profesional:** Implementación del patrón de diseño **MVC (Modelo-Vista-Controlador)** y persistencia de datos con **JPA/Hibernate**.

---

## 🛠️ Tecnologías Utilizadas

*   **Backend:** Java 17, Spring Boot 3.2, Spring Data JPA.
*   **Frontend:** JavaScript (ES6+), HTML5, CSS3, FontAwesome.
*   **Base de Datos:** MySQL.
*   **Gestión de Dependencias:** Maven.
*   **Control de Versiones:** Git / GitHub.

---

## ⚙️ Requisitos Previos

1.  **Java JDK 17** o superior.
2.  **MySQL Server** en ejecución.
3.  Una base de datos llamada `cibercafe_db`.
4.  **Maven** (opcional, incluido en el proyecto como `mvnw`).

---

## 🏃 Instrucciones de Ejecución

### 1. Configuración de la Base de Datos
Asegúrate de tener MySQL activo y crear la base de datos:
```sql
CREATE DATABASE cibercafe_db;
```
*Nota: El sistema creará las tablas automáticamente al iniciar gracias a Hibernate.*

### 2. Configuración de credenciales
Edita el archivo `src/main/resources/application.properties` si tu usuario o contraseña de MySQL son diferentes a los predeterminados:
```properties
spring.datasource.username=root
spring.datasource.password=tu_contraseña
```

### 3. Ejecutar el proyecto
**Desde la terminal (Recomendado):**
```bash
./mvnw spring-boot:run
```

**Desde VS Code / NetBeans:**
Abre el proyecto como un proyecto Maven y ejecuta la clase `CiberCafeApplication.java`.

### 4. Acceso a la aplicación
Una vez iniciado el servidor, abre tu navegador en:
`http://localhost:8080/index.html`

---

## 👨‍💻 Autor
**Jesus Morales** - *Desarrollador del Proyecto*
Evidencia: **GA7-220501096-AA3-EV01** - Codificación de módulos del software.

---
*Este proyecto cumple con los estándares de codificación y requerimientos técnicos solicitados por el SENA para la fase de desarrollo.*
