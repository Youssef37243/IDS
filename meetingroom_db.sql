-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 19, 2025 at 12:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `meetingroom_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `actionitems`
--

CREATE TABLE `actionitems` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `MinuteID` int(11) NOT NULL,
  `Description` text NOT NULL,
  `DueDate` date DEFAULT NULL,
  `Status` varchar(50) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendees`
--

CREATE TABLE `attendees` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `MeetingID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `ID` int(11) NOT NULL,
  `RoomID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `StartTime` datetime NOT NULL,
  `EndTime` datetime NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Agenda` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `minutes`
--

CREATE TABLE `minutes` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `MeetingID` int(11) NOT NULL,
  `DiscussionPoints` text DEFAULT NULL,
  `Decisions` text DEFAULT NULL,
  `SummaryPDF` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `Message` text DEFAULT NULL,
  `IsRead` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `ID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Capacity` int(11) NOT NULL,
  `Location` varchar(100) DEFAULT NULL,
  `Feature` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`ID`, `Name`, `Capacity`, `Location`, `Feature`) VALUES
(1, 'room', 12, 'saida', 'lallaa'),
(2, 'room', 12, 'saida', 'lallaa');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `FirstName`, `LastName`, `Email`, `PasswordHash`, `Role`) VALUES
(1, 'riwa', 'khodor', 'riwa@gmail.com', '123', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actionitems`
--
ALTER TABLE `actionitems`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `MinuteID` (`MinuteID`);

--
-- Indexes for table `attendees`
--
ALTER TABLE `attendees`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `UserID` (`UserID`,`MeetingID`),
  ADD KEY `MeetingID` (`MeetingID`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `RoomID` (`RoomID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `minutes`
--
ALTER TABLE `minutes`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `MeetingID` (`MeetingID`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actionitems`
--
ALTER TABLE `actionitems`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendees`
--
ALTER TABLE `attendees`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `minutes`
--
ALTER TABLE `minutes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actionitems`
--
ALTER TABLE `actionitems`
  ADD CONSTRAINT `actionitems_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `actionitems_ibfk_2` FOREIGN KEY (`MinuteID`) REFERENCES `minutes` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `attendees`
--
ALTER TABLE `attendees`
  ADD CONSTRAINT `attendees_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendees_ibfk_2` FOREIGN KEY (`MeetingID`) REFERENCES `meetings` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`RoomID`) REFERENCES `rooms` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `meetings_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `minutes`
--
ALTER TABLE `minutes`
  ADD CONSTRAINT `minutes_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `minutes_ibfk_2` FOREIGN KEY (`MeetingID`) REFERENCES `meetings` (`ID`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
