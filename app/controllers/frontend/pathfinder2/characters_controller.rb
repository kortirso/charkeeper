# frozen_string_literal: true

module Frontend
  module Pathfinder2
    class CharactersController < Frontend::BaseController
      include Deps[
        character_create: 'commands.characters_context.pathfinder2.create',
        character_update: 'commands.characters_context.pathfinder2.update',
        feature_requirement: 'feature_requirement'
      ]
      include SerializeResource

      CREATE_SERIALIZE_FIELDS = %i[id name level race subrace classes provider avatar].freeze

      def create
        case character_create.call(request_params.merge({ user: current_user }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result } then render_character(result, { only: CREATE_SERIALIZE_FIELDS }, :created)
        end
      end

      def update
        case character_update.call(request_params.merge({ character: character }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else render_character(character, {}, :ok)
        end
      end

      private

      def render_character(result, fields, status)
        serialize_resource(result, ::Pathfinder2::CharacterSerializer, :character, fields, status)
      end

      def character
        authorized_scope(Character.all).pathfinder2.find(params[:id])
      end

      def request_params
        unless feature_requirement.call(current: params[:version], initial: '0.3.23')
          return params.require(:character).permit!.to_h
        end

        params[:character] ? params.require(:character).permit!.to_h : params.permit!.to_h
      end
    end
  end
end
