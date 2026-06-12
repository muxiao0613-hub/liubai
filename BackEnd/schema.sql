-- Active: 1781024450420@@127.0.0.1@3306@mysql
-- 留白 数据库结构（参考）。后端默认使用 JPA ddl-auto=update 自动建表，
-- 本文件用于文档说明 / 手工初始化。管理员账号由后端 DataInitializer 启动时创建。

CREATE DATABASE IF NOT EXISTS liubai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE liubai;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'USER') DEFAULT 'USER',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provinces (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  province_code VARCHAR(10) NOT NULL,
  city_code VARCHAR(20) NOT NULL,
  city_name VARCHAR(50) NOT NULL,
  first_visit DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_city (user_id, city_code)
);

-- 一次到访（同一城市可多次）。visitedAt 数组与 statuses 集合均由该表聚合。
CREATE TABLE IF NOT EXISTS visits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  city_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  visit_date DATE,
  status ENUM('VISITED', 'LIVED', 'BUSINESS') NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS checkins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  city_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  category ENUM('SCENIC', 'FOOD', 'HOTEL', 'OTHER'),
  date DATE NOT NULL,
  notes TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  checkin_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  data MEDIUMTEXT NOT NULL,
  thumbnail MEDIUMTEXT NOT NULL,
  original_name VARCHAR(255),
  taken_at DATETIME,
  caption TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trips (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE,
  cover_photo MEDIUMTEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trip_cities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trip_id BIGINT NOT NULL,
  city_code VARCHAR(20) NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE KEY uk_trip_city (trip_id, city_code)
);

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  ai_api_key VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_settings (user_id)
);

INSERT IGNORE INTO provinces (code, name) VALUES
('110000', '北京市'),
('120000', '天津市'),
('130000', '河北省'),
('140000', '山西省'),
('150000', '内蒙古自治区'),
('210000', '辽宁省'),
('220000', '吉林省'),
('230000', '黑龙江省'),
('310000', '上海市'),
('320000', '江苏省'),
('330000', '浙江省'),
('340000', '安徽省'),
('350000', '福建省'),
('360000', '江西省'),
('370000', '山东省'),
('410000', '河南省'),
('420000', '湖北省'),
('430000', '湖南省'),
('440000', '广东省'),
('450000', '广西壮族自治区'),
('460000', '海南省'),
('500000', '重庆市'),
('510000', '四川省'),
('520000', '贵州省'),
('530000', '云南省'),
('540000', '西藏自治区'),
('610000', '陕西省'),
('620000', '甘肃省'),
('630000', '青海省'),
('640000', '宁夏回族自治区'),
('650000', '新疆维吾尔自治区'),
('710000', '台湾省'),
('810000', '香港特别行政区'),
('820000', '澳门特别行政区');
