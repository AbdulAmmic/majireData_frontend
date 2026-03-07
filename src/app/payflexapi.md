payflex API docs:

base url:https://client.peyflex.com.ng


User Profile:


GET
Query User Profile
https://client.peyflex.com.ng/api/user/profile/
Description: Returns the authenticated user's profile details, including full name, email, phone number, and other personal info.


GET
Query User Wallet Balance
https://client.peyflex.com.ng/api/wallet/balance/
Description: Retrieves the current wallet balance of the authenticated user.


OPTIONS
AIRTIME ENDPOINTS
Peyflex Airtime Purchase API
Welcome to our Airtime API, your fast, reliable, and developer-friendly gateway to automate airtime top-ups across all major Nigerian networks, including MTN, GLO, Airtel, and 9mobile.

Built for scale and optimized for speed, this API allows you to seamlessly integrate airtime recharge into your mobile apps, websites, or reseller platforms.

What You Can Do
Fetch available mobile networks and configurations

Perform instant airtime top-ups

Receive clean, actionable responses with detailed status

Rate-limited per user to prevent abuse and double-billing

Example Request
AIRTIME ENDPOINTS
curl
curl --location --request OPTIONS '' \
--data ''
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body
GET
Query Airtime Network Lists
https://client.peyflex.com.ng/api/airtime/networks/
Description: Returns a list of supported airtime networks along with their internal network IDs. No authentication is required. Just direct get.



AIrtime Topup: https://client.peyflex.com.ng/api/airtime/topup/

{
  "network": "mtn",
  "amount": 100,
  "mobile_number": "08144216361"
}


Query Data Network Lists


https://client.peyflex.com.ng/api/data/networks/


GET
Query Data Plans
https://client.peyflex.com.ng/api/data/plans/?network=mtn_gifting_data
Description: Returns the available data plans for a specific network (e.g., mtn_sme_data, glo_data, etc).

Example: /api/data/plans/?network=network_id || /api/data/plans/?network=mtn_sme_data

curl --location 'https://client.peyflex.com.ng/api/data/plans/?network=mtn_gifting_data' \
--data ''


https://client.peyflex.com.ng/api/data/purchase/

{
  "network": "mtn_sme_data",   // Use a valid Network ID that you fetched from the network list endpoint
  "mobile_number": "08144216361",
  "plan_code": "M500MBS"  // Use a valid Plan ID that you fetched from the plan list endpoint
}

GET
List Cable Providers
cable

https://client.peyflex.com.ng/api/cable/providers/


GET
List Cable Plan Codes
https://client.peyflex.com.ng/api/cable/plans/startimes/
Description: List all active cable providers


POST
Verify Cable IUC
https://client.peyflex.com.ng/api/cable/verify/
Description: Validates a customer's Cable TV IUC number. Authentication is required for this endpoint.

{
  "iuc": "1234567890",
  "identifier": "startimes"
}


POST
Recharge Cable TV
https://client.peyflex.com.ng/api/cable/subscribe/
Description: Charges the user's wallet and processes the Cable TV recharge for the given IUC number.


{
  "identifier": "startimes",
  "plan": "nova",
  "iuc": "1234567890",
  "phone": "081234567891",
  "amount": "17000"
}


GET
Get Electricity Plans
https://client.peyflex.com.ng/api/electricity/plans/?identifier=electricity
Description: Returns the available electricity plans for the 'electricity' identifier. No token required.


PARAMS
identifier
electricity

Identifier is electricity

meter
45145984782

Meter number to verify

plan
kaduna-electric

Fetched Plan code

type
prepaid

Type of meter (e.g. prepaid, postpaid)



GET
Verify Electricity Meter Number
https://client.peyflex.com.ng/api/electricity/verify/?identifier=electricity&meter=45145984782&plan=kaduna-electric&type=prepaid
Description: Validates a customer's meter number with the provider. No authentication required. Just direct.

PARAMS
identifier
electricity

Identifier is electricity

meter
45145984782

Meter number to verify

plan
kaduna-electric

Fetched Plan code

type
prepaid

Type of meter (e.g. prepaid, postpaid)



POST
Electricity Meter Recharge
https://client.peyflex.com.ng/api/electricity/subscribe/
Charges the user's wallet and processes the electricity bill payment for the given meter.

{
  "identifier": "electricity",
  "meter": "1234567890111",
  "plan": "benin-electric",
  "amount": "10",
  "type": "prepaid",
  "phone": "08012345678"
}