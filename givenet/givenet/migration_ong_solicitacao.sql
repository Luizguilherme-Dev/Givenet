USE givenet;
GO

IF OBJECT_ID(N'dbo.ong_solicitacao', N'U') IS NULL
BEGIN
    CREATE TABLE ong_solicitacao (
        id               BIGINT IDENTITY(1,1) PRIMARY KEY,
        nome             VARCHAR(100) NOT NULL,
        cnpj             VARCHAR(20),
        email            VARCHAR(150) NOT NULL,
        telefone         VARCHAR(20),
        endereco         VARCHAR(255),
        responsavel_nome VARCHAR(100) NOT NULL,
        senha_hash       VARCHAR(255) NOT NULL,
        tipos_aceitos    VARCHAR(255),
        horarios         VARCHAR(255),
        status           VARCHAR(20) NOT NULL,
        criado_em        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO
