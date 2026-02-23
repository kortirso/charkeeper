# frozen_string_literal: true

module FalloutCharacter
  class BaseDecorator < SimpleDelegator
    delegate :data, to: :__getobj__
    delegate :abilities, to: :data

    def method_missing(method, *args) # rubocop: disable Lint/UnusedMethodArgument
      __getobj__.respond_to?(method.to_sym) ? __getobj__.public_send(method) : nil
    end

    def carry_weight
      150 + (abilities['str'] * 10)
    end

    def initiative
      abilities['per'] + abilities['agi']
    end

    def health
      abilities['end'] + abilities['lck']
    end
  end
end
