# frozen_string_literal: true

module ImportContext
  class Upload
    MAPPER = {
      'dnd2024' => {
        'beyond' => ImportContext::Dnd2024::BeyondService
      },
      'dnd5' => {
        'beyond' => ImportContext::Dnd5::BeyondService
      },
      'pathfinder2' => {
        'pathbuilder_json' => ImportContext::Pathfinder2::PbJsonService,
        'pathbuilder_id' => ImportContext::Pathfinder2::PbIdService
      }
    }.freeze

    def call(user:, provider:, service:, data:)
      service(provider, service).call(user: user, data: data)
    end

    private

    def service(provider, service)
      MAPPER.dig(provider, service).new
    end
  end
end
