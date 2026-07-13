-- =========================================================
-- Base de datos relacional "Score" - Requerimientos Estanga
-- Importar este archivo desde phpMyAdmin (XAMPP) o por consola:
--   mysql -u root -p < score.sql
-- =========================================================

CREATE DATABASE IF NOT EXISTS Score
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE Score;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS score (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT          NOT NULL UNIQUE COMMENT 'Un puntaje por usuario',
  nombre  VARCHAR(100) NOT NULL,
  tiempo  INT          NOT NULL COMMENT 'Tiempo jugado en segundos',
  puntos  INT          NOT NULL COMMENT 'Puntaje obtenido en la partida',
  fecha   DATE         NOT NULL COMMENT 'Formato interno YYYY-MM-DD, se muestra dd/mm/aaaa en el front',
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
