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
      contract_result = validate_contract(input)
      return { errors: contract_result[:errors], errors_list: contract_result[:errors_list] } if contract_result[:errors].present?

      input = contract_result[:result]
      errors = validate_content(input)
      return { errors: errors, errors_list: errors } if errors.present?

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
    return { result: input, errors: {} } if contract.nil?

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
    result = contract.call(input)
    {
      result: result.to_h,
      errors: flatten_hash_from(contract.call(input).errors(locale: I18n.locale).to_h),
      errors_list: contract.call(input).errors(locale: I18n.locale).to_h.values.flatten
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
