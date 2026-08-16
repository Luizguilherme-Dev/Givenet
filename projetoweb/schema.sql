-- =============================================
-- Schema - Give Net
-- SQL Server Management Studio
-- =============================================

CREATE DATABASE givenet;
GO

USE givenet;
GO

-- =============================================
-- Tabela: usuario
-- Hibernate gera: id, nome, email, senha, telefone, user_role
-- =============================================
CREATE TABLE usuario (
    id        BIGINT IDENTITY(1,1) PRIMARY KEY,
    nome      VARCHAR(100) NOT NULL,
    email     VARCHAR(150) NOT NULL UNIQUE,
    senha     VARCHAR(255) NOT NULL,
    telefone  VARCHAR(20),
    user_role VARCHAR(20)  NOT NULL DEFAULT 'USER'
);
GO

-- =============================================
-- Tabela: ong
-- Hibernate gera: id, nome, email, telefone, endereco,
--                 tipos_aceitos, horarios, aceita_coleta, restricoes
-- =============================================
CREATE TABLE ong (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    nome          VARCHAR(100) NOT NULL,
    email         VARCHAR(150),
    telefone      VARCHAR(20),
    endereco      VARCHAR(255),
    tipos_aceitos VARCHAR(255),
    horarios      VARCHAR(255),
    aceita_coleta BIT NOT NULL DEFAULT 0,
    restricoes    VARCHAR(500)
);
GO

-- =============================================
-- Tabela: doacao
-- Hibernate gera: id, nome, email, horario, data, usuario_id,
--                 ong_id, itens_tipo, item_doado, status,
--                 data_entrega, confirmado_por_usuario_id, pin_confirmacao
-- =============================================
CREATE TABLE doacao (
    id                        BIGINT IDENTITY(1,1) PRIMARY KEY,
    nome                      VARCHAR(100) NOT NULL,
    email                     VARCHAR(150) NOT NULL,
    horario                   VARCHAR(10)  NOT NULL,
    data                      VARCHAR(50),
    usuario_id                BIGINT       NOT NULL,
    ong_id                    BIGINT       NOT NULL,
    itens_tipo                VARCHAR(255),
    item_doado                VARCHAR(255),
    status                    VARCHAR(30)  NOT NULL DEFAULT 'AGENDADO',
    data_entrega              DATETIME2,
    confirmado_por_usuario_id BIGINT,
    pin_confirmacao           VARCHAR(4),
    CONSTRAINT fk_doacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT fk_doacao_ong     FOREIGN KEY (ong_id)     REFERENCES ong(id)
);
GO

-- =============================================
-- Tabela: chat
-- Hibernate gera: id, usuario, mensagem, data
-- =============================================
CREATE TABLE chat (
    id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario  VARCHAR(100),
    mensagem VARCHAR(500) NOT NULL,
    data     VARCHAR(50)
);
GO

-- =============================================
-- Tabela: audit_log
-- Hibernate gera: id, usuario_id, acao, detalhe, data_hora
-- =============================================
CREATE TABLE audit_log (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario_id BIGINT       NOT NULL,
    acao       VARCHAR(100) NOT NULL,
    detalhe    VARCHAR(255),
    data_hora  DATETIME2    NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- Tabela: doacao_status_history
-- Hibernate gera: id, doacao_id, status_anterior, status_novo,
--                 alterado_por_usuario_id, data_hora
-- =============================================
CREATE TABLE doacao_status_history (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    doacao_id               BIGINT      NOT NULL,
    status_anterior         VARCHAR(30) NOT NULL,
    status_novo             VARCHAR(30) NOT NULL,
    alterado_por_usuario_id BIGINT      NOT NULL,
    data_hora               DATETIME2   NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_history_doacao FOREIGN KEY (doacao_id) REFERENCES doacao(id)
);
GO

-- =============================================
-- Dados iniciais - Usuarios
-- Senhas em bcrypt:
--   54981234 -> $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--   123456   -> $2a$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RKcmaK9cwOXqqgew6
-- =============================================
INSERT INTO usuario (nome, email, senha, telefone, user_role) VALUES
('Luiz',          'luiz95215@adm.givenet', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL,          'ADMIN'),
('Admin',         'admin@admin.com',        '$2a$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RKcmaK9cwOXqqgew6', NULL,          'ADMIN'),
('Kauany Santos', 'kauany@email.com',       '$2a$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RKcmaK9cwOXqqgew6', '11992603359', 'USER');
GO

-- =============================================
-- Dados iniciais - ONGs
-- =============================================
INSERT INTO ong (nome, email, telefone, endereco, tipos_aceitos, horarios, aceita_coleta, restricoes) VALUES
('WWF Brasil',             'wwf@wwf.org.br',                      '6132248080', 'SHIS QI 5, Conjunto 16, Casa 1 - Brasília, DF',            'roupa,alimento,eletronico', '08:00-12:00,14:00-18:00', 1, NULL),
('Instituto Ayrton Senna', 'contato@institutoayrtonsenna.org.br', '1130530000', 'Rua Funchal, 538 - Vila Olímpia, São Paulo, SP',            'roupa,material_escolar',    '09:00-17:00',             1, NULL),
('AACD',                   'aacd@aacd.org.br',                    '1121769000', 'Av. Prof. Ascendino Reis, 724 - Ibirapuera, São Paulo, SP', 'cadeira_de_rodas,muleta',   '08:00-16:00',             0, 'Apenas equipamentos de mobilidade');
GO
