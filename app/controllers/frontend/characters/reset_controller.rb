# frozen_string_literal: true

module Frontend
  module Characters
    class ResetController < Frontend::BaseController
      include Deps[
        daggerheart_reset: 'commands.characters_context.daggerheart.reset'
      ]

      before_action :find_character
      before_action :find_command

      def create
        case @command.call({ character: @character })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      private

      def find_character
        @character = Character.find(params[:character_id])
      end

      def find_command
        @command =
          case @character.class.name
          when 'Daggerheart::Character' then daggerheart_reset
          end

        raise ActiveRecord::RecordNotFound if @command.nil?
      end
    end
  end
end
