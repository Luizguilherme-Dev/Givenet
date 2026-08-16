package com.itb.inf3bn.givenet.repository;

import com.itb.inf3bn.givenet.model.entity.Ong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OngRepository extends JpaRepository<Ong, Long> {
}
