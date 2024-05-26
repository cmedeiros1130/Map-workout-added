-------------- MAP PROJECT ------------

Figma outline = Mapty.png (added to the project)
and the application snapshot is: Screenshot 2024-05-26 150903 also linked to the project

UI:
this application is to add either a cycling or running workout to your profile and save it until user would like to delete it, once added workout it will display and save to the left sidebar,
and pinpoint on the map.

HTML:
The html has a link to a public library to a map api this will be linked at the top of the page before the head ends. This link is provided by Leaflet.
Starting off the body with a side bar class posisioned on the left side of the page this contains the workouts that will be added by the user and stored on the interface until deleted
The form is default hidden until dom manipulation toggles with it. This is a dropdown section input. Then we have a hidden form which will be implemented later in java script.

script.js:
We start off the script with opening the class method.

1. - delaring date with the new date obj and delcaring id to the current date.
2. - the contructor method declares coordinates, distance and duration.
3. - we open a description method which sets the month. there is an array of months that is destructured right after. And clicks incremented that is seen in local storage
4. - We define the new workouts which will be added by the user these are 'running' and 'cycling' they each get declared to type which is later decided by a ternary operator then closing
     the workout method.

   //// APPLICATION ARCHITECTURE/////

5. - DOM manipulating using query selector to grab html elements
6. - We open the app class starting off with private properties which will be later used in the application
7. - this methods contructor method contains the calling of users position method, weather method, and get local storage method, following are the event listeners for the
     add to the new workouts added, the class will be changed depending on the users choice , the selected added click function to move to a selected workout later explained in line 39, and when the user decides to delete a workout.
8. - get position method gets the users current position using navigator.geolocation.getCurrentPosition
9. - load map function starts with stating the users lat and lng which is displayed in the console. then handling the clicks for the map when user clicks the map the form will show.
     and lastly fetching the weather data
10. - the show form functin which is called in the load map function
11. - the hide form method is used by when the user adds a workout to the list the form will be hidden until map is clicked again
12. - the newworkout function is decided when the user chooses between 'running' and 'cycling' the ternary will display the users choice on the interface with the proper inputs, starting method with looping over the array(inputs) to check if they are positive, if one of the inputs is false then every will return false.
      then functions are called starting with the workouts, when a workout is added it will be added to the #workouts array which is determined earlier in the application, then the renderworkout function is called which will be explained a little later, the hide form function is called and lastly local storage function is called.
13. - \_renderWorkoutMarker function determines the marker displayed on the map.
14. - \_renderWorkout function take the hidden html explained in line 12, and now using javascript we will display it, this is going to be the users added workout. which also has the delete button function at the end, this function will be used when the user clicks the x to delete the function.
15. - \_moveToPopup this function is when the user clicks on a specific workout the map will move and zoom to said clicked workout.
16. - we the have the local storage function to add the data added to the form to the local storage, handle delete function will remove the added data from local storage when choosen to be deleted from the ui
17. - lastly the weather app api function is made at the end of the application.
