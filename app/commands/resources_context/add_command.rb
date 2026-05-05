# frozen_string_literal: true

module ResourcesContext
  class AddCommand < BaseCommand
    include Deps[
      attach_resource: 'commands.resources_context.attach'
    ]

    use_contract do
      config.messages.namespace = :resource

      Directions = Dry::Types['strict.integer'].enum(0, 1)

      params do
        required(:resourceable).filled(type_included_in?: [::Character, ::Campaign])
        required(:name).filled(:string, max_size?: 50)
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
      input[:resets]&.transform_values!(&:to_i)
    end

    def do_persist(input)
      result = ::CustomResource.create!(input)

      attach_resource.call(character: input[:resourceable], custom_resource: result) if input[:resourceable].is_a?(::Character)

      { result: result }
    end
  end
end
