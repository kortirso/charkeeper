# frozen_string_literal: true

class Formula
  def call(formula:, variables: {})
    calculator.evaluate(formula, **variables)
  end

  private

  def calculator
    @calculator ||= begin
      result = Dentaku::Calculator.new
      result.add_function(:d, :numeric, ->(dice_value) { rand(1..dice_value.to_i.abs) })
      result
    end
  end
end
