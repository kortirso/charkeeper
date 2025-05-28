# frozen_string_literal: true

module WebTelegram
  module Pathfinder2
    module Characters
      class HealthController < WebTelegram::BaseController
        include Deps[
          change_health: 'commands.characters_context.pathfinder2.change_health'
        ]
        include SerializeResource

        def create
          change_health.call({ character: character, value: params[:value] })
          return_response
        end

        private

        def return_response
          return render json: { result: :ok }, status: :ok if params[:only_head]
          return render_character(character.reload, {}, :ok) if params[:only].blank?

          render_character(character.reload, { only: params[:only].split(',').map(&:to_sym) }, :ok)
        end

        def render_character(result, fields, status)
          render json: serialize_resource(
            result,
            ::Pathfinder2::CharacterSerializer,
            :character,
            fields
          ), status: status
        end

        def character
          @character ||= current_user.characters.pathfinder2.find(params[:character_id])
        end
      end
    end
  end
end
