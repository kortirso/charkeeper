# frozen_string_literal: true

module Frontend
  module Cthulhu7
    module Characters
      class CopyController < Frontend::BaseController
        include Deps[
          copy_command: 'commands.characters_context.cthulhu7.copy'
        ]
        include SerializeResource

        def create
          case copy_command.call(character: character)
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(
              result,
              ::Cthulhu7::CharacterSerializer,
              :character,
              { only: Frontend::Cthulhu7::CharactersController::CREATE_SERIALIZE_FIELDS },
              :created
            )
          end
        end

        private

        def character
          authorized_scope(Character.all).cthulhu7.find(params.expect(:character_id))
        end
      end
    end
  end
end
