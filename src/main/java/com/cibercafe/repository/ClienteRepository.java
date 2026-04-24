package com.cibercafe.repository;

import com.cibercafe.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para la entidad Cliente.
 * Proporciona métodos CRUD automáticos (save, findAll, findById, delete, etc.)
 */
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Aquí puedes agregar búsquedas personalizadas si lo necesitas en el futuro
}
