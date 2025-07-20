# frozen_string_literal: true

module Frontend
  module Dnd2024
    module Characters
      class RestController < Frontend::Dnd5::Characters::RestController
        include Deps[
          make_short_rest: 'commands.characters_context.dnd2024.make_short_rest',
          make_long_rest: 'commands.characters_context.dnd2024.make_long_rest'
        ]

        private

        def find_character
          @character = authorized_scope(Character.all).dnd2024.find(params[:character_id])
        end
      end
    end
  end
end
