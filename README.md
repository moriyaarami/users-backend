
# Backend project

This project is a backend API built with Node.js to manage user data. It allows users to register, login, and view their profile.
Users are divided into three profiles, the admin who create the project,the business user and the regular user.
the business user can create cards and performe additional actions such as finding, deleting,and edition card.

In the user API calls, there are methods where you need to provide both the user's ID and their authentication token.
For the method that changes a user's status from "business" to "non-business," the token will only be updated if the user logs in again using their username and password.
In the card API calls, you need to provide the card's ID and the token of the user. 
The system will then check if you have permission to perform a specific action.

Additionally, I added two bonuses:

-Admin users can change the business number, but only if the number does not already exist in the system.
-For every API call that returns a status code above 400, the error details will be logged to a file. The file name will be the date of that day.





## Technologies Used
-node.js

-express.js

-mongoose,morgan,cors,jsonwebtoken,joi,bcrypt

-mongoDB


