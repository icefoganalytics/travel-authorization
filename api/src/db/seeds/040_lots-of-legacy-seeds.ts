import { Knex } from "knex"
import { isNull } from "lodash"

import {
  Stop,
  TravelAuthorization,
  TravelAuthorizationPreApprovalProfile,
  TravelDeskTravelRequest,
  TravelPurpose,
} from "@/models"

import dbLegacy from "@/db/db-client-legacy"

export async function seed(knex: Knex): Promise<void> {
  const travelAuthorizationPreApprovalProfiles =
    await TravelAuthorizationPreApprovalProfile.findAll()
  if (travelAuthorizationPreApprovalProfiles.length < 3) {
    throw new Error("Could not find enough travel authorization pre-approvals.")
  }

  // INSERT INTO public.forms ("userId","firstName","lastName",department,division,branch,unit,email,mailcode,"daysOffTravelStatus","dateBackToWork","travelDuration",purpose,"travelAdvance","eventName",summary,benefits,status,"formId","supervisorEmail","preApprovalId",approved,"requestChange","denialReason","oneWayTrip","multiStop","createdBy") VALUES
  //  (2,'Max','Parker','Highways and Public Works',NULL,NULL,NULL,'max.parker@yukon.ca',NULL,NULL,'2023-03-18',10,'Conference',1,'Global Biotechnology Summit',NULL,NULL,'Approved','1',NULL,1,NULL,NULL,NULL,false,true,NULL),
  //  (2,'Max','Parker','Highways and Public Works',NULL,NULL,NULL,'max.parker@yukon.ca',NULL,NULL,'2023-03-20',3,'Conference',1,'Gelobal  IT',NULL,NULL,'Approved','3',NULL,3,NULL,NULL,NULL,false,true,NULL),
  //  (1,'Hassan','Anvar','Highways and Public Works',NULL,NULL,NULL,'hassan.anvar@pacificintelligent.com',NULL,NULL,'2023-03-22',2,'Conference',1,'Gelobal  IT',NULL,NULL,'Approved','4',NULL,4,NULL,NULL,NULL,false,true,NULL),
  //  (2,'Jeff','Barnhardt','Highways and Public Works',NULL,NULL,NULL,'jeff.barnhardt@yukon.ca',NULL,NULL,'2023-03-25',5,'Conference',1,'Gelobal IT',NULL,NULL,'Approved','2',NULL,2,NULL,NULL,NULL,false,true,NULL);
  //  INSERT INTO public.stops (taid,"locationId","departureDate","departureTime",transport) VALUES
  //  (4,405,'2023-03-22','08:00:00','Plane'),
  //  (1,436,'2023-03-12','12:00:00','Plane'),
  //  (1,431,'2023-03-12','16:00:00','Plane'),
  //  (2,445,'2023-03-20','08:00:00','Plane'),
  //  (3,585,'2023-03-20','09:00:00','Plane');

  const travelPurposeInfoTech = await TravelPurpose.findOne({ where: { purpose: "IT" } })
  if (isNull(travelPurposeInfoTech)) {
    throw new Error("Could not find IT travel purpose.")
  }
  const [travelAuthorization1, travelAuthorization2, travelAuthorization3] =
    await TravelAuthorization.bulkCreate([
      {
        userId: 1,
        firstName: "John",
        lastName: "Doe",
        department: "IT",
        division: "IT",
        branch: "IT",
        unit: "IT",
        email: "Max.parker@yukon.ca",
        mailcode: "123",
        daysOffTravelStatus: 1,
        dateBackToWork: new Date("2019-01-01"),
        travelDuration: 1,
        purposeId: travelPurposeInfoTech.id,
        travelAdvance: 4,
        eventName: "An Event",
        summary: "Summary",
        benefits: "Benefits",
        status: TravelAuthorization.Statuses.APPROVED,
        slug: "2c2db7f4-5711-40c8-bd54-a6b7ad306319",
        supervisorEmail: "dpdavids@ynet.gov.yk.ca",
        preApprovalProfileId: travelAuthorizationPreApprovalProfiles[0].id,
        requestChange: "",
        denialReason: "",
        oneWayTrip: true,
        multiStop: true,
        createdBy: 1,
      },
      {
        userId: 1,
        firstName: "Jane",
        lastName: "Doe",
        department: "IT",
        division: "IT",
        branch: "IT",
        unit: "IT",
        email: "Max.parker@yukon.ca",
        mailcode: "123",
        daysOffTravelStatus: 1,
        dateBackToWork: new Date("2019-01-01"),
        travelDuration: 1,
        purposeId: travelPurposeInfoTech.id,
        travelAdvance: 4,
        eventName: "An Event",
        summary: "Summary",
        benefits: "Benefits",
        status: TravelAuthorization.Statuses.APPROVED,
        slug: "2c2db7f4-5711-40c8-bd54-a6b7ad306311",
        supervisorEmail: "dpdavids@ynet.gov.yk.ca",
        preApprovalProfileId: travelAuthorizationPreApprovalProfiles[1].id,
        requestChange: "",
        denialReason: "",
        oneWayTrip: true,
        multiStop: true,
        createdBy: 1,
      },
      {
        userId: 1,
        firstName: "Some Other",
        lastName: "Guy",
        department: "IT",
        division: "IT",
        branch: "IT",
        unit: "IT",
        email: "Max.parker@yukon.ca",
        mailcode: "123",
        daysOffTravelStatus: 1,
        dateBackToWork: new Date("2019-01-01"),
        travelDuration: 1,
        purposeId: travelPurposeInfoTech.id,
        travelAdvance: 4,
        eventName: "An Event",
        summary: "Summary",
        benefits: "Benefits",
        status: TravelAuthorization.Statuses.APPROVED,
        slug: "2c2db7f4-5711-40c8-bd54-a6b7ad306312",
        supervisorEmail: "dpdavids@ynet.gov.yk.ca",
        preApprovalProfileId: travelAuthorizationPreApprovalProfiles[2].id,
        requestChange: "",
        denialReason: "",
        oneWayTrip: true,
        multiStop: true,
        createdBy: 1,
      },
    ])

  // t.increments("id").notNullable().primary();
  // t.integer("travelAuthorizationId").notNullable();
  // t.integer("locationId");
  // t.specificType("departureDate", "DATE");
  // t.time("departureTime");
  // t.string("transport");

  await Stop.destroy({ where: {} })
  await Stop.bulkCreate([
    {
      travelAuthorizationId: travelAuthorization1.id,
      locationId: 1,
      departureDate: new Date("2023-05-12"),
      departureTime: "12:00:00",
      transport: "Plane",
    },
    {
      travelAuthorizationId: travelAuthorization1.id,
      locationId: 2,
      departureDate: new Date("2019-05-15"),
      departureTime: "12:00:00",
      transport: "Plane",
    },
    {
      travelAuthorizationId: travelAuthorization2.id,
      locationId: 3,
      departureDate: new Date("2023-05-12"),
      departureTime: "12:00:00",
      transport: "Plane",
    },
    {
      travelAuthorizationId: travelAuthorization2.id,
      locationId: 4,
      departureDate: new Date("2019-05-15"),
      departureTime: "12:00:00",
      transport: "Plane",
    },
    {
      travelAuthorizationId: travelAuthorization3.id,
      locationId: 5,
      departureDate: new Date("2023-05-12"),
      departureTime: "12:00:00",
      transport: "Plane",
    },
    {
      travelAuthorizationId: travelAuthorization3.id,
      locationId: 6,
      departureDate: new Date("2019-05-15"),
      departureTime: "12:00:00",
      transport: "Plane",
    },
  ])

  await dbLegacy("distanceMatrix").delete().whereRaw("1=1")
  await dbLegacy("distanceMatrix").insert([
    {
      origin: "Beaver Creek",
      destination: "Braeburn",
      kilometers: 527,
    },
    {
      origin: "Beaver Creek",
      destination: "Burwash Landing",
      kilometers: 170,
    },
    {
      origin: "Beaver Creek",
      destination: "Carcross",
      kilometers: 516,
    },
    {
      origin: "Beaver Creek",
      destination: "Carmacks",
      kilometers: 594,
    },
    {
      origin: "Beaver Creek",
      destination: "Champagne",
      kilometers: 356,
    },
    {
      origin: "Beaver Creek",
      destination: "Dawson City",
      kilometers: 950,
    },
    {
      origin: "Beaver Creek",
      destination: "Destruction Bay",
      kilometers: 186,
    },
    {
      origin: "Beaver Creek",
      destination: "Drury Creek",
      kilometers: 711,
    },
    {
      origin: "Beaver Creek",
      destination: "Elsa",
      kilometers: 868,
    },
    {
      origin: "Beaver Creek",
      destination: "Faro",
      kilometers: 776,
    },
    {
      origin: "Beaver Creek",
      destination: "Fraser",
      kilometers: 584,
    },
    {
      origin: "Beaver Creek",
      destination: "Haines Junction",
      kilometers: 291,
    },
    {
      origin: "Beaver Creek",
      destination: "Keno",
      kilometers: 881,
    },
    {
      origin: "Beaver Creek",
      destination: "Marsh Lake",
      kilometers: 507,
    },
    {
      origin: "Beaver Creek",
      destination: "Mayo",
      kilometers: 823,
    },
    {
      origin: "Beaver Creek",
      destination: "Mendenhall",
      kilometers: 380,
    },
    {
      origin: "Beaver Creek",
      destination: "Pelly Crossing",
      kilometers: 700,
    },
    {
      origin: "Beaver Creek",
      destination: "Rancheria",
      kilometers: 763,
    },
    {
      origin: "Beaver Creek",
      destination: "Ross River",
      kilometers: 827,
    },
    {
      origin: "Beaver Creek",
      destination: "Stewart Crossing",
      kilometers: 771,
    },
    {
      origin: "Beaver Creek",
      destination: "Swift River",
      kilometers: 736,
    },
    {
      origin: "Beaver Creek",
      destination: "Tagish",
      kilometers: 547,
    },
    {
      origin: "Beaver Creek",
      destination: "Teslin",
      kilometers: 622,
    },
    {
      origin: "Beaver Creek",
      destination: "Tuchitua",
      kilometers: 989,
    },
    {
      origin: "Beaver Creek",
      destination: "Upper Liard",
      kilometers: 870,
    },
    {
      origin: "Beaver Creek",
      destination: "Watson Lake",
      kilometers: 882,
    },
    {
      origin: "Beaver Creek",
      destination: "Whitehorse",
      kilometers: 446,
    },
    {
      origin: "Beaver Creek",
      destination: "Skagway",
      kilometers: 619,
    },
    {
      origin: "Beaver Creek",
      destination: "Haines",
      kilometers: 529,
    },
    {
      origin: "Braeburn",
      destination: "Burwash Landing",
      kilometers: 358,
    },
    {
      origin: "Braeburn",
      destination: "Carcross",
      kilometers: 180,
    },
    {
      origin: "Braeburn",
      destination: "Carmacks",
      kilometers: 67,
    },
    {
      origin: "Braeburn",
      destination: "Champagne",
      kilometers: 171,
    },
    {
      origin: "Braeburn",
      destination: "Dawson City",
      kilometers: 423,
    },
    {
      origin: "Braeburn",
      destination: "Destruction Bay",
      kilometers: 341,
    },
    {
      origin: "Braeburn",
      destination: "Drury Creek",
      kilometers: 184,
    },
    {
      origin: "Braeburn",
      destination: "Elsa",
      kilometers: 341,
    },
    {
      origin: "Braeburn",
      destination: "Faro",
      kilometers: 249,
    },
    {
      origin: "Braeburn",
      destination: "Fraser",
      kilometers: 248,
    },
    {
      origin: "Braeburn",
      destination: "Haines Junction",
      kilometers: 235,
    },
    {
      origin: "Braeburn",
      destination: "Keno",
      kilometers: 354,
    },
    {
      origin: "Braeburn",
      destination: "Marsh Lake",
      kilometers: 162,
    },
    {
      origin: "Braeburn",
      destination: "Mayo",
      kilometers: 296,
    },
    {
      origin: "Braeburn",
      destination: "Mendenhall",
      kilometers: 147,
    },
    {
      origin: "Braeburn",
      destination: "Pelly Crossing",
      kilometers: 173,
    },
    {
      origin: "Braeburn",
      destination: "Rancheria",
      kilometers: 427,
    },
    {
      origin: "Braeburn",
      destination: "Ross River",
      kilometers: 300,
    },
    {
      origin: "Braeburn",
      destination: "Stewart Crossing",
      kilometers: 244,
    },
    {
      origin: "Braeburn",
      destination: "Swift River",
      kilometers: 400,
    },
    {
      origin: "Braeburn",
      destination: "Tagish",
      kilometers: 211,
    },
    {
      origin: "Braeburn",
      destination: "Teslin",
      kilometers: 286,
    },
    {
      origin: "Braeburn",
      destination: "Tuchitua",
      kilometers: 544,
    },
    {
      origin: "Braeburn",
      destination: "Upper Liard",
      kilometers: 535,
    },
    {
      origin: "Braeburn",
      destination: "Watson Lake",
      kilometers: 546,
    },
    {
      origin: "Braeburn",
      destination: "Whitehorse",
      kilometers: 103,
    },
    {
      origin: "Braeburn",
      destination: "Skagway",
      kilometers: 619,
    },
    {
      origin: "Braeburn",
      destination: "Haines",
      kilometers: 529,
    },
    {
      origin: "Burwash Landing",
      destination: "Carcross",
      kilometers: 347,
    },
    {
      origin: "Burwash Landing",
      destination: "Carmacks",
      kilometers: 425,
    },
    {
      origin: "Burwash Landing",
      destination: "Champagne",
      kilometers: 187,
    },
    {
      origin: "Burwash Landing",
      destination: "Dawson City",
      kilometers: 780,
    },
    {
      origin: "Burwash Landing",
      destination: "Destruction Bay",
      kilometers: 17,
    },
    {
      origin: "Burwash Landing",
      destination: "Drury Creek",
      kilometers: 542,
    },
    {
      origin: "Burwash Landing",
      destination: "Elsa",
      kilometers: 699,
    },
    {
      origin: "Burwash Landing",
      destination: "Faro",
      kilometers: 607,
    },
    {
      origin: "Burwash Landing",
      destination: "Fraser",
      kilometers: 415,
    },
    {
      origin: "Burwash Landing",
      destination: "Haines Junction",
      kilometers: 122,
    },
    {
      origin: "Burwash Landing",
      destination: "Keno",
      kilometers: 711,
    },
    {
      origin: "Burwash Landing",
      destination: "Marsh Lake",
      kilometers: 329,
    },
    {
      origin: "Burwash Landing",
      destination: "Mayo",
      kilometers: 654,
    },
    {
      origin: "Burwash Landing",
      destination: "Mendenhall",
      kilometers: 210,
    },
    {
      origin: "Burwash Landing",
      destination: "Pelly Crossing",
      kilometers: 531,
    },
    {
      origin: "Burwash Landing",
      destination: "Rancheria",
      kilometers: 594,
    },
    {
      origin: "Burwash Landing",
      destination: "Ross River",
      kilometers: 657,
    },
    {
      origin: "Burwash Landing",
      destination: "Stewart Crossing",
      kilometers: 601,
    },
    {
      origin: "Burwash Landing",
      destination: "Swift River",
      kilometers: 566,
    },
    {
      origin: "Burwash Landing",
      destination: "Tagish",
      kilometers: 377,
    },
    {
      origin: "Burwash Landing",
      destination: "Teslin",
      kilometers: 452,
    },
    {
      origin: "Burwash Landing",
      destination: "Tuchitua",
      kilometers: 819,
    },
    {
      origin: "Burwash Landing",
      destination: "Upper Liard",
      kilometers: 701,
    },
    {
      origin: "Burwash Landing",
      destination: "Watson Lake",
      kilometers: 712,
    },
    {
      origin: "Burwash Landing",
      destination: "Whitehorse",
      kilometers: 276,
    },
    {
      origin: "Burwash Landing",
      destination: "Skagway",
      kilometers: 450,
    },
    {
      origin: "Burwash Landing",
      destination: "Haines",
      kilometers: 360,
    },
    {
      origin: "Carcross",
      destination: "Carmacks",
      kilometers: 248,
    },
    {
      origin: "Carcross",
      destination: "Champagne",
      kilometers: 161,
    },
    {
      origin: "Carcross",
      destination: "Dawson City",
      kilometers: 603,
    },
    {
      origin: "Carcross",
      destination: "Destruction Bay",
      kilometers: 331,
    },
    {
      origin: "Carcross",
      destination: "Drury Creek",
      kilometers: 364,
    },
    {
      origin: "Carcross",
      destination: "Elsa",
      kilometers: 522,
    },
    {
      origin: "Carcross",
      destination: "Faro",
      kilometers: 429,
    },
    {
      origin: "Carcross",
      destination: "Fraser",
      kilometers: 69,
    },
    {
      origin: "Carcross",
      destination: "Haines Junction",
      kilometers: 225,
    },
    {
      origin: "Carcross",
      destination: "Keno",
      kilometers: 534,
    },
    {
      origin: "Carcross",
      destination: "Marsh Lake",
      kilometers: 87,
    },
    {
      origin: "Carcross",
      destination: "Mayo",
      kilometers: 477,
    },
    {
      origin: "Carcross",
      destination: "Mendenhall",
      kilometers: 137,
    },
    {
      origin: "Carcross",
      destination: "Pelly Crossing",
      kilometers: 354,
    },
    {
      origin: "Carcross",
      destination: "Rancheria",
      kilometers: 293,
    },
    {
      origin: "Carcross",
      destination: "Ross River",
      kilometers: 480,
    },
    {
      origin: "Carcross",
      destination: "Stewart Crossing",
      kilometers: 424,
    },
    {
      origin: "Carcross",
      destination: "Swift River",
      kilometers: 265,
    },
    {
      origin: "Carcross",
      destination: "Tagish",
      kilometers: 34,
    },
    {
      origin: "Carcross",
      destination: "Teslin",
      kilometers: 151,
    },
    {
      origin: "Carcross",
      destination: "Tuchitua",
      kilometers: 518,
    },
    {
      origin: "Carcross",
      destination: "Upper Liard",
      kilometers: 400,
    },
    {
      origin: "Carcross",
      destination: "Watson Lake",
      kilometers: 411,
    },
    {
      origin: "Carcross",
      destination: "Whitehorse",
      kilometers: 73,
    },
    {
      origin: "Carcross",
      destination: "Skagway",
      kilometers: 104,
    },
    {
      origin: "Carcross",
      destination: "Haines",
      kilometers: 463,
    },
    {
      origin: "Carmacks",
      destination: "Champagne",
      kilometers: 239,
    },
    {
      origin: "Carmacks",
      destination: "Dawson City",
      kilometers: 355,
    },
    {
      origin: "Carmacks",
      destination: "Destruction Bay",
      kilometers: 408,
    },
    {
      origin: "Carmacks",
      destination: "Drury Creek",
      kilometers: 117,
    },
    {
      origin: "Carmacks",
      destination: "Elsa",
      kilometers: 274,
    },
    {
      origin: "Carmacks",
      destination: "Faro",
      kilometers: 182,
    },
    {
      origin: "Carmacks",
      destination: "Fraser",
      kilometers: 316,
    },
    {
      origin: "Carmacks",
      destination: "Haines Junction",
      kilometers: 303,
    },
    {
      origin: "Carmacks",
      destination: "Keno",
      kilometers: 287,
    },
    {
      origin: "Carmacks",
      destination: "Marsh Lake",
      kilometers: 229,
    },
    {
      origin: "Carmacks",
      destination: "Mayo",
      kilometers: 229,
    },
    {
      origin: "Carmacks",
      destination: "Mendenhall",
      kilometers: 214,
    },
    {
      origin: "Carmacks",
      destination: "Pelly Crossing",
      kilometers: 106,
    },
    {
      origin: "Carmacks",
      destination: "Rancheria",
      kilometers: 495,
    },
    {
      origin: "Carmacks",
      destination: "Ross River",
      kilometers: 233,
    },
    {
      origin: "Carmacks",
      destination: "Stewart Crossing",
      kilometers: 177,
    },
    {
      origin: "Carmacks",
      destination: "Swift River",
      kilometers: 467,
    },
    {
      origin: "Carmacks",
      destination: "Tagish",
      kilometers: 278,
    },
    {
      origin: "Carmacks",
      destination: "Teslin",
      kilometers: 353,
    },
    {
      origin: "Carmacks",
      destination: "Tuchitua",
      kilometers: 477,
    },
    {
      origin: "Carmacks",
      destination: "Upper Liard",
      kilometers: 602,
    },
    {
      origin: "Carmacks",
      destination: "Watson Lake",
      kilometers: 613,
    },
    {
      origin: "Carmacks",
      destination: "Whitehorse",
      kilometers: 177,
    },
    {
      origin: "Carmacks",
      destination: "Skagway",
      kilometers: 351,
    },
    {
      origin: "Carmacks",
      destination: "Haines",
      kilometers: 541,
    },
    {
      origin: "Champagne",
      destination: "Dawson City",
      kilometers: 594,
    },
    {
      origin: "Champagne",
      destination: "Destruction Bay",
      kilometers: 171,
    },
    {
      origin: "Champagne",
      destination: "Drury Creek",
      kilometers: 355,
    },
    {
      origin: "Champagne",
      destination: "Elsa",
      kilometers: 513,
    },
    {
      origin: "Champagne",
      destination: "Faro",
      kilometers: 420,
    },
    {
      origin: "Champagne",
      destination: "Fraser",
      kilometers: 229,
    },
    {
      origin: "Champagne",
      destination: "Haines Junction",
      kilometers: 65,
    },
    {
      origin: "Champagne",
      destination: "Keno",
      kilometers: 525,
    },
    {
      origin: "Champagne",
      destination: "Marsh Lake",
      kilometers: 143,
    },
    {
      origin: "Champagne",
      destination: "Mayo",
      kilometers: 468,
    },
    {
      origin: "Champagne",
      destination: "Mendenhall",
      kilometers: 24,
    },
    {
      origin: "Champagne",
      destination: "Pelly Crossing",
      kilometers: 345,
    },
    {
      origin: "Champagne",
      destination: "Rancheria",
      kilometers: 408,
    },
    {
      origin: "Champagne",
      destination: "Ross River",
      kilometers: 471,
    },
    {
      origin: "Champagne",
      destination: "Stewart Crossing",
      kilometers: 415,
    },
    {
      origin: "Champagne",
      destination: "Swift River",
      kilometers: 380,
    },
    {
      origin: "Champagne",
      destination: "Tagish",
      kilometers: 191,
    },
    {
      origin: "Champagne",
      destination: "Teslin",
      kilometers: 266,
    },
    {
      origin: "Champagne",
      destination: "Tuchitua",
      kilometers: 633,
    },
    {
      origin: "Champagne",
      destination: "Upper Liard",
      kilometers: 515,
    },
    {
      origin: "Champagne",
      destination: "Watson Lake",
      kilometers: 526,
    },
    {
      origin: "Champagne",
      destination: "Whitehorse",
      kilometers: 90,
    },
    {
      origin: "Champagne",
      destination: "Skagway",
      kilometers: 264,
    },
    {
      origin: "Champagne",
      destination: "Haines",
      kilometers: 303,
    },
    {
      origin: "Dawson City",
      destination: "Destruction Bay",
      kilometers: 764,
    },
    {
      origin: "Dawson City",
      destination: "Drury Creek",
      kilometers: 466,
    },
    {
      origin: "Dawson City",
      destination: "Elsa",
      kilometers: 275,
    },
    {
      origin: "Dawson City",
      destination: "Faro",
      kilometers: 531,
    },
    {
      origin: "Dawson City",
      destination: "Fraser",
      kilometers: 671,
    },
    {
      origin: "Dawson City",
      destination: "Haines Junction",
      kilometers: 658,
    },
    {
      origin: "Dawson City",
      destination: "Keno",
      kilometers: 287,
    },
    {
      origin: "Dawson City",
      destination: "Marsh Lake",
      kilometers: 585,
    },
    {
      origin: "Dawson City",
      destination: "Mayo",
      kilometers: 230,
    },
    {
      origin: "Dawson City",
      destination: "Mendenhall",
      kilometers: 850,
    },
    {
      origin: "Dawson City",
      destination: "Pelly Crossing",
      kilometers: 582,
    },
    {
      origin: "Dawson City",
      destination: "Rancheria",
      kilometers: 179,
    },
    {
      origin: "Dawson City",
      destination: "Ross River",
      kilometers: 582,
    },
    {
      origin: "Dawson City",
      destination: "Stewart Crossing",
      kilometers: 179,
    },
    {
      origin: "Dawson City",
      destination: "Swift River",
      kilometers: 822,
    },
    {
      origin: "Dawson City",
      destination: "Tagish",
      kilometers: 634,
    },
    {
      origin: "Dawson City",
      destination: "Teslin",
      kilometers: 708,
    },
    {
      origin: "Dawson City",
      destination: "Tuchitua",
      kilometers: 826,
    },
    {
      origin: "Dawson City",
      destination: "Upper Liard",
      kilometers: 957,
    },
    {
      origin: "Dawson City",
      destination: "Watson Lake",
      kilometers: 968,
    },
    {
      origin: "Dawson City",
      destination: "Whitehorse",
      kilometers: 532,
    },
    {
      origin: "Dawson City",
      destination: "Skagway",
      kilometers: 706,
    },
    {
      origin: "Dawson City",
      destination: "Haines",
      kilometers: 896,
    },
    {
      origin: "Destruction Bay",
      destination: "Drury Creek",
      kilometers: 525,
    },
    {
      origin: "Destruction Bay",
      destination: "Elsa",
      kilometers: 682,
    },
    {
      origin: "Destruction Bay",
      destination: "Faro",
      kilometers: 590,
    },
    {
      origin: "Destruction Bay",
      destination: "Fraser",
      kilometers: 399,
    },
    {
      origin: "Destruction Bay",
      destination: "Haines Junction",
      kilometers: 106,
    },
    {
      origin: "Destruction Bay",
      destination: "Keno",
      kilometers: 695,
    },
    {
      origin: "Destruction Bay",
      destination: "Marsh Lake",
      kilometers: 312,
    },
    {
      origin: "Destruction Bay",
      destination: "Mayo",
      kilometers: 637,
    },
    {
      origin: "Destruction Bay",
      destination: "Mendenhall",
      kilometers: 194,
    },
    {
      origin: "Destruction Bay",
      destination: "Pelly Crossing",
      kilometers: 515,
    },
    {
      origin: "Destruction Bay",
      destination: "Rancheria",
      kilometers: 578,
    },
    {
      origin: "Destruction Bay",
      destination: "Ross River",
      kilometers: 641,
    },
    {
      origin: "Destruction Bay",
      destination: "Stewart Crossing",
      kilometers: 585,
    },
    {
      origin: "Destruction Bay",
      destination: "Swift River",
      kilometers: 550,
    },
    {
      origin: "Destruction Bay",
      destination: "Tagish",
      kilometers: 361,
    },
    {
      origin: "Destruction Bay",
      destination: "Teslin",
      kilometers: 436,
    },
    {
      origin: "Destruction Bay",
      destination: "Tuchitua",
      kilometers: 803,
    },
    {
      origin: "Destruction Bay",
      destination: "Upper Liard",
      kilometers: 685,
    },
    {
      origin: "Destruction Bay",
      destination: "Watson Lake",
      kilometers: 696,
    },
    {
      origin: "Destruction Bay",
      destination: "Whitehorse",
      kilometers: 260,
    },
    {
      origin: "Destruction Bay",
      destination: "Skagway",
      kilometers: 434,
    },
    {
      origin: "Destruction Bay",
      destination: "Haines",
      kilometers: 343,
    },
    {
      origin: "Drury Creek",
      destination: "Elsa",
      kilometers: 384,
    },
    {
      origin: "Drury Creek",
      destination: "Faro",
      kilometers: 65,
    },
    {
      origin: "Drury Creek",
      destination: "Fraser",
      kilometers: 433,
    },
    {
      origin: "Drury Creek",
      destination: "Haines Junction",
      kilometers: 420,
    },
    {
      origin: "Drury Creek",
      destination: "Keno",
      kilometers: 397,
    },
    {
      origin: "Drury Creek",
      destination: "Marsh Lake",
      kilometers: 355,
    },
    {
      origin: "Drury Creek",
      destination: "Mayo",
      kilometers: 340,
    },
    {
      origin: "Drury Creek",
      destination: "Mendenhall",
      kilometers: 331,
    },
    {
      origin: "Drury Creek",
      destination: "Pelly Crossing",
      kilometers: 217,
    },
    {
      origin: "Drury Creek",
      destination: "Rancheria",
      kilometers: 612,
    },
    {
      origin: "Drury Creek",
      destination: "Ross River",
      kilometers: 115,
    },
    {
      origin: "Drury Creek",
      destination: "Stewart Crossing",
      kilometers: 287,
    },
    {
      origin: "Drury Creek",
      destination: "Swift River",
      kilometers: 584,
    },
    {
      origin: "Drury Creek",
      destination: "Tagish",
      kilometers: 395,
    },
    {
      origin: "Drury Creek",
      destination: "Teslin",
      kilometers: 470,
    },
    {
      origin: "Drury Creek",
      destination: "Tuchitua",
      kilometers: 359,
    },
    {
      origin: "Drury Creek",
      destination: "Upper Liard",
      kilometers: 478,
    },
    {
      origin: "Drury Creek",
      destination: "Watson Lake",
      kilometers: 467,
    },
    {
      origin: "Drury Creek",
      destination: "Whitehorse",
      kilometers: 394,
    },
    {
      origin: "Drury Creek",
      destination: "Skagway",
      kilometers: 467,
    },
    {
      origin: "Drury Creek",
      destination: "Haines",
      kilometers: 658,
    },
    {
      origin: "Elsa",
      destination: "Faro",
      kilometers: 449,
    },
    {
      origin: "Elsa",
      destination: "Fraser",
      kilometers: 590,
    },
    {
      origin: "Elsa",
      destination: "Haines Junction",
      kilometers: 577,
    },
    {
      origin: "Elsa",
      destination: "Keno",
      kilometers: 13,
    },
    {
      origin: "Elsa",
      destination: "Marsh Lake",
      kilometers: 503,
    },
    {
      origin: "Elsa",
      destination: "Mayo",
      kilometers: 48,
    },
    {
      origin: "Elsa",
      destination: "Mendenhall",
      kilometers: 488,
    },
    {
      origin: "Elsa",
      destination: "Pelly Crossing",
      kilometers: 169,
    },
    {
      origin: "Elsa",
      destination: "Rancheria",
      kilometers: 769,
    },
    {
      origin: "Elsa",
      destination: "Ross River",
      kilometers: 500,
    },
    {
      origin: "Elsa",
      destination: "Stewart Crossing",
      kilometers: 98,
    },
    {
      origin: "Elsa",
      destination: "Swift River",
      kilometers: 741,
    },
    {
      origin: "Elsa",
      destination: "Tagish",
      kilometers: 552,
    },
    {
      origin: "Elsa",
      destination: "Teslin",
      kilometers: 627,
    },
    {
      origin: "Elsa",
      destination: "Tuchitua",
      kilometers: 744,
    },
    {
      origin: "Elsa",
      destination: "Upper Liard",
      kilometers: 876,
    },
    {
      origin: "Elsa",
      destination: "Watson Lake",
      kilometers: 887,
    },
    {
      origin: "Elsa",
      destination: "Whitehorse",
      kilometers: 451,
    },
    {
      origin: "Elsa",
      destination: "Skagway",
      kilometers: 625,
    },
    {
      origin: "Elsa",
      destination: "Haines",
      kilometers: 815,
    },
    {
      origin: "Faro",
      destination: "Fraser",
      kilometers: 497,
    },
    {
      origin: "Faro",
      destination: "Haines Junction",
      kilometers: 484,
    },
    {
      origin: "Faro",
      destination: "Keno",
      kilometers: 462,
    },
    {
      origin: "Faro",
      destination: "Marsh Lake",
      kilometers: 411,
    },
    {
      origin: "Faro",
      destination: "Mayo",
      kilometers: 404,
    },
    {
      origin: "Faro",
      destination: "Mendenhall",
      kilometers: 396,
    },
    {
      origin: "Faro",
      destination: "Pelly Crossing",
      kilometers: 282,
    },
    {
      origin: "Faro",
      destination: "Rancheria",
      kilometers: 543,
    },
    {
      origin: "Faro",
      destination: "Ross River",
      kilometers: 73,
    },
    {
      origin: "Faro",
      destination: "Stewart Crossing",
      kilometers: 352,
    },
    {
      origin: "Faro",
      destination: "Swift River",
      kilometers: 649,
    },
    {
      origin: "Faro",
      destination: "Tagish",
      kilometers: 460,
    },
    {
      origin: "Faro",
      destination: "Teslin",
      kilometers: 535,
    },
    {
      origin: "Faro",
      destination: "Tuchitua",
      kilometers: 317,
    },
    {
      origin: "Faro",
      destination: "Upper Liard",
      kilometers: 436,
    },
    {
      origin: "Faro",
      destination: "Watson Lake",
      kilometers: 425,
    },
    {
      origin: "Faro",
      destination: "Whitehorse",
      kilometers: 359,
    },
    {
      origin: "Faro",
      destination: "Skagway",
      kilometers: 532,
    },
    {
      origin: "Faro",
      destination: "Haines",
      kilometers: 723,
    },
    {
      origin: "Fraser",
      destination: "Haines Junction",
      kilometers: 293,
    },
    {
      origin: "Fraser",
      destination: "Keno",
      kilometers: 602,
    },
    {
      origin: "Fraser",
      destination: "Marsh Lake",
      kilometers: 152,
    },
    {
      origin: "Fraser",
      destination: "Mayo",
      kilometers: 545,
    },
    {
      origin: "Fraser",
      destination: "Mendenhall",
      kilometers: 205,
    },
    {
      origin: "Fraser",
      destination: "Pelly Crossing",
      kilometers: 422,
    },
    {
      origin: "Fraser",
      destination: "Rancheria",
      kilometers: 361,
    },
    {
      origin: "Fraser",
      destination: "Ross River",
      kilometers: 548,
    },
    {
      origin: "Fraser",
      destination: "Stewart Crossing",
      kilometers: 492,
    },
    {
      origin: "Fraser",
      destination: "Swift River",
      kilometers: 333,
    },
    {
      origin: "Fraser",
      destination: "Tagish",
      kilometers: 102,
    },
    {
      origin: "Fraser",
      destination: "Teslin",
      kilometers: 219,
    },
    {
      origin: "Fraser",
      destination: "Tuchitua",
      kilometers: 586,
    },
    {
      origin: "Fraser",
      destination: "Upper Liard",
      kilometers: 468,
    },
    {
      origin: "Fraser",
      destination: "Watson Lake",
      kilometers: 479,
    },
    {
      origin: "Fraser",
      destination: "Whitehorse",
      kilometers: 141,
    },
    {
      origin: "Fraser",
      destination: "Skagway",
      kilometers: 35,
    },
    {
      origin: "Fraser",
      destination: "Haines",
      kilometers: 531,
    },
    {
      origin: "Haines Junction",
      destination: "Keno",
      kilometers: 589,
    },
    {
      origin: "Haines Junction",
      destination: "Marsh Lake",
      kilometers: 207,
    },
    {
      origin: "Haines Junction",
      destination: "Mayo",
      kilometers: 532,
    },
    {
      origin: "Haines Junction",
      destination: "Mendenhall",
      kilometers: 89,
    },
    {
      origin: "Haines Junction",
      destination: "Pelly Crossing",
      kilometers: 409,
    },
    {
      origin: "Haines Junction",
      destination: "Rancheria",
      kilometers: 472,
    },
    {
      origin: "Haines Junction",
      destination: "Ross River",
      kilometers: 535,
    },
    {
      origin: "Haines Junction",
      destination: "Stewart Crossing",
      kilometers: 479,
    },
    {
      origin: "Haines Junction",
      destination: "Swift River",
      kilometers: 444,
    },
    {
      origin: "Haines Junction",
      destination: "Tagish",
      kilometers: 255,
    },
    {
      origin: "Haines Junction",
      destination: "Teslin",
      kilometers: 330,
    },
    {
      origin: "Haines Junction",
      destination: "Tuchitua",
      kilometers: 697,
    },
    {
      origin: "Haines Junction",
      destination: "Upper Liard",
      kilometers: 579,
    },
    {
      origin: "Haines Junction",
      destination: "Watson Lake",
      kilometers: 590,
    },
    {
      origin: "Haines Junction",
      destination: "Whitehorse",
      kilometers: 154,
    },
    {
      origin: "Haines Junction",
      destination: "Skagway",
      kilometers: 328,
    },
    {
      origin: "Haines Junction",
      destination: "Haines",
      kilometers: 238,
    },
    {
      origin: "Keno",
      destination: "Marsh Lake",
      kilometers: 525,
    },
    {
      origin: "Keno",
      destination: "Mayo",
      kilometers: 60,
    },
    {
      origin: "Keno",
      destination: "Mendenhall",
      kilometers: 501,
    },
    {
      origin: "Keno",
      destination: "Pelly Crossing",
      kilometers: 181,
    },
    {
      origin: "Keno",
      destination: "Rancheria",
      kilometers: 781,
    },
    {
      origin: "Keno",
      destination: "Ross River",
      kilometers: 513,
    },
    {
      origin: "Keno",
      destination: "Stewart Crossing",
      kilometers: 110,
    },
    {
      origin: "Keno",
      destination: "Swift River",
      kilometers: 753,
    },
    {
      origin: "Keno",
      destination: "Tagish",
      kilometers: 565,
    },
    {
      origin: "Keno",
      destination: "Teslin",
      kilometers: 639,
    },
    {
      origin: "Keno",
      destination: "Tuchitua",
      kilometers: 757,
    },
    {
      origin: "Keno",
      destination: "Upper Liard",
      kilometers: 888,
    },
    {
      origin: "Keno",
      destination: "Watson Lake",
      kilometers: 900,
    },
    {
      origin: "Keno",
      destination: "Whitehorse",
      kilometers: 464,
    },
    {
      origin: "Keno",
      destination: "Skagway",
      kilometers: 637,
    },
    {
      origin: "Keno",
      destination: "Haines",
      kilometers: 827,
    },
    {
      origin: "Marsh Lake",
      destination: "Mayo",
      kilometers: 458,
    },
    {
      origin: "Marsh Lake",
      destination: "Mendenhall",
      kilometers: 118,
    },
    {
      origin: "Marsh Lake",
      destination: "Pelly Crossing",
      kilometers: 336,
    },
    {
      origin: "Marsh Lake",
      destination: "Rancheria",
      kilometers: 267,
    },
    {
      origin: "Marsh Lake",
      destination: "Ross River",
      kilometers: 462,
    },
    {
      origin: "Marsh Lake",
      destination: "Stewart Crossing",
      kilometers: 406,
    },
    {
      origin: "Marsh Lake",
      destination: "Swift River",
      kilometers: 239,
    },
    {
      origin: "Marsh Lake",
      destination: "Tagish",
      kilometers: 50,
    },
    {
      origin: "Marsh Lake",
      destination: "Teslin",
      kilometers: 125,
    },
    {
      origin: "Marsh Lake",
      destination: "Tuchitua",
      kilometers: 492,
    },
    {
      origin: "Marsh Lake",
      destination: "Upper Liard",
      kilometers: 374,
    },
    {
      origin: "Marsh Lake",
      destination: "Watson Lake",
      kilometers: 385,
    },
    {
      origin: "Marsh Lake",
      destination: "Whitehorse",
      kilometers: 63,
    },
    {
      origin: "Marsh Lake",
      destination: "Skagway",
      kilometers: 187,
    },
    {
      origin: "Marsh Lake",
      destination: "Haines",
      kilometers: 445,
    },
    {
      origin: "Mayo",
      destination: "Mendenhall",
      kilometers: 443,
    },
    {
      origin: "Mayo",
      destination: "Pelly Crossing",
      kilometers: 124,
    },
    {
      origin: "Mayo",
      destination: "Rancheria",
      kilometers: 724,
    },
    {
      origin: "Mayo",
      destination: "Ross River",
      kilometers: 455,
    },
    {
      origin: "Mayo",
      destination: "Stewart Crossing",
      kilometers: 53,
    },
    {
      origin: "Mayo",
      destination: "Swift River",
      kilometers: 696,
    },
    {
      origin: "Mayo",
      destination: "Tagish",
      kilometers: 507,
    },
    {
      origin: "Mayo",
      destination: "Teslin",
      kilometers: 582,
    },
    {
      origin: "Mayo",
      destination: "Tuchitua",
      kilometers: 699,
    },
    {
      origin: "Mayo",
      destination: "Upper Liard",
      kilometers: 831,
    },
    {
      origin: "Mayo",
      destination: "Watson Lake",
      kilometers: 842,
    },
    {
      origin: "Mayo",
      destination: "Whitehorse",
      kilometers: 406,
    },
    {
      origin: "Mayo",
      destination: "Skagway",
      kilometers: 580,
    },
    {
      origin: "Mayo",
      destination: "Haines",
      kilometers: 770,
    },
    {
      origin: "Mendenhall",
      destination: "Pelly Crossing",
      kilometers: 320,
    },
    {
      origin: "Mendenhall",
      destination: "Rancheria",
      kilometers: 384,
    },
    {
      origin: "Mendenhall",
      destination: "Ross River",
      kilometers: 446,
    },
    {
      origin: "Mendenhall",
      destination: "Stewart Crossing",
      kilometers: 391,
    },
    {
      origin: "Mendenhall",
      destination: "Swift River",
      kilometers: 356,
    },
    {
      origin: "Mendenhall",
      destination: "Tagish",
      kilometers: 167,
    },
    {
      origin: "Mendenhall",
      destination: "Teslin",
      kilometers: 242,
    },
    {
      origin: "Mendenhall",
      destination: "Tuchitua",
      kilometers: 609,
    },
    {
      origin: "Mendenhall",
      destination: "Upper Liard",
      kilometers: 491,
    },
    {
      origin: "Mendenhall",
      destination: "Watson Lake",
      kilometers: 502,
    },
    {
      origin: "Mendenhall",
      destination: "Whitehorse",
      kilometers: 66,
    },
    {
      origin: "Mendenhall",
      destination: "Skagway",
      kilometers: 240,
    },
    {
      origin: "Mendenhall",
      destination: "Haines",
      kilometers: 327,
    },
    {
      origin: "Pelly Crossing",
      destination: "Rancheria",
      kilometers: 601,
    },
    {
      origin: "Pelly Crossing",
      destination: "Ross River",
      kilometers: 333,
    },
    {
      origin: "Pelly Crossing",
      destination: "Stewart Crossing",
      kilometers: 71,
    },
    {
      origin: "Pelly Crossing",
      destination: "Swift River",
      kilometers: 573,
    },
    {
      origin: "Pelly Crossing",
      destination: "Tagish",
      kilometers: 384,
    },
    {
      origin: "Pelly Crossing",
      destination: "Teslin",
      kilometers: 459,
    },
    {
      origin: "Pelly Crossing",
      destination: "Tuchitua",
      kilometers: 577,
    },
    {
      origin: "Pelly Crossing",
      destination: "Upper Liard",
      kilometers: 708,
    },
    {
      origin: "Pelly Crossing",
      destination: "Watson Lake",
      kilometers: 719,
    },
    {
      origin: "Pelly Crossing",
      destination: "Whitehorse",
      kilometers: 283,
    },
    {
      origin: "Pelly Crossing",
      destination: "Skagway",
      kilometers: 457,
    },
    {
      origin: "Pelly Crossing",
      destination: "Haines",
      kilometers: 647,
    },
    {
      origin: "Rancheria",
      destination: "Ross River",
      kilometers: 490,
    },
    {
      origin: "Rancheria",
      destination: "Stewart Crossing",
      kilometers: 671,
    },
    {
      origin: "Rancheria",
      destination: "Swift River",
      kilometers: 28,
    },
    {
      origin: "Rancheria",
      destination: "Tagish",
      kilometers: 259,
    },
    {
      origin: "Rancheria",
      destination: "Teslin",
      kilometers: 142,
    },
    {
      origin: "Rancheria",
      destination: "Tuchitua",
      kilometers: 226,
    },
    {
      origin: "Rancheria",
      destination: "Upper Liard",
      kilometers: 107,
    },
    {
      origin: "Rancheria",
      destination: "Watson Lake",
      kilometers: 119,
    },
    {
      origin: "Rancheria",
      destination: "Whitehorse",
      kilometers: 320,
    },
    {
      origin: "Rancheria",
      destination: "Skagway",
      kilometers: 396,
    },
    {
      origin: "Rancheria",
      destination: "Haines",
      kilometers: 710,
    },
    {
      origin: "Ross River",
      destination: "Stewart Crossing",
      kilometers: 402,
    },
    {
      origin: "Ross River",
      destination: "Swift River",
      kilometers: 517,
    },
    {
      origin: "Ross River",
      destination: "Tagish",
      kilometers: 510,
    },
    {
      origin: "Ross River",
      destination: "Teslin",
      kilometers: 631,
    },
    {
      origin: "Ross River",
      destination: "Tuchitua",
      kilometers: 264,
    },
    {
      origin: "Ross River",
      destination: "Upper Liard",
      kilometers: 382,
    },
    {
      origin: "Ross River",
      destination: "Watson Lake",
      kilometers: 372,
    },
    {
      origin: "Ross River",
      destination: "Whitehorse",
      kilometers: 410,
    },
    {
      origin: "Ross River",
      destination: "Skagway",
      kilometers: 583,
    },
    {
      origin: "Ross River",
      destination: "Haines",
      kilometers: 774,
    },
    {
      origin: "Stewart Crossing",
      destination: "Swift River",
      kilometers: 643,
    },
    {
      origin: "Stewart Crossing",
      destination: "Tagish",
      kilometers: 455,
    },
    {
      origin: "Stewart Crossing",
      destination: "Teslin",
      kilometers: 529,
    },
    {
      origin: "Stewart Crossing",
      destination: "Tuchitua",
      kilometers: 647,
    },
    {
      origin: "Stewart Crossing",
      destination: "Upper Liard",
      kilometers: 778,
    },
    {
      origin: "Stewart Crossing",
      destination: "Watson Lake",
      kilometers: 790,
    },
    {
      origin: "Stewart Crossing",
      destination: "Whitehorse",
      kilometers: 354,
    },
    {
      origin: "Stewart Crossing",
      destination: "Skagway",
      kilometers: 527,
    },
    {
      origin: "Stewart Crossing",
      destination: "Haines",
      kilometers: 717,
    },
    {
      origin: "Swift River",
      destination: "Tagish",
      kilometers: 231,
    },
    {
      origin: "Swift River",
      destination: "Teslin",
      kilometers: 114,
    },
    {
      origin: "Swift River",
      destination: "Tuchitua",
      kilometers: 253,
    },
    {
      origin: "Swift River",
      destination: "Upper Liard",
      kilometers: 135,
    },
    {
      origin: "Swift River",
      destination: "Watson Lake",
      kilometers: 146,
    },
    {
      origin: "Swift River",
      destination: "Whitehorse",
      kilometers: 292,
    },
    {
      origin: "Swift River",
      destination: "Skagway",
      kilometers: 368,
    },
    {
      origin: "Swift River",
      destination: "Haines",
      kilometers: 682,
    },
    {
      origin: "Tagish",
      destination: "Teslin",
      kilometers: 117,
    },
    {
      origin: "Tagish",
      destination: "Tuchitua",
      kilometers: 485,
    },
    {
      origin: "Tagish",
      destination: "Upper Liard",
      kilometers: 366,
    },
    {
      origin: "Tagish",
      destination: "Watson Lake",
      kilometers: 378,
    },
    {
      origin: "Tagish",
      destination: "Whitehorse",
      kilometers: 103,
    },
    {
      origin: "Tagish",
      destination: "Skagway",
      kilometers: 136,
    },
    {
      origin: "Tagish",
      destination: "Haines",
      kilometers: 494,
    },
    {
      origin: "Teslin",
      destination: "Tuchitua",
      kilometers: 367,
    },
    {
      origin: "Teslin",
      destination: "Upper Liard",
      kilometers: 249,
    },
    {
      origin: "Teslin",
      destination: "Watson Lake",
      kilometers: 260,
    },
    {
      origin: "Teslin",
      destination: "Whitehorse",
      kilometers: 178,
    },
    {
      origin: "Teslin",
      destination: "Skagway",
      kilometers: 254,
    },
    {
      origin: "Teslin",
      destination: "Haines",
      kilometers: 568,
    },
    {
      origin: "Tuchitua",
      destination: "Upper Liard",
      kilometers: 118,
    },
    {
      origin: "Tuchitua",
      destination: "Watson Lake",
      kilometers: 108,
    },
    {
      origin: "Tuchitua",
      destination: "Whitehorse",
      kilometers: 545,
    },
    {
      origin: "Tuchitua",
      destination: "Skagway",
      kilometers: 621,
    },
    {
      origin: "Tuchitua",
      destination: "Haines",
      kilometers: 936,
    },
    {
      origin: "Upper Liard",
      destination: "Watson Lake",
      kilometers: 11,
    },
    {
      origin: "Upper Liard",
      destination: "Whitehorse",
      kilometers: 427,
    },
    {
      origin: "Upper Liard",
      destination: "Skagway",
      kilometers: 503,
    },
    {
      origin: "Upper Liard",
      destination: "Haines",
      kilometers: 817,
    },
    {
      origin: "Watson Lake",
      destination: "Whitehorse",
      kilometers: 438,
    },
    {
      origin: "Watson Lake",
      destination: "Skagway",
      kilometers: 514,
    },
    {
      origin: "Watson Lake",
      destination: "Haines",
      kilometers: 829,
    },
    {
      origin: "Whitehorse",
      destination: "Skagway",
      kilometers: 176,
    },
    {
      origin: "Whitehorse",
      destination: "Haines",
      kilometers: 393,
    },
    {
      origin: "Skagway",
      destination: "Haines",
      kilometers: 566,
    },
  ])

  await TravelDeskTravelRequest.destroy({ where: {} })
}
