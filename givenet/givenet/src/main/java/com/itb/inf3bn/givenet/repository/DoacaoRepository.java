package com.itb.inf3bn.givenet.repository;

import com.itb.inf3bn.givenet.model.entity.Doacao;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoacaoRepository extends JpaRepository<Doacao, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Doacao d WHERE d.id = :id")
    Optional<Doacao> findByIdForUpdate(@Param("id") Long id);

    List<Doacao> findByUsuarioId(Long usuarioId);
    List<Doacao> findByStatus(String status);
    List<Doacao> findByOngId(Long ongId);
    List<Doacao> findByOngIdAndStatus(Long ongId, String status);
}
