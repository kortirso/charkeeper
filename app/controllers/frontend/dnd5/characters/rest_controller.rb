# frozen_string_literal: true

module Frontend
  module Dnd5
    module Characters
      class RestController < Frontend::BaseController
        include Deps[
          make_short_rest: 'commands.characters_context.dnd5.make_short_rest',
          make_long_rest: 'commands.characters_context.dnd5.make_long_rest'
        ]

        before_action :find_character
        before_action :find_perform_command
        before_action :check_perform_command

        def create
          case @perform_command.call(rest_options.merge({ character: @character }))
          in { errors: errors } then unprocessable_response(errors)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dnd5.find(params[:character_id])
        end

        def find_perform_command
          @perform_command =
            case params[:value]
            when 'short_rest' then make_short_rest
            when 'long_rest' then make_long_rest
            end
        end

        def check_perform_command
          render json: { errors: ['Invalid type'] }, status: :unprocessable_content if @perform_command.nil?
        end

        def rest_options
          params.permit!.to_h
        end
      end
    end
  end
end
