# frozen_string_literal: true

class BaseContract < Dry::Validation::Contract
  config.messages.backend = :i18n
  config.messages.top_namespace = 'dry_schema'

  register_macro(:check_only_one_present) do
    amount_of_present_keys = keys.count { |k| values.key?(k) && values[k].present? }

    keys.each { |k| key(k).failure(:only_one_present) } if amount_of_present_keys > 1
  end
end
