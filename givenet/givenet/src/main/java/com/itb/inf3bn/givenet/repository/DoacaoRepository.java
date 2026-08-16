package com.itb.inf3bn.givenet.repository;

import com.itb.inf3bn.givenet.model.entity.Doacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoacaoRepository extends JpaRepository<Doacao, Long> {
    List<Doacao> findByUsuarioId(Long usuarioId);
    List<Doacao> findByStatus(String status);
    List<Doacao> findByOngId(Long ongId);
    List<Doacao> findByOngIdAndStatus(Long ongId, String status);
}
