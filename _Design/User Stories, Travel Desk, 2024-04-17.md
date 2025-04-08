# User Stories, Travel Desk, 2024-04-17

## Request and Book Travel Workflow

1. Traveler submits travel request (and approved travel authorization) to travel desk

2. Travel Desk Reviews submission to ensure enough information is provided

   1. Enough Info? Yes – Continue to 3

   2. Enough Info? No – Request clarification

3. Travel Desk defines options for flights, hotels, vehicle rentals and other travel using the Travel Port System (external system – out of scope for integration for options)

4. Travel Desk exports Travel Port options as text and edits to be more readable for traveler

5. Travel Desk sends option to traveler

6. Traveler selects preference for flights

7. Travel desk checks availability of preferred flights

   1. Available? Yes proceed to 8
   2. Available? No, go to preference 2, etc. None available present new options to traveler

8. Travel desk book flights, reserves rooms and other options

9. Travel desk organizes ticketing through outside agency (not in system scope)

10. Travel Desk notifies Traveler of itinerary

11. Travel Agency tickets travel and provides information to traveler (outside of system)

PreCondition: Travel Authorization Approved and traveler requesting plane travel
PostCondition: Travel Booked with Itinerary for Travel

### 1. Traveller submits travel requests

1. As a traveler I want to submit a travel request directly from my approved travel authorization form so that I can ensure that my travel plans get organized immediately.

2. As a traveler I want to submit a travel request from an approved travel authorization record on my dashboard so I can immediately start the process once I see that I have approval to travel

3. As a traveler I want the system to automate as much information as possible on my travel request from my travel auth form so that I do not have to duplicate data entry

4. As a traveler I want to set my contact information differently than my business information so that I can receive notifications to my personal device as I do not have a business device that I will be using when travelling.

5. As a traveler I want to add a hotel (including notes about section of town or meeting/conference location) to my travel booking so that the Travel Desk agent is able to support booking the rest of my bookings

6. As a traveler I want to add a car rental (including pick location, vehicle type etc.) to my travel booking so that the Travel Desk agent is able to support booking the rest of my bookings

7. As a traveler I want to add a shuttle/train reservation to my travel booking so that the Travel Desk agent is able to support booking the rest of my booking

8. As a traveler I want to save a Draft of my request so that I can come back to it later

9. As a traveler I want to review and update my flight preferences so that I can ensure the travel desk has the correct information.

10. As a branch manager I would like to submit a travel request on behalf of one of the people in my department so I am able to support the administration of booking travel

11. As a department manager I would like to submit a travel request on behalf of one of the people in my department so I am able to support the administration of booking travel

### 2. Travel Desk Review Submission

1. As a Travel Desk User I want to view the traveler’s request so that I can ensure that I have all the information I need to book the travel.

2. As a Travel Desk User I would like to input questions or comments into the request and send it back so that I can get clarification of traveler’s preferences

3. As a Travel Desk User I would like to edit a request on behalf of a traveler so that I can get clarifications over the phone.

4. As a Travel Desk User I would like to assign a request to myself so that my co-workers know I am working on the request and they do not need to do anything on it.

5. As a Travel Desk User I would like to reassign a request to myself so that I am able to cover for a co-worker when they are away.

6. As a travel desk user I want to see a list of all request and their statuses so that I can ensure that all requests are being processed in a timely manner.

7. As a travel desk user I want to see my travel requests first so that I can easily plan my day and confirm that the requests that I am working on get completed quickly

8. As a travel desk user I want my default view to be the travel desk list screen so that I can immediately start my work and do not have to navigate to the screens.

9. As a travel desk user I would like to see the list of incomplete requests (not booked) ordered by travel start date so I can see those requests that need to be processed immediately to get the best price for the government

### 3. Travel Desk Defines Options

1. As a Travel Desk User I want to view the traveler’s request so that I can start researching options in my Travel System (external system)

2. As a Travel Desk User I would like to present potential options for travel to the traveler so that the traveler could see all potential travel times for the places and times identified

3. As a Travel Desk User I would like to copy the text from my travel port system and have the system transcribe the text into readable options so that I can decrease the amount of manual work entering information

4. As a travel desk user I would like to group the flights into segments so that the traveler is able to clearly see the options I am presenting

5. As a travel desk user I would like to enter the cost for the flights in the grouping so that the traveler is able to see all the information they require to make a decision on which flight to choose.

6. As a travel desk user I would like to define what leg of the travel the grouping is for so that the traveler can easily determine which options need to be compared.

7. As a Travel Desk User I would like to input reservations information for those items that I can book in advance of knowing the exact travel times.

8. As a Travel Desk User I want to send these options to the traveler so that they can decide when works best for them.

9. As a traveler I would like to receive email notification that options have been provided so that I can ensure that I get my travel booked in a timely manner

10. As a traveler I would like to see a link to the options on my dashboard so I can quickly get into request and select my options.

11. As travel desk user I would like to see the list of travel requests with a status change to "Options provided" so that I can easily see that I have started the processes.

12. As a branch manager I would like to see the travel requests with the status change so that I am able to define stalled requests

13. As a departmental manager I would like to see the travel requests with the status change so that I am able to define stalled requests

### 4. Traveler defines preferences

1. As a traveler I want to review the options that the travel desk provided and prioritize the options based on my preferences

2. As a traveler I want to notify that none of the options work and I would like to comment on the form so that the Travel desk can use the information to find other options

3. As a traveler I would like to submit my preferences to Travel desk user so that they are aware of my preferences and can move on to a new item

4. As a branch manager I would like to submit preferences on behalf of my coworker so that the travel request can be submitted on a timely manner

5. As a travel desk user I would like to see the travel request list with a status change to "preferences selected" so that I can see that I need to do something with travel request

6. As a travel desk user I want to see the travel request highlighted with "preferences selected" so that I know that I need to do the next step of my process.

### 5. Travel Desk Books/Reserves Travel

1. As a travel desk user I want to review the preferences selected with the #1 option highlighted so that I can quickly see what flights they prefer

2. As a travel desk user I want to select which flight was booked for the traveller so that the traveler could see which one I booked

3. As a travel desk user I want to update the flight information in case between options and preferences the flight times change

4. As a travel desk user I want to resend a set of new options in case the flights all changed between options and preferences.

5. As a travel desk user I want to input/update the booking information for the other travel items (hotel, car rental, other transportation) so that I can finalize the travel booking.

6. As a travel desk user I want to input which ticketing agent and the booking number? I have assigned this ticketing to so that the travel agent (external) can book the travel

7. As a travel desk user once I select Travel booked I would like the system to automate an email to travel agent notifying them that they should get tickets for a booking

8. As a traveler I would like to receive an email that my travel has been booked and the itinerary has been provided so that I know that I am ready to travel.

9. As a traveler I would like to see on my dashboard that my travel has been booked so that I can easily see my travel itinerary at any point

10. As a traveler I would like to see my full booking from TravelPort from my travel request so that I am fully aware of my complete itinerary

11. As a traveler I would like to be able to view my full booking from Travel Port from my dashboard so I can quickly see my itinerary.

### 6. Travel Agent Look-up

1. As a Travel desk user I want to add a new travel agent to the travel agent list so that I can add new agents to the list of travel agents YG uses

2. As a travel desk user I want to edit an existing travel agent so that I can update their email and contact information

3. As a travel desk user I want to deactivate a travel agent so that they no longer show up on the travel agent list so that we account for agents that no longer are in business.

4. As a travel desk user I want to go into the administration screen so that I can get access to the administration screens to update the travel agent look-up.

### 7. Administration

1. As a system administrator I want to add a new travel desk user to the system so that I can add new employees.

2. As a travel desk user I want to add a new travel desk user to the system so that I can add new colleague.

3. As a system administrator I want to make a travel desk user inactive so that their name does not appear in the travel desk user drop down and so that they no longer have access to the travel desk screens.

4. As a system administrator I want to reactivate a travel desk user so that I can reinstate a travel desk user that has come back from maternity leave.

5. As a travel desk user I want to make a travel desk user inactive so that their name does not appear in the travel desk user drop down and so that they no longer have access to the travel desk screens.

6. As a travel desk user I want to reactivate a travel desk user so that I can reinstate a travel desk user that has come back from maternity leave.

System administrator should have access and abilities for all users (travel desk user, branch manager, departmental manager and traveler)
