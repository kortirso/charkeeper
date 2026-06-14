# frozen_string_literal: true

module Frontend
  module Cthulhu7
    module Characters
      class ItemsController < Frontend::BaseController
        include Deps[
          create_command: 'commands.characters_context.cthulhu7.items.create'
        ]
        include SerializeResource

        def load
          case create_command.call(create_params.merge({ character: character }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result } then serialize_resource(result, ::Characters::ItemSerializer, :item)
          end
        end

        private

        def character
          authorized_scope(Character.all).cthulhu7.find(params.expect(:character_id))
        end

        def create_params
          params.require(:item).permit!.to_h
        end
      end
    end
  end
end
