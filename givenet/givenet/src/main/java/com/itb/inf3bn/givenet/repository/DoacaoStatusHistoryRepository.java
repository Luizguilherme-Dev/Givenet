package com.itb.inf3bn.givenet.repository;

import com.itb.inf3bn.givenet.model.entity.DoacaoStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoacaoStatusHistoryRepository extends JpaRepository<DoacaoStatusHistory, Long> {
    List<DoacaoStatusHistory> findByDoacaoIdOrderByDataHoraDesc(Long doacaoId);
}
