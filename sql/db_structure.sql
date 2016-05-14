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
  `archived` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_userId_idx` (`userId`),
  KEY `ix_userId_time` (`userId`,`time_since_epoch`),
  KEY `ix_time` (`time_since_epoch`),
  KEY `ix_archived` (`archived`),
  CONSTRAINT `fk_accessLog_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6179304 DEFAULT CHARSET=utf8;
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
  KEY `ix_date_groupId` (`date`),
  KEY `ix_date_userId` (`date`,`userId`),
  KEY `fk_userId_idx` (`userId`),
  CONSTRAINT `fk_accessLogArchive_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=162817 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accessTemplates`
--

DROP TABLE IF EXISTS `accessTemplates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accessTemplates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accessTemplatesContents`
--

DROP TABLE IF EXISTS `accessTemplatesContents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accessTemplatesContents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accessTemplateId` int(11) NOT NULL,
  `urlListId` int(11) NOT NULL,
  `orderNumber` smallint(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_accessTemplate_idx` (`accessTemplateId`),
  KEY `fk_urlList_idx` (`urlListId`),
  CONSTRAINT `fk_accessTemplate` FOREIGN KEY (`accessTemplateId`) REFERENCES `accessTemplates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_urlList` FOREIGN KEY (`urlListId`) REFERENCES `urlLists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
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
  UNIQUE KEY `role_permission_UNIQUE` (`roleId`,`permissionId`),
  KEY `role_idx` (`roleId`),
  KEY `permission_idx` (`permissionId`),
  CONSTRAINT `permission` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8;
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
  UNIQUE KEY `name_UNIQUE` (`name`)
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
  `defaultAccessTemplateId` int(11) DEFAULT NULL,
  `defaultRoleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_defaultAccessTemplate_idx` (`defaultAccessTemplateId`),
  KEY `fk_defaultRoleId_idx` (`defaultRoleId`),
  CONSTRAINT `fk_defaultAccessTemplate` FOREIGN KEY (`defaultAccessTemplateId`) REFERENCES `accessTemplates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_defaultRoleId` FOREIGN KEY (`defaultRoleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
  UNIQUE KEY `name_UNIQUE` (`name`)
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
  UNIQUE KEY `urlListId_idx` (`urlListId`,`name`),
  CONSTRAINT `urlListId` FOREIGN KEY (`urlListId`) REFERENCES `urlLists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
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
  UNIQUE KEY `distinguishedName_UNIQUE` (`distinguishedName`)
) ENGINE=InnoDB AUTO_INCREMENT=1128 DEFAULT CHARSET=utf8;
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
  `ip` varchar(15) NOT NULL DEFAULT '0.0.0.0',
  `traffic` bigint(20) DEFAULT '0',
  `accessTemplateId` int(11) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userPrincipalName_UNIQUE` (`userPrincipalName`),
  KEY `fk_group_idx` (`groupId`),
  KEY `fk_accessTemplates_idx` (`accessTemplateId`),
  KEY `fk_userRoles_idx` (`roleId`),
  CONSTRAINT `fk_accessTemplates` FOREIGN KEY (`accessTemplateId`) REFERENCES `accessTemplates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_userRoles` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_groupId` FOREIGN KEY (`groupId`) REFERENCES `userGroups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=227 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `variables`
--

DROP TABLE IF EXISTS `variables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `variables` (
  `name` varchar(25) NOT NULL,
  `value` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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

	update
		accessLog al
		join accessLogToArchive tmp
			on al.id = tmp.id
	set
		al.archived = 1;

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

	drop table accessLogToArchive;
COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `lockUsersForQuotaExceeding` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `lockUsersForQuotaExceeding`()
BEGIN
update
	users
set
	status = 2
where
	status = 1
	and round(traffic/1024/1024) > quota;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `maintenance` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `maintenance`(IN defaultDomainName varchar(250))
BEGIN
Call archiveAccessLog(defaultDomainName);
Call lockUsersForQuotaExceeding();
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `openNewTrafficPeriod` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `openNewTrafficPeriod`()
BEGIN
declare currentTrafficPeriod date;

DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;

select
	value
into
	currentTrafficPeriod
from
	variables
where
	name = 'Current traffic period';

if currentTrafficPeriod is null then
	set currentTrafficPeriod = DATE_FORMAT(NOW(),'%Y-%m-01');

	insert into
		variables(name,value)
	values
		(
		'Current traffic period',
		currentTrafficPeriod
		);
end if;

if currentTrafficPeriod <> DATE_FORMAT(NOW(),'%Y-%m-01') then
	START TRANSACTION;
		update
			users
		set
			traffic = 0;

		update
			users
		set
			status = 1
		where
			status = 2;

		update
			variables
		set
			value = DATE_FORMAT(NOW(),'%Y-%m-01')
		where
			name = 'Current traffic period';
	COMMIT;
end if;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `updateUsers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `updateUsers`()
BEGIN

-- add new groups
insert into
	userGroups
		(
		distinguishedName
		)
	select distinct
		tg.distinguishedName
	from
		tempGroups tg
		left join userGroups g
			on g.distinguishedName = tg.distinguishedName
	where
		g.ID is null;

-- hide deleted users
update
	users u
	left join tempUsers tu
		on u.userPrincipalName = tu.userPrincipalName
set
	u.hidden = 1
where
	tu.userPrincipalName is null;

-- update changed users
update
	users u
	join tempUsers tu
		on u.userPrincipalName = tu.userPrincipalName
	join userGroups g
		on g.distinguishedName = tu.distinguishedName
set
	u.cn = tu.cn,
	u.groupId = g.id,
	u.hidden = 0
where
	u.cn <> tu.cn
	or u.groupId <> g.id
	or u.hidden <> 0;

-- insert new users
insert into
	users
		(
		groupId,
		hidden,
		userPrincipalName,
		cn,
		accessTemplateId,
        roleId
		)
	select
		g.id,
		0,
		tu.userPrincipalName,
		tu.cn,
        tu.accessTemplateId,
        tu.roleId
	from
		tempUsers tu
		join userGroups g
			on g.distinguishedName = tu.distinguishedName
		left join users u
			on u.userPrincipalName = tu.userPrincipalName
	where
		u.id is null;
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

-- Dump completed on 2016-05-14 11:55:40
