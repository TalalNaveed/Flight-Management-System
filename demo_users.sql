-- Demo Users SQL Script
-- Run this in phpMyAdmin to create demo users with password: password123

-- Update existing customer to use password123
UPDATE Customer 
SET Customer_Password = '482c811da5d5b4bc6d497ffa98491e38' 
WHERE Email = 'john@x.com';

-- Update existing staff to use password123  
UPDATE Airline_Staff 
SET Staff_Password = '482c811da5d5b4bc6d497ffa98491e38' 
WHERE Username = 'jbadmin';

-- OR create new demo users (uncomment if you want new users instead):

-- INSERT INTO Customer 
-- (Email, Customer_Password, Name, Phone_num, City, State, Passport_num, Passport_country, Passport_expiry, Date_of_birth)
-- VALUES 
-- ('john@email.com', '482c811da5d5b4bc6d497ffa98491e38', 'John Doe', '+1-212-555-1234', 'New York', 'NY', 'P123', 'USA', '2028-01-01', '2000-01-01');

-- INSERT INTO Airline_Staff 
-- (Username, Staff_Password, First_name, Last_name, Email, Date_of_birth, Airline_Name)
-- VALUES 
-- ('jetblue_staff', '482c811da5d5b4bc6d497ffa98491e38', 'Demo', 'Staff', 'staff@jetblue.com', '1990-01-01', 'Jet Blue');



