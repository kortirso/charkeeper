# frozen_string_literal: true

module ImportContext
  class Dnd5
    def call(user:, provider:, data:)
      service(provider)&.call(user: user, data: data)
    end

    private

    def service(provider)
      case provider
      when 'beyond' then ImportContext::Dnd5::BeyondService.new
      end
    end
  end
end
