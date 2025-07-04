# frozen_string_literal: true

module Frontend
  module Dnd5
    module Characters
      class HealthController < Frontend::BaseController
        include Deps[
          change_health: 'commands.characters_context.dnd5.change_health'
        ]
        include SerializeResource

        def create
          change_health.call({ character: character, value: params[:value] })
          serialize_resource(character, serializer, :character, {})
        end

        private

        def character
          @character ||= authorized_scope(Character.all).dnd.find(params[:character_id])
        end

        def serializer
          return ::Dnd5::CharacterSerializer if @character.is_a?(::Dnd5::Character)

          ::Dnd2024::CharacterSerializer
        end
      end
    end
  end
end
