# frozen_string_literal: true

module ResourcesContext
  class ChangeCommand < BaseCommand
    use_contract do
      config.messages.namespace = :resource

      Directions = Dry::Types['strict.integer'].enum(0, 1)

      params do
        required(:custom_resource).filled(type?: ::CustomResource)
        optional(:name).filled(:string, max_size?: 50)
        optional(:reset_direction).filled(Directions)
        optional(:max_value).filled(:integer, gteq?: 1)
        optional(:resets).hash
        optional(:description).filled(:string, max_size?: 1_000)
      end
    end

    private

    def do_prepare(input)
      input[:name] = sanitize(input[:name])
      input[:description] = sanitize(input[:description]) if input[:description]
    end

    def do_persist(input)
      input[:custom_resource].update!(input.except(:custom_resource))

      { result: input[:custom_resource] }
    end
  end
end
