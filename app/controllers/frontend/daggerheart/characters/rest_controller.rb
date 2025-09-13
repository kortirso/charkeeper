# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Characters
      class RestController < Frontend::BaseController
        include Deps[
          change_energy: 'commands.characters_context.daggerheart.change_energy'
        ]

        before_action :find_character

        def create
          case change_energy.call(rest_options.merge({ character: @character }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).daggerheart.find(params[:character_id])
        end

        def rest_options
          params.permit!.to_h
        end
      end
    end
  end
end
