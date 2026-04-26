/**
 * Repositorio para acceso a datos de Sesiones de uso.
 */
package com.cibercafe.repository;

import com.cibercafe.model.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {
    List<Sesion> findTop10ByOrderByFechaInicioDesc();
}
