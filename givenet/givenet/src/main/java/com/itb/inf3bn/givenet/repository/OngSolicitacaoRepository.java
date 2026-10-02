package com.itb.inf3bn.givenet.repository;

import com.itb.inf3bn.givenet.model.entity.OngSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OngSolicitacaoRepository extends JpaRepository<OngSolicitacao, Long> {
    List<OngSolicitacao> findAllByOrderByCriadoEmDesc();
    boolean existsByEmailIgnoreCaseAndStatus(String email, String status);
    boolean existsByCnpjAndStatus(String cnpj, String status);
}
