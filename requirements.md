# MM26 — Tennis & Padel Tournament Platform

## Requirements

## 1. Overview
_Brief description of the platform and its purpose._

- I'd like to build a platform to organize tournaments for racket sports.
- Players can create their accounts and use their accounts to sign up for tournaments.
- Tournament organizers can manage their tournaments on this platform.
- Spectators can find details of the tournaments.
- Admin can modify almost everything via admin panel.

## 2. Roles
- There are four roles in this platform.
  - Guest (unauth)
    - Can create a new account
    - Can login
    - Can view a list of public tournaments
    - Can view public tournament pages
    - Can view players' profile page
  - User (auth)
    - Can logout
    - Can view a list of public tournaments
    - Can view public tournament pages
    - Can view players' profile page
    - Can sign up to participate in tournaments
    - Can create tournaments
    - Can manage tournaments if they have a permission
  - Admin
    - Use different url
    - Has an access to the admin panel which allows them to modify almost everything

## 3. Target Users
_Who will use the platform? (organizers, players, clubs, referees, spectators, etc.)_

- organizers, players, spectators, admin

## 4. Pages

### 4.1 Home page
This is the page to display as a homepage when the user is not authenticated. It contains these components.
- Sign up: navigate to sign up page
- Login: show login popup
- List of tournaments: when the user clicks on a tournament, display a popup to show some important tournament details. In the popup, it contains a button to navigate to Tournament page.

### 5.2 Sign up page
- Start the account creation flow.
- Note that account creation and tournament registration are two different flows.
- A new user can create an account.
- The created account does not associate with any tournament.
- When creating an account, the user needs to provide these following information.
  - First name
  - Surname
  - Date of birth
  - Gender
  - Nationality
  - Email
  - Mobile number
- There is an option for parent / guardian to add their children to their account. The required information of each child is: First name, Surname, Date of birth, Gender, Nationality
- Need to set a password
- After successfully creating an account, the confirmation email needs to be sent to the user.
- Each player (including their children) is assigned a unique player ID.

### 5.3 Login popup
- Inputs: email and password
- Has a button to navigate to the sign up page for new users who don't have their accounts yet.
- After logging in successfully, navigate to dashboard page.

### 5.4 Dashboard page
This is the homepage when the user is authenticated. It contains these components.
- Show a small profile photo. If the user clicks, it navigates to the profile page.
- Show upcoming tournaments which the user or their children will join.
- Show tournaments which are organized/managed by this user.
- Show a list of tournaments they can join. (similar to in the homepage)

### 5.5 Tournament page
- Consider this page as a main page for the tournament so it is very important.
- Show news/announcements (from the organizer). When the user clicks on a specific news, shows news/announcement details as a popup (photo and text).
- On the tournament day, show today's schedule and results
- It needs to have entry points to these following functionalities.
  - Draws
  - Players
  - Schedule
- If the user is the organizer of the tournament, show Manage button to navigate to tournament admin page.
- Always show a button to display a popup for registration.
  - If the user is unauthorized (guest), navigate to the login flow instead.
  - To register to participate in any tournament, the user needs to log in and register by using their account.
  - When registering to participate in a tournament, the user needs to provide additional information required by the tournament.
    - Tennis: UTR, WTN, Tennis level
    - Padel: Padel level
  - Parent / guardian can register for their children. If parent / guardian also wants to register themselves, they should be able to do so.
  - After successfully registering, the confirmation email needs to be sent to the user.
  - When players register for doubles they must assign their partners player ID. If both players assign each other correctly the registration can be deemed complete.

### 5.6 Tournament admin page
- Can set the limit of the tournament.
- Can customize the theme of the Tournament page (something like colors).
- Can add/remove registered players.
- Can create a full tournament draw (manual/automatic)
- Must have the option to create several draws in one tournament. Each draw needs category name, age group, gender, dates
- When creating draws please have the options for 6U, 8U, 9U, 10U, 11U, 12U, 14U, 16U, 18U, Open, 35+, 45+, 50+
- Can add results
- Can set news/announcements
  - a short text to display in the list
  - photos and texts to display in the details popup

### 5.7 Profile page
- Show all of their details
- It is in read only mode for now. In the future, the users will be able to modify some fields but not now.
- Logout flow

## 6. Technical Requirements
_Platforms (web, mobile), tech stack preferences, integrations, etc._

- web: full support
- mobile web: full support
- iOS, Android: not support now but will need to support in the future

## 7. Non-Functional Requirements
_Performance, scalability, security, accessibility, languages._

-

## 8. Design & UX
_Look & feel, branding, accessibility considerations._

-

## 9. Constraints & Assumptions
-

## 10. Open Questions
-
