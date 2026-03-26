-- Travel Desk invoice source schema reference
-- Related GitHub issue: https://github.com/icefoganalytics/travel-authorization/issues/314
-- Companion plan: agents/plans/Plan, Travel Desk Flight Segment Cost Tracking and Invoice Generation, 2026-01-02.md
-- Companion ERD: agents/plans/Travel Desk Invoice Entity Relationship Diagram.wsd
-- Purpose: investigative reference from an external/source schema to support future invoice work
-- Note: this file is reference material only and should not be applied as a TravelAuth migration

-- DROP SCHEMA dbo;

CREATE SCHEMA dbo;
-- travel.dbo.IdGen definition

-- Drop table

-- DROP TABLE travel.dbo.IdGen;

CREATE TABLE travel.dbo.IdGen (
	LastId int NOT NULL,
	CONSTRAINT PK_IdGen PRIMARY KEY (LastId)
);


-- travel.dbo.TravelOrderEvent definition

-- Drop table

-- DROP TABLE travel.dbo.TravelOrderEvent;

CREATE TABLE travel.dbo.TravelOrderEvent (
	TravelOrderIdentifier int NOT NULL,
	PnrBfVersionNbr int NULL,
	EventType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HostEventTimeStamp datetime NULL,
	CrsDescription char(9) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DatabaseTimeStamp datetime DEFAULT getdate() NOT NULL,
	TransactionPseudo char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionAgent char(8) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OwningAgencyPseudo char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OriginalBookingLocation char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CreatingAgencyIata numeric(18,0) NULL,
	PnrCreationDate datetime NULL,
	PnrPurgeDate datetime NULL,
	OwningAgencyName varchar(24) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionAgencyName varchar(24) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastActionAgentID char(7) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TVLORDREVNT PRIMARY KEY (TravelOrderIdentifier)
);


-- travel.dbo.AddressInfo definition

-- Drop table

-- DROP TABLE travel.dbo.AddressInfo;

CREATE TABLE travel.dbo.AddressInfo (
	TravelOrderIdentifier int NOT NULL,
	StreetAddress varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DeliveryAddress varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AddressInfo PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_AddressInfo_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.AirFareQuo definition

-- Drop table

-- DROP TABLE travel.dbo.AirFareQuo;

CREATE TABLE travel.dbo.AirFareQuo (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	FareAmountType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FareConstructionCode char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FareTotalAmount numeric(18,2) NULL,
	PassengerTotalAmount numeric(18,2) NULL,
	CurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DecimalNbr int NULL,
	JourneyType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PIC char(7) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrPassengersInFareQuote int NULL,
	EndorsementText varchar(87) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NetFareIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BaseFareCurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BaseFareDecimalNbr int NULL,
	BaseFareAmount numeric(18,2) NULL,
	TotalTaxAmount numeric(18,2) NULL,
	EquivalentFareAmount numeric(18,2) NULL,
	EquivalentFareCurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BankSettlementRate char(11) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TourCode varchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ITBTIndicator char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AIRFAREQUO PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr),
	CONSTRAINT FK_AIRFAREQ_TVL_ORDR__TVLORDRE FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);
 CREATE NONCLUSTERED INDEX Tvl_Ordr_Filed_Fares_FK ON travel.dbo.AirFareQuo (  TravelOrderIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.AirQuoAuto definition

-- Drop table

-- DROP TABLE travel.dbo.AirQuoAuto;

CREATE TABLE travel.dbo.AirQuoAuto (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	AutomaticFareConstruction varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AirQuoAuto PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr),
	CONSTRAINT FK_AirQuoAuto_AirFareQuo FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);


-- travel.dbo.AirQuoMan definition

-- Drop table

-- DROP TABLE travel.dbo.AirQuoMan;

CREATE TABLE travel.dbo.AirQuoMan (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	ManualFareConstruction varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AIRQUOMAN PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr),
	CONSTRAINT FK_AIRQUOMA_FILED_FAR_AIRFAREQ FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);


-- travel.dbo.AirQuoPax definition

-- Drop table

-- DROP TABLE travel.dbo.AirQuoPax;

CREATE TABLE travel.dbo.AirQuoPax (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	PassengerSequenceNbr int NOT NULL,
	LastNameElement int NULL,
	PassengerElement int NULL,
	TicketedIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AirQuoPax PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,PassengerSequenceNbr),
	CONSTRAINT FK_AirQuoPax_AirFareQuo FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);


-- travel.dbo.AirRsrvSeg definition

-- Drop table

-- DROP TABLE travel.dbo.AirRsrvSeg;

CREATE TABLE travel.dbo.AirRsrvSeg (
	TravelOrderIdentifier int NOT NULL,
	AirSegmentNbr int NOT NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarrierCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BoardPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OffPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightNbr char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BookingCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ArrivalTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ChangeOfDay int NULL,
	ConnectionIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	JourneyTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureTerminal char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ArrivalTerminal char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EquipmentType char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Mileage varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ClassOfServDesc varchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ChangeOfGaugeIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AIRRSRVSEG PRIMARY KEY (TravelOrderIdentifier,AirSegmentNbr),
	CONSTRAINT FK_AIRRSRVS_TRAVEL_OR_TVLORDRE FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);
 CREATE NONCLUSTERED INDEX Travel_Order_Event_Air_Segment ON travel.dbo.AirRsrvSeg (  TravelOrderIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.AirSchg definition

-- Drop table

-- DROP TABLE travel.dbo.AirSchg;

CREATE TABLE travel.dbo.AirSchg (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	SurchargeSequenceNbr int NOT NULL,
	SurchargeCity char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SurchargeAmount numeric(18,2) NULL,
	SurchargeType char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AIRSCHG PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,SurchargeSequenceNbr),
	CONSTRAINT FK_AIRSCHG_PSGR_TYPE_AIRFAREQ FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);
 CREATE NONCLUSTERED INDEX Psgr_Type_Surchg_FK ON travel.dbo.AirSchg (  TravelOrderIdentifier ASC  , AirFareSequenceNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.AirSegOperatingCarrier definition

-- Drop table

-- DROP TABLE travel.dbo.AirSegOperatingCarrier;

CREATE TABLE travel.dbo.AirSegOperatingCarrier (
	TravelOrderIdentifier int NOT NULL,
	AirSegmentNbr int NOT NULL,
	SequenceNbr int NOT NULL,
	BoardPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OffPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarrierCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AirlineName varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AirSegOperatingCarrier PRIMARY KEY (TravelOrderIdentifier,AirSegmentNbr,SequenceNbr),
	CONSTRAINT FK_AirSegOperatingCarrier_AirRsrvSeg FOREIGN KEY (TravelOrderIdentifier,AirSegmentNbr) REFERENCES travel.dbo.AirRsrvSeg(TravelOrderIdentifier,AirSegmentNbr)
);


-- travel.dbo.AirTax definition

-- Drop table

-- DROP TABLE travel.dbo.AirTax;

CREATE TABLE travel.dbo.AirTax (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	TaxSequenceNbr int NOT NULL,
	TaxCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TaxAmount numeric(18,2) NULL,
	TaxExemptIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AIRTAX PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,TaxSequenceNbr),
	CONSTRAINT FK_AIRTAX_PSGR_TYPE_AIRFAREQ FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);
 CREATE NONCLUSTERED INDEX Psgr_Type_Tax_FK ON travel.dbo.AirTax (  TravelOrderIdentifier ASC  , AirFareSequenceNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.AirTaxBrk definition

-- Drop table

-- DROP TABLE travel.dbo.AirTaxBrk;

CREATE TABLE travel.dbo.AirTaxBrk (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	TaxSequenceNbr int NOT NULL,
	TaxBreakdownSequenceNbr int NOT NULL,
	CurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DecimalNbr int NULL,
	TaxBreakdownCity char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TaxBreakdownAmount numeric(18,2) NULL,
	CONSTRAINT PK_AIRTAXBRK PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,TaxSequenceNbr,TaxBreakdownSequenceNbr),
	CONSTRAINT FK_AIRTAXBRK FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr,TaxSequenceNbr) REFERENCES travel.dbo.AirTax(TravelOrderIdentifier,AirFareSequenceNbr,TaxSequenceNbr)
);


-- travel.dbo.CarSeg definition

-- Drop table

-- DROP TABLE travel.dbo.CarSeg;

CREATE TABLE travel.dbo.CarSeg (
	TravelOrderIdentifier int NOT NULL,
	CarSegmentNbr int NOT NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PickUpDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PickUpTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AirportCode char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarLocationCategory char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DropOffDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DropOffTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ConfirmationNbr char(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarVendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarRateType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarRateCode char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarType char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarYieldManagementNbr char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RateAmount numeric(18,2) NULL,
	RateGuaranteeIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MilesKilometerIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DistanceAllowance char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DistanceRateAmount numeric(18,2) NULL,
	CurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrOfCars int NULL,
	CarAddress varchar(190) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_CARSEG PRIMARY KEY (TravelOrderIdentifier,CarSegmentNbr),
	CONSTRAINT FK_CARSEG_TVL_ORDR__TVLORDRE FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);
 CREATE NONCLUSTERED INDEX Tvl_Ordr_Car_Seg_FK ON travel.dbo.CarSeg (  TravelOrderIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.CarSegOpt definition

-- Drop table

-- DROP TABLE travel.dbo.CarSegOpt;

CREATE TABLE travel.dbo.CarSegOpt (
	TravelOrderIdentifier int NOT NULL,
	CarSegmentNbr int NOT NULL,
	CarOptionalInfoSequenceNbr int NOT NULL,
	CarOptionalFieldId char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarOptionalFieldContent varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_CARSEGOPT PRIMARY KEY (TravelOrderIdentifier,CarSegmentNbr,CarOptionalInfoSequenceNbr),
	CONSTRAINT FK_CARSEGOP_CAR_SEG_O_CARSEG FOREIGN KEY (TravelOrderIdentifier,CarSegmentNbr) REFERENCES travel.dbo.CarSeg(TravelOrderIdentifier,CarSegmentNbr)
);
 CREATE NONCLUSTERED INDEX Car_Seg_Opt_FK ON travel.dbo.CarSegOpt (  TravelOrderIdentifier ASC  , CarSegmentNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.ChangeOfGauge definition

-- Drop table

-- DROP TABLE travel.dbo.ChangeOfGauge;

CREATE TABLE travel.dbo.ChangeOfGauge (
	TravelOrderIdentifier int NOT NULL,
	AirSegmentNbr int NOT NULL,
	COGSequenceNbr int NOT NULL,
	DepartureDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BoardPoint varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OffPoint varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EquipmentCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	COGIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_ChangeOfGauge PRIMARY KEY (TravelOrderIdentifier,AirSegmentNbr,COGSequenceNbr),
	CONSTRAINT FK_ChangeOfGauge_AirRsrvSeg FOREIGN KEY (TravelOrderIdentifier,AirSegmentNbr) REFERENCES travel.dbo.AirRsrvSeg(TravelOrderIdentifier,AirSegmentNbr)
);


-- travel.dbo.CorporateID definition

-- Drop table

-- DROP TABLE travel.dbo.CorporateID;

CREATE TABLE travel.dbo.CorporateID (
	TravelOrderIdentifier int NOT NULL,
	CorporateIDSequenceNbr int NOT NULL,
	CorporateID char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CorporateIDType char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CorporateIDCountryCode char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CorporateIDAgency varchar(125) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_CorporateID PRIMARY KEY (TravelOrderIdentifier,CorporateIDSequenceNbr),
	CONSTRAINT FK_CorporateID_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.CustomerID definition

-- Drop table

-- DROP TABLE travel.dbo.CustomerID;

CREATE TABLE travel.dbo.CustomerID (
	TravelOrderIdentifier int NOT NULL,
	CustomerIDText varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_CustomerID PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_CustomerID_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.DuePaidTextSeg definition

-- Drop table

-- DROP TABLE travel.dbo.DuePaidTextSeg;

CREATE TABLE travel.dbo.DuePaidTextSeg (
	TravelOrderIdentifier int NOT NULL,
	DptSegmentNbr int NOT NULL,
	[Type] char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Date] char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DuePaidTextIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Price numeric(18,3) NULL,
	CurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Text] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_DuePaidTextSeg PRIMARY KEY (TravelOrderIdentifier,DptSegmentNbr),
	CONSTRAINT FK_DuePaidTextSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.EMDInfo definition

-- Drop table

-- DROP TABLE travel.dbo.EMDInfo;

CREATE TABLE travel.dbo.EMDInfo (
	TravelOrderIdentifier int NOT NULL,
	EMDSequenceNbr int NOT NULL,
	EMDType char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AncillaryType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DateOfService char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrOfServices char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CityCode char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EMDDocumentNbr char(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PassengerName varchar(55) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EMDText varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SegmentNbr int NULL,
	LastNameElement int NULL,
	PassengerElement int NULL,
	AbsoluteNameElement int NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_EMDInfo PRIMARY KEY (TravelOrderIdentifier,EMDSequenceNbr),
	CONSTRAINT FK_EMDInfo_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.EmailSeg definition

-- Drop table

-- DROP TABLE travel.dbo.EmailSeg;

CREATE TABLE travel.dbo.EmailSeg (
	TravelOrderIdentifier int NOT NULL,
	EmailSequenceNbr int NOT NULL,
	EmailType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmailAddress varchar(125) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_EmailSeg PRIMARY KEY (TravelOrderIdentifier,EmailSequenceNbr),
	CONSTRAINT FK_EmailSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.FareCmpnt definition

-- Drop table

-- DROP TABLE travel.dbo.FareCmpnt;

CREATE TABLE travel.dbo.FareCmpnt (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	FareComponentSequenceNbr int NOT NULL,
	FareBasisCode char(8) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FareComponentAmount numeric(18,2) NULL,
	PrivateAccountCode char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PrivateContractCode char(8) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TicketDesignator char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EndorsementText varchar(87) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_FARECMPNT PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,FareComponentSequenceNbr),
	CONSTRAINT FK_FARECMPN_AIR_FARE__AIRFAREQ FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);
 CREATE NONCLUSTERED INDEX Air_Fare_Quo_Cmpnt_FK ON travel.dbo.FareCmpnt (  TravelOrderIdentifier ASC  , AirFareSequenceNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.FareCmpntRte definition

-- Drop table

-- DROP TABLE travel.dbo.FareCmpntRte;

CREATE TABLE travel.dbo.FareCmpntRte (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	FareComponentSequenceNbr int NOT NULL,
	RouteComponentSequenceNbr int NOT NULL,
	RouteBoardPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RouteOffPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RouteCarrierCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RouteFlightNbr char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	StopoverIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PNRSegmentNbr int NULL,
	NotValidBeforeDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NotValidAfterDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ClassOfService char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ClassOfServDesc varchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BaggageAllowance char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_FARECMPNTRTE PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,FareComponentSequenceNbr,RouteComponentSequenceNbr),
	CONSTRAINT FK_FARECMPN_FARE_COMP_FARECMPN FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr,FareComponentSequenceNbr) REFERENCES travel.dbo.FareCmpnt(TravelOrderIdentifier,AirFareSequenceNbr,FareComponentSequenceNbr)
);
 CREATE NONCLUSTERED INDEX Fare_Component_Routes_FK ON travel.dbo.FareCmpntRte (  TravelOrderIdentifier ASC  , AirFareSequenceNbr ASC  , FareComponentSequenceNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.FlyingTaxiSeg definition

-- Drop table

-- DROP TABLE travel.dbo.FlyingTaxiSeg;

CREATE TABLE travel.dbo.FlyingTaxiSeg (
	TravelOrderIdentifier int NOT NULL,
	FlyingTaxiSegmentNbr int NOT NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DateOfService char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrOfCars int NULL,
	CityCode char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PickupTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ServiceType char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ArrivalDepartureIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarrierCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightNbr char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TaxiType char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Text] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_FlyingTaxiSeg PRIMARY KEY (TravelOrderIdentifier,FlyingTaxiSegmentNbr),
	CONSTRAINT FK_FlyingTaxiSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.GeneralRmksNotepad definition

-- Drop table

-- DROP TABLE travel.dbo.GeneralRmksNotepad;

CREATE TABLE travel.dbo.GeneralRmksNotepad (
	TravelOrderIdentifier int NOT NULL,
	GeneralRmkNotepadNbr int NOT NULL,
	RemarkDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RemarkTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	GeneralRmkNotepadQualifier char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	GeneralRmkNotepadText varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_GeneralRmksNotepad PRIMARY KEY (TravelOrderIdentifier,GeneralRmkNotepadNbr),
	CONSTRAINT FK_GeneralRmksNotepad_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.HtlSeg definition

-- Drop table

-- DROP TABLE travel.dbo.HtlSeg;

CREATE TABLE travel.dbo.HtlSeg (
	TravelOrderIdentifier int NOT NULL,
	HotelSegmentNbr int NOT NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PropertyCityCode char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ArrivalDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HotelVendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	GalileoPropertyNbr char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RoomBookingCode char(7) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PropertyName char(19) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ConfirmationNbr char(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RateChangeIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MultiDayRateIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MultiLevelRateCode char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrRooms int NULL,
	HotelAddress varchar(190) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	GalileoPropertyNbr2 char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HotelTelephoneNbr varchar(17) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RateGuaranteed numeric(18,2) NULL,
	TotalRateAmount numeric(18,2) NULL,
	RateChanges varchar(555) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HotelCommissionIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HotelCommissionPercent numeric(5,2) NULL,
	CONSTRAINT PK_HTLSEG PRIMARY KEY (TravelOrderIdentifier,HotelSegmentNbr),
	CONSTRAINT FK_HTLSEG_TVL_ORDR__TVLORDRE FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);
 CREATE NONCLUSTERED INDEX Tvl_Ordr_Htl_Seg_FK ON travel.dbo.HtlSeg (  TravelOrderIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.HtlSegOpt definition

-- Drop table

-- DROP TABLE travel.dbo.HtlSegOpt;

CREATE TABLE travel.dbo.HtlSegOpt (
	TravelOrderIdentifier int NOT NULL,
	HotelSegmentNbr int NOT NULL,
	HotelOptionalInfoSequenceNbr int NOT NULL,
	HotelOptionalFieldId char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HotelOptionalFieldContent varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_HTLSEGOPT PRIMARY KEY (TravelOrderIdentifier,HotelSegmentNbr,HotelOptionalInfoSequenceNbr),
	CONSTRAINT FK_HTLSEGOP_HTL_SEG_O_HTLSEG FOREIGN KEY (TravelOrderIdentifier,HotelSegmentNbr) REFERENCES travel.dbo.HtlSeg(TravelOrderIdentifier,HotelSegmentNbr)
);
 CREATE NONCLUSTERED INDEX Htl_Seg_Opt_FK ON travel.dbo.HtlSegOpt (  TravelOrderIdentifier ASC  , HotelSegmentNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.ItineraryRemark definition

-- Drop table

-- DROP TABLE travel.dbo.ItineraryRemark;

CREATE TABLE travel.dbo.ItineraryRemark (
	TravelOrderIdentifier int NOT NULL,
	AssociatedSegmentNbr int NOT NULL,
	RemarkItemNbr int NOT NULL,
	RemarkText varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_ItineraryRemark PRIMARY KEY (TravelOrderIdentifier,AssociatedSegmentNbr,RemarkItemNbr),
	CONSTRAINT FK_ItineraryRemark_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.ManualSSR definition

-- Drop table

-- DROP TABLE travel.dbo.ManualSSR;

CREATE TABLE travel.dbo.ManualSSR (
	TravelOrderIdentifier int NOT NULL,
	SSRSequenceNbr int NOT NULL,
	SSRCode char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SSRVendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	StatusCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrRequired int NULL,
	SSRData varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_ManualSSR PRIMARY KEY (TravelOrderIdentifier,SSRSequenceNbr),
	CONSTRAINT FK_ManualSSR_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.NRTrans definition

-- Drop table

-- DROP TABLE travel.dbo.NRTrans;

CREATE TABLE travel.dbo.NRTrans (
	TravelOrderIdentifier int NOT NULL,
	NetFareNetRemitCurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NetFareNetRemitAmount numeric(18,2) NULL,
	ActualSellingFareAmount numeric(18,2) NULL,
	TicketFareAmount numeric(18,2) NULL,
	Category35Indicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NetFareRegionCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_NRTrans PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_NRTrans_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.NonAirSeg definition

-- Drop table

-- DROP TABLE travel.dbo.NonAirSeg;

CREATE TABLE travel.dbo.NonAirSeg (
	TravelOrderIdentifier int NOT NULL,
	NonAirSegmentNbr int NOT NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SegmentType char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DateOfService char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OutDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrInParty char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CityCode char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DestinationCityCode char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SellType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CityName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Text] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_NonAirSeg PRIMARY KEY (TravelOrderIdentifier,NonAirSegmentNbr),
	CONSTRAINT FK_NonAirSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.NonHostContent definition

-- Drop table

-- DROP TABLE travel.dbo.NonHostContent;

CREATE TABLE travel.dbo.NonHostContent (
	TravelOrderIdentifier int NOT NULL,
	NonHostXML text COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_NonHostContent PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_NonHostContent_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.OBFees definition

-- Drop table

-- DROP TABLE travel.dbo.OBFees;

CREATE TABLE travel.dbo.OBFees (
	TravelOrderIdentifier int NOT NULL,
	OBFSequenceNbr int NOT NULL,
	OBFCollectInd char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OBFExemptInd char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OBFCurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OBFDecimalNbr int NULL,
	OBFCommName char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OBFSubCode char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OBFAmount numeric(18,2) NULL,
	OBFCommInd char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OBFInterlineInd char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OBFRefundInd char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_OBFEES PRIMARY KEY (TravelOrderIdentifier,OBFSequenceNbr),
	CONSTRAINT FK_OBFees_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.OBFeesTax definition

-- Drop table

-- DROP TABLE travel.dbo.OBFeesTax;

CREATE TABLE travel.dbo.OBFeesTax (
	TravelOrderIdentifier int NOT NULL,
	OBFSequenceNbr int NOT NULL,
	OBFTaxSequenceNbr int NOT NULL,
	OBFTaxAmount numeric(18,2) NULL,
	OBFTaxCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_OBFEESTAX PRIMARY KEY (TravelOrderIdentifier,OBFSequenceNbr,OBFTaxSequenceNbr),
	CONSTRAINT FK_OBFeesTax_OBFees FOREIGN KEY (TravelOrderIdentifier,OBFSequenceNbr) REFERENCES travel.dbo.OBFees(TravelOrderIdentifier,OBFSequenceNbr)
);


-- travel.dbo.OpenAirSeg definition

-- Drop table

-- DROP TABLE travel.dbo.OpenAirSeg;

CREATE TABLE travel.dbo.OpenAirSeg (
	TravelOrderIdentifier int NOT NULL,
	OpenAirSegmentNbr int NOT NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarrierCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrInParty int NULL,
	BoardPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OffPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ClassOfService char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_OpenAirSeg PRIMARY KEY (TravelOrderIdentifier,OpenAirSegmentNbr),
	CONSTRAINT FK_OpenAirSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.OtherServiceInfo definition

-- Drop table

-- DROP TABLE travel.dbo.OtherServiceInfo;

CREATE TABLE travel.dbo.OtherServiceInfo (
	TravelOrderIdentifier int NOT NULL,
	OSISequenceNbr int NOT NULL,
	OSIVendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OSIData varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_OtherServiceInfo PRIMARY KEY (TravelOrderIdentifier,OSISequenceNbr),
	CONSTRAINT FK_OtherServiceInfo_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.PTCInfo definition

-- Drop table

-- DROP TABLE travel.dbo.PTCInfo;

CREATE TABLE travel.dbo.PTCInfo (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	PTCSequenceNbr int NOT NULL,
	PassengerTotalAmount numeric(18,3) NULL,
	PIC char(7) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PassengerBaseFareAmount numeric(18,2) NULL,
	PassengerEquivalentFareAmount numeric(18,2) NULL,
	PassengerTotalTaxAmount numeric(18,2) NULL,
	CONSTRAINT PK_PTCInfo PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,PTCSequenceNbr),
	CONSTRAINT FK_PTCInfo_AirFareQuo FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);


-- travel.dbo.Passenger definition

-- Drop table

-- DROP TABLE travel.dbo.Passenger;

CREATE TABLE travel.dbo.Passenger (
	TravelOrderIdentifier int NOT NULL,
	LastNameElement int NOT NULL,
	PassengerElement int NOT NULL,
	AbsoluteNameElement int NULL,
	FirstName varchar(55) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastName varchar(55) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NameRemark varchar(55) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Passenger PRIMARY KEY (TravelOrderIdentifier,LastNameElement,PassengerElement),
	CONSTRAINT FK_TOEPassenger FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.PhoneSeg definition

-- Drop table

-- DROP TABLE travel.dbo.PhoneSeg;

CREATE TABLE travel.dbo.PhoneSeg (
	TravelOrderIdentifier int NOT NULL,
	PhoneSequenceNbr int NOT NULL,
	PhoneCity char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PhoneType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PhoneNbr varchar(90) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_PhoneSeg PRIMARY KEY (TravelOrderIdentifier,PhoneSequenceNbr),
	CONSTRAINT FK_PhoneSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.PlusUp definition

-- Drop table

-- DROP TABLE travel.dbo.PlusUp;

CREATE TABLE travel.dbo.PlusUp (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	PlusupSequenceNbr int NOT NULL,
	PlusupReasonCode char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PlusupAmount numeric(18,2) NULL,
	CONSTRAINT PK_PLUSUP PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,PlusupSequenceNbr),
	CONSTRAINT FK_PLUSUP_PSGR_TYPE_AIRFAREQ FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr) REFERENCES travel.dbo.AirFareQuo(TravelOrderIdentifier,AirFareSequenceNbr)
);
 CREATE NONCLUSTERED INDEX Psgr_Type_Plus_Up_FK ON travel.dbo.PlusUp (  TravelOrderIdentifier ASC  , AirFareSequenceNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.PlusUpLoc definition

-- Drop table

-- DROP TABLE travel.dbo.PlusUpLoc;

CREATE TABLE travel.dbo.PlusUpLoc (
	TravelOrderIdentifier int NOT NULL,
	AirFareSequenceNbr int NOT NULL,
	PlusupSequenceNbr int NOT NULL,
	PlusupCitySequenceNbr int NOT NULL,
	PlusupCityCode char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_PLUSUPLOC PRIMARY KEY (TravelOrderIdentifier,AirFareSequenceNbr,PlusupSequenceNbr,PlusupCitySequenceNbr),
	CONSTRAINT FK_PLUSUPLO_PLUS_UP_C_PLUSUP FOREIGN KEY (TravelOrderIdentifier,AirFareSequenceNbr,PlusupSequenceNbr) REFERENCES travel.dbo.PlusUp(TravelOrderIdentifier,AirFareSequenceNbr,PlusupSequenceNbr)
);
 CREATE NONCLUSTERED INDEX Plus_Up_Cty_FK ON travel.dbo.PlusUpLoc (  TravelOrderIdentifier ASC  , AirFareSequenceNbr ASC  , PlusupSequenceNbr ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.ProfileClientFile definition

-- Drop table

-- DROP TABLE travel.dbo.ProfileClientFile;

CREATE TABLE travel.dbo.ProfileClientFile (
	TravelOrderIdentifier int NOT NULL,
	ProfileClientSequenceNbr int NOT NULL,
	ProfileClientCRS char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MARTitle char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BARTitle varchar(21) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PARTitle varchar(21) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ActiveIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PreferencesIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_ProfileClientFile PRIMARY KEY (TravelOrderIdentifier,ProfileClientSequenceNbr),
	CONSTRAINT FK_ProfileClientFile_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.ProgrammaticSSR definition

-- Drop table

-- DROP TABLE travel.dbo.ProgrammaticSSR;

CREATE TABLE travel.dbo.ProgrammaticSSR (
	TravelOrderIdentifier int NOT NULL,
	SSRSequenceNbr int NOT NULL,
	SSRCode char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SSRVendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	StatusCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AirSegmentNbr int NULL,
	LastNameElement int NULL,
	PassengerElement int NULL,
	AbsoluteNameElement int NULL,
	SSRData varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_ProgrammaticSSR PRIMARY KEY (TravelOrderIdentifier,SSRSequenceNbr),
	CONSTRAINT FK_ProgrammaticSSR_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.RfndAirTax definition

-- Drop table

-- DROP TABLE travel.dbo.RfndAirTax;

CREATE TABLE travel.dbo.RfndAirTax (
	TravelOrderIdentifier int NOT NULL,
	TaxSequenceNbr int NOT NULL,
	TaxCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TaxAmount numeric(18,3) NULL,
	TaxExemptIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_RfndAirTax PRIMARY KEY (TravelOrderIdentifier,TaxSequenceNbr),
	CONSTRAINT FK_RfndAirTax_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.RfndAirTaxBrk definition

-- Drop table

-- DROP TABLE travel.dbo.RfndAirTaxBrk;

CREATE TABLE travel.dbo.RfndAirTaxBrk (
	TravelOrderIdentifier int NOT NULL,
	TaxSequenceNbr int NOT NULL,
	TaxBreakdownSequenceNbr int NOT NULL,
	CurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TaxBreakdownCity varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TaxBreakdownAmount numeric(18,3) NULL,
	CONSTRAINT PK_RfndAirTaxBrk PRIMARY KEY (TravelOrderIdentifier,TaxSequenceNbr,TaxBreakdownSequenceNbr),
	CONSTRAINT FK_RfndAirTaxBrk_RfndAirTax FOREIGN KEY (TravelOrderIdentifier,TaxSequenceNbr) REFERENCES travel.dbo.RfndAirTax(TravelOrderIdentifier,TaxSequenceNbr)
);


-- travel.dbo.RfndTrans definition

-- Drop table

-- DROP TABLE travel.dbo.RfndTrans;

CREATE TABLE travel.dbo.RfndTrans (
	TravelOrderIdentifier int NOT NULL,
	IssueDateOfRefundedDoc char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RefundingIATANumber varchar(9) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PassengerName varchar(55) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DomesticInternationalInd char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RefundType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UnusedCoupons char(29) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ItinInvoiceNumber varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	WaiverCode varchar(14) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AirlineRefundAuthority varchar(14) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OriginalIssueDocNbr char(13) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OriginalPlaceOfIssue char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OriginalIATANbr varchar(9) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OriginalDateOfIssue char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CommissionPercentOnRefundedDocument numeric(5,2) NULL,
	CommissionAmountOnRefundedDocument numeric(18,3) NULL,
	PenaltyCancellationOrRefundFee numeric(18,3) NULL,
	CommissionPercentOnPenalty numeric(5,2) NULL,
	CommissionAmountOnPenalty numeric(18,3) NULL,
	RefundCurrency char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CashFarePaid numeric(18,3) NULL,
	CreditCardFarePaid numeric(18,3) NULL,
	TotalTaxAmountPaid numeric(18,3) NULL,
	CashAmountUsed numeric(18,3) NULL,
	CreditAmountUsed numeric(18,3) NULL,
	TaxAmountUsed numeric(18,3) NULL,
	TotalRefundAmount numeric(18,3) NULL,
	CashRefundAmount numeric(18,3) NULL,
	CreditCardRefundAmount numeric(18,3) NULL,
	NetFareIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NetFareAmountForRefund numeric(18,3) NULL,
	ActualSellingFareAmountForRefund numeric(18,3) NULL,
	MiscellaneousFeeAmout numeric(18,3) NULL,
	CommissionPercentReturned numeric(5,2) NULL,
	CommissionAmountReturned numeric(18,3) NULL,
	CONSTRAINT PK_RfndTrans PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_RfndTrans_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.SFTrans definition

-- Drop table

-- DROP TABLE travel.dbo.SFTrans;

CREATE TABLE travel.dbo.SFTrans (
	TravelOrderIdentifier int NOT NULL,
	SFActiveVoidStatus char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFDocumentNbr char(13) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NameOnServiceFee varchar(55) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFIssueDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFCurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ServiceFeeAmount numeric(18,3) NULL,
	SFCommissionAmount numeric(18,3) NULL,
	RelatedTicketDocumentNbr char(13) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RelatedInvoiceNbr varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_SFTrans PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_SFTrans_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.SeatSeg definition

-- Drop table

-- DROP TABLE travel.dbo.SeatSeg;

CREATE TABLE travel.dbo.SeatSeg (
	TravelOrderIdentifier int NOT NULL,
	SeatSequenceNbr int NOT NULL,
	FlightNbr char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OperationalSuffix char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CarrierCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BookingCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BoardPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OffPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightSegmentNbr int NULL,
	NbrInParty int NULL,
	COGSequenceNbr int NULL,
	CONSTRAINT PK_SeatSeg PRIMARY KEY (TravelOrderIdentifier,SeatSequenceNbr),
	CONSTRAINT FK_SeatSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.TAMTicketingArrangement definition

-- Drop table

-- DROP TABLE travel.dbo.TAMTicketingArrangement;

CREATE TABLE travel.dbo.TAMTicketingArrangement (
	TravelOrderIdentifier int NOT NULL,
	DateToMailTicket char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TAMFreeText varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TAMTicketingArrangement PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_TAMTicketingArrangement_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.TAUTicketingArrangement definition

-- Drop table

-- DROP TABLE travel.dbo.TAUTicketingArrangement;

CREATE TABLE travel.dbo.TAUTicketingArrangement (
	TravelOrderIdentifier int NOT NULL,
	TAUSequenceNbr int NOT NULL,
	DateOnQueue char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BranchPseudoCityCode varchar(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TAUTicketingArrangement PRIMARY KEY (TravelOrderIdentifier,TAUSequenceNbr),
	CONSTRAINT FK_TAUTicketingArrangement_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.TAWTicketingArrangement definition

-- Drop table

-- DROP TABLE travel.dbo.TAWTicketingArrangement;

CREATE TABLE travel.dbo.TAWTicketingArrangement (
	TravelOrderIdentifier int NOT NULL,
	TAWSequenceNbr int NOT NULL,
	DateOnQueue char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TimeOnQueue char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BranchPseudoCityCode varchar(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	InHouseAccountCode varchar(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TAWTicketingArrangement PRIMARY KEY (TravelOrderIdentifier,TAWSequenceNbr),
	CONSTRAINT FK_TAWTicketingArrangement_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.TLTicketingArrangement definition

-- Drop table

-- DROP TABLE travel.dbo.TLTicketingArrangement;

CREATE TABLE travel.dbo.TLTicketingArrangement (
	TravelOrderIdentifier int NOT NULL,
	MinutesBeforeDeparture int NOT NULL,
	DateToIssueTicket char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TimeToIssueTicket char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AirportCode varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AirlineCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TLFreeText varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TLTicketingArrangement PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_TLTicketingArrangement_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.TicketingArrangement definition

-- Drop table

-- DROP TABLE travel.dbo.TicketingArrangement;

CREATE TABLE travel.dbo.TicketingArrangement (
	TravelOrderIdentifier int NOT NULL,
	TAFreeText varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TicketingArrangement PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_TicketingArrangement_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.TktRemarks definition

-- Drop table

-- DROP TABLE travel.dbo.TktRemarks;

CREATE TABLE travel.dbo.TktRemarks (
	TravelOrderIdentifier int NOT NULL,
	SequenceNbr int NOT NULL,
	Keyword char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RemarkText varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TktRemarks PRIMARY KEY (TravelOrderIdentifier,SequenceNbr),
	CONSTRAINT FK_TktRemarks_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.TktTrans definition

-- Drop table

-- DROP TABLE travel.dbo.TktTrans;

CREATE TABLE travel.dbo.TktTrans (
	TravelOrderIdentifier int NOT NULL,
	TicketNbr char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionYear char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionCrs char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionStockType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TicketType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ActiveVoidStatus char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionPlatingAlpha char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionPlatingNbr char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TransactionType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DecimalNbr int NULL,
	OBFTotalAmount numeric(18,2) NULL,
	OBFGrandTotalAmount numeric(18,2) NULL,
	TourCode varchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ITBTIndicator char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NetRemitIndicator char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FareCalculationPricingInd char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	InvoiceNumber char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AirlineCommissionPercent numeric(5,2) NULL,
	AirlineCommissionAmount numeric(18,3) NULL,
	CONSTRAINT PK_TKTTRANS PRIMARY KEY (TravelOrderIdentifier),
	CONSTRAINT FK_TKTTRANS_IDS_TVL_O_TVLORDRE FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);
 CREATE NONCLUSTERED INDEX IDS_Tvl_Ordr_Tkt_Trans_FK ON travel.dbo.TktTrans (  TravelOrderIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.TrainSeg definition

-- Drop table

-- DROP TABLE travel.dbo.TrainSeg;

CREATE TABLE travel.dbo.TrainSeg (
	TravelOrderIdentifier int NOT NULL,
	TrainSegmentNbr int NOT NULL,
	SegmentStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ServiceType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DepartureTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ChangeOfDay int NULL,
	VendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ArrivalTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BookingCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TrainNbr char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NbrOfSeats int NULL,
	SellType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TariffType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ConfirmationNbr char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BoardPoint varchar(23) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OffPoint varchar(23) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Text] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_TrainSeg PRIMARY KEY (TravelOrderIdentifier,TrainSegmentNbr),
	CONSTRAINT FK_TrainSeg_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.VendorRecordLocator definition

-- Drop table

-- DROP TABLE travel.dbo.VendorRecordLocator;

CREATE TABLE travel.dbo.VendorRecordLocator (
	TravelOrderIdentifier int NOT NULL,
	SequenceNbr int NOT NULL,
	VendorDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VendorTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RecordLocator varchar(9) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_VendorRecordLocator PRIMARY KEY (TravelOrderIdentifier,SequenceNbr),
	CONSTRAINT FK_VendorRecordLocator_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.VendorRemarks definition

-- Drop table

-- DROP TABLE travel.dbo.VendorRemarks;

CREATE TABLE travel.dbo.VendorRemarks (
	TravelOrderIdentifier int NOT NULL,
	SequenceNbr int NOT NULL,
	RemarkDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RemarkTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RemarkType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VendorType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VendorCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RemarkText varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_VendorRemarks PRIMARY KEY (TravelOrderIdentifier,SequenceNbr),
	CONSTRAINT FK_VendorRemarks_TravelOrderEvent FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TravelOrderEvent(TravelOrderIdentifier)
);


-- travel.dbo.AirTktSeg definition

-- Drop table

-- DROP TABLE travel.dbo.AirTktSeg;

CREATE TABLE travel.dbo.AirTktSeg (
	TravelOrderIdentifier int NOT NULL,
	CouponSequenceNbr int NOT NULL,
	TicketNbr char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Carrier char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightNbr char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CouponBoardPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CouponOffPoint char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightDate char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightTime char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightServiceClass char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NotValidBeforeDate char(11) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NotValidAfterDate char(11) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightCouponStatus char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FlightBaggageAllowance char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PNRSegmentNbr int NULL,
	RecordLocator char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EquipmentType char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Mileage varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ClassOfServDesc varchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_AIRTKTSEG PRIMARY KEY (TravelOrderIdentifier,TicketNbr,CouponSequenceNbr),
	CONSTRAINT FK_AIRTKTSE_TKT_TRANS_TKTTRANS FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TktTrans(TravelOrderIdentifier)
);
 CREATE NONCLUSTERED INDEX tkt_trans_cpn_FK ON travel.dbo.AirTktSeg (  TravelOrderIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.Fop definition

-- Drop table

-- DROP TABLE travel.dbo.Fop;

CREATE TABLE travel.dbo.Fop (
	TravelOrderIdentifier int NOT NULL,
	FopSequenceNbr int NOT NULL,
	FopType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PaymentAmount numeric(18,2) NULL,
	FopDocumentIdentifier char(29) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FopDocumentType char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FopApprovalCode varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FopApprovalType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_FOP PRIMARY KEY (TravelOrderIdentifier,FopSequenceNbr),
	CONSTRAINT FK_FOP_TKT_TRANS_TKTTRANS FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.TktTrans(TravelOrderIdentifier)
);
 CREATE NONCLUSTERED INDEX Tkt_Trans_FOP_FK ON travel.dbo.Fop (  TravelOrderIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- travel.dbo.FopCrCrd definition

-- Drop table

-- DROP TABLE travel.dbo.FopCrCrd;

CREATE TABLE travel.dbo.FopCrCrd (
	TravelOrderIdentifier int NOT NULL,
	FopSequenceNbr int NOT NULL,
	CreditCardVendorCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExpirationMonth char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExpirationYear char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExtendedPayment int NULL,
	CreditCardHolderName char(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_FOPCRCRD PRIMARY KEY (TravelOrderIdentifier,FopSequenceNbr),
	CONSTRAINT FK_FOPCRCRD_FOP_TYPES_FOP FOREIGN KEY (TravelOrderIdentifier,FopSequenceNbr) REFERENCES travel.dbo.Fop(TravelOrderIdentifier,FopSequenceNbr)
);


-- travel.dbo.FopExchg definition

-- Drop table

-- DROP TABLE travel.dbo.FopExchg;

CREATE TABLE travel.dbo.FopExchg (
	TravelOrderIdentifier int NOT NULL,
	FopSequenceNbr int NOT NULL,
	ExchangeSequenceNbr int NOT NULL,
	OriginalTicketNbr char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExchangeType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExchangeIssuePlace char(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExchangeIssueDate char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExchangeIssueIata char(9) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OriginalPlatingNbr char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExchangeCurrencyCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ExchangeTicketNbr char(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DecimalNbr int NULL,
	FullPartialIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UnusedCoupons char(19) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CommissionAmountOnExchangedDoc numeric(18,3) NULL,
	CashFarePaid numeric(18,3) NULL,
	CreditCardFarePaid numeric(18,3) NULL,
	TotalTaxAmountPaid numeric(18,3) NULL,
	TotalExchangeAmount numeric(18,3) NULL,
	ChangeFeePenalty numeric(18,3) NULL,
	CommissionAmountOnPenalty numeric(18,3) NULL,
	AdditionalCollectionAmount numeric(18,3) NULL,
	CONSTRAINT PK_FOPEXCHG PRIMARY KEY (TravelOrderIdentifier,FopSequenceNbr,ExchangeSequenceNbr),
	CONSTRAINT FK_FOPEXCHG_FOP FOREIGN KEY (TravelOrderIdentifier,FopSequenceNbr) REFERENCES travel.dbo.Fop(TravelOrderIdentifier,FopSequenceNbr)
);


-- travel.dbo.FrequentFlyer definition

-- Drop table

-- DROP TABLE travel.dbo.FrequentFlyer;

CREATE TABLE travel.dbo.FrequentFlyer (
	TravelOrderIdentifier int NOT NULL,
	LastNameElement int NOT NULL,
	PassengerElement int NOT NULL,
	FrequentTravelerVendor char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FrequentFlyerStatus char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FrequentTravelerNbr varchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CrossAccrualVendors varchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_FrequentFlyer PRIMARY KEY (TravelOrderIdentifier,LastNameElement,PassengerElement,FrequentTravelerVendor),
	CONSTRAINT FK_FrequentFlyer_Passenger FOREIGN KEY (TravelOrderIdentifier,LastNameElement,PassengerElement) REFERENCES travel.dbo.Passenger(TravelOrderIdentifier,LastNameElement,PassengerElement)
);


-- travel.dbo.SFFop definition

-- Drop table

-- DROP TABLE travel.dbo.SFFop;

CREATE TABLE travel.dbo.SFFop (
	TravelOrderIdentifier int NOT NULL,
	SFFopSequenceNbr int NOT NULL,
	SFFopType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFPaymentAmount numeric(18,3) NULL,
	SFFopDocumentType char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFFopApprovalCode varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFFopApprovalType char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_SFFop PRIMARY KEY (TravelOrderIdentifier,SFFopSequenceNbr),
	CONSTRAINT FK_SFFop_SFTrans FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.SFTrans(TravelOrderIdentifier)
);


-- travel.dbo.SFFopCrCrd definition

-- Drop table

-- DROP TABLE travel.dbo.SFFopCrCrd;

CREATE TABLE travel.dbo.SFFopCrCrd (
	TravelOrderIdentifier int NOT NULL,
	SFFopSequenceNbr int NOT NULL,
	SFCreditCardVendorCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFFopExpirationMonth char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFFopExpirationYear char(4) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFExtendedPayment int NULL,
	CONSTRAINT PK_SFFopCrCrd PRIMARY KEY (TravelOrderIdentifier,SFFopSequenceNbr),
	CONSTRAINT FK_SFFopCrCrd_SFFop FOREIGN KEY (TravelOrderIdentifier,SFFopSequenceNbr) REFERENCES travel.dbo.SFFop(TravelOrderIdentifier,SFFopSequenceNbr)
);


-- travel.dbo.SFTax definition

-- Drop table

-- DROP TABLE travel.dbo.SFTax;

CREATE TABLE travel.dbo.SFTax (
	TravelOrderIdentifier int NOT NULL,
	SFTaxSequenceNbr int NOT NULL,
	SFTaxCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SFTaxAmount numeric(18,3) NULL,
	SFTaxExemptIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_SFTax PRIMARY KEY (TravelOrderIdentifier,SFTaxSequenceNbr),
	CONSTRAINT FK_SFTax_SFTrans FOREIGN KEY (TravelOrderIdentifier) REFERENCES travel.dbo.SFTrans(TravelOrderIdentifier)
);


-- travel.dbo.SeatAssignment definition

-- Drop table

-- DROP TABLE travel.dbo.SeatAssignment;

CREATE TABLE travel.dbo.SeatAssignment (
	TravelOrderIdentifier int NOT NULL,
	SeatSequenceNbr int NOT NULL,
	SeatAssignmentSequenceNbr int NOT NULL,
	LastNameElement int NULL,
	PassengerElement int NULL,
	AbsoluteNameElement int NULL,
	SeatStatusCode char(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SeatLocation char(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_SeatAssignment PRIMARY KEY (TravelOrderIdentifier,SeatSequenceNbr,SeatAssignmentSequenceNbr),
	CONSTRAINT FK_SeatAssignment_SeatSeg FOREIGN KEY (TravelOrderIdentifier,SeatSequenceNbr) REFERENCES travel.dbo.SeatSeg(TravelOrderIdentifier,SeatSequenceNbr)
);


-- travel.dbo.ExchgPaidTax definition

-- Drop table

-- DROP TABLE travel.dbo.ExchgPaidTax;

CREATE TABLE travel.dbo.ExchgPaidTax (
	TravelOrderIdentifier int NOT NULL,
	FopSequenceNbr int NOT NULL,
	ExchangeSequenceNbr int NOT NULL,
	TaxSequenceNbr int NOT NULL,
	TaxCode char(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TaxAmount numeric(18,3) NULL,
	TaxExemptIndicator char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_ExchgPaidTax PRIMARY KEY (TravelOrderIdentifier,FopSequenceNbr,ExchangeSequenceNbr,TaxSequenceNbr),
	CONSTRAINT FK_ExchgPaidTax_FopExchg FOREIGN KEY (TravelOrderIdentifier,FopSequenceNbr,ExchangeSequenceNbr) REFERENCES travel.dbo.FopExchg(TravelOrderIdentifier,FopSequenceNbr,ExchangeSequenceNbr)
);
