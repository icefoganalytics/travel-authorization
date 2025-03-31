export default {
  global: {
    // TODO: move to per-model key
    phase: {
      expensed: "Expensed",
      expensing: "Expensing",
      travel_approval: "Travel Approval",
      travel_complete: "Travel Complete",
      travel_planning: "Travel Planning",
      travelling: "Travelling",
    },
    // TODO: move to per-model key
    status: {
      active: "Active",
      approved: "Approved",
      awaiting_director_approval: "Awaiting Director Approval",
      booked: "Booked",
      change_requested: "Change Requested",
      deleted: "Deleted",
      denied: "Denied",
      draft: "Draft",
      expense_claim_submitted: "Expense Claim Submitted",
      expense_claim_approved: "Expense Claim Approved",
      expense_claim_denied: "Expense Claim Denied",
      expensed: "Expensed",
      inactive: "Inactive",
      submitted: "Submitted",
      travelling: "Travelling",
    },
  },
  per_diem: {
    claim_type: {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      incidentals: "Incidentals",
      private_accommodations: "Private Accommodations",
    },
    travel_region: {
      Alaska: "Alaska",
      Canada: "Rest of Canada",
      Nunavut: "Nunavut",
      NWT: "NWT",
      US: "Rest of USA",
      Yukon: "Yukon",
    },
  },
  role: {
    name: {
      admin: "Admin",
      user: "User",
      pre_approved_travel_admin: "Pre-Approved Travel Admin",
      department_admin: "Department Admin",
      travel_desk_user: "Travel Desk User",
    },
  },
  travel_allowance: {
    allowance_type: {
      maxium_aircraft_allowance: "Maximum Aircraft Allowance",
      aircraft_allowance_per_segment: "Aircraft Allowance Per Segment",
      distance_allowance_per_kilometer: "Distance Allowance Per Kilometer",
      hotel_allowance_per_night: "Hotel Allowance Per Night",
    },
  },
  travel_authorization: {
    trip_type: {
      one_way: "One way",
      round_trip: "Round trip",
      multi_city: "Multi-city",
    },
  },
  travel_authorization_pre_approval_submission: {
    status: {
      draft: "Draft",
      submitted: "Submitted",
      approved: "Approved",
      rejected: "Rejected",
      finished: "Finished",
    },
  },
  travel_authorization_pre_approval: {
    status: {
      draft: "Draft",
      submitted: "Submitted",
      approved: "Approved",
      declined: "Declined",
    },
  },
  travel_desk_travel_request: {
    status: {
      booked: "Booked",
      complete: "Complete",
      draft: "Draft",
      options_provided: "Options Provided",
      options_ranked: "Options Ranked",
      submitted: "Submitted",
    },
  },
  travel_desk_question: {
    request_type: {
      flight: "Flight",
      hotel: "Hotel",
      transportation: "Transportation",
      rental_car: "Rental Car",
    },
  },
}
