-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2022 at 02:17 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `drumsaves`
--
CREATE DATABASE `drumsaves`;
USE `DRUMSAVES`;

-- --------------------------------------------------------

--
-- Table structure for table `beats`
--

CREATE TABLE `beats` (
  `beatID` int(11) NOT NULL,
  `songID` int(11) NOT NULL,
  `drum0` varchar(20) NOT NULL,
  `drum1` varchar(20) NOT NULL,
  `drum2` varchar(20) NOT NULL,
  `drum3` varchar(20) NOT NULL,
  `beat` char(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beats`
--

INSERT INTO `beats` (`beatID`, `songID`, `drum0`, `drum1`, `drum2`, `drum3`, `beat`) VALUES
(19, 23, '78kick.wav', '78snare.wav', '78hat.wav', '78open.wav', '1001000000100000000010000000100011111111111111110000000100000001'),
(20, 24, '78kick.wav', '78snare.wav', '78hat.wav', '78open.wav', '1000000010000000000010010000100110100010001000100000000000000010'),
(21, 25, '909kick.wav', '909snare.wav', '78hat.wav', '78open.wav', '1000100010110000000010000000001010101010101010100000001000000010'),
(22, 26, 'LDkick.wav', 'LDsnare.wav', '78hat.wav', '78open.wav', '1000010110100000000010000000100010101010101010100000001000000010'),
(23, 27, '78kick.wav', '78snare.wav', '78hat.wav', '78open.wav', '1010001010100010000010000000100000000000000000001000100010001000'),
(24, 28, '909kick.wav', '909snare.wav', 'LDhat.wav', '78open.wav', '0010001000100010100010001000100011111111111111110000000000000000'),
(25, 29, '78kick.wav', '78snare.wav', '78hat.wav', '78open.wav', '1000001000000000000000001000000010001000100010000000000000000010'),
(47, 51, '78kick.wav', '78snare.wav', '78hat.wav', '78open.wav', '0000000000000000000000000000000000100001010000000000000000000000');

-- --------------------------------------------------------

--
-- Table structure for table `songs`
--

CREATE TABLE `songs` (
  `songID` int(11) NOT NULL,
  `title` varchar(60) DEFAULT NULL,
  `bpm` int(11) DEFAULT NULL,
  `userID` int(11) DEFAULT NULL,
  `published` datetime DEFAULT NULL,
  `public` smallint(6) DEFAULT NULL,
  `genre` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `songs`
--

INSERT INTO `songs` (`songID`, `title`, `bpm`, `userID`, `published`, `public`, `genre`) VALUES
(23, 'cool rock beat', 80, 51, '2022-12-05 10:01:59', NULL, 'Rock'),
(24, 'jazzy beat', 120, 51, '2022-12-05 10:04:25', NULL, 'Jazz'),
(25, 'cool dance beat', 180, 51, '2022-12-05 10:05:55', NULL, 'Jazz'),
(26, 'walk this way', 112, 51, '2022-12-05 10:28:29', NULL, 'Jazz'),
(27, '80s metal', 180, 52, '2022-12-05 10:31:06', NULL, 'Rock'),
(28, 'blast beat', 190, 52, '2022-12-05 10:37:01', NULL, 'Rock'),
(29, 'slow and cool', 80, 52, '2022-12-05 10:37:43', NULL, 'Jazz'),
(51, 'newest song', 120, 51, '2022-12-08 09:40:07', NULL, 'Dance');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `bio` tinytext NOT NULL,
  `date_added` datetime NOT NULL,
  `admin` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `email`, `pass`, `bio`, `date_added`, `admin`) VALUES
(51, 'james', 'test@gmail.com', '$2a$08$f6DSteiulIh/lWxU39lrJOhw0AC6qZe1Jqj5csACHG3t6M96YH4.C', '', '2022-12-05 09:58:46', 1),
(52, 'DrumLord99', 'drumlord@gmail.com', '$2a$08$FUIynswQRTQj8noUgZ/dNO99NkgMYjyIKHoomNY..XG.PcOIcL.NK', '', '2022-12-05 10:29:43', 0),
(55, 'dude', 'dude2@dude.com', '$2a$08$EE3npQbYvGga4se/CCll8eLxMRt.euON0ZcF2Aw3mAf.MzOfb/5/a', '', '2022-12-05 12:11:22', 0),
(56, 'cooldude', 'cooldude@gmail.com', '$2a$08$qMmbIULPLH1uCaG7qAPE8OP.v3FvCKeCUp94thyrfmRE0Oa4V/aNq', '', '2022-12-05 13:13:16', 0),
(63, 'tester', 'tst', '$2a$08$2/8J97vsRdJVyq4X0CH38uMrMFrbsyAbqBUekQ2f4kTN6trdcyQlq', '', '2022-12-06 09:53:53', 1),
(73, 't', 't', '$2a$08$MFoMacaSuu9WqEmvcAllreitvrXOSi57WP8eZ5hkZKhtFpGCjYaVC', '', '2022-12-07 11:42:09', 0),
(74, 'test', 'test', '$2a$08$KVH/swGVHR.Av6b5XSGp2eLCsdNd356cRgeXi22WeF7epdwSi2xEy', '', '2022-12-10 20:16:41', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `beats`
--
ALTER TABLE `beats`
  ADD PRIMARY KEY (`beatID`);

--
-- Indexes for table `songs`
--
ALTER TABLE `songs`
  ADD PRIMARY KEY (`songID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `email` (`email`,`username`),
  ADD UNIQUE KEY `username` (`username`,`email`),
  ADD UNIQUE KEY `username_2` (`username`,`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `beats`
--
ALTER TABLE `beats`
  MODIFY `beatID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `songs`
--
ALTER TABLE `songs`
  MODIFY `songID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
