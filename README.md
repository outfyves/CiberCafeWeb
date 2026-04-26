# 🖥️ CiberCafe Management System - Repositorio Principal
## 🚀 Evolución y Visión del Proyecto (ADSO - SENA)

Bienvenido al repositorio central del **Sistema de Gestión para Cibercafé**. Este espacio sirve como el eje principal de desarrollo del proyecto, centralizando todos los avances técnicos, funcionales y documentales hasta su finalización. Mientras que otros repositorios se utilizan para entregas puntuales de evidencias, **este repositorio (CiberCafeWeb) contendrá siempre la versión más actualizada y completa del software.**

---

## 📝 ¿Qué es CiberCafe?
Es una solución integral de software diseñada para automatizar la operación de centros de servicios tecnológicos y entretenimiento. El sistema busca resolver la problemática de control manual de tiempos, inventarios deficientes y falta de analítica de ingresos que enfrentan los pequeños y medianos negocios del sector.

### 🌟 Visión del Proyecto (Hacia dónde vamos)
El objetivo final es entregar una plataforma **Full-Stack** robusta que permita:
*   Control total y remoto de terminales de usuario.
*   Punto de venta inteligente con gestión multi-almacén.
*   Sistema de cuentas de usuario con saldos prepagados y fidelización.
*   Generación automática de reportes contables y operativos exportables.
*   Interfaz de alto rendimiento adaptada a estándares modernos de accesibilidad.

---

## 📑 Bitácora de Logros (Hitos de Desarrollo)

### 🔹 Fase 1: Fundamentos Web (AA2-EV02)
*   Implementación de la arquitectura base utilizando **Servlets y JSP**.
*   Conexión inicial a base de datos mediante **JDBC**.
*   Diseño de la estructura relacional inicial en MySQL.
*   Despliegue sobre servidor de aplicaciones Apache Tomcat 10.

### 🔹 Fase 2: Frameworks y Modernización (AA3-EV01 - Actual)
*   **Migración a Spring Boot 3:** Transición total a un ecosistema basado en microservicios y APIs REST.
*   **Persistencia Avanzada:** Implementación de **Spring Data JPA e Hibernate** para un manejo eficiente de la base de datos.
*   **Módulo Core Operativo:** Gestión dinámica de Equipos, Clientes y Sesiones de tiempo real.
*   **Punto de Venta (POS):** Integración de ventas de productos con descuento automático de stock.
*   **Experiencia de Usuario:** Introducción de **Modo Oscuro** nativo, notificaciones globales y diseño responsivo.

---

## 🛠️ Tecnologías Utilizadas
*   **Lenguaje:** Java 17 (LTS).
*   **Framework:** Spring Boot 3.2.0 (Spring MVC, JPA, DevTools).
*   **Base de Datos:** MySQL Server 8.0.
*   **Frontend:** JavaScript Moderno (ES6+), HTML5, CSS3 (Variables, Flexbox y Grid).
*   **Gestión:** Maven (Dependencias), Git (Control de versiones).

---

## 💻 Guía de Ejecución

### 🚀 Lanzamiento Rápido (Consola)
1.  **Clonar:** `git clone https://github.com/outfyves/CiberCafeWeb.git`
2.  **Base de Datos:** Importar el archivo `cibercafe_db.sql` en su gestor MySQL.
3.  **Ejecutar:**
    *   **Linux/Mac:** `mvn spring-boot:run`
    *   **Windows:** `mvn spring-boot:run` o `./mvnw.cmd spring-boot:run`
4.  **Navegar:** [http://localhost:8080](http://localhost:8080)

### 🛠️ Revisión en NetBeans IDE
Este proyecto es 100% compatible con NetBeans (preferido por evaluadores):
1.  Abrir NetBeans y seleccionar `Open Project`.
2.  Elegir la carpeta del proyecto (Reconocerá el icono de **Maven**).
3.  Realizar un **"Clean and Build"** para descargar las librerías necesarias.
4.  Presionar **Run** y seleccionar `CiberCafeApplication` como clase principal.

---

## 📦 Información de Autoría
*   **Aprendiz:** JESUS MORALES
*   **Ficha:** 2721406
*   **Programa:** Análisis y Desarrollo de Software (ADSO)
*   **Centro:** SENA - Regional Córdoba

---
*Este repositorio es de carácter académico y evolutivo.*
