import logger from "@/utils/logger"

const EWS = require("node-ews")
const schedule = require("node-schedule")
const db = require("./queries")
const environment = process.env.NODE_ENV || "staging"
const config = require("./config/knexfile.js")[environment]
const knex = require("knex")(config)
// const moment = require("moment");

const ewsConfig = {
  username: process.env.EMAILER_USERNAME,
  password: process.env.EMAILER_PASSWORD,
  host: process.env.EMAIL_HOST,
}

const ews = new EWS(ewsConfig)
ews.auth.toString = () => "auth"

const url = process.env.APP_URL + "recover/"
const cron = require("node-cron")

function sendEmail(receiver: String, subject: String, body: String) {
  const ewsArgs = getEmailConfig(receiver, subject, body)

  const ewsChild = new EWS(ewsConfig)

  ewsChild
    .run("CreateItem", ewsArgs)
    .then((result: any) => {
      logger.info(JSON.stringify(result))
    })
    .catch((err: any) => {
      logger.info(err.stack)
    })
}

exports.sendEmail = function (receiver: String, subject: String, body: String) {
  const ewsArgs = getEmailConfig(receiver, subject, body)
  ews
    .run("CreateItem", ewsArgs)
    .then((result: any) => {
      logger.info(JSON.stringify(result))
    })
    .catch((err: any) => {
      logger.info(err.stack)
    })
}

exports.sendSuccessfulSubmit = function (receiver: String, code: String) {
  const subject = "YG Travel Form Submitted"
  const ewsArgs = getEmailConfig(receiver, subject, submittedFormEmailBody(code))
  ews
    .run("CreateItem", ewsArgs)
    .then((result: any) => {
      logger.info(JSON.stringify(result))
    })
    .catch((err: any) => {
      logger.info(err.stack)
    })
}

exports.sendSuccessfulUpdate = function (receiver: String, code: String) {
  const subject = "YG Travel Form Updated"
  const ewsArgs = getEmailConfig(receiver, subject, updatedFormEmailBody(code))
  ews
    .run("CreateItem", ewsArgs)
    .then((result: any) => {
      logger.info(JSON.stringify(result))
    })
    .catch((err: any) => {
      logger.info(err.stack)
    })
}

function getEmailConfig(receiver: String, subject: String, body: String) {
  return {
    attributes: {
      MessageDisposition: "SendAndSaveCopy",
    },
    SavedItemFolderId: {
      DistinguishedFolderId: {
        attributes: {
          Id: "sentitems",
        },
      },
    },
    Items: {
      Message: {
        ItemClass: "IPM.Note",
        Subject: subject,
        Body: {
          attributes: {
            BodyType: "HTML",
          },
          $value: body,
        },
        ToRecipients: {
          Mailbox: {
            EmailAddress: receiver,
          },
        },
        IsRead: "false",
      },
    },
  }
}

function submittedFormEmailBody(code: String) {
  return (
    `You travel request has been successfully submitted. If you required assistance, someone will contact you within the next few days. If you wish to update your travel request, please visit ` +
    url +
    code +
    `.`
  )
}

function updatedFormEmailBody(code: String) {
  return (
    `You travel request has been successfully updated. If you required assistance, someone will contact you within the next few days. If you wish to update your travel request again, please visit ` +
    url +
    code +
    `.`
  )
}

// function createReportForEmail(notices) {
// 	report = '';
// 	report += 'Trips to your community this week: ' + notices.length + '<br>';
// 	report += '─────────────────────' + '<br>';
// 	notices.forEach((notice) => {
// 		const contactedFirstNation = notice.contactedFirstNation ? 'Yes' : 'No';
// 		const contactedMunicipality = notice.contactedMunicipality ? 'Yes' : 'No';
// 		const contactedOtherGroup = notice.contactedOtherGroup ? 'Yes' : 'No';
// 		report +=
// 			'<br><b>Name:</b> ' +
// 			notice.name +
// 			'<br>' +
// 			'<b>Email:</b> ' +
// 			notice.email +
// 			'<br>' +
// 			'<b>Department:</b> ' +
// 			notice.department +
// 			'<br>' +
// 			'<b>Destinations:</b> ' +
// 			notice.destination.toString().replace(/,/g, ', ') +
// 			'<br>' +
// 			'<b>Number of Travellers:</b> ' +
// 			notice.travellers +
// 			'<br>' +
// 			'<b>Arrival Date:</b> ' +
// 			moment(notice.arrivalDate).format('LL') +
// 			'<br>' +
// 			'<b>Return Date:</b> ' +
// 			moment(notice.returnDate).format('LL') +
// 			'<br>' +
// 			'<b>Purpose:</b> ' +
// 			notice.purpose +
// 			'<br>' +
// 			'<b>Contacted First Nation:</b> ' +
// 			contactedFirstNation +
// 			'<br>' +
// 			'<b>Contacted Municipality:</b> ' +
// 			contactedMunicipality +
// 			'<br>' +
// 			'<b>Contacted Other Group:</b> ' +
// 			contactedOtherGroup +
// 			'<br>';
// 		if (notice.contactedOtherGroup)
// 			report += '<b>Other Contact:</b> ' + notice.otherGroupInfo + '<br>';
// 		report += '─────────────────────' + '<br>';
// 	});
// 	return report;
// }

// exports.createSingleReportForEmail = function (notice) {
// 	report = '';
// 	const contactedFirstNation = notice.contactedFirstNation ? 'Yes' : 'No';
// 	const contactedMunicipality = notice.contactedMunicipality ? 'Yes' : 'No';
// 	const contactedOtherGroup = notice.contactedOtherGroup ? 'Yes' : 'No';
// 	report +=
// 		'<b>Name:</b> ' +
// 		notice.name +
// 		'<br>' +
// 		'<b>Email:</b> ' +
// 		notice.email +
// 		'<br>' +
// 		'<b>Department:</b> ' +
// 		notice.department +
// 		'<br>' +
// 		'<b>Destinations:</b> ' +
// 		notice.destination.replace(/\[|\]|\"/g, '').replace(/,/g, ', ') +
// 		'<br>' +
// 		'<b>Number of Travellers:</b> ' +
// 		notice.travellers +
// 		'<br>' +
// 		'<b>Arrival Date:</b> ' +
// 		moment(notice.arrivalDate).format('LL') +
// 		'<br>' +
// 		'<b>Return Date:</b> ' +
// 		moment(notice.returnDate).format('LL') +
// 		'<br>' +
// 		'<b>Purpose:</b> ' +
// 		notice.purpose +
// 		'<br>' +
// 		'<b>Contacted First Nation:</b> ' +
// 		contactedFirstNation +
// 		'<br>' +
// 		'<b>Contacted Municipality:</b> ' +
// 		contactedMunicipality +
// 		'<br>' +
// 		'<b>Contacted Other Group:</b> ' +
// 		contactedOtherGroup +
// 		'<br>';
// 	if (notice.contactedOtherGroup)
// 		report += '<b>Other Contact:</b> ' + notice.otherGroupInfo + '\n';
// 	return report;
// };
