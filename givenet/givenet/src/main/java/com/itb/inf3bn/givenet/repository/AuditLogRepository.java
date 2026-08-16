package com.itb.inf3bn.givenet.repository;

import com.itb.inf3bn.givenet.model.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUsuarioIdOrderByDataHoraDesc(Long usuarioId);
}
