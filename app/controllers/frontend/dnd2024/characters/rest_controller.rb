# frozen_string_literal: true

module Frontend
  module Dnd2024
    module Characters
      class RestController < Frontend::BaseController
        include Deps[
          make_short_rest: 'commands.characters_context.dnd2024.make_short_rest',
          make_long_rest: 'commands.characters_context.dnd2024.make_long_rest'
        ]

        before_action :find_character
        before_action :find_perform_command
        before_action :check_perform_command

        def create
          @perform_command.call(character: @character)
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dnd2024.find(params[:character_id])
        end

        def find_perform_command
          @perform_command =
            case params[:type]
            when 'short_rest' then make_short_rest
            when 'long_rest' then make_long_rest
            end
        end

        def check_perform_command
          render json: { errors: ['Invalid type'] }, status: :unprocessable_entity if @perform_command.nil?
        end
      end
    end
  end
end
