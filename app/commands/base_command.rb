# frozen_string_literal: true

class BaseCommand
  class_attribute :contract

  def self.use_contract(&block)
    self.contract = Class.new(BaseContract, &block).new
  end

  def call(input={})
    lockable(input) do
      errors = validate_contract(input).presence || validate_content(input)
      return { errors: errors } if errors.present?

      do_prepare(input)
      do_persist(input)
    end
  end

  private

  def lockable(input, &block)
    lock_key_value = lock_key(input)
    return yield unless with_lock?(lock_key_value)

    ApplicationRecord.with_advisory_lock(lock_key_value, &block)
  end

  def with_lock?(lock_key_value)
    lock_key_value.present?
  end

  def lock_key(input); end

  def validate_contract(input)
    return if contract.nil?

    validate(input)
  end

  # for additional validation outside contract
  # should return nil or error string
  def validate_content(input); end

  # for transforming data in input
  # should return input
  def do_prepare(input); end

  # persisting
  def do_persist(input) = raise NotImplementedError

  def validate(input)
    contract.call(input).errors(locale: I18n.locale).to_h
  end
end
