CREATE DATABASE  IF NOT EXISTS `proxy` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `proxy`;
-- MySQL dump 10.13  Distrib 5.6.24, for Win32 (x86)
-- ------------------------------------------------------
-- Server version	5.5.49-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accessLog`
--

DROP TABLE IF EXISTS `accessLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accessLog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `time_since_epoch` decimal(15,3) DEFAULT NULL,
  `time_response` int(11) DEFAULT NULL,
  `ip_client` char(15) DEFAULT NULL,
  `ip_server` char(15) DEFAULT NULL,
  `http_status_code` varchar(10) DEFAULT NULL,
  `http_reply_size` int(11) DEFAULT NULL,
  `http_method` varchar(50) DEFAULT NULL,
  `http_url` text,
  `http_username` varchar(100) DEFAULT NULL,
  `http_mime_type` varchar(50) DEFAULT NULL,
  `squid_hier_status` varchar(50) DEFAULT NULL,
  `squid_request_status` varchar(50) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `archived` smallint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_userId_time` (`userId`,`time_since_epoch`),
  KEY `ix_time` (`time_since_epoch`),
  KEY `ix_archived` (`archived`),
  CONSTRAINT `fk_accessLog_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8712065 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `accessLog_BINS`
BEFORE INSERT ON `accessLog` 

FOR EACH ROW
	BEGIN	
	declare logUserId int;

	-- declare user_identifier varchar(250);

	-- searching for the correspondent user record id in users table
	-- and store it in user_id variable
	select 
		id
	into 
		logUserId
	from
		users 
	where 
		(ip = NEW.ip_client and authMethod = 1)
		or (userPrincipalName = NEW.http_username and authMethod = 0)
	limit
		1;

	-- if found...
	if not logUserId is null then
		begin
		set NEW.userId = logUserId;
		end;
	end if;
	END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `accessLogArchive`
--

DROP TABLE IF EXISTS `accessLogArchive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accessLogArchive` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `userId` int(11) NOT NULL,
  `host` varchar(255) DEFAULT NULL,
  `traffic` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_date_userId` (`date`,`userId`),
  KEY `ix_userId` (`userId`),
  CONSTRAINT `fk_accessLogArchive_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=245800 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aclContents`
--

DROP TABLE IF EXISTS `aclContents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aclContents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `aclId` int(11) NOT NULL,
  `urlListId` int(11) NOT NULL,
  `orderNumber` smallint(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_accessTemplateId_urlListId` (`aclId`,`urlListId`),
  KEY `ix_urlListId` (`urlListId`),
  CONSTRAINT `fk_aclContents_aclId` FOREIGN KEY (`aclId`) REFERENCES `acls` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `acls`
--

DROP TABLE IF EXISTS `acls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `acls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventLog`
--

DROP TABLE IF EXISTS `eventLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventLog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `authorId` int(11) NOT NULL,
  `time_since_epoch` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` varchar(45) NOT NULL,
  `tablename` varchar(45) DEFAULT NULL,
  `objectId` int(11) DEFAULT NULL,
  `fieldname` varchar(45) DEFAULT NULL,
  `oldVal` varchar(45) DEFAULT NULL,
  `newVal` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_author` (`authorId`),
  KEY `ix_time` (`time_since_epoch`),
  KEY `ix_tablename_fieldname` (`tablename`,`fieldname`),
  CONSTRAINT `fk_eventLog_author` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rolePermissions`
--

DROP TABLE IF EXISTS `rolePermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolePermissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleId` int(11) NOT NULL,
  `permissionId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_roleId_permissionId` (`roleId`,`permissionId`),
  KEY `ix_permissionId` (`permissionId`),
  CONSTRAINT `fk_rolePermissions_permissionId` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rolePermissions_roleId` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `defaultAclId` int(11) DEFAULT NULL,
  `defaultRoleId` int(11) DEFAULT NULL,
  `currentTrafficPeriod` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_defaultAccessTemplate` (`defaultAclId`),
  KEY `ix_defaultRoleId` (`defaultRoleId`),
  CONSTRAINT `fk_settings_defaultAccessTemplate` FOREIGN KEY (`defaultAclId`) REFERENCES `acls` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_settings_defaultRoleId` FOREIGN KEY (`defaultRoleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `urlLists`
--

DROP TABLE IF EXISTS `urlLists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `urlLists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `whitelist` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `urlMasks`
--

DROP TABLE IF EXISTS `urlMasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `urlMasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `urlListId` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_urlListId_name` (`urlListId`,`name`),
  CONSTRAINT `fk_urlMasks_urlListId` FOREIGN KEY (`urlListId`) REFERENCES `urlLists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userGroups`
--

DROP TABLE IF EXISTS `userGroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userGroups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `distinguishedName` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_distinguishedName` (`distinguishedName`)
) ENGINE=InnoDB AUTO_INCREMENT=1127 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupId` int(11) NOT NULL,
  `hidden` smallint(1) NOT NULL DEFAULT '0',
  `userPrincipalName` varchar(250) NOT NULL,
  `cn` varchar(250) NOT NULL,
  `status` smallint(6) NOT NULL DEFAULT '0',
  `quota` int(11) NOT NULL DEFAULT '0',
  `authMethod` smallint(6) NOT NULL DEFAULT '0',
  `ip` varchar(15) DEFAULT NULL,
  `traffic` bigint(20) NOT NULL DEFAULT '0',
  `aclId` int(11) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  `extraQuota` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_userPrincipalName` (`userPrincipalName`),
  UNIQUE KEY `ux_ip` (`ip`),
  KEY `ix_groupId` (`groupId`),
  KEY `ix_accessTemplateId` (`aclId`),
  KEY `ix_roleId` (`roleId`),
  CONSTRAINT `fk_users_accessTemplateId` FOREIGN KEY (`aclId`) REFERENCES `acls` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_groupId` FOREIGN KEY (`groupId`) REFERENCES `userGroups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_roleId` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'proxy'
--

--
-- Dumping routines for database 'proxy'
--
/*!50003 DROP FUNCTION IF EXISTS `host_from_url` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `host_from_url`(url varchar(2048)) RETURNS varchar(255) CHARSET utf8
BEGIN
declare result varchar(2048);

set result = url;

if instr(result, '://') <> 0 then
	set result = substring(result, instr(result, '://') + length('://'));
end if;

if instr(result, ':') <> 0 then
	set result = left(result, instr(result, ':') - length(':'));
end if;

if instr(result, '/') <> 0 then
	set result = left(result, instr(result, '/') - length('/'));
end if;

RETURN result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `archiveAccessLog` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `archiveAccessLog`(IN defaultDomainName varchar(250))
BEGIN
DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;

START TRANSACTION;
	-- create temp table of new access log data
	CREATE TEMPORARY TABLE IF NOT EXISTS accessLogToArchive AS 
		(
		SELECT
			al.id,
			al.time_since_epoch,
			al.time_response,
			al.ip_client,
			al.ip_server,
			al.http_status_code,
			al.http_reply_size,
			al.http_method,
			al.http_url,
            case 
				when instr(al.http_username, '@') + instr(al.http_username, '\\') = 0 and al.http_username <> '-' then
					concat(al.http_username, '@', defaultDomainName)
				else
					al.http_username
			end as http_username,
			al.http_mime_type,
			al.squid_hier_status,
			al.squid_request_status,
			al.userId,
			al.archived
		FROM 
			accessLog as al
		where 
			al.archived is null
		);

	-- update access log archive traffic
	update 
		accessLogArchive arch,
		(
		select
			date(FROM_UNIXTIME(time_since_epoch)) as date,
			userId,
			host_from_url(http_url) as host,
			sum(http_reply_size) as traffic
		from 
			accessLogToArchive 
		where
			http_status_code like '2%'
		group by
			date,
			userId,
			host
		having
			traffic > 0
		) tmp
	set
		arch.traffic = arch.traffic + tmp.traffic
	where
		arch.date = tmp.date
		and arch.userId = tmp.userId
		and arch.host = tmp.host;

	-- insert new data to access log archive traffic
	insert into
		accessLogArchive
			(
			date,
			userId,
			host,
			traffic
			)
		select
			tmp.*
		from
			(
			select distinct
				date(FROM_UNIXTIME(time_since_epoch)) as date,
				userId,
				host_from_url(http_url) as host,
				sum(http_reply_size) as traffic
			from 
				accessLogToArchive 
			where
				http_status_code like '2%'
			group by
				date,
				userId,
				host
			having
				traffic > 0
			order by 
				id desc
			) tmp
			left join accessLogArchive arch
				on arch.date = tmp.date
				and arch.userId = tmp.userId
				and arch.host = tmp.host
		where
			arch.id is null
			and not tmp.userId is null;

	-- mark access log chunk as archived
	update
		accessLog al
		join accessLogToArchive tmp
			on al.id = tmp.id
	set
		al.archived = 1;

	-- update user counters
	update
		users u
		join 
		(
		select 
			userId,
			sum(http_reply_size) as traffic
		from 
			accessLogToArchive
		where
			http_status_code like '2%'
			and date_format(FROM_UNIXTIME(time_since_epoch), '%Y-%m') = date_format(now(), '%Y-%m')
		group by 
			userId
		having
			traffic > 0
		) traf
			on traf.userId = u.id
	set
		u.traffic = u.traffic + traf.traffic;

	-- drop temp table
	drop table accessLogToArchive;
COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-05-22  2:38:10
