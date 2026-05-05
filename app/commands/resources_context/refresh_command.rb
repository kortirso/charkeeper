# frozen_string_literal: true

module ResourcesContext
  class RefreshCommand < BaseCommand
    use_contract do
      config.messages.namespace = :resource

      params do
        required(:resource).filled(type?: ::Character::Resource)
        optional(:value).filled(:integer, gteq?: 0)
      end
    end

    private

    def do_persist(input)
      input[:resource].update!(input.except(:resource))

      { result: input[:resource] }
    end
  end
end
