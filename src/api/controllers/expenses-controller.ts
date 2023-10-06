import { isNil } from "lodash"

import BaseController from "./base-controller"

import { Expense, Form } from "../models"
import { ExpensesPolicy } from "../policies"
import { ExpensesSerializer } from "../serializers"
import { ExpensesService } from "../services"

export class ExpensesController extends BaseController {
  index() {
    const where = this.query.where
    return Expense.findAll({
      where,
    }).then((expenses) => {
      const serializedExpenses = ExpensesSerializer.asTable(expenses)
      return this.response.json({ expenses: serializedExpenses })
    })
  }

  async create() {
    const expense = await this.buildExpense()
    const policy = this.buildPolicy(expense)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create this expense." })
    }

    const permittedAttributes = policy.permitAttributesForCreate()
    return ExpensesService.create(permittedAttributes)
      .then((expense) => {
        return this.response.status(201).json({ expense })
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `Expense creation failed: ${error}` })
      })
  }

  async update() {
    const expense = await this.loadExpense()
    if (isNil(expense)) return this.response.status(404).json({ message: "Expense not found." })

    const policy = this.buildPolicy(expense)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update this expense." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate()
    return ExpensesService.update(this.params.expenseId, permittedAttributes)
      .then((expense) => {
        this.response.json({ expense })
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `Expense update failed: ${error}` })
      })
  }

  private async buildExpense() {
    const attributes = this.request.body
    const { taid: formId } = attributes
    const form = await Form.findByPk(formId)
    return new Expense({ ...attributes, form })
  }

  private loadExpense(): Promise<Expense | undefined> {
    return Expense.findByPk(this.params.expenseId, { include: ["form"] })
  }

  private buildPolicy(record: Expense): ExpensesPolicy {
    return new ExpensesPolicy(this.currentUser, record)
  }
}

export default ExpensesController
