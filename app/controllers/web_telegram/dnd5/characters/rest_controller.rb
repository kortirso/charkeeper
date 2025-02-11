# frozen_string_literal: true

module WebTelegram
  module Dnd5
    module Characters
      class RestController < WebTelegram::BaseController
        include Deps[
          make_short_rest: 'commands.characters_context.dnd5.make_short_rest',
          make_long_rest: 'commands.characters_context.dnd5.make_long_rest'
        ]

        before_action :find_character
        before_action :find_perform_command
        before_action :check_perform_command

        def create
          @perform_command.call(character: @character)
          render json: { result: :ok }, status: :ok
        end

        private

        def find_character
          @character = current_user.characters.dnd5.find(params[:character_id])
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
