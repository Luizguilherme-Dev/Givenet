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

    @Query("""
            SELECT d FROM Doacao d
            WHERE (:nome IS NULL OR LOWER(d.nome) LIKE CONCAT('%', CONCAT(:nome, '%')))
              AND (:item IS NULL OR LOWER(COALESCE(d.itemDoado, '')) LIKE CONCAT('%', CONCAT(:item, '%'))
                   OR LOWER(COALESCE(d.itensTipo, '')) LIKE CONCAT('%', CONCAT(:item, '%')))
              AND (:data IS NULL OR d.data LIKE CONCAT(:data, '%'))
              AND (:horario IS NULL OR d.horario LIKE CONCAT('%', CONCAT(:horario, '%')))
              AND (:id IS NULL OR d.id = :id)
              AND (:emailOng IS NULL OR LOWER(d.ong.email) = LOWER(:emailOng))
            ORDER BY d.id DESC
            """)
    List<Doacao> buscarDoacoes(
            @Param("nome") String nome,
            @Param("item") String item,
            @Param("data") String data,
            @Param("horario") String horario,
            @Param("id") Long id,
            @Param("emailOng") String emailOng);
}
