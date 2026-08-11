/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.7-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: restoapp
-- ------------------------------------------------------
-- Server version	11.4.7-MariaDB-0ubuntu0.25.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `access_permissions`
--

DROP TABLE IF EXISTS `access_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_permissions` (
  `id` varchar(191) NOT NULL,
  `accessRoleId` varchar(191) NOT NULL,
  `page` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_permissions_accessRoleId_page_key` (`accessRoleId`,`page`),
  CONSTRAINT `access_permissions_accessRoleId_fkey` FOREIGN KEY (`accessRoleId`) REFERENCES `access_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_permissions`
--

LOCK TABLES `access_permissions` WRITE;
/*!40000 ALTER TABLE `access_permissions` DISABLE KEYS */;
INSERT INTO `access_permissions` VALUES
('cmp5cdy630006y6rpbcsi6e1b','cmp4kj7oi000114hni4m9jfpy','charges'),
('cmp5cdy630007y6rph9wrpg34','cmp4kj7oi000114hni4m9jfpy','dashboard'),
('cmp5cdy630008y6rp9ggctmca','cmp4kj7oi000114hni4m9jfpy','employees'),
('cmp5cdy630009y6rpijf2lhf8','cmp4kj7oi000114hni4m9jfpy','invoices'),
('cmp5cdy63000ay6rpbt6li18o','cmp4kj7oi000114hni4m9jfpy','loyalty'),
('cmp5cdy63000by6rplzrlsj0c','cmp4kj7oi000114hni4m9jfpy','menu'),
('cmp5cdy63000cy6rp42z79xnv','cmp4kj7oi000114hni4m9jfpy','orders'),
('cmp5cdy63000dy6rp2cyomgz3','cmp4kj7oi000114hni4m9jfpy','partners'),
('cmp5cdy63000ey6rpia9nv1q6','cmp4kj7oi000114hni4m9jfpy','report'),
('cmp5cdy63000fy6rpjoqfdse3','cmp4kj7oi000114hni4m9jfpy','sales'),
('cmp5cdy63000gy6rp8q0r31tn','cmp4kj7oi000114hni4m9jfpy','sales/products'),
('cmp5cdy63000iy6rp58qyy8xy','cmp4kj7oi000114hni4m9jfpy','stock'),
('cmp5cdy63000hy6rpvlmfsqgq','cmp4kj7oi000114hni4m9jfpy','suppliers'),
('cmp5apbyt000rez8lm2o59wci','cmp4l70v60001s1m5wlkzglsr','dashboard'),
('cmp5apbyt000sez8lf2kbuxon','cmp4l70v60001s1m5wlkzglsr','employees'),
('cmp5apbyt000tez8liul04wlq','cmp4l70v60001s1m5wlkzglsr','loyalty'),
('cmp5apbyt000uez8lh8814f3a','cmp4l70v60001s1m5wlkzglsr','orders'),
('cmp5apbyt000vez8lua58dl8s','cmp4l70v60001s1m5wlkzglsr','report'),
('cmp5apbyt000wez8l0xdelpoi','cmp4l70v60001s1m5wlkzglsr','sales'),
('cmp5apbyt000xez8lif30pk2q','cmp4l70v60001s1m5wlkzglsr','sales/products'),
('cmpzmtyq200l8ej60uk6qabm4','cmpzmsgcg00kwej60lnr55dpn','dashboard'),
('cmpzmtyq200l7ej60t52siy7e','cmpzmsgcg00kwej60lnr55dpn','loyalty'),
('cmpzmtyq200l6ej60ujn25yx0','cmpzmsgcg00kwej60lnr55dpn','orders');
/*!40000 ALTER TABLE `access_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_roles`
--

DROP TABLE IF EXISTS `access_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_roles` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `access_roles_restaurantId_idx` (`restaurantId`),
  CONSTRAINT `access_roles_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_roles`
--

LOCK TABLES `access_roles` WRITE;
/*!40000 ALTER TABLE `access_roles` DISABLE KEYS */;
INSERT INTO `access_roles` VALUES
('cmp4kj7oi000114hni4m9jfpy','staff','cmp2erbrv0000djlqauuj4q8g','2026-05-13 21:25:21.955'),
('cmp4l70v60001s1m5wlkzglsr','elvira','cmp2erbrv0000djlqauuj4q8g','2026-05-13 21:43:52.866'),
('cmpzmsgcg00kwej60lnr55dpn','Personnel','cmp2erbrv0000djlqauuj4q8g','2026-06-04 15:09:23.775');
/*!40000 ALTER TABLE `access_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  KEY `accounts_userId_fkey` (`userId`),
  CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `userEmail` varchar(191) DEFAULT NULL,
  `restaurantId` varchar(191) DEFAULT NULL,
  `ip` varchar(191) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_action_idx` (`action`),
  KEY `audit_logs_restaurantId_idx` (`restaurantId`),
  KEY `audit_logs_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES
('cmp42i5h80000udrt2ut2sf6c','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 13:00:39.356'),
('cmp42ocxk000013nht21vueuw','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 13:05:28.952'),
('cmp42onfd000113nhuyebmdvk','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 13:05:42.554'),
('cmp42p7qy000213nho72g8gbi','LOGOUT','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 13:06:08.891'),
('cmp43w8sk000010b3zgvft6y4','ADMIN_LOGIN_SUCCESS','superadmin-1','admin@admin.com',NULL,'83.195.242.233',NULL,'2026-05-13 13:39:36.453'),
('cmp49cwhs0000sjaholuhs23h','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 16:12:31.744'),
('cmp4gcv4l0001sjahfa01oubc','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 19:28:27.285'),
('cmp4gga9y0002sjahpt3jeye4','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 19:31:06.884'),
('cmp4gghap0003sjahkvlq7h42','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 19:31:15.985'),
('cmp4gl6w70004sjahyzdarakn','LOGIN_FAILED',NULL,'moddeurgtav@outlook.fr',NULL,'unknown',NULL,'2026-05-13 19:34:55.783'),
('cmp4goprt0005sjah0iq1o3jj','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":1}','2026-05-13 19:37:40.217'),
('cmp4gp4z60006sjahfol92cgi','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":2}','2026-05-13 19:37:59.922'),
('cmp4gp8zf0007sjaht3x4eh4u','PASSWORD_CHANGED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77',NULL,'2026-05-13 19:38:05.115'),
('cmp4gpc870008sjah2bkdxj9h','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":3}','2026-05-13 19:38:09.320'),
('cmp4gpeyt0009sjahmtrn2p0t','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":4}','2026-05-13 19:38:12.869'),
('cmp4gr4bi000asjahazgwbzkw','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2lx8gb0015los96kyr84e9\"}','2026-05-13 19:39:32.382'),
('cmp4grffp000bsjahbyeu20o5','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 19:39:46.790'),
('cmp4h12b9000gsjahvx9zry46','EMPLOYEE_CREATED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"employeeEmail\":\"ruby.lopez@coffeenoir.com\",\"employeeName\":\"Ruby Lopez\"}','2026-05-13 19:47:16.342'),
('cmp4h372x000hsjah816mih5u','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2m0neo001hlos9nswt1nay\"}','2026-05-13 19:48:55.833'),
('cmp4h3f4c000isjahlipz0lh2','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2m1lcl001llos93d2mcaeq\"}','2026-05-13 19:49:06.252'),
('cmp4h3lh2000jsjahyr1wg46p','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2m3cdb001plos9ht8xapij\"}','2026-05-13 19:49:14.486'),
('cmp4h3qep000ksjah0e1nxl9l','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2lyns60019los95t0y0izb\"}','2026-05-13 19:49:20.882'),
('cmp4h3uiy000lsjahcjpib65j','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp4h12aw000fsjah9sdns45m\"}','2026-05-13 19:49:26.218'),
('cmp4h3y2c000msjahq0uqrkuj','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2lzsy9001dlos9i83vkhxu\"}','2026-05-13 19:49:30.805'),
('cmp4hjvgu000vsjahd76u3qw5','LOGIN_FAILED',NULL,'vittoria.fonelli@coffeenoir.com',NULL,'unknown','{\"attempts\":1}','2026-05-13 20:01:53.934'),
('cmp4hkiys000wsjahtyuh2doz','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2p4siw001rlos9hnpqqk1j\"}','2026-05-13 20:02:24.388'),
('cmp4hkplq000xsjahra0rt3cp','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 20:02:32.990'),
('cmp4hu0ut0012sjahj8g8uo19','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 20:09:47.478'),
('cmp4i79ka0000be9xhl5qutg9','LOGIN_FAILED',NULL,'vittoria.fonelli@coffeenoir.com',NULL,'unknown','{\"attempts\":1}','2026-05-13 20:20:05.290'),
('cmp4i7dg40001be9xqq78rp2p','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 20:20:10.325'),
('cmp4ikcvp0006be9xqxl6vxoy','EMPLOYEE_CREATED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','78.127.132.121','{\"employeeEmail\":\"hiori@coffeenoir.com\",\"employeeName\":\"Hiori Hiori\"}','2026-05-13 20:30:16.117'),
('cmp4ikn3x0007be9xx1hhj8vt','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 20:30:29.374'),
('cmp4ikt550008be9x8q8ln4dy','LOGIN_SUCCESS','cmp4ikcvf0003be9x21e0loks','hiori@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 20:30:37.194'),
('cmp4ilqks0009be9xz9t63w5d','LOGOUT','cmp4ikcvf0003be9x21e0loks','hiori@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 20:31:20.524'),
('cmp4ilwu3000abe9xn0oy3hnw','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 20:31:28.636'),
('cmp4infgj0000tkaq3rql35px','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 20:32:39.427'),
('cmp4it9kz0000xfzrzhmewde0','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 20:37:11.748'),
('cmp4iy79a0000mbwn9w00l9u1','ADMIN_LOGIN_SUCCESS','superadmin-1','admin@admin.com',NULL,'78.127.132.121',NULL,'2026-05-13 20:41:02.014'),
('cmp4j0iy10001mbwnk0sfc521','EMPLOYEE_DELETED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','78.127.132.121','{\"employeeId\":\"cmp4ikcvg0005be9xr47nvlk3\"}','2026-05-13 20:42:50.473'),
('cmp4juaj70006u4kqrg8wdn0l','EMPLOYEE_CREATED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','78.127.132.121','{\"employeeEmail\":\"test.test@coffeenoir.com\",\"employeeName\":\"test test\"}','2026-05-13 21:05:59.251'),
('cmp4jurjd0007u4kqj2mqoznp','LOGIN_SUCCESS','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 21:06:21.289'),
('cmp4kjks2000f14hn6u4zki9m','LOGOUT','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-13 21:25:38.931'),
('cmp4kk3hm000g14hn90jwapzk','LOGIN_SUCCESS','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 21:26:03.178'),
('cmp4lc1lk000as1m5wlv4u0ie','LOGIN_SUCCESS','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-13 21:47:47.096'),
('cmp4mlbt30007s8a0f8dknyio','RESTAURANT_CREATED',NULL,NULL,NULL,'78.127.132.121','{\"restaurantId\":\"cmp4mlbsn0000s8a07tg6e4gn\",\"restaurantName\":\"hiori\",\"ownerEmail\":\"hiori@hiori.com\"}','2026-05-13 22:22:59.847'),
('cmp4mlziq0008s8a01v3aswvk','LOGIN_SUCCESS','cmp4mlbsx0006s8a01kpz7ez2','hiori@hiori.com','cmp4mlbsn0000s8a07tg6e4gn','unknown',NULL,'2026-05-13 22:23:30.578'),
('cmp58fiai00008y7morazozur','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-14 08:34:19.866'),
('cmp59t0n90000ro6yftn7x6bm','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-14 09:12:49.797'),
('cmp5cbr040000y6rpjogoruc5','ADMIN_LOGIN_SUCCESS','superadmin-1','admin@admin.com',NULL,'78.127.132.121',NULL,'2026-05-14 10:23:22.996'),
('cmp5cd32q0001y6rpu29zi2n7','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":1}','2026-05-14 10:24:25.299'),
('cmp5cd4fk0002y6rpcth2uoqw','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":2}','2026-05-14 10:24:27.056'),
('cmp5cd9m60003y6rphxmjr6en','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":3}','2026-05-14 10:24:33.775'),
('cmp5cdm430004y6rp40yy0mca','LOGIN_SUCCESS','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-14 10:24:49.972'),
('cmp5cl4f70000ciepk0bgl3fv','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-14 10:30:40.291'),
('cmp5h65rw0001ciep48pfho4z','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-14 12:39:00.284'),
('cmpa7abu30002ciep8wvpjqzn','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-17 20:01:09.484'),
('cmpac7qrc0003ciep07p0ypa0','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-17 22:19:06.936'),
('cmpacd1kt0004ciep48eidfvf','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2lyns60019los95t0y0izb\"}','2026-05-17 22:23:14.237'),
('cmpach4p10005ciepk2xll7e1','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2m1lcl001llos93d2mcaeq\"}','2026-05-17 22:26:24.901'),
('cmpacqjfq0006ciep8137nigz','EMPLOYEE_DELETED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"employeeId\":\"cmp4h12aw000fsjah9sdns45m\"}','2026-05-17 22:33:43.910'),
('cmpacryzd0007ciepuj9ud1n5','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2lzsy9001dlos9i83vkhxu\"}','2026-05-17 22:34:50.713'),
('cmpad53tp0008cieppqes6mch','LOGIN_FAILED',NULL,'mathieu.puren7993@gmail.com',NULL,'unknown',NULL,'2026-05-17 22:45:03.517'),
('cmpad5bqk0009ciepz963mlck','LOGIN_FAILED',NULL,'needansle93@gmail.com',NULL,'unknown',NULL,'2026-05-17 22:45:13.772'),
('cmpad86ao000aciepo83jyxcq','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2m3cdb001plos9ht8xapij\"}','2026-05-17 22:47:26.688'),
('cmpad9lz6000bciepp48xfkgg','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2m0neo001hlos9nswt1nay\"}','2026-05-17 22:48:33.666'),
('cmpadbrbd000cciepnzsbute7','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-17 22:50:13.897'),
('cmpadbruz000dciepl4nwmaoc','LOGIN_SUCCESS','cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-17 22:50:14.603'),
('cmpaderxq000ecieponqyzhyl','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-17 22:52:34.670'),
('cmpajmuq70000ydh90y7ju0v1','LOGOUT','cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-18 01:46:49.227'),
('cmpajn8l00001ydh9aszz34ey','LOGIN_SUCCESS','cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 01:47:07.188'),
('cmpb2yqem0002ydh9komycco4','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 10:47:56.206'),
('cmpb62gh80003ydh9npyplpbs','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 12:14:48.812'),
('cmpb62qop0004ydh9p2rcuvoo','PASSWORD_RESET','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"targetEmployeeId\":\"cmp2m3cdb001plos9ht8xapij\"}','2026-05-18 12:15:02.041'),
('cmpb80bi3001lydh92srrzytl','LOGIN_FAILED',NULL,'elvira.holm@coffeenoir.com',NULL,'unknown','{\"attempts\":1}','2026-05-18 13:09:08.283'),
('cmpb80iix001mydh9dq62eshl','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 13:09:17.386'),
('cmpba7bw9001nydh9f0uvnyj4','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 14:10:34.617'),
('cmpbgubqn001oydh9vik74d7t','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 17:16:25.199'),
('cmpbh9kei001pydh90x2xm0us','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 17:28:16.267'),
('cmpbja7oq001vydh9p41548kd','LOGIN_SUCCESS','cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 18:24:45.675'),
('cmpbml91n003hydh9jzdxk7di','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 19:57:19.499'),
('cmpbpieb8003oydh9jk4ttw4v','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-18 21:19:05.204'),
('cmpcabcgk003pydh9jy55vf1u','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 07:01:28.148'),
('cmpcix5dm003qydh9bztiv82o','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 11:02:22.330'),
('cmpcob80a003rydh9qf172r7r','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 13:33:17.002'),
('cmpcuwksn003sydh9iz3m9t96','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 16:37:51.048'),
('cmpcwjwi8003yydh9u4s4xepi','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 17:23:58.928'),
('cmpd4svxn005kydh953pbeaem','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 21:14:55.020'),
('cmpd5hfgd005lydh9jd34xaxi','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 21:34:00.062'),
('cmpd68oqy005mydh965vhsujz','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 21:55:11.818'),
('cmpd6oh7x00082guiv156szbe','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 22:07:28.557'),
('cmpd7u88700007xnn6wu242kt','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-19 22:39:56.455'),
('cmpd7ugtg00017xnnyy1biyku','LOGIN_SUCCESS','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 22:40:07.589'),
('cmpd7w5lo00027xnn82r5iyqw','LOGOUT','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-19 22:41:26.364'),
('cmpd9brqn00037xnnj4r5v7j5','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-19 23:21:34.512'),
('cmpdsaecs00047xnn8t9rrtdo','LOGIN_SUCCESS','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 08:12:23.212'),
('cmpdsaq4w00057xnnplyvbpsr','LOGOUT','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-05-20 08:12:38.480'),
('cmpdsaxer00067xnnx7qqimz9','LOGIN_FAILED',NULL,'vittoria.fonelli@coffeenoir.com',NULL,'unknown','{\"attempts\":1}','2026-05-20 08:12:47.908'),
('cmpdsb1zr00077xnnhw2k9gpe','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 08:12:53.847'),
('cmpe0memk00087xnn3zbnv8bq','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 12:05:40.365'),
('cmpe609r300097xnn3a9b2726','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 14:36:25.311'),
('cmpe6afx7000j7xnnolapu92w','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 14:44:19.867'),
('cmpeg8w02001k7xnnzgpvwek1','LOGIN_SUCCESS','cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 19:23:03.554'),
('cmpegv6di001u7xnnywtya7t8','LOGIN_SUCCESS','cmp2m1lck001jlos9xgsarxxa','darius.maddox@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 19:40:23.430'),
('cmpehdood001z7xnnu2qi2mfj','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 19:54:46.957'),
('cmpekss83002s7xnnwip8buhv','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 21:30:30.243'),
('cmpeobbc3002t7xnniy179zkt','LOGIN_SUCCESS','cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 23:08:53.667'),
('cmpeocado002u7xnn8ldg55fz','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-20 23:09:39.085'),
('cmpfrwv2s003g7xnnr5y4pv9o','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-21 17:37:24.052'),
('cmpfwz136000079qzdflv42fs','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-21 19:59:03.235'),
('cmpfxq5yn0000sguk3944caic','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-21 20:20:09.263'),
('cmph2smdz000010yz4d4a92ii','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-22 15:29:48.120'),
('cmpha2tnd000r10yzalr68pbi','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-22 18:53:41.402'),
('cmpieq0pu000x10yzrmx99u0p','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-23 13:51:28.290'),
('cmpiktyt9000y10yz6py6ufnu','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-23 16:42:30.141'),
('cmpil49zh000z10yzl3q4iv5r','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-23 16:50:31.182'),
('cmpiof00p001010yzao6e3xtc','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-23 18:22:50.330'),
('cmpiqhzyk002210yzxwmb9v07','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-23 19:21:09.452'),
('cmpixxs0v002a10yz0xcoyiu9','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-23 22:49:22.975'),
('cmpjx2sqn002r10yznkofmskz','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-24 15:13:03.743'),
('cmpk1vsec002s10yz3zqqsrag','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-24 17:27:34.788'),
('cmpkhbt1f003o10yzfslt5p43','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 00:39:56.356'),
('cmpl8ptzi004b10yzt3lb1abt','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 13:26:40.399'),
('cmplc1idm004k10yzfockxybr','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 14:59:44.074'),
('cmplc21an004l10yzd8yz776z','LOGIN_SUCCESS','cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 15:00:08.591'),
('cmplicc9r005610yzn9n41dni','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 17:56:07.072'),
('cmplolwz1005j10yz71d9ecxb','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 20:51:31.501'),
('cmplton4k006510yznwgf2ry1','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 23:13:36.788'),
('cmplubcsq006b10yzsz3nau0q','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-25 23:31:16.490'),
('cmpmhujg2006c10yzrupaabxu','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-26 10:30:02.739'),
('cmpmjdgii007f10yzmaiss1rk','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-26 11:12:45.019'),
('cmpml7lwx0000klyuuqxtxqaa','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-26 12:04:11.314'),
('cmpmleb5f0007klyuvbrauwyb','ORDER_DELETED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','185.13.180.48','{\"orderId\":\"cmpmlds500002klyuw4i7j9yw\",\"total\":80000}','2026-05-26 12:09:23.955'),
('cmpmlp3jc0006ej60bx2hhhfw','ORDER_DELETED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','185.13.180.48','{\"orderId\":\"cmpmloj1z0001ej60vpt60epv\",\"total\":80000}','2026-05-26 12:17:47.304'),
('cmpmlxtg30007ej60re6hud9m','ORDER_DELETED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"orderId\":\"cmpmi0cbx006e10yzlk9s2jzx\",\"total\":34900}','2026-05-26 12:24:34.131'),
('cmpmu2ogv0008ej600e5bof37','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-26 16:12:17.887'),
('cmpmuy86e0009ej60vw8cqa3o','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-26 16:36:49.766'),
('cmpn075g90029ej603zuyb3a4','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-26 19:03:44.217'),
('cmpn3eezz0042ej60bte118cr','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-26 20:33:22.031'),
('cmpoetsdj0043ej60ikycr6d2','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-27 18:41:01.160'),
('cmpp5cqoz005hej60lrju8xqd','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-28 07:03:35.459'),
('cmppelz2q005iej60md4hd6yq','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-28 11:22:42.770'),
('cmppsklnm005lej60zy68pd8x','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-28 17:53:33.346'),
('cmppvwtoi005yej6020lyq8r0','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-28 19:27:02.467'),
('cmpqkng4j00a9ej60upt0aq9r','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-29 06:59:35.395'),
('cmpr0rji200aaej60883ccnwt','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-29 14:30:40.250'),
('cmprd4r0000abej60a96ywi5j','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-29 20:16:51.888'),
('cmprd6qcc00acej60noeh5unw','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-29 20:18:24.349'),
('cmpsenm1200amej60q1botr2q','LOGIN_SUCCESS','cmp4mlbsx0006s8a01kpz7ez2','hiori@hiori.com','cmp4mlbsn0000s8a07tg6e4gn','unknown',NULL,'2026-05-30 13:47:17.702'),
('cmpseoylp00anej60lixncr4a','LOGOUT','cmp4mlbsx0006s8a01kpz7ez2','hiori@hiori.com','cmp4mlbsn0000s8a07tg6e4gn',NULL,NULL,'2026-05-30 13:48:20.652'),
('cmpsep2sj00aoej604l7th53u','LOGIN_SUCCESS','cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-30 13:48:26.083'),
('cmpsqgm1v00apej60vhut1j1a','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-30 19:17:46.531'),
('cmpu2qvq200aqej60av5afhfn','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-31 17:49:27.194'),
('cmpu5pyfx00arej60txuj418h','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-31 19:12:42.910'),
('cmpu8gtsx00bkej60nbw4j1j0','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-05-31 20:29:35.841'),
('cmpve337e00d5ej60igmdl6u1','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-01 15:54:38.714'),
('cmpvhmv7t00ekej604g3awyiw','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-01 17:34:00.329'),
('cmpvjtszf00f9ej60lax6lyoz','EMPLOYEE_CREATED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"employeeEmail\":\"jack.brown@coffeenoir.com\",\"employeeName\":\"Jack Brown\"}','2026-06-01 18:35:23.259'),
('cmpvjujtd00feej60frilpllt','EMPLOYEE_CREATED','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','82.65.102.77','{\"employeeEmail\":\"travis.brooks@coffeenoir.com\",\"employeeName\":\"Travis Brooks Moon\"}','2026-06-01 18:35:58.034'),
('cmpvkmxpd00ffej605c3ego8h','LOGIN_SUCCESS','cmpvjtsz300f6ej60yude90m0','jack.brown@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-01 18:58:02.402'),
('cmpwy65dw00hbej60co9elir1','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-02 18:04:40.004'),
('cmpx4393d00j5ej603pmhzg4j','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-02 20:50:22.537'),
('cmpy8wuk500j6ej600o2d02oa','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-03 15:53:08.022'),
('cmpyfsnab00j7ej605jd7qxpu','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-03 19:05:49.283'),
('cmpynf1hv00ktej60v3q3d3q2','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-03 22:39:11.443'),
('cmpzmrgwr00kuej602o8h57pp','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:08:37.851'),
('cmpzmxf4m00l9ej60w7vu5bnm','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-04 15:13:15.478'),
('cmpzmxvhv00laej60bswnolly','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:13:36.692'),
('cmpzmxzgj00lbej603sn2so8a','LOGOUT','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-04 15:13:41.828'),
('cmpzmy1f700lcej60jl8hfazu','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:13:44.372'),
('cmpzmysol00ldej60kmx5xfz7','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-04 15:14:19.702'),
('cmpzmz47z00leej60hzwzy8s5','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:14:34.656'),
('cmpzn01pg00lfej60zdmpcl27','LOGOUT','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-04 15:15:18.051'),
('cmpzn0cfg00lgej60yu6oolb1','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:15:31.948'),
('cmpzn0dhf00lhej60ayzdyamz','LOGOUT','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-04 15:15:33.316'),
('cmpzn0f1w00liej608r8waysa','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:15:35.349'),
('cmpzn16bq00ljej60q92zlu5d','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-04 15:16:10.693'),
('cmpzn1gwi00lkej60jyl17q8a','LOGIN_SUCCESS','cmpvjtsz300f6ej60yude90m0','jack.brown@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:16:24.402'),
('cmpzn28y500llej60oaetscem','LOGOUT','cmpvjtsz300f6ej60yude90m0','jack.brown@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-04 15:17:00.749'),
('cmpzn2a7300lmej60z0ziun12','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 15:17:02.367'),
('cmpzsd4bn00lnej60wgoskeyu','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 17:45:26.051'),
('cmpzu0oed00ltej6099v6jz8o','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-04 18:31:44.774'),
('cmq2m9mrz00mwej6049ftxyme','LOGIN_SUCCESS','cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-06 17:18:04.175'),
('cmq2xmceo00mxej60xeh0upf2','LOGIN_SUCCESS','cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-06 22:35:53.040'),
('cmq3ts7cz00n9ej60mrdexs86','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-07 13:36:14.148'),
('cmq3tto0k00naej60rktmud8b','LOGOUT','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g',NULL,NULL,'2026-06-07 13:37:22.388'),
('cmq47jvvy00nbej60pb8e85j8','LOGIN_SUCCESS','cmpvjtsz300f6ej60yude90m0','jack.brown@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-07 20:01:40.654'),
('cmq55sgv600ncej60afsvahqy','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-08 12:00:08.034'),
('cmq55yg2r00ndej60lt7in92q','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-08 12:04:46.947'),
('cmq5cgp2900neej60yp0dahkv','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-08 15:06:56.097'),
('cmq5d6yzn00nfej60n1w92jvu','LOGIN_SUCCESS','cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-08 15:27:22.019'),
('cmq5kx16u00oaej60pm1v8753','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-08 19:03:35.238'),
('cmq5ndb7j00obej607qp4t84q','LOGIN_SUCCESS','cmpvjtsz300f6ej60yude90m0','jack.brown@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-08 20:12:13.951'),
('cmq5o6vwb00ohej602irl1tmh','LOGIN_SUCCESS','cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','cmp2erbrv0000djlqauuj4q8g','unknown',NULL,'2026-06-08 20:35:13.787');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charges`
--

DROP TABLE IF EXISTS `charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `charges` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `type` enum('DEDUCTIBLE','NON_DEDUCTIBLE') NOT NULL DEFAULT 'DEDUCTIBLE',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `weekNumber` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `charges_restaurantId_fkey` (`restaurantId`),
  CONSTRAINT `charges_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charges`
--

LOCK TABLES `charges` WRITE;
/*!40000 ALTER TABLE `charges` DISABLE KEYS */;
INSERT INTO `charges` VALUES
('cmpmjtevd007h10yzr9d3glpz','cmp2erbrv0000djlqauuj4q8g','Boucherie',7500,'DEDUCTIBLE',1,22,2026,'2026-05-26 11:25:09.384',NULL),
('cmpmjtqac007j10yz7bwr73h3','cmp2erbrv0000djlqauuj4q8g','Vignerons',7500,'DEDUCTIBLE',1,22,2026,'2026-05-26 11:25:24.180',NULL),
('cmpvfdkpt00ejej60y60g87t7','cmp2erbrv0000djlqauuj4q8g','Hippie Légumes',37350,'DEDUCTIBLE',1,23,2026,'2026-06-01 16:30:47.580',NULL);
/*!40000 ALTER TABLE `charges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `gradeId` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `accountNumber` varchar(191) DEFAULT NULL,
  `hiredAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employees_userId_key` (`userId`),
  KEY `employees_restaurantId_fkey` (`restaurantId`),
  KEY `employees_gradeId_fkey` (`gradeId`),
  CONSTRAINT `employees_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `grades` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `employees_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES
('cmp2lx8gb0015los96kyr84e9','cmp2lx8ga0013los9xin3vj18','cmp2erbrv0000djlqauuj4q8g','cmp2lm7hu0001los9hmll8muq','Elvira','Holm','555-00071','29150','2026-05-12 12:28:43.402',1,'2026-05-12 12:28:43.402','2026-05-13 19:41:12.525'),
('cmp2lyns60019los95t0y0izb','cmp2lyns60017los9kziplujf','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0003djlquit50qql','Lexa ','Hardy','555-46610','67078','2026-05-12 12:29:49.926',1,'2026-05-12 12:29:49.926','2026-05-13 19:41:37.215'),
('cmp2lzsy9001dlos9i83vkhxu','cmp2lzsy9001blos9xx7k6653','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0004djlqwtxh1gxi','Saber ','Rahmani','0000000000','68961','2026-05-12 12:30:43.281',0,'2026-05-12 12:30:43.281','2026-06-08 16:16:47.253'),
('cmp2m0neo001hlos9nswt1nay','cmp2m0neo001flos9kof65u1f','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0003djlquit50qql','Amir ','Rosa','555-98579','68960','2026-05-12 12:31:22.752',1,'2026-05-12 12:31:22.752','2026-06-08 16:16:22.324'),
('cmp2m1lcl001llos93d2mcaeq','cmp2m1lck001jlos9xgsarxxa','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0004djlqwtxh1gxi','Darius ','Maddox','555-352525','69324','2026-05-12 12:32:06.740',0,'2026-05-12 12:32:06.740','2026-06-08 16:17:02.564'),
('cmp2m3cdb001plos9ht8xapij','cmp2m3cdb001nlos9pvlyhqlx','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0002djlq2eek1o1y','Johnny','Dodge','555-46972','49314','2026-05-12 12:33:28.415',1,'2026-05-12 12:33:28.415','2026-05-13 19:42:18.758'),
('cmp2p4siw001rlos9hnpqqk1j','cmp2erbs90006djlq07rdiw3h','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0001djlqdprfz5b4','Vittoria','Fonelli','555-43290','40367','2026-05-12 13:58:34.856',1,'2026-05-12 13:58:34.856','2026-05-13 19:38:34.091'),
('cmp4juaix0005u4kqdpm8k0ej','cmp4juaix0003u4kqpb6mkhnc','cmp2erbrv0000djlqauuj4q8g','cmp4jsf4u0001u4kqy945jm6p','test','test','00000000000000','00000000000000000','2026-05-13 21:05:59.241',1,'2026-05-13 21:05:59.241','2026-05-13 21:05:59.241'),
('cmpvjtsz300f8ej60uxzbroxx','cmpvjtsz300f6ej60yude90m0','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0004djlqwtxh1gxi','Jack','Brown','555-246819','71037','2026-06-01 18:35:23.247',1,'2026-06-01 18:35:23.247','2026-06-01 19:01:30.747'),
('cmpvjujt600fdej60546lnbhg','cmpvjujt600fbej60tk3fyzl5','cmp2erbrv0000djlqauuj4q8g','cmp2erbrv0004djlqwtxh1gxi','Travis','Brooks Moon','555-229421','72180','2026-06-01 18:35:58.026',1,'2026-06-01 18:35:58.026','2026-06-01 18:35:58.026');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `salaryPercent` double NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `dividendPercent` double NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `grades_restaurantId_fkey` (`restaurantId`),
  CONSTRAINT `grades_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES
('cmp2erbrv0001djlqdprfz5b4','Patron(ne)',70,'cmp2erbrv0000djlqauuj4q8g','2026-05-12 09:08:10.460',50),
('cmp2erbrv0002djlq2eek1o1y','Manager',65,'cmp2erbrv0000djlqauuj4q8g','2026-05-12 09:08:10.460',0),
('cmp2erbrv0003djlquit50qql','Employé CDI',60,'cmp2erbrv0000djlqauuj4q8g','2026-05-12 09:08:10.460',0),
('cmp2erbrv0004djlqwtxh1gxi','Employé CDD',50,'cmp2erbrv0000djlqauuj4q8g','2026-05-12 09:08:10.460',0),
('cmp2lm7hu0001los9hmll8muq','Co-Patron(ne)',70,'cmp2erbrv0000djlqauuj4q8g','2026-05-12 12:20:08.940',50),
('cmp4jsf4u0001u4kqy945jm6p','staff',0,'cmp2erbrv0000djlqauuj4q8g','2026-05-13 21:04:31.903',0),
('cmp4mlbsn0001s8a0hetp05ie','Patron(ne)',70,'cmp4mlbsn0000s8a07tg6e4gn','2026-05-13 22:22:59.831',0),
('cmp4mlbsn0002s8a0s0ui0ze9','Manager',65,'cmp4mlbsn0000s8a07tg6e4gn','2026-05-13 22:22:59.831',0),
('cmp4mlbsn0003s8a0xxk17vd3','Employé CDI',65,'cmp4mlbsn0000s8a07tg6e4gn','2026-05-13 22:22:59.831',0),
('cmp4mlbsn0004s8a0jtgp4wwb','Employé CDD',50,'cmp4mlbsn0000s8a07tg6e4gn','2026-05-13 22:22:59.831',0);
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `quantity` double NOT NULL DEFAULT 0,
  `minQuantity` double NOT NULL DEFAULT 0,
  `imageUrl` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingredients_restaurantId_idx` (`restaurantId`),
  CONSTRAINT `ingredients_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredients`
--

LOCK TABLES `ingredients` WRITE;
/*!40000 ALTER TABLE `ingredients` DISABLE KEYS */;
INSERT INTO `ingredients` VALUES
('cmpb6ff3b0006ydh94quk719l','cmp2erbrv0000djlqauuj4q8g','Grain de café',510,400,'https://imgg.fr/r/kX05XFai.png','2026-05-18 12:24:53.538','2026-06-08 17:11:33.934'),
('cmpb6g69k0008ydh9q6tgwbba','cmp2erbrv0000djlqauuj4q8g','Lait',666,400,'https://imgg.fr/r/HLJgFZte.png','2026-05-18 12:25:28.760','2026-06-08 17:11:33.934'),
('cmpb6gyz6000aydh9w45e2n5r','cmp2erbrv0000djlqauuj4q8g','Assortiment de fruits',498,400,'https://imgg.fr/r/Gt6x26EX.png','2026-05-18 12:26:05.969','2026-06-08 17:11:33.934'),
('cmpb6hzpe000cydh979581wz9','cmp2erbrv0000djlqauuj4q8g','Farine',215,200,'https://imgg.fr/r/1GowXwhC.png','2026-05-18 12:26:53.569','2026-06-08 20:17:44.240'),
('cmpb6im3s000eydh99sg0a0z3','cmp2erbrv0000djlqauuj4q8g','Sucre',229,200,'https://imgg.fr/r/V5cWfKrF.png','2026-05-18 12:27:22.600','2026-06-08 20:17:44.240'),
('cmpb6jj72000gydh9l6ldkz2k','cmp2erbrv0000djlqauuj4q8g','Pain',589,400,'https://imgg.fr/r/Xr8sxSdY.png','2026-05-18 12:28:05.485','2026-06-08 17:11:33.935'),
('cmpb6k7fz000iydh9kkf3ylyj','cmp2erbrv0000djlqauuj4q8g','Oeufs',461,300,'https://imgg.fr/r/bZvEQLW1.png','2026-05-18 12:28:36.909','2026-06-08 17:11:33.934'),
('cmpb6l61m000kydh9qnn9jz8a','cmp2erbrv0000djlqauuj4q8g','Fromage',442,400,'https://imgg.fr/r/JbYWbuPw.png','2026-05-18 12:29:21.754','2026-06-08 17:11:33.934'),
('cmpb6lz6h000mydh94k6dkhu6','cmp2erbrv0000djlqauuj4q8g','Boeuf',570,300,'https://imgg.fr/r/4zSJcAz0.png','2026-05-18 12:29:59.509','2026-06-08 17:11:33.934'),
('cmpb6mlul000oydh9pr8hekl0','cmp2erbrv0000djlqauuj4q8g','Assortiment de légumes',305,200,'https://imgg.fr/r/7sfC3gNx.png','2026-05-18 12:30:28.892','2026-06-08 17:11:33.935'),
('cmpb6npg6000qydh917rybqp7','cmp2erbrv0000djlqauuj4q8g','Assortiment d\'alcools',602,200,'https://imgg.fr/r/uiO3szoj.png','2026-05-18 12:31:20.213','2026-05-18 12:31:37.474');
/*!40000 ALTER TABLE `ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `amount` double NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `status` enum('PENDING','PAID','OVERDUE') NOT NULL DEFAULT 'PENDING',
  `note` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoices_restaurantId_fkey` (`restaurantId`),
  KEY `invoices_supplierId_fkey` (`supplierId`),
  CONSTRAINT `invoices_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invoices_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_cards`
--

DROP TABLE IF EXISTS `loyalty_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_cards` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `discountPercent` double NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `loyalty_cards_restaurantId_fkey` (`restaurantId`),
  CONSTRAINT `loyalty_cards_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_cards`
--

LOCK TABLES `loyalty_cards` WRITE;
/*!40000 ALTER TABLE `loyalty_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `price` double NOT NULL,
  `costPrice` double NOT NULL DEFAULT 0,
  `imageUrl` text DEFAULT NULL,
  `category` varchar(191) NOT NULL,
  `isAvailable` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_restaurantId_fkey` (`restaurantId`),
  CONSTRAINT `menu_items_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES
('cmp2lnbii0003los9oebdz6fs','cmp2erbrv0000djlqauuj4q8g','Mellow Cocoa','',200,22,'https://imgg.fr/r/PldBa8Il.png','Boissons',1,'2026-05-12 12:21:00.810','2026-05-19 22:06:08.525',NULL),
('cmp2lnqjg0005los917eiv9lf','cmp2erbrv0000djlqauuj4q8g','Fruits Bubble Tea','',190,25,'https://i.postimg.cc/Hkjv0CVg/Bubble-Tea-Raspberry.png','Boissons',1,'2026-05-12 12:21:20.283','2026-05-19 22:06:03.602',NULL),
('cmp2lo6i60007los9fkgugm6y','cmp2erbrv0000djlqauuj4q8g','Frappucino Sakura','',200,25,'https://i.postimg.cc/qBK0fqV5/Frappuccino-Sakura.png','Boissons',1,'2026-05-12 12:21:40.973','2026-05-19 22:05:56.580',NULL),
('cmp2lomor0009los9510kpxfj','cmp2erbrv0000djlqauuj4q8g','Paris-Brest','',220,22,'https://i.postimg.cc/7ZHyTNG2/Paris-Brest3.png','Pâtisseries',1,'2026-05-12 12:22:01.946','2026-05-19 22:12:29.411',NULL),
('cmp2lp15f000blos967db38t9','cmp2erbrv0000djlqauuj4q8g','Tarte au citron meringuée','',230,47,'https://i.postimg.cc/02XcyHZB/Tarte-au-citron-meringuee.png','Pâtisseries',1,'2026-05-12 12:22:20.690','2026-05-19 22:12:36.596',NULL),
('cmp2lphi9000dlos92md7mytx','cmp2erbrv0000djlqauuj4q8g','Jewel Sorbets','',240,22,'https://imgg.fr/r/xaWQat2V.png','Pâtisseries',1,'2026-05-12 12:22:41.888','2026-05-19 22:12:20.580',NULL),
('cmp2lpvl0000flos9g6wqtg8e','cmp2erbrv0000djlqauuj4q8g','Donuts','',250,44,'https://i.postimg.cc/fTMPHRwv/Plateau-donuts.png','Pâtisseries',1,'2026-05-12 12:23:00.132','2026-05-19 22:06:14.217',NULL),
('cmp2lq8ra000hlos9ql026eqi','cmp2erbrv0000djlqauuj4q8g','Smoked Krokmou','',250,48,'https://i.postimg.cc/85gyVJwz/Smoked-Krokmou.png','Plats',1,'2026-05-12 12:23:17.205','2026-05-19 22:12:58.311',NULL),
('cmp2lqlqc000jlos911zv8s1a','cmp2erbrv0000djlqauuj4q8g','Avocado Toasts','',260,48,'https://i.postimg.cc/VNt4fxfN/Avocado-Toasts.png','Plats',1,'2026-05-12 12:23:34.019','2026-05-19 22:37:14.518',NULL),
('cmp2lr0jl000llos90f7m30dk','cmp2erbrv0000djlqauuj4q8g','Carrot Ribbon Salad','',280,49,'https://imgg.fr/r/sSixedqP.png','Plats',1,'2026-05-12 12:23:53.216','2026-05-19 22:12:53.606',NULL),
('cmp2lrffi000nlos95tudv53p','cmp2erbrv0000djlqauuj4q8g','Sweet Poke Bowl','',300,45,'https://i.postimg.cc/jjB9v65f/Sweet-Poke-Bowl.png','Plats',1,'2026-05-12 12:24:12.510','2026-05-19 22:13:03.031',NULL),
('cmp4h947w000osjahk4ku3tmh','cmp2erbrv0000djlqauuj4q8g','Service de voiturier','',3000,0,'https://imgg.fr/r/D4JSAz8M.png','Services',1,'2026-05-13 19:53:32.059','2026-05-13 19:53:32.059',NULL),
('cmp4hbh5q000qsjahm13jy78c','cmp2erbrv0000djlqauuj4q8g','Tour de bâteau','',10000,0,'https://imgg.fr/r/efo6FpdN.png','Services',1,'2026-05-13 19:55:22.136','2026-05-13 19:55:22.136',NULL),
('cmp4hegzx000ssjahgn7iva2s','cmp2erbrv0000djlqauuj4q8g','Salle de réception','',20000,0,'https://imgg.fr/r/GxjSjPuA.png','Services',1,'2026-05-13 19:57:41.897','2026-05-13 19:57:41.897',NULL),
('cmp4hgu2k000usjahgxnraee2','cmp2erbrv0000djlqauuj4q8g','Privatisation du Coffee Noir','',30000,0,'https://imgg.fr/r/kI0qOKrc.png','Services',1,'2026-05-13 19:59:32.155','2026-05-13 19:59:32.155',NULL);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `body` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `notifications_restaurantId_type_entityId_key` (`restaurantId`,`type`,`entityId`),
  KEY `notifications_restaurantId_isRead_idx` (`restaurantId`,`isRead`),
  CONSTRAINT `notifications_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES
('cmpd6pvd4000l2guimvs4yr0n','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Farine — stock: -12 (seuil: 200)','cmpb6hzpe000cydh979581wz9',1,'2026-06-03 19:24:37.512'),
('cmpd6pvd4000m2guiovpezuvv','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Sucre — stock: 93 (seuil: 200)','cmpb6im3s000eydh99sg0a0z3',1,'2026-06-01 20:54:57.719'),
('cmplie889005d10yze4rulv89','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Grain de café — stock: -91 (seuil: 400)','cmpb6ff3b0006ydh94quk719l',1,'2026-06-03 19:15:00.583'),
('cmpmi0ccv006o10yzseu8rd5r','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Fromage — stock: 220 (seuil: 400)','cmpb6l61m000kydh9qnn9jz8a',1,'2026-06-03 19:15:00.584'),
('cmpmi367i007210yz4bkmw426','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Oeufs — stock: 215 (seuil: 300)','cmpb6k7fz000iydh9kkf3ylyj',1,'2026-06-03 19:55:00.104'),
('cmpmkhciv007y10yzxj5v51k3','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Assortiment de fruits — stock: 46 (seuil: 400)','cmpb6gyz6000aydh9w45e2n5r',1,'2026-06-03 19:55:47.638'),
('cmpmkhciw008410yzwu97lpmp','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Boeuf — stock: 137 (seuil: 300)','cmpb6lz6h000mydh94k6dkhu6',1,'2026-06-02 18:28:21.326'),
('cmpmlds5n0006klyudczub89e','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Lait — stock: 387 (seuil: 400)','cmpb6g69k0008ydh9q6tgwbba',1,'2026-06-03 19:24:37.512'),
('cmpveut3q00eeej60vhgauvoa','cmp2erbrv0000djlqauuj4q8g','LOW_STOCK','Stock bas','Pain — stock: 307 (seuil: 400)','cmpb6jj72000gydh9l6ldkz2k',1,'2026-06-03 19:55:00.104');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_lines`
--

DROP TABLE IF EXISTS `order_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_lines` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `menuItemId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` double NOT NULL,
  `costPrice` double NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `order_lines_orderId_fkey` (`orderId`),
  KEY `order_lines_menuItemId_fkey` (`menuItemId`),
  CONSTRAINT `order_lines_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menu_items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `order_lines_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_lines`
--

LOCK TABLES `order_lines` WRITE;
/*!40000 ALTER TABLE `order_lines` DISABLE KEYS */;
INSERT INTO `order_lines` VALUES
('cmp2p4sj6001vlos9swanzbrn','cmp2p4sj6001tlos9csmkilj3','cmp2lo6i60007los9fkgugm6y',82,200,25),
('cmp2p4sj6001wlos9vy4d23rw','cmp2p4sj6001tlos9csmkilj3','cmp2lnbii0003los9oebdz6fs',6,200,22),
('cmp2p4sj6001xlos9gghrm253','cmp2p4sj6001tlos9csmkilj3','cmp2lp15f000blos967db38t9',12,230,47),
('cmp2p4sj6001ylos9kku9c00b','cmp2p4sj6001tlos9csmkilj3','cmp2lr0jl000llos90f7m30dk',6,280,49),
('cmp2p4sj6001zlos90gs652t8','cmp2p4sj6001tlos9csmkilj3','cmp2lrffi000nlos95tudv53p',37,300,45),
('cmp2p4sj60020los9ka6s2cg3','cmp2p4sj6001tlos9csmkilj3','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmp2p81gn0024los9rt7xni17','cmp2p81gm0022los923drby6p','cmp2lnbii0003los9oebdz6fs',35,200,22),
('cmp2p81gn0025los9zhengyoi','cmp2p81gm0022los923drby6p','cmp2lnqjg0005los917eiv9lf',39,190,25),
('cmp2p81gn0026los9h0pvlufx','cmp2p81gm0022los923drby6p','cmp2lo6i60007los9fkgugm6y',146,200,25),
('cmp2p81gn0027los95ohao0go','cmp2p81gm0022los923drby6p','cmp2lomor0009los9510kpxfj',26,220,22),
('cmp2p81gn0028los9lb4kq3rx','cmp2p81gm0022los923drby6p','cmp2lp15f000blos967db38t9',25,230,47),
('cmp2p81gn0029los925rc4ye8','cmp2p81gm0022los923drby6p','cmp2lphi9000dlos92md7mytx',25,240,22),
('cmp2p81gn002alos9do9eb2wk','cmp2p81gm0022los923drby6p','cmp2lpvl0000flos9g6wqtg8e',25,250,44),
('cmp2p81gn002blos9x3ge9nn8','cmp2p81gm0022los923drby6p','cmp2lq8ra000hlos9ql026eqi',38,250,48),
('cmp2p81gn002clos9q8llq9yc','cmp2p81gm0022los923drby6p','cmp2lrffi000nlos95tudv53p',81,300,45),
('cmp2p81gn002dlos9a3gkb5zv','cmp2p81gm0022los923drby6p','cmp2lr0jl000llos90f7m30dk',25,280,49),
('cmp2p81gn002elos9ljz8egxl','cmp2p81gm0022los923drby6p','cmp2lqlqc000jlos911zv8s1a',25,260,48),
('cmp2pb8jn002ilos9hwj7o8nz','cmp2pb8jn002glos9urjk7kse','cmp2lnqjg0005los917eiv9lf',3,190,25),
('cmp2pb8jn002jlos9ucqrljb7','cmp2pb8jn002glos9urjk7kse','cmp2lphi9000dlos92md7mytx',3,240,22),
('cmp2pb8jn002klos947nf07kt','cmp2pb8jn002glos9urjk7kse','cmp2lo6i60007los9fkgugm6y',6,200,25),
('cmp2pb8jn002llos91gqpdvm7','cmp2pb8jn002glos9urjk7kse','cmp2lq8ra000hlos9ql026eqi',3,250,48),
('cmp2pb8jn002mlos9u3ons8tw','cmp2pb8jn002glos9urjk7kse','cmp2lp15f000blos967db38t9',1,230,47),
('cmp2pb8jn002nlos9klt4zuby','cmp2pb8jn002glos9urjk7kse','cmp2lnbii0003los9oebdz6fs',8,200,22),
('cmp2pb8jn002olos9jjbzyjoz','cmp2pb8jn002glos9urjk7kse','cmp2lomor0009los9510kpxfj',5,220,22),
('cmp2pb8jn002plos92hxu4lsr','cmp2pb8jn002glos9urjk7kse','cmp2lr0jl000llos90f7m30dk',5,280,49),
('cmp2pb8jn002qlos99o7r0vzx','cmp2pb8jn002glos9urjk7kse','cmp2lpvl0000flos9g6wqtg8e',2,250,44),
('cmp2pd51l002ulos91ncpv0rt','cmp2pd51l002slos9ksjvj56b','cmp2lo6i60007los9fkgugm6y',7,200,25),
('cmp2pd51l002vlos9uhata4aa','cmp2pd51l002slos9ksjvj56b','cmp2lr0jl000llos90f7m30dk',5,280,49),
('cmp2pdwn5002zlos9pbmdg6j8','cmp2pdwn4002xlos91l1acyf3','cmp2lnbii0003los9oebdz6fs',5,200,22),
('cmp2pdwn50030los9c9yr6iir','cmp2pdwn4002xlos91l1acyf3','cmp2lomor0009los9510kpxfj',5,220,22),
('cmp2pdwn50031los9t334ugzr','cmp2pdwn4002xlos91l1acyf3','cmp2lrffi000nlos95tudv53p',5,300,45),
('cmp2pdzyd0035los9wkwqhepp','cmp2pdzyc0033los9fy2z2qxj','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmp2pe7gn0039los9eb904voz','cmp2pe7gn0037los9ludqrdwy','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmp2pe7gn003alos9db8boe33','cmp2pe7gn0037los9ludqrdwy','cmp2lqlqc000jlos911zv8s1a',4,260,48),
('cmp2peips003elos98aee4uz5','cmp2peips003clos9m6zhchrx','cmp2lomor0009los9510kpxfj',2,220,22),
('cmp2peips003flos9sioj49sb','cmp2peips003clos9m6zhchrx','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmp2peips003glos9uffglhb8','cmp2peips003clos9m6zhchrx','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmp2pfbey003klos91so82uyx','cmp2pfbey003ilos9ckm3doxv','cmp2lrffi000nlos95tudv53p',30,300,45),
('cmp2pfbey003llos9ekf6zx11','cmp2pfbey003ilos9ckm3doxv','cmp2lo6i60007los9fkgugm6y',30,200,25),
('cmp2pfgp3003plos9g25gyuqi','cmp2pfgp3003nlos9irb6jinv','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmp2pfgp3003qlos9qwo19ntf','cmp2pfgp3003nlos9irb6jinv','cmp2lomor0009los9510kpxfj',2,220,22),
('cmp2pgkff003ulos9ohvwhkfv','cmp2pgkfe003slos9oj2nx81c','cmp2lrffi000nlos95tudv53p',1,300,45),
('cmp2pgkff003vlos9pe360je0','cmp2pgkfe003slos9oj2nx81c','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmp2pgunw003zlos9yl8l8bn0','cmp2pgunw003xlos9ms9ojjki','cmp2lrffi000nlos95tudv53p',5,300,45),
('cmp2pgunw0040los9zj87sf9u','cmp2pgunw003xlos9ms9ojjki','cmp2lnbii0003los9oebdz6fs',5,200,22),
('cmp2pgunw0041los9j5h2fot2','cmp2pgunw003xlos9ms9ojjki','cmp2lp15f000blos967db38t9',5,230,47),
('cmp2ph9i90045los94x4zo5zd','cmp2ph9i90043los9pxee64en','cmp2lrffi000nlos95tudv53p',10,300,45),
('cmp2ph9i90046los9v9zd3ke1','cmp2ph9i90043los9pxee64en','cmp2lnqjg0005los917eiv9lf',10,190,25),
('cmp2ph9i90047los9fazdosxh','cmp2ph9i90043los9pxee64en','cmp2lp15f000blos967db38t9',10,230,47),
('cmp2phlw3004blos9mjqp5bb7','cmp2phlw20049los9df424xu8','cmp2lrffi000nlos95tudv53p',30,300,45),
('cmp2phlw3004clos9sk1myxua','cmp2phlw20049los9df424xu8','cmp2lo6i60007los9fkgugm6y',30,200,25),
('cmp2phni9004glos900o0106n','cmp2phni9004elos908ax9lr0','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmp2phof6004klos97ds8fosg','cmp2phof5004ilos9j28kxheq','cmp2lrffi000nlos95tudv53p',1,300,45),
('cmp5ails80005ez8l0l2j2kzk','cmp5ails80003ez8lshpijfg1','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmp5aj9p0000aez8l9eust2kp','cmp5aj9p00008ez8lh08tveit','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmp5akcjq000gez8lybzdf9cv','cmp5akcjo000eez8lbbmevscq','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmp5ako9t000lez8libracns7','cmp5ako9t000jez8lhgh1bnxe','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmp5aksoa000pez8lxdisctpk','cmp5aksoa000nez8l8pzlppqn','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpadhr1k000iciepzhvivpdy','cmpadhr1k000gciepwqkwumzb','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpae3q2t00037xyvurp0xscv','cmpae3q2s00017xyvbs5g6y5p','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpb74weh000uydh9zucfso1v','cmpb74weh000sydh9y5msear7','cmp2lq8ra000hlos9ql026eqi',5,250,48),
('cmpb74weh000vydh9t1cs7e1f','cmpb74weh000sydh9y5msear7','cmp2lo6i60007los9fkgugm6y',128,200,25),
('cmpb74weh000wydh9b8ve43tf','cmpb74weh000sydh9y5msear7','cmp2lnbii0003los9oebdz6fs',5,200,22),
('cmpb74weh000xydh932af13ua','cmpb74weh000sydh9y5msear7','cmp2lp15f000blos967db38t9',5,230,47),
('cmpb74weh000yydh9yv16hufg','cmpb74weh000sydh9y5msear7','cmp2lnqjg0005los917eiv9lf',15,190,25),
('cmpb74weh000zydh9e4xvqz53','cmpb74weh000sydh9y5msear7','cmp2lomor0009los9510kpxfj',2,220,22),
('cmpb74weh0010ydh9zpivtm2i','cmpb74weh000sydh9y5msear7','cmp2lqlqc000jlos911zv8s1a',4,260,48),
('cmpb74weh0011ydh94rnyx1gx','cmpb74weh000sydh9y5msear7','cmp2lr0jl000llos90f7m30dk',9,280,49),
('cmpb74weh0012ydh9r5e8trm9','cmpb74weh000sydh9y5msear7','cmp2lrffi000nlos95tudv53p',123,300,45),
('cmpb77bh40016ydh97a909z4m','cmpb77bh40014ydh9jw31pjcd','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpb77bh40017ydh9isy6eua9','cmpb77bh40014ydh9jw31pjcd','cmp2lo6i60007los9fkgugm6y',63,200,25),
('cmpb77bh40018ydh9lloucxmb','cmpb77bh40014ydh9jw31pjcd','cmp2lqlqc000jlos911zv8s1a',3,260,48),
('cmpb77bh40019ydh9w2df3a16','cmpb77bh40014ydh9jw31pjcd','cmp2lrffi000nlos95tudv53p',30,300,45),
('cmpb7a1bg001dydh9qq0314ml','cmpb7a1bf001bydh9izu48tes','cmp2lo6i60007los9fkgugm6y',27,200,25),
('cmpb7a1bg001eydh9k9g10xg0','cmpb7a1bf001bydh9izu48tes','cmp2lrffi000nlos95tudv53p',15,300,45),
('cmpb7a1bg001fydh9t92q6bn9','cmpb7a1bf001bydh9izu48tes','cmp2lnqjg0005los917eiv9lf',3,190,25),
('cmpb7a1bg001gydh96xkb5k4i','cmpb7a1bf001bydh9izu48tes','cmp2lpvl0000flos9g6wqtg8e',6,250,44),
('cmpb7a1bg001hydh9n9fz2inx','cmpb7a1bf001bydh9izu48tes','cmp2lomor0009los9510kpxfj',6,220,22),
('cmpb7a1bg001iydh9q5ep04qx','cmpb7a1bf001bydh9izu48tes','cmp2lphi9000dlos92md7mytx',3,240,22),
('cmpb7a1bg001jydh903bf6n8h','cmpb7a1bf001bydh9izu48tes','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpb7a1bg001kydh9h9sbjgv8','cmpb7a1bf001bydh9izu48tes','cmp2lqlqc000jlos911zv8s1a',3,260,48),
('cmpbhs5re001tydh9sundh4z9','cmpbhs5rd001rydh9mhsh34eo','cmp2lo6i60007los9fkgugm6y',8,200,25),
('cmpbhs5re001uydh9b6i81fe7','cmpbhs5rd001rydh9mhsh34eo','cmp2lrffi000nlos95tudv53p',5,300,45),
('cmpbjcphf001zydh9h79hl69l','cmpbjcphf001xydh9m2k0dtgh','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpbjcphf0020ydh9irwo7qi3','cmpbjcphf001xydh9m2k0dtgh','cmp2lq8ra000hlos9ql026eqi',6,250,48),
('cmpbjfogg0024ydh9u4b96ds0','cmpbjfogf0022ydh94hwt16mc','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpbjfogg0025ydh9ri7azfs1','cmpbjfogf0022ydh94hwt16mc','cmp2lrffi000nlos95tudv53p',5,300,45),
('cmpbkfs8q0029ydh9m8rmv3wf','cmpbkfs8q0027ydh9ep6y0xjn','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmpbkfs8q002aydh9zrcuji9w','cmpbkfs8q0027ydh9ep6y0xjn','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmpbkxebm002eydh9ikmdapk0','cmpbkxebm002cydh9uugk9a58','cmp2lnqjg0005los917eiv9lf',7,190,25),
('cmpbkxebm002fydh9bm9nga8s','cmpbkxebm002cydh9uugk9a58','cmp2lr0jl000llos90f7m30dk',5,280,49),
('cmpbm26mj002jydh9rrnt6hku','cmpbm26mi002hydh9cx7nd2uc','cmp2lrffi000nlos95tudv53p',5,300,45),
('cmpbm26mj002kydh9tzd1pvq3','cmpbm26mi002hydh9cx7nd2uc','cmp2lnqjg0005los917eiv9lf',5,190,25),
('cmpbm2et9002oydh9d13htuj6','cmpbm2et9002mydh91z78ogop','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmpbm2et9002pydh97m25oy44','cmpbm2et9002mydh91z78ogop','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpbm2et9002qydh9edk8ncl3','cmpbm2et9002mydh91z78ogop','cmp2lphi9000dlos92md7mytx',1,240,22),
('cmpbm9cob002uydh9h6qxtx4g','cmpbm9cob002sydh9h1jl7lax','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmpbmbdhi002yydh9zuxrgac3','cmpbmbdhi002wydh9njiex4ff','cmp2lrffi000nlos95tudv53p',15,300,45),
('cmpbmbdhi002zydh9hoyz60nk','cmpbmbdhi002wydh9njiex4ff','cmp2lnbii0003los9oebdz6fs',15,200,22),
('cmpbmce0m0033ydh9db4rkp29','cmpbmce0l0031ydh95vcot84t','cmp2lo6i60007los9fkgugm6y',15,200,25),
('cmpbmce0m0034ydh94kout01x','cmpbmce0l0031ydh95vcot84t','cmp2lrffi000nlos95tudv53p',15,300,45),
('cmpbmce0m0035ydh9nkrdk2an','cmpbmce0l0031ydh95vcot84t','cmp2lpvl0000flos9g6wqtg8e',15,250,44),
('cmpbmjr8d0039ydh9fuui5e1a','cmpbmjr8d0037ydh9trs3jbf9','cmp2lpvl0000flos9g6wqtg8e',3,250,44),
('cmpbmjr8d003aydh9imhyjyge','cmpbmjr8d0037ydh9trs3jbf9','cmp2lnqjg0005los917eiv9lf',3,190,25),
('cmpbmjr8e003bydh95xi3d3xw','cmpbmjr8d0037ydh9trs3jbf9','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpbmkqhi003fydh90m9yj4bf','cmpbmkqhi003dydh99lg23db4','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpbmkqhi003gydh9ti4eabb4','cmpbmkqhi003dydh99lg23db4','cmp2lq8ra000hlos9ql026eqi',3,250,48),
('cmpbmo9u9003lydh9gomfptb0','cmpbmo9u9003jydh9491x08im','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpbmo9u9003mydh9dp8869ip','cmpbmo9u9003jydh9491x08im','cmp2lomor0009los9510kpxfj',2,220,22),
('cmpbmo9ua003nydh9fdfp1eur','cmpbmo9u9003jydh9491x08im','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpcwcssj003wydh9xf1ld0di','cmpcwcssj003uydh99if8nhhv','cmp2lo6i60007los9fkgugm6y',6,200,25),
('cmpcwcssj003xydh9xsw7erk5','cmpcwcssj003uydh99if8nhhv','cmp2lrffi000nlos95tudv53p',6,300,45),
('cmpcwk9dl0042ydh99o64jvfc','cmpcwk9dk0040ydh954c515fz','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpcwk9dl0043ydh96uy2abz7','cmpcwk9dk0040ydh954c515fz','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpcwlo860047ydh9bcp1dvmt','cmpcwlo860045ydh95pw3c8iw','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpcwlo860048ydh99cgaqd37','cmpcwlo860045ydh95pw3c8iw','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpcx92sd004cydh93ngvlft8','cmpcx92sc004aydh9kk9ksd22','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpcx9j28004gydh90awovjp9','cmpcx9j27004eydh9woaohw1n','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpcx9j28004hydh9vd0bc76j','cmpcx9j27004eydh9woaohw1n','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpcykoc5004lydh9dlei90tb','cmpcykoc5004jydh95godepjp','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpcykoc5004mydh96zdjk6am','cmpcykoc5004jydh95godepjp','cmp2lomor0009los9510kpxfj',2,220,22),
('cmpcylhp0004qydh9z675302a','cmpcylhp0004oydh9oew7qye3','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpcz2nbv004uydh9oau78h4x','cmpcz2nbu004sydh9tlrfd4t7','cmp2lq8ra000hlos9ql026eqi',3,250,48),
('cmpcz2nbv004vydh9gi1nvjui','cmpcz2nbu004sydh9tlrfd4t7','cmp2lnqjg0005los917eiv9lf',3,190,25),
('cmpczgfp1004zydh93i74ootk','cmpczgfp0004xydh9jkf9ak5k','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpczgfp10050ydh91qw6lomz','cmpczgfp0004xydh9jkf9ak5k','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpczgfp10051ydh9nactopki','cmpczgfp0004xydh9jkf9ak5k','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmpczgfp10052ydh9piyblacp','cmpczgfp0004xydh9jkf9ak5k','cmp2lpvl0000flos9g6wqtg8e',2,250,44),
('cmpczgfp10053ydh9zzeiauuz','cmpczgfp0004xydh9jkf9ak5k','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpczgfp10054ydh9tnn0u8at','cmpczgfp0004xydh9jkf9ak5k','cmp2lp15f000blos967db38t9',2,230,47),
('cmpczgfp10055ydh96rdyduxr','cmpczgfp0004xydh9jkf9ak5k','cmp2lomor0009los9510kpxfj',2,220,22),
('cmpczgfp10056ydh9lo2msm6a','cmpczgfp0004xydh9jkf9ak5k','cmp2lphi9000dlos92md7mytx',2,240,22),
('cmpczgfp10057ydh9dr20tnlw','cmpczgfp0004xydh9jkf9ak5k','cmp2lr0jl000llos90f7m30dk',2,280,49),
('cmpczgfp10058ydh9w8pn3rgn','cmpczgfp0004xydh9jkf9ak5k','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmpczgfp10059ydh9nj04dz27','cmpczgfp0004xydh9jkf9ak5k','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpczvyw4005dydh9wira5qhx','cmpczvyw3005bydh91064hjnm','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpczvyw4005eydh93hh2zxe4','cmpczvyw3005bydh91064hjnm','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpczxbum005iydh9xjgujnqi','cmpczxbum005gydh9hlknaxby','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpczxbum005jydh9zkamzsoh','cmpczxbum005gydh9hlknaxby','cmp2lphi9000dlos92md7mytx',1,240,22),
('cmpd6ol68000c2gui8h1oifb0','cmpd6ol67000a2guiwwv8uta8','cmp2lnqjg0005los917eiv9lf',3,190,25),
('cmpd6ol68000d2gui7ksdhy0z','cmpd6ol67000a2guiwwv8uta8','cmp2lq8ra000hlos9ql026eqi',3,250,48),
('cmpd6pvc6000h2gui5iqaskgs','cmpd6pvc6000f2guiwqnmdqum','cmp2lpvl0000flos9g6wqtg8e',3,250,44),
('cmpd6pvc6000i2guiy11ytfam','cmpd6pvc6000f2guiwqnmdqum','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpe624zi000d7xnn8qd0u5h0','cmpe624zh000b7xnnb2rdikly','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmpe624zi000e7xnnkkatnopd','cmpe624zh000b7xnnb2rdikly','cmp2lq8ra000hlos9ql026eqi',10,250,48),
('cmpe63vpq000i7xnnegdzbyww','cmpe63vpq000g7xnnb5jcw9cc','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpe6hevg000n7xnnxi06t4kl','cmpe6hevg000l7xnnxdjasjnc','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpe6hevg000o7xnn4ff0pq1c','cmpe6hevg000l7xnnxdjasjnc','cmp2lp15f000blos967db38t9',2,230,47),
('cmpe7ye0a000u7xnn1p5bekqi','cmpe7ye0a000s7xnndnpweiam','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpe7ye0a000v7xnnup0eyqg5','cmpe7ye0a000s7xnndnpweiam','cmp2lomor0009los9510kpxfj',3,220,22),
('cmpe8h78c00117xnn13ubammb','cmpe8h78b000z7xnn4i57chme','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpe8h78c00127xnnrk6fztxm','cmpe8h78b000z7xnn4i57chme','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpe8h78c00137xnnijfmvl2m','cmpe8h78b000z7xnn4i57chme','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpe8h78c00147xnnbrwohxa4','cmpe8h78b000z7xnn4i57chme','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmpefryh8001a7xnnys7tgx75','cmpefryh800187xnnb537t8y6','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpefryh9001b7xnnlo35j09w','cmpefryh800187xnnb537t8y6','cmp2lrffi000nlos95tudv53p',1,300,45),
('cmpeg0ke7001f7xnnta20c0da','cmpeg0ke7001d7xnn5y93mz7e','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpeg0ke7001g7xnnw1fh9ewj','cmpeg0ke7001d7xnn5y93mz7e','cmp2lp15f000blos967db38t9',1,230,47),
('cmpeg0ke7001h7xnna1w4mvea','cmpeg0ke7001d7xnn5y93mz7e','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpegb4oy001o7xnn785npel5','cmpegb4oy001m7xnnzllz0jjh','cmp2lnqjg0005los917eiv9lf',4,190,25),
('cmpegb4oy001p7xnn1a37xd35','cmpegb4oy001m7xnnzllz0jjh','cmp2lqlqc000jlos911zv8s1a',4,260,48),
('cmpegckj4001t7xnn5yaslbmw','cmpegckj4001r7xnn8dy826v1','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpeh8s3t001y7xnnx7pnk2wm','cmpeh8s3t001w7xnn0tcyfkjx','cmp2lnqjg0005los917eiv9lf',5,190,25),
('cmpehf5rt00237xnnm9pbidyt','cmpehf5rt00217xnnim3lcfiu','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpehw7cf00277xnn6o9681nv','cmpehw7cf00257xnnetmwosq0','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpehw7cf00287xnnmq7royoe','cmpehw7cf00257xnnetmwosq0','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpei31zf002c7xnnb7ra15zx','cmpei31zf002a7xnnsmaajx4b','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpei31zf002d7xnnnhqn4yze','cmpei31zf002a7xnnsmaajx4b','cmp2lrffi000nlos95tudv53p',1,300,45),
('cmpeijmjz002h7xnnbpy9fkh4','cmpeijmjz002f7xnnj5f4ew2q','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpeijmjz002i7xnnawt1ixxo','cmpeijmjz002f7xnnj5f4ew2q','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmpeinbf0002m7xnn7jjntxqt','cmpeinbf0002k7xnndkp9icb1','cmp2lnbii0003los9oebdz6fs',10,200,22),
('cmpeinbf0002n7xnn4pyb1xg4','cmpeinbf0002k7xnndkp9icb1','cmp2lq8ra000hlos9ql026eqi',10,250,48),
('cmpeitoz8002r7xnn45b09nfc','cmpeitoz7002p7xnn98ai1q6v','cmp2lq8ra000hlos9ql026eqi',10,250,48),
('cmpeoqqsf002y7xnnnfz2xt2c','cmpeoqqsf002w7xnn4nznggae','cmp2lnqjg0005los917eiv9lf',4,190,25),
('cmpeoqqsf002z7xnnwf3wto0x','cmpeoqqsf002w7xnn4nznggae','cmp2lq8ra000hlos9ql026eqi',4,250,48),
('cmpeotn9600337xnn5l4zqzuh','cmpeotn9600317xnn1bbgpgkn','cmp2lrffi000nlos95tudv53p',3,300,45),
('cmpeotn9600347xnn501y25nf','cmpeotn9600317xnn1bbgpgkn','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpeovhne00387xnn20c2ytij','cmpeovhnd00367xnnp07bpt2q','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpeow40x003c7xnn1k3pg29i','cmpeow40x003a7xnn9hku9hp2','cmp2lomor0009los9510kpxfj',2,220,22),
('cmpeow40x003d7xnn605qu7yk','cmpeow40x003a7xnn9hku9hp2','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmpfs5ioa003k7xnns6r2okoj','cmpfs5io9003i7xnnsljwvd41','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpfs5ioa003l7xnnvk2e8cgv','cmpfs5io9003i7xnnsljwvd41','cmp2lrffi000nlos95tudv53p',5,300,45),
('cmph384z5000410yzfu0i2dpe','cmph384z4000210yzqcw5w6u9','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmph384z5000510yzt7pbaii7','cmph384z4000210yzqcw5w6u9','cmp2lqlqc000jlos911zv8s1a',4,260,48),
('cmph3e6k2000910yzgo8h4gio','cmph3e6k2000710yzoh6iqdt5','cmp2lq8ra000hlos9ql026eqi',20,250,48),
('cmph3e6k2000a10yzlu4fw2uy','cmph3e6k2000710yzoh6iqdt5','cmp2lo6i60007los9fkgugm6y',25,200,25),
('cmph3f0ws000e10yzz3g0hcib','cmph3f0ws000c10yz10ueb9eu','cmp2lomor0009los9510kpxfj',2,220,22),
('cmph3f0ws000f10yzfvmskszy','cmph3f0ws000c10yz10ueb9eu','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmph3vy6u000l10yzllpmtfsj','cmph3vy6t000j10yzg9o1jhau','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmph3vy6u000m10yzrqqzh4kr','cmph3vy6t000j10yzg9o1jhau','cmp2lpvl0000flos9g6wqtg8e',10,250,44),
('cmpha2z50000v10yz75wsgm49','cmpha2z50000t10yzx4senq83','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpha2z50000w10yzsnd67krv','cmpha2z50000t10yzx4senq83','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpioy4u2001410yzxvnlsx0z','cmpioy4u1001210yz3gzt8uc1','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpioy4u2001510yz49gprwva','cmpioy4u1001210yz3gzt8uc1','cmp2lrffi000nlos95tudv53p',3,300,45),
('cmpip0l9e001910yzc9lhooq2','cmpip0l9e001710yzea4o0vwc','cmp2lomor0009los9510kpxfj',4,220,22),
('cmpip0l9e001a10yzl3m0fj61','cmpip0l9e001710yzea4o0vwc','cmp2lnqjg0005los917eiv9lf',4,190,25),
('cmpip19z7001g10yzzam99tjj','cmpip19z7001e10yziibxsh0k','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpip19z7001h10yzj2ltyf7e','cmpip19z7001e10yziibxsh0k','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpip19z7001i10yz0yx3l8mu','cmpip19z7001e10yziibxsh0k','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpipeaud001o10yztg2cavsm','cmpipeaud001m10yzq0pnqjye','cmp2lpvl0000flos9g6wqtg8e',1,250,44),
('cmpipwnl3001w10yz36ex4z9s','cmpipwnl2001u10yze0d5t71b','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpipy89d002010yzj4ufygj1','cmpipy89d001y10yz1zqp14tc','cmp2lnqjg0005los917eiv9lf',6,190,25),
('cmpipy89d002110yzqbbwug8d','cmpipy89d001y10yz1zqp14tc','cmp2lq8ra000hlos9ql026eqi',6,250,48),
('cmpir248z002610yze2kpt63b','cmpir248y002410yzhmzl23ve','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpir248z002710yzo1xwb5jn','cmpir248y002410yzhmzl23ve','cmp2lp15f000blos967db38t9',1,230,47),
('cmpizafxr002e10yz097qwh7b','cmpizafxq002c10yzaziytk7n','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpizafxr002f10yzsyyibkx1','cmpizafxq002c10yzaziytk7n','cmp2lp15f000blos967db38t9',3,230,47),
('cmpizafxr002g10yzzht8vrvk','cmpizafxq002c10yzaziytk7n','cmp2lrffi000nlos95tudv53p',3,300,45),
('cmpizb5ox002m10yzfyqyngg5','cmpizb5ox002k10yz38cfs3nx','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpizb5ox002n10yzv2d8g6ty','cmpizb5ox002k10yz38cfs3nx','cmp2lp15f000blos967db38t9',3,230,47),
('cmpizb5ox002o10yzscuwkqud','cmpizb5ox002k10yz38cfs3nx','cmp2lrffi000nlos95tudv53p',3,300,45),
('cmpk1xkmz002w10yza77yl4e0','cmpk1xkmz002u10yzd51vhvdm','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpk1xkmz002x10yzxosunv7p','cmpk1xkmz002u10yzd51vhvdm','cmp2lp15f000blos967db38t9',1,230,47),
('cmpk1xkmz002y10yzchhmf8fn','cmpk1xkmz002u10yzd51vhvdm','cmp2lpvl0000flos9g6wqtg8e',1,250,44),
('cmpk1xkmz002z10yzopujmgba','cmpk1xkmz002u10yzd51vhvdm','cmp2lr0jl000llos90f7m30dk',1,280,49),
('cmpk1ymnc003710yzmg6cl655','cmpk1ymnb003510yzu7zbu79z','cmp2lqlqc000jlos911zv8s1a',5,260,48),
('cmpk1ymnc003810yz13sso67d','cmpk1ymnb003510yzu7zbu79z','cmp2lnbii0003los9oebdz6fs',5,200,22),
('cmpk2inyn003c10yz0t8qwzkw','cmpk2inym003a10yz5pvgirlu','cmp2lnbii0003los9oebdz6fs',12,200,22),
('cmpk2inyn003d10yzxj1x5hda','cmpk2inym003a10yz5pvgirlu','cmp2lr0jl000llos90f7m30dk',12,280,49),
('cmpk2jjd6003h10yz1tnpb763','cmpk2jjd6003f10yzu3t1nuut','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpk2jjd6003i10yz30oq0uac','cmpk2jjd6003f10yzu3t1nuut','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpk3d0k6003m10yzedx3gyi0','cmpk3d0k5003k10yzm3cue2x5','cmp2lnbii0003los9oebdz6fs',13,200,22),
('cmpk3d0k6003n10yzh3bppscd','cmpk3d0k5003k10yzm3cue2x5','cmp2lr0jl000llos90f7m30dk',13,280,49),
('cmpkhe448003s10yzm1gjphr3','cmpkhe448003q10yzzo29wy2u','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpkhe448003t10yz6y699i6h','cmpkhe448003q10yzzo29wy2u','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpkhholn003z10yz3duv7mxf','cmpkhholn003x10yzj1tn8akn','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmpkhholn004010yz0j2iatyv','cmpkhholn003x10yzj1tn8akn','cmp2lrffi000nlos95tudv53p',6,300,45),
('cmpkiav0x004410yzswwymfd5','cmpkiav0x004210yzwtriwiaa','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpkiav0x004510yzmy11mtt1','cmpkiav0x004210yzwtriwiaa','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpkioa60004910yzbf7yjkjf','cmpkioa60004710yzipxap5qz','cmp2lo6i60007los9fkgugm6y',20,200,25),
('cmpkioa60004a10yzpj8hakcr','cmpkioa60004710yzipxap5qz','cmp2lrffi000nlos95tudv53p',20,300,45),
('cmplcsf51004p10yzz115x8t3','cmplcsf50004n10yz79d7hxxs','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmplcsf51004q10yzlknb7cwy','cmplcsf50004n10yz79d7hxxs','cmp2lrffi000nlos95tudv53p',10,300,45),
('cmplgx5k3004u10yzjnilszgd','cmplgx5k2004s10yzcm3sm20v','cmp2lnbii0003los9oebdz6fs',15,200,22),
('cmplhzs2c004y10yzjkgvxyk7','cmplhzs2c004w10yzo9s57hsx','cmp2lomor0009los9510kpxfj',1,220,22),
('cmplibi4d005410yzgod979t4','cmplibi4d005210yzni5kditf','cmp2lqlqc000jlos911zv8s1a',15,260,48),
('cmplibi4d005510yzvt4igz0w','cmplibi4d005210yzni5kditf','cmp2lnqjg0005los917eiv9lf',20,190,25),
('cmplie87m005a10yzpp2xjh0d','cmplie87m005810yzx6v1v40a','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmplie87m005b10yz6gq3894c','cmplie87m005810yzx6v1v40a','cmp2lrffi000nlos95tudv53p',10,300,45),
('cmplif7k0005h10yz4ze8bmsp','cmplif7k0005f10yzwfmbj0ut','cmp2lqlqc000jlos911zv8s1a',5,260,48),
('cmplif7k0005i10yz3rf7ik4s','cmplif7k0005f10yzwfmbj0ut','cmp2lnqjg0005los917eiv9lf',5,190,25),
('cmplre8c3005n10yzkv5f442p','cmplre8c3005l10yzydtytjli','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmplrhxuc005r10yzzi4yvoq9','cmplrhxuc005p10yzkmxtevek','cmp2lomor0009los9510kpxfj',2,220,22),
('cmplrnflr005x10yzdci4e0b3','cmplrnflq005v10yz16jfvzx9','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmplrshie006110yz0e064ley','cmplrshie005z10yzx2ncwc9y','cmp2lp15f000blos967db38t9',2,230,47),
('cmplrshie006210yzsa9n82l5','cmplrshie005z10yzx2ncwc9y','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmplu8cth006910yz4ca8jzdr','cmplu8cth006710yzlfhittds','cmp2lnbii0003los9oebdz6fs',17,200,22),
('cmplu8cth006a10yzovsajfgj','cmplu8cth006710yzlfhittds','cmp2lqlqc000jlos911zv8s1a',17,260,48),
('cmpmi366j006w10yzd16b077m','cmpmi366j006u10yzfpxx8ljh','cmp2lnqjg0005los917eiv9lf',60,190,25),
('cmpmi366j006x10yzu527bfgk','cmpmi366j006u10yzfpxx8ljh','cmp2lqlqc000jlos911zv8s1a',30,260,48),
('cmpmi366j006y10yzj9kiva7f','cmpmi366j006u10yzfpxx8ljh','cmp2lnbii0003los9oebdz6fs',60,200,22),
('cmpmi366j006z10yzm8826683','cmpmi366j006u10yzfpxx8ljh','cmp2lr0jl000llos90f7m30dk',30,280,49),
('cmpmi4f5f007710yz24ktnfjx','cmpmi4f5f007510yzi1vnj9jg','cmp2lo6i60007los9fkgugm6y',6,200,25),
('cmpmi4f5f007810yzv0j9s7ag','cmpmi4f5f007510yzi1vnj9jg','cmp2lrffi000nlos95tudv53p',6,300,45),
('cmpmi4f5f007910yzwxjix0ie','cmpmi4f5f007510yzi1vnj9jg','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpmi4f5f007a10yz1h8krrxe','cmpmi4f5f007510yzi1vnj9jg','cmp2lqlqc000jlos911zv8s1a',3,260,48),
('cmpmkhci8007n10yzpurkjxzf','cmpmkhci8007l10yzsp8e2qz3','cmp2lq8ra000hlos9ql026eqi',5,250,48),
('cmpmkhci8007o10yz24kzxpt9','cmpmkhci8007l10yzsp8e2qz3','cmp2lqlqc000jlos911zv8s1a',10,260,48),
('cmpmkhci8007p10yzthekuyy6','cmpmkhci8007l10yzsp8e2qz3','cmp2lnqjg0005los917eiv9lf',15,190,25),
('cmpmkhci8007q10yznhdhs8a2','cmpmkhci8007l10yzsp8e2qz3','cmp2lr0jl000llos90f7m30dk',5,280,49),
('cmpmkhci8007r10yzykby3h57','cmpmkhci8007l10yzsp8e2qz3','cmp2lphi9000dlos92md7mytx',10,240,22),
('cmpmkhci8007s10yzo7uywuco','cmpmkhci8007l10yzsp8e2qz3','cmp2lp15f000blos967db38t9',5,230,47),
('cmpmkhci8007t10yzadndih2o','cmpmkhci8007l10yzsp8e2qz3','cmp2lo6i60007los9fkgugm6y',175,200,25),
('cmpmkhci8007u10yzr88clvvq','cmpmkhci8007l10yzsp8e2qz3','cmp2lrffi000nlos95tudv53p',151,300,45),
('cmpmv7n20000dej6063w3hfhf','cmpmv7n20000bej60x8xxqu1m','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpmv7n20000eej60fnmxso50','cmpmv7n20000bej60x8xxqu1m','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpmv7n20000fej60ht3ppuar','cmpmv7n20000bej60x8xxqu1m','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmpmv7n20000gej601ohypjj1','cmpmv7n20000bej60x8xxqu1m','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpmwpzzb000qej60hll3fgqm','cmpmwpzza000oej60y6sztgm3','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpmwpzzb000rej60fpyw5f81','cmpmwpzza000oej60y6sztgm3','cmp2lq8ra000hlos9ql026eqi',3,250,48),
('cmpmxto5z000zej60qxz52k2k','cmpmxto5y000xej60q53po9la','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpmxto5z0010ej60096dkkdu','cmpmxto5y000xej60q53po9la','cmp2lq8ra000hlos9ql026eqi',5,250,48),
('cmpmydz1l0018ej603x4g22z8','cmpmydz1l0016ej600v6r8emf','cmp2lo6i60007los9fkgugm6y',8,200,25),
('cmpmydz1l0019ej604g9wozcs','cmpmydz1l0016ej600v6r8emf','cmp2lrffi000nlos95tudv53p',8,300,45),
('cmpmyizks001jej60h2xkuwjr','cmpmyizks001hej60elufgh8l','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmpmyizks001kej605iwiiptt','cmpmyizks001hej60elufgh8l','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpmyizks001lej60383436cv','cmpmyizks001hej60elufgh8l','cmp2lp15f000blos967db38t9',1,230,47),
('cmpmyo0q8001vej60rkvrwe4y','cmpmyo0q8001tej605hc7r3az','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmpmyp2l30021ej60u0fu3pzv','cmpmyp2l3001zej60vsfcmfrt','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpmyp2l30022ej602j9w4sd7','cmpmyp2l3001zej60vsfcmfrt','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpn08j60002dej60lvk0k245','cmpn08j60002bej608fronl8o','cmp2lnqjg0005los917eiv9lf',3,190,25),
('cmpn08j60002eej60vkpvs0fb','cmpn08j60002bej608fronl8o','cmp2lp15f000blos967db38t9',3,230,47),
('cmpn0vjxl002mej60eu9hc87c','cmpn0vjxk002kej60z2w7gwkv','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpn0vjxl002nej60giids1xs','cmpn0vjxk002kej60z2w7gwkv','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpn0zyzg002vej60ypkwtlkf','cmpn0zyzg002tej605r7p9to4','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpn1aer70031ej604l8x5jmb','cmpn1aer7002zej60h00g4xdu','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmpn1aer70032ej60cvq2xlzh','cmpn1aer7002zej60h00g4xdu','cmp2lq8ra000hlos9ql026eqi',4,250,48),
('cmpn1r74k003aej60itrxudix','cmpn1r74j0038ej60ci8h8jvj','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpn1r74k003bej601qbtkybg','cmpn1r74j0038ej60ci8h8jvj','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpn1r74k003cej603dta0ynv','cmpn1r74j0038ej60ci8h8jvj','cmp2lphi9000dlos92md7mytx',2,240,22),
('cmpn20ev5003kej60cw390z7w','cmpn20ev4003iej60jm19jdjx','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpn20ev5003lej60uo9m0kel','cmpn20ev4003iej60jm19jdjx','cmp2lp15f000blos967db38t9',2,230,47),
('cmpn20ev5003mej600my73r2k','cmpn20ev4003iej60jm19jdjx','cmp2lr0jl000llos90f7m30dk',2,280,49),
('cmpn23i0c003wej60q8trhh16','cmpn23i0b003uej60s3jmommf','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmpn23i0c003xej60qj1h0vtp','cmpn23i0b003uej60s3jmommf','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpof36oa0047ej60eory5rm0','cmpof36o90045ej60sp891pz7','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmpof36oa0048ej60vefvuo2m','cmpof36o90045ej60sp891pz7','cmp2lq8ra000hlos9ql026eqi',4,250,48),
('cmpogzo77004gej60vpn1lkmd','cmpogzo77004eej60efzz7nyi','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpogzo77004hej601hljcmrf','cmpogzo77004eej60efzz7nyi','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpoh68h4004rej60ac5a8itd','cmpoh68h4004pej60ot4m0ucy','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpoh68h4004sej60agzk3lo5','cmpoh68h4004pej60ot4m0ucy','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpohj2zv0050ej60r7yh2xns','cmpohj2zv004yej600levcsqo','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpohj2zv0051ej606i58mmug','cmpohj2zv004yej600levcsqo','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpohmf1u005bej60ggc3y5i0','cmpohmf1u0059ej6053j7ap3q','cmp2lr0jl000llos90f7m30dk',2,280,49),
('cmpohmf1u005cej6098utlre0','cmpohmf1u0059ej6053j7ap3q','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmppvsiim005pej605vvlol9o','cmppvsiil005nej60q7vl314t','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmppvsiim005qej60nm84fjlv','cmppvsiil005nej60q7vl314t','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmppvsiim005rej607hxhh1m0','cmppvsiil005nej60q7vl314t','cmp2lpvl0000flos9g6wqtg8e',3,250,44),
('cmppvx2800062ej60iw0uw3sa','cmppvx2800060ej60uqcrz5a4','cmp2lo6i60007los9fkgugm6y',4,200,25),
('cmppvx2800063ej600gr608yb','cmppvx2800060ej60uqcrz5a4','cmp2lq8ra000hlos9ql026eqi',4,250,48),
('cmppvyhb8006bej60xmxfjxue','cmppvyhb80069ej60x594h5uh','cmp2lnbii0003los9oebdz6fs',10,200,22),
('cmppvyhb8006cej60izdoqtkg','cmppvyhb80069ej60x594h5uh','cmp2lr0jl000llos90f7m30dk',10,280,49),
('cmppwcf4c006iej60t8ipsxrg','cmppwcf4c006gej60x92snje1','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmppwef0j006oej60ewxqcb1b','cmppwef0j006mej60f6ls6y1v','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmppwef0j006pej60ijape98j','cmppwef0j006mej60f6ls6y1v','cmp2lp15f000blos967db38t9',3,230,47),
('cmppwh1vv006xej60qw0b1rfh','cmppwh1vv006vej6016iuit6u','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmppwh1vv006yej60xh8xeopo','cmppwh1vv006vej6016iuit6u','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmppxf6b20074ej60vfp1bzce','cmppxf6b20072ej60813xwvmx','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmppxf6b20075ej602zbdae5n','cmppxf6b20072ej60813xwvmx','cmp2lqlqc000jlos911zv8s1a',5,260,48),
('cmppxm5sm007dej60wsswmyre','cmppxm5sm007bej60spp0cmbw','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmppxmpwm007jej60dyowjdyr','cmppxmpwm007hej60jkh8rqx6','cmp2lr0jl000llos90f7m30dk',30,280,49),
('cmppxms7d007pej60utrg4ro7','cmppxms7c007nej60gnmrvjii','cmp2lnqjg0005los917eiv9lf',30,190,25),
('cmppxoir5007vej60jf5p8smx','cmppxoir5007tej60wf5cyi6d','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmppxt6es0081ej60zjo0cfk5','cmppxt6es007zej600t8wzqup','cmp2lnbii0003los9oebdz6fs',5,200,22),
('cmppxt6es0082ej603057zowm','cmppxt6es007zej600t8wzqup','cmp2lomor0009los9510kpxfj',5,220,22),
('cmppxurm60088ej60ho36md7e','cmppxurm60086ej603q1xv0th','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmppxurm60089ej60fn00evod','cmppxurm60086ej603q1xv0th','cmp2lrffi000nlos95tudv53p',1,300,45),
('cmppxycxi008jej60n7565p45','cmppxycxh008hej60yr5j7c6k','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmppxycxi008kej60cpge16ek','cmppxycxh008hej60yr5j7c6k','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmppy36f0008qej60d9aubt2f','cmppy36f0008oej60udhozd5q','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmppy36f0008rej60mpac379f','cmppy36f0008oej60udhozd5q','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmppy5o1v008zej6076ltuq9y','cmppy5o1v008xej60qjvyxohc','cmp2lnqjg0005los917eiv9lf',3,190,25),
('cmppy5o1v0090ej60os6alqxk','cmppy5o1v008xej60qjvyxohc','cmp2lqlqc000jlos911zv8s1a',3,260,48),
('cmppy85et0098ej60z9uunejw','cmppy85es0096ej60tohzquhn','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmppy85et0099ej602fwnzgtb','cmppy85es0096ej60tohzquhn','cmp2lpvl0000flos9g6wqtg8e',10,250,44),
('cmppy85et009aej60v969nr30','cmppy85es0096ej60tohzquhn','cmp2lrffi000nlos95tudv53p',10,300,45),
('cmppy9j7h009oej60p59v1kwc','cmppy9j7h009mej60wrmvdzds','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmppy9j7h009pej60vcwdb8v0','cmppy9j7h009mej60wrmvdzds','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmppyozc4009xej60a4soo6tz','cmppyozc4009vej60s5p7q6z3','cmp2lq8ra000hlos9ql026eqi',5,250,48),
('cmppyozc4009yej60wf2rghsw','cmppyozc4009vej60s5p7q6z3','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmppz0x0p00a6ej60436w6vxm','cmppz0x0p00a4ej60qdpy85ss','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmprd6wqi00agej60g5zzj61u','cmprd6wqh00aeej60fam9aer1','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmprd6wqi00ahej60ax7wba5n','cmprd6wqh00aeej60fam9aer1','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpu5rb3u00avej6053qsmy29','cmpu5rb3u00atej60rkbksp9q','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmpu5rb3u00awej60tebgk0rk','cmpu5rb3u00atej60rkbksp9q','cmp2lpvl0000flos9g6wqtg8e',1,250,44),
('cmpu5rb3u00axej60vp9u124s','cmpu5rb3u00atej60rkbksp9q','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmpu5rb3u00ayej60jbts44qs','cmpu5rb3u00atej60rkbksp9q','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpu650d100bcej60at7jgk95','cmpu650d000baej60hqabq5nz','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpu650d100bdej60pofctw6y','cmpu650d000baej60hqabq5nz','cmp2lpvl0000flos9g6wqtg8e',1,250,44),
('cmpu8gtt900boej60st4phfh2','cmpu8gtt800bmej60smwdqa5m','cmp2lqlqc000jlos911zv8s1a',3,260,48),
('cmpu8gtt900bpej6012z8dhof','cmpu8gtt800bmej60smwdqa5m','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpu8xzm000bvej606kjko52n','cmpu8xzlz00btej60q39eblqe','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpu8xzm000bwej60fdey3jm8','cmpu8xzlz00btej60q39eblqe','cmp2lomor0009los9510kpxfj',3,220,22),
('cmpu95oi300c2ej60kv6vc3ks','cmpu95oi300c0ej60d9nus1sd','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmpu95oi300c3ej60nchffain','cmpu95oi300c0ej60d9nus1sd','cmp2lrffi000nlos95tudv53p',10,300,45),
('cmpu96jx100cdej60yq8a4n7w','cmpu96jx000cbej600ry8d3e3','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpu96jx100ceej6058av1471','cmpu96jx000cbej600ry8d3e3','cmp2lrffi000nlos95tudv53p',3,300,45),
('cmpua1y4700coej601q9m0zzz','cmpua1y4700cmej60mb0uxvb0','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpua1y4700cpej605bg7ub8e','cmpua1y4700cmej60mb0uxvb0','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpua4znk00czej606fx5gzhn','cmpua4znk00cxej60x32h17j1','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpua4znk00d0ej60z8czu9mb','cmpua4znk00cxej60x32h17j1','cmp2lr0jl000llos90f7m30dk',5,280,49),
('cmpven1v100d9ej60gk0hxhfd','cmpven1v100d7ej6038une4w6','cmp2lo6i60007los9fkgugm6y',60,200,25),
('cmpven1v100daej60192fj2qq','cmpven1v100d7ej6038une4w6','cmp2lrffi000nlos95tudv53p',30,300,45),
('cmpveoq9d00dkej60rq0ucvz7','cmpveoq9c00diej60v0ewb8iu','cmp2lnbii0003los9oebdz6fs',3,200,22),
('cmpveoq9d00dlej601qrhjxdm','cmpveoq9c00diej60v0ewb8iu','cmp2lqlqc000jlos911zv8s1a',3,260,48),
('cmpveoq9d00dmej60sola9cro','cmpveoq9c00diej60v0ewb8iu','cmp2lrffi000nlos95tudv53p',6,300,45),
('cmpveoq9d00dnej60wqahv9jy','cmpveoq9c00diej60v0ewb8iu','cmp2lo6i60007los9fkgugm6y',15,200,25),
('cmpveoq9d00doej60u0vwazg3','cmpveoq9c00diej60v0ewb8iu','cmp2lr0jl000llos90f7m30dk',9,280,49),
('cmpveut2v00e2ej60lbdhecw7','cmpveut2u00e0ej60z0yqydrw','cmp2lo6i60007los9fkgugm6y',56,200,25),
('cmpveut2v00e3ej60ytziw2c6','cmpveut2u00e0ej60z0yqydrw','cmp2lq8ra000hlos9ql026eqi',55,250,48),
('cmpveut2v00e4ej60fxjs3ald','cmpveut2u00e0ej60z0yqydrw','cmp2lnqjg0005los917eiv9lf',53,190,25),
('cmpveut2v00e5ej60ml1944st','cmpveut2u00e0ej60z0yqydrw','cmp2lpvl0000flos9g6wqtg8e',53,250,44),
('cmpvhqfc400eoej60qibqpkob','cmpvhqfc400emej60fmdhf0xg','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpvhqfc400epej607y48xz4j','cmpvhqfc400emej60fmdhf0xg','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpvhqfc400eqej60rz4gjpf2','cmpvhqfc400emej60fmdhf0xg','cmp2lrffi000nlos95tudv53p',1,300,45),
('cmpvhvrdh00f2ej60sq1vnjwa','cmpvhvrdh00f0ej60f8xfviv9','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpvoevdr00fjej60lha5vzly','cmpvoevdr00fhej60gdvt2ipu','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpvoevdr00fkej60n9q83i8v','cmpvoevdr00fhej60gdvt2ipu','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpvotaqm00fuej60i6511vuh','cmpvotaqm00fsej6030w69z4z','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpvotaqm00fvej60p5tpphpk','cmpvotaqm00fsej6030w69z4z','cmp2lpvl0000flos9g6wqtg8e',2,250,44),
('cmpvotaqm00fwej60zlggxo46','cmpvotaqm00fsej6030w69z4z','cmp2lomor0009los9510kpxfj',5,220,22),
('cmpvpapsc00g6ej60jlfm0i09','cmpvpapsc00g4ej60gte20yxk','cmp2lo6i60007los9fkgugm6y',3,200,25),
('cmpvpapsc00g7ej60602jaey9','cmpvpapsc00g4ej60gte20yxk','cmp2lrffi000nlos95tudv53p',3,300,45),
('cmpvpt7f800ghej6038mss34p','cmpvpt7f700gfej606q2raz1i','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpvpt7f800giej606yvx9k56','cmpvpt7f700gfej606q2raz1i','cmp2lp15f000blos967db38t9',5,230,47),
('cmpvq50xf00gqej60he6cg02k','cmpvq50xf00goej603r11y9dj','cmp2lphi9000dlos92md7mytx',1,240,22),
('cmpvq50xf00grej60fxpteke3','cmpvq50xf00goej603r11y9dj','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpvq50xf00gsej606q4xzq7h','cmpvq50xf00goej603r11y9dj','cmp2lp15f000blos967db38t9',1,230,47),
('cmpvq50xf00gtej60pwfc9n8m','cmpvq50xf00goej603r11y9dj','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmpvqb7qf00h3ej60et6vbw29','cmpvqb7qf00h1ej60u8ieg9mg','cmp2lqlqc000jlos911zv8s1a',4,260,48),
('cmpvqb7qf00h4ej60ncp5vmfa','cmpvqb7qf00h1ej60u8ieg9mg','cmp2lo6i60007los9fkgugm6y',5,200,25),
('cmpwyc3dx00hfej60dfocm7j3','cmpwyc3dx00hdej60qh0ipqil','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmpwyc3dx00hgej607ry7q9ti','cmpwyc3dx00hdej60qh0ipqil','cmp2lomor0009los9510kpxfj',10,220,22),
('cmpwz0m2700hoej600tl5fo45','cmpwz0m2700hmej60aknaokpd','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmpwz0m2700hpej60pocfyju7','cmpwz0m2700hmej60aknaokpd','cmp2lnqjg0005los917eiv9lf',10,190,25),
('cmpwz0m2700hqej60t64fdbb6','cmpwz0m2700hmej60aknaokpd','cmp2lnbii0003los9oebdz6fs',10,200,22),
('cmpwz0m2700hrej6002akfxmc','cmpwz0m2700hmej60aknaokpd','cmp2lqlqc000jlos911zv8s1a',10,260,48),
('cmpwz0m2700hsej60rw2dy8sb','cmpwz0m2700hmej60aknaokpd','cmp2lr0jl000llos90f7m30dk',10,280,49),
('cmpwz0m2700htej603ltqqtsn','cmpwz0m2700hmej60aknaokpd','cmp2lq8ra000hlos9ql026eqi',10,250,48),
('cmpwz0m2700huej60af82e5gr','cmpwz0m2700hmej60aknaokpd','cmp2lrffi000nlos95tudv53p',10,300,45),
('cmpwzazub00icej606hjx46if','cmpwzazub00iaej60erq1jzj9','cmp2lomor0009los9510kpxfj',5,220,22),
('cmpwzazub00idej60j5sqiudo','cmpwzazub00iaej60erq1jzj9','cmp2lnbii0003los9oebdz6fs',5,200,22),
('cmpwzqov900ilej60yexiyww7','cmpwzqov900ijej60y5qwit3d','cmp2lomor0009los9510kpxfj',2,220,22),
('cmpwzqov900imej60qmwn2qhg','cmpwzqov900ijej60y5qwit3d','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpx0ljhj00iuej60abijxt04','cmpx0ljhj00isej600bajs4oj','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmpx0ljhj00ivej60uixydz4j','cmpx0ljhj00isej600bajs4oj','cmp2lp15f000blos967db38t9',10,230,47),
('cmpx0ljhj00iwej6040qtz00t','cmpx0ljhj00isej600bajs4oj','cmp2lqlqc000jlos911zv8s1a',10,260,48),
('cmpyfwhty00jbej60bunziplv','cmpyfwhty00j9ej6052ixwyfz','cmp2lnqjg0005los917eiv9lf',5,190,25),
('cmpyfwhty00jcej60k0pbz5e9','cmpyfwhty00j9ej6052ixwyfz','cmp2lqlqc000jlos911zv8s1a',4,260,48),
('cmpyg110100jmej60cwgmoj1m','cmpyg110100jkej60l8fnz8g2','cmp2lo6i60007los9fkgugm6y',25,200,25),
('cmpyg110100jnej60hqrrrm1f','cmpyg110100jkej60l8fnz8g2','cmp2lnqjg0005los917eiv9lf',5,190,25),
('cmpyg4gnn00jvej603s5hl8ka','cmpyg4gnm00jtej60zrpwcvnf','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpyg4gnn00jwej60r9ouilt7','cmpyg4gnm00jtej60zrpwcvnf','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpyg4gnn00jxej6048phpefq','cmpyg4gnm00jtej60zrpwcvnf','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpyggttc00k9ej60rqz8zafn','cmpyggttc00k7ej60byh2xtkf','cmp2lnbii0003los9oebdz6fs',1,200,22),
('cmpyggttc00kaej60sola0e9l','cmpyggttc00k7ej60byh2xtkf','cmp2lomor0009los9510kpxfj',1,220,22),
('cmpyhjw4w00kiej60p4g8qe5e','cmpyhjw4w00kgej60tgt7pws5','cmp2lqlqc000jlos911zv8s1a',1,260,48),
('cmpyhkwtd00kqej60ywqrp4wf','cmpyhkwtd00koej60kxlfiih7','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmpzslql300lrej603m640lqw','cmpzslql300lpej602er5kmu4','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpzslql300lsej60b0164k8b','cmpzslql300lpej602er5kmu4','cmp2lrffi000nlos95tudv53p',1,300,45),
('cmpzukjmp00lxej603e5dun2k','cmpzukjmp00lvej60s5z49k0v','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmpzukjmp00lyej60r5koctib','cmpzukjmp00lvej60s5z49k0v','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmpzukjmp00lzej60ylgt55ce','cmpzukjmp00lvej60s5z49k0v','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmpzukjmp00m0ej604mw44a0t','cmpzukjmp00lvej60s5z49k0v','cmp2lpvl0000flos9g6wqtg8e',2,250,44),
('cmpzukjmq00m1ej60b73sh5ap','cmpzukjmp00lvej60s5z49k0v','cmp2lphi9000dlos92md7mytx',2,240,22),
('cmpzukjmq00m2ej603o0in6pp','cmpzukjmp00lvej60s5z49k0v','cmp2lomor0009los9510kpxfj',2,220,22),
('cmpzukjmq00m3ej60hjmld53z','cmpzukjmp00lvej60s5z49k0v','cmp2lp15f000blos967db38t9',2,230,47),
('cmpzukjmq00m4ej60b7bmik3w','cmpzukjmp00lvej60s5z49k0v','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmpzukjmq00m5ej60t6ks1jo8','cmpzukjmp00lvej60s5z49k0v','cmp2lr0jl000llos90f7m30dk',2,280,49),
('cmpzukjmq00m6ej60i9t368sn','cmpzukjmp00lvej60s5z49k0v','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmpzukjmq00m7ej6086yaz8j3','cmpzukjmp00lvej60s5z49k0v','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmpzw6qzq00mbej60oqazo8ph','cmpzw6qzp00m9ej601muns51e','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpzw8wae00mfej60t09jjqjx','cmpzw8wae00mdej60int6q7ur','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpzw8wae00mgej60wi9nw1rx','cmpzw8wae00mdej60int6q7ur','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpzw9wbx00mkej600rim8rjo','cmpzw9wbx00miej60h2ks2dad','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmpzw9wbx00mlej605ulwjdtm','cmpzw9wbx00miej60h2ks2dad','cmp2lq8ra000hlos9ql026eqi',1,250,48),
('cmpzwcff100mpej60ggme3eel','cmpzwcff100mnej60p68lvtef','cmp2lr0jl000llos90f7m30dk',5,280,49),
('cmpzwcff100mqej60cq6347hx','cmpzwcff100mnej60p68lvtef','cmp2lnqjg0005los917eiv9lf',5,190,25),
('cmpzx7g1a00muej60rtzv9bl7','cmpzx7g1a00msej60kkhyxyj0','cmp2lq8ra000hlos9ql026eqi',10,250,48),
('cmpzx7g1a00mvej60gdfvg64b','cmpzx7g1a00msej60kkhyxyj0','cmp2lo6i60007los9fkgugm6y',10,200,25),
('cmq2xoc3300n1ej604q3pkapr','cmq2xoc3300mzej60cwu3vzcb','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmq2xoc3300n2ej60p2995wz6','cmq2xoc3300mzej60cwu3vzcb','cmp2lpvl0000flos9g6wqtg8e',2,250,44),
('cmq2xoc3300n3ej60jgqqi8vz','cmq2xoc3300mzej60cwu3vzcb','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmq2xtqcu00n7ej602y6zsgjb','cmq2xtqcu00n5ej60rxbrkpkj','cmp2lnqjg0005los917eiv9lf',10,190,25),
('cmq2xtqcu00n8ej60y2v1j3zm','cmq2xtqcu00n5ej60rxbrkpkj','cmp2lomor0009los9510kpxfj',10,220,22),
('cmq5dx23t00njej60fwxi5vjz','cmq5dx23t00nhej60rnpt3xhz','cmp2lnqjg0005los917eiv9lf',1,190,25),
('cmq5dx23t00nkej60t5etp20h','cmq5dx23t00nhej60rnpt3xhz','cmp2lo6i60007los9fkgugm6y',1,200,25),
('cmq5fksa600noej6034b28cc9','cmq5fksa600nmej60mtdhjort','cmp2lnbii0003los9oebdz6fs',5,200,22),
('cmq5fksa600npej60k41sclbb','cmq5fksa600nmej60mtdhjort','cmp2lqlqc000jlos911zv8s1a',5,260,48),
('cmq5fksa600nqej6057ud8jcb','cmq5fksa600nmej60mtdhjort','cmp2lphi9000dlos92md7mytx',5,240,22),
('cmq5fnz1c00nuej60km4t7rcr','cmq5fnz1b00nsej60r5w5xc6q','cmp2lnqjg0005los917eiv9lf',5,190,25),
('cmq5fnz1c00nvej60pta03zwc','cmq5fnz1b00nsej60r5w5xc6q','cmp2lr0jl000llos90f7m30dk',5,280,49),
('cmq5gwyzd00nzej60ga9jxe5v','cmq5gwyzc00nxej604r34f91l','cmp2lo6i60007los9fkgugm6y',2,200,25),
('cmq5gwyzd00o0ej609nyqapx0','cmq5gwyzc00nxej604r34f91l','cmp2lnqjg0005los917eiv9lf',2,190,25),
('cmq5gwyzd00o1ej603c9u15h6','cmq5gwyzc00nxej604r34f91l','cmp2lnbii0003los9oebdz6fs',2,200,22),
('cmq5gwyzd00o2ej60lglv6vmi','cmq5gwyzc00nxej604r34f91l','cmp2lpvl0000flos9g6wqtg8e',2,250,44),
('cmq5gwyzd00o3ej60xrs2o8p3','cmq5gwyzc00nxej604r34f91l','cmp2lphi9000dlos92md7mytx',2,240,22),
('cmq5gwyzd00o4ej60y6w404nr','cmq5gwyzc00nxej604r34f91l','cmp2lomor0009los9510kpxfj',2,220,22),
('cmq5gwyzd00o5ej60kcq3uwo6','cmq5gwyzc00nxej604r34f91l','cmp2lp15f000blos967db38t9',2,230,47),
('cmq5gwyzd00o6ej608i2d9itt','cmq5gwyzc00nxej604r34f91l','cmp2lqlqc000jlos911zv8s1a',2,260,48),
('cmq5gwyzd00o7ej60xs2mr0oj','cmq5gwyzc00nxej604r34f91l','cmp2lr0jl000llos90f7m30dk',2,280,49),
('cmq5gwyzd00o8ej60yiqfa139','cmq5gwyzc00nxej604r34f91l','cmp2lq8ra000hlos9ql026eqi',2,250,48),
('cmq5gwyzd00o9ej60fop2qub5','cmq5gwyzc00nxej604r34f91l','cmp2lrffi000nlos95tudv53p',2,300,45),
('cmq5nke1s00ofej60eq6wjlpb','cmq5nke1r00odej60pkw4j7l1','cmp2lomor0009los9510kpxfj',1,220,22),
('cmq5nke1s00ogej60helzo0zo','cmq5nke1r00odej60pkw4j7l1','cmp2lpvl0000flos9g6wqtg8e',1,250,44);
/*!40000 ALTER TABLE `order_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `employeeId` varchar(191) NOT NULL,
  `partnerId` varchar(191) DEFAULT NULL,
  `total` double NOT NULL,
  `discountAmount` double NOT NULL DEFAULT 0,
  `status` enum('PENDING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  `note` text DEFAULT NULL,
  `weekNumber` int(11) NOT NULL DEFAULT 0,
  `year` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `loyaltyCardId` varchar(191) DEFAULT NULL,
  `customAdjustmentType` enum('PERCENT','FIXED') DEFAULT NULL,
  `customAdjustmentValue` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_restaurantId_fkey` (`restaurantId`),
  KEY `orders_employeeId_fkey` (`employeeId`),
  KEY `orders_partnerId_fkey` (`partnerId`),
  KEY `orders_loyaltyCardId_fkey` (`loyaltyCardId`),
  CONSTRAINT `orders_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_loyaltyCardId_fkey` FOREIGN KEY (`loyaltyCardId`) REFERENCES `loyalty_cards` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partners` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES
('cmp2p4sj6001tlos9csmkilj3','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2ls7fy000rlos93h7fr7mm',26664,6666,'CONFIRMED',NULL,20,2026,'2026-05-12 13:58:34.866','2026-05-12 13:58:34.866',NULL,NULL,NULL),
('cmp2p81gm0022los923drby6p','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,114630,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:01:06.406','2026-05-12 14:01:06.406',NULL,NULL,NULL),
('cmp2pb8jn002glos9urjk7kse','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,8070,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:03:35.555','2026-05-12 14:03:35.555',NULL,NULL,NULL),
('cmp2pd51l002slos9ksjvj56b','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,2800,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:05:04.329','2026-05-12 14:05:04.329',NULL,NULL,NULL),
('cmp2pdwn4002xlos91l1acyf3','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,3600,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:05:40.096','2026-05-12 14:05:40.096',NULL,NULL,NULL),
('cmp2pdzyc0033los9fy2z2qxj','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,380,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:05:44.389','2026-05-12 14:05:44.389',NULL,NULL,NULL),
('cmp2pe7gn0037los9ludqrdwy','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1840,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:05:54.119','2026-05-12 14:05:54.119',NULL,NULL,NULL),
('cmp2peips003clos9m6zhchrx','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1340,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:06:08.704','2026-05-12 14:06:08.704',NULL,NULL,NULL),
('cmp2pfbey003ilos9ckm3doxv','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,15000,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:06:45.899','2026-05-12 14:06:45.899',NULL,NULL,NULL),
('cmp2pfgp3003nlos9irb6jinv','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,820,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:06:52.743','2026-05-12 14:06:52.743',NULL,NULL,NULL),
('cmp2pgkfe003slos9oj2nx81c','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu','cmp2lt246000zlos96q0tala4',400,100,'CONFIRMED',NULL,20,2026,'2026-05-12 14:07:44.234','2026-05-12 14:07:44.234',NULL,NULL,NULL),
('cmp2pgunw003xlos9ms9ojjki','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,3650,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:07:57.500','2026-05-12 14:07:57.500',NULL,NULL,NULL),
('cmp2ph9i90043los9pxee64en','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,7200,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:08:16.737','2026-05-12 14:08:16.737',NULL,NULL,NULL),
('cmp2phlw20049los9df424xu8','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,15000,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:08:32.787','2026-05-12 14:08:32.787',NULL,NULL,NULL),
('cmp2phni9004elos908ax9lr0','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,200,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:08:34.881','2026-05-12 14:08:34.881',NULL,NULL,NULL),
('cmp2phof5004ilos9j28kxheq','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,300,0,'CONFIRMED',NULL,20,2026,'2026-05-12 14:08:36.066','2026-05-12 14:08:36.066',NULL,NULL,NULL),
('cmp5ails80003ez8lshpijfg1','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,400,0,'CONFIRMED',NULL,20,2026,'2026-05-14 09:32:43.592','2026-05-14 09:32:43.592',NULL,NULL,NULL),
('cmp5aj9p00008ez8lh08tveit','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,400,0,'CONFIRMED',NULL,20,2026,'2026-05-14 09:33:14.580','2026-05-14 09:33:14.580',NULL,NULL,NULL),
('cmp5akcjo000eez8lbbmevscq','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,200,0,'CONFIRMED',NULL,20,2026,'2026-05-14 09:34:04.932','2026-05-14 09:34:04.932',NULL,NULL,NULL),
('cmp5ako9t000jez8lhgh1bnxe','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,600,0,'CONFIRMED',NULL,20,2026,'2026-05-14 09:34:20.130','2026-05-14 09:34:20.130',NULL,NULL,NULL),
('cmp5aksoa000nez8l8pzlppqn','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,600,0,'CONFIRMED',NULL,20,2026,'2026-05-14 09:34:25.834','2026-05-14 09:34:25.834',NULL,NULL,NULL),
('cmpadhr1k000gciepwqkwumzb','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,200,0,'CONFIRMED',NULL,20,2026,'2026-05-17 22:54:53.480','2026-05-17 22:54:53.480',NULL,NULL,NULL),
('cmpae3q2s00017xyvbs5g6y5p','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j',NULL,200,0,'CONFIRMED',NULL,21,2026,'2026-05-17 23:11:58.660','2026-05-17 23:11:58.660',NULL,NULL,NULL),
('cmpb74weh000sydh9y5msear7','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2ls1hl000plos9yitx04vg',72750,14550,'CONFIRMED',NULL,21,2026,'2026-05-18 12:44:42.377','2026-05-18 12:44:42.377',NULL,'PERCENT',25),
('cmpb77bh40014ydh9jw31pjcd','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2ls7fy000rlos93h7fr7mm',22760,4552,'CONFIRMED',NULL,21,2026,'2026-05-18 12:46:35.223','2026-05-18 12:46:35.223',NULL,'PERCENT',25),
('cmpb7a1bf001bydh9izu48tes','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2lsdhu000tlos9wbrhrk05',15390,3078,'CONFIRMED',NULL,21,2026,'2026-05-18 12:48:42.028','2026-05-18 12:48:42.028',NULL,'PERCENT',25),
('cmpbhs5rd001rydh9mhsh34eo','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,3100,0,'CONFIRMED',NULL,21,2026,'2026-05-18 17:42:43.753','2026-05-18 17:42:43.753',NULL,NULL,NULL),
('cmpbjcphf001xydh9m2k0dtgh','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,2500,0,'CONFIRMED',NULL,21,2026,'2026-05-18 18:26:42.051','2026-05-18 18:26:42.051',NULL,NULL,NULL),
('cmpbjfogf0022ydh94hwt16mc','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2500,0,'CONFIRMED',NULL,21,2026,'2026-05-18 18:29:00.687','2026-05-18 18:29:00.687',NULL,NULL,NULL),
('cmpbkfs8q0027ydh9ep6y0xjn','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu','cmp2ls1hl000plos9yitx04vg',1040,260,'CONFIRMED',NULL,21,2026,'2026-05-18 18:57:05.210','2026-05-18 18:57:05.210',NULL,NULL,NULL),
('cmpbkxebm002cydh9uugk9a58','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2730,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:10:46.978','2026-05-18 19:10:46.978',NULL,NULL,NULL),
('cmpbm26mi002hydh9cx7nd2uc','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,2450,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:42:29.898','2026-05-18 19:42:29.898',NULL,NULL,NULL),
('cmpbm2et9002mydh91z78ogop','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,890,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:42:40.509','2026-05-18 19:42:40.509',NULL,NULL,NULL),
('cmpbm9cob002sydh9h1jl7lax','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,800,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:48:04.331','2026-05-18 19:48:04.331',NULL,NULL,NULL),
('cmpbmbdhi002wydh9njiex4ff','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,7500,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:49:38.694','2026-05-18 19:49:38.694',NULL,NULL,NULL),
('cmpbmce0l0031ydh95vcot84t','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,11250,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:50:26.037','2026-05-18 19:50:26.037',NULL,NULL,NULL),
('cmpbmjr8d0037ydh9trs3jbf9','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,1920,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:56:09.757','2026-05-18 19:56:09.757',NULL,NULL,NULL),
('cmpbmkqhi003dydh99lg23db4','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1350,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:56:55.446','2026-05-18 19:56:55.446',NULL,NULL,NULL),
('cmpbmo9u9003jydh9491x08im','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,1340,0,'CONFIRMED',NULL,21,2026,'2026-05-18 19:59:40.497','2026-05-18 19:59:40.497',NULL,NULL,NULL),
('cmpcwcssj003uydh99if8nhhv','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,3000,0,'CONFIRMED',NULL,21,2026,'2026-05-19 17:18:27.523','2026-05-19 17:18:27.523',NULL,NULL,NULL),
('cmpcwk9dk0040ydh954c515fz','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1000,0,'CONFIRMED',NULL,21,2026,'2026-05-19 17:24:15.608','2026-05-19 17:24:15.608',NULL,NULL,NULL),
('cmpcwlo860045ydh95pw3c8iw','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,440,0,'CONFIRMED',NULL,21,2026,'2026-05-19 17:25:21.510','2026-05-19 17:25:21.510',NULL,NULL,NULL),
('cmpcx92sc004aydh9kk9ksd22','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1000,0,'CONFIRMED',NULL,21,2026,'2026-05-19 17:43:33.468','2026-05-19 17:43:33.468',NULL,NULL,NULL),
('cmpcx9j27004eydh9woaohw1n','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,920,0,'CONFIRMED',NULL,21,2026,'2026-05-19 17:43:54.559','2026-05-19 17:43:54.559',NULL,NULL,NULL),
('cmpcykoc5004jydh95godepjp','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,840,0,'CONFIRMED',NULL,21,2026,'2026-05-19 18:20:34.229','2026-05-19 18:20:34.229',NULL,NULL,NULL),
('cmpcylhp0004oydh9oew7qye3','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,200,0,'CONFIRMED',NULL,21,2026,'2026-05-19 18:21:12.276','2026-05-19 18:21:12.276',NULL,NULL,NULL),
('cmpcz2nbu004sydh9tlrfd4t7','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1320,0,'CONFIRMED',NULL,21,2026,'2026-05-19 18:34:32.730','2026-05-19 18:34:32.730',NULL,NULL,NULL),
('cmpczgfp0004xydh9jkf9ak5k','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,5240,0,'CONFIRMED',NULL,21,2026,'2026-05-19 18:45:16.020','2026-05-19 18:45:16.020',NULL,NULL,NULL),
('cmpczvyw3005bydh91064hjnm','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,440,0,'CONFIRMED',NULL,21,2026,'2026-05-19 18:57:20.739','2026-05-19 18:57:20.739',NULL,NULL,NULL),
('cmpczxbum005gydh9hlknaxby','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,440,0,'CONFIRMED',NULL,21,2026,'2026-05-19 18:58:24.190','2026-05-19 18:58:24.190',NULL,NULL,NULL),
('cmpd6ol67000a2guiwwv8uta8','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1320,0,'CONFIRMED',NULL,21,2026,'2026-05-19 22:07:33.680','2026-05-19 22:07:33.680',NULL,NULL,NULL),
('cmpd6pvc6000f2guiwqnmdqum','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1350,0,'CONFIRMED',NULL,21,2026,'2026-05-19 22:08:33.510','2026-05-19 22:08:33.510',NULL,NULL,NULL),
('cmpe624zh000b7xnnb2rdikly','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,4500,0,'CONFIRMED',NULL,21,2026,'2026-05-20 14:37:52.445','2026-05-20 14:37:52.445',NULL,NULL,NULL),
('cmpe63vpq000g7xnnb5jcw9cc','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,200,0,'CONFIRMED',NULL,21,2026,'2026-05-20 14:39:13.742','2026-05-20 14:39:13.742',NULL,NULL,NULL),
('cmpe6hevg000l7xnnxdjasjnc','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,840,0,'CONFIRMED',NULL,21,2026,'2026-05-20 14:49:45.100','2026-05-20 14:49:45.100',NULL,NULL,NULL),
('cmpe7ye0a000s7xnndnpweiam','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1260,0,'CONFIRMED',NULL,21,2026,'2026-05-20 15:30:56.746','2026-05-20 15:30:56.746',NULL,NULL,NULL),
('cmpe8h78b000z7xnn4i57chme','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,870,0,'CONFIRMED',NULL,21,2026,'2026-05-20 15:45:34.427','2026-05-20 15:45:34.427',NULL,NULL,NULL),
('cmpefryh800187xnnb537t8y6','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,500,0,'CONFIRMED',NULL,21,2026,'2026-05-20 19:09:53.612','2026-05-20 19:09:53.612',NULL,NULL,NULL),
('cmpeg0ke7001d7xnn5y93mz7e','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,680,0,'CONFIRMED',NULL,21,2026,'2026-05-20 19:16:35.263','2026-05-20 19:16:35.263',NULL,NULL,NULL),
('cmpegb4oy001m7xnnzllz0jjh','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1800,0,'CONFIRMED',NULL,21,2026,'2026-05-20 19:24:48.130','2026-05-20 19:24:48.130',NULL,NULL,NULL),
('cmpegckj4001r7xnn8dy826v1','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,380,0,'CONFIRMED',NULL,21,2026,'2026-05-20 19:25:55.312','2026-05-20 19:25:55.312',NULL,NULL,NULL),
('cmpeh8s3t001w7xnn0tcyfkjx','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,950,0,'CONFIRMED',NULL,21,2026,'2026-05-20 19:50:58.121','2026-05-20 19:50:58.121',NULL,NULL,NULL),
('cmpehf5rt00217xnnim3lcfiu','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,600,0,'CONFIRMED',NULL,21,2026,'2026-05-20 19:55:55.769','2026-05-20 19:55:55.769',NULL,NULL,NULL),
('cmpehw7cf00257xnnetmwosq0','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,900,0,'CONFIRMED',NULL,21,2026,'2026-05-20 20:09:10.959','2026-05-20 20:09:10.959',NULL,NULL,NULL),
('cmpei31zf002a7xnnsmaajx4b','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,500,0,'CONFIRMED',NULL,21,2026,'2026-05-20 20:14:30.603','2026-05-20 20:14:30.603',NULL,NULL,NULL),
('cmpeijmjz002f7xnnj5f4ew2q','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,900,0,'CONFIRMED',NULL,21,2026,'2026-05-20 20:27:23.759','2026-05-20 20:27:23.759',NULL,NULL,NULL),
('cmpeinbf0002k7xnndkp9icb1','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,4500,0,'CONFIRMED',NULL,21,2026,'2026-05-20 20:30:15.948','2026-05-20 20:30:15.948',NULL,NULL,NULL),
('cmpeitoz7002p7xnn98ai1q6v','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2500,0,'CONFIRMED',NULL,21,2026,'2026-05-20 20:35:13.459','2026-05-20 20:35:13.459',NULL,NULL,NULL),
('cmpeoqqsf002w7xnn4nznggae','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,1760,0,'CONFIRMED',NULL,21,2026,'2026-05-20 23:20:53.535','2026-05-20 23:20:53.535',NULL,NULL,NULL),
('cmpeotn9600317xnn1bbgpgkn','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu','cmp2ls1hl000plos9yitx04vg',1200,300,'CONFIRMED',NULL,21,2026,'2026-05-20 23:23:08.922','2026-05-20 23:23:08.922',NULL,NULL,NULL),
('cmpeovhnd00367xnnp07bpt2q','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,520,0,'CONFIRMED',NULL,21,2026,'2026-05-20 23:24:34.970','2026-05-20 23:24:34.970',NULL,NULL,NULL),
('cmpeow40x003a7xnn9hku9hp2','cmp2erbrv0000djlqauuj4q8g','cmp2lzsy9001dlos9i83vkhxu',NULL,840,0,'CONFIRMED',NULL,21,2026,'2026-05-20 23:25:03.969','2026-05-20 23:25:03.969',NULL,NULL,NULL),
('cmpfs5io9003i7xnnsljwvd41','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,2500,0,'CONFIRMED',NULL,21,2026,'2026-05-21 17:44:07.881','2026-05-21 17:44:07.881',NULL,NULL,NULL),
('cmph384z4000210yzqcw5w6u9','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9','cmp2ls1hl000plos9yitx04vg',1472,368,'CONFIRMED',NULL,21,2026,'2026-05-22 15:41:52.049','2026-05-22 15:41:52.049',NULL,NULL,NULL),
('cmph3e6k2000710yzoh6iqdt5','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,10000,0,'CONFIRMED',NULL,21,2026,'2026-05-22 15:46:34.034','2026-05-22 15:46:34.034',NULL,NULL,NULL),
('cmph3f0ws000c10yz10ueb9eu','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,820,0,'CONFIRMED',NULL,21,2026,'2026-05-22 15:47:13.372','2026-05-22 15:47:13.372',NULL,NULL,NULL),
('cmph3vy6t000j10yzg9o1jhau','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,4500,0,'CONFIRMED',NULL,21,2026,'2026-05-22 16:00:22.997','2026-05-22 16:00:22.997',NULL,NULL,NULL),
('cmpha2z50000t10yzx4senq83','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1120,0,'CONFIRMED',NULL,21,2026,'2026-05-22 18:53:48.516','2026-05-22 18:53:48.516',NULL,NULL,NULL),
('cmpioy4u1001210yz3gzt8uc1','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1500,0,'CONFIRMED',NULL,21,2026,'2026-05-23 18:37:43.033','2026-05-23 18:37:43.033',NULL,NULL,NULL),
('cmpip0l9e001710yzea4o0vwc','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1640,0,'CONFIRMED',NULL,21,2026,'2026-05-23 18:39:37.634','2026-05-23 18:39:37.634',NULL,NULL,NULL),
('cmpip19z7001e10yziibxsh0k','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,660,0,'CONFIRMED',NULL,21,2026,'2026-05-23 18:40:09.667','2026-05-23 18:40:09.667',NULL,NULL,NULL),
('cmpipeaud001m10yzq0pnqjye','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,250,0,'CONFIRMED',NULL,21,2026,'2026-05-23 18:50:17.317','2026-05-23 18:50:17.317',NULL,NULL,NULL),
('cmpipwnl2001u10yze0d5t71b','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,600,0,'CONFIRMED',NULL,21,2026,'2026-05-23 19:04:33.638','2026-05-23 19:04:33.638',NULL,NULL,NULL),
('cmpipy89d001y10yz1zqp14tc','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,2640,0,'CONFIRMED',NULL,21,2026,'2026-05-23 19:05:47.089','2026-05-23 19:05:47.089',NULL,NULL,NULL),
('cmpir248y002410yzhmzl23ve','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,430,0,'CONFIRMED',NULL,21,2026,'2026-05-23 19:36:48.130','2026-05-23 19:36:48.130',NULL,NULL,NULL),
('cmpizafxq002c10yzaziytk7n','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,2190,0,'CONFIRMED',NULL,21,2026,'2026-05-23 23:27:13.454','2026-05-23 23:27:13.454',NULL,NULL,NULL),
('cmpizb5ox002k10yz38cfs3nx','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,2190,0,'CONFIRMED',NULL,21,2026,'2026-05-23 23:27:46.832','2026-05-23 23:27:46.832',NULL,NULL,NULL),
('cmpk1xkmz002u10yzd51vhvdm','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,960,0,'CONFIRMED',NULL,21,2026,'2026-05-24 17:28:58.043','2026-05-24 17:28:58.043',NULL,NULL,NULL),
('cmpk1ymnb003510yzu7zbu79z','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2300,0,'CONFIRMED',NULL,21,2026,'2026-05-24 17:29:47.303','2026-05-24 17:29:47.303',NULL,NULL,NULL),
('cmpk2inym003a10yz5pvgirlu','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,5760,0,'CONFIRMED',NULL,21,2026,'2026-05-24 17:45:22.126','2026-05-24 17:45:22.126',NULL,NULL,NULL),
('cmpk2jjd6003f10yzu3t1nuut','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,450,0,'CONFIRMED',NULL,21,2026,'2026-05-24 17:46:02.826','2026-05-24 17:46:02.826',NULL,NULL,NULL),
('cmpk3d0k5003k10yzm3cue2x5','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,6240,0,'CONFIRMED',NULL,21,2026,'2026-05-24 18:08:58.132','2026-05-24 18:08:58.132',NULL,NULL,NULL),
('cmpkhe448003q10yzzo29wy2u','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,420,0,'CONFIRMED',NULL,22,2026,'2026-05-25 00:41:44.024','2026-05-25 00:41:44.024',NULL,NULL,NULL),
('cmpkhholn003x10yzj1tn8akn','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,2600,0,'CONFIRMED',NULL,22,2026,'2026-05-25 00:44:30.539','2026-05-25 00:44:30.539',NULL,NULL,NULL),
('cmpkiav0x004210yzwtriwiaa','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,650,0,'CONFIRMED',NULL,22,2026,'2026-05-25 01:07:11.889','2026-05-25 01:07:11.889',NULL,NULL,NULL),
('cmpkioa60004710yzipxap5qz','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,10000,0,'CONFIRMED',NULL,22,2026,'2026-05-25 01:17:38.040','2026-05-25 01:17:38.040',NULL,NULL,NULL),
('cmplcsf50004n10yz79d7hxxs','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,5000,0,'CONFIRMED',NULL,22,2026,'2026-05-25 15:20:39.589','2026-05-25 15:20:39.589',NULL,NULL,NULL),
('cmplgx5k2004s10yzcm3sm20v','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,3000,0,'CONFIRMED',NULL,22,2026,'2026-05-25 17:16:18.914','2026-05-25 17:16:18.914',NULL,NULL,NULL),
('cmplhzs2c004w10yzo9s57hsx','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,220,0,'CONFIRMED',NULL,22,2026,'2026-05-25 17:46:21.012','2026-05-25 17:46:21.012',NULL,NULL,NULL),
('cmplibi4d005210yzni5kditf','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,7700,0,'CONFIRMED',NULL,22,2026,'2026-05-25 17:55:27.997','2026-05-25 17:55:27.997',NULL,NULL,NULL),
('cmplie87m005810yzx6v1v40a','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay','cmp2lsdhu000tlos9wbrhrk05',4000,1000,'CONFIRMED',NULL,22,2026,'2026-05-25 17:57:35.122','2026-05-25 17:57:35.122',NULL,NULL,NULL),
('cmplif7k0005f10yzwfmbj0ut','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay','cmp2ls7fy000rlos93h7fr7mm',1800,450,'CONFIRMED',NULL,22,2026,'2026-05-25 17:58:20.928','2026-05-25 17:58:20.928',NULL,NULL,NULL),
('cmplre8c3005l10yzydtytjli','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,200,0,'CONFIRMED',NULL,22,2026,'2026-05-25 22:09:31.827','2026-05-25 22:09:31.827',NULL,NULL,NULL),
('cmplrhxuc005p10yzkmxtevek','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,440,0,'CONFIRMED',NULL,22,2026,'2026-05-25 22:12:24.851','2026-05-25 22:12:24.851',NULL,NULL,NULL),
('cmplrnflq005v10yz16jfvzx9','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,200,0,'CONFIRMED',NULL,22,2026,'2026-05-25 22:16:41.150','2026-05-25 22:16:41.150',NULL,NULL,NULL),
('cmplrshie005z10yzx2ncwc9y','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,840,0,'CONFIRMED',NULL,22,2026,'2026-05-25 22:20:36.902','2026-05-25 22:20:36.902',NULL,NULL,NULL),
('cmplu8cth006710yzlfhittds','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,7820,0,'CONFIRMED',NULL,22,2026,'2026-05-25 23:28:56.549','2026-05-25 23:28:56.549',NULL,NULL,NULL),
('cmpmi366j006u10yzfpxx8ljh','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2ls7fy000rlos93h7fr7mm',39600,7920,'CONFIRMED',NULL,22,2026,'2026-05-26 10:36:45.451','2026-05-26 10:36:45.451',NULL,'PERCENT',25),
('cmpmi4f5f007510yzi1vnj9jg','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2lsdhu000tlos9wbrhrk05',4380,876,'CONFIRMED',NULL,22,2026,'2026-05-26 10:37:43.731','2026-05-26 10:37:43.731',NULL,'PERCENT',25),
('cmpmkhci8007l10yzsp8e2qz3','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2ls1hl000plos9yitx04vg',91950,18390,'CONFIRMED',NULL,22,2026,'2026-05-26 11:43:46.064','2026-05-26 11:43:46.064',NULL,'PERCENT',25),
('cmpmv7n20000bej60x8xxqu1m','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,900,0,'CONFIRMED',NULL,22,2026,'2026-05-26 16:44:08.952','2026-05-26 16:44:08.952',NULL,NULL,NULL),
('cmpmwpzza000oej60y6sztgm3','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1350,0,'CONFIRMED',NULL,22,2026,'2026-05-26 17:26:25.126','2026-05-26 17:26:25.126',NULL,NULL,NULL),
('cmpmxto5y000xej60q53po9la','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,2250,0,'CONFIRMED',NULL,22,2026,'2026-05-26 17:57:16.054','2026-05-26 17:57:16.054',NULL,NULL,NULL),
('cmpmydz1l0016ej600v6r8emf','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,4000,0,'CONFIRMED',NULL,22,2026,'2026-05-26 18:13:03.273','2026-05-26 18:13:03.273',NULL,NULL,NULL),
('cmpmyizks001hej60elufgh8l','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,680,0,'CONFIRMED',NULL,22,2026,'2026-05-26 18:16:57.244','2026-05-26 18:16:57.244',NULL,NULL,NULL),
('cmpmyo0q8001tej605hc7r3az','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,260,0,'CONFIRMED',NULL,22,2026,'2026-05-26 18:20:52.016','2026-05-26 18:20:52.016',NULL,NULL,NULL),
('cmpmyp2l3001zej60vsfcmfrt','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1000,0,'CONFIRMED',NULL,22,2026,'2026-05-26 18:21:41.079','2026-05-26 18:21:41.079',NULL,NULL,NULL),
('cmpn08j60002bej608fronl8o','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1260,0,'CONFIRMED',NULL,22,2026,'2026-05-26 19:04:48.648','2026-05-26 19:04:48.648',NULL,NULL,NULL),
('cmpn0vjxk002kej60z2w7gwkv','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,420,0,'CONFIRMED',NULL,22,2026,'2026-05-26 19:22:42.728','2026-05-26 19:22:42.728',NULL,NULL,NULL),
('cmpn0zyzg002tej605r7p9to4','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,190,0,'CONFIRMED',NULL,22,2026,'2026-05-26 19:26:08.860','2026-05-26 19:26:08.860',NULL,NULL,NULL),
('cmpn1aer7002zej60h00g4xdu','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1800,0,'CONFIRMED',NULL,22,2026,'2026-05-26 19:34:15.859','2026-05-26 19:34:15.859',NULL,NULL,NULL),
('cmpn1r74j0038ej60ci8h8jvj','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1380,0,'CONFIRMED',NULL,22,2026,'2026-05-26 19:47:19.124','2026-05-26 19:47:19.124',NULL,NULL,NULL),
('cmpn20ev4003iej60jm19jdjx','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1400,0,'CONFIRMED',NULL,22,2026,'2026-05-26 19:54:29.057','2026-05-26 19:54:29.057',NULL,NULL,NULL),
('cmpn23i0b003uej60s3jmommf','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1320,0,'CONFIRMED',NULL,22,2026,'2026-05-26 19:56:53.100','2026-05-26 19:56:53.100',NULL,NULL,NULL),
('cmpof36o90045ej60sp891pz7','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1800,0,'CONFIRMED',NULL,22,2026,'2026-05-27 18:48:19.594','2026-05-27 18:48:19.594',NULL,NULL,NULL),
('cmpogzo77004eej60efzz7nyi','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1000,0,'CONFIRMED',NULL,22,2026,'2026-05-27 19:41:34.915','2026-05-27 19:41:34.915',NULL,NULL,NULL),
('cmpoh68h4004pej60ot4m0ucy','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,450,0,'CONFIRMED',NULL,22,2026,'2026-05-27 19:46:41.128','2026-05-27 19:46:41.128',NULL,NULL,NULL),
('cmpohj2zv004yej600levcsqo','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1000,0,'CONFIRMED',NULL,22,2026,'2026-05-27 19:56:40.555','2026-05-27 19:56:40.555',NULL,NULL,NULL),
('cmpohmf1u0059ej6053j7ap3q','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,940,0,'CONFIRMED',NULL,22,2026,'2026-05-27 19:59:16.146','2026-05-27 19:59:16.146',NULL,NULL,NULL),
('cmppvsiil005nej60q7vl314t','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1530,0,'CONFIRMED',NULL,22,2026,'2026-05-28 19:23:41.373','2026-05-28 19:23:41.373',NULL,NULL,NULL),
('cmppvx2800060ej60uqcrz5a4','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,1800,0,'CONFIRMED',NULL,22,2026,'2026-05-28 19:27:13.536','2026-05-28 19:27:13.536',NULL,NULL,NULL),
('cmppvyhb80069ej60x594h5uh','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,4800,0,'CONFIRMED',NULL,22,2026,'2026-05-28 19:28:19.748','2026-05-28 19:28:19.748',NULL,NULL,NULL),
('cmppwcf4c006gej60x92snje1','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,400,0,'CONFIRMED',NULL,22,2026,'2026-05-28 19:39:10.092','2026-05-28 19:39:10.092',NULL,NULL,NULL),
('cmppwef0j006mej60f6ls6y1v','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,1070,0,'CONFIRMED',NULL,22,2026,'2026-05-28 19:40:43.267','2026-05-28 19:40:43.267',NULL,NULL,NULL),
('cmppwh1vv006vej6016iuit6u','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,900,0,'CONFIRMED',NULL,22,2026,'2026-05-28 19:42:46.219','2026-05-28 19:42:46.219',NULL,NULL,NULL),
('cmppxf6b20072ej60813xwvmx','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2300,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:09:18.254','2026-05-28 20:09:18.254',NULL,NULL,NULL),
('cmppxm5sm007bej60spp0cmbw','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,1000,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:14:44.182','2026-05-28 20:14:44.182',NULL,NULL,NULL),
('cmppxmpwm007hej60jkh8rqx6','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,8400,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:15:10.246','2026-05-28 20:15:10.246',NULL,NULL,NULL),
('cmppxms7c007nej60gnmrvjii','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,5700,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:15:13.224','2026-05-28 20:15:13.224',NULL,NULL,NULL),
('cmppxoir5007tej60wf5cyi6d','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,250,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:16:34.289','2026-05-28 20:16:34.289',NULL,NULL,NULL),
('cmppxt6es007zej600t8wzqup','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2100,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:20:11.572','2026-05-28 20:20:11.572',NULL,NULL,NULL),
('cmppxurm60086ej603q1xv0th','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,500,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:21:25.710','2026-05-28 20:21:25.710',NULL,NULL,NULL),
('cmppxycxh008hej60yr5j7c6k','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,900,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:24:13.301','2026-05-28 20:24:13.301',NULL,NULL,NULL),
('cmppy36f0008oej60udhozd5q','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,450,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:27:58.140','2026-05-28 20:27:58.140',NULL,NULL,NULL),
('cmppy5o1v008xej60qjvyxohc','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,1350,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:29:54.307','2026-05-28 20:29:54.307',NULL,NULL,NULL),
('cmppy85es0096ej60tohzquhn','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,7500,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:31:50.117','2026-05-28 20:31:50.117',NULL,NULL,NULL),
('cmppy9j7h009mej60wrmvdzds','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,700,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:32:54.653','2026-05-28 20:32:54.653',NULL,NULL,NULL),
('cmppyozc4009vej60s5p7q6z3','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,2250,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:44:55.396','2026-05-28 20:44:55.396',NULL,NULL,NULL),
('cmppz0x0p00a4ej60qdpy85ss','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,200,0,'CONFIRMED',NULL,22,2026,'2026-05-28 20:54:12.265','2026-05-28 20:54:12.265',NULL,NULL,NULL),
('cmprd6wqh00aeej60fam9aer1','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,450,0,'CONFIRMED',NULL,22,2026,'2026-05-29 20:18:32.634','2026-05-29 20:18:32.634',NULL,NULL,NULL),
('cmpu5rb3u00atej60rkbksp9q','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1410,0,'CONFIRMED',NULL,22,2026,'2026-05-31 19:13:45.978','2026-05-31 19:13:45.978',NULL,NULL,NULL),
('cmpu650d000baej60hqabq5nz','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,450,0,'CONFIRMED',NULL,22,2026,'2026-05-31 19:24:25.236','2026-05-31 19:24:25.236',NULL,NULL,NULL),
('cmpu8gtt800bmej60smwdqa5m','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1380,0,'CONFIRMED',NULL,22,2026,'2026-05-31 20:29:35.853','2026-05-31 20:29:35.853',NULL,NULL,NULL),
('cmpu8xzlz00btej60q39eblqe','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1260,0,'CONFIRMED',NULL,22,2026,'2026-05-31 20:42:56.520','2026-05-31 20:42:56.520',NULL,NULL,NULL),
('cmpu95oi300c0ej60d9nus1sd','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,5000,0,'CONFIRMED',NULL,22,2026,'2026-05-31 20:48:55.371','2026-05-31 20:48:55.371',NULL,NULL,NULL),
('cmpu96jx000cbej600ry8d3e3','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,1500,0,'CONFIRMED',NULL,22,2026,'2026-05-31 20:49:36.084','2026-05-31 20:49:36.084',NULL,NULL,NULL),
('cmpua1y4700cmej60mb0uxvb0','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,1000,0,'CONFIRMED',NULL,22,2026,'2026-05-31 21:14:00.823','2026-05-31 21:14:00.823',NULL,NULL,NULL),
('cmpua4znk00cxej60x32h17j1','cmp2erbrv0000djlqauuj4q8g','cmp2lyns60019los95t0y0izb',NULL,1920,0,'CONFIRMED',NULL,22,2026,'2026-05-31 21:16:22.783','2026-05-31 21:16:22.783',NULL,'PERCENT',-20),
('cmpven1v100d7ej6038une4w6','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2ls7fy000rlos93h7fr7mm',21000,4200,'CONFIRMED',NULL,23,2026,'2026-06-01 16:10:10.093','2026-06-01 16:10:10.093',NULL,'PERCENT',25),
('cmpveoq9c00diej60v0ewb8iu','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2lsdhu000tlos9wbrhrk05',8700,1740,'CONFIRMED',NULL,23,2026,'2026-06-01 16:11:28.368','2026-06-01 16:11:28.368',NULL,'PERCENT',25),
('cmpveut2u00e0ej60z0yqydrw','cmp2erbrv0000djlqauuj4q8g','cmp2p4siw001rlos9hnpqqk1j','cmp2ls1hl000plos9yitx04vg',48270,9654,'CONFIRMED',NULL,23,2026,'2026-06-01 16:16:11.958','2026-06-01 16:16:11.958',NULL,'PERCENT',25),
('cmpvhqfc400emej60fmdhf0xg','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,720,0,'CONFIRMED',NULL,23,2026,'2026-06-01 17:36:46.372','2026-06-01 17:36:46.372',NULL,NULL,NULL),
('cmpvhvrdh00f0ej60f8xfviv9','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,200,0,'CONFIRMED',NULL,23,2026,'2026-06-01 17:40:55.253','2026-06-01 17:40:55.253',NULL,NULL,NULL),
('cmpvoevdr00fhej60gdvt2ipu','cmp2erbrv0000djlqauuj4q8g','cmpvjtsz300f8ej60uxzbroxx',NULL,450,0,'CONFIRMED',NULL,23,2026,'2026-06-01 20:43:44.607','2026-06-01 20:43:44.607',NULL,NULL,NULL),
('cmpvotaqm00fsej6030w69z4z','cmp2erbrv0000djlqauuj4q8g','cmpvjtsz300f8ej60uxzbroxx',NULL,2600,0,'CONFIRMED',NULL,23,2026,'2026-06-01 20:54:57.694','2026-06-01 20:54:57.694',NULL,NULL,NULL),
('cmpvpapsc00g4ej60gte20yxk','cmp2erbrv0000djlqauuj4q8g','cmpvjtsz300f8ej60uxzbroxx','cmp2ls7fy000rlos93h7fr7mm',1200,300,'CONFIRMED',NULL,23,2026,'2026-06-01 21:08:30.347','2026-06-01 21:08:30.347',NULL,NULL,NULL),
('cmpvpt7f700gfej606q2raz1i','cmp2erbrv0000djlqauuj4q8g','cmpvjtsz300f8ej60uxzbroxx',NULL,2150,0,'CONFIRMED',NULL,23,2026,'2026-06-01 21:22:53.011','2026-06-01 21:22:53.011',NULL,NULL,NULL),
('cmpvq50xf00goej603r11y9dj','cmp2erbrv0000djlqauuj4q8g','cmpvjtsz300f8ej60uxzbroxx',NULL,950,0,'CONFIRMED',NULL,23,2026,'2026-06-01 21:32:04.467','2026-06-01 21:32:04.467',NULL,NULL,NULL),
('cmpvqb7qf00h1ej60u8ieg9mg','cmp2erbrv0000djlqauuj4q8g','cmpvjtsz300f8ej60uxzbroxx',NULL,2040,0,'CONFIRMED',NULL,23,2026,'2026-06-01 21:36:53.223','2026-06-01 21:36:53.223',NULL,NULL,NULL),
('cmpwyc3dx00hdej60qh0ipqil','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,4200,0,'CONFIRMED',NULL,23,2026,'2026-06-02 18:09:17.349','2026-06-02 18:09:17.349',NULL,NULL,NULL),
('cmpwz0m2700hmej60aknaokpd','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,16800,0,'CONFIRMED',NULL,23,2026,'2026-06-02 18:28:21.295','2026-06-02 18:28:21.295',NULL,NULL,NULL),
('cmpwzazub00iaej60erq1jzj9','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2100,0,'CONFIRMED',NULL,23,2026,'2026-06-02 18:36:25.715','2026-06-02 18:36:25.715',NULL,NULL,NULL),
('cmpwzqov900ijej60y5qwit3d','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,640,0,'CONFIRMED',NULL,23,2026,'2026-06-02 18:48:37.987','2026-06-02 18:48:37.987',NULL,NULL,NULL),
('cmpx0ljhj00isej600bajs4oj','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,6900,0,'CONFIRMED',NULL,23,2026,'2026-06-02 19:12:37.351','2026-06-02 19:12:37.351',NULL,NULL,NULL),
('cmpyfwhty00j9ej6052ixwyfz','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,1990,0,'CONFIRMED',NULL,23,2026,'2026-06-03 19:08:48.838','2026-06-03 19:08:48.838',NULL,NULL,NULL),
('cmpyg110100jkej60l8fnz8g2','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,5950,0,'CONFIRMED',NULL,23,2026,'2026-06-03 19:12:20.305','2026-06-03 19:12:20.305',NULL,NULL,NULL),
('cmpyg4gnm00jtej60zrpwcvnf','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,670,0,'CONFIRMED',NULL,23,2026,'2026-06-03 19:15:00.562','2026-06-03 19:15:00.562',NULL,NULL,NULL),
('cmpyggttc00k7ej60byh2xtkf','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,420,0,'CONFIRMED',NULL,23,2026,'2026-06-03 19:24:37.488','2026-06-03 19:24:37.488',NULL,NULL,NULL),
('cmpyhjw4w00kgej60tgt7pws5','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,260,0,'CONFIRMED',NULL,23,2026,'2026-06-03 19:55:00.080','2026-06-03 19:55:00.080',NULL,NULL,NULL),
('cmpyhkwtd00koej60kxlfiih7','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,190,0,'CONFIRMED',NULL,23,2026,'2026-06-03 19:55:47.617','2026-06-03 19:55:47.617',NULL,NULL,NULL),
('cmpzslql300lpej602er5kmu4','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,500,0,'CONFIRMED',NULL,23,2026,'2026-06-04 17:52:08.151','2026-06-04 17:52:08.151',NULL,NULL,NULL),
('cmpzukjmp00lvej60s5z49k0v','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,5240,0,'CONFIRMED',NULL,23,2026,'2026-06-04 18:47:11.713','2026-06-04 18:47:11.713',NULL,NULL,NULL),
('cmpzw6qzp00m9ej601muns51e','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,200,0,'CONFIRMED',NULL,23,2026,'2026-06-04 19:32:27.301','2026-06-04 19:32:27.301',NULL,NULL,NULL),
('cmpzw8wae00mdej60int6q7ur','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,450,0,'CONFIRMED',NULL,23,2026,'2026-06-04 19:34:07.477','2026-06-04 19:34:07.477',NULL,NULL,NULL),
('cmpzw9wbx00miej60h2ks2dad','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,450,0,'CONFIRMED',NULL,23,2026,'2026-06-04 19:34:54.189','2026-06-04 19:34:54.189',NULL,NULL,NULL),
('cmpzwcff100mnej60p68lvtef','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2350,0,'CONFIRMED',NULL,23,2026,'2026-06-04 19:36:52.237','2026-06-04 19:36:52.237',NULL,NULL,NULL),
('cmpzx7g1a00msej60kkhyxyj0','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,4500,0,'CONFIRMED',NULL,23,2026,'2026-06-04 20:00:59.374','2026-06-04 20:00:59.374',NULL,NULL,NULL),
('cmq2xoc3300mzej60cwu3vzcb','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,1500,0,'CONFIRMED',NULL,23,2026,'2026-06-06 22:37:25.935','2026-06-06 22:37:25.935',NULL,NULL,NULL),
('cmq2xtqcu00n5ej60rxbrkpkj','cmp2erbrv0000djlqauuj4q8g','cmp2m0neo001hlos9nswt1nay',NULL,4100,0,'CONFIRMED',NULL,23,2026,'2026-06-06 22:41:37.710','2026-06-06 22:41:37.710',NULL,NULL,NULL),
('cmq5dx23t00nhej60rnpt3xhz','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,390,0,'CONFIRMED',NULL,24,2026,'2026-06-08 15:47:39.113','2026-06-08 15:47:39.113',NULL,NULL,NULL),
('cmq5fksa600nmej60mtdhjort','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,3500,0,'CONFIRMED',NULL,24,2026,'2026-06-08 16:34:05.742','2026-06-08 16:34:05.742',NULL,NULL,NULL),
('cmq5fnz1b00nsej60r5w5xc6q','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,2350,0,'CONFIRMED',NULL,24,2026,'2026-06-08 16:36:34.463','2026-06-08 16:36:34.463',NULL,NULL,NULL),
('cmq5gwyzc00nxej604r34f91l','cmp2erbrv0000djlqauuj4q8g','cmp2lx8gb0015los96kyr84e9',NULL,5240,0,'CONFIRMED',NULL,24,2026,'2026-06-08 17:11:33.912','2026-06-08 17:11:33.912',NULL,NULL,NULL),
('cmq5nke1r00odej60pkw4j7l1','cmp2erbrv0000djlqauuj4q8g','cmpvjtsz300f8ej60uxzbroxx',NULL,470,0,'CONFIRMED',NULL,24,2026,'2026-06-08 20:17:44.223','2026-06-08 20:17:44.223',NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `discountPercent` double NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `partners_restaurantId_fkey` (`restaurantId`),
  CONSTRAINT `partners_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partners`
--

LOCK TABLES `partners` WRITE;
/*!40000 ALTER TABLE `partners` DISABLE KEYS */;
INSERT INTO `partners` VALUES
('cmp2ls1hl000plos9yitx04vg','cmp2erbrv0000djlqauuj4q8g','LSPD',20,1,'2026-05-12 12:24:41.098'),
('cmp2ls7fy000rlos93h7fr7mm','cmp2erbrv0000djlqauuj4q8g','BCMS',20,1,'2026-05-12 12:24:48.814'),
('cmp2lsdhu000tlos9wbrhrk05','cmp2erbrv0000djlqauuj4q8g','Benny\'s',20,1,'2026-05-12 12:24:56.658'),
('cmp2lsj7m000vlos9nu2vhoja','cmp2erbrv0000djlqauuj4q8g','Dynasty8',20,1,'2026-05-12 12:25:04.065'),
('cmp2lsrbk000xlos9g4q2b7xc','cmp2erbrv0000djlqauuj4q8g','Luxury Car',20,0,'2026-05-12 12:25:14.572'),
('cmp2lt246000zlos96q0tala4','cmp2erbrv0000djlqauuj4q8g','Employés Coffee Noir',20,1,'2026-05-12 12:25:28.565');
/*!40000 ALTER TABLE `partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payrolls`
--

DROP TABLE IF EXISTS `payrolls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payrolls` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `employeeId` varchar(191) NOT NULL,
  `weekNumber` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `revenue` double NOT NULL,
  `costRevenue` double NOT NULL DEFAULT 0,
  `grossSalary` double NOT NULL,
  `taxes` double NOT NULL DEFAULT 0,
  `bonus` double NOT NULL DEFAULT 0,
  `netSalary` double NOT NULL,
  `dividends` double NOT NULL DEFAULT 0,
  `totalToPay` double NOT NULL DEFAULT 0,
  `isPaid` tinyint(1) NOT NULL DEFAULT 0,
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `payrolls_restaurantId_fkey` (`restaurantId`),
  KEY `payrolls_employeeId_fkey` (`employeeId`),
  CONSTRAINT `payrolls_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `payrolls_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payrolls`
--

LOCK TABLES `payrolls` WRITE;
/*!40000 ALTER TABLE `payrolls` DISABLE KEYS */;
/*!40000 ALTER TABLE `payrolls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rate_limits`
--

DROP TABLE IF EXISTS `rate_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rate_limits` (
  `key` varchar(191) NOT NULL,
  `count` int(11) NOT NULL DEFAULT 1,
  `resetAt` datetime(3) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_limits`
--

LOCK TABLES `rate_limits` WRITE;
/*!40000 ALTER TABLE `rate_limits` DISABLE KEYS */;
INSERT INTO `rate_limits` VALUES
('admin-login:78.127.132.121',1,'2026-05-14 10:24:22.410'),
('auth-login:146.70.134.174',1,'2026-05-14 08:35:19.237'),
('auth-login:149.7.98.82',1,'2026-06-07 20:02:40.080'),
('auth-login:185.13.180.48',1,'2026-06-08 12:05:46.373'),
('auth-login:194.110.115.14',1,'2026-06-03 22:40:10.766'),
('auth-login:37.165.55.231',1,'2026-05-24 15:14:03.159'),
('auth-login:37.66.89.156',1,'2026-05-19 21:56:11.228'),
('auth-login:37.66.89.97',1,'2026-05-21 20:21:08.768'),
('auth-login:77.205.19.2',1,'2026-05-29 07:00:34.780'),
('auth-login:78.127.132.121',1,'2026-06-08 20:36:13.227'),
('auth-login:78.240.151.206',1,'2026-05-25 00:40:55.729'),
('auth-login:78.240.164.21',1,'2026-05-31 17:50:26.621'),
('auth-login:78.240.204.240',1,'2026-05-23 22:50:22.404'),
('auth-login:78.240.6.119',1,'2026-05-19 16:38:50.469'),
('auth-login:78.240.78.168',1,'2026-06-04 17:46:25.503'),
('auth-login:78.240.82.86',1,'2026-05-17 22:51:13.351'),
('auth-login:78.241.142.98',1,'2026-05-26 16:37:49.168'),
('auth-login:78.241.165.118',1,'2026-05-27 18:42:00.593'),
('auth-login:78.241.197.174',1,'2026-05-20 23:10:38.616'),
('auth-login:78.241.200.97',1,'2026-05-21 17:38:23.491'),
('auth-login:78.241.26.149',1,'2026-05-23 18:23:49.774'),
('auth-login:78.241.4.91',1,'2026-05-25 20:52:30.904'),
('auth-login:78.241.83.242',1,'2026-06-03 15:54:07.429'),
('auth-login:78.242.181.201',1,'2026-05-18 17:17:24.636'),
('auth-login:78.243.112.183',1,'2026-06-08 20:13:13.388'),
('auth-login:79.80.171.23',1,'2026-06-06 17:19:03.523'),
('auth-login:80.239.186.179',1,'2026-06-01 18:59:01.861'),
('auth-login:80.9.161.11',1,'2026-05-20 19:41:22.841'),
('auth-login:82.224.246.24',1,'2026-05-13 19:35:55.756'),
('auth-login:82.65.102.77',1,'2026-06-08 19:04:34.654'),
('auth-login:83.134.96.88',1,'2026-05-30 13:49:25.489'),
('auth-login:83.195.242.233',1,'2026-05-13 13:06:42.026'),
('auth-login:86.217.38.40',1,'2026-06-08 15:28:21.426'),
('auth-login:88.165.125.54',1,'2026-05-25 15:01:08.010'),
('auth-login:88.182.66.141',1,'2026-06-06 22:36:52.541'),
('auth-login:90.104.171.205',1,'2026-05-19 22:08:27.938'),
('auth-login:90.26.163.164',1,'2026-05-23 19:22:08.804'),
('report:cmp2erbs90006djlq07rdiw3h',1,'2026-06-08 20:36:29.870'),
('report:cmp2lx8ga0013los9xin3vj18',3,'2026-06-08 15:28:25.899'),
('report:cmp4juaix0003u4kqpb6mkhnc',7,'2026-05-30 13:50:52.347'),
('report:cmp4mlbsx0006s8a01kpz7ez2',6,'2026-05-30 13:48:58.532'),
('webhook-test:cmp2erbs90006djlq07rdiw3h',1,'2026-05-14 09:13:59.031');
/*!40000 ALTER TABLE `rate_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_lines`
--

DROP TABLE IF EXISTS `recipe_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_lines` (
  `id` varchar(191) NOT NULL,
  `menuItemId` varchar(191) NOT NULL,
  `ingredientId` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `recipe_lines_menuItemId_ingredientId_key` (`menuItemId`,`ingredientId`),
  KEY `recipe_lines_menuItemId_idx` (`menuItemId`),
  KEY `recipe_lines_ingredientId_idx` (`ingredientId`),
  CONSTRAINT `recipe_lines_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `recipe_lines_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_lines`
--

LOCK TABLES `recipe_lines` WRITE;
/*!40000 ALTER TABLE `recipe_lines` DISABLE KEYS */;
INSERT INTO `recipe_lines` VALUES
('cmpd6mi8w00032guifrnqagoq','cmp2lo6i60007los9fkgugm6y','cmpb6ff3b0006ydh94quk719l',1),
('cmpd6mnny00042gui993h9lop','cmp2lnqjg0005los917eiv9lf','cmpb6gyz6000aydh9w45e2n5r',1),
('cmpd6mrgq00052gui780xkceo','cmp2lnbii0003los9oebdz6fs','cmpb6g69k0008ydh9q6tgwbba',1),
('cmpd6mvuu00062guimpqhzdk0','cmp2lpvl0000flos9g6wqtg8e','cmpb6im3s000eydh99sg0a0z3',1),
('cmpd6mvuu00072gui44ejs1co','cmp2lpvl0000flos9g6wqtg8e','cmpb6hzpe000cydh979581wz9',1),
('cmpd6uqjj000n2gui5rk6vwm5','cmp2lphi9000dlos92md7mytx','cmpb6g69k0008ydh9q6tgwbba',1),
('cmpd6uxcw000o2guiozgu5acq','cmp2lomor0009los9510kpxfj','cmpb6hzpe000cydh979581wz9',1),
('cmpd6v2wg000p2guiyj4618of','cmp2lp15f000blos967db38t9','cmpb6hzpe000cydh979581wz9',1),
('cmpd6v88e000q2guilimuizan','cmp2lqlqc000jlos911zv8s1a','cmpb6jj72000gydh9l6ldkz2k',1),
('cmpd6v88e000r2guifcpcd1lr','cmp2lqlqc000jlos911zv8s1a','cmpb6k7fz000iydh9kkf3ylyj',1),
('cmpd6vg0y000s2guix8f71o3d','cmp2lr0jl000llos90f7m30dk','cmpb6mlul000oydh9pr8hekl0',1),
('cmpd6vg0y000t2guigv0kfy7o','cmp2lr0jl000llos90f7m30dk','cmpb6l61m000kydh9qnn9jz8a',1),
('cmpd6vjnm000u2guiu93s469z','cmp2lq8ra000hlos9ql026eqi','cmpb6jj72000gydh9l6ldkz2k',1),
('cmpd6vjnm000v2guiwce9ytah','cmp2lq8ra000hlos9ql026eqi','cmpb6l61m000kydh9qnn9jz8a',1),
('cmpd6vnar000w2guic4rs2g61','cmp2lrffi000nlos95tudv53p','cmpb6lz6h000mydh94k6dkhu6',1),
('cmpd6vnar000x2gui9cazf6jd','cmp2lrffi000nlos95tudv53p','cmpb6gyz6000aydh9w45e2n5r',1);
/*!40000 ALTER TABLE `recipe_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `currency` varchar(191) NOT NULL DEFAULT '$',
  `taxRate` double NOT NULL DEFAULT 11.9,
  `bonusRate` double NOT NULL DEFAULT 10,
  `dividendRate` double NOT NULL DEFAULT 72.26,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `webhookUrl` text DEFAULT NULL,
  `webhookDay` int(11) NOT NULL DEFAULT 1,
  `webhookHour` int(11) NOT NULL DEFAULT 1,
  `stockAlertWebhookUrl` text DEFAULT NULL,
  `taxBrackets` text DEFAULT NULL,
  `taxType` enum('TYPE1','TYPE2','TYPE3','CUSTOM') NOT NULL DEFAULT 'TYPE3',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES
('cmp2erbrv0000djlqauuj4q8g','Coffee-noir','https://i.goopics.net/6z7wx3.png','$',11.9,30,45,'2026-05-12 09:08:10.460','2026-05-14 09:33:44.708','https://discord.com/api/webhooks/1504255718977703998/gIfhUMFf_uqwpCCsVJFrHgZhF_DtZ7BwSPfCdQr22sdQ1CEOCcBF2V5tw2ccmBeOgdbb',1,0,'https://discord.com/api/webhooks/1504255718977703998/gIfhUMFf_uqwpCCsVJFrHgZhF_DtZ7BwSPfCdQr22sdQ1CEOCcBF2V5tw2ccmBeOgdbb',NULL,'TYPE3'),
('cmp4mlbsn0000s8a07tg6e4gn','hiori',NULL,'$',11.9,10,72.26,'2026-05-13 22:22:59.831','2026-05-13 22:22:59.831',NULL,1,1,NULL,NULL,'TYPE3');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_sessionToken_key` (`sessionToken`),
  KEY `sessions_userId_fkey` (`userId`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `contact` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `suppliers_restaurantId_fkey` (`restaurantId`),
  CONSTRAINT `suppliers_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES
('cmp4iusyf0002xfzr47my0kh1','cmp2erbrv0000djlqauuj4q8g','Hippie Légumes','https://dyno.gg/form/b1b541c2',NULL,NULL,NULL,'2026-05-13 20:38:23.511','2026-05-19 21:59:45.223'),
('cmp4iuxcb0004xfzrbl7g2q9t','cmp2erbrv0000djlqauuj4q8g','Boucherie','https://dyno.gg/form/77d4452c',NULL,NULL,NULL,'2026-05-13 20:38:29.194','2026-05-19 21:59:30.019'),
('cmp4ivc4y0006xfzrj62oslvv','cmp2erbrv0000djlqauuj4q8g','Vignerons','https://dyno.gg/form/5fe5d4ef',NULL,NULL,NULL,'2026-05-13 20:38:48.368','2026-05-19 21:59:56.119');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `role` enum('SUPERADMIN','OWNER','MANAGER','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  `restaurantId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `failedLoginAttempts` int(11) NOT NULL DEFAULT 0,
  `lockedUntil` datetime(3) DEFAULT NULL,
  `accessRoleId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_restaurantId_fkey` (`restaurantId`),
  KEY `users_accessRoleId_fkey` (`accessRoleId`),
  CONSTRAINT `users_accessRoleId_fkey` FOREIGN KEY (`accessRoleId`) REFERENCES `access_roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('cmp2erbs90006djlq07rdiw3h','vittoria.fonelli@coffeenoir.com','Vittoria Fonelli','$2b$12$vywvjf4O73GbMKs9WxtT3uo6cvcbds8NkzmYs1iIrdzVpFz0fSX8q','OWNER','cmp2erbrv0000djlqauuj4q8g','2026-05-12 09:08:10.473','2026-06-08 20:35:13.780',0,NULL,NULL),
('cmp2lx8ga0013los9xin3vj18','elvira.holm@coffeenoir.com','Elvira Holm','$2b$12$YMHID623xKJifPmPsDpije/ym4FPsN5//uIzIyIonjl1ThCaemIEa','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-05-12 12:28:43.402','2026-06-08 15:27:22.012',0,NULL,'cmp4l70v60001s1m5wlkzglsr'),
('cmp2lyns60017los9kziplujf','lexa.hardy@coffeenoir.com','Lexa  Hardy','$2b$12$q1nyUchwp.LCSZnEvgK33eJf8Lsq8YIaZqFBXXCZtk1IfF2U.iyZi','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-05-12 12:29:49.926','2026-06-06 17:18:04.170',0,NULL,'cmpzmsgcg00kwej60lnr55dpn'),
('cmp2lzsy9001blos9xx7k6653','saber.rahmani@coffeenoir.com','Saber  Rahmani','$2b$12$r4X7jea0SKZIAp7kDSzUNOqXUUPkdFWAsDF6f.I2.n6iaUKFP410u','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-05-12 12:30:43.281','2026-06-04 15:10:34.255',0,NULL,'cmpzmsgcg00kwej60lnr55dpn'),
('cmp2m0neo001flos9kof65u1f','amir.rosa@coffeenoir.com','Amir  Rosa','$2b$12$iGrsHSJsD7WRIHgzBajrkus.y4M1SWHrBHMQ.fTglPpgKWp/ZIndq','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-05-12 12:31:22.752','2026-06-06 22:35:53.033',0,NULL,'cmpzmsgcg00kwej60lnr55dpn'),
('cmp2m1lck001jlos9xgsarxxa','darius.maddox@coffeenoir.com','Darius  Maddox','$2b$12$/jTzX9vDSsDtbduF.3tVCu2XQQH51.BaaJ8syzD3PRp3eLc4Z4AeO','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-05-12 12:32:06.740','2026-06-04 15:10:34.255',0,NULL,'cmpzmsgcg00kwej60lnr55dpn'),
('cmp2m3cdb001nlos9pvlyhqlx','Johnny.Dodge@coffeenoir.com','Johnny Dodge','$2b$12$y9iP7X5HUaJ5B8pPWWKyTO9ogIFqDMdrTcZtU36rNjEWDSTizsTle','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-05-12 12:33:28.415','2026-05-18 12:15:02.036',0,NULL,NULL),
('cmp4juaix0003u4kqpb6mkhnc','test.test@coffeenoir.com','test test','$2b$12$yqcFWz.bf2khjyF3y8OyVeZajH4Oy9xJoVBeryQ1n2Uj1gd6gFBhm','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-05-13 21:05:59.241','2026-05-30 13:48:26.075',0,NULL,'cmp4kj7oi000114hni4m9jfpy'),
('cmp4mlbsx0006s8a01kpz7ez2','hiori@hiori.com','hiori','$2b$12$P1/EWwdGO4MAUVXv2k8PvOiXTS6Ln.vrblhIl7Tw.L.nCNHOzb872','OWNER','cmp4mlbsn0000s8a07tg6e4gn','2026-05-13 22:22:59.841','2026-05-30 13:47:17.695',0,NULL,NULL),
('cmpvjtsz300f6ej60yude90m0','jack.brown@coffeenoir.com','Jack Brown','$2b$12$jYSCy.Uuq2gFX4QBNmHLYO8Fe9vyAJGHZxfQgvg.H428gu1MAvSJa','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-06-01 18:35:23.247','2026-06-08 20:12:13.945',0,NULL,'cmpzmsgcg00kwej60lnr55dpn'),
('cmpvjujt600fbej60tk3fyzl5','travis.brooks@coffeenoir.com','Travis Brooks Moon','$2b$12$3qhB6AbMa8oARnlKhYpSnO1que4a8U/2imhVdUh6rrKtK5DeOOBIG','EMPLOYEE','cmp2erbrv0000djlqauuj4q8g','2026-06-01 18:35:58.026','2026-06-04 15:10:34.255',0,NULL,'cmpzmsgcg00kwej60lnr55dpn'),
('superadmin-1','admin@admin.com','Super Admin','$2b$12$iXC4Jq5RHXMHlX8n9EzqDO9foyBUwJPDVk10VkLRUs7Aaypfm0GTG','SUPERADMIN',NULL,'2026-05-11 15:14:18.689','2026-05-11 15:14:18.689',0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_tokens`
--

DROP TABLE IF EXISTS `verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_tokens` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  UNIQUE KEY `verification_tokens_token_key` (`token`),
  UNIQUE KEY `verification_tokens_identifier_token_key` (`identifier`,`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_tokens`
--

LOCK TABLES `verification_tokens` WRITE;
/*!40000 ALTER TABLE `verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_reports`
--

DROP TABLE IF EXISTS `weekly_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `weekly_reports` (
  `id` varchar(191) NOT NULL,
  `restaurantId` varchar(191) NOT NULL,
  `weekNumber` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `revenue` double NOT NULL DEFAULT 0,
  `costRevenue` double NOT NULL DEFAULT 0,
  `salaries` double NOT NULL DEFAULT 0,
  `chargesDeductible` double NOT NULL DEFAULT 0,
  `chargesNonDeductible` double NOT NULL DEFAULT 0,
  `grossProfit` double NOT NULL DEFAULT 0,
  `taxes` double NOT NULL DEFAULT 0,
  `netProfit` double NOT NULL DEFAULT 0,
  `bonusTotal` double NOT NULL DEFAULT 0,
  `dividendTotal` double NOT NULL DEFAULT 0,
  `treasury` double NOT NULL DEFAULT 0,
  `partnerRevenue` double NOT NULL DEFAULT 0,
  `clientRevenue` double NOT NULL DEFAULT 0,
  `savedDividend` double NOT NULL DEFAULT 0,
  `savedTreasury` double NOT NULL DEFAULT 0,
  `taxDeclared` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `weekly_reports_restaurantId_weekNumber_year_key` (`restaurantId`,`weekNumber`,`year`),
  CONSTRAINT `weekly_reports_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_reports`
--

LOCK TABLES `weekly_reports` WRITE;
/*!40000 ALTER TABLE `weekly_reports` DISABLE KEYS */;
INSERT INTO `weekly_reports` VALUES
('cmp2ppxjt004mlos9u6fwk10q','cmp2erbrv0000djlqauuj4q8g',20,2026,204294,30379,132779.8,0,0,71514.20000000001,4302.840000000003,67211.36000000002,20163.408,30245.11200000001,16802.84,27064,177230,30245.11200000001,16802.84,1,'2026-05-12 14:15:01.145'),
('cmpadii5g000kciepvkwbqf3q','cmp2erbrv0000djlqauuj4q8g',21,2026,242402,35401,157143.4,0,0,85258.6,7051.720000000001,78206.88,23462.064,35193.09600000001,19551.72,114612,127790,35193.09600000001,19551.72,1,'2026-05-17 22:55:28.612'),
('cmpl8tecc004j10yz6s9kwss5','cmp2erbrv0000djlqauuj4q8g',22,2026,204220,29595,131632,15000,0,57588,1517.6,56070.4,16821.12,25231.68,14017.6,141730,62490,25231.68,14017.6,1,'2026-05-25 13:29:26.748');
/*!40000 ALTER TABLE `weekly_reports` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-06-09 11:49:05
