# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      class HealthController < Frontend::BaseController
        include Deps[
          change_health: 'commands.characters_context.pathfinder2.change_health'
        ]
        include SerializeResource

        def create
          change_health.call({ character: character, value: params[:value] })
          serialize_resource(character, ::Pathfinder2::CharacterSerializer, :character, {})
        end

        private

        def character
          @character ||= current_user.characters.pathfinder2.find(params[:character_id])
        end
      end
    end
  end
end
