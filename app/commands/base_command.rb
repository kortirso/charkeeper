# frozen_string_literal: true

class BaseCommand
  include ActionView::Helpers::SanitizeHelper
  include Deps[monitoring: 'monitoring.client']

  class_attribute :contract

  def self.use_contract(&block)
    self.contract = Class.new(BaseContract, &block).new
  end

  def call(input={})
    lockable(input) do
      unless input[:skip_contract_validation]
        validate_result = validate_all(input)
        return validate_result if validate_result[:errors].present?

        input = validate_result[:result]
      end

      do_prepare(input)
      do_persist(input)
    end
  rescue WithAdvisoryLock::FailedToAcquireLock => _e
    { errors: ['Double saving'], errors_list: ['Double saving'] }
  end

  def validate_all(input, custom_contract=nil)
    contract_result = validate_contract(input, custom_contract)
    return contract_result if contract_result[:errors].present?

    input = contract_result[:result]
    errors = validate_content(input)
    return { errors: errors, errors_list: errors, raw_errors: errors } if errors.present?

    { result: input }
  end

  private

  def lockable(input, &block)
    lock_key_value = lock_key(input)
    return yield unless with_lock?(lock_key_value)

    ApplicationRecord.with_advisory_lock!(lock_key_value, timeout_seconds: lock_time, &block)
  end

  def with_lock?(lock_key_value)
    lock_key_value.present?
  end

  def lock_key(input); end
  def lock_time = nil

  def validate_contract(input, custom_contract=nil)
    return { result: input, errors: {} } if (custom_contract || contract).nil?

    validate(input, custom_contract)
  end

  # for additional validation outside contract
  # should return nil or error string
  def validate_content(input); end

  # for transforming data in input
  # should return input
  def do_prepare(input); end

  # persisting
  def do_persist(input) = raise NotImplementedError

  def validate(input, custom_contract=nil)
    result = (custom_contract || contract).call(input)
    raw_errors = result.errors(locale: I18n.locale).to_h
    {
      result: result.to_h,
      raw_errors: raw_errors,
      errors: flatten_hash_from(raw_errors),
      errors_list: raw_errors.values.flat_map do |item|
        next item.values if item.is_a?(Hash)

        item
      end
    }
  rescue Dry::Validation::MissingMessageError => _e
    monitoring_validation_error(input)
    {
      errors: { base: [I18n.t('validation_error')] },
      errors_list: [I18n.t('validation_error')]
    }
  end

  def flatten_hash_from(hash)
    hash.each_with_object({}) do |(key, value), acc|
      next acc[key] = value unless value.is_a?(Hash)

      flatten_hash_from(value).each do |k, v|
        acc[:"#{key}.#{k}"] = v
      end
    end
  end

  def monitoring_validation_error(input)
    monitoring.notify(
      exception: Monitoring::ValidationError.new('Validation error'),
      metadata: { input: input },
      severity: :info
    )
  end
end
