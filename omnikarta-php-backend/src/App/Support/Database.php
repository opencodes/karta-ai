<?php

declare(strict_types=1);

namespace App\Support;

use PDO;
use PDOException;
use PDOStatement;

final class Database
{
    private PDO $pdo;

    public function __construct()
    {
        $host = Env::get('DB_HOST', Env::get('MYSQL_HOST', '127.0.0.1')) ?? '127.0.0.1';
        $port = Env::int('DB_PORT', Env::int('MYSQL_PORT', 3306));
        $database = Env::get('DB_DATABASE', Env::get('MYSQL_DATABASE', '')) ?? '';
        $username = Env::get('DB_USERNAME', Env::get('MYSQL_USER', 'root')) ?? 'root';
        $password = Env::get('DB_PASSWORD', Env::get('MYSQL_PASSWORD', '')) ?? '';

        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $database);

        $this->pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    /**
     * @param array<int, mixed> $params
     * @return array<int, array<string, mixed>>
     */
    public function all(string $sql, array $params = []): array
    {
        return $this->statement($sql, $params)->fetchAll();
    }

    /**
     * @param array<int, mixed> $params
     * @return array<string, mixed>|null
     */
    public function one(string $sql, array $params = []): ?array
    {
        $row = $this->statement($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    /**
     * @param array<int, mixed> $params
     */
    public function execute(string $sql, array $params = []): int
    {
        $statement = $this->statement($sql, $params);
        return $statement->rowCount();
    }

    public function begin(): void
    {
        $this->pdo->beginTransaction();
    }

    public function commit(): void
    {
        $this->pdo->commit();
    }

    public function rollback(): void
    {
        if ($this->pdo->inTransaction()) {
            $this->pdo->rollBack();
        }
    }

    public function transaction(callable $callback): mixed
    {
        $this->begin();
        try {
            $result = $callback($this);
            $this->commit();
            return $result;
        } catch (\Throwable $exception) {
            $this->rollback();
            throw $exception;
        }
    }

    /**
     * @param array<int, mixed> $params
     */
    private function statement(string $sql, array $params = []): PDOStatement
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute(array_values($params));
        return $statement;
    }
}
