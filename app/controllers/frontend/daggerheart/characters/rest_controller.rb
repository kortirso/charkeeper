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
          case change_energy.call({ character: @character, value: params[:rest] })
          in { errors: errors } then unprocessable_response(errors)
          else only_head_response
          end
        end

        private

        def find_character
          @character = current_user.characters.daggerheart.find(params[:character_id])
        end
      end
    end
  end
end
