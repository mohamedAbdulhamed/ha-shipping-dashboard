import axios, { AxiosResponse } from "axios";
import MD5 from "crypto-js/md5";
import Base64 from "crypto-js/enc-base64";

// Configuration for J&T Express API
const JT_API_URL = import.meta.env.VITE_JT_API_URL as string;
const JT_API_ACCOUNT = import.meta.env.VITE_JT_API_ACCOUNT as string;
const JT_PRIVATE_KEY = import.meta.env.VITE_JT_PRIVATE_KEY as string;
const CUSTOMER_CODE = import.meta.env.VITE_JT_CUSTOMER_CODE as string;
// const CUSTOMER_PASSWORD = import.meta.env.VITE_JT_CUSTOMER_PASSWORD as string;

/*
 Documentation:
  Parameter Description:
    * Headers:
      - apiAccount (Number): The api account ID of the access party on the platform.
      - digest (String): Signature string. Authenticates the transport layer (you as a partner, and that your request is timely).
      - timestamp (Number): Timestamp, milliseconds.
    * Request parameter:
      - bizContent (String): Business parameters - The string type in json format in the business parameter module.
    * Business parameters:
      - customerCode (String(30)): Customer code (provided by contacting the shipping outlet), Example: J0086024138.
      - digest (String(50)): Signature, Base64 (Md5 (customer number + cipher text + privateKey)), where the cipher text: MD5 (plain text password + jadada236t2) followed by uppercase, Example: Clear text password: KO6w29g2. Authenticates the business layer (the actual bizContent JSON).
      - txlogisticId (String(50)): Customer order number (pass the order number of the customer’s own system).
      - expressType (String(30)): Express type: only supports "EZ".
      - deliveryType (String(30)): Delivery type: 04 home delivery
      - sender (Object): Shipment information object
      - receiver (Object): Receiving information object
      - goodsType (String(30)): Item type (corresponding to the item type of the order master list):
        ITN1 Clothes

        ITN2 Document

        ITN3 Food

        ITN5 Digital product

        ITN6 Daily necessities

        ITN7 Fragile Items

        ITN8 Tools

        ITN9 Stationery

        ITN10 Furniture

        ITN11 Certificate

        ITN12 Machine Parts

        ITN13 handicraft

        ITN14 Production Materials

        ITN15 Books

        ITN16 Others
      - weight (String(12)): Weight, unit kg, range 0.01-30, Example: 0.02.
      - totalQuantity (int(4)): Total number of tickets for the package (must be 1)
      - operateType (int(4)): In the event, the customer fills in "Add" to add an order; if the customer submits "Update", then an order is updated.
        1 Adding

        2 Modifying
    * sender type description:
      - name (String(50)): Sender name.
      - phone (String(11)): Sending phone number.
      - countryCode (String(20)): Three-character country code of sending country (Egypt=EGY)
      - prov (String(60)): Sending province
      - city (String(60)): Sending city
      - area (String(60)): Shipping area
      - street (String(200)): Sending street
    * Receiver type description
      - name (String(50)): The recipient's name 
      - phone (String(11)): Receiving phone number
      - countryCode (String(20)): Three-character country code of sending country (Egypt=EGY)
      - prov (String(60)): Receiving province
      - city (String(60)): Receiving city
      - area (String(60)): Receiving area
      - street (String(200)): Receiving street
  Message description:
    * Response parameters:
      - code (String): Return code, see appendix.
      - msg (String): describe.
      - data (Object): Business data.
    * Data type description:
      - txlogisticId (String): Return customer order number.
      - createOrderTime (String): Order creation time yyyy-MM-dd HH:mm:ss.
      - sortingCode (String): Three-segment code (get the three-segment code first to return to the three-segment code, if there is no three-segment code, return to the big pen).
  Request example:
  "Header：
    apiAccount=292508153084379141
    digest=we0A7iThtk0558LsyDn3DQ==
    timestamp=1647413624337

    Body：
    bizContent={
    'customerCode': 'J0086024138',
    'digest': 'wapT8IYOjNeViOL5eZupEg==',
    'deliveryType': '04',
    'expressType': 'EZ',
    'weight': 5.02,
    'txlogisticId': 'EGYUAT72504945102',
    'operateType': 1,
    'goodsType': 'ITN1',
    'totalQuantity': '1',
    'receiver': {
      'area': 'الصبحه',
      'address': 'sdfsacdscdscdsa',
      'city': 'القوصية',
      'phone': '23423423423445',
      'countryCode': 'EGY',
      'name': 'test_receiverkjcbdskfk4kjcbdskfksdsfdsf',
      'prov': 'أسيوط',
    },
    'sender': {
      'area': 'حي الزهور',
      'street': 'street122',
      'city': 'الزقازيق',
      'phone': '1441234567843543543554311143',
      'countryCode': 'EGY',
      'name': 'test_senderkjcbdskfksfks_sfjd4kjcbdskfksdsfdsf',
      'prov': 'الشرقية',
    },
  Return example:
    {
      code:"1"
      msg:"success"
      data:{
        txlogisticId:"EGYUAT72504945102"
        billCode:"UEG000000191681"
        sortingCode:"20,J01-01,000"
        createOrderTime:"2022-03-16 08:53:45"
        lastCenterName:"10thRamadanCityHub"
      }
    }
*/

/**
 * Payload shape for creating/updating a J&T Express order
 */
export interface CreateJTOrderRequest {
  customerCode?: string;
  deliveryType?: "04";
  expressType?: "EZ";
  weight?: number; // in kg
  txlogisticId: string; // your internal order ID
  operateType?: 1 | 2; // 1 = add, 2 = update
  goodsType?: "ITN16";
  totalQuantity: number;
  sender: {
    name: string;
    phone: string;
    countryCode: "EGY";
    prov: string;
    city: string;
    area: string;
    street: string;
  };
  receiver: {
    name: string;
    phone: string;
    countryCode: "EGY";
    prov: string;
    city: string;
    area: string;
    street: string;
  };
}

/**
 * Expected API response wrapper
 */
export interface JTApiResponse<Data = any> {
  code: string;
  msg: string;
  data: Data;
}

// API function to create an order
export async function createOrder(
  payload: CreateJTOrderRequest
): Promise<JTApiResponse> {
  try {
    payload.customerCode = CUSTOMER_CODE;
    payload.operateType = 1; // Add mode
    payload.goodsType = "ITN16"; // other goods
    payload.deliveryType = "04"; // home delivery
    payload.expressType = "EZ";
    payload.weight = 1;

    // 1) compute timestamp
    const timestamp = Date.now().toString();
    console.log("Timestamp:", timestamp);

    // 2) compute header digest
    // cipher text: uppercase(MD5(plain text password + "jadada236t2"))
    const cipher = MD5("R6Dz9Q39" + "jadada236t2")
      .toString()
      .toUpperCase();

    // Body Digest: Base64(MD5(customer code + cipher text + privateKey))
    const bodyDigestRaw = MD5("J0086024417" + cipher + JT_PRIVATE_KEY);
    const bodyDigest = Base64.stringify(bodyDigestRaw);
    console.log("Body Digest:", bodyDigest);

    // 3) assemble bizContent
    const bizContentObject = { ...payload, digest: bodyDigest };

    // 4) url-encode it
    const body = new URLSearchParams();
    body.append("bizContent", JSON.stringify(bizContentObject));

    // 5) compute Header Digest: Base64(MD5(Body json encoded + privateKey))
    const headerDigestRaw = MD5(JSON.stringify(bizContentObject) + JT_PRIVATE_KEY);
    const headerDigest = Base64.stringify(headerDigestRaw);
    console.log("Header Digest:", headerDigest);

    // 6) send with correct headers and content-type
    const url = `${JT_API_URL}/order/addOrder?uuid=a3c596bf45664f52baed57e2e2626c31`;
    const headers = {
      // x-www-form-urlencoded
      "Content-Type": "application/x-www-form-urlencoded",
      apiAccount: JT_API_ACCOUNT,
      digest: headerDigest,
      timestamp: timestamp,
    };

    // const requestLog = {
    //   url,
    //   headers,
    //   bizContent: bizContentObject,
    //   // rawBody: body.toString(),
    //   // timestamp: new Date().toISOString()
    // };

    const curlCommand = `curl -X POST "${url}" \\
      -H "Content-Type: application/x-www-form-urlencoded" \\
      -H "apiAccount: ${JT_API_ACCOUNT}" \\
      -H "digest: ${headerDigest}" \\
      -H "timestamp: ${timestamp}" \\
      -d "${JSON.stringify(bizContentObject)}"`;

    console.log("\nCURL Command for J&T API Request:");
    console.log(curlCommand);
    
    // console.log("J&T API Request Details:", JSON.stringify(requestLog, null, 2));
    throw new Error("API request disabled for testing purposes");
    const response: AxiosResponse<JTApiResponse> = await axios.post(
      url,
      body.toString(),
      { headers }
    );

    console.log("Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating order:", error.message);
    throw error;
  }
}
