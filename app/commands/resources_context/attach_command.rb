# frozen_string_literal: true

module ResourcesContext
  class AttachCommand < BaseCommand
    use_contract do
      config.messages.namespace = :resource

      params do
        required(:character).filled(type?: ::Character)
        required(:custom_resource).filled(type?: ::CustomResource)
      end
    end

    private

    def do_persist(input)
      result = ::Character::Resource.find_or_create_by(input)

      { result: result }
    end
  end
end
